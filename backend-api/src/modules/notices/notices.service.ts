import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice, NoticeType } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  async create(createNoticeDto: CreateNoticeDto) {
    const notice = this.noticeRepository.create(createNoticeDto);
    return this.noticeRepository.save(notice);
  }

  async findAll() {
    return this.noticeRepository.find({
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });
  }

  async findActive() {
    const now = new Date();
    return this.noticeRepository
      .createQueryBuilder('notice')
      .where('notice.isActive = :isActive', { isActive: true })
      .andWhere(
        '(notice.startDate IS NULL OR notice.startDate <= :now)',
        { now },
      )
      .andWhere(
        '(notice.endDate IS NULL OR notice.endDate >= :now)',
        { now },
      )
      .orderBy('notice.isPinned', 'DESC')
      .addOrderBy('notice.createdAt', 'DESC')
      .getMany();
  }

  async findByLocation(location: 'dashboard' | 'tournaments' | 'wallet') {
    const now = new Date();
    const columnMap = {
      dashboard: 'showOnDashboard',
      tournaments: 'showOnTournaments',
      wallet: 'showOnWallet',
    };

    return this.noticeRepository
      .createQueryBuilder('notice')
      .where(`notice.${columnMap[location]} = :show`, { show: true })
      .andWhere('notice.isActive = :isActive', { isActive: true })
      .andWhere(
        '(notice.startDate IS NULL OR notice.startDate <= :now)',
        { now },
      )
      .andWhere(
        '(notice.endDate IS NULL OR notice.endDate >= :now)',
        { now },
      )
      .orderBy('notice.isPinned', 'DESC')
      .addOrderBy('notice.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    return this.noticeRepository.findOne({ where: { id } });
  }

  async update(id: string, updateNoticeDto: UpdateNoticeDto) {
    await this.noticeRepository.update(id, updateNoticeDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const notice = await this.findOne(id);
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }
    await this.noticeRepository.delete(id);
    return { message: 'Notice deleted successfully' };
  }

  async toggleActive(id: string) {
    const notice = await this.findOne(id);
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }
    await this.noticeRepository.update(id, { isActive: !notice.isActive });
    return this.findOne(id);
  }

  async togglePin(id: string) {
    const notice = await this.findOne(id);
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }
    await this.noticeRepository.update(id, { isPinned: !notice.isPinned });
    return this.findOne(id);
  }
}
