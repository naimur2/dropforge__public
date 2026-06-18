import { DropRepository } from '@modules/drop/repositories/drop.repository';
import { DropMapper } from '@modules/drop/mappers/drop.mapper';
import { NotFoundException } from '@exceptions/index';
import type { DropDto, CreateDropDto } from '@contracts/dto';

export class DropService {
  private dropRepository: DropRepository;

  constructor() {
    this.dropRepository = new DropRepository();
  }

  async getAll(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const result = await this.dropRepository.findAll(query);
    return {
      data: result.data.map(DropMapper.toDto),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      }
    };
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

  async update(id: string, dto: Partial<CreateDropDto>): Promise<DropDto> {
    const existing = await this.dropRepository.findById(id);
    if (!existing) throw new NotFoundException('Drop');
    
    // Calculate new available stock if total stock changes
    let availableStock = existing.availableStock;
    if (dto.totalStock !== undefined) {
      const difference = dto.totalStock - existing.totalStock;
      availableStock = Math.max(0, existing.availableStock + difference);
    }

    const drop = await this.dropRepository.update(id, {
      name: dto.name,
      imageUrl: dto.imageUrl,
      totalStock: dto.totalStock,
      availableStock,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
    });
    return DropMapper.toDto(drop);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.dropRepository.findById(id);
    if (!existing) throw new NotFoundException('Drop');
    await this.dropRepository.delete(id);
  }
}
