import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NoticeType {
  GENERAL = 'GENERAL',
  MAINTENANCE = 'MAINTENANCE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  WARNING = 'WARNING',
}

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: NoticeType,
    default: NoticeType.GENERAL,
  })
  type: NoticeType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ default: false })
  showOnDashboard: boolean;

  @Column({ default: false })
  showOnTournaments: boolean;

  @Column({ default: false })
  showOnWallet: boolean;

  @Column({ type: 'json', nullable: true })
  targetRoles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
