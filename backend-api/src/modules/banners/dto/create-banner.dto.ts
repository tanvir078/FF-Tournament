import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

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
