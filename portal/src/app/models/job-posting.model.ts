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
    isHourly?: boolean;
  };
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  applicationDeadline?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
