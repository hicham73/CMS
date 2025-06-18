import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent implements OnInit {
  candidates: any[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.candidates = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        appliedFor: 'Frontend Developer',
        status: 'new',
        appliedDate: new Date(Date.now() - 2 * 86400000)
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        appliedFor: 'UX Designer',
        status: 'reviewed',
        appliedDate: new Date(Date.now() - 5 * 86400000)
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        appliedFor: 'Backend Developer',
        status: 'interviewed',
        appliedDate: new Date(Date.now() - 7 * 86400000)
      }
    ];
  }

  updateCandidateStatus(candidate: any, status: string): void {
    candidate.status = status;
    // In a real app, this would update the candidate in the database
  }
}
