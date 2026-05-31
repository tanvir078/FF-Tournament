import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'phone', 'role', 'uid', 'ign', 'avatar', 'isVerified', 'isBanned', 'stats', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'phone', 'role', 'uid', 'ign', 'avatar', 'isVerified', 'isBanned', 'stats', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async banUser(id: string, reason: string) {
    await this.userRepository.update(id, { isBanned: true, banReason: reason });
    return this.findOne(id);
  }

  async unbanUser(id: string) {
    await this.userRepository.update(id, { isBanned: false, banReason: null });
    return this.findOne(id);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.userRepository.update(id, {
      password: await bcrypt.hash(newPassword, 10),
    });
    return { message: 'Password changed successfully' };
  }

  async updateStats(id: string, stats: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.stats = { ...user.stats, ...stats };
      await this.userRepository.save(user);
    }
    return this.findOne(id);
  }
}
