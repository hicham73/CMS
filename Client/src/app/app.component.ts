import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AssessmentComponent } from "./components/assessment/assessment.component";
import { CareerPathComponent } from "./components/career-path/career-path.component";
import { StaffScheduleComponent } from "./components/staff-schedule/staff-schedule.component";
import { CONFIG, DEFAULT_CONFIG } from "./config";
import { AssessmentService } from "./services/assessment.service";
import { ComponentSelectorService } from "./services/component-selector.service";
import { CrmService } from "./services/crm.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AssessmentComponent,
    CareerPathComponent,
    StaffScheduleComponent
  ],
  providers: [
    { provide: CONFIG, useValue: DEFAULT_CONFIG },
    CrmService,
    AssessmentService,
    ComponentSelectorService
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'cms';

  constructor(private componentSelector: ComponentSelectorService) {
    console.log('AppComponent initialized');
  }

  ngAfterViewInit() {
    // Read the component attribute from the DOM after view initialization
    setTimeout(() => {
      const appRootElement = document.querySelector('app-root');
      if (appRootElement) {
        const componentAttr = appRootElement.getAttribute('component');
        console.log('Component attribute from DOM:', componentAttr);
        if (componentAttr) {
          this.componentSelector.setActiveComponent(componentAttr);
        }
      }
    }, 0);
  }

  // Use the component selector service to get the active component
  get activeComponent(): string {
    return this.componentSelector.activeComponent;
  }
}
