import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  ENTRY_FEE = 'ENTRY_FEE',
  PRIZE = 'PRIZE',
  REFUND = 'REFUND',
  COMMISSION = 'COMMISSION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  teamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDeposited: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWithdrawn: number;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference: string; // Payment gateway reference

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
