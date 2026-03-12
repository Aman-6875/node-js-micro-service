import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/db';
import { connectRabbitMQ } from './events/publisher';
import userRoutes from './routes/user.routes';
import { seedAdmin } from './seeds/admin.seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

app.use('/api/users', userRoutes);

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log('PostgreSQL connected');

    await seedAdmin();
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start user service:', error);
    process.exit(1);
  }
};

start();
