import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { CredoModule } from 'src/credo/credo.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [OperationsController],
  providers: [OperationsService],
  imports: [CredoModule, ConfigModule],
})
export class OperationsModule {}
