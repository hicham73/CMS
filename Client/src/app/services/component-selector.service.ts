import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentSelectorService {
  private activeComponentSubject = new BehaviorSubject<string>('assessment');
  activeComponent$ = this.activeComponentSubject.asObservable();

  constructor() {
    // Try to read component from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const componentParam = urlParams.get('component');
    
    if (componentParam) {
      this.setActiveComponent(componentParam);
    }
  }

  setActiveComponent(component: string): void {
    this.activeComponentSubject.next(component);
  }

  get activeComponent(): string {
    return this.activeComponentSubject.value;
  }
}
