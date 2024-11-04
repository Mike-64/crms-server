import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Agent, AttachmentData, AutoAcceptProof, JsonObject, ProofEventTypes, ProofExchangeRecord, ProofRole, ProofState, ProofStateChangedEvent, V2PresentationMessage } from '@credo-ts/core';
import { CredoService } from 'src/credo/credo.service';
import { log } from 'console';
import { isObject } from 'lodash';
import { GenericRecord } from '@credo-ts/core/build/modules/generic-records/repository/GenericRecord';

@Injectable()
export class ProofsService {
  private readonly logger = new Logger(ProofsService.name);

  constructor(private readonly credoService:CredoService){}


  async verifyConnections(agentName:string,connectionId:string) {
    const agent = this.credoService.getAgentByName(agentName);
    const proofRecords:ProofExchangeRecord[]= await agent!.proofs.findAllByQuery({connectionId:connectionId,state:ProofState.Done});
    const presentationMessage = await agent?.proofs.findPresentationMessage(proofRecords.at(0)!.id);
    const presentationAttachment:any = presentationMessage!.presentationAttachments.at(0)!.getDataAsJson();
    let data = presentationAttachment.requested_proof.revealed_attrs;
    const applicants = new Map<string,any>();
    const rawValues: Record<string, string> = {}
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        rawValues[key] = data[key].raw;
      }
    }
    applicants.set(connectionId,rawValues);
    console.log(applicants)
    return applicants;
  }

  async findAll(agentName:string) {
    const agent = this.credoService.getAgentByName(agentName);
    return await agent?.proofs.findAllByQuery({});
  }

  private async newProofAttribute(agentName:string) {
    const agent = this.credoService.getAgentByName(agentName);
    const proofAttribute = {
      name: {
        name: 'Name',
        restrictions: [
          { 
            cred_def_id: this.credoService.credentialDefinition?.credentialDefinitionId,
          },
        ],
      },
    }

    return proofAttribute
  }

  public async sendProofRequest(agentName:string) {
    const agent = await this.credoService.getAgentByName(agentName);
    const connectionRecord = await agent?.connections.findAllByOutOfBandId(this.credoService.outOfBandId!);
    const proofAttribute = await this.newProofAttribute(agentName)

    const proofExchangeRecord = await agent!.proofs.requestProof({
      protocolVersion: 'v2',
      connectionId: connectionRecord!.at(0)!.id,
      proofFormats: {
        anoncreds: {
          name: 'proof-request',
          version: '1.0',
          requested_attributes: proofAttribute,
        },
      },
    })
    
    return proofExchangeRecord
  }

  public async acceptProofRequest(proofRecord: ProofExchangeRecord, agentName:string) {

    const agent = this.credoService.getAgentByName(agentName);
    console.log(await agent!.credentials.getAll())
    const requestedCredentials = await agent!.proofs.selectCredentialsForRequest({
      proofRecordId: proofRecord.id,
    })

    await agent!.proofs.acceptRequest({
      proofRecordId: proofRecord.id,
      proofFormats: requestedCredentials.proofFormats,
    })
    console.log('\nProof request accepted!\n')
  }

}
