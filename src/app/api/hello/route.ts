import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// Sample mock data for testing (unused for now)
// const mockPrices: Record<string,number> = {
//     TCS: 3500,
//     INFY: 1600,
//     HDFCBANK: 1700
// }


export async function GET(request: Request) {

    
    const {searchParams} = new URL(request.url)
    const symbol = `${searchParams.get("symbol")?.toUpperCase()}` || "TCS.NS"
    try {
        const quote = await yahooFinance.quote(symbol);
        const resObj = {
        symbol,
        cmp: quote.regularMarketPrice  || null,
        peRatio: quote.trailingPE  || null,
        earnings: quote.epsTrailingTwelveMonths || null,
    }
        console.log(resObj)
        return NextResponse.json(resObj)

    }catch(e){
        console.error("Error fetching data:",e)
         return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );

    }

    
}