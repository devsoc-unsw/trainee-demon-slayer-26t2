import express from 'express';
const PORT = process.env.PORT || 3000;
// const swaggerUi = require('swagger-ui-express');
import swaggerUi from 'swagger-ui-express'
// const YAML = require('yamljs');
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.routes.js';

// const path = require('path');

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Middleware to parse JSON request bodies
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use('/auth', authRouter);

// // A basic route
// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

// // Example API route
// app.get('/api/users', (req, res) => {
//   res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});