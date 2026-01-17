import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserDetails } from '../entities/user-details.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserDetails)
    private userDetailsRepository: Repository<UserDetails>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['userDetails'],
      select: ['id', 'username', 'email', 'is_active', 'created_at', 'updated_at'],
    });

    return users.map((user) => ({
      ...user,
      userDetails: user.userDetails || null,
    }));
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userDetails'],
      select: ['id', 'username', 'email', 'is_active', 'created_at', 'updated_at'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...user,
      userDetails: user.userDetails || null,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userDetails'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update user fields
    if (updateUserDto.username) {
      // Check if username is already taken by another user
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username already taken');
      }
      user.username = updateUserDto.username;
    }

    if (updateUserDto.email) {
      // Check if email is already taken by another user
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already taken');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.save(user);

    // Update user details if provided
    if (updateUserDto.userDetails) {
      let userDetails = user.userDetails;

      if (!userDetails) {
        // Create new user details if they don't exist
        userDetails = this.userDetailsRepository.create({
          user_id: id,
          ...updateUserDto.userDetails,
        });
      } else {
        // Update existing user details
        Object.assign(userDetails, updateUserDto.userDetails);
      }

      await this.userDetailsRepository.save(userDetails);

      // Reload user with updated details
      return this.userRepository.findOne({
        where: { id },
        relations: ['userDetails'],
        select: ['id', 'username', 'email', 'is_active', 'created_at', 'updated_at'],
      });
    }

    // Return user without password
    const { password: _, ...result } = updatedUser;
    return result;
  }
}
