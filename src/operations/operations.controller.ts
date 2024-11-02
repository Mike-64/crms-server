import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { CredoService } from '../credo/credo.service';
import { ApiCreatedResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { API_VERSION } from 'src/constants';
import { ConfigService } from '@nestjs/config';

@Controller(`${API_VERSION}/operations`)
export class OperationsController {
    private readonly logger = new Logger(OperationsController.name);
    constructor(private readonly credoService: CredoService, private configService: ConfigService) {}

    @ApiTags("Operations")
    @Get('agent-college')
    createAgentCollege(): string {
      this.credoService.createAgent(
        "College", 
        this.configService.get('AGENT_URL')!, 
        Number(this.configService.get('COLLEGE_AGENT')!), 
        Number(this.configService.get('COLLEGE_OID4VC')!), 
        Number(this.configService.get('COLLEGE_OIDC4VCLISTEN')!)
      );
      return 'Started agent';
    }
    
    @ApiTags("Operations")
    @Get('agent-futures')
    createAgentFutures(): string {
      this.credoService.createAgent(
        "Futures", 
        this.configService.get('AGENT_URL')!,        
        Number(this.configService.get('FUTURES_AGENT')!), 
        Number(this.configService.get('FUTURES_OID4VC')!), 
        Number(this.configService.get('FUTURES_OIDC4VCLISTEN')!)        
      );
      return 'Started agent';
    }

    @ApiTags("Operations")
    @Get('agent-bank')
    createAgentBank(): string {
      this.credoService.createAgent(
        "Bank", 
        this.configService.get('AGENT_URL')!,        
        Number(this.configService.get('BANK_AGENT')!), 
        Number(this.configService.get('BANK_OID4VC')!), 
        Number(this.configService.get('BANK_OIDC4VCLISTEN')!)  
      );
      return 'Started agent';
    }

}
