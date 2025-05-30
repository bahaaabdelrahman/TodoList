import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/register`, userData).pipe(
      tap(res => this.handleLoginResponse(res))
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/login`, credentials).pipe(
      tap(res => this.handleLoginResponse(res))
    );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/api/auth/logout`, {}).subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: err => {
        console.error('Logout failed', err);
        // حتى لو فشل، نحذف التوكن
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/auth/me`);
  }

  private handleLoginResponse(res: any): void {
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
  }
}

