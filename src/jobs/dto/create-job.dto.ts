import { ApiProperty } from "@nestjs/swagger";
import {IsString} from "class-validator";

export class CreateJobDto {
   @IsString()
    @ApiProperty({
        description: "Name of the Company",
        example:"Bank of Insurance"
    })
    companyName: string;

    @IsString()
    @ApiProperty({
        description: "Date of Job Posting",
        example:"dd-mm-yyyy"
    })
    date: string;

    @IsString()
    @ApiProperty({
        description: "Job Title of Position",
        example:"Consultant"
    })
    jobTitle:string;

    @IsString()
    @ApiProperty({
        description: "Job Posting",
        example:`BestTech is a fast-growing company that relies on emerging technology talent, and we want to give you your first start.
                 Job position description:
                 We’re looking for a full-time entry-level software developer. The ideal candidate is someone who’s just out of school and looking for some quality career experience. Salary is $35,000 per year with opportunity for advancement, bonuses and paid sick leave. Remote work is possible.`
    })
    jobPosting:string;
}
