import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Team } from '../teams/entities/team.entity';
import { Wallet, Transaction, TransactionStatus } from '../wallet/entities/wallet.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalTeams = await this.teamRepository.count();
    const totalTournaments = await this.tournamentRepository.count();
    const activeTournaments = await this.tournamentRepository.count({
      where: { status: 'ONGOING' } as any,
    });
    
    const totalRevenue = await this.walletRepository
      .createQueryBuilder('wallet')
      .select('SUM(wallet.totalBalance)', 'total')
      .getRawOne();

    const pendingWithdrawals = await this.transactionRepository.count({
      where: { type: 'WITHDRAW', status: TransactionStatus.PENDING } as any,
    });

    return {
      totalUsers,
      totalTeams,
      totalTournaments,
      activeTournaments,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      pendingWithdrawals,
    };
  }

  async getFinancialReports() {
    const wallets = await this.walletRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return {
      wallets,
    };
  }

  async getAllUsers() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async banUser(userId: string) {
    await this.userRepository.update(userId, { isBanned: true });
    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: string) {
    await this.userRepository.update(userId, { isBanned: false });
    return { message: 'User unbanned successfully' };
  }

  async getAllTournaments() {
    return this.tournamentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async deleteTournament(tournamentId: string) {
    await this.tournamentRepository.delete(tournamentId);
    return { message: 'Tournament deleted successfully' };
  }

  async getWithdrawals(status?: string) {
    const where = status && status !== 'ALL' ? { type: 'WITHDRAW', status } as any : { type: 'WITHDRAW' } as any;
    return this.transactionRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async approveWithdrawal(withdrawalId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: withdrawalId },
    });

    if (!transaction) {
      throw new NotFoundException('Withdrawal not found');
    }

    await this.transactionRepository.update(withdrawalId, {
      status: TransactionStatus.COMPLETED,
    });

    return { message: 'Withdrawal approved successfully' };
  }

  async rejectWithdrawal(withdrawalId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: withdrawalId },
    });

    if (!transaction) {
      throw new NotFoundException('Withdrawal not found');
    }

    const wallet = await this.walletRepository.findOne({
      where: { id: transaction.walletId },
    });

    if (wallet) {
      wallet.balance += transaction.amount;
      await this.walletRepository.save(wallet);
    }

    await this.transactionRepository.update(withdrawalId, {
      status: TransactionStatus.FAILED,
    });

    return { message: 'Withdrawal rejected and amount refunded' };
  }
}
