import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UserRole } from '../../common/decorators/roles.decorator';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    const team = this.teamRepository.create({
      ...createTeamDto,
      players: [],
      stats: {
        totalPoints: 0,
        totalKills: 0,
        booyahs: 0,
        matchesPlayed: 0,
        rank: 0,
      },
    });
    return this.teamRepository.save(team);
  }

  async findAll() {
    return this.teamRepository.find({
      relations: ['captain'],
    });
  }

  async findByCaptain(captainId: string) {
    return this.teamRepository.findOne({
      where: { captainId },
      relations: ['captain'],
    });
  }

  async findOne(id: string) {
    return this.teamRepository.findOne({
      where: { id },
      relations: ['captain'],
    });
  }

  async update(id: string, user: { id: string; role: UserRole }, updateTeamDto: UpdateTeamDto) {
    await this.assertCanManage(id, user);
    await this.teamRepository.update(id, updateTeamDto);
    return this.findOne(id);
  }

  async invitePlayer(teamId: string, user: { id: string; role: UserRole }, playerData: any) {
    await this.assertCanManage(teamId, user);
    const team = await this.findOne(teamId);
    if (team) {
      team.players = [...(team.players || []), playerData];
      return this.teamRepository.save(team);
    }
    return null;
  }

  async removePlayer(teamId: string, user: { id: string; role: UserRole }, playerId: string) {
    await this.assertCanManage(teamId, user);
    const team = await this.findOne(teamId);
    if (team) {
      team.players = team.players?.filter(p => p.userId !== playerId) || [];
      return this.teamRepository.save(team);
    }
    throw new NotFoundException('Team not found');
  }

  async delete(id: string, user: { id: string; role: UserRole }) {
    await this.assertCanManage(id, user);
    await this.teamRepository.delete(id);
    return { message: 'Team deleted successfully' };
  }

  async updateStats(teamId: string, stats: any) {
    const team = await this.findOne(teamId);
    if (team) {
      team.stats = { ...team.stats, ...stats };
      return this.teamRepository.save(team);
    }
    return null;
  }

  private async assertCanManage(id: string, user: { id: string; role: UserRole }) {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    if (user.role !== UserRole.ADMIN && team.captainId !== user.id) {
      throw new ForbiddenException('You cannot manage this team');
    }
  }
}
