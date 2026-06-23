import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrincipalTrabajadorPage } from './principal-trabajador.page';

describe('PrincipalTrabajadorPage', () => {
  let component: PrincipalTrabajadorPage;
  let fixture: ComponentFixture<PrincipalTrabajadorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalTrabajadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
