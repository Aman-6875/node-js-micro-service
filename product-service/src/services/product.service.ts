import { IProductService, CreateProductInput, UpdateProductInput, ProductResponse } from '../interfaces/IProductService';
import { IProductRepository } from '../repositories/product.repository';

export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}

  async createProduct(input: CreateProductInput, adminId: string): Promise<ProductResponse> {
    const product = await this.productRepository.create({
      ...input,
      createdBy: adminId,
    });
    return this.toResponse(product);
  }

  async getProducts(): Promise<ProductResponse[]> {
    const products = await this.productRepository.findAll();
    return products.map(p => this.toResponse(p));
  }

  async getProductById(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('Product not found');
    return this.toResponse(product);
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<ProductResponse> {
    const product = await this.productRepository.update(id, input);
    if (!product) throw new Error('Product not found');
    return this.toResponse(product);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) throw new Error('Product not found');
    return { message: 'Product deleted successfully' };
  }

  private toResponse(product: any): ProductResponse {
    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
