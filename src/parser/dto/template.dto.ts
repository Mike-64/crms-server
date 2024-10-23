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

export class TemplateDto {
  /**
   * this decorator will help to auto generate id for the table.
   */
  @IsUUID()
  templateId: string;

  @IsString()
  templateName: string;

  @IsJSON()
  templateJson: any;
}
