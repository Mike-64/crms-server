import { Controller, Get } from '@nestjs/common';
import { ParserService } from './parser.service';
import { API_VERSION } from 'src/constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Parser')
@Controller(`${API_VERSION}/parser`)
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Get()
  getInfo(): string {
    return this.parserService.getInfo();
  }
}
