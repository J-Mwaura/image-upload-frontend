import { User } from "./user";


export class JwtResponse {
    token?: string;
    tokenType: string = 'Bearer';
    user?: User; // Use the User interface
}