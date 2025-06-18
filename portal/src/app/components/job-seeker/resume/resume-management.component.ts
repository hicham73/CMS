import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Resume } from '../../../models/user.model';

@Component({
  selector: 'app-resume-management',
  templateUrl: './resume-management.component.html',
  styleUrls: ['./resume-management.component.scss']
})
export class ResumeManagementComponent implements OnInit {
  resumes: Partial<Resume>[] = [];
  resumeForm!: FormGroup;
  isEditing = false;
  currentResumeId: string | null = null;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.loadResumes();
  }

  initForm(resume?: Partial<Resume>): void {
    this.resumeForm = this.fb.group({
      title: [resume?.title || '', Validators.required],
      content: [resume?.content || '', Validators.required],
      skills: [resume?.skills?.join(', ') || ''],
      isDefault: [resume?.isDefault || false]
    });
  }

  loadResumes(): void {
    // In a real app, these would be fetched from a service
    this.resumes = [
      {
        id: '1',
        title: 'Software Developer Resume',
        content: 'Professional resume content for software development roles...',
        skills: ['JavaScript', 'TypeScript', 'Angular', 'React'],
        isDefault: true,
        createdAt: new Date(Date.now() - 30 * 86400000),
        updatedAt: new Date(Date.now() - 5 * 86400000)
      },
      {
        id: '2',
        title: 'UX Designer Resume',
        content: 'Creative resume highlighting UX/UI design skills...',
        skills: ['UI Design', 'User Research', 'Figma', 'Adobe XD'],
        isDefault: false,
        createdAt: new Date(Date.now() - 60 * 86400000),
        updatedAt: new Date(Date.now() - 15 * 86400000)
      }
    ];
  }

  onSubmit(): void {
    if (this.resumeForm.valid) {
      const formValue = this.resumeForm.value;
      const skills = formValue.skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill);
      
      const resumeData: Partial<Resume> = {
        title: formValue.title,
        content: formValue.content,
        skills: skills,
        isDefault: formValue.isDefault
      };
      
      if (this.isEditing && this.currentResumeId) {
        // Update existing resume
        const index = this.resumes.findIndex(r => r.id === this.currentResumeId);
        if (index !== -1) {
          this.resumes[index] = {
            ...this.resumes[index],
            ...resumeData,
            updatedAt: new Date()
          };
        }
      } else {
        // Create new resume
        const newResume: Partial<Resume> = {
          id: Date.now().toString(),
          ...resumeData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.resumes.push(newResume);
      }
      
      this.resetForm();
    }
  }

  editResume(resume: Partial<Resume>): void {
    this.isEditing = true;
    this.currentResumeId = resume.id || null;
    this.initForm(resume);
  }

  deleteResume(resumeId: string): void {
    this.resumes = this.resumes.filter(resume => resume.id !== resumeId);
    // In a real app, this would delete the resume from the database
  }

  setDefaultResume(resumeId: string): void {
    this.resumes = this.resumes.map(resume => ({
      ...resume,
      isDefault: resume.id === resumeId
    }));
    // In a real app, this would update the default resume in the database
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentResumeId = null;
    this.initForm();
  }
}
