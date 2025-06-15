import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { IncidentFormComponent } from './incident-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

// Define status constants as needed for the test
const OPEN = 'OPEN';
const RESOLVED = 'RESOLVED';
const CLOSED = 'CLOSED';

const mockIncident = {
  id: '1',
  user: '1',
  title: 'Valid Title',
  description: 'Valid description for incident',
  status: OPEN as 'OPEN', // Assuming OPEN is the first status
  createdAt: '1',
  managerId: '2',
  resolvedAt: '1',
  managerComment: 'Valid comment for incident',
};
import { of, throwError } from 'rxjs';

describe('IncidentFormComponent', () => {
  let component: IncidentFormComponent;
  let fixture: ComponentFixture<IncidentFormComponent>;
  let toastrService: jasmine.SpyObj<ToastrService>;
  let router: jasmine.SpyObj<Router>;
  let incidentService: jasmine.SpyObj<IncidentService>;

  beforeEach(async () => {
    toastrService = jasmine.createSpyObj('ToastrService', ['error', 'success']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    incidentService = jasmine.createSpyObj('IncidentService', [
      'reportIncident',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
      ],
      declarations: [IncidentFormComponent],
      providers: [
        { provide: ToastrService, useValue: toastrService },
        { provide: Router, useValue: router },
        { provide: IncidentService, useValue: incidentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.incidentForm).toBeDefined();
    expect(component.incidentForm.get('title')).toBeTruthy();
    expect(component.incidentForm.get('description')).toBeTruthy();
    expect(component.incidentForm.get('type')).toBeTruthy();
    expect(component.incidentForm.get('priority')).toBeTruthy();
  });

  it('should return required error message', () => {
    component.incidentForm.get('title')?.markAsTouched();
    component.incidentForm.get('title')?.setValue('');
    expect(component.getErrorMessage('title')).toBe('Este campo es requerido');
  });

  it('should return minlength error message', () => {
    component.incidentForm.get('title')?.setValue('abc');
    component.incidentForm.get('title')?.markAsTouched();
    expect(component.getErrorMessage('title')).toContain('Debe tener al menos');
  });

  it('should return maxlength error message', () => {
    const longTitle = 'a'.repeat(101);
    component.incidentForm.get('title')?.setValue(longTitle);
    component.incidentForm.get('title')?.markAsTouched();
    expect(component.getErrorMessage('title')).toContain('No debe exceder');
  });

  it('should return empty string if no error', () => {
    component.incidentForm.get('title')?.setValue('Valid Title');
    expect(component.getErrorMessage('title')).toBe('');
  });

  it('should mark form controls as touched if form is invalid on submit', () => {
    spyOn(component as any, 'markFormGroupTouched').and.callThrough();
    component.incidentForm.get('title')?.setValue('');
    component.onSubmit();
    expect((component as any).markFormGroupTouched).toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith(
      'Por favor, completa todos los campos correctamente',
      'Error'
    );
  });

  it('should call reportIncident and handle success', waitForAsync(async () => {
    component.incidentForm.setValue({
      title: 'Valid Title',
      description: 'Valid description for incident',
      type: 'TECHNICAL',
      priority: 'MEDIUM',
    });
    incidentService.reportIncident.and.returnValue(of(mockIncident));
    component.onSubmit();

    await fixture.whenStable();

    expect(component.isLoading).toBeFalse();
    expect(toastrService.success).toHaveBeenCalledWith(
      'Incidencia reportada correctamente',
      'Éxito'
    );
    expect(router.navigate).toHaveBeenCalledWith(['/incidents']);
  }));

  it('should call reportIncident and handle error', waitForAsync(async () => {
    component.incidentForm.setValue({
      title: 'Valid Title',
      description: 'Valid description for incident',
      type: 'TECHNICAL',
      priority: 'MEDIUM',
    });
    const errorResponse = { error: { message: 'Custom error' } };
    incidentService.reportIncident.and.returnValue(
      throwError(() => errorResponse)
    );
    spyOn(console, 'error');
    component.onSubmit();

    await fixture.whenStable();

    expect(component.isLoading).toBeFalse();
    expect(toastrService.error).toHaveBeenCalledWith('Custom error', 'Error');
    expect(console.error).toHaveBeenCalled();
  }));

  it('should mark all controls as touched in markFormGroupTouched', () => {
    const formGroup = component.incidentForm;
    spyOn(formGroup.get('title')!, 'markAsTouched');
    (component as any).markFormGroupTouched(formGroup);
    expect(formGroup.get('title')!.markAsTouched).toHaveBeenCalled();
  });

  it('should navigate on cancel if form is not dirty', () => {
    spyOn(window, 'confirm');
    component.incidentForm.markAsPristine();
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/incidents']);
  });

  it('should confirm and navigate on cancel if form is dirty and confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.incidentForm.markAsDirty();
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/incidents']);
  });

  it('should not navigate on cancel if form is dirty and not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.incidentForm.markAsDirty();
    component.cancel();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
