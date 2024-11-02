import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { CredoModule } from './credo/credo.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { MessageModule } from './message/message.module';
import { LedgerModule } from './ledger/ledger.module';
import { ConnectionsModule } from './connections/connections.module';
import { ParserModule } from './parser/parser.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Templates } from './tables/templates.entity';
import { Instance } from './tables/instance.entity';
import { Oid4vcController } from './oid4vc/oid4vc.controller';
import { Oid4vcModule } from './oid4vc/oid4vc.module';
import { Oid4vcService } from "./oid4vc/oid4vc.service";
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/entities/job.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperationsModule } from './operations/operations.module';

@Module({
  imports: [
    DbModule,
    CredoModule,
    QrcodeModule,
    MessageModule,
    LedgerModule,
    ConnectionsModule,
    ParserModule,
    Oid4vcModule,
    JobsModule,
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],      
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
          port: Number(configService.get<string>('DATABASE_PORT')),
          username: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASS'),
          database: configService.get<string>('DATABASE_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          type: 'postgres' as 'postgres',
          host: configService.get('DATABASE_HOST'),
          synchronize: true,
          logging: true,
      }),
    }),
    OperationsModule,
  ],
  controllers: [AppController, Oid4vcController],
  providers: [AppService, Oid4vcService],
})
export class AppModule {}
