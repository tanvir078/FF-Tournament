import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  captainId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'captainId' })
  captain: User;

  @Column({ type: 'json', nullable: true })
  players: Array<{
    userId: string;
    uid: string;
    ign: string;
    role: string;
  }>;

  @Column({ type: 'json', nullable: true })
  stats: {
    totalPoints: number;
    totalKills: number;
    booyahs: number;
    matchesPlayed: number;
    rank: number;
  };

  @Column({ default: 0 })
  walletBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
