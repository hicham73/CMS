import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showMfaForm = false;
  mfaForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.mfaForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password)
      .subscribe({
        next: (user) => {
          // For demo purposes, we'll simulate MFA for staff users
          if (user.userType === 'staff') {
            this.showMfaForm = true;
            this.authService.sendVerificationCode(email);
          } else {
            this.navigateByUserType(user.userType);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Login failed. Please check your credentials.';
          this.isLoading = false;
        }
      });
  }

  onVerifyCode(): void {
    if (this.mfaForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { verificationCode } = this.mfaForm.value;
    
    this.authService.verifyCode(verificationCode)
      .subscribe({
        next: (isValid) => {
          if (isValid) {
            const user = this.authService.getCurrentUser();
            if (user) {
              this.navigateByUserType(user.userType);
            }
          } else {
            this.errorMessage = 'Invalid verification code. Please try again.';
          }
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Verification failed. Please try again.';
          this.isLoading = false;
        }
      });
  }

  navigateByUserType(userType: string): void {
    switch (userType) {
      case 'jobseeker':
        this.router.navigate(['/job-seeker/dashboard']);
        break;
      case 'employer':
        this.router.navigate(['/employer/dashboard']);
        break;
      case 'staff':
        this.router.navigate(['/staff/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
