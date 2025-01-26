export const STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'] as const;
export type StockSymbol = typeof STOCKS[number];
