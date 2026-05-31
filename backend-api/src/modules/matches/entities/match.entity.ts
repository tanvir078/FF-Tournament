import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tournament, TournamentStage } from '../../tournaments/entities/tournament.entity';
import { Team } from '../../teams/entities/team.entity';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  ROOM_CREATED = 'ROOM_CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tournamentId: string;

  @ManyToOne(() => Tournament)
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @Column()
  matchNumber: number;

  @Column({
    type: 'enum',
    enum: TournamentStage,
  })
  stage: TournamentStage;

  @Column({ nullable: true })
  roomId: string;

  @Column({ nullable: true })
  roomPassword: string;

  @Column()
  map: string;

  @Column({ type: 'timestamp' })
  scheduledTime: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status: MatchStatus;

  @Column({ type: 'json', nullable: true })
  slots: Array<{
    slotNumber: number;
    teamId: string;
    teamName: string;
  }>;

  @Column({ type: 'json', nullable: true })
  results: Array<{
    teamId: string;
    placement: number;
    kills: number;
    points: number;
  }>;

  @Column({ nullable: true })
  mvpTeamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'mvpTeamId' })
  mvpTeam: Team;

  @Column({ type: 'json', nullable: true })
  screenshots: string[];

  @Column({ nullable: true })
  streamUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
