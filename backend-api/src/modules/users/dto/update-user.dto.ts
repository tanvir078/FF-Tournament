import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/decorators/roles.decorator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  uid?: string;

  @IsString()
  @IsOptional()
  ign?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
