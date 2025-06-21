import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { TodoComponent } from './components/todo/todo.component';
import { AuthGuard } from './guards/auth.guard';
import { OrganizationsComponent } from './admin/organizations/organizations.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AdminGuard } from './guards/admin.guard';
import { ActionListComponent } from './action-list/action-list.component';





const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'todo', component: TodoComponent, canActivate: [AuthGuard] },
  { path: 'actions', component: ActionListComponent, canActivate: [AuthGuard] },
  { path: 'organizations', component: OrganizationsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard, AdminGuard] }, // ✅ جديد
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
