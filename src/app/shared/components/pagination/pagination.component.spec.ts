import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationComponent] }).compileComponents();
    fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('position', 'Bottom');
    fixture.componentRef.setInput('rowPage', true);
  });

  it('el select de filas muestra el tamaño recibido aunque no sea la primera opción', () => {
    // El [value] del select se aplicaba antes de pintar las opciones y siempre quedaba en 10.
    fixture.componentRef.setInput('rowsPerPage', 25);
    fixture.componentRef.setInput('pageSize', 25);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    expect(select.value).toBe('25');

    fixture.componentRef.setInput('rowsPerPage', 50);
    fixture.detectChanges();
    expect(select.value).toBe('50');
  });

  it('elegir otra cantidad emite rowsPerPageChange con el número', () => {
    fixture.detectChanges();
    const emitidos: number[] = [];
    fixture.componentInstance.rowsPerPageChange.subscribe((n) => emitidos.push(n));
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    select.value = '100';
    select.dispatchEvent(new Event('change'));
    expect(emitidos).toEqual([100]);
  });
});
