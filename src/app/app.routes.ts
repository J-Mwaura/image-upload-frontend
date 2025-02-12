import { Routes } from '@angular/router';
import { ImageComponent } from './image/image.component';
import { ProductComponent } from './component/admin/product/product.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { BoardUserComponent } from './component/board-user/board-user.component';
import { ProfileComponent } from './component/profile/profile.component';
import { BoardAdminComponent } from './component/admin/board-admin.component';

export const routes: Routes = [
    { path: 'images', component: ImageComponent },
    { path: 'product', component: ProductComponent },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'user', component: BoardUserComponent },
    { path: 'admin', component: BoardAdminComponent },
    { path: 'profile', component: ProfileComponent },
];
