import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { usersRouter } from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', usersRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Backend is running on http://localhost:${env.port}`);
});

