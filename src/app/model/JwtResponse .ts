// export class JwtResponse {
//     token!: string;
//     tokenType = 'Bearer';
//     id!: number;
//     username!: string;
//     email!: string;
//     roles!: string[];
//   }

import { User } from "./user";


export class JwtResponse {
    token?: string;
    tokenType: string = 'Bearer';
    user?: User; // Use the User interface
}