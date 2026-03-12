import { AppDataSource } from "../config/db";
import { User } from "../models/user.model";
import bcrypt from 'bcrypt';

export const seedAdmin = async () => {
    const userRepo = AppDataSource.getRepository(User);

    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@example.com' } });
    if (existingAdmin) {
        console.log('Admin user already exists');
        return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = userRepo.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
    });

    await userRepo.save(adminUser);
    console.log('Admin user created successfully');
}