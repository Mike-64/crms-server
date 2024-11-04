import { Module } from '@nestjs/common';
import { ProofsService } from './proofs.service';
import { ProofsController } from './proofs.controller';
import { CredoModule } from 'src/credo/credo.module';
import { CredoService } from 'src/credo/credo.service';
import { QrcodeService } from 'src/qrcode/qrcode.service';
import { ParserService } from 'src/parser/parser.service';

@Module({
  controllers: [ProofsController],
  imports:[CredoModule],
  providers: [ProofsService,QrcodeService],
  exports: [ProofsService]
})
export class ProofsModule {}
