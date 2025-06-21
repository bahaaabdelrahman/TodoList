import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const organizationId = localStorage.getItem('organizationId');

    let headers: any = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (organizationId) {
      headers['OrganizationId'] = organizationId;
    }

    const cloned = req.clone({
      setHeaders: headers
    });

    return next.handle(cloned);
  }
}
