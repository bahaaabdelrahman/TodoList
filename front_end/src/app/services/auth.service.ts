import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private baseUrl = 'http://localhost:5000';
  private currentUser: any = null;

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
      next: () => this.clearLocalData(),
      error: () => this.clearLocalData()
    });
  }


  private clearLocalData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organizationId');
    localStorage.removeItem('role');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }


  getCurrentUser(): Observable<any> {
    if (this.currentUser) {
      return new Observable(observer => {
        observer.next(this.currentUser);
        observer.complete();
      });
    }

    return this.http.get(`${this.baseUrl}/api/auth/me`).pipe(
      tap(user => this.currentUser = user)
    );
  }


  public storeTokenData(token: string): void {
    localStorage.setItem('token', token);
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.organizationId) {
        localStorage.setItem('organizationId', decoded.organizationId);
      }
      if (decoded.role) {
        localStorage.setItem('role', decoded.role);
      }
    } catch (err) {
      console.error('خطأ في فك التوكن:', err);
    }
  }


  private handleLoginResponse(res: any): void {
    if (res.token) {
      this.storeTokenData(res.token);
    }
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
      this.currentUser = res.data;
    }
  }


  setActiveOrganization(orgId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/users/organizations/active`, { organizationId: orgId }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res.data) {
          localStorage.setItem('organizationId', res.data.organizationId);
          localStorage.setItem('role', res.data.role);
        }
      })
    );
  }

}
