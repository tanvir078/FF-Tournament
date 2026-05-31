import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum TournamentRegistrationStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
}

@Entity('tournament_registrations')
@Unique(['tournamentId', 'userId'])
export class TournamentRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tournamentId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: TournamentRegistrationStatus,
    default: TournamentRegistrationStatus.APPROVED,
  })
  status: TournamentRegistrationStatus;

  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn()
  createdAt: Date;
}
