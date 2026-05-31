import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UserRole } from '../../common/decorators/roles.decorator';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async create(user: { id: string; role: UserRole }, createMatchDto: CreateMatchDto) {
    await this.assertCanManageTournament(createMatchDto.tournamentId, user);
    const match = this.matchRepository.create(createMatchDto);
    return this.matchRepository.save(match);
  }

  async findAll() {
    const matches = await this.matchRepository.find({
      relations: ['tournament', 'mvpTeam'],
      order: { scheduledTime: 'ASC' },
    });
    return matches.map((match) => this.toPublicMatch(match));
  }

  async findByTournament(tournamentId: string) {
    const matches = await this.matchRepository.find({
      where: { tournamentId },
      relations: ['tournament', 'mvpTeam'],
      order: { scheduledTime: 'ASC' },
    });
    return matches.map((match) => this.toPublicMatch(match));
  }

  async findOne(id: string) {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['tournament', 'mvpTeam'],
    });
    return match ? this.toPublicMatch(match) : null;
  }

  async update(id: string, user: { id: string; role: UserRole }, updateMatchDto: UpdateMatchDto) {
    await this.assertCanManage(id, user);
    await this.matchRepository.update(id, updateMatchDto);
    return this.findOne(id);
  }

  async createRoom(id: string, user: { id: string; role: UserRole }, roomId: string, roomPassword: string) {
    await this.assertCanManage(id, user);
    await this.matchRepository.update(id, {
      roomId,
      roomPassword,
      status: MatchStatus.ROOM_CREATED,
    });
    return this.findOne(id);
  }

  async submitResults(id: string, user: { id: string; role: UserRole }, results: any) {
    await this.assertCanManage(id, user);
    await this.matchRepository.update(id, {
      results,
      status: MatchStatus.COMPLETED,
    });
    return this.findOne(id);
  }

  async updateStatus(id: string, user: { id: string; role: UserRole }, status: MatchStatus) {
    await this.assertCanManage(id, user);
    await this.matchRepository.update(id, { status });
    return this.findOne(id);
  }

  private async assertCanManage(id: string, user: { id: string; role: UserRole }) {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['tournament'],
    });
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    if (user.role !== UserRole.ADMIN && match.tournament.organizerId !== user.id) {
      throw new ForbiddenException('You cannot manage this match');
    }
  }

  private async assertCanManageTournament(tournamentId: string, user: { id: string; role: UserRole }) {
    const match = await this.matchRepository.manager
      .createQueryBuilder()
      .select('tournament.organizerId', 'organizerId')
      .from('tournaments', 'tournament')
      .where('tournament.id = :tournamentId', { tournamentId })
      .getRawOne();
    if (!match) {
      throw new NotFoundException('Tournament not found');
    }
    if (user.role !== UserRole.ADMIN && match.organizerId !== user.id) {
      throw new ForbiddenException('You cannot manage matches for this tournament');
    }
  }

  private toPublicMatch(match: Match) {
    const { roomPassword, ...publicMatch } = match;
    return publicMatch;
  }
}
