import { Routes } from '@angular/router';
import { CareerPathComponent } from './components/career-path/career-path.component';
import { AssessmentComponent } from './components/assessment/assessment.component';

export const routes: Routes = [
  { path: '', component: CareerPathComponent },
  { path: 'assessment', component: AssessmentComponent },
];
