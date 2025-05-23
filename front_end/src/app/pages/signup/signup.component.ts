import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  email = '';
  password = '';

  constructor(private router: Router) {}

  onSignup() {
    // بدون تسجيل حقيقي، فقط ينتقل إلى صفحة login
    this.router.navigate(['/login']);
  }

}
