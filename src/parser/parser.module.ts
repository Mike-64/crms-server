import { Module } from '@nestjs/common';
import { ParserController } from './parser.controller';
import { ParserService } from './parser.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Templates } from '../tables/templates.entity';
import { Instance } from '../tables/instance.entity';
import { TemplatesRepository } from '../tables/templates.repository';
import { InstanceRepository } from '../tables/instance.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Templates]),
    TypeOrmModule.forFeature([Instance]),
  ],
  controllers: [ParserController],
  providers: [ParserService, TemplatesRepository, InstanceRepository],
  exports: [ParserService, TemplatesRepository, InstanceRepository],
})
export class ParserModule {}
