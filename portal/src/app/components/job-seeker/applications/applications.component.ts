import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  applications: any[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.applications = [
      {
        id: '1',
        jobTitle: 'Frontend Developer',
        company: 'Tech Solutions Inc.',
        location: 'Chicago, IL',
        appliedDate: new Date(Date.now() - 7 * 86400000),
        status: 'applied',
        notes: 'Applied through company website'
      },
      {
        id: '2',
        jobTitle: 'UX Designer',
        company: 'Digital Marketing Co.',
        location: 'Remote',
        appliedDate: new Date(Date.now() - 14 * 86400000),
        status: 'interview',
        notes: 'Phone interview scheduled for next week'
      },
      {
        id: '3',
        jobTitle: 'Full Stack Developer',
        company: 'Startup Innovations',
        location: 'New York, NY',
        appliedDate: new Date(Date.now() - 21 * 86400000),
        status: 'rejected',
        notes: 'Position filled internally'
      }
    ];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'applied':
        return 'text-primary';
      case 'interview':
        return 'text-success';
      case 'offer':
        return 'text-warning';
      case 'rejected':
        return 'text-danger';
      default:
        return '';
    }
  }

  updateNotes(application: any, notes: string): void {
    application.notes = notes;
    // In a real app, this would update the notes in the database
  }

  withdrawApplication(applicationId: string): void {
    this.applications = this.applications.filter(app => app.id !== applicationId);
    // In a real app, this would update the application status in the database
  }
}
