import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router'; 
import { routes } from './src/app/app.routes';

// Import your main application configuration (for client-side)
import { appConfig } from './src/app/app.config'; // This path must be correct based on your project structure

const serverConfig: ApplicationConfig = {
  // Spread the client-side configuration to inherit its providers, imports, etc.
  ...appConfig,
  providers: [
    // Provide the essential server-side rendering capability
    provideServerRendering(),
    // If your application uses Angular's router, you MUST re-provide it here
    // Ensure the 'routes' constant is correctly imported from your app.routes.ts
    // If your app doesn't use the router, you can remove 'provideRouter' and its import.
    provideRouter(routes), // Make sure 'routes' is imported correctly
  ]
};

export const config = serverConfig;