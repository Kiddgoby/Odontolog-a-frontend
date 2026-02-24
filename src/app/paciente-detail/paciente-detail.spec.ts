import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteDetail } from './paciente-detail';

describe('PacienteDetail', () => {
  let component: PacienteDetail;
  let fixture: ComponentFixture<PacienteDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
