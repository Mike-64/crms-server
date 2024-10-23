import { Injectable, Logger } from '@nestjs/common';
import {
  Agent,
  HttpOutboundTransport,
  WsOutboundTransport,
  InitConfig,
  OutOfBandRecord,
  ConnectionStateChangedEvent,
  ConnectionEventTypes,
  DidExchangeState,
  ConnectionsModule,
  DidsModule,
  CredentialsModule,
  V2CredentialProtocol,
  CredentialStateChangedEvent,
  CredentialEventTypes,
  CredentialState,
  ConsoleLogger,
  LogLevel,
  ConnectionRecord,
} from '@credo-ts/core';
import { HttpInboundTransport, agentDependencies } from '@credo-ts/node';
import { AskarModule } from '@credo-ts/askar';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';
import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidRegistrar,
  IndyVdrIndyDidResolver,
  IndyVdrModule,
} from '@credo-ts/indy-vdr';
import { indyVdr } from '@hyperledger/indy-vdr-nodejs';
import ledgers from '../config/ledgers/indy/index';
import { QrcodeService } from 'src/qrcode/qrcode.service';
import type { IndyVdrPoolConfig } from '@credo-ts/indy-vdr';
import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  LegacyIndyCredentialFormatService,
} from '@credo-ts/anoncreds';
import { anoncreds } from '@hyperledger/anoncreds-nodejs';
import {
  DrpcModule,
  DrpcRecord,
  DrpcRequestEventTypes,
  DrpcRequestStateChangedEvent,
} from '@credo-ts/drpc';
import type { DrpcRequest } from '@credo-ts/drpc';
import { Workflow } from "./workflow";
import { ParserService } from 'src/parser/parser.service';

@Injectable()
export class CredoService {
  private readonly logger = new Logger(CredoService.name);
  public agent: Agent;
  private config: InitConfig;
  private agents: Map<string, Agent> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private instances: Map<string, string> = new Map(); // map instanceId to workflowId

  constructor(
    private readonly qrCodeService: QrcodeService,
    private readonly parserService: ParserService
  ) {}

  async createAgent(name: string, endpoint: string, port: number) {
    if (this.agents.has(name)) {
      this.logger.log(`Agent ${name} is already initialized on port ${port}`);
      return this.agents.get(name);
    }

    // Agent configuration
    this.config = {
      label: name,
      walletConfig: {
        id: name,
        key: name,
      },
      endpoints: [`${endpoint}:${port}`],
      logger: new ConsoleLogger(LogLevel.info),
    };

    this.agent = new Agent({
      config: this.config,
      dependencies: agentDependencies,
      modules: {
        // Register the indyVdr module on the agent
        indyVdr: new IndyVdrModule({
          indyVdr,
          networks: ledgers as [IndyVdrPoolConfig],
        }),

        // Register the Askar module on the agent
        askar: new AskarModule({
          ariesAskar,
        }),

        connections: new ConnectionsModule({ autoAcceptConnections: true }),

        anoncreds: new AnonCredsModule({
          registries: [new IndyVdrAnonCredsRegistry()],
          anoncreds,
        }),

        dids: new DidsModule({
          registrars: [new IndyVdrIndyDidRegistrar()],
          resolvers: [new IndyVdrIndyDidResolver()],
        }),

        // to issue a credential
        credentials: new CredentialsModule({
          credentialProtocols: [
            new V2CredentialProtocol({
              credentialFormats: [
                new LegacyIndyCredentialFormatService(),
                new AnonCredsCredentialFormatService(),
              ],
            }),
          ],
        }),

        drpc: new DrpcModule(),
      },
    });

    // Register a simple `WebSocket` outbound transport
    this.agent.registerOutboundTransport(new WsOutboundTransport());
    // Register a simple `Http` outbound transport
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
    // Register a simple `Http` inbound transport
    this.agent.registerInboundTransport(
      new HttpInboundTransport({ port: port }),
    );

    // Initialize the agent
    try {
      await this.agent.initialize();
      this.agents.set(name, this.agent);
      this.logger.log(
        `Agent ${name} initialized on endpoint ${endpoint}:${port}`,
      );
    } catch (e) {
      this.logger.error(
        `Something went wrong while setting up the agent! Message: ${e}`,
      );
      throw e;
    }
    return this.agent;
  }

  // This method will create an invitation using the legacy method according to 0160: Connection Protocol.
  async createLegacyInvitation(agentName: string) {
    const agent: Agent | undefined = this.getAgentByName(agentName);
    if (agent) {
      this.logger.log(`Creating legacy invitation for agent: ${agentName}`);
      try {
        // Creating a Legacy Invitation
        const { invitation } = await agent.oob.createLegacyInvitation();
        const invitationUrl = invitation.toUrl({
          domain: agent.config?.endpoints[0] ?? 'https://example.org',
        });
        this.logger.log(`Legacy Invitation link created: ${invitationUrl}`);
        return { invitationUrl };
      } catch (error) {
        this.logger.error(`Error creating legacy invitation: ${error}`);
        throw error;
      }
    } else {
      this.logger.error(`Agent ${agentName} not found`);
    }
  }

