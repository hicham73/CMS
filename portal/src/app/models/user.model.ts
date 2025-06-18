import { JobPosting } from './job-posting.model';

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'jobseeker' | 'employer' | 'staff';
  createdAt?: Date;
}

export interface JobSeeker extends User {
  userType: 'jobseeker';
  education?: string;
  employmentStatus?: string;
  isVeteran?: boolean;
  isTradeProgramParticipant?: boolean;
  barriers?: string[];
  accessibilityPreferences?: {
    highContrast?: boolean;
    largeFont?: boolean;
    screenReader?: boolean;
    keyboardOnly?: boolean;
    preferredLanguage?: string;
  };
  resumes?: Resume[];
  jobAlerts?: JobAlert[];
}

export interface Employer extends User {
  userType: 'employer';
  companyName: string;
  industry: string;
  locations?: Location[];
  verified?: boolean;
  jobPostings?: JobPosting[];
}

export interface Staff extends User {
  userType: 'staff';
  department?: string;
  role?: string;
}

export interface Resume {
  id?: string;
  userId: string;
  title: string;
  content: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description: string;
}

export interface Education {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface JobAlert {
  id?: string;
  userId: string;
  keywords: string[];
  location?: string;
  jobTypes?: string[];
  industries?: string[];
  frequency: 'daily' | 'weekly' | 'immediate';
  active: boolean;
  createdAt?: Date;
}

export interface Location {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}
