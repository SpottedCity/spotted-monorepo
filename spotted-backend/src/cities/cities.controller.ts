import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get()
  async getCities() {
    return this.citiesService.getCities();
  }

  @Get('voivodeship/:voivodeship')
  async getCitiesByVoivodeship(@Param('voivodeship') voivodeship: string) {
    return this.citiesService.getCitiesByVoivodeship(voivodeship);
  }

  @Get(':id')
  async getCityById(@Param('id') id: string) {
    return this.citiesService.getCityById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCity(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.createCity(createCityDto);
  }
}