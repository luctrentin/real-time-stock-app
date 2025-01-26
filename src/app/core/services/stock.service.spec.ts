import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { StockService } from './stock.service';

describe('StockService', () => {
  let service: StockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StockService]
    });
    service = TestBed.inject(StockService);
  });

  it('should update stock prices in real-time', fakeAsync(() => {
    const initial = service.stocksSignal()[0].currentPrice;
    tick(1000);
    const updated = service.stocksSignal()[0].currentPrice;
    expect(updated).not.toBe(initial);
  }));
});
