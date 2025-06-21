import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  role: string;
  organizationId?: string;
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log('You have successfully logged in', res);

        if (res.token) {
          localStorage.setItem('token', res.token);

          const decodedToken = jwtDecode<DecodedToken>(res.token);
          localStorage.setItem('user', JSON.stringify(decodedToken));

          this.message = 'You have successfully logged in';
          this.messageType = 'success';

          // ✅ تأكد من أن activeOrganization موجود
          const activeOrgId = res?.activeOrganization?._id;
          if (decodedToken.role === 'admin') {
            this.router.navigate(['/organizations']);
          } else {
            if (activeOrgId) {
              localStorage.setItem('organizationId', activeOrgId);
            }
            this.router.navigate(['/todo']);
          }

        } else {
          this.message = 'Token not received';
          this.messageType = 'error';
        }
      },
      error: (err) => {
        this.message = 'Incorrect email or password';
        this.messageType = 'error';
      }
    });
  }


}
