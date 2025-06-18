import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.users = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', userType: 'jobseeker' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', userType: 'employer' }
    ];
  }
}
