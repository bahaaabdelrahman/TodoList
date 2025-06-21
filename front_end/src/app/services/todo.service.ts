import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Todo {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
  organizationId?: string;
  userId?: string | { _id: string; name?: string; email?: string; id?: string };
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:5000/api/tasks';

  constructor(private http: HttpClient) {}

  getTodos(organizationId: string): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl, {
      params: { organizationId }
    });
  }

  addTodo(todoData: Todo): Observable<{ success: boolean, data: Todo }> {
    return this.http.post<{ success: boolean, data: Todo }>(this.apiUrl, todoData);
  }

  deleteTodo(todoId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${todoId}`);
  }

  updateTodoStatus(todo: Todo, newStatus: string): Observable<any> {
    const updatedTodo = {
      _id: todo._id,
      title: todo.title,
      description: todo.description,
      status: newStatus,
      priority: todo.priority,
      dueDate: todo.dueDate,
      organizationId: todo.organizationId,
      userId: typeof todo.userId === 'object' ? todo.userId.id || todo.userId._id : todo.userId,
    };

    return this.http.put<any>(`${this.apiUrl}/${todo._id}`, updatedTodo);
  }

}
