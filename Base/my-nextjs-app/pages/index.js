import { useState, useEffect } from 'react';

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('inicio');
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lista de tickers variados
  const tickers = ['', ''];

  const fetchStockMetrics = async (e) => {
    e.preventDefault(); // Evitar el comportamiento por defecto del formulario
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
      setError('Error al obtener los datos.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchStockMetrics(e); // Ejecutar la búsqueda cuando se presiona "Enter"
    }
  };

  const showSection = (section) => {
    setActiveSection(section); // Cambiar la sección activa
  };

  // Llamada a la API para obtener los tickers variados
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError('');
      let allData = [];

      try {
        // Iteramos sobre los tickers para hacer una solicitud para cada uno
        for (let i = 0; i < tickers.length; i++) {
          const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${tickers[i]}&interval=5min&apikey= QR08W8WREXX9BA0P`);
          const data = await response.json();

          if (!data['Error Message'] && data['Time Series (5min)']) {
            const latestData = Object.entries(data['Time Series (5min)'])[0]; // Tomamos el último dato disponible
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
        setError('Error al conectar con la API.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []); // Ejecutar solo una vez al montar el componente

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

        {/* Barra de navegación */}
        <nav className="mt-4">
          <ul className="flex space-x-4 bg-gray-700 p-2 rounded">
            <li><a href="#" onClick={() => showSection('inicio')} className="text-white hover:underline">Inicio</a></li>
            <li><a href="#" onClick={() => showSection('Buscador de Acciones')} className="text-white hover:underline">Buscador de Acciones</a></li>
            <li><a href="#" onClick={() => showSection('noticias')} className="text-white hover:underline">Noticias</a></li>
            <li><a href="#" onClick={() => showSection('contacto')} className="text-white hover:underline">Contacto</a></li>
            <li><a href="#" onClick={() => showSection('educación')} className="text-white hover:underline">Educación</a></li>
          </ul>
        </nav>
      </header>

      {/* Sección Inicio */}
      {activeSection === 'inicio' && (
        <>

        <div className="mt-6">
          <h2 className="text-2xl font-bold">Bienvenido a Financial Analyst</h2>
          <p>Aquí puedes buscar información sobre acciones, ver sus métricas más importantes y aprender como invertir.</p>
          <p>Para empezar, utiliza nuestro <strong>Buscador de Acciones</strong> y escribe el símbolo (ticker) de la acción que te interese. Por ejemplo:</p>
          <ul className="list-disc ml-6 mt-2 text-white">
            <li><strong>AAPL</strong> para Apple Inc.</li>
            <li><strong>GOOGL</strong> para Alphabet (Google).</li>
            <li><strong>AMZN</strong> para Amazon.</li>
            <li><strong>TSLA</strong> para Tesla.</li>
          </ul>
          <p className="mt-4">Luego, te mostraremos las métricas financieras clave de esa acción, incluyendo su precio actual, variaciones diarias, rendimiento de dividendos, entre otros. Además, podrás ver las últimas noticias relacionadas con la empresa.</p>

          <p className="mt-4"> Si quieres aprender mas acerca del tema, ve a la sección <strong> Educación</strong> en donde encontraras explicaciones y videos. </p>
        </div>


        <div className="mt-6">
          <h3 className="text-2xl font-bold">Lista de acciones del Mercado</h3>
          <p>Visualiza algunas de las acciones más recientes en el mercado:</p>

          {loading ? (
            <p>Cargando datos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 text-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left">Ticker</th>
                    <th className="py-2 px-4 text-left">Último</th>
                    <th className="py-2 px-4 text-left">Cambio</th>
                    <th className="py-2 px-4 text-left">Volumen</th>
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

      {/* Sección Mercados */}
      {activeSection === 'Buscador de Acciones' && (
        <div>
          {/* Formulario de búsqueda */}
          <form className="mb-4 mt-6 flex" onSubmit={fetchStockMetrics}>
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar símbolo"
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
              Buscar
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
              <p className="mb-1 bg-gray-700">PER: {stockData.PER || 'No disponible'}</p>
              <p className="mb-1 bg-gray-600">Beta: {stockData.beta || 'No disponible'}</p>
              <p className="mb-1 bg-gray-700">Rendimiento de dividendos: {stockData.dividendYield || 'No disponible'}</p>
              <p className="mb-1 bg-gray-600">Relación de pago de dividendos: {stockData.dividendPayoutRatio || 'No disponible'}</p>
              <p className="mb-1 bg-gray-700">Relación Deuda/Capital: {stockData.debtToEquityRatio || 'No disponible' }</p>
              <p className="mb-1 bg-gray-600">Relación Precio/Ventas: {stockData.priceToSales || 'No disponible'}</p>
              <p className="mb-1 bg-gray-700">Flujo de efectivo por acción: {stockData.cashFlowPerShare || 'No disponible'}</p>
              <p className="mb-1 bg-gray-600">ROI: {stockData.ROI || 'No disponible'}</p>
              <p className="mb-1 bg-gray-700">ROE: {stockData.ROE || 'No disponible'}</p>
              <p className="mb-1 bg-gray-600">ROA: {stockData.ROA || 'No disponible'}</p>
              <p className="mb-1 bg-gray-700">Capitalización de mercado: {stockData.marketCap || 'No disponible'}</p>
              <p className="mb-1 bg-gray-600">EPS: {stockData.eps || 'No disponible'}</p>
              <p className="mb-1 bg-gray-700">Relación Precio/Valor Contable: {stockData.priceToBook || 'No disponible'}</p>
              <p className="mb-1 bg-gray-600">Máximo 52 semanas: {stockData.weekHigh52 || 'No disponible'}</p>
              <p className="mb-1 bg-gray-700">Mínimo 52 semanas: {stockData.weekLow52 || 'No disponible'}</p>
            </div>
          )}

          {stockData && stockData.news && (
            <div className="bg-gray-800 p-4 rounded shadow">
              <h2 className="text-xl font-bold mb-2">Últimas Noticias</h2>
              {stockData.news.map((article, index) => (
                <div key={index} className="mb-2 bg-gray-700">
                  <h3 className="font-bold">{article.title}</h3>
                  <p>{article.description}</p>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">Leer más</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sección Noticias */}
      {activeSection === 'noticias' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold">Últimas Noticias</h2>
          <p>Aquí puedes ver las noticias recientes relacionadas con los mercados financieros.</p>
        </div>
      )}

      {/* Sección Contacto */}
      {activeSection === 'contacto' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold">Contacto</h2>
          <p>Puedes ponerte en contacto con nosotros para más información o preguntas sobre nuestra plataforma.</p>
          <p className="mt-4">
            Nombre: Benjamín Fernández
          </p>
          <p>
            Correo electrónico: <a href="mailto:benfernandez@alumnos.uai.cl" className="text-blue-500 underline">benfernandez@alumnos.uai.cl</a>
          </p>

          <p className="mt-4">
            Nombre: Alonso Gil
          </p>
          <p>
            Correo electrónico: <a href="mailto:algil@alumnos.uai.cl" className="text-blue-500 underline">algil@alumnos.uai.cl</a>
          </p>

          <p className="mt-4">
            Nombre: Fabián Villalobos 
          </p>
          <p>
            Correo electrónico: <a href="mailto:favillalobos@alumnos.uai.cll" className="text-blue-500 underline">favillalobos@alumnos.uai.cl</a>
          </p>

        </div>
      )}
      {/* Sección Educación */}
      {activeSection === 'educación' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold">Educación</h2>
          <p>Aquí puedes ver material educativo para comprender la información.</p>
          <ul className="list-disc pl-4 mt-4">
            <li><strong>PER (Price to Earnings Ratio):</strong> Mide cuántas veces los inversores están dispuestos a pagar por cada unidad de ganancia generada por la empresa.</li>
            <li><strong>ROI (Return on Investment):</strong> Evalúa la rentabilidad de una inversión.</li>
            <li><strong>ROA (Return on Assets):</strong> Muestra la eficiencia con la que una empresa utiliza sus activos.</li>
            <li><strong>ROE (Return on Equity):</strong> Mide la rentabilidad para los accionistas.</li>
            <li><strong>Market Cap:</strong> Valor total de la empresa en el mercado.</li>
            <li><strong>Dividend Yield:</strong> Rendimiento anual de los dividendos de una empresa.</li>
            <li><strong>EPS (Earnings Per Share):</strong> Ganancia por cada acción de la empresa.</li>
            <li><strong>Price to Book (P/B Ratio):</strong> Compara el precio de mercado con el valor en libros.</li>
            <li><strong>Beta:</strong> Mide la volatilidad de una acción en comparación con el mercado.</li>
          </ul>

          {/* Sección de Videos Educacionales */}
          <h3 className="text-xl font-semibold mt-8">Videos Educacionales</h3>
          <p>Aprende más sobre conceptos financieros y análisis de acciones con los siguientes videos:</p>
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
          <h3 className="text-xl font-semibold mt-8">Libros Recomendados</h3>
          <ul className="list-disc pl-4 mt-4">
            <li>
              <strong>El inversor inteligente</strong> de Benjamin Graham: Considerado uno de los mejores libros sobre inversión, ofrece principios de inversión que han resistido la prueba del tiempo.
              <a href="https://www.amazon.com/dp/0060555661" target="_blank" rel="noopener noreferrer" className="text-blue-500"> (Ver en Amazon)</a>
            </li>
            <li>
              <strong>Un paseo aleatorio por Wall Street</strong> de Burton Malkiel: Un análisis accesible sobre la inversión en acciones y cómo funcionan los mercados.
              <a href="https://www.amazon.com/dp/0393352242" target="_blank" rel="noopener noreferrer" className="text-blue-500"> (Ver en Amazon)</a>
            </li>
            <li>
              <strong>Los secretos de la mente millonaria</strong> de T. Harv Eker: Explora la psicología del dinero y cómo nuestras creencias afectan nuestra capacidad de generar riqueza.
              <a href="https://www.amazon.com/dp/1682990483" target="_blank" rel="noopener noreferrer" className="text-blue-500"> (Ver en Amazon)</a>
            </li>
            <li>
              <strong>La bolsa o la vida</strong> de Joe Dominguez y Vicki Robin: Un enfoque sobre la relación entre el dinero y la vida, y cómo gestionar mejor nuestras finanzas.
              <a href="https://www.amazon.com/dp/0143115766" target="_blank" rel="noopener noreferrer" className="text-blue-500"> (Ver en Amazon)</a>
            </li>
          </ul>
        </div>
      )}


    </div>
  );
}
