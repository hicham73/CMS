import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employer } from '../../../models/user.model';

@Component({
  selector: 'app-employer-profile',
  templateUrl: './employer-profile.component.html',
  styleUrls: ['./employer-profile.component.scss']
})
export class EmployerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  employer: Partial<Employer> = {};
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // In a real app, this would be fetched from a service
    this.employer = {
      id: '123',
      email: 'company@example.com',
      firstName: 'Company',
      lastName: 'Admin',
      userType: 'employer',
      companyName: 'Example Corporation',
      industry: 'Technology',
      verified: true
    };

    this.initForm();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      companyName: [this.employer.companyName, Validators.required],
      industry: [this.employer.industry, Validators.required],
      email: [this.employer.email, [Validators.required, Validators.email]],
      firstName: [this.employer.firstName, Validators.required],
      lastName: [this.employer.lastName, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const updatedProfile = {
        ...this.employer,
        ...this.profileForm.value
      };
      
      // In a real app, this would update the profile in the database
      console.log('Profile updated:', updatedProfile);
      this.employer = updatedProfile;
    }
  }
}
