import express from 'express';
import cors from 'cors';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:4200" // Ajuste a origem conforme necessário
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET']
}));
app.use(limiter);

//
// Endpoint HTTP (opcional)
//  => Continua servindo caso queira compatibilidade com polling
//
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const rawData = await fetchStockData(symbol);
    const transformedData = transformStockData(rawData);
    res.json(transformedData);
  } catch (error: unknown) {
    res.status(500).json({
      error: 'Failed to fetch stock data',
      details: (error as Error).message || 'Unknown error'
    });
  }
});

//
// -------------------- SOCKET.IO --------------------
//
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Por socket, mantemos um "Set" local de quais símbolos estão habilitados.
  // Se o cliente desabilitar algum, removemos daqui para não enviar mais para este socket.
  const STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'] as const;
  const enabledSymbols = new Set<string>(STOCKS);

  // Escuta do evento: "disableStock"
  // Caso o front queira parar de receber uma ação específica
  socket.on('disableStock', (symbol: string) => {
    console.log(`Disable requested for: ${symbol} by socket ${socket.id}`);
    enabledSymbols.delete(symbol);
  });

  // Escuta do evento: "enableStock"
  socket.on('enableStock', (symbol: string) => {
    console.log(`Enable requested for: ${symbol} by socket ${socket.id}`);
    if (STOCKS.includes(symbol as any)) {
      enabledSymbols.add(symbol);
    }
  });

  // Loop de updates a cada 5s (exemplo)
  const intervalId = setInterval(async () => {
    // Se não houver símbolos ativos, pule
    if (!enabledSymbols.size) {
      return;
    }

    try {
      // Busca dados de todos os símbolos habilitados
      const symbolsArray = Array.from(enabledSymbols);
      const results = await Promise.all(symbolsArray.map(s => fetchStockData(s)));
      
      // Transforma cada resultado e anexa o symbol
      const transformedResults = results.map((raw, index) => {
        return {
          symbol: symbolsArray[index],
          data: transformStockData(raw)
        };
      });

      // Envia via WS para ESTE socket apenas (caso queira enviar para todos, usar io.emit)
      socket.emit('stockData', transformedResults);

    } catch (err) {
      console.error('Error fetching stock data:', err);
    }
  }, 5000);

  // Quando o cliente desconecta, limpamos o setInterval
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(intervalId);
  });
});

// Função utilitária para buscar dados do Yahoo
async function fetchStockData(symbol: string) {
  const response = await axios.get(
    `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
    {
      params: {
        interval: '1m',
        range: '1d'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0'  // Yahoo exige
      }
    }
  );
  return response.data;
}

// Exemplo de função de transformação
// Pode extrair dailyHigh, dailyLow, regularMarketPrice, etc.
function transformStockData(yahooResponse: any) {
  const chart = yahooResponse?.chart?.result?.[0];
  if (!chart) {
    return null;
  }

  const meta = chart.meta;
  const indicators = chart.indicators?.quote?.[0];

  // Exemplo simples de extração
  return {
    symbol: meta.symbol,
    currentPrice: meta.regularMarketPrice,
    chartPreviousClose: meta.chartPreviousClose,
    dailyHigh: Math.max(...indicators.high),
    dailyLow: Math.min(...indicators.low),
    open: meta.previousClose,  // ou extrair do "indicators.open[0]", etc.
    timestamp: Date.now()
  };
}

// Inicia o servidor HTTP na porta 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});