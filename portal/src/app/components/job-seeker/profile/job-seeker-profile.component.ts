import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobSeeker } from '../../../models/user.model';

@Component({
  selector: 'app-job-seeker-profile',
  templateUrl: './job-seeker-profile.component.html',
  styleUrls: ['./job-seeker-profile.component.scss']
})
export class JobSeekerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  accessibilityForm!: FormGroup;
  jobSeeker: Partial<JobSeeker> = {};
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // In a real app, this would be fetched from a service
    this.jobSeeker = {
      id: '123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      userType: 'jobseeker',
      education: 'Bachelor\'s Degree',
      employmentStatus: 'Employed',
      isVeteran: false,
      isTradeProgramParticipant: false,
      barriers: ['none'],
      accessibilityPreferences: {
        highContrast: false,
        largeFont: false,
        screenReader: false,
        keyboardOnly: false,
        preferredLanguage: 'English'
      }
    };

    this.initForms();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: [this.jobSeeker.firstName, Validators.required],
      lastName: [this.jobSeeker.lastName, Validators.required],
      email: [this.jobSeeker.email, [Validators.required, Validators.email]],
      education: [this.jobSeeker.education],
      employmentStatus: [this.jobSeeker.employmentStatus],
      isVeteran: [this.jobSeeker.isVeteran],
      isTradeProgramParticipant: [this.jobSeeker.isTradeProgramParticipant]
    });

    this.accessibilityForm = this.fb.group({
      highContrast: [this.jobSeeker.accessibilityPreferences?.highContrast || false],
      largeFont: [this.jobSeeker.accessibilityPreferences?.largeFont || false],
      screenReader: [this.jobSeeker.accessibilityPreferences?.screenReader || false],
      keyboardOnly: [this.jobSeeker.accessibilityPreferences?.keyboardOnly || false],
      preferredLanguage: [this.jobSeeker.accessibilityPreferences?.preferredLanguage || 'English']
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid) {
      const updatedProfile = {
        ...this.jobSeeker,
        ...this.profileForm.value
      };
      
      // In a real app, this would update the profile in the database
      console.log('Profile updated:', updatedProfile);
      this.jobSeeker = updatedProfile;
    }
  }

  onAccessibilitySubmit(): void {
    if (this.accessibilityForm.valid) {
      const updatedPreferences = {
        ...this.jobSeeker,
        accessibilityPreferences: this.accessibilityForm.value
      };
      
      // In a real app, this would update the accessibility preferences in the database
      console.log('Accessibility preferences updated:', updatedPreferences);
      this.jobSeeker = updatedPreferences;
    }
  }
}
