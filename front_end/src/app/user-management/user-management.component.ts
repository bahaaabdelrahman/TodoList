import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService, User } from '../services/user.service';


@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})


export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  editForm!: FormGroup;
  user: any;

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    this.loadUsers();
    this.editForm = this.fb.group({
      name: [''],
      email: [''],
      role: ['']
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  selectUser(user: User): void {
    this.selectedUser = { ...user };
    this.editForm.patchValue(this.selectedUser);
  }

  updateUser(): void {
    if (!this.selectedUser?._id) return;
    this.userService.updateUser(this.selectedUser._id, this.editForm.value).subscribe(() => {
      this.loadUsers();
      this.selectedUser = null;
    });
  }

  deleteUser(id: string): void {
    if (confirm('هل أنت متأكد من حذف المستخدم؟')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}
