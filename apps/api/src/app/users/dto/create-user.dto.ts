import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { UserRole } from '@secure-task/data';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @MinLength(10)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsUUID()
  organizationId!: string;
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsString()
  temporaryPassword?: string;
}

