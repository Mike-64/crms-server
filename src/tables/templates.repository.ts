import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Templates } from './templates.entity.js';

export class TemplatesRepository extends Repository<Templates> {
  constructor(
    @InjectRepository(Templates)
    private templateRepository: Repository<Templates>,
  ) {
    super(
      templateRepository.target,
      templateRepository.manager,
      templateRepository.queryRunner,
    );
  }
}
