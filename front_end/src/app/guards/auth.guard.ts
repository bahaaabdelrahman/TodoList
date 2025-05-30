// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // السماح لجميع المستخدمين للدخول عدا مسارات خاصة بالـ admin فقط
    // مثلا لو أردت حماية مسارات محددة فقط للادمن يمكنك عمل Guard خاص
    return true;
  }

}

