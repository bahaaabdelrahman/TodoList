import { Component } from '@angular/core';
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
  styleUrl: './login.component.css'
})
export class LoginComponent {

  credentials = {
    email: '',
    password: ''
  };

  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        console.log('✅ تم تسجيل الدخول بنجاح', res);

        if (res.token) {
          // تخزين التوكن في localStorage
          localStorage.setItem('token', res.token);

          // فك التوكن
          const decodedToken = jwtDecode<DecodedToken>(res.token);

          // تخزين بيانات المستخدم في localStorage
          localStorage.setItem('user', JSON.stringify(decodedToken));

          this.message = 'You have successfully logged in.';
          this.messageType = 'success';

          // التوجيه حسب الدور
          if (decodedToken.role === 'admin') {
            this.router.navigate(['/organizations']);
          } else {
            this.router.navigate(['/todo']);
          }
        } else {
          this.message = 'No token received';
          this.messageType = 'error';
        }
      },
      error: (err) => {
        this.message = 'Incorrect email or password';
        this.messageType = 'error';
      }
    });
  }


  goToLogin() {
    this.router.navigate(['/todo']);
  }

}





