import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WithdrawRequest, WithdrawStatus } from './entities/withdraw-request.entity';
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto';
import { UpdateWithdrawRequestDto } from './dto/update-withdraw-request.dto';
import { WalletService } from '../wallet/wallet.service';
import { UserRole } from '../../common/decorators/roles.decorator';
import { TransactionStatus } from '../wallet/entities/wallet.entity';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(WithdrawRequest)
    private withdrawRequestRepository: Repository<WithdrawRequest>,
    private walletService: WalletService,
  ) {}

  async create(userId: string, createWithdrawRequestDto: CreateWithdrawRequestDto) {
    const { transaction } = await this.walletService.withdraw(userId, createWithdrawRequestDto.amount);
    const withdrawRequest = this.withdrawRequestRepository.create({
      ...createWithdrawRequestDto,
      userId,
      transactionId: transaction.id,
      status: WithdrawStatus.PENDING,
    });
    return this.withdrawRequestRepository.save(withdrawRequest);
  }

  async findAll() {
    return this.withdrawRequestRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    return this.withdrawRequestRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.withdrawRequestRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findOneForUser(id: string, user: { id: string; role: UserRole }) {
    const request = await this.findOne(id);
    if (!request) {
      throw new NotFoundException('Withdraw request not found');
    }
    if (user.role !== UserRole.ADMIN && request.userId !== user.id) {
      throw new ForbiddenException('You cannot access this withdraw request');
    }
    return request;
  }

  async update(id: string, updateWithdrawRequestDto: UpdateWithdrawRequestDto) {
    const withdrawRequest = await this.findOne(id);
    if (!withdrawRequest) {
      throw new NotFoundException('Withdraw request not found');
    }

    if (withdrawRequest.status !== WithdrawStatus.PENDING) {
      throw new BadRequestException('Can only update pending requests');
    }

    const updateData: any = { ...updateWithdrawRequestDto };
    if (updateWithdrawRequestDto.status === WithdrawStatus.APPROVED) {
      updateData.processedAt = new Date();
      if (withdrawRequest.transactionId) {
        await this.walletService.updateTransactionStatus(withdrawRequest.transactionId, TransactionStatus.COMPLETED);
      }
    } else if (updateWithdrawRequestDto.status === WithdrawStatus.REJECTED && withdrawRequest.transactionId) {
      await this.walletService.updateTransactionStatus(withdrawRequest.transactionId, TransactionStatus.FAILED);
    }

    await this.withdrawRequestRepository.update(id, updateData);
    return this.findOne(id);
  }

  async getPendingRequests() {
    return this.withdrawRequestRepository.find({
      where: { status: WithdrawStatus.PENDING },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getStats() {
    const total = await this.withdrawRequestRepository.count();
    const pending = await this.withdrawRequestRepository.count({
      where: { status: WithdrawStatus.PENDING },
    });
    const approved = await this.withdrawRequestRepository.count({
      where: { status: WithdrawStatus.APPROVED },
    });
    const rejected = await this.withdrawRequestRepository.count({
      where: { status: WithdrawStatus.REJECTED },
    });

    const totalAmount = await this.withdrawRequestRepository
      .createQueryBuilder('withdraw')
      .select('SUM(withdraw.amount)', 'total')
      .where('withdraw.status = :status', { status: WithdrawStatus.APPROVED })
      .getRawOne();

    return {
      total,
      pending,
      approved,
      rejected,
      totalProcessedAmount: totalAmount?.total || 0,
    };
  }
}
