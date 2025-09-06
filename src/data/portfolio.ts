export interface Stock {
  name: string;
  symbol: string;      
  purchasePrice: number;
  quantity: number;
  exchange: string;
  sector: string;
}

export interface Stock {
  name: string;
  symbol: string;      
  purchasePrice: number;
  quantity: number;
  exchange: string;
  sector: string;
}

export const portfolio: Stock[] = [
  {
    name: "Tata Consultancy Services",
    symbol: "TCS.NS",
    purchasePrice: 3200,
    quantity: 10,
    exchange: "NSE",
    sector: "Technology",
  },
  {
    name: "Infosys",
    symbol: "INFY.NS",
    purchasePrice: 1500,
    quantity: 20,
    exchange: "NSE",
    sector: "Technology",
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK.NS",
    purchasePrice: 1600,
    quantity: 15,
    exchange: "NSE",
    sector: "Financials",
  },
  {
    name: "Reliance Industries",
    symbol: "RELIANCE.NS",
    purchasePrice: 2450,
    quantity: 25,
    exchange: "NSE",
    sector: "Energy",
  },
  {
    name: "Bharti Airtel",
    symbol: "BHARTIARTL.NS",
    purchasePrice: 850,
    quantity: 30,
    exchange: "NSE",
    sector: "Telecommunications",
  },
  {
    name: "ITC Limited",
    symbol: "ITC.NS",
    purchasePrice: 420,
    quantity: 50,
    exchange: "NSE",
    sector: "Consumer Goods",
  },
  {
    name: "Larsen & Toubro",
    symbol: "LT.NS",
    purchasePrice: 2100,
    quantity: 12,
    exchange: "NSE",
    sector: "Industrials",
  },
  {
    name: "Asian Paints",
    symbol: "ASIANPAINT.NS",
    purchasePrice: 3150,
    quantity: 8,
    exchange: "NSE",
    sector: "Materials",
  },
  {
    name: "Sun Pharmaceutical",
    symbol: "SUNPHARMA.NS",
    purchasePrice: 980,
    quantity: 22,
    exchange: "NSE",
    sector: "Healthcare",
  },
  {
    name: "Maruti Suzuki",
    symbol: "MARUTI.NS",
    purchasePrice: 8900,
    quantity: 5,
    exchange: "NSE",
    sector: "Automotive",
  },
  {
    name: "State Bank of India",
    symbol: "SBIN.NS",
    purchasePrice: 550,
    quantity: 35,
    exchange: "NSE",
    sector: "Financials",
  },
  {
    name: "Coal India",
    symbol: "COALINDIA.NS",
    purchasePrice: 185,
    quantity: 100,
    exchange: "NSE",
    sector: "Materials",
  },
  {
    name: "Wipro",
    symbol: "WIPRO.NS",
    purchasePrice: 480,
    quantity: 40,
    exchange: "NSE",
    sector: "Technology",
  },
  {
    name: "Axis Bank",
    symbol: "AXISBANK.NS",
    purchasePrice: 780,
    quantity: 18,
    exchange: "NSE",
    sector: "Financials",
  },
  {
    name: "Titan Company",
    symbol: "TITAN.NS",
    purchasePrice: 2650,
    quantity: 7,
    exchange: "NSE",
    sector: "Consumer Discretionary",
  },
];