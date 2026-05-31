import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
