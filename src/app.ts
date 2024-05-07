import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import cors from 'cors';


const prisma = new PrismaClient();
const app = express();


app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('typescript + express server + lotus app');
  });
app.use('/auth', authRoutes);
app.use(errorMiddleware);


export default app;
