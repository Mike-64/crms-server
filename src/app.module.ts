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
import { Oid4vcController } from './oid4vc/oid4vc.controller';
import { Oid4vcModule } from './oid4vc/oid4vc.module';
import { Oid4vcService } from "./oid4vc/oid4vc.service";

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
    Oid4vcModule,
  ],
  controllers: [AppController, Oid4vcController],
  providers: [AppService, Oid4vcService],
})
export class AppModule {}
