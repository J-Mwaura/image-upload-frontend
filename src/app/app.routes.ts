import { Routes } from '@angular/router';
import { ImageComponent } from './image/image.component';
import { ProductComponent } from './component/admin/product/product.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { BoardUserComponent } from './component/board-user/board-user.component';
import { ProfileComponent } from './component/profile/profile.component';
import { authGuard } from './guards/auth-guard.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminNavComponent } from './component/admin/admin-nav/admin-nav.component';

export const routes: Routes = [
    { path: 'product', component: ProductComponent },
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'user', component: BoardUserComponent, canActivate: [authGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

    {
        path: 'home', component: HomeComponent, canActivate: [authGuard],
        children: [
            {
                path: 'admin', component: AdminNavComponent, canActivate: [authGuard, adminGuard],
                children: [
                    { path: 'images', component: ImageComponent},
                    { path: 'register', component: RegisterComponent },
                    { path: 'user', component: BoardUserComponent}
                ]
            },
            {
                path: 'user', component: BoardUserComponent, canActivate: [authGuard]
            }
        ]
    },
    
    { path: '**', redirectTo: '/login' }, // redirect unknown urls to login page
    
];
