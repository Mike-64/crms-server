import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ApiOperation,ApiCreatedResponse,ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { API_VERSION } from 'src/constants';

@ApiTags("Job Postings")
@Controller(`${API_VERSION}/jobs`)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  
  @ApiOperation({summary:"Create Job Postings"})
  @ApiCreatedResponse({description:"Job Posting Created Successfully"})
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @ApiOperation({summary:"Get all Job Postings"})
  @ApiOkResponse({description:"Job Postings Fetched Successfully"})
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @ApiOperation({summary:"Get Job Postings by Title"})
  @ApiOkResponse({description:"Job Posting Fetched Successfully"})
  @Get(':title')
  findOne(@Param('title') title: string) {
    return this.jobsService.findOne(title);
  }

  @ApiOperation({summary:"Delete Job Postings"})
  @ApiOkResponse({description:"Job Posting Deleted Successfully"})
  @Delete()
  remove(@Query('CompanyName') companyName: string,@Query('Title') title: string ) {
    return this.jobsService.remove(companyName,title);
  }
}
