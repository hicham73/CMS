export interface SchemaEntity {
  id: string;
  name: string;
  description: string;
  type: string;
  properties?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
