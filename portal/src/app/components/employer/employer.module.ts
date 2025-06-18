import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import components
import { EmployerDashboardComponent } from './dashboard/employer-dashboard.component';
import { JobPostingsComponent } from './job-postings/job-postings.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { LocationsComponent } from './locations/locations.component';
import { EmployerProfileComponent } from './profile/employer-profile.component';

// Define routes for employer module
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: EmployerDashboardComponent },
  { path: 'jobs', component: JobPostingsComponent },
  { path: 'candidates', component: CandidatesComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'profile', component: EmployerProfileComponent }
];

@NgModule({
  declarations: [
    EmployerDashboardComponent,
    JobPostingsComponent,
    CandidatesComponent,
    LocationsComponent,
    EmployerProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerModule { }
