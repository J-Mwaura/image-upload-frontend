import { Routes } from '@angular/router';
import { ImageComponent } from './component/image/image.component';

export const routes: Routes = [
  { path: '', redirectTo: 'image', pathMatch: 'full' }, 
      {
        path: 'image', component: ImageComponent, 
      },
];
