# 📈 Stock Portfolio Dashboard

A modern, real-time portfolio management dashboard built with Next.js, TypeScript, and Tailwind CSS. Track your investments with live stock data, beautiful visualizations, and Excel/CSV upload functionality.

![Portfolio Dashboard](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 **Live Demo**
**[📊 View Live Dashboard](https://stoccckkkportfolio-28lkq6l8r-vishals-projects-97a69eab.vercel.app)**

*Experience the portfolio dashboard with real-time stock data and upload functionality!*

## ✨ Features

### 📊 **Real-time Stock Data**
- Live stock prices via Yahoo Finance API
- Automatic data refresh every 15 seconds
- P/E ratios and earnings data
- Current market price (CMP) tracking

### 📁 **Excel/CSV Upload**
- Upload portfolio data from Excel (.xlsx, .xls) or CSV files
- Intelligent column mapping (supports various header names)
- Drag & drop interface with visual feedback
- Sample file generation with complete portfolio data
- **LocalStorage persistence** - uploaded data persists across sessions

### 📈 **Portfolio Analytics**
- Sector-wise portfolio breakdown
- Gain/Loss calculations with color-coded indicators
- Total investment value tracking
- Performance metrics per stock

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Beautiful data visualizations using Recharts
- Real-time loading indicators
- Professional color schemes and animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vishalnarayan2809/stock_portfolio_dashboard.git
   cd stock_portfolio_dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💾 Upload Functionality

### Supported File Formats
- **Excel**: `.xlsx`, `.xls`
- **CSV**: `.csv`

### Expected Columns
The upload feature accepts flexible column names:

| Required Data | Accepted Column Names |
|---------------|----------------------|
| Symbol | `symbol`, `ticker`, `code` |
| Name | `name`, `company`, `stock_name` |
| Purchase Price | `purchasePrice`, `price`, `buy_price`, `buyprice` |
| Quantity | `quantity`, `qty`, `shares` |
| Exchange | `exchange`, `market` |
| Sector | `sector`, `industry` |

### How to Use
1. Click the upload area or drag & drop your file
2. Download the sample file to see the exact format
3. Your data automatically saves to localStorage
4. Data persists across browser sessions
5. Use "Clear stored" to return to default portfolio

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── portfolio/     # Yahoo Finance API integration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main dashboard page
├── components/
│   ├── PortfolioTable.jsx # Main portfolio table
│   ├── SectorPie.tsx     # Sector breakdown chart
│   └── UploadPortfolio.tsx # Upload functionality
└── data/
    └── portfolio.ts       # Default portfolio data
```

## �️ Tech Stack

- **Framework**: Next.js 15.5.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Data Fetching**: Yahoo Finance API
- **Charts**: Recharts
- **File Processing**: SheetJS (xlsx)
- **Icons**: Lucide React
- **UI Components**: Custom components with Hero UI

## � API Endpoints

### `/api/portfolio`
Fetches real-time stock data from Yahoo Finance.

**Parameters:**
- `symbols`: Comma-separated list of stock symbols (e.g., `TCS.NS,INFY.NS`)

**Response:**
```json
{
  "results": {
    "TCS.NS": {
      "cmp": 3245.60,
      "peRatio": 28.5,
      "earnings": 113.85,
      "cached": false
    }
  }
}
```

## � Configuration

### Environment Variables
No environment variables required - the app works out of the box!

### Customization
- Edit `src/data/portfolio.ts` to change default portfolio
- Modify `src/app/globals.css` for custom styling
- Update API refresh interval in `src/app/page.tsx`

## 🎯 Sample Data

The app includes a comprehensive sample dataset with 15 Indian stocks across various sectors:
- Technology (TCS, Infosys, Wipro)
- Financials (HDFC Bank, SBI, Axis Bank)
- Energy, Healthcare, Automotive, and more

## ⚖️ Design Choices & Trade-offs

- **Yahoo vs Google**: Assignment suggested Google for P/E & earnings. We consolidated on Yahoo (CMP, trailingPE, EPS) because:
  - Yahoo provides all 3 in one API.
  - Google Finance has no official API, often blocked/scraped.
  - For production, we'd use a paid, reliable data provider (e.g., Polygon.io).
- **In-memory cache**: Simple, fast, but not distributed. For scaling, replace with Redis.  
- **Rate limiting**:  
  - Cache TTL = 60s (reduces API hits).  
  - Batch requests (20 symbols) + concurrency limit (3) balance speed and safety.  
  - This avoids hitting Yahoo's undocumented rate limits.

## 🚀 Deployment

### ✅ **Currently Deployed**
This project is currently live on Vercel at:  
**[https://stoccckkkportfolio-28lkq6l8r-vishals-projects-97a69eab.vercel.app](https://stoccckkkportfolio-28lkq6l8r-vishals-projects-97a69eab.vercel.app)**

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Other Platforms
The app is a standard Next.js application and can be deployed to:
- Netlify (with Next.js adapter)
- AWS
- Google Cloud
- Any Node.js hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Limitations

- Uses unofficial Yahoo Finance API — subject to breakage and rate limits.  
- In-memory cache means data resets on server restart.  
- Real-time defined as 15s polling — not streaming. For true real-time, use a provider with WebSockets.

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Yahoo Finance for providing stock data API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- SheetJS for Excel/CSV processing capabilities

---

**Built with ❤️ by [Vishal Narayan](https://github.com/vishalnarayan2809)**
