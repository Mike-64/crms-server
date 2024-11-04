import { Injectable, Logger } from '@nestjs/common';
import { CredentialExchangeRecord, CredentialStateChangedEvent, CredentialEventTypes, CredentialState, AutoAcceptCredential, Agent } from '@credo-ts/core';
import { CredoService } from 'src/credo/credo.service';

@Injectable()
export class CredentialService {

  private readonly logger = new Logger(CredentialService.name);

  constructor(private readonly credoService: CredoService) {}

  async findAll(agentName:string) {
    return await this.credoService.getAgentByName(agentName)?.credentials.getAll();
  }

  async issueCredential(
    connectionId: string,
    credentialDefinitionId: string,
    attributes: any,
    agentName:string
  ) {
    const agent = this.credoService.getAgentByName(agentName);
    const [connectionRecord] =
      await agent!.connections.findAllByOutOfBandId(connectionId);

    if (!connectionRecord) {
      throw new Error(
        `ConnectionRecord: record with id ${connectionId} not found.`
      );
    }

    console.log(attributes, "attributesattributesattributes");
    const credentialExchangeRecord =
      await agent!.credentials.offerCredential({
        connectionId: connectionRecord.id,
        credentialFormats: {
          anoncreds: {
            credentialDefinitionId,
            attributes,
          },
        },
        protocolVersion: "v2" as never,
      });

    return credentialExchangeRecord;
  }

  public async acceptCredentialOffer(credentialRecord: CredentialExchangeRecord, agentName:string) {
    const agent = this.credoService.getAgentByName(agentName)
    await agent!.credentials.acceptOffer({
      credentialRecordId: credentialRecord.id,
    })
  }
  
}
