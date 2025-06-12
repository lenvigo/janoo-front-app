import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { IncidentFormComponent } from './incident-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IncidentFormComponent', () => {
  let component: IncidentFormComponent;
  let fixture: ComponentFixture<IncidentFormComponent>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const toastr = jasmine.createSpyObj('ToastrService', ['error', 'success']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        IncidentFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: toastr },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.incidentForm).toBeDefined();
    expect(component.incidentForm.get('priority')?.value).toBe('MEDIUM');
  });

  it('should mark form as invalid if required fields are empty', () => {
    component.incidentForm.setValue({
      title: '',
      description: '',
      type: '',
      priority: 'MEDIUM',
    });
    expect(component.incidentForm.invalid).toBeTrue();
  });

  it('should show error toastr if form is invalid on submit', () => {
    component.incidentForm.setValue({
      title: '',
      description: '',
      type: '',
      priority: 'MEDIUM',
    });
    component.onSubmit();
    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Por favor, completa todos los campos correctamente',
      'Error'
    );
  });

  it('should show success toastr and navigate on valid submit', fakeAsync(() => {
    component.incidentForm.setValue({
      title: 'Título válido',
      description: 'Descripción válida para la incidencia',
      type: 'TECHNICAL',
      priority: 'HIGH',
    });
    component.onSubmit();
    expect(component.isLoading).toBeTrue();
    tick(1000);
    expect(component.isLoading).toBeFalse();
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Incidencia reportada correctamente',
      'Éxito'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users/profile']);
  }));
});
