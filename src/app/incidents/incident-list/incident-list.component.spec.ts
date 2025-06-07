import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidentListComponent } from './incident-list.component';
import {
  IncidentService,
  Incident,
} from '../../core/services/incident.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableDataSource } from '@angular/material/table';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('IncidentListComponent', () => {
  let component: IncidentListComponent;
  let fixture: ComponentFixture<IncidentListComponent>;
  let incidentServiceSpy: jasmine.SpyObj<IncidentService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockIncidents: Incident[] = [
    {
      id: 1,
      title: 'Test Incident',
      description: 'Test Description',
      type: 'HARDWARE',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const incidentService = jasmine.createSpyObj('IncidentService', [
      'getIncidents',
      'closeIncident',
    ]);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const toastr = jasmine.createSpyObj('ToastrService', ['success']);

    await TestBed.configureTestingModule({
      imports: [
        IncidentListComponent,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: IncidentService, useValue: incidentService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    incidentServiceSpy = TestBed.inject(
      IncidentService
    ) as jasmine.SpyObj<IncidentService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentListComponent);
    component = fixture.componentInstance;
    incidentServiceSpy.getIncidents.and.returnValue(of(mockIncidents));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load incidents on init', () => {
    expect(incidentServiceSpy.getIncidents).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockIncidents);
  });

  it('should apply filter correctly', () => {
    const event = { target: { value: 'Test' } } as unknown as Event;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('test');
  });

  it('should get correct status text', () => {
    expect(component.getStatusText('IN_PROGRESS')).toBe('En Progreso');
    expect(component.getStatusText('RESOLVED')).toBe('Resuelto');
    expect(component.getStatusText('CLOSED')).toBe('Cerrado');
    expect(component.getStatusText('UNKNOWN')).toBe('Pendiente');
  });

  it('should get correct priority text', () => {
    expect(component.getPriorityText('URGENT')).toBe('Urgente');
    expect(component.getPriorityText('HIGH')).toBe('Alta');
    expect(component.getPriorityText('MEDIUM')).toBe('Media');
    expect(component.getPriorityText('LOW')).toBe('Baja');
  });

  it('should get correct type text', () => {
    expect(component.getTypeText('HARDWARE')).toBe('Hardware');
    expect(component.getTypeText('SOFTWARE')).toBe('Software');
    expect(component.getTypeText('NETWORK')).toBe('Red');
    expect(component.getTypeText('OTHER')).toBe('Otro');
  });

  it('should navigate to incident details', () => {
    component.viewIncident(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/incidents', 1]);
  });

  it('should navigate to create incident', () => {
    component.createIncident();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/incidents/new']);
  });

  it('should close incident successfully', () => {
    incidentServiceSpy.closeIncident.and.returnValue(of(mockIncidents[0]));
    component.closeIncident(1);
    expect(incidentServiceSpy.closeIncident).toHaveBeenCalledWith(1);
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Incidencia cerrada correctamente',
      'Éxito'
    );
  });

  it('should handle error when closing incident', () => {
    incidentServiceSpy.closeIncident.and.returnValue(
      throwError(() => new Error('Test error'))
    );
    spyOn(console, 'error');
    component.closeIncident(1);
    expect(console.error).toHaveBeenCalled();
  });
});
