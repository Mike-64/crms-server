import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { CredoService } from './credo.service';
import { ApiCreatedResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { API_VERSION } from 'src/constants';
import { CreateAgentDto, IssueCredentialDto } from './dto/credo.dto';
import { CredentialExchangeRecord, ProofExchangeRecord} from '@credo-ts/core';

@Controller(`${API_VERSION}/credo`)

export class CredoController {
  private readonly logger = new Logger(CredoController.name);
  constructor(private readonly credoService: CredoService) {}
 
  // @ApiTags("Agent")
  // @Post('Initialize')
  // async startAgent(@Body() createAgentDto: CreateAgentDto): Promise<string> {
  //   await this.credoService.createAgent(
  //     createAgentDto.name,
  //     createAgentDto.endpoint,
  //     createAgentDto.port,
  //     createAgentDto.oid4vcPort,
  //     createAgentDto.oid4vcListen
  //   )
  //   this.agentId = createAgentDto.name;
  //   return 'Agent started';
  //   // startAgent(createAgentDto);
  // }

  @Post('Initialize')
  async startHolder(@Body() createAgentDto: CreateAgentDto): Promise<string> {
    await this.credoService.createAgent(
      createAgentDto.name,
      createAgentDto.endpoint,
      9005,
      8005,
      5005
    )
    return 'Agent started';
  }
  

 
}
