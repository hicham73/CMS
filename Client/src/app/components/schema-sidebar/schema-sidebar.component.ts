import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchemaEntityService } from '../../services/schema-entity.service';
import { SchemaEntity } from '../../models/schema-entity.model';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-schema-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schema-sidebar.component.html',
  styleUrls: ['./schema-sidebar.component.scss']
})
export class SchemaSidebarComponent implements OnInit {
  entities$: Observable<SchemaEntity[]>;
  searchTerm = '';
  private searchTermSubject = new BehaviorSubject<string>('');

  constructor(private schemaEntityService: SchemaEntityService) {
    // Combine the search term with the entities to filter them
    this.entities$ = combineLatest([
      this.schemaEntityService.getEntities(),
      this.searchTermSubject.asObservable()
    ]).pipe(
      map(([entities, searchTerm]) => {
        if (!searchTerm.trim()) {
          return entities;
        }
        return entities.filter(entity => 
          entity.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }

  ngOnInit(): void {
    // Initialize with all entities
    this.searchTermSubject.next('');
  }

  onSearch(): void {
    this.searchTermSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchTermSubject.next('');
  }

  selectEntity(entity: SchemaEntity): void {
    // This method would be implemented to handle entity selection
    console.log('Selected entity:', entity);
    // Additional logic for when an entity is selected
  }
}
