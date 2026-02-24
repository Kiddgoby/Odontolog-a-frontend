import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPatient } from './new-patient';

describe('NewPatient', () => {
  let component: NewPatient;
  let fixture: ComponentFixture<NewPatient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPatient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPatient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
