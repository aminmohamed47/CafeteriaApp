import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  mobile = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.username || !this.password || !this.email || !this.mobile) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.authService.register({ 
      username: this.username, 
      password: this.password,
      email: this.email,
      mobile: this.mobile
    }).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        this.error = 'Registration failed. Please try again.';
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
