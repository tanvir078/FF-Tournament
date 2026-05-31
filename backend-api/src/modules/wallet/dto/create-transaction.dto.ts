import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { TransactionType } from '../entities/wallet.entity';

export class CreateTransactionDto {
  @IsString()
  walletId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}
