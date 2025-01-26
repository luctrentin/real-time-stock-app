import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Stock } from '../../../features/stocks/models/stock.model.js';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';

@Component({
  selector: 'app-stock-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSlideToggleModule,
    DecimalPipe
  ],
  templateUrl: './stock-card.component.html',
  styleUrls: ['./stock-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'stock-card',
    '[class.enabled]': 'stock.isEnabled',
    '[class.disabled]': '!stock.isEnabled'
  }
})
export class StockCardComponent {
  @Input({ required: true }) stock!: Stock;
  @Output() toggleEnabled = new EventEmitter<string>();

  constructor(private breakpointObserver: BreakpointObserver) {
    const isSmall$ = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(map(result => result.matches));
  
    // Agora podemos subscrever ou armazenar em uma propriedade
    // por exemplo:
    isSmall$.subscribe((isSmallScreen) => {
      console.log('Is small?', isSmallScreen);
      // Atualiza uma flag ou signal
    });
  }

  getPercentChange(currentPrice: number, priceChange: number): number {
    const base = currentPrice - priceChange;
    return base ? (priceChange / base) * 100 : 0;
  }

  onToggle(): void {
    // Emite para o componente pai qual stock foi togglada
    this.toggleEnabled.emit(this.stock.symbol);
  }
}