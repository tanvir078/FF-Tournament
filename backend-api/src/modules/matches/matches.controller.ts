import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';
import { MatchStatus } from './entities/match.entity';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  async findAll() {
    return this.matchesService.findAll();
  }

  @Get('tournament/:tournamentId')
  async findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.matchesService.findByTournament(tournamentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async create(@Request() req, @Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(req.user, createMatchDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async update(@Param('id') id: string, @Request() req, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchesService.update(id, req.user, updateMatchDto);
  }

  @Post(':id/room')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async createRoom(
    @Param('id') id: string,
    @Request() req,
    @Body('roomId') roomId: string,
    @Body('roomPassword') roomPassword: string,
  ) {
    return this.matchesService.createRoom(id, req.user, roomId, roomPassword);
  }

  @Post(':id/results')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async submitResults(@Param('id') id: string, @Request() req, @Body() results: any) {
    return this.matchesService.submitResults(id, req.user, results);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Request() req, @Body('status') status: MatchStatus) {
    return this.matchesService.updateStatus(id, req.user, status);
  }
}
