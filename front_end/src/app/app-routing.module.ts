import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { TodoComponent } from './components/todo/todo.component';
import { AuthGuard } from './guards/auth.guard';
import { OrganizationsComponent } from './admin/organizations/organizations.component';



const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'todo', component: TodoComponent, canActivate: [AuthGuard] },
  { path: 'organizations', component: OrganizationsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
