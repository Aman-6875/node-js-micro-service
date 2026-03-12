import {Router} from 'express';
import { ProductRepository } from '../repositories/product.repository';
import { ProductService } from '../services/product.service';
import { ProductController } from '../controllers/product.controller';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Define product routes here

//public routes
router.get('/', (req, res) => productController.getProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));

//admin routes
router.post('/', authMiddleware, adminMiddleware, (req, res) => productController.createProduct(req, res));
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => productController.updateProduct(req, res));
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => productController.deleteProduct(req, res));

export default router;