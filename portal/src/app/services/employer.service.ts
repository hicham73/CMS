import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Employer, Location } from '../models/user.model';
import { JobPosting, JobApplication } from '../models/job.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployerService {
  // Mock data for demonstration
  private mockJobPostings: JobPosting[] = [
    {
      id: 'job1',
      employerId: 'emp1',
      title: 'Production Supervisor',
      description: 'Coast & Cascade is seeking an experienced Production Supervisor for our Portland location...',
      location: 'Portland, OR',
      jobType: 'full-time',
      salary: {
        min: 55000,
        max: 65000,
        period: 'yearly'
      },
      requiredSkills: ['Leadership', 'Inventory Management', 'Team Building'],
      preferredSkills: ['Retail Experience', 'Clothing Industry Knowledge'],
      requiredEducation: 'High School Diploma',
      experienceLevel: '3+ years',
      applicationDeadline: new Date('2025-07-15'),
      postedDate: new Date('2025-06-01'),
      status: 'active',
      applicationCount: 5,
      locationId: 'loc1'
    },
    {
      id: 'job2',
      employerId: 'emp1',
      title: 'Customer Service Representative',
      description: 'Coast & Cascade is seeking friendly Customer Service Representatives for our Salem location...',
      location: 'Salem, OR',
      jobType: 'part-time',
      salary: {
        min: 18,
        max: 22,
        period: 'hourly'
      },
      requiredSkills: ['Customer Service', 'Communication', 'Problem Solving'],
      requiredEducation: 'High School Diploma',
      experienceLevel: '1+ years',
      applicationDeadline: new Date('2025-07-30'),
      postedDate: new Date('2025-06-05'),
      status: 'active',
      applicationCount: 3,
      locationId: 'loc2'
    }
  ];

  private mockLocations: Location[] = [
    {
      id: 'loc1',
      name: 'Portland Store',
      address: '123 Main Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      contactPerson: 'Jane Smith',
      contactEmail: 'jane@coastcascade.com',
      contactPhone: '503-555-1234'
    },
    {
      id: 'loc2',
      name: 'Salem Store',
      address: '456 State Street',
      city: 'Salem',
      state: 'OR',
      zipCode: '97301',
      contactPerson: 'John Doe',
      contactEmail: 'john@coastcascade.com',
      contactPhone: '503-555-5678'
    },
    {
      id: 'loc3',
      name: 'Eugene Store',
      address: '789 Oak Avenue',
      city: 'Eugene',
      state: 'OR',
      zipCode: '97401',
      contactPerson: 'Alice Johnson',
      contactEmail: 'alice@coastcascade.com',
      contactPhone: '541-555-9012'
    }
  ];

  private mockJobApplications: JobApplication[] = [
    {
      id: 'app1',
      jobId: 'job1',
      jobSeekerId: 'js1',
      resumeId: 'res1',
      coverLetter: 'I am excited to apply for the Production Supervisor position...',
      status: 'submitted',
      submissionDate: new Date('2025-06-07')
    }
  ];

  constructor(private authService: AuthService) {}

  // Get employer profile
  getEmployerProfile(): Observable<Employer | null> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.userType !== 'employer') {
      return of(null);
    }
    return of(currentUser as Employer).pipe(delay(300));
  }

  // Update employer profile
  updateEmployerProfile(profile: Partial<Employer>): Observable<Employer> {
    const currentUser = this.authService.getCurrentUser() as Employer;
    const updatedUser = { ...currentUser, ...profile };
    
    // In a real app, this would make an API call
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return of(updatedUser).pipe(delay(500));
  }

  // Location methods
  getLocations(): Observable<Location[]> {
    const currentUser = this.authService.getCurrentUser();
    // In a real app, we'd filter by employer ID
    return of(this.mockLocations).pipe(delay(300));
  }

  getLocationById(locationId: string): Observable<Location | undefined> {
    return of(this.mockLocations.find(l => l.id === locationId)).pipe(delay(300));
  }

  addLocation(location: Partial<Location>): Observable<Location> {
    const newLocation: Location = {
      id: `loc${this.mockLocations.length + 1}`,
      name: location.name || '',
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      zipCode: location.zipCode || '',
      contactPerson: location.contactPerson,
      contactEmail: location.contactEmail,
      contactPhone: location.contactPhone
    };
    
    this.mockLocations.push(newLocation);
    return of(newLocation).pipe(delay(500));
  }

  updateLocation(locationId: string, location: Partial<Location>): Observable<Location> {
    const index = this.mockLocations.findIndex(l => l.id === locationId);
    if (index === -1) {
      throw new Error('Location not found');
    }
    
    this.mockLocations[index] = {
      ...this.mockLocations[index],
      ...location
    };
    
    return of(this.mockLocations[index]).pipe(delay(500));
  }

  deleteLocation(locationId: string): Observable<boolean> {
    const initialLength = this.mockLocations.length;
    this.mockLocations = this.mockLocations.filter(l => l.id !== locationId);
    return of(initialLength > this.mockLocations.length).pipe(delay(500));
  }

  // Job posting methods
  getJobPostings(): Observable<JobPosting[]> {
    const currentUser = this.authService.getCurrentUser();
    // In a real app, we'd filter by employer ID
    return of(this.mockJobPostings).pipe(delay(300));
  }

  getJobPostingById(jobId: string): Observable<JobPosting | undefined> {
    return of(this.mockJobPostings.find(j => j.id === jobId)).pipe(delay(300));
  }

  createJobPosting(job: Partial<JobPosting>): Observable<JobPosting> {
    const currentUser = this.authService.getCurrentUser();
    const newJob: JobPosting = {
      id: `job${this.mockJobPostings.length + 1}`,
      employerId: currentUser?.id as string,
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      jobType: job.jobType || 'full-time',
      salary: job.salary,
      requiredSkills: job.requiredSkills || [],
      preferredSkills: job.preferredSkills,
      requiredEducation: job.requiredEducation,
      experienceLevel: job.experienceLevel,
      applicationDeadline: job.applicationDeadline,
      postedDate: new Date(),
      status: 'active',
      applicationCount: 0,
      locationId: job.locationId
    };
    
    this.mockJobPostings.push(newJob);
    return of(newJob).pipe(delay(500));
  }

  updateJobPosting(jobId: string, job: Partial<JobPosting>): Observable<JobPosting> {
    const index = this.mockJobPostings.findIndex(j => j.id === jobId);
    if (index === -1) {
      throw new Error('Job posting not found');
    }
    
    this.mockJobPostings[index] = {
      ...this.mockJobPostings[index],
      ...job
    };
    
    return of(this.mockJobPostings[index]).pipe(delay(500));
  }

  closeJobPosting(jobId: string, reason: 'closed' | 'filled'): Observable<JobPosting> {
    const index = this.mockJobPostings.findIndex(j => j.id === jobId);
    if (index === -1) {
      throw new Error('Job posting not found');
    }
    
    this.mockJobPostings[index].status = reason;
    return of(this.mockJobPostings[index]).pipe(delay(500));
  }

  // Job application methods
  getApplicationsForJob(jobId: string): Observable<JobApplication[]> {
    return of(this.mockJobApplications.filter(a => a.jobId === jobId)).pipe(delay(300));
  }

  updateApplicationStatus(applicationId: string, status: JobApplication['status']): Observable<JobApplication> {
    const index = this.mockJobApplications.findIndex(a => a.id === applicationId);
    if (index === -1) {
      throw new Error('Job application not found');
    }
    
    this.mockJobApplications[index].status = status;
    this.mockJobApplications[index].lastUpdated = new Date();
    
    return of(this.mockJobApplications[index]).pipe(delay(500));
  }

  // Job seeker search
  searchJobSeekers(criteria: { skills?: string[], location?: string, education?: string }): Observable<any[]> {
    // In a real app, this would search the database
    // For demo, we'll return a mock result
    return of([
      {
        id: 'js1',
        name: 'Marcus Johnson',
        location: 'Portland, OR',
        skills: ['Customer Service', 'Inventory Management', 'Team Leadership'],
        education: 'High School Diploma',
        matchScore: 85
      },
      {
        id: 'js2',
        name: 'Sarah Williams',
        location: 'Salem, OR',
        skills: ['Customer Service', 'Sales', 'Retail'],
        education: 'Associate Degree',
        matchScore: 70
      }
    ]).pipe(delay(800));
  }

  // Verification methods (for staff)
  verifyEmployer(employerId: string): Observable<Employer> {
    const employer = { ...this.authService.getCurrentUser() as Employer, verified: true };
    localStorage.setItem('currentUser', JSON.stringify(employer));
    return of(employer).pipe(delay(500));
  }
}
