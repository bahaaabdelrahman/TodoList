import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.role === 'admin') {
      return true;
    }


    this.router.navigate(['/todo']);
    return false;
  }
}
