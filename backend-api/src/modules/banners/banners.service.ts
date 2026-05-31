import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto) {
    const banner = this.bannerRepository.create(createBannerDto);
    return this.bannerRepository.save(banner);
  }

  async findAll() {
    return this.bannerRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findActive() {
    const now = new Date();
    return this.bannerRepository.find({
      where: {
        isActive: true,
      },
      order: { order: 'ASC' },
    });
  }

  async findFeatured() {
    return this.bannerRepository.find({
      where: {
        isActive: true,
        isFeatured: true,
      },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string) {
    return this.bannerRepository.findOne({ where: { id } });
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    await this.bannerRepository.update(id, updateBannerDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const banner = await this.findOne(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    await this.bannerRepository.delete(id);
    return { message: 'Banner deleted successfully' };
  }

  async updateOrder(id: string, order: number) {
    await this.bannerRepository.update(id, { order });
    return this.findOne(id);
  }

  async toggleActive(id: string) {
    const banner = await this.findOne(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    await this.bannerRepository.update(id, { isActive: !banner.isActive });
    return this.findOne(id);
  }
}
