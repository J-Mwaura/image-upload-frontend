export class ProductImage {
    id: number | undefined;
    name: string | undefined;
    location: string;

    constructor(
        id?: number, // Optional parameter for id
        name?: string, // Optional parameter for name
        location: string = '' // Default value for location
    ) {
        this.id = id;
        this.name = name;
        this.location = location;
    }
}