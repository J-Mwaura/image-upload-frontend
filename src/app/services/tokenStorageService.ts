import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // Import throwError
import { User } from '../model/user';
import { JwtResponse } from '../model/JwtResponse ';
import { JwtHelperService } from '@auth0/angular-jwt';

// interface JwtPayload {
//     'authz.roles'?: string[];
//   }

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {

    constructor() { }

    private jwtHelper = new JwtHelperService(); // Create an instance

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (token) {
      try {
        return this.jwtHelper.isTokenExpired(token);
      } catch (error) {
        console.error("Error decoding or checking token expiry:", error);
        return true; // Treat as expired in case of error
      }
    }
    return true; // No token, treat as expired
  }

    signOut(): void {
        localStorage.clear();
    }

    getToken(): string | null { // Return null if no token
        return localStorage.getItem(TOKEN_KEY); // Use localStorage
    }

    getUser(): Observable<User | null> {
        const userJson = localStorage.getItem(USER_KEY);
        if (userJson) {
          try {
            const user = JSON.parse(userJson);

            // testing only
            // for (const role of user.roles) {
            //     console.log("user by dev: " +role.roleName);
            //   }

            const roleNamesFromUserObject = user.roles.map((role: { roleName: any; }) => role.roleName);

            // 2. Extract JWT:
            const authToken = user[TOKEN_KEY];

            if (authToken) {
              // 3. Decode JWT:
              const decodedToken = jwt_decode(authToken);
              const rolesFromToken = decodedToken!['authz.roles'];

              // 4. Update user object with roles from token.
              user.roles = rolesFromToken || roleNamesFromUserObject;

            } else {
              user.roles = roleNamesFromUserObject;
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
                localStorage.setItem(TOKEN_KEY, token);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    saveUser(user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

getRefreshToken(): string | null {
  const refreshToken = localStorage.getItem(USER_KEY);
  return refreshToken ? refreshToken : null;
}
}

function jwt_decode(jwt: any) {
    throw new Error('Function not implemented.');
}
