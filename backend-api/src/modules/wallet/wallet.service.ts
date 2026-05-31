import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, Transaction, TransactionType, TransactionStatus } from './entities/wallet.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UserRole } from '../../common/decorators/roles.decorator';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getUserWallet(userId: string) {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      });
      await this.walletRepository.save(wallet);
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      totalBalance: wallet.balance,
      totalDeposits: wallet.totalDeposited,
      totalWithdrawals: wallet.totalWithdrawn,
    };
  }

  async getTeamWallet(teamId: string, user: { id: string; role: UserRole }) {
    const team = await this.walletRepository.manager.findOne(Team, {
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    if (user.role !== UserRole.ADMIN && team.captainId !== user.id) {
      throw new ForbiddenException('You cannot access this team wallet');
    }

    let wallet = await this.walletRepository.findOne({
      where: { teamId },
      relations: ['transactions', 'team'],
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        teamId,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      });
      await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  async getUserTransactions(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      return [];
    }

    return this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async deposit(userId: string, amount: number, reference?: string) {
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.getUserWallet(userId);
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.PENDING,
      description: 'Deposit request',
      reference,
    });

    await this.transactionRepository.save(transaction);

    return { message: 'Deposit submitted for verification', transaction };
  }

  async withdraw(userId: string, amount: number) {
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.getUserWallet(userId);
    const walletEntity = await this.walletRepository.findOne({
      where: { id: wallet.id },
    });

    if (Number(walletEntity.balance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.WITHDRAW,
      amount,
      status: TransactionStatus.PENDING,
      description: 'Withdrawal request',
    });

    await this.transactionRepository.manager.transaction(async (manager) => {
      await manager.save(transaction);
      await manager.decrement(Wallet, { id: wallet.id }, 'balance', amount);
    });

    return { message: 'Withdrawal request submitted', transaction };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const wallet = await this.walletRepository.findOne({
      where: { id: createTransactionDto.walletId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return this.transactionRepository.save(this.transactionRepository.create(createTransactionDto));
  }

  async updateTransactionStatus(transactionId: string, status: TransactionStatus) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Only pending transactions can be updated');
    }

    await this.transactionRepository.manager.transaction(async (manager) => {
      if (status === TransactionStatus.COMPLETED) {
        if ([TransactionType.DEPOSIT, TransactionType.PRIZE, TransactionType.REFUND].includes(transaction.type)) {
          await manager.increment(Wallet, { id: transaction.walletId }, 'balance', transaction.amount);
          await manager.increment(Wallet, { id: transaction.walletId }, 'totalDeposited', transaction.amount);
        } else if (transaction.type === TransactionType.ENTRY_FEE) {
          await manager.decrement(Wallet, { id: transaction.walletId }, 'balance', transaction.amount);
        } else if (transaction.type === TransactionType.WITHDRAW) {
          await manager.increment(Wallet, { id: transaction.walletId }, 'totalWithdrawn', transaction.amount);
        }
      }
      if ([TransactionStatus.FAILED, TransactionStatus.CANCELLED].includes(status)
        && transaction.type === TransactionType.WITHDRAW) {
        await manager.increment(Wallet, { id: transaction.walletId }, 'balance', transaction.amount);
      }
      await manager.update(Transaction, transactionId, { status });
    });
    return this.transactionRepository.findOne({ where: { id: transactionId } });
  }
}
