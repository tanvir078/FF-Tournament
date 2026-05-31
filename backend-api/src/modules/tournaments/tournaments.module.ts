import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { Tournament } from './entities/tournament.entity';
import { TournamentRegistration } from './entities/tournament-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, TournamentRegistration])],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}
