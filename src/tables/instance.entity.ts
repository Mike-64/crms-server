import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Instance {
  /**
   * this decorator will help to auto generate id for the table.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  instance_id: string;

  @Column({ type: 'varchar' })
  template_id: string;

  @Column({ type: 'varchar' })
  connection_id: string;

  @Column({ type: 'varchar' })
  state_id: string;

  @Column({ type: 'json' })
  instance_json: any;
}
