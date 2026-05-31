import { IsString, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { NoticeType } from '../entities/notice.entity';

export class UpdateNoticeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(NoticeType)
  @IsOptional()
  type?: NoticeType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  showOnDashboard?: boolean;

  @IsBoolean()
  @IsOptional()
  showOnTournaments?: boolean;

  @IsBoolean()
  @IsOptional()
  showOnWallet?: boolean;

  @IsArray()
  @IsOptional()
  targetRoles?: string[];
}
