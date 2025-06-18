import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Define routes for job seeker module
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: JobSeekerDashboardComponent },
  { path: 'jobs', component: JobSearchComponent },
  { path: 'resumes', component: ResumeManagementComponent },
  { path: 'applications', component: ApplicationsComponent },
  { path: 'profile', component: JobSeekerProfileComponent }
];

// Import components
import { JobSeekerDashboardComponent } from './dashboard/job-seeker-dashboard.component';
import { JobSearchComponent } from './job-search/job-search.component';
import { ResumeManagementComponent } from './resume/resume-management.component';
import { ApplicationsComponent } from './applications/applications.component';
import { JobSeekerProfileComponent } from './profile/job-seeker-profile.component';

@NgModule({
  declarations: [
    JobSeekerDashboardComponent,
    JobSearchComponent,
    ResumeManagementComponent,
    ApplicationsComponent,
    JobSeekerProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class JobSeekerModule { }
