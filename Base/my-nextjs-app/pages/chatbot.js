// components/Chatbot.js
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([
    "¿Cuál es el tincker de la empresa ",
    "¿Qué significa "
  ]);
  const chatContainerRef = useRef(null);

  const globalContext = "You are a financial advisor. Provide clear and concise information about financial markets, investment strategies, and economic trends.";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);

    try {
      const res = await axios.post('/api/chat', { prompt, context: globalContext });
      const assistantMessage = res.data.choices[0].message.content.trim();
      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      setResponse(assistantMessage);
      setPrompt('');
    } catch (error) {
      console.error(error);
      setResponse('Error: Could not get a response from the chatbot.');
    }
  };

  // Scroll automático hacia el último mensaje
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };

  return (
    <div>
      {/* Botón flotante en la esquina inferior derecha */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none transition-all"
      >
        <span className="text-xl">💬</span>
      </button>

      {/* Chatbot */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-lg p-4 border border-gray-300">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-bold text-blue-500">Asistente Virtual</div>
          </div>

          {/* Contenedor de mensajes */}
          <div
            ref={chatContainerRef}
            className="h-64 overflow-y-scroll mb-4 p-2 bg-gray-50 rounded-lg shadow-inner"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Sugerencias de conversación en dos cuadros separados en la misma línea */}
          <div className="flex space-x-4 mb-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex-1 p-3 bg-blue-50 rounded-lg shadow-md"
              >
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-blue-600 hover:text-blue-700 focus:outline-none text-sm text-center"
                >
                  {suggestion}
                </button>
              </div>
            ))}
          </div>

          {/* Formulario de entrada */}
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escribe algo..."
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
            />
            <button
              type="submit"
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
