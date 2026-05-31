import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateWithdrawRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  accountName?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;
}
