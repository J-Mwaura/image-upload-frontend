export class ProductImage {
    id: number | undefined;
    name: string | undefined;
    url: string;

    constructor(
        id?: number,
        name?: string,
        url: string = ''
    ) {
        this.id = id;
        this.name = name;
        this.url = url;
    }
}
