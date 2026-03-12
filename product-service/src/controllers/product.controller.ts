import {Request, Response} from 'express';
import { IProductService } from '../interfaces/IProductService';
import { ApiResponse } from '../utils/response';

export class ProductController {
    constructor(private productService: IProductService) {}

    async createProduct(req: Request, res: Response): Promise<void>{
        try {
            const adminId = req.user!.id;
            const result = await this.productService.createProduct(req.body, adminId);
            return ApiResponse.success(res, result, 201, 'Product created successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create product';
            return ApiResponse.error(res, message);
        }
    }

    async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.productService.getProducts();
            return ApiResponse.success(res, result, 200, 'Products fetched successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch products';
            return ApiResponse.error(res, message);
        }
    }

    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.productService.getProductById(req.params.id);
            return ApiResponse.success(res, result, 200, 'Product fetched successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch product';
            return ApiResponse.error(res, message);
        }
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.productService.updateProduct(req.params.id, req.body);
            return ApiResponse.success(res, result, 200, 'Product updated successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update product';
            return ApiResponse.error(res, message);
        }
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.productService.deleteProduct(req.params.id);
            return ApiResponse.success(res, result, 200, 'Product deleted successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete product';
            return ApiResponse.error(res, message);
        }
    }
}
