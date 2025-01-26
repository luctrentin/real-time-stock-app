export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  isEnabled: boolean;
  dailyHigh: number;
  dailyLow: number;
  yearlyHigh: number;
  yearlyLow: number;
}
