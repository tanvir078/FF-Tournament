import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorsService } from './sponsors.service';
import { SponsorsController } from './sponsors.controller';
import { Sponsor } from './entities/sponsor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor])],
  controllers: [SponsorsController],
  providers: [SponsorsService],
  exports: [SponsorsService],
})
export class SponsorsModule {}
