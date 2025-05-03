import { JwtResponse } from "../response/JwtResponse ";
import { User } from "../user";


export function mapJwtResponseToUser(jwtResponse: JwtResponse): User {
    if (!jwtResponse.user) {
        throw new Error("User data is missing in JwtResponse"); // Handle missing user
    }

    return {
        id: jwtResponse.user.id,        // Access id from jwtResponse.user
        username: jwtResponse.user.username, // Access username from jwtResponse.user
        email: jwtResponse.user.email,    // Access email from jwtResponse.user
        roles: jwtResponse.user.roles || [], // Access roles from jwtResponse.user, provide default
        // ... map other properties from jwtResponse.user
    };
}