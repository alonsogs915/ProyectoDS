import { useState, useEffect } from 'react';
import { getDictionary } from './dictionaries';
import Chatbot from './chatbot';

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('inicio');
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [dictionary, setDictionary] = useState({});
  const [userName, setUserName] = useState('');
  const [language, setLanguage] = useState('es'); // 'es' para español, 'en' para inglés

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(language);
      setDictionary(dict);
    };
    loadDictionary();
  }, [language]);

  function handleAddComment(event) {
    event.preventDefault();
    setComments([...comments, newComment]);
    setNewComment(""); // Limpia el campo después de agregar el comentario
  }

  // Lista de tickers variados
  const tickers = ['', ''];

  const fetchStockMetrics = async (e) => {
    e.preventDefault();
    setError('');
    setStockData(null);

    if (!symbol) {
      setError('Por favor, ingresa un símbolo.');
      return;
    }

    try {
      const response = await fetch(`/api/stock?symbol=${symbol}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setStockData(data);
      }
    } catch (error) {
      setError(dictionary.dataError);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchStockMetrics(e);
    }
  };

  const showSection = (section) => {
    setActiveSection(section);
  };

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedLanguage = localStorage.getItem('language');
    if (savedName) setUserName(savedName);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  const savePreferences = () => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('language', language);
    alert(dictionary.savedPreferences);
  };

 // Llamada a la API para obtener los tickers variados
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError('');
      let allData = [];
      // Iteramos sobre los tickers para hacer una solicitud para cada uno
      try {
        for (let i = 0; i < tickers.length; i++) {
          const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${tickers[i]}&interval=5min&apikey= QR08W8WREXX9BA0P`);
          const data = await response.json();

          if (!data['Error Message'] && data['Time Series (5min)']) {
            const latestData = Object.entries(data['Time Series (5min)'])[0];
            const [date, values] = latestData;

            allData.push({
              ticker: tickers[i],
              last: parseFloat(values['4. close']),
              change: (parseFloat(values['4. close']) - parseFloat(values['1. open'])).toFixed(2),
              volume: values['5. volume'],
            });
          }
        }

        setMarketData(allData);
      } catch (error) {
        setError(dictionary.apiError);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRXXjlJqrxOqOP4xlXW5A2hl521M4-ljUDEY_mt4emW_CWZ9EfB" alt="Logo" className="h-8 mr-2" />
            <h1 className="text-white text-2xl font-bold">Financial Analyst</h1>
          </div>
        </div>

        <nav className="mt-4">
          <ul className="flex flex-wrap sm:flex-nowrap flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 bg-gray-700 p-2 rounded">
            {dictionary.nav ? (
              <>
                <li>
                  <a 
                    href="#" 
                    onClick={() => showSection('inicio')} 
                    className="text-white hover:underline block sm:inline"
                  >
                    {dictionary.nav.home}
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={() => showSection('Buscador de Acciones')} 
                    className="text-white hover:underline block sm:inline"
                  >
                    {dictionary.nav.stockFinder}
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={() => showSection('contacto')} 
                    className="text-white hover:underline block sm:inline"
                  >
                    {dictionary.nav.contactUs}
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={() => showSection('educación')} 
                    className="text-white hover:underline block sm:inline"
                  >
                    {dictionary.nav.education}
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={() => showSection('comunidad')} 
                    className="text-white hover:underline block sm:inline"
                  >
                    {dictionary.nav.community}
                  </a>
                </li>
              </>
            ) : (
              <li>Loading...</li> 
            )}
          </ul>
        </nav>

      </header>

      {activeSection === 'inicio' && (
        <>
          <div className="mt-6">
            <h3 className="text-2xl font-bold">{(dictionary.userConfigurations)}</h3>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4">
              <label className="block mb-2">
              {(dictionary.name)}
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="border px-2 py-1 mt-1 ml-2 rounded text-black" 
                />
              </label>
              <label className="block mb-4">
              {(dictionary.language)}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border px-2 py-1 mt-1 ml-4 rounded text-black"
                >
                  <option value="es"> {(dictionary.spanish)}</option>
                  <option value="en">{(dictionary.english)}</option>
                </select>
              </label>
              <button
                onClick={savePreferences}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {(dictionary.savedPreferences)}
              </button>
            </form>
          </div>

          <div className="mt-6">
          <h2 className="text-3xl font-bold">{dictionary.welcome ? dictionary.welcome(userName) : ''}</h2>
            <p className='mt-4'> {dictionary.welcometext}</p>

            <p className="mt-2"> {dictionary.welcometext2}</p>
          <ul className="list-disc ml-6 mt-2 text-white">
            <li><strong>AAPL</strong> {dictionary.ExampleApple}</li>
            <li><strong>GOOGL</strong> {dictionary.ExampleGoogle} .</li>
            <li><strong>AMZN</strong> {dictionary.ExampleAmazon} </li>
            <li><strong>TSLA</strong> {dictionary.ExampleTesla} </li>
          </ul>
          <p className="mt-4"> {dictionary.welcometext3}</p>

          <p className="mt-4"> {dictionary.welcometext4} </p>

          </div>
          <div className="mt-6">
          <h3 className="text-2xl font-bold">{dictionary.MarcketStockList}</h3>
          <p> {dictionary.welcometext5}</p>

          {loading ? (
            <p> {dictionary.loading}</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 text-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left"> {dictionary.ticker}</th>
                    <th className="py-2 px-4 text-left"> {dictionary.last}</th>
                    <th className="py-2 px-4 text-left"> {dictionary.change}</th>
                    <th className="py-2 px-4 text-left"> {dictionary.volume}</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((stock, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="py-2 px-4">{stock.ticker}</td>
                      <td className="py-2 px-4">${stock.last.toFixed(2)}</td>
                      <td className={`py-2 px-4 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? `+${stock.change}` : stock.change}
                      </td>
                      <td className="py-2 px-4">{stock.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
      )}

      {/* Sección Buscador de Acciones, otras secciones... */}
      {activeSection === 'Buscador de Acciones' && (
        <div>
          {/* Formulario de búsqueda */}
          <form className="mb-4 mt-6 flex" onSubmit={fetchStockMetrics}>
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder= {dictionary.searchsymbol}
                className="p-2 pl-10 text-sm rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-gray-600 w-full"
                onChange={(e) => setSymbol(e.target.value)}
                onKeyDown={handleKeyPress} // Llamar la función cuando se presione "Enter"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="absolute top-2 left-2 h-6 w-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16l-2-2m0 0l-2-2m2 2l2-2m6 8a9 9 0 100-18 9 9 0 000 18z"
                />
              </svg>
            </div>

            <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded">
            {dictionary.search}
            </button>
          </form>

          {error && <p className="text-red-500">{error}</p>}

          {stockData && (
            <div className="flex justify-between mb-4">
              <div className="text-4xl font-bold">
                ${stockData.currentPrice}
                <span className={`text-${stockData.dailyChange >= 0 ? 'green' : 'red'}-500 ml-2`}>
                  {stockData.dailyChange >= 0 ? `+${stockData.dailyChange} (${stockData.dailyChangePercentage}%)` : `${stockData.dailyChange} (${stockData.dailyChangePercentage}%)`}
                </span>
              </div>
            </div>
          )}

          {stockData && (
            <div className="bg-gray-800 p-4 rounded shadow mb-4">
              <h2 className="text-xl font-bold mb-3">{stockData.name} ({stockData.symbol})</h2>
              <p className="mb-1 bg-gray-700">PER: {stockData.PER || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-600">Beta: {stockData.beta || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-700"> {dictionary.dividendYield} {stockData.dividendYield || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-600"> {dictionary.stock.dividendPayoutRatio} {stockData.dividendPayoutRatio || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-700"> {dictionary.stock.debtToEquityRatio} {stockData.debtToEquityRatio || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-600"> {dictionary.stock.priceToSales}  {stockData.priceToSales || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-700"> {dictionary.stock.cashFlowPerShare}  {stockData.cashFlowPerShare || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-600">ROI: {stockData.ROI || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-700">ROE: {stockData.ROE || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-600">ROA: {stockData.ROA || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-700"> {dictionary.stock.marketCap} {stockData.marketCap || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-600">EPS: {stockData.eps || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-700"> {dictionary.stock.priceToBook}  {stockData.priceToBook || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-600"> {dictionary.stock.weekHigh52} {stockData.weekHigh52 || dictionary.stock.notAvailable}</p>
              <p className="mb-1 bg-gray-700"> {dictionary.stock.weekLow52}  {stockData.weekLow52 || dictionary.stock.notAvailable}</p>
            </div>
          )}

          {stockData && stockData.news && (
            <div className="bg-gray-800 p-4 rounded shadow">
              <h2 className="text-xl font-bold mb-2"> {dictionary.LatestNews} </h2>
              {stockData.news.map((article, index) => (
                <div key={index} className="mb-2 bg-gray-700">
                  <h3 className="font-bold">{article.title}</h3>
                  <p>{article.description}</p>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500"> {dictionary.ShowMore}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Sección Contacto */}
      {activeSection === 'contacto' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold">{dictionary.contact.title}</h2>
          <p>{dictionary.contact.description}</p>
          <p className="mt-4">{dictionary.contact.name}: Benjamín Fernández</p>
          <p>{dictionary.contact.email}: 
            <a href="mailto:benfernandez@alumnos.uai.cl" className="text-blue-500 underline">benfernandez@alumnos.uai.cl</a>
          </p>

          <p className="mt-4">{dictionary.contact.name}: Alonso Gil</p>
          <p>{dictionary.contact.email}: 
            <a href="mailto:algil@alumnos.uai.cl" className="text-blue-500 underline">algil@alumnos.uai.cl</a>
          </p>

          <p className="mt-4">{dictionary.contact.name}: Fabián Villalobos</p>
          <p>{dictionary.contact.email}: 
            <a href="mailto:favillalobos@alumnos.uai.cl" className="text-blue-500 underline">favillalobos@alumnos.uai.cl</a>
          </p>
        </div>
      )}  
      
      {/* Sección Educación */}
      {activeSection === 'educación' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold">{dictionary.education.title}</h2>
          <p>{dictionary.education.description}</p>
          <ul className="list-disc pl-4 mt-4">
            <li><strong>PER (Price to Earnings Ratio):</strong> {dictionary.education.terms.per}</li>
            <li><strong>ROI (Return on Investment):</strong> {dictionary.education.terms.roi}</li>
            <li><strong>ROA (Return on Assets):</strong> {dictionary.education.terms.roa}</li>
            <li><strong>ROE (Return on Equity):</strong> {dictionary.education.terms.roe}</li>
            <li><strong>Market Cap:</strong> {dictionary.education.terms.marketCap}</li>
            <li><strong>Dividend Yield:</strong> {dictionary.education.terms.dividendYield}</li>
            <li><strong>EPS (Earnings Per Share):</strong> {dictionary.education.terms.eps}</li>
            <li><strong>Price to Book (P/B Ratio):</strong> {dictionary.education.terms.pbRatio}</li>
            <li><strong>Beta:</strong> {dictionary.education.terms.beta}</li>
          </ul>

          {/* Sección de Videos Educacionales */}
          <h3 className="text-xl font-semibold mt-8">{dictionary.education.videos}</h3>
          <p>{dictionary.education.videosDescription}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {/* Video 1 */}
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/cd0_5Y1O-wU"
                title="DOLLAR COST AVERAGING (Qué es y cómo funciona esta estrategia de inversión)"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {/* Video 2 */}
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/odPxByt8e84"
                title="¿Qué es el Análisis Fundamental? Introducción al Análisis Fundamental de acciones"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {/* Video 3 */}
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/UPvQVJVwVBg"
                title="Ratios de Rentabilidad: ROE y ROA | ​Explicación, Interpretación y Análisis"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Sección de Libros Recomendados */}
          <h3 className="text-xl font-semibold mt-8">{dictionary.education.books}</h3>
          <ul className="list-disc pl-4 mt-4">
            <li>
              <strong>{dictionary.education.bookDescriptions.intelligentInvestor}</strong>
              <a href="https://www.amazon.com/dp/0060555661" target="_blank" rel="noopener noreferrer" className="text-blue-500"> ({dictionary.education.seeOnAmazon})</a>
            </li>
            <li>
              <strong>{dictionary.education.bookDescriptions.randomWalk}</strong>
              <a href="https://www.amazon.com/dp/0393352242" target="_blank" rel="noopener noreferrer" className="text-blue-500"> ({dictionary.education.seeOnAmazon})</a>
            </li>
            <li>
              <strong>{dictionary.education.bookDescriptions.millionaireMind}</strong>
              <a href="https://www.amazon.com/dp/1682990483" target="_blank" rel="noopener noreferrer" className="text-blue-500"> ({dictionary.education.seeOnAmazon})</a>
            </li>
            <li>
              <strong>{dictionary.education.bookDescriptions.yourMoney}</strong>
              <a href="https://www.amazon.com/dp/0143115766" target="_blank" rel="noopener noreferrer" className="text-blue-500"> ({dictionary.education.seeOnAmazon})</a>
            </li>
            <li>
              <strong>{dictionary.education.bookDescriptions.buffettology}</strong>
              <a href="https://www.amazon.com/-/es/Mary-Buffett/dp/8480885505" target="_blank" rel="noopener noreferrer" className="text-blue-500"> ({dictionary.education.seeOnAmazon})</a>
            </li>
            <li>
              <strong>{dictionary.education.bookDescriptions.tradingInTheZone}</strong>
              <a href="https://www.amazon.com/-/es/Trading-en-zona-Mark-Douglas/dp/8493622664" target="_blank" rel="noopener noreferrer" className="text-blue-500"> ({dictionary.education.seeOnAmazon})</a>
            </li>
          </ul>
        </div>
      )}

      {/* Sección Comunidad */}
      {activeSection === 'comunidad' && (
        <div className="mt-8 bg-gray-800 p-6 rounded-md shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6">{dictionary.community}</h2>
          <p className="text-gray-300 mb-4">{dictionary.CommunityText}</p>

          {/* Formulario de Comentarios */}
          <form onSubmit={handleAddComment} className="space-y-4">
            <textarea
              className="w-full p-4 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={dictionary.Comment}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {dictionary.AddComment}
            </button>
          </form>

          {/* Lista de Comentarios */}
          <div className="space-y-4 mt-6">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="p-4 border border-gray-700 bg-gray-900 rounded-lg shadow-sm"
              >
                <p className="text-gray-300">{comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Chatbot />

    </div>
  );
}
