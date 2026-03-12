import 'reflect-metadata';
import  'dotenv/config';
import { AppDataSource } from '../config/db';
import { seedAdmin } from './admin.seed';

const runSeed = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    await seedAdmin();
    console.log('Admin user seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
};

runSeed();