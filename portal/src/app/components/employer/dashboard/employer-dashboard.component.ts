import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employer-dashboard',
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.scss']
})
export class EmployerDashboardComponent implements OnInit {
  stats = {
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    viewsToday: 0
  };

  recentApplications: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.stats = {
      activeJobs: 5,
      totalApplications: 27,
      newApplications: 3,
      viewsToday: 42
    };

    this.recentApplications = [
      { id: 1, name: 'John Doe', position: 'Frontend Developer', date: new Date(), status: 'new' },
      { id: 2, name: 'Jane Smith', position: 'UX Designer', date: new Date(Date.now() - 86400000), status: 'reviewed' },
      { id: 3, name: 'Mike Johnson', position: 'Backend Developer', date: new Date(Date.now() - 172800000), status: 'interviewed' }
    ];
  }
}
