import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Job {
  /**
   * this decorator will help to auto generate id for the table.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  company_name: string;

  @Column({ type: 'varchar' })
  date: string;

  @Column({ type: 'varchar' })
  job_title: string;

  @Column({ type: 'json' })
  job_posting: any;

}