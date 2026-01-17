import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserDetails } from '../entities/user-details.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'johnlouie',
  database: process.env.DB_DATABASE || 'OJT',
  entities: [User, UserDetails],
  synchronize: process.env.NODE_ENV !== 'production', // Set to false in production
  logging: false,
};
