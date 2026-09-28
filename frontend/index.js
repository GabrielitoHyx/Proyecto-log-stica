import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import apiRoutes from './src/routes/apiroutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: true
}));

app.use(express.json());

app.use('/api', apiRoutes);

export default app;