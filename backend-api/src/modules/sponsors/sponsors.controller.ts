import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';

@Controller('sponsors')
export class SponsorsController {
  constructor(private sponsorsService: SponsorsService) {}

  @Get()
  async findAll() {
    return this.sponsorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sponsorsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSponsorDto: CreateSponsorDto) {
    return this.sponsorsService.create(createSponsorDto);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  async apply(@Request() req, @Body() applicationData: any) {
    return this.sponsorsService.apply(req.user.id, applicationData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateSponsorDto: UpdateSponsorDto) {
    return this.sponsorsService.update(id, updateSponsorDto);
  }
}
