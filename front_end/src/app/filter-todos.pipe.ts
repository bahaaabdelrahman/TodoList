import { Pipe, PipeTransform } from '@angular/core';
import { Todo } from './services/todo.service';


@Pipe({
  name: 'filterTodos',
  standalone: false,
  pure: false
})
export class FilterTodosPipe implements PipeTransform {

  transform(todos: Todo[], filter: 'all' | 'active' | 'completed'): Todo[] {
    if (filter === 'active') {
      return todos.filter(t => t.status === 'todo' || t.status === 'in-progress');
    }
    if (filter === 'completed') {
      return todos.filter(t => t.status === 'completed');
    }
    return todos;
  }

}
