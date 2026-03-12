import { Product, IProduct } from '../models/product.model';

export interface IProductRepository {
  create(data: Partial<IProduct>): Promise<IProduct>;
  findAll(): Promise<IProduct[]>;
  findById(id: string): Promise<IProduct | null>;
  update(id: string, data: Partial<IProduct>): Promise<IProduct | null>;
  delete(id: string): Promise<boolean>;
}

export class ProductRepository implements IProductRepository {
  async create(data: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(data);
    return await product.save();
  }

  async findAll(): Promise<IProduct[]> {
    return await Product.find();
  }

  async findById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(id);
    return result !== null;
  }
}
