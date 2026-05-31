import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TournamentFormat {
  SOLO = 'SOLO',
  DUO = 'DUO',
  SQUAD = 'SQUAD',
  CLASH_SQUAD = 'CLASH_SQUAD',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TournamentStage {
  QUALIFIER = 'QUALIFIER',
  ROUND_2 = 'ROUND_2',
  SEMI_FINAL = 'SEMI_FINAL',
  FINAL = 'FINAL',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  banner: string;

  @Column({
    type: 'enum',
    enum: TournamentFormat,
  })
  format: TournamentFormat;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.DRAFT,
  })
  status: TournamentStatus;

  @Column({
    type: 'enum',
    enum: TournamentStage,
    default: TournamentStage.QUALIFIER,
  })
  currentStage: TournamentStage;

  @Column({ type: 'json', nullable: true })
  stages: Array<{
    stage: TournamentStage;
    qualifiedTeams: number;
    startDate: Date;
    endDate: Date;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  entryFee: number;

  @Column({ default: false })
  isFree: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prizePool: number;

  @Column({ default: 0 })
  maxTeams: number;

  @Column({ default: 0 })
  registeredTeams: number;

  @Column({ type: 'json', nullable: true })
  prizeDistribution: Array<{
    rank: number;
    amount: number;
    percentage: number;
  }>;

  @Column({ type: 'json', nullable: true })
  rules: string[];

  @Column({ type: 'json', nullable: true })
  maps: string[];

  @Column({ default: 0 })
  matchCount: number;

  @Column({ type: 'timestamp', nullable: true })
  registrationStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  registrationEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  registrationDeadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  startTime: string;

  @Column({ type: 'json', nullable: true })
  paymentMethods: string[];

  @Column({ type: 'json', nullable: true })
  roomDetails: {
    roomId: string;
    password: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  perKillReward: number;

  @Column()
  organizerId: string;

  @ManyToOne(() => User)
  organizer: User;

  @Column({ type: 'json', nullable: true })
  sponsors: Array<{
    name: string;
    logo: string;
    website: string;
  }>;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
