import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SchemaEntity } from '../models/schema-entity.model';

@Injectable({
  providedIn: 'root'
})
export class SchemaEntityService {
  // Mock data for demonstration purposes
  private mockEntities: SchemaEntity[] = [
    {
      id: '1',
      name: 'User',
      description: 'User entity schema',
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Product',
      description: 'Product entity schema',
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Order',
      description: 'Order entity schema',
      type: 'object',
      properties: {
        orderNumber: { type: 'string' },
        items: { type: 'array' },
        total: { type: 'number' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Category',
      description: 'Category entity schema',
      type: 'object',
      properties: {
        name: { type: 'string' },
        parent: { type: 'string' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      name: 'Customer',
      description: 'Customer entity schema',
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private entitiesSubject = new BehaviorSubject<SchemaEntity[]>(this.mockEntities);
  entities$ = this.entitiesSubject.asObservable();

  constructor() { }

  getEntities(): Observable<SchemaEntity[]> {
    // In a real application, this would be an HTTP request to a backend API
    return this.entities$;
  }

  getEntityById(id: string): Observable<SchemaEntity | undefined> {
    const entity = this.mockEntities.find(e => e.id === id);
    return of(entity);
  }

  filterEntitiesByName(searchTerm: string): Observable<SchemaEntity[]> {
    if (!searchTerm.trim()) {
      return of(this.mockEntities);
    }
    
    const filteredEntities = this.mockEntities.filter(entity => 
      entity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return of(filteredEntities);
  }

  // Additional methods for CRUD operations would be added here in a real application
}
