import express from 'express';
import cors from 'cors';
const PORT = process.env.PORT || 3038;

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.routes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(
  path.join(__dirname, 'swagger.yaml')
);

// CORS - allow frontend to communicate with backend
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.get('/', (req, res) => {
  res.send('Job Tracker backend is running!');
});

app.use('/auth', authRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message,
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('SERVER ERROR:', error);
});