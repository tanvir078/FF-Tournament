import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../../../common/decorators/roles.decorator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PLAYER,
  })
  role: UserRole;

  @Column({ nullable: true })
  uid: string; // Free Fire UID

  @Column({ nullable: true })
  ign: string; // In-game name

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @Column({ type: 'json', nullable: true })
  stats: {
    matches: number;
    wins: number;
    kills: number;
    kd: number;
    mvp: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
