// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    firebase: {
      apiKey: 'AIzaSyCxbH4eoDIpFt4S9jGPKeugTVvymnNktkQ',
      authDomain: 'ibtisam-app.firebaseapp.com',
      projectId: 'ibtisam-app',
      storageBucket: 'ibtisam-app.appspot.com',
      messagingSenderId: '265560313088',
      appId: '1:265560313088:web:9cc57b3e550c0859d3f7e5',
      measurementId: 'G-GZ6YCLS1C1',
    },
    //apiUrl: 'http://localhost:8080/',
    apiUrl: 'https://revenue-backend-bf7e5e6a786a.herokuapp.com/'
  };
  
  /*
   * For easier debugging in development mode, you can import the following file
   * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
   *
   * This import should be commented out in production mode because it will have a negative impact
   * on performance if an error is thrown.
   */
  // import 'zone.js/plugins/zone-error';  // Included with Angular CLI.