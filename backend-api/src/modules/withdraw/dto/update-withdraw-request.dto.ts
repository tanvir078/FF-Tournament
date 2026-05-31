import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WithdrawStatus } from '../entities/withdraw-request.entity';

export class UpdateWithdrawRequestDto {
  @IsEnum(WithdrawStatus)
  @IsOptional()
  status?: WithdrawStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  adminNote?: string;
}
