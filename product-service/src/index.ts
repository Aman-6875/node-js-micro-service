import 'dotenv/config';
import express from 'express';
import productRoutes from './routes/product.routes';
import { connectDB } from './config/db';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use('/api/products', productRoutes);

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Product Service running on port ${PORT}`);
    });
};

start().catch(console.error);