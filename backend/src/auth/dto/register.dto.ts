import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserDetailsDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  contact_number?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ValidateNested()
  @Type(() => UserDetailsDto)
  userDetails: UserDetailsDto;
}
