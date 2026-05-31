import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsOptional()
  packages?: Record<string, any>[];
}
