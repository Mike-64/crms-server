import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { CredoModule } from 'src/credo/credo.module';
import { ParserService } from 'src/parser/parser.service';
import { TemplatesRepository } from 'src/tables/templates.repository';

@Module({
  imports:[CredoModule],
  controllers: [CredentialController],
  providers: [CredentialService],
  exports:[CredentialService]
})
export class CredentialModule {}
