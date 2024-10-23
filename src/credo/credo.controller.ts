import { Controller, Logger, Get} from '@nestjs/common';
import { CredoService } from './credo.service';
import { ApiTags } from '@nestjs/swagger';
import { API_VERSION } from 'src/constants';

@Controller(`${API_VERSION}/credo`)
@ApiTags('Credo')
export class CredoController {
  private readonly logger = new Logger(CredoController.name);
  constructor(private readonly credoService: CredoService) {}

  @Get('agent-alice')
  createAgentAlice(): string {
    this.credoService.createAgent("Alice", "http://192.168.2.192", 9000);
    return 'Started agent';
  }

  @Get('agent-faber')
  createAgentFaber(): string {
    this.credoService.createAgent("Faber", "http://192.168.2.192", 9001);
    return 'Started agent';
  }
}
