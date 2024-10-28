import { Body, Controller, Post } from "@nestjs/common";
import { Oid4vcService } from "./oid4vc.service";
import { API_VERSION } from "src/constants";
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from "@nestjs/swagger";

@Controller(`${API_VERSION}/oid4vc`)
export class Oid4vcController {
  constructor(
    private readonly oid4vcService: Oid4vcService,
  ) {}

  @ApiTags("OID4VC")
  @ApiOperation({ summary: 'Create New Credential Offer' })
  @ApiCreatedResponse({ description: 'Successfully offered Credential' })
  @Post("create-offer-oid4vc")
  async createCredentialOffer(
    @Body() offerdCredentials: string[]
  ): Promise<any> {
    return await this.oid4vcService.createOIDCredentialOffer(offerdCredentials);
  }

  // requestAndStoreCredentials
  @ApiTags("OID4VC")
  @ApiOperation({ summary: 'Resolve Credential Offer' })
  @Post("resolve-credentials-oid4vc")
  async resolveCredentials(@Body() credentialsString: string): Promise<any> {
    return await this.oid4vcService.resolveOIDCredentialOffer(
      credentialsString
    );
  }
}
