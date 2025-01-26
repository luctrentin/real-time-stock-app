// Angular Core
import { Injectable, signal, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

// Model
import { Stock } from '../../features/stocks/models/stock.model.js';

// Constants
import { StockSymbol } from '../../shared/constants/api.constants.js';

// Socket.IO Client
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class StockService implements OnDestroy {
  // Ajuste para a URL onde seu server Socket.IO está rodando
  private readonly SERVER_URL = 'http://localhost:3000';
  
  // Referência ao socket do cliente
  private socket!: Socket;

  // Usamos Signals (Angular 16+) para armazenar o array de ações
  private stocksSignal = signal<Stock[]>([]);
  public stocks$ = toObservable(this.stocksSignal);

  // Mapeia símbolos a nomes, se desejar exibir no front
  private readonly COMPANY_NAMES: Record<StockSymbol, string> = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'TSLA': 'Tesla, Inc.'
  };

  constructor() {
    // 1. Conecta ao servidor Socket.IO
    this.socket = io(this.SERVER_URL);

    // 2. Quando o servidor emitir 'stockData', atualizamos o estado local
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.socket.on('stockData', (dataFromServer: any[]) => {
      // dataFromServer pode ser algo como:
      // [
      //   { symbol: 'AAPL', data: { symbol: 'AAPL', currentPrice: ..., dailyHigh: ..., etc. }},
      //   { symbol: 'GOOGL', data: { ... }},
      //   ...
      // ]
      
      // Mapeamos cada item do array para o tipo Stock do front
      const mappedStocks: Stock[] = dataFromServer.map(item => {
        const d = item.data; // Conteúdo transformado no servidor

        return {
          symbol: d.symbol,
          name: this.mapSymbolToName(d.symbol),
          currentPrice: d.currentPrice,
          priceChange: d.currentPrice - (d.chartPreviousClose ?? 0),
          dailyHigh: d.dailyHigh,
          dailyLow: d.dailyLow,
          yearlyHigh: 0, // Se quiser algo real, implemente ou faça o server enviar
          yearlyLow: 0,
          isEnabled: true
        };
      });

      // Atualizamos nosso signal com o novo array de stocks
      this.stocksSignal.set(mappedStocks);
    });

    // Se quiser capturar erros de conexão
    this.socket.on('connect_error', (err) => {
      console.error('Socket connect_error:', err);
    });
  }

  /**
   * Emite para o servidor que queremos desabilitar a stock X
   * (conforme implementado no server.ts => "disableStock")
   */
  disableStock(symbol: string) {
    this.socket.emit('disableStock', symbol);
  }

  /**
   * Emite para o servidor que queremos habilitar a stock X
   */
  enableStock(symbol: string) {
    this.socket.emit('enableStock', symbol);
  }

  /**
   * Se preferir fazer o toggle apenas local (sem avisar o servidor),
   * use este método. Caso contrário, use disableStock/enableStock.
   */
  toggleStockLocal(symbol: string): void {
    this.stocksSignal.update(stocks =>
      stocks.map(stock =>
        stock.symbol === symbol
          ? { ...stock, isEnabled: !stock.isEnabled }
          : stock
      )
    );
  }

  /**
   * Mapeia símbolo -> nome amigável, para exibir na UI
   */
  private mapSymbolToName(symbol: string): string {
    switch (symbol) {
      case 'AAPL': return 'Apple Inc.';
      case 'GOOGL': return 'Alphabet Inc.';
      case 'MSFT': return 'Microsoft Corporation';
      case 'TSLA': return 'Tesla, Inc.';
      default: return symbol;
    }
  }

  /**
   * Se quiser limpar o socket na destruição do serviço
   */
  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}