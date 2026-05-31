import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament, TournamentStatus, TournamentStage } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentRegistration, TournamentRegistrationStatus } from './entities/tournament-registration.entity';
import { UserRole } from '../../common/decorators/roles.decorator';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
    @InjectRepository(TournamentRegistration)
    private registrationRepository: Repository<TournamentRegistration>,
  ) {}

  async create(createTournamentDto: CreateTournamentDto) {
    const tournament = this.tournamentRepository.create(createTournamentDto);
    return this.tournamentRepository.save(tournament);
  }

  async findAll() {
    const tournaments = await this.tournamentRepository.find({
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
    });
    return tournaments.map((tournament) => this.toPublicTournament(tournament));
  }

  async findOne(id: string) {
    const tournament = await this.tournamentRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });
    return tournament ? this.toPublicTournament(tournament) : null;
  }

  async getRegistrationStatus(tournamentId: string, userId: string) {
    const registration = await this.registrationRepository.findOne({
      where: { tournamentId, userId },
    });
    return { isRegistered: Boolean(registration), registration };
  }

  async joinTournament(tournamentId: string, userId: string, body: any, screenshot?: Express.Multer.File) {
    const tournament = await this.tournamentRepository.findOne({ where: { id: tournamentId } });
    
    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Registration is not open');
    }

    if (tournament.registeredTeams >= tournament.maxTeams) {
      throw new BadRequestException('Tournament is full');
    }

    // Handle payment if not free
    if (!tournament.isFree) {
      if (!body.transactionId) {
        throw new BadRequestException('Transaction ID is required');
      }
      // In a real implementation, you would:
      // 1. Save the payment screenshot
      // 2. Create a payment record
      // 3. Mark registration as pending approval
    }

    await this.createRegistration(tournament, userId, body.transactionId);

    return { message: tournament.isFree ? 'Successfully joined tournament' : 'Payment submitted. Wait for approval.' };
  }

  async register(tournamentId: string, userId: string) {
    const tournament = await this.tournamentRepository.findOne({ where: { id: tournamentId } });
    
    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Registration is not open');
    }

    if (tournament.registeredTeams >= tournament.maxTeams) {
      throw new BadRequestException('Tournament is full');
    }

    await this.createRegistration(tournament, userId);

    return { message: 'Successfully registered for tournament' };
  }

  async update(id: string, user: { id: string; role: UserRole }, updateTournamentDto: UpdateTournamentDto) {
    await this.assertCanManage(id, user);
    await this.tournamentRepository.update(id, updateTournamentDto);
    return this.findOne(id);
  }

  async updateStatus(id: string, user: { id: string; role: UserRole }, status: TournamentStatus) {
    await this.assertCanManage(id, user);
    await this.tournamentRepository.update(id, { status });
    return this.findOne(id);
  }

  async updateStage(id: string, user: { id: string; role: UserRole }, stage: TournamentStage) {
    await this.assertCanManage(id, user);
    await this.tournamentRepository.update(id, { currentStage: stage });
    return this.findOne(id);
  }

  async incrementRegisteredTeams(id: string) {
    const tournament = await this.findOne(id);
    if (tournament) {
      await this.tournamentRepository.update(id, {
        registeredTeams: tournament.registeredTeams + 1,
      });
    }
    return this.findOne(id);
  }

  async getFeaturedTournaments() {
    const tournaments = await this.tournamentRepository.find({
      where: { isFeatured: true },
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
    });
    return tournaments.map((tournament) => this.toPublicTournament(tournament));
  }

  private async createRegistration(tournament: Tournament, userId: string, transactionId?: string) {
    const existing = await this.registrationRepository.findOne({
      where: { tournamentId: tournament.id, userId },
    });
    if (existing) {
      throw new BadRequestException('Already registered for this tournament');
    }

    const status = tournament.isFree
      ? TournamentRegistrationStatus.APPROVED
      : TournamentRegistrationStatus.PENDING;
    await this.registrationRepository.manager.transaction(async (manager) => {
      await manager.save(TournamentRegistration, {
        tournamentId: tournament.id,
        userId,
        transactionId,
        status,
      });
      const result = await manager
        .createQueryBuilder()
        .update(Tournament)
        .set({ registeredTeams: () => '"registeredTeams" + 1' })
        .where('id = :id', { id: tournament.id })
        .andWhere('"registeredTeams" < "maxTeams"')
        .execute();
      if (result.affected !== 1) {
        throw new BadRequestException('Tournament is full');
      }
    });
  }

  private async assertCanManage(id: string, user: { id: string; role: UserRole }) {
    const tournament = await this.tournamentRepository.findOne({ where: { id } });
    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }
    if (user.role !== UserRole.ADMIN && tournament.organizerId !== user.id) {
      throw new ForbiddenException('You cannot manage this tournament');
    }
  }

  private toPublicTournament(tournament: Tournament) {
    const { roomDetails, ...publicTournament } = tournament;
    return publicTournament;
  }
}
