import { AppAction } from './../action.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({ providedIn: 'root' })
export class ActionService {
  private apiUrl = 'http://localhost:5000/api/actions';

  constructor(private http: HttpClient) {}


  updateAction(id: string, data: Partial<AppAction>): Observable<AppAction> {
    return this.http.put<AppAction>(`${this.apiUrl}/${id}`, data);
  }


  deleteAction(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  getActionById(id: string): Observable<AppAction> {
    return this.http.get<AppAction>(`${this.apiUrl}/${id}`);
  }
}
