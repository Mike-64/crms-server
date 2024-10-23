import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instance } from './instance.entity';

export class InstanceRepository extends Repository<Instance> {
  constructor(
    @InjectRepository(Instance)
    private instanceRepository: Repository<Instance>,
  ) {
    super(
      instanceRepository.target,
      instanceRepository.manager,
      instanceRepository.queryRunner,
    );
  }
}
