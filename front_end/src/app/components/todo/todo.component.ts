import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../../services/todo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
  standalone: false,
})
export class TodoComponent implements OnInit {

  priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

  todoForm!: FormGroup;

  activeTodos: Todo[] = [];
  progressTodos: Todo[] = [];
  doneTodos: Todo[] = [];


  activeListId = 'active-list';
  progressListId = 'progress-list';
  doneListId = 'done-list';


  constructor(private todoService: TodoService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      priority: ['medium', Validators.required],
    });
    this.loadTodos();
  }

  loadTodos(): void {
    const allTodos = this.todoService.getTodos();
    this.activeTodos = allTodos.filter(t => t.status === 'active');
    this.progressTodos = allTodos.filter(t => t.status === 'progress');
    this.doneTodos = allTodos.filter(t => t.status === 'done');

    this.sortListByPriority(this.activeTodos);
    this.sortListByPriority(this.progressTodos);
    this.sortListByPriority(this.doneTodos);
  }


  sortListByPriority(list: Todo[]): void {
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
    list.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) {
            return priorityDiff;
        }
        return 0;
    });
  }

  trackById(index: number, item: Todo): number {
    return item.id;
  }

  getTodosByPriority(list: Todo[], priority: 'high' | 'medium' | 'low'): Todo[] {
    return list.filter(todo => todo.priority === priority);
  }

  addTodo(): void {
    if (this.todoForm.invalid) {
        this.todoForm.markAllAsTouched();
        return;
    }
    const { title, priority } = this.todoForm.value;
    if (!title.trim()) return;

    this.todoService.addTodo(title.trim(), priority);
    this.todoForm.reset({ priority: 'medium', title: '' });
    this.loadTodos();
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id);
    this.loadTodos();
  }

  drop(event: CdkDragDrop<Todo[]>): void {
    const previousContainerId = event.previousContainer.id;
    const currentContainerId = event.container.id;
    const movedItem = event.item.data as Todo;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (previousContainerId === this.doneListId) {
        return;
      }

      if (currentContainerId === this.doneListId && previousContainerId !== this.progressListId) {
        return;
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      if (currentContainerId === this.activeListId) {
        movedItem.status = 'active';
      } else if (currentContainerId === this.progressListId) {
        movedItem.status = 'progress';
      } else if (currentContainerId === this.doneListId) {
        movedItem.status = 'done';
      }
    }
    this.updateAndSaveAllTodos();
  }

  private updateAndSaveAllTodos(): void {
    const allTodos = [...this.activeTodos, ...this.progressTodos, ...this.doneTodos];
    this.todoService.saveTodos(allTodos);
    this.loadTodos();
  }
}
