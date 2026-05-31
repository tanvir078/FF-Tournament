import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  async create(@Request() req, @Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create({
      ...createTeamDto,
      captainId: req.user.id,
    });
  }

  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get('my-team')
  async getMyTeam(@Request() req) {
    return this.teamsService.findByCaptain(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, req.user, updateTeamDto);
  }

  @Post(':id/invite')
  async invitePlayer(@Param('id') id: string, @Request() req, @Body() playerData: any) {
    return this.teamsService.invitePlayer(id, req.user, playerData);
  }

  @Delete(':id/players/:playerId')
  async removePlayer(@Param('id') id: string, @Param('playerId') playerId: string, @Request() req) {
    return this.teamsService.removePlayer(id, req.user, playerId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.teamsService.delete(id, req.user);
  }
}
