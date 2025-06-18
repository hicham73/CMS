import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import standalone components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

// Define routes for auth module
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'password-reset/:token', component: PasswordResetComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    LoginComponent,
    RegisterComponent,
    PasswordResetComponent
  ]
})
export class AuthModule { }
