import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private sponsorRepository: Repository<Sponsor>,
  ) {}

  async create(createSponsorDto: CreateSponsorDto) {
    const sponsor = this.sponsorRepository.create(createSponsorDto);
    return this.sponsorRepository.save(sponsor);
  }

  async findAll() {
    return this.sponsorRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    return this.sponsorRepository.findOne({ where: { id } });
  }

  async update(id: string, updateSponsorDto: UpdateSponsorDto) {
    await this.sponsorRepository.update(id, updateSponsorDto);
    return this.findOne(id);
  }

  async apply(userId: string, applicationData: any) {
    // Create a sponsor application record
    const application = this.sponsorRepository.create({
      ...applicationData,
      userId,
      status: 'PENDING',
      isActive: false,
    });
    return this.sponsorRepository.save(application);
  }
}
