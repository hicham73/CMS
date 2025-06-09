import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaSidebarComponent } from './schema-sidebar.component';

describe('SchemaSidebarComponent', () => {
  let component: SchemaSidebarComponent;
  let fixture: ComponentFixture<SchemaSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
