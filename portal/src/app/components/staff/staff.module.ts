import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Define routes for the staff module
const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./jobs/job-management.component').then(m => m.JobManagementComponent)
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class StaffModule { }
