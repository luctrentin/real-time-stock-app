import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { StockCardComponent } from '../stock-card/stock-card.component.js';
import { StockService } from '../../../core/services/stock-websocket.service.js';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [StockCardComponent, NgFor, AsyncPipe],
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockListComponent {
  // Injeta o serviço de WebSocket (ou StockService) no qual temos stocks$
  private stockService = inject(StockService);

  // Expondo o observable do serviço para o template
  protected stocks$ = this.stockService.stocks$;

  /**
   * Recebe o symbol do (toggleEnabled) disparado pelo StockCard.
   * Decide o que fazer: chamar disableStock/enableStock/toggleStockLocal, etc.
   */
  onToggleStock(symbol: string): void {
    // Se o serviço tiver toggleStockLocal, chame:
    // this.stockService.toggleStockLocal(symbol);

    // Ou se quiser desabilitar no servidor:
    // this.stockService.disableStock(symbol);

    // Depende de como você resolveu lidar com toggle/habilitar/desabilitar.
    this.stockService.toggleStockLocal(symbol);
  }
}