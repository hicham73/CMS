import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { JobSeeker, Resume, JobAlert } from '../models/user.model';
import { JobPosting, JobApplication, JobMatch } from '../models/job.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class JobSeekerService {
  // Mock data for demonstration
  private mockResumes: Resume[] = [
    {
      id: 'res1',
      userId: 'js1',
      title: 'General Resume',
      content: 'Experienced professional with background in manufacturing...',
      skills: ['Customer Service', 'Inventory Management', 'Team Leadership'],
      experience: [
        {
          company: 'ABC Manufacturing',
          position: 'Production Supervisor',
          startDate: new Date('2020-03-01'),
          endDate: new Date('2025-05-01'),
          description: 'Supervised team of 15 production workers. Managed scheduling and quality control.'
        }
      ],
      education: [
        {
          institution: 'Oregon Community College',
          degree: 'High School Diploma',
          fieldOfStudy: 'General Education',
          startDate: new Date('2000-09-01'),
          endDate: new Date('2004-06-01'),
          description: 'Graduated with honors'
        }
      ],
      isDefault: true,
      createdAt: new Date('2025-05-20'),
      updatedAt: new Date('2025-05-20')
    }
  ];

  private mockJobAlerts: JobAlert[] = [
    {
      id: 'alert1',
      userId: 'js1',
      keywords: ['manufacturing', 'production', 'supervisor'],
      location: 'Portland, OR',
      jobTypes: ['full-time'],
      industries: ['Manufacturing'],
      frequency: 'daily',
      active: true,
      createdAt: new Date('2025-05-20')
    }
  ];

  private mockJobApplications: JobApplication[] = [];

  private mockJobMatches: JobMatch[] = [
    {
      jobSeekerId: 'js1',
      jobId: 'job1',
      matchScore: 85,
      matchedSkills: ['Customer Service', 'Team Leadership'],
      matchedExperience: true,
      matchedEducation: true,
      matchedLocation: true
    },
    {
      jobSeekerId: 'js1',
      jobId: 'job2',
      matchScore: 70,
      matchedSkills: ['Customer Service'],
      matchedExperience: false,
      matchedEducation: true,
      matchedLocation: true
    }
  ];

  constructor(private authService: AuthService) {}

  // Get job seeker profile
  getJobSeekerProfile(): Observable<JobSeeker | null> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.userType !== 'jobseeker') {
      return of(null);
    }
    return of(currentUser as JobSeeker).pipe(delay(300));
  }

  // Update job seeker profile
  updateJobSeekerProfile(profile: Partial<JobSeeker>): Observable<JobSeeker> {
    const currentUser = this.authService.getCurrentUser() as JobSeeker;
    const updatedUser = { ...currentUser, ...profile };
    
    // In a real app, this would make an API call
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return of(updatedUser).pipe(delay(500));
  }

  // Resume methods
  getResumes(userId?: string): Observable<Resume[]> {
    const id = userId || (this.authService.getCurrentUser()?.id as string);
    return of(this.mockResumes.filter(r => r.userId === id)).pipe(delay(300));
  }

  getResumeById(resumeId: string): Observable<Resume | undefined> {
    return of(this.mockResumes.find(r => r.id === resumeId)).pipe(delay(300));
  }

  createResume(resume: Partial<Resume>): Observable<Resume> {
    const currentUser = this.authService.getCurrentUser();
    const newResume: Resume = {
      id: `res${this.mockResumes.length + 1}`,
      userId: currentUser?.id as string,
      title: resume.title || 'Untitled Resume',
      content: resume.content || '',
      skills: resume.skills || [],
      experience: resume.experience || [],
      education: resume.education || [],
      isDefault: this.mockResumes.filter(r => r.userId === currentUser?.id).length === 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockResumes.push(newResume);
    return of(newResume).pipe(delay(500));
  }

  updateResume(resumeId: string, resume: Partial<Resume>): Observable<Resume> {
    const index = this.mockResumes.findIndex(r => r.id === resumeId);
    if (index === -1) {
      throw new Error('Resume not found');
    }
    
    this.mockResumes[index] = {
      ...this.mockResumes[index],
      ...resume,
      updatedAt: new Date()
    };
    
    return of(this.mockResumes[index]).pipe(delay(500));
  }

  deleteResume(resumeId: string): Observable<boolean> {
    const initialLength = this.mockResumes.length;
    this.mockResumes = this.mockResumes.filter(r => r.id !== resumeId);
    return of(initialLength > this.mockResumes.length).pipe(delay(500));
  }

  // Job alert methods
  getJobAlerts(): Observable<JobAlert[]> {
    const currentUser = this.authService.getCurrentUser();
    return of(this.mockJobAlerts.filter(a => a.userId === currentUser?.id)).pipe(delay(300));
  }

  createJobAlert(alert: Partial<JobAlert>): Observable<JobAlert> {
    const currentUser = this.authService.getCurrentUser();
    const newAlert: JobAlert = {
      id: `alert${this.mockJobAlerts.length + 1}`,
      userId: currentUser?.id as string,
      keywords: alert.keywords || [],
      location: alert.location,
      jobTypes: alert.jobTypes,
      industries: alert.industries,
      frequency: alert.frequency || 'daily',
      active: true,
      createdAt: new Date()
    };
    
    this.mockJobAlerts.push(newAlert);
    return of(newAlert).pipe(delay(500));
  }

  updateJobAlert(alertId: string, alert: Partial<JobAlert>): Observable<JobAlert> {
    const index = this.mockJobAlerts.findIndex(a => a.id === alertId);
    if (index === -1) {
      throw new Error('Job alert not found');
    }
    
    this.mockJobAlerts[index] = {
      ...this.mockJobAlerts[index],
      ...alert
    };
    
    return of(this.mockJobAlerts[index]).pipe(delay(500));
  }

  deleteJobAlert(alertId: string): Observable<boolean> {
    const initialLength = this.mockJobAlerts.length;
    this.mockJobAlerts = this.mockJobAlerts.filter(a => a.id !== alertId);
    return of(initialLength > this.mockJobAlerts.length).pipe(delay(500));
  }

  // Job application methods
  applyForJob(jobId: string, resumeId: string, coverLetter?: string): Observable<JobApplication> {
    const currentUser = this.authService.getCurrentUser();
    const newApplication: JobApplication = {
      id: `app${this.mockJobApplications.length + 1}`,
      jobId,
      jobSeekerId: currentUser?.id as string,
      resumeId,
      coverLetter,
      status: 'submitted',
      submissionDate: new Date()
    };
    
    this.mockJobApplications.push(newApplication);
    return of(newApplication).pipe(delay(500));
  }

  getJobApplications(): Observable<JobApplication[]> {
    const currentUser = this.authService.getCurrentUser();
    return of(this.mockJobApplications.filter(a => a.jobSeekerId === currentUser?.id)).pipe(delay(300));
  }

  // Job matching
  getJobMatches(): Observable<{ job: JobPosting, match: JobMatch }[]> {
    const currentUser = this.authService.getCurrentUser();
    
    // This would normally be a complex algorithm on the server
    // For demo, we'll return mock data
    return of(this.mockJobMatches.filter(m => m.jobSeekerId === currentUser?.id))
      .pipe(
        delay(500),
        map(matches => {
          // In a real app, we'd fetch the actual job postings
          // For demo, we'll create mock job postings
          return matches.map(match => ({
            job: {
              id: match.jobId,
              employerId: 'emp1',
              title: match.jobId === 'job1' ? 'Production Supervisor' : 'Customer Service Representative',
              description: 'Lorem ipsum dolor sit amet...',
              location: 'Portland, OR',
              jobType: 'full-time',
              requiredSkills: ['Customer Service'],
              postedDate: new Date('2025-06-01'),
              status: 'active'
            },
            match
          }));
        })
      );
  }

  // Accessibility preferences
  updateAccessibilityPreferences(preferences: JobSeeker['accessibilityPreferences']): Observable<JobSeeker> {
    return this.updateJobSeekerProfile({ accessibilityPreferences: preferences });
  }
}
