import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { JobPosting } from '../../../models/job-posting.model';

@Component({
  selector: 'app-job-search',
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.scss']
})
export class JobSearchComponent implements OnInit {
  searchForm!: FormGroup;
  jobs: Partial<JobPosting>[] = [];
  savedJobs: string[] = [];
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.loadJobs();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      keywords: [''],
      location: [''],
      jobType: [''],
      distance: [25]
    });
  }

  loadJobs(): void {
    // In a real app, these would be fetched from a service based on search criteria
    this.jobs = [
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
      },
      {
        id: '3',
        title: 'Full Stack Developer',
        description: 'Join our team as a full stack developer...',
        location: 'New York, NY',
        jobType: 'full-time',
        isActive: true,
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ];
  }

  onSearch(): void {
    // In a real app, this would trigger a new search with the form values
    console.log('Search criteria:', this.searchForm.value);
    this.loadJobs();
  }

  toggleSaveJob(jobId: string): void {
    if (this.savedJobs.includes(jobId)) {
      this.savedJobs = this.savedJobs.filter(id => id !== jobId);
    } else {
      this.savedJobs.push(jobId);
    }
    // In a real app, this would update the saved jobs in the database
  }

  isSaved(jobId: string): boolean {
    return this.savedJobs.includes(jobId);
  }
}