  // This method will create an invitation using the legacy method according to 0434: Out-of-Band Protocol 1.1.
  async createNewInvitation(agentName: string): Promise<string> {
    const agent: Agent | undefined = this.getAgentByName(agentName);
    if (agent) {
      this.logger.log(`Creating new invitation for agent: ${agentName}`);
      try {
        const outOfBandRecord = await agent.oob.createInvitation();
        const invitationUrl = outOfBandRecord.outOfBandInvitation.toUrl({
          domain: agent.config?.endpoints[0] ?? 'https://example.org',
        });
        //const invitationUrlQRcode =
        //  await this.qrCodeService.generateQrCode(invitationUrl);
        this.logger.log(`New Invitation link created: ${invitationUrl}`);
        // Listener
        this.setupConnectionListener(agent, outOfBandRecord, () => {});
        return invitationUrl;
      } catch (error) {
        this.logger.error(`Error creating new invitation: ${error}`);
        throw error;
      }
    } else {
      this.logger.error(`Agent ${agentName} not found`);
      return "Error";
    }

  }

  async receiveInvitation(agentName: string, invitationUrl: string) {
    const agent: Agent | undefined = this.getAgentByName(agentName);
    if (agent) {
      try {
        const { outOfBandRecord } =
          await agent.oob.receiveInvitationFromUrl(invitationUrl);
        this.logger.log(`Received invitation for agent ${agentName}`);
        this.logger.log(
          `OutOfBandRecord received: ${JSON.stringify(outOfBandRecord)}`,
        );
        // Setup listener
        this.setupConnectionListener(agent, outOfBandRecord, () => {});
      } catch (error) {
        this.logger.error(
          `Error receiving invitation for agent ${agentName}: ${error}`,
        );
        throw error;
      }
    } else {
      this.logger.error(`Agent ${agentName} not found`);
    }
  }

