export class JwtResponse {
    token!: string;
    tokenType = 'Bearer';
    id!: number;
    username!: string;
    email!: string;
    roles!: string[];
  }