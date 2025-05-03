export interface UserDTO {
    id: number;
    username: string;
    email: string;
    roles?: string[]; // ? means role is optional
  }
  