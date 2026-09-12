import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import cors  from 'cors';

import apiRoutes from './src/routes/apiroutes.js';
//import webRoutes from './src/routes/webroutes.js';

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: 'mi_clave_super_secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
);

// http://localhost:5000/api/
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});