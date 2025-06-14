import { Routes } from '@angular/router';
import { ImageComponent } from './component/admin/image/image.component';
import { AdminProductComponent } from './component/admin/product/product.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserAreaComponent } from './component/board-user/board-user.component';
import { ProfileComponent } from './component/profile/profile.component';
import { authGuard } from './guards/auth-guard.guard';
import { adminGuard } from './guards/admin.guard';
import { ProductCategoryComponent } from './component/product-category/product-category.component';
import { AdminProductCategoryComponent } from './component/admin/product-category/product-category.component';
import { AdminAreaComponent } from './component/admin/board-admin.component';
import { StaffComponent } from './component/admin/staff/list/staff.component';
import { BookingComponent } from './component/board-user/booking/booking.component';
import { ListBookingsComponent } from './component/board-user/list-bookings/list-bookings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

 {
  path: 'user', 
  component: UserAreaComponent, 
  canActivate: [authGuard],
  children: [
    { path: 'list-booking', component: ListBookingsComponent }
  ]
},

  {
    path: 'admin',
    component: AdminAreaComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'images', pathMatch: 'full' },
      { path: 'images', component: ImageComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'categories', component: ProductCategoryComponent },
      { path: 'category', component: AdminProductCategoryComponent },
      { path: 'products', component: AdminProductComponent },
      { path: 'list-booking', component: ListBookingsComponent },
      {
        path: 'user',
        component: UserAreaComponent, 
        children: [
          { path: 'list-booking', component: ListBookingsComponent }
        ]
      },
    ],

  },

  { path: '**', redirectTo: '/login' },
];
