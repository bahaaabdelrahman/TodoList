import { AppAction } from './../../action.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TodoService, Todo } from '../../services/todo.service';
import { AuthService } from '../../services/auth.service';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActionService } from '../../services/action.service';
import { ActivatedRoute } from '@angular/router';





@Component({
  selector: 'app-todo',
  standalone: false,
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
      export class TodoComponent implements OnInit {
        action?: AppAction; // ✅ تعريف المتغير
        todoForm!: FormGroup;
        activeTodos: Todo[] = [];
        progressTodos: Todo[] = [];
        completedTodos: Todo[] = [];

        priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

        activeListId = 'active';
        progressListId = 'progress';
        completedListId = 'completed';

        // ✅ هنا تضيفهم
        showOrganizationPopup: boolean = false;
        organizationId!: string;

        constructor(
          private fb: FormBuilder,
          private todoService: TodoService,
          private authService: AuthService,
          private route: ActivatedRoute,
          private actionService: ActionService
  ) {}


  ngOnInit(): void {
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      priority: ['medium', Validators.required]
    });

    const storedOrgId = localStorage.getItem('organizationId');
    this.showOrganizationPopup = !storedOrgId;

    if (!storedOrgId) {
      return;
    }

    this.organizationId = storedOrgId;
    this.loadTodos();


    this.route.queryParams.subscribe(params => {
      const actionId = params['actionId'];
      if (actionId) {
        this.actionService.getActionById(actionId).subscribe({
          next: (res) => {
            this.action = res;
          },
          error: (err) => {
            console.error('فشل في تحميل الأكشن:', err);
          }
        });
      }
    });
  }




  loadTodos(): void {
    this.todoService.getTodos(this.organizationId).subscribe({
      next: (res: any) => {
        const todos: Todo[] = res.data || [];

        this.activeTodos = this.sortTodos(todos.filter(t => t.status === 'todo'));
        this.progressTodos = this.sortTodos(todos.filter(t => t.status === 'in-progress'));
        this.completedTodos = this.sortTodos(todos.filter(t => t.status === 'completed'));
      },
      error: (err) => {
        console.error('Error loading todos:', err);
        alert('Failed to load tasks');
      }
    });
  }

  sortTodos(todos: Todo[]): Todo[] {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return [...todos].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  addTodo(): void {
    if (this.todoForm.invalid) return;

    const formValues = this.todoForm.value;

    const newTodo: Todo = {
      title: formValues.title,
      description: formValues.title,
      status: 'todo',
      priority: formValues.priority,
      dueDate: new Date().toISOString().split('T')[0],
      tags: [],
      organizationId: this.organizationId
    };

    this.todoService.addTodo(newTodo).subscribe({
      next: (res) => {
        this.activeTodos.unshift(res.data);
        this.activeTodos = this.sortTodos(this.activeTodos);
        this.todoForm.reset({ priority: 'medium' });
      },
      error: (err) => {
        console.error('Error adding todo:', err);
        alert('Failed to add task');
      }
    });
  }

  deleteTodo(todo: Todo): void {
    if (!todo._id) return;

    this.todoService.deleteTodo(todo._id).subscribe({
      next: () => this.loadTodos(),
      error: (err) => {
        console.error('Error deleting todo:', err);
        alert('Failed to delete task');
      }
    });
  }

  drop(event: CdkDragDrop<Todo[]>): void {
    const prevStatus = event.previousContainer.id as 'active' | 'progress' | 'completed';
    const currStatus = event.container.id as 'active' | 'progress' | 'completed';

    const statusMap: Record<'active' | 'progress' | 'completed', 'todo' | 'in-progress' | 'completed'> = {
      active: 'todo',
      progress: 'in-progress',
      completed: 'completed'
    };

    const isSameList = event.previousContainer === event.container;

    if (prevStatus === 'completed' && currStatus !== 'completed' && !isSameList) return;

    const validMove =
      isSameList || (
        (
          (prevStatus === 'active' && currStatus === 'progress') ||
          (prevStatus === 'progress' && (currStatus === 'active' || currStatus === 'completed'))
        )
      );

    if (!validMove) return;

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedTodo = event.container.data[event.currentIndex];

    if (!isSameList) {
      movedTodo.status = statusMap[currStatus];
      this.todoService.updateTodoStatus(movedTodo, movedTodo.status).subscribe({
        next: () => {
        },
        error: (err) => {
          console.error('فشل في تحديث المهمة:', err);
          alert('Failed to update mission after transfer');
          this.loadTodos();
        }
      });
    }
  }



  getTodosByPriority(list: Todo[], priority: string): Todo[] {
    return list.filter(todo => todo.priority === priority);
  }

  trackById(index: number, item: Todo): string | undefined {
    return item._id;
  }

  logout(): void {
    this.authService.logout();
  }


  onOrganizationSelected(): void {
    this.showOrganizationPopup = false;

    const storedOrgId = localStorage.getItem('organizationId');
    if (storedOrgId) {
      this.organizationId = storedOrgId;
      this.loadTodos();
    }
  }


}
