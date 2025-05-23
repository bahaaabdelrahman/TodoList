import { Injectable } from '@angular/core';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'progress' | 'done';
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: Todo[] = [];

  private nextId: number = 1;

  private readonly storageKey: string = 'angular-todo';

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedTodos = localStorage.getItem(this.storageKey);
    if (storedTodos) {
      this.todos = JSON.parse(storedTodos);
      this.nextId = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.id)) + 1 : 1;
    } else {
      this.nextId = 1;
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
  }

  saveTodos(todos: Todo[]): void {
    this.todos = todos;
    this.saveToLocalStorage();
  }

  getTodos(): Todo[] {
    return this.todos;
  }

  addTodo(title: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    const isDuplicate = this.todos.some(todo => todo.title.toLowerCase() === trimmedTitle.toLowerCase());

    if (isDuplicate) {
      const confirmed = window.confirm('This todo already exists. Do you want to add it anyway?');
      if (!confirmed) {
        return;
      }
    }

    const newTodo: Todo = {
      id: this.nextId++,
      title: trimmedTitle,
      completed: false,
      priority: priority,
      status: 'active'
    };

    this.todos.unshift(newTodo);
    this.saveToLocalStorage();
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveToLocalStorage();
  }



}
