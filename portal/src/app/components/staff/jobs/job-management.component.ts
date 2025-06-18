import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class JobManagementComponent implements OnInit {
  jobs: any[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.jobs = [
      { 
        id: '1', 
        title: 'Software Developer', 
        company: 'Tech Solutions Inc.', 
        location: 'Chicago, IL',
        status: 'active'
      },
      { 
        id: '2', 
        title: 'Marketing Specialist', 
        company: 'Digital Marketing Co.', 
        location: 'Remote',
        status: 'active'
      }
    ];
  }
}
