import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrincipalSupervisorPage } from './principal-supervisor.page';

describe('PrincipalSupervisorPage', () => {
  let component: PrincipalSupervisorPage;
  let fixture: ComponentFixture<PrincipalSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
