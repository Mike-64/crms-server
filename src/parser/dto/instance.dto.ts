import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class InstanceDto {
  /**
   * this decorator will help to auto generate id for the table.
   */
  @IsUUID()
  instanceId: string;

  @IsUUID()
  templateId: string;

  @IsUUID()
  connectionId: string;

  @IsUUID()
  stateId: string;

  @IsJSON()
  instanceJson: any;
}
