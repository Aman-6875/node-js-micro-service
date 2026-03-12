export interface CreateProductInput {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
}

export interface UpdateProductInput {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
}

export interface ProductResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProductService {
    createProduct(input: CreateProductInput, adminId: string): Promise<ProductResponse>;
    getProducts(): Promise<ProductResponse[]>;
    getProductById(id: string): Promise<ProductResponse>;
    updateProduct(id: string, input: UpdateProductInput): Promise<ProductResponse>;
    deleteProduct(id: string): Promise<{ message: string }>;
}