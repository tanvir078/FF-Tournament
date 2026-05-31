import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { WithdrawRequest } from './entities/withdraw-request.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawRequest]), WalletModule],
  controllers: [WithdrawController],
  providers: [WithdrawService],
  exports: [WithdrawService],
})
export class WithdrawModule {}
