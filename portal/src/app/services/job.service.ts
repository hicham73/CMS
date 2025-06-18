import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { JobPosting, JobApplication, JobMatch } from '../models/job.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  // Mock data for demonstration
  private mockJobPostings: JobPosting[] = [
    {
      id: 'job1',
      employerId: 'emp1',
      title: 'Production Supervisor',
      description: 'Coast & Cascade is seeking an experienced Production Supervisor for our Portland location. Responsibilities include overseeing daily operations, managing staff schedules, ensuring quality control, and maintaining inventory. The ideal candidate will have 3+ years of supervisory experience in retail or manufacturing.',
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
      description: 'Coast & Cascade is seeking friendly Customer Service Representatives for our Salem location. Responsibilities include assisting customers, processing sales, handling returns, and maintaining store appearance. Part-time position with flexible hours.',
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
    },
    {
      id: 'job3',
      employerId: 'emp1',
      title: 'Retail Sales Associate',
      description: 'Coast & Cascade is looking for enthusiastic Sales Associates for our Eugene location. Join our team and help customers find the perfect clothing items while providing exceptional service.',
      location: 'Eugene, OR',
      jobType: 'full-time',
      salary: {
        min: 16,
        max: 20,
        period: 'hourly'
      },
      requiredSkills: ['Sales', 'Customer Service', 'Merchandising'],
      requiredEducation: 'High School Diploma',
      experienceLevel: 'Entry Level',
      applicationDeadline: new Date('2025-07-20'),
      postedDate: new Date('2025-06-03'),
      status: 'active',
      applicationCount: 7,
      locationId: 'loc3'
    }
  ];

  constructor(private authService: AuthService) {}

  // Get all job postings
  getAllJobPostings(): Observable<JobPosting[]> {
    return of(this.mockJobPostings.filter(job => job.status === 'active')).pipe(delay(300));
  }

  // Search jobs with filters
  searchJobs(filters: {
    keywords?: string[],
    location?: string,
    jobType?: string[],
    salary?: { min?: number, max?: number },
    skills?: string[],
    education?: string,
    experienceLevel?: string
  }): Observable<JobPosting[]> {
    // In a real app, this would be a complex database query
    // For demo, we'll do simple filtering
    let filteredJobs = this.mockJobPostings.filter(job => job.status === 'active');
    
    if (filters.keywords && filters.keywords.length > 0) {
      filteredJobs = filteredJobs.filter(job => {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        return filters.keywords!.some(keyword => jobText.includes(keyword.toLowerCase()));
      });
    }
    
    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters.jobType && filters.jobType.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        filters.jobType!.includes(job.jobType)
      );
    }
    
    if (filters.salary) {
      if (filters.salary.min !== undefined) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.salary) return true;
          if (job.salary.period === 'hourly') return job.salary.min >= filters.salary!.min! / 2080;
          if (job.salary.period === 'yearly') return job.salary.min >= filters.salary!.min!;
          return true;
        });
      }
      
      if (filters.salary.max !== undefined) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.salary) return true;
          if (job.salary.period === 'hourly') return job.salary.max <= filters.salary!.max! / 2080;
          if (job.salary.period === 'yearly') return job.salary.max <= filters.salary!.max!;
          return true;
        });
      }
    }
    
    if (filters.skills && filters.skills.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        filters.skills!.some(skill => 
          job.requiredSkills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          ) || 
          job.preferredSkills?.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    if (filters.education) {
      filteredJobs = filteredJobs.filter(job => 
        !job.requiredEducation || 
        job.requiredEducation.toLowerCase().includes(filters.education!.toLowerCase())
      );
    }
    
    if (filters.experienceLevel) {
      filteredJobs = filteredJobs.filter(job => 
        !job.experienceLevel || 
        job.experienceLevel.toLowerCase().includes(filters.experienceLevel.toLowerCase())
      );
    }
    
    return of(filteredJobs).pipe(delay(500));
  }

  // Get job by ID
  getJobById(jobId: string): Observable<JobPosting | undefined> {
    return of(this.mockJobPostings.find(job => job.id === jobId)).pipe(delay(300));
  }

  // Get related jobs
  getRelatedJobs(jobId: string): Observable<JobPosting[]> {
    const job = this.mockJobPostings.find(j => j.id === jobId);
    if (!job) {
      return of([]);
    }
    
    // Find jobs with similar skills or location
    const relatedJobs = this.mockJobPostings.filter(j => 
      j.id !== jobId && 
      j.status === 'active' &&
      (j.location === job.location || 
       j.requiredSkills.some(skill => job.requiredSkills.includes(skill)))
    );
    
    return of(relatedJobs.slice(0, 3)).pipe(delay(300));
  }

  // Job matching algorithm
  matchJobsToJobSeeker(jobSeekerId: string, skills: string[], education: string, location: string): Observable<JobMatch[]> {
    // In a real app, this would be a complex algorithm
    // For demo, we'll do simple matching
    const matches: JobMatch[] = [];
    
    this.mockJobPostings.filter(job => job.status === 'active').forEach(job => {
      const matchedSkills = job.requiredSkills.filter(skill => 
        skills.some(s => s.toLowerCase() === skill.toLowerCase())
      );
      
      const matchedEducation = !job.requiredEducation || 
        job.requiredEducation.toLowerCase().includes(education.toLowerCase());
      
      const matchedLocation = job.location.toLowerCase().includes(location.toLowerCase());
      
      // Calculate a simple match score
      let matchScore = 0;
      if (matchedSkills.length > 0) {
        matchScore += (matchedSkills.length / job.requiredSkills.length) * 50;
      }
      if (matchedEducation) matchScore += 25;
      if (matchedLocation) matchScore += 25;
      
      if (matchScore > 0) {
        matches.push({
          jobSeekerId,
          jobId: job.id!,
          matchScore,
          matchedSkills,
          matchedEducation,
          matchedLocation
        });
      }
    });
    
    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return of(matches).pipe(delay(500));
  }

  // Job application status
  getApplicationStatus(applicationId: string): Observable<JobApplication | undefined> {
    // In a real app, this would fetch from the database
    // For demo, we'll return a mock application
    const mockApplication: JobApplication = {
      id: applicationId,
      jobId: 'job1',
      jobSeekerId: 'js1',
      resumeId: 'res1',
      status: 'submitted',
      submissionDate: new Date('2025-06-07')
    };
    
    return of(mockApplication).pipe(delay(300));
  }
}
