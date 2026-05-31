import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../common/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  try {
    // Create direct TypeORM connection
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'ff_tournament',
      entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
      synchronize: false,
    });
    
    const userRepository = connection.getRepository(User);
    
    // Check if admin already exists
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
    }

    const existingAdmin = await userRepository.findOne({
      where: { email }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log(`Email: ${email}`);
      await connection.close();
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = userRepository.create({
      email,
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      uid: 'ADMIN001',
      ign: 'Admin',
      phone: '+8801700000000',
    });
    
    await userRepository.save(admin);
    
    console.log('Admin user created successfully');
    console.log(`Email: ${email}`);
    
    await connection.close();
  } catch (error) {
    console.error('Error seeding admin:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

seedAdmin();
