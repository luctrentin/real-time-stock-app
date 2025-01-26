import { signal, computed } from "@angular/core";
import { Stock } from "../models/stock.model";

export class StockState {
  private stocksSignal = signal<Stock[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly stocks = computed(() => this.stocksSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
}