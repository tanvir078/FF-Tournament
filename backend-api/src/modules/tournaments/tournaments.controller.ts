import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';
import { TournamentStatus, TournamentStage } from './entities/tournament.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tournaments')
export class TournamentsController {
  constructor(private tournamentsService: TournamentsService) {}

  @Get()
  async findAll() {
    return this.tournamentsService.findAll();
  }

  @Get('featured')
  async getFeatured() {
    return this.tournamentsService.getFeaturedTournaments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Get(':id/registration-status')
  @UseGuards(JwtAuthGuard)
  async getRegistrationStatus(@Param('id') id: string, @Request() req) {
    return this.tournamentsService.getRegistrationStatus(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async create(@Request() req, @Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create({
      ...createTournamentDto,
      organizerId: req.user.id,
    });
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('screenshot'))
  async join(
    @Param('id') id: string,
    @Request() req,
    @Body() body: any,
    @UploadedFile() screenshot?: Express.Multer.File
  ) {
    return this.tournamentsService.joinTournament(id, req.user.id, body, screenshot);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async register(@Param('id') id: string, @Request() req) {
    return this.tournamentsService.register(id, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async update(@Param('id') id: string, @Request() req, @Body() updateTournamentDto: UpdateTournamentDto) {
    return this.tournamentsService.update(id, req.user, updateTournamentDto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Request() req, @Body('status') status: TournamentStatus) {
    return this.tournamentsService.updateStatus(id, req.user, status);
  }

  @Put(':id/stage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  async updateStage(@Param('id') id: string, @Request() req, @Body('stage') stage: TournamentStage) {
    return this.tournamentsService.updateStage(id, req.user, stage);
  }
}
