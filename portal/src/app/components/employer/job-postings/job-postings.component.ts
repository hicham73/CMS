import { Component, OnInit } from '@angular/core';
import { JobPosting } from '../../../models/job-posting.model';

@Component({
  selector: 'app-job-postings',
  templateUrl: './job-postings.component.html',
  styleUrls: ['./job-postings.component.scss']
})
export class JobPostingsComponent implements OnInit {
  jobPostings: Partial<JobPosting>[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.jobPostings = [
      {
        id: '1',
        title: 'Frontend Developer',
        description: 'We are looking for a skilled frontend developer...',
        location: 'Chicago, IL',
        jobType: 'full-time',
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 86400000)
      },
      {
        id: '2',
        title: 'UX Designer',
        description: 'Experienced UX designer needed for our growing team...',
        location: 'Remote',
        jobType: 'contract',
        isActive: true,
        createdAt: new Date(Date.now() - 3 * 86400000)
      }
    ];
  }

  toggleJobStatus(job: Partial<JobPosting>): void {
    job.isActive = !job.isActive;
    // In a real app, this would update the job in the database
  }

  deleteJob(jobId: string): void {
    this.jobPostings = this.jobPostings.filter(job => job.id !== jobId);
    // In a real app, this would delete the job from the database
  }
}
