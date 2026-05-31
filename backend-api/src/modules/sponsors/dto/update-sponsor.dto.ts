import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateSponsorDto {
  @IsString()
  @IsOptional()
  name?: string;

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

  @IsArray()
  @IsOptional()
  sponsoredTournaments?: string[];
}
