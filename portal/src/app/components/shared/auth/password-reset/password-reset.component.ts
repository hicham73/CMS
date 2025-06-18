import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class PasswordResetComponent implements OnInit {
  requestForm!: FormGroup;
  resetForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showResetForm = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if there's a reset token in the URL
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.showResetForm = !!this.token;
    
    this.initForms();
  }

  initForms(): void {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onRequestSubmit(): void {
    if (this.requestForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const { email } = this.requestForm.value;
    
    // In a real app, this would call an API to send a reset email
    // For this demo, we'll simulate a successful request
    setTimeout(() => {
      // Check if the email exists in our mock users
      const user = this.authService.getCurrentUser(); // Just for demo
      
      if (user) {
        this.successMessage = 'Password reset instructions have been sent to your email.';
      } else {
        this.errorMessage = 'Email not found. Please check your email address.';
      }
      
      this.isLoading = false;
    }, 800);
  }

  onResetSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const { newPassword } = this.resetForm.value;
    
    // In a real app, this would call an API to reset the password using the token
    // For this demo, we'll simulate a successful reset
    setTimeout(() => {
      this.successMessage = 'Your password has been reset successfully. You can now log in with your new password.';
      this.isLoading = false;
      
      // Redirect to login after a delay
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }, 800);
  }
}
