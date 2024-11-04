import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProofsService } from './proofs.service';
import { ApiCreatedResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { API_VERSION } from 'src/constants';
import { ProofExchangeRecord } from '@credo-ts/core';

@ApiTags(`Proofs`)
@Controller(`${API_VERSION}/proofs`)
export class ProofsController {
  constructor(private readonly proofsService: ProofsService) {}

  @Post("send-proof-request")
  @ApiOperation({summary:"Send a Proof Request to connectionId"})
  @ApiOperation({summary:"Create Proof Request"})
  @ApiCreatedResponse({description:"Proof Request Sent successfully"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async sendProofRequest(@Query('agentName') agentName:string){
    return await this.proofsService.sendProofRequest(agentName)
  }
  
  @Post('accept-proof-request')
  @ApiOperation({summary:"Accept Proof Request"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async acceptProofRequest(@Body() proofExchangeRecord:ProofExchangeRecord,@Query('agentName') agentName:string){
    return await this.proofsService.acceptProofRequest(proofExchangeRecord,agentName)
  }
  
  @Get("get-verified-connections")
  @ApiOperation({summary:"Get All proofs by connectionId"})
  verifyApplicant(@Query("Agent Name") agentName:string,@Query("ConnectionId") connectionId:string) {
    return this.proofsService.verifyConnections(agentName,connectionId);
  }

  @Get('find-all-proofs')
  @ApiOperation({summary:"Get All proofs by agent"})
  findAll(@Query("Agent Name") agentName:string) {
    return this.proofsService.findAll(agentName);
  }

}
