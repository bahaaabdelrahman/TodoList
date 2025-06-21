import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Organization {
  _id: string;
  name: string;
  description: string;
}

export interface UserToOrg {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private baseUrl = 'http://localhost:5000/api/organizations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createOrganization(data: { name: string; description: string }): Observable<any> {
    console.log('🔼 إرسال طلب إنشاء منظمة:', data);
    return this.http.post(`${this.baseUrl}`, data).pipe(
      tap(response => console.log('✅ تم إنشاء المنظمة:', response))
    );
  }

  getOrganizations(): Observable<Organization[]> {
    console.log('📥 طلب جميع المنظمات...');
    return this.http.get<{ success: boolean, data: Organization[] }>(`${this.baseUrl}`).pipe(
      tap(response => console.log('✅ تم استرجاع المنظمات:', response)),
      map(response => response.data)
    );
  }

  updateOrganization(id: string, data: { name: string; description: string }): Observable<any> {
    console.log(`🔄 تحديث منظمة [ID: ${id}] بالبيانات:`, data);
    return this.http.put(`${this.baseUrl}/${id}`, data).pipe(
      tap(response => console.log('✅ تم تحديث المنظمة:', response))
    );
  }

  addUserToOrganization(orgId: string, user: UserToOrg): Observable<any> {
    console.log(`👤 إضافة مستخدم للمنظمة [ID: ${orgId}]`, user);
    return this.http.post(`${this.baseUrl}/${orgId}/users`, user).pipe(
      tap(response => console.log('✅ تم إضافة المستخدم:', response))
    );
  }

  removeUserFromOrganization(orgId: string, userId: string): Observable<any> {
    console.log(`❌ حذف مستخدم [ID: ${userId}] من المنظمة [ID: ${orgId}]`);
    return this.http.delete(`${this.baseUrl}/${orgId}/users/${userId}`).pipe(
      tap(response => console.log('✅ تم حذف المستخدم:', response))
    );
  }

  // ✅ دالة تعيين المنظمة النشطة وتخزين التوكن الجديد
  setActiveOrganization(organizationId: string): Observable<any> {
    console.log('🏁 تعيين المنظمة النشطة:', organizationId);
    return this.http.post<{ data: { token: string } }>(
      `http://localhost:5000/api/users/organizations/active`,
      { organizationId }
    ).pipe(
      tap(response => {
        const token = response.data.token;
        console.log('🔑 توكن جديد من السيرفر:', token);
        this.authService.storeTokenData(token);
      })
    );
  }
}
