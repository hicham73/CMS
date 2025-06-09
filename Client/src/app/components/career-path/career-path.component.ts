import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CareerPathService } from '../../services/career-path.service';
import { CareerStep } from '../../models/career-path.model';

@Component({
  selector: 'app-career-path',
  standalone: true,
  imports: [CommonModule],
  providers: [CareerPathService],
  templateUrl: './career-path.component.html',
  styleUrls: ['./career-path.component.scss']
})
export class CareerPathComponent implements OnInit {
  steps: CareerStep[] = [];
  activeStep: CareerStep | null = null;

  constructor(private careerPathService: CareerPathService) {}

  ngOnInit(): void {
    this.careerPathService.getCareerSteps().subscribe(steps => {
      this.steps = steps;
      this.activeStep = steps.find(step => step.isActive) || null;
    });
  }

  setActiveStep(step: CareerStep): void {
    this.steps.forEach(s => {
      if (s.id === step.id) {
        this.careerPathService.updateStep(s.id, { isActive: true });
      } else {
        this.careerPathService.updateStep(s.id, { isActive: false });
      }
    });
  }

  toggleSubStep(stepId: number, subStepId: number, isCompleted: boolean): void {
    this.careerPathService.updateSubStep(stepId, subStepId, isCompleted);
  }

  isLastStep(step: CareerStep): boolean {
    return this.steps.indexOf(step) === this.steps.length - 1;
  }
}
