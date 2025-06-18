import { Component, OnInit } from '@angular/core';
import { Location } from '../../../models/user.model';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  locations: Partial<Location>[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // In a real app, these would be fetched from a service
    this.locations = [
      {
        id: '1',
        name: 'Headquarters',
        address: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        contactPerson: 'John Smith',
        contactEmail: 'john@example.com',
        contactPhone: '(312) 555-1234'
      },
      {
        id: '2',
        name: 'Downtown Office',
        address: '456 State St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60605',
        contactPerson: 'Jane Doe',
        contactEmail: 'jane@example.com',
        contactPhone: '(312) 555-5678'
      }
    ];
  }

  deleteLocation(locationId: string): void {
    this.locations = this.locations.filter(location => location.id !== locationId);
    // In a real app, this would delete the location from the database
  }
}