  setupConnectionListener(
    agent: Agent,
    outOfBandRecord: OutOfBandRecord,
    cb: (...args: any) => void,
  ) {
    agent.events.on<ConnectionStateChangedEvent>(
      ConnectionEventTypes.ConnectionStateChanged,
      ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return;
        if (payload.connectionRecord.state === DidExchangeState.Completed) {
          // the connection is now ready for usage in other protocols!
          this.logger.log(
            `Connection for out-of-band id ${outOfBandRecord.id} completed.`,
          );

          // Custom business logic can be included here
          // In this example we can send a basic message to the connection, but
          // anything is possible
          cb();

          // Set up credential listener
          console.log('setupCredentialListener');
          this.setupCredentialListener(agent);
          console.log('setupDRPCListener for agent:', agent.config.label);
          this.setupDRPCListener(agent, payload.connectionRecord);
          // This would be the normal behaviour for an Issuer.  Only looking for Agent name for testing Alice/Faber
          if(agent.config.label==='Faber') {
            // Send initial workflows list
            console.log("Sending from agent:", agent.config.label);
            this.sendDRPCWorkflows(agent, payload.connectionRecord);
          }
          // We exit the flow
          // process.exit(0);
        }
      },
    );
  }

  getAgentByName(name: string) {
    return this.agents.get(name);
  }

  getOutOfBandRecordById(id: string): Promise<OutOfBandRecord | null> {
    return this.agent.oob.findById(id);
  }

  async issueCredential(
    connectionId: string,
    credentialDefinitionId: string,
    attributes: any,
  ) {
    const [connectionRecord] =
      await this.agent.connections.findAllByOutOfBandId(connectionId);

    if (!connectionRecord) {
      throw new Error(
        `ConnectionRecord: record with id ${connectionId} not found.`,
      );
    }

    console.log(attributes, 'attributesattributesattributes');
    const credentialExchangeRecord =
      await this.agent.credentials.offerCredential({
        connectionId: connectionRecord.id,
        credentialFormats: {
          anoncreds: {
            credentialDefinitionId,
            attributes,
          },
        },
        protocolVersion: 'v2' as never,
      });

    return credentialExchangeRecord;
  }

  setupCredentialListener(agent: Agent) {
    agent.events.on<CredentialStateChangedEvent>(
      CredentialEventTypes.CredentialStateChanged,
      async ({ payload }) => {
        this.logger.log(
          `Credential state changed: ${payload.credentialRecord.id}, state: ${payload.credentialRecord.state}`,
        );

        switch (payload.credentialRecord.state) {
          case CredentialState.OfferSent:
            this.logger.log(`Credential offer sent to holder.`);
            break;
          case CredentialState.RequestReceived:
            this.logger.log(`Credential request received from holder.`);
            // Automatically respond to credential request if desired
            await this.agent.credentials.acceptRequest({
              credentialRecordId: payload.credentialRecord.id,
            });
            break;
          case CredentialState.CredentialIssued: // Adjusted to match your enum
            this.logger.log(`Credential issued to holder.`);
            // Handle the issuance process or update state as necessary
            break;
          case CredentialState.Done:
            this.logger.log(
              `Credential ${payload.credentialRecord.id} is accepted by the wallet`,
            );
            // Add your custom business logic here, e.g., updating your database or notifying a service
            break;
          case CredentialState.Declined:
            this.logger.log(
              `Credential ${payload.credentialRecord.id} is rejected by the wallet`,
            );
            // Handle rejection if needed
            break;
          default:
            this.logger.log(
              `Unhandled credential state: ${payload.credentialRecord.state}`,
            );
        }
      },
    );
  }

  setupDRPCListener(agent: Agent, connectionRecord: ConnectionRecord) {
    agent.events.on(
      DrpcRequestEventTypes.DrpcRequestStateChanged,
      async ({ payload }: DrpcRequestStateChangedEvent) => {
        // send back a request for the default workflow to start
        const record: DrpcRecord = payload.drpcMessageRecord;
        const request: any = record.request;
        const method: string = request.method;
        console.log('\nReceived DRPC call on agent', agent.config.label, " role:", payload.drpcMessageRecord.role, " method:", method);
        switch (method) {
          case 'workflow_connection':
            if(payload.drpcMessageRecord.role==='server') {
              console.log("* Received workflow_connection");
              // Received list of workflows
              // Add to workflows
              console.log("** Save workflow");
              this.workflows.set(connectionRecord.id, request.params);
              // Request the default
              console.log("*** Send workflow request");
              this.sendDRPCRequestWorkflow(agent, connectionRecord, request.params.default_workflowid);
            }
            else {
              console.log("## client workflow_connection ", agent.config.label);
            }
            break;
          case 'workflow_request':
            if(payload.drpcMessageRecord.role==='client') {
              console.log("* Received worflow_request");
              // Workflow request with action
              // Parser and return display
              console.log("** Parse workflow");
              const displayData = await this.parserService.parse(request.params.workflowid, connectionRecord.id, request.params.instanceId, '00000000-0000-0000-0000-000000000000', {});
              console.log("*** Send workflow response");
              await this.sendDRPCResponseWorkflow(agent, connectionRecord, request.params.workflowid, request.params.instanceId, displayData);
            }
            else {
              console.log("## server workflow_request ", agent.config.label);
            }
            break;
          case 'workflow_response':
            if(payload.drpcMessageRecord.role==='client') {
              console.log("Received workflow_response");
              // Response to request with display
              // Render to display
              console.log("Workflow response display is:", request?.params?.displaydata);
            }
            else {
              console.log("## client workflow_response ", agent.config.label);
            }
            break;
          default:
            console.log('\nNohandler for call ', agent.config.label, " role:", payload.drpcMessageRecord.role, " method:", method);
        }
      },
    );
  }

  async sendDRPCResponseWorkflow(agent: Agent, connectionRecord: ConnectionRecord, workflowId: string, instanceId: string, displayData: any) {
    // Send back parsed workflow display
    await agent.modules.drpc.sendRequest(connectionRecord.id, {
      jsonrpc: '2.0',
      method: 'workflow_response',
      id: '',
      params: {
        version: '1.0',
        workflowid: workflowId,
        instance: instanceId,
        displaydata: displayData
      },
    });
  }

  async sendDRPCRequestWorkflow(agent: Agent, connectionRecord: ConnectionRecord, workflowId: string, instanceId?: string, actionId?: string, actionParams?: any) {
    // First request has no instance yet
    if (typeof instanceId !== 'undefined') {
      instanceId = '';
    }
    if (typeof actionId !== 'undefined') {
      actionId = '';
    }
    if (typeof actionParams !== 'undefined') {
      actionParams = {}
    }
    await agent.modules.drpc.sendRequest(connectionRecord.id, {
      jsonrpc: '2.0',
      method: 'workflow_request',
      id: '',
      params: {
        version: '1.0',
        workflowid: workflowId,
        instance: instanceId,
        actionId: actionId
      },
    });
  }

  async sendDRPCWorkflows(agent: Agent, connectionRecord: ConnectionRecord) {
    // Send a request to the specified connection
    console.log("Sending initial DRPC from agent:", agent.config.label);
    await agent.modules.drpc.sendRequest(connectionRecord.id, {
      jsonrpc: '2.0',
      method: 'workflow_connection',
      id: '',
      params: {
        version: '1.0',
        default_workflowid: '00000000-0000-0000-0000-000000000000',
        workflows: [
          {
            workflowid: '00000000-0000-0000-0000-000000000000',
            name: 'Weclome',
          },
        ],
      },
    });
    return 'called sendDRPC';
  }
}
