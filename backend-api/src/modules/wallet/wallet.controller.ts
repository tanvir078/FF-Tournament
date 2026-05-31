import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionStatus } from './entities/wallet.entity';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('user')
  async getUserWallet(@Request() req) {
    return this.walletService.getUserWallet(req.user.id);
  }

  @Get('team/:teamId')
  async getTeamWallet(@Param('teamId') teamId: string, @Request() req) {
    return this.walletService.getTeamWallet(teamId, req.user);
  }

  @Get('transactions')
  async getUserTransactions(@Request() req) {
    return this.walletService.getUserTransactions(req.user.id);
  }

  @Post('deposit')
  async deposit(@Request() req, @Body('amount') amount: number, @Body('transactionId') reference?: string) {
    return this.walletService.deposit(req.user.id, amount, reference);
  }

  @Post('withdraw')
  async withdraw(@Request() req, @Body('amount') amount: number) {
    return this.walletService.withdraw(req.user.id, amount);
  }

  @Post('transaction')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.walletService.createTransaction(createTransactionDto);
  }

  @Put('transaction/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body('status') status: TransactionStatus,
  ) {
    return this.walletService.updateTransactionStatus(id, status);
  }
}
