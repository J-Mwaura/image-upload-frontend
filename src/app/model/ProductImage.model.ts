export class ProductImage {
    id: number | undefined;
    name: string | undefined;
    location: string;

    constructor(
        id?: number, 
        name?: string,
        location: string = '' 
    ) {
        this.id = id;
        this.name = name;
        this.location = location;
    }
}