import { AppAction } from './../action.model';
import { Component, Input } from '@angular/core';
import { ActionService } from '../services/action.service';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.css'],
  standalone: false
})
export class ActionListComponent implements OnInit {

  todoId!: string;
  actions: AppAction[] = [];

  constructor(private actionService: ActionService, private route: ActivatedRoute) {}


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const actionId = params['actionId'];
      if (actionId) {
        this.loadSingleAction(actionId);
      }
    });
  }

  loadSingleAction(id: string): void {
    this.actionService.getActionById(id).subscribe({
      next: (action) => {
        this.actions = [action];
      },
      error: (err) => {
        console.error('Error loading action:', err);
      }
    });
  }


  updateAction(action: AppAction) {
    const updatedData: Partial<AppAction> = {
      description: 'string',
      type: 'note',
      metadata: {},
      completedAt: '2025-06-20'
    };
    this.actionService.updateAction(action._id!, updatedData).subscribe(updated => {
      action.description = updated.description;
    });
  }

  deleteAction(action: AppAction) {
    if (confirm('Do you want to delete this action?')) {
      this.actionService.deleteAction(action._id!).subscribe(() => {
        this.actions = this.actions.filter(a => a._id !== action._id);
      });
    }
  }
}
