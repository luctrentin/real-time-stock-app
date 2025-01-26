export interface YahooFinanceResponse {
  chart: {
    result: [{
      meta: {
        symbol: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        regularMarketTime: number;
      };
      timestamp: number[];
      indicators: {
        quote: [{
          high: number[];
          low: number[];
          open: number[];
          close: number[];
          volume: number[];
        }];
      };
    }];
    error: string | null;
  };
}
