import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobRepository } from './entities/jobs.repository';

@Module({
  imports:[
    TypeOrmModule.forFeature([Job])
  ],
  controllers: [JobsController],
  providers: [JobsService,JobRepository],
  exports:[JobsService, JobRepository]
})
export class JobsModule {}
