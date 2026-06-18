import { DropRepository } from '@modules/drop/repositories/drop.repository';
import { DropMapper } from '@modules/drop/mappers/drop.mapper';
import { NotFoundException } from '@exceptions/index';
import type { DropDto, CreateDropDto } from '@contracts/dto';

export class DropService {
  private dropRepository: DropRepository;

  constructor() {
    this.dropRepository = new DropRepository();
  }

  async getAll(): Promise<DropDto[]> {
    const drops = await this.dropRepository.findAll();
    return drops.map(DropMapper.toDto);
  }

  async getById(id: string): Promise<DropDto> {
    const drop = await this.dropRepository.findById(id);
    if (!drop) throw new NotFoundException('Drop');
    return DropMapper.toDto(drop);
  }

  async create(dto: CreateDropDto): Promise<DropDto> {
    const drop = await this.dropRepository.create({
      name: dto.name,
      imageUrl: dto.imageUrl,
      totalStock: dto.totalStock,
      availableStock: dto.totalStock,
      startAt: new Date(dto.startAt),
    });
    return DropMapper.toDto(drop);
  }
}
