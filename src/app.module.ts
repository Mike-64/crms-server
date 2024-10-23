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
import { TypeOrmModule } from '@nestjs/typeorm';
import { Templates } from './tables/templates.entity';
import { Instance } from './tables/instance.entity';

@Module({
  imports: [
    DbModule,
    CredoModule,
    QrcodeModule,
    MessageModule,
    LedgerModule,
    ConnectionsModule,
    ParserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '192.168.2.192',
      port: 5432,
      username: 'admin',
      password: 'root',
      entities: [Templates, Instance],
      database: 'veridid',
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
