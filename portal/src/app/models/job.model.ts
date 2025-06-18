export interface JobPosting {
  id?: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  salary?: {
    min?: number;
    max?: number;
    period?: 'hourly' | 'weekly' | 'monthly' | 'yearly';
  };
  requiredSkills: string[];
  preferredSkills?: string[];
  requiredEducation?: string;
  experienceLevel?: string;
  applicationDeadline?: Date;
  postedDate?: Date;
  status: 'active' | 'closed' | 'filled' | 'draft';
  applicationCount?: number;
  contactEmail?: string;
  contactPhone?: string;
  locationId?: string;
}

export interface JobApplication {
  id?: string;
  jobId: string;
  jobSeekerId: string;
  resumeId: string;
  coverLetter?: string;
  status: 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'hired';
  submissionDate?: Date;
  lastUpdated?: Date;
  employerNotes?: string;
}

export interface JobMatch {
  jobSeekerId: string;
  jobId: string;
  matchScore: number;
  matchedSkills: string[];
  matchedExperience?: boolean;
  matchedEducation?: boolean;
  matchedLocation?: boolean;
}
