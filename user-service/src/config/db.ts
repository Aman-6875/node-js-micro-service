import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/user.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'usersdb',
  entities: [User],
  synchronize: true,
});
