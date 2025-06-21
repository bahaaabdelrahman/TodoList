import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{

  registerForm!: FormGroup;

  userData = {
    name: '',
    email: '',
    password: '',
    organizationName: '',
    organizationDescription: '',
  };

  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      organizationName: ['', Validators.required],
      organizationDescription: ['', Validators.required]
    });
  }

  register() {
    this.authService.register(this.userData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);

        if (res.data?.activeOrganization?._id) {
          localStorage.setItem('organizationId', res.data.activeOrganization._id);
        }


        const decoded = jwtDecode(res.token);
        localStorage.setItem('user', JSON.stringify(decoded));

        this.message = 'You have successfully registered.';
        this.messageType = 'success';

        this.router.navigate(['/todo']);
      },
      error: (err) => {
        this.message = err.error?.error || 'Registration failed. Please try again.';
        this.messageType = 'error';
      }
    });
  }


  goToSignup() {
    this.router.navigate(['/todo']);
  }

}
