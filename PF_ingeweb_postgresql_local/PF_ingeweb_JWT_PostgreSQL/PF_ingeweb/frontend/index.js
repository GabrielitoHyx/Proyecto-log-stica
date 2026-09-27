import express from 'express';
import dotenv from 'dotenv';
import cors  from 'cors';

import apiRoutes from './src/routes/apiroutes.js';
//import webRoutes from './src/routes/webroutes.js';

import { testConnection } from './src/config/postgres.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

// http://localhost:5000/api/
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await testConnection();
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
  }
});