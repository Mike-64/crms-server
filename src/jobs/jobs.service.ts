import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRepository } from './entities/jobs.repository';
import { Job } from './entities/job.entity';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobRepository: JobRepository,
  ){}

  async create(createJobDto: CreateJobDto) {
    const job = new Job();
    job.company_name = createJobDto.companyName;
    job.date = createJobDto.date;
    job.job_title = createJobDto.jobTitle;
    job.job_posting = createJobDto.jobPosting;
    return await this.jobRepository.save(job)
  }

  async findAll() {
    return await this.jobRepository.find();
  }

  async findOne(title: string) {
    return await this.jobRepository.findOneBy({job_title:title});
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  async remove(companyName: string,title:string) {
    return await this.jobRepository.delete({company_name:companyName,job_title:title});
  }
}
