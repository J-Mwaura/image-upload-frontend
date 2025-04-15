import {Routes} from '@angular/router';
import {ImageComponent} from './image/image.component';
import {ProductComponent} from './component/admin/product/product.component';
import {LoginComponent} from './component/login/login.component';
import {HomeComponent} from './home/home.component';
import {RegisterComponent} from './register/register.component';
import {BoardUserComponent} from './component/board-user/board-user.component';
import {ProfileComponent} from './component/profile/profile.component';
import {authGuard} from './guards/auth-guard.guard';
import {adminGuard} from './guards/admin.guard';
import {AdminNavComponent} from './component/admin/admin-nav/admin-nav.component';
import {ProductCategoryComponent} from './component/product-category/product-category.component';
import {AdminProductCategoryComponent} from './component/admin/product-category/product-category.component';
import {AdminAreaComponent} from './component/admin/board-admin.component';

export const routes: Routes = [
  {path: 'product', component: ProductComponent},
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  // {path: 'user', component: BoardUserComponent, canActivate: [authGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [authGuard]},

  {
    path: 'home', component: HomeComponent, canActivate: [authGuard],
    children: [

      {
        path: 'user', component: BoardUserComponent, canActivate: [authGuard],
      },

      {
        path: 'admin', component: AdminNavComponent, canActivate: [authGuard, adminGuard],
        children: [
          {path: 'images', component: ImageComponent},
          {path: 'register', component: RegisterComponent},
          {path: 'user', component: BoardUserComponent},
          {path: 'categories', component: ProductCategoryComponent},
          {path: 'category', component: AdminProductCategoryComponent},
        ]
      },
    ],

  },

  {path: '**', redirectTo: '/login'},
];
