// career-path.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CareerStep } from '../models/career-path.model';

@Injectable({
    providedIn: 'root'
})
export class CareerPathService {
    private careerSteps = new BehaviorSubject<CareerStep[]>([]);

    constructor() {
        // Initialize with sample data
        this.careerSteps.next([
            {
              id: 1,
              title: 'Profile Setup',
              description: 'Complete your professional profile',
              isActive: true,
              isCompleted: false,
              subSteps: [
                { id: 1, title: 'Basic Information', description: 'Fill in your personal details', isCompleted: false },
                { id: 2, title: 'Work Experience', description: 'Add your work history', isCompleted: false },
                { id: 3, title: 'Education', description: 'Add your educational background', isCompleted: false },
                { id: 4, title: 'Certifications & Licenses', description: 'Include any certifications', isCompleted: false }
              ]
            },
            {
              id: 2,
              title: 'Skills Assessment',
              description: 'Evaluate and document your professional skills',
              isActive: true,
              isCompleted: false,
              subSteps: [
                { id: 1, title: 'Technical Skills', description: 'Assess your technical competencies', isCompleted: false },
                { id: 2, title: 'Soft Skills', description: 'Evaluate interpersonal and communication skills', isCompleted: false },
                { id: 3, title: 'Digital Literacy', description: 'Test your proficiency with digital tools', isCompleted: false }
              ]
            },
            {
              id: 3,
              title: 'Career Planning',
              description: 'Define your career goals and preferences',
              isActive: true,
              isCompleted: false,
              subSteps: [
                { id: 1, title: 'Career Interests', description: 'Select roles or industries of interest', isCompleted: false },
                { id: 2, title: 'Location Preferences', description: 'Define preferred work locations', isCompleted: false },
                { id: 3, title: 'Work Availability', description: 'Set availability (full-time, part-time, etc.)', isCompleted: false }
              ]
            },
            {
              id: 4,
              title: 'Job Search & Application',
              description: 'Search and apply for suitable jobs',
              isActive: false,
              isCompleted: false,
              subSteps: [
                { id: 1, title: 'Job Matching', description: 'View recommended job listings', isCompleted: false },
                { id: 2, title: 'Application Tracking', description: 'Track submitted applications', isCompleted: false },
                { id: 3, title: 'Follow-ups & Feedback', description: 'Manage employer responses', isCompleted: false }
              ]
            }
          ]);
    }

    getCareerSteps(): Observable<CareerStep[]> {
        return this.careerSteps.asObservable();
    }

    updateStep(stepId: number, updates: Partial<CareerStep>): void {
        const currentSteps = this.careerSteps.value;
        const updatedSteps = currentSteps.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
        );
        this.careerSteps.next(updatedSteps);
    }

    updateSubStep(stepId: number, subStepId: number, isCompleted: boolean): void {
        const currentSteps = this.careerSteps.value;
        const updatedSteps = currentSteps.map(step => {
            if (step.id === stepId) {
                const updatedSubSteps = step.subSteps.map(subStep =>
                    subStep.id === subStepId ? { ...subStep, isCompleted } : subStep
                );
                return { ...step, subSteps: updatedSubSteps };
            }
            return step;
        });
        this.careerSteps.next(updatedSteps);
    }
}