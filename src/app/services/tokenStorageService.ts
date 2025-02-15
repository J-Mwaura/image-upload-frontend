import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // Import throwError
import { User } from '../model/user';
import { JwtResponse } from '../model/JwtResponse ';

function mapJwtResponseToUser(jwtResponse: JwtResponse): User {
    if (!jwtResponse.user) {
        throw new Error("User data is missing in JwtResponse"); // Handle missing user
    }
    return {
        id: jwtResponse.user.id,
        username: jwtResponse.user.username,
        email: jwtResponse.user.email,
        roles: jwtResponse.user.roles || [],
    };
}

interface JwtPayload {  // Define the interface here
    'authz.roles'?: string[];
    // ... other claims (e.g., sub, iat, exp)
  }

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {

    constructor() { }

    signOut(): void {
        localStorage.clear(); // Use localStorage consistently
    }

    getToken(): string | null { // Return null if no token
        return localStorage.getItem(TOKEN_KEY); // Use localStorage
    }

    // getUser(): Observable<User | null> {
    //     const userJson = localStorage.getItem(USER_KEY); // Use localStorage
    //     if (userJson) {
    //       try {
    //         const user = JSON.parse(userJson);
    //         return of(user);
    //       } catch (error) {
    //         console.error("Error parsing user data:", error);
    //         return of(null); // Return null if parsing fails
    //       }
    //     } else {
    //       return of(null);
    //     }
    // }

    getUser(): Observable<User | null> {
        const userJson = localStorage.getItem(USER_KEY);
        if (userJson) {
          try {
            const user = JSON.parse(userJson);

            // testing only
            for (const role of user.roles) {
                //console.log("user by dev: " +role.roleName);
              }
      
            const roleNamesFromUserObject = user.roles.map((role: { roleName: any; }) => role.roleName);
      
            // 2. Extract JWT:
            const authToken = user['auth-token'];
    
            if (authToken) {
              // 3. Decode JWT:
              const decodedToken = jwt_decode(authToken);
              const rolesFromToken = decodedToken!['authz.roles'];
              
              //console.log("Role requested by developer : " +rolesFromToken);
      
              // 4. Update user object with roles from token OR from the original object:
              user.roles = rolesFromToken || roleNamesFromUserObject; // Use roles from JWT if available, else from original object.
              // If you always want the token roles use the line below
              // user.roles = rolesFromToken; 
      
            } else {
              //console.warn("No auth-token found in user data. Using roles from user object.");
              user.roles = roleNamesFromUserObject; // Fallback to roles from the user object
            }
      
            return of(user);
          } catch (error) {
            console.error("Error parsing user data or JWT:", error);
            return of(null);
          }
        } else {
          return of(null);
        }
      }

    saveToken(token: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                localStorage.setItem(TOKEN_KEY, token); // Use localStorage
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    saveUser(user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                localStorage.setItem(USER_KEY, JSON.stringify(user)); // Use localStorage
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}

function jwt_decode(jwt: any) {
    throw new Error('Function not implemented.');
}
