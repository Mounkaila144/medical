import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
}

registerEnumType(ReportFormat, {
  name: 'ReportFormat',
});

@ObjectType()
@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ name: 'tenant_id' })
  @Field()
  tenantId: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'json' })
  @Field(() => GraphQLJSON)
  params: Record<string, any>;

  @Column({ name: 'generated_path' })
  @Field()
  generatedPath: string;

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: ReportFormat.PDF,
  })
  @Field(() => ReportFormat)
  format: ReportFormat;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;
} 