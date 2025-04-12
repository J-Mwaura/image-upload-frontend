export class ProductImage {
  id: number | undefined;
  name: string | undefined;
  url: string;
  entityType: string;

  constructor(
    id?: number,
    name?: string,
    url: string = '',
    entityType: string = 'product',
  ) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.entityType = entityType;
  }
}
