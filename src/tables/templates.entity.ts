import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Templates {
  /**
   * this decorator will help to auto generate id for the table.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  template_id: string;

  @Column({ type: 'varchar' })
  template_name: string;

  @Column({ type: 'json' })
  template_json: any;
}
