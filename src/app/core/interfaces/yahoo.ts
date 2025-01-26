export interface YahooFinanceResponse {
  chart: {
    result: [{
      meta: {
        regularMarketPrice: number;
        chartPreviousClose: number;
        symbol: string;
        previousClose: number;
      };
      indicators: {
        quote: [{
          high: number[];
          low: number[];
          close: number[];
        }];
      };
    }];
  };
}