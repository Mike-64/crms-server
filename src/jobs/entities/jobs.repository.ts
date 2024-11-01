import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';

export class JobRepository extends Repository<Job> {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {
    super(
      jobRepository.target,
      jobRepository.manager,
      jobRepository.queryRunner,
    );
  }
}