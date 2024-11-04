import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { API_VERSION } from 'src/constants';
import { CredentialExchangeRecord } from '@credo-ts/core';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiQuery } from '@nestjs/swagger';
import { IssueCredentialDto } from 'src/credo/dto/credo.dto';

@ApiTags("Credentials")
@Controller(`${API_VERSION}/credential`)
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post('issue-Credential')
  @ApiOperation({summary:"Issue Anon-Cred Credentials"})
  @ApiCreatedResponse({description:"Credential Sent successfully"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async issueCredentials(@Body() issueCredentialDto:IssueCredentialDto, @Query('agentName') agentName:string){
    const{connectionId, credentialDefinitionId, attributes} = issueCredentialDto;
    const credentialExchangeRecord = this.credentialService.issueCredential(connectionId,credentialDefinitionId,attributes,agentName)
    return credentialExchangeRecord;
  }
  
  @Post('accept-credential-offer')
  @ApiOperation({summary:"Accept Anon-Cred Credentials"})
  @ApiCreatedResponse({description:"Credential accepted successfully"})
  async acceptCredentials(@Body() credentialExchangeRecord:CredentialExchangeRecord, @Query('agentName') agentName:string){
    await this.credentialService.acceptCredentialOffer(credentialExchangeRecord, agentName)
  }
  @Get("find-all-crednetials")
  findAll(@Query("Agent Name") agentName:string) {
    return this.credentialService.findAll(agentName);
  }

}
