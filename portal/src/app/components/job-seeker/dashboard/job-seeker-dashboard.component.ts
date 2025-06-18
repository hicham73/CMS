import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-job-seeker-dashboard',
  templateUrl: './job-seeker-dashboard.component.html',
  styleUrls: ['./job-seeker-dashboard.component.scss']
})
export class JobSeekerDashboardComponent implements OnInit {
  stats = {
    savedJobs: 0,
    applications: 0,
    viewedByEmployers: 0,
    matchingJobs: 0
  };

  recentJobs: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.stats = {
      savedJobs: 12,
      applications: 8,
      viewedByEmployers: 5,
      matchingJobs: 24
    };

    this.recentJobs = [
      { 
        id: '1', 
        title: 'Frontend Developer', 
        company: 'Tech Solutions Inc.', 
        location: 'Chicago, IL',
        postedDate: new Date(Date.now() - 2 * 86400000)
      },
      { 
        id: '2', 
        title: 'UX Designer', 
        company: 'Digital Marketing Co.', 
        location: 'Remote',
        postedDate: new Date(Date.now() - 3 * 86400000)
      },
      { 
        id: '3', 
        title: 'Full Stack Developer', 
        company: 'Startup Innovations', 
        location: 'New York, NY',
        postedDate: new Date(Date.now() - 1 * 86400000)
      }
    ];
  }
}
