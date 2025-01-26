import { Component } from '@angular/core';
import { StockListComponent } from './shared/components/stock-list/stock-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StockListComponent],
  template: `
    <main class="app-container">
      <app-stock-list />
    </main>
  `,
  styles: [`
    .app-container {
      padding: 1rem;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {}