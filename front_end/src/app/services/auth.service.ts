// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInKey = 'loggedIn';

  login(email: string, password: string): boolean {
    if (email && password) {
      localStorage.setItem(this.loggedInKey, 'true');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.loggedInKey);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.loggedInKey) === 'true';
  }
}

