import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { User, JobSeeker, Employer } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  accessibilityForm!: FormGroup;
  securityForm!: FormGroup;
  currentUser: User | null = null;
  isJobSeeker = false;
  isEmployer = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  activeTab = 'profile';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isJobSeeker = this.authService.isJobSeeker();
    this.isEmployer = this.authService.isEmployer();
    this.initForms();
  }

  initForms(): void {
    // Base profile form for all user types
    this.profileForm = this.fb.group({
      firstName: [this.currentUser?.firstName || '', [Validators.required]],
      lastName: [this.currentUser?.lastName || '', [Validators.required]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });

    // Add employer-specific fields
    if (this.isEmployer) {
      const employer = this.currentUser as Employer;
      this.profileForm.addControl('companyName', this.fb.control(employer.companyName || '', [Validators.required]));
      this.profileForm.addControl('industry', this.fb.control(employer.industry || '', [Validators.required]));
    }

    // Add jobseeker-specific fields
    if (this.isJobSeeker) {
      const jobSeeker = this.currentUser as JobSeeker;
      this.profileForm.addControl('education', this.fb.control(jobSeeker.education || ''));
      this.profileForm.addControl('employmentStatus', this.fb.control(jobSeeker.employmentStatus || ''));
      this.profileForm.addControl('isVeteran', this.fb.control(jobSeeker.isVeteran || false));
      this.profileForm.addControl('isTradeProgramParticipant', this.fb.control(jobSeeker.isTradeProgramParticipant || false));
    }

    // Accessibility preferences form (primarily for job seekers)
    this.accessibilityForm = this.fb.group({
      highContrast: [this.getAccessibilityPreference('highContrast') || false],
      largeFont: [this.getAccessibilityPreference('largeFont') || false],
      screenReader: [this.getAccessibilityPreference('screenReader') || false],
      keyboardOnly: [this.getAccessibilityPreference('keyboardOnly') || false],
      preferredLanguage: [this.getAccessibilityPreference('preferredLanguage') || 'English']
    });

    // Security form for password changes
    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  getAccessibilityPreference(key: string): any {
    if (this.isJobSeeker) {
      const jobSeeker = this.currentUser as JobSeeker;
      if (jobSeeker.accessibilityPreferences) {
        return jobSeeker.accessibilityPreferences[key as keyof typeof jobSeeker.accessibilityPreferences];
      }
    }
    return null;
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // In a real app, this would call a user service to update the profile
    // For this demo, we'll simulate a successful update
    setTimeout(() => {
      // Update the current user with form values
      if (this.currentUser) {
        const updatedUser = {
          ...this.currentUser,
          ...this.profileForm.value
        };
        
        // Update in localStorage and the BehaviorSubject
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        // In a real app, this would be done through a proper service method
        
        this.successMessage = 'Profile updated successfully';
        this.isLoading = false;
      }
    }, 800);
  }

  onAccessibilitySubmit(): void {
    if (this.accessibilityForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // In a real app, this would call a user service to update the accessibility preferences
    // For this demo, we'll simulate a successful update
    setTimeout(() => {
      if (this.currentUser && this.isJobSeeker) {
        const jobSeeker = this.currentUser as JobSeeker;
        
        // Update accessibility preferences
        jobSeeker.accessibilityPreferences = this.accessibilityForm.value;
        
        // Update in localStorage
        localStorage.setItem('currentUser', JSON.stringify(jobSeeker));
        
        this.successMessage = 'Accessibility preferences updated successfully';
        this.isLoading = false;
      }
    }, 800);
  }

  onSecuritySubmit(): void {
    if (this.securityForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // In a real app, this would verify the current password and update to the new one
    // For this demo, we'll simulate a successful password change
    setTimeout(() => {
      // Here we would call an API to change the password
      
      this.successMessage = 'Password changed successfully';
      this.isLoading = false;
      this.securityForm.reset();
    }, 800);
  }
}
