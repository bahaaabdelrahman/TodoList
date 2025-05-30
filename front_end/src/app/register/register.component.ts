import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  userData = {
    name: '',
    email: '',
    password: '',
    organizationName: '',
    organizationDescription: '',
  };

  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router) {}

  register() {

    this.authService.register(this.userData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.message = 'You have successfully logged in.';
        this.messageType = 'success';
        this.router.navigate(['/todo']);
      },
      error: (err) => {
        this.message = 'Login failed. Please check your email and password.';
        this.messageType = 'error';
        this.router.navigate(['/login']);
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/todo']);
  }

}
