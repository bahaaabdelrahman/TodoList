import { Pipe, PipeTransform } from '@angular/core';
import { Todo } from './services/todo.service';


@Pipe({
  name: 'filterTodos',
  standalone: false,
  pure: false
})
export class FilterTodosPipe implements PipeTransform {

  transform(todo: Todo[],filter: 'all' | 'active' | 'completed'): Todo[] {
    if(filter === 'active') return todo.filter(t => !t.completed)
      if(filter === 'completed') return todo.filter(t => t.completed)
    return todo;
  }

}
