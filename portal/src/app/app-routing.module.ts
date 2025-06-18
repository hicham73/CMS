import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Define routes for the application
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Job Seeker routes
  { 
    path: 'job-seeker',
    children: [
      { path: 'dashboard', loadChildren: () => import('./components/job-seeker/job-seeker.module').then(m => m.JobSeekerModule) },
      { path: 'jobs', loadChildren: () => import('./components/job-seeker/job-seeker.module').then(m => m.JobSeekerModule) },
      { path: 'resumes', loadChildren: () => import('./components/job-seeker/job-seeker.module').then(m => m.JobSeekerModule) },
      { path: 'applications', loadChildren: () => import('./components/job-seeker/job-seeker.module').then(m => m.JobSeekerModule) },
      { path: 'profile', loadChildren: () => import('./components/job-seeker/job-seeker.module').then(m => m.JobSeekerModule) }
    ]
  },
  
  // Employer routes
  {
    path: 'employer',
    children: [
      { path: 'dashboard', loadChildren: () => import('./components/employer/employer.module').then(m => m.EmployerModule) },
      { path: 'jobs', loadChildren: () => import('./components/employer/employer.module').then(m => m.EmployerModule) },
      { path: 'candidates', loadChildren: () => import('./components/employer/employer.module').then(m => m.EmployerModule) },
      { path: 'locations', loadChildren: () => import('./components/employer/employer.module').then(m => m.EmployerModule) },
      { path: 'profile', loadChildren: () => import('./components/employer/employer.module').then(m => m.EmployerModule) }
    ]
  },
  
  // Staff routes
  {
    path: 'staff',
    children: [
      { path: 'dashboard', loadChildren: () => import('./components/staff/staff.module').then(m => m.StaffModule) },
      { path: 'job-seekers', loadChildren: () => import('./components/staff/staff.module').then(m => m.StaffModule) },
      { path: 'employers', loadChildren: () => import('./components/staff/staff.module').then(m => m.StaffModule) }
    ]
  },
  
  // Auth routes
  { path: 'login', loadChildren: () => import('./components/shared/auth/auth.module').then(m => m.AuthModule) },
  { path: 'register', loadChildren: () => import('./components/shared/auth/auth.module').then(m => m.AuthModule) },
  { path: 'password-reset', loadChildren: () => import('./components/shared/auth/auth.module').then(m => m.AuthModule) },
  
  // Profile route
  { path: 'profile', loadChildren: () => import('./components/shared/profile/profile.module').then(m => m.ProfileModule) },
  
  // Fallback route
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
