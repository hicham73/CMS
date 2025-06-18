import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class StaffDashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    newUsersToday: 0,
    activeJobPostings: 0,
    pendingEmployerVerifications: 0
  };

  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.stats = {
      totalUsers: 1250,
      newUsersToday: 15,
      activeJobPostings: 328,
      pendingEmployerVerifications: 12
    };
  }
}
