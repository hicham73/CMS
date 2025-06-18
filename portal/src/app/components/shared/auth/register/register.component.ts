import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  userTypes = [
    { value: 'jobseeker', label: 'Job Seeker' },
    { value: 'employer', label: 'Employer' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['jobseeker', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onUserTypeChange(): void {
    // Additional fields can be added dynamically based on user type
    const userType = this.registerForm.get('userType')?.value;
    
    if (userType === 'employer') {
      this.registerForm.addControl('companyName', this.fb.control('', [Validators.required]));
      this.registerForm.addControl('industry', this.fb.control('', [Validators.required]));
    } else {
      if (this.registerForm.get('companyName')) {
        this.registerForm.removeControl('companyName');
      }
      if (this.registerForm.get('industry')) {
        this.registerForm.removeControl('industry');
      }
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const formValues = this.registerForm.value;
    const userData = {
      email: formValues.email,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      userType: formValues.userType,
    };
    
    // Add employer-specific fields if applicable
    if (formValues.userType === 'employer') {
      Object.assign(userData, {
        companyName: formValues.companyName,
        industry: formValues.industry,
        verified: false // Employers need verification
      });
    }
    
    this.authService.register(userData)
      .subscribe({
        next: (user) => {
          this.isLoading = false;
          // Navigate to appropriate dashboard based on user type
          if (user.userType === 'jobseeker') {
            this.router.navigate(['/job-seeker/dashboard']);
          } else if (user.userType === 'employer') {
            this.router.navigate(['/employer/dashboard']);
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
          this.isLoading = false;
        }
      });
  }
}
