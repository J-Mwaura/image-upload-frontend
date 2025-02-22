import { Routes } from '@angular/router';
import { ImageComponent } from './image/image.component';
import { ProductComponent } from './component/admin/product/product.component';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { BoardUserComponent } from './component/board-user/board-user.component';
import { ProfileComponent } from './component/profile/profile.component';
import { BoardAdminComponent } from './component/admin/board-admin.component';
import { authGuard } from './guards/auth-guard.guard';
import { adminGuard } from './guards/admin.guard';
import { ChoiceUrlsComponent } from './navbar-c/choice-urls/choice-urls.component';

export const routes: Routes = [
    { path: 'images', component: ImageComponent, canActivate: [authGuard]},
    { path: 'product', component: ProductComponent },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'user', component: BoardUserComponent, canActivate: [authGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

    {
        path: 'choice',
        component: ChoiceUrlsComponent,
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: 'admin',
                component: BoardAdminComponent,
                canActivate: [authGuard, adminGuard]
            },
            { path: 'register', component: RegisterComponent }
        ]
    },
];
