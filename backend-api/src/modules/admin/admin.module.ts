import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Team } from '../teams/entities/team.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction } from '../wallet/entities/wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tournament, Team, Wallet, Transaction]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
