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

  /**
   * Issue credential.
   */
  @ApiTags("Credentials")
  @Post('issue-Credential')
  @ApiOperation({summary:"Issue Anon-Cred Credentials"})
  @ApiCreatedResponse({description:"Credential Sent successfully"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async issueCredentials(@Body() issueCredentialDto:IssueCredentialDto, @Query('agentName') agentName:string){
    const{connectionId, credentialDefinitionId, attributes} = issueCredentialDto;
    const credentialExchangeRecord = this.credoService.issueCredential(connectionId,credentialDefinitionId,attributes,agentName)
    return credentialExchangeRecord;
  }
  
  @ApiTags("Credentials")
  @Post('accept-credential-offer')
  @ApiOperation({summary:"Accept Anon-Cred Credentials"})
  @ApiCreatedResponse({description:"Credential accepted successfully"})
  async acceptCredentials(@Body() credentialExchangeRecord:CredentialExchangeRecord, @Query('agentName') agentName:string){
    await this.credoService.acceptCredentialOffer(credentialExchangeRecord, agentName)
  }

  @ApiTags("Verification")
  @Post('send-proof-request')
  @ApiOperation({summary:"Create Proof Request"})
  @ApiCreatedResponse({description:"Proof Request Sent successfully"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async sendProofRequest(@Query('agentName') agentName:string){
    await this.credoService.sendProofRequest(agentName)
    return "Proof Request Sent"
  }
  
  @ApiTags("Verification")
  @Post('accept-proof-request')
  @ApiOperation({summary:"Accept Proof Request"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async acceptProofRequest(@Body() proofExchangeRecord:ProofExchangeRecord,@Query('agentName') agentName:string){
    await this.credoService.acceptProofRequest(proofExchangeRecord,agentName)
    return "Proof Request Accepted"
  }
  
}
