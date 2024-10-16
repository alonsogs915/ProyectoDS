import axios from 'axios';

export default async function handler(req, res) {
  const { symbol } = req.query;

  console.log('Alpha Vantage API Key:', process.env.ALPHA_VANTAGE_API_KEY);
  console.log('News API Key:', process.env.NEWS_API_KEY);

  if (req.method === 'GET' && symbol) {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

      // Fetch earnings data (PER, ROE, etc.)
      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
      const overviewResponse = await axios.get(overviewUrl);
      const overviewData = overviewResponse.data;

      if (!overviewData || overviewData.Note || overviewData.Information) {
        const errorMsg = '¡Gracias por utilizar nuestra página! Nuestro límite de tasa API estándar es de 25 solicitudes por día, para tener solicitudes ilimitadas hay que pagar.';
        res.status(500).json({ error: errorMsg });
        return;
      }

      // Fetch daily stock price data
      const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
      const dailyResponse = await axios.get(dailyUrl);
      const dailyData = dailyResponse.data;

      if (!dailyData || dailyData.Note || dailyData.Information) {
        const errorMsg = '¡Gracias por utilizar nuestra página! Nuestro límite de tasa API estándar es de 25 solicitudes por día, para tener solicitudes ilimitadas hay que pagar.';
        res.status(500).json({ error: errorMsg });
        return;
      }

      const timeSeries = dailyData['Time Series (Daily)'];
      if (!timeSeries) {
        res.status(500).json({ error: 'Datos de la acción no disponibles.' });
        return;
      }

      const latestDate = Object.keys(timeSeries)[0];
      const currentPrice = timeSeries[latestDate]['4. close'];

      // Calcula la variación diaria
      const previousDate = Object.keys(timeSeries)[1];
      const previousClose = timeSeries[previousDate]['4. close'];
      const dailyChange = (currentPrice - previousClose).toFixed(2);
      const dailyChangePercentage = ((dailyChange / previousClose) * 100).toFixed(2);

      // Fetch news data (ejemplo usando NewsAPI)
      const newsUrl = `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${process.env.NEWS_API_KEY}`;
      const newsResponse = await axios.get(newsUrl);
      const newsData = newsResponse.data.articles.slice(0, 5);

      const stockData = {
        name: overviewData.Name,
        symbol: overviewData.Symbol,
        PER: overviewData.PERatio,
        ROI: overviewData.ReturnOnInvestmentTTM,
        ROE: overviewData.ReturnOnEquityTTM,
        ROA: overviewData.ReturnOnAssetsTTM,
        marketCap: overviewData.MarketCapitalization,
        dividendYield: overviewData.DividendYield,
        eps: overviewData.EPS,
        priceToBook: overviewData.PriceToBookRatio,
        weekHigh52: overviewData['52WeekHigh'],
        weekLow52: overviewData['52WeekLow'],
        beta: overviewData.Beta,
        dividendPayoutRatio: overviewData.DividendPayoutRatio,
        debtToEquityRatio: overviewData.DebtToEquityRatio,
        priceToSales: overviewData.PriceToSalesRatio,
        cashFlowPerShare: overviewData.CashFlowPerShare,
        currentPrice: currentPrice,
        dailyChange,
        dailyChangePercentage,
        news: newsData,
      };

      res.status(200).json(stockData);
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Error al obtener los datos de la acción.' });
    }
  } else if (req.method === 'GET' && !symbol) {
    // Endpoint para obtener tickers de mercado
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

      // URL para obtener tickers de Alpha Vantage
      const url = `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${apiKey}`;
      
      const response = await axios.get(url);
      const data = response.data;

      // Mapear los datos obtenidos
      const marketData = data.slice(0, 20).map((item) => ({
        ticker: item.symbol,
        last: item.price,
        change: item.change,
        volume: item.volume,
        signal: item.signal, // Asumimos que hay algún indicador de señal
      }));

      res.status(200).json(marketData);
    } catch (error) {
      console.error('Error fetching market data:', error.message);
      res.status(500).json({ error: 'Error al obtener datos de mercado.' });
    }
  } else {
    // Si no es un método GET, devolver error 405
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
