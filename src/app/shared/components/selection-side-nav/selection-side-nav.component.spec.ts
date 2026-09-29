import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SelectionColumn, SelectionSideNavComponent } from './selection-side-nav.component';

interface Clase { id: string; codigo: string; descripcion: string }

const SAMPLE_CLASES: Clase[] = [
  { id: 'A', codigo: 'C01', descripcion: 'Cierre anual' },
  { id: 'B', codigo: 'C02', descripcion: 'Reclasificación' },
  { id: 'C', codigo: 'C03', descripcion: 'Apertura' },
];

const COLUMNS: SelectionColumn<Clase>[] = [
  { key: 'codigo',      label: 'Código',      widthClass: 'w-[120px]', cellClass: 'font-mono' },
  { key: 'descripcion', label: 'Descripción' },
];

describe('SelectionSideNavComponent', () => {
  let fixture: ComponentFixture<SelectionSideNavComponent<Clase>>;
  let component: SelectionSideNavComponent<Clase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectionSideNavComponent] }).compileComponents();
    fixture = TestBed.createComponent<SelectionSideNavComponent<Clase>>(SelectionSideNavComponent);
    component = fixture.componentInstance;
  });

  function render(opts: {
    open?: boolean;
    mode?: 'single' | 'multiple';
    rows?: Clase[];
    columns?: SelectionColumn<Clase>[];
    selectedIds?: string[];
    requireSelection?: boolean;
    title?: string;
  } = {}): void {
    fixture.componentRef.setInput('open', opts.open ?? true);
    fixture.componentRef.setInput('mode', opts.mode ?? 'single');
    fixture.componentRef.setInput('rows', opts.rows ?? SAMPLE_CLASES);
    fixture.componentRef.setInput('columns', opts.columns ?? COLUMNS);
    fixture.componentRef.setInput('selectedIds', opts.selectedIds ?? []);
    fixture.componentRef.setInput('title', opts.title ?? 'Buscar clase');
    if (opts.requireSelection !== undefined) {
      fixture.componentRef.setInput('requireSelection', opts.requireSelection);
    }
    fixture.detectChanges();
  }

  it('open=false no renderiza nada', () => {
    render({ open: false });
    expect(fixture.debugElement.query(By.css('aside'))).toBeNull();
  });

  it('open=true renderiza el panel con el título', () => {
    render({ title: 'Buscar clase de ajuste' });
    const h2 = fixture.debugElement.query(By.css('h2')).nativeElement as HTMLElement;
    expect(h2.textContent?.trim()).toBe('Buscar clase de ajuste');
  });

  it('renderiza una fila por entrada y aplica cellClass + render por columna', () => {
    render();
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(3);
    // La celda de codigo debe tener la clase font-mono
    const codeCell = rows[0].queryAll(By.css('td'))[1].nativeElement as HTMLElement;
    expect(codeCell.classList).toContain('font-mono');
    expect(codeCell.textContent?.trim()).toBe('C01');
  });

  it('estado vacío muestra emptyMessage', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('emptyMessage', 'Sin resultados');
    fixture.detectChanges();
    const empty = fixture.debugElement.query(By.css('tbody tr td')).nativeElement as HTMLElement;
    expect(empty.textContent?.trim()).toBe('Sin resultados');
  });

  it('single: click en fila emite [id] con sólo ese id', () => {
    render({ mode: 'single' });
    const emitted: string[][] = [];
    component.selectionChange.subscribe(v => emitted.push(v));

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    rows[1].triggerEventHandler('click', null);

    expect(emitted.pop()).toEqual(['B']);
  });

  it('multiple: click en filas distintas hace toggle acumulado', () => {
    render({ mode: 'multiple', selectedIds: ['A'] });
    const emitted: string[][] = [];
    component.selectionChange.subscribe(v => emitted.push(v));

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    rows[1].triggerEventHandler('click', null);  // agrega B
    expect(emitted.pop()).toEqual(['A', 'B']);

    // Simulamos que el padre actualizó selectedIds y volvió a clickear A para deseleccionar
    fixture.componentRef.setInput('selectedIds', ['A', 'B']);
    fixture.detectChanges();
    rows[0].triggerEventHandler('click', null);  // quita A
    expect(emitted.pop()).toEqual(['B']);
  });

  it('Aceptar disabled cuando requireSelection=true y no hay selección', () => {
    render({ selectedIds: [] });
    const accept = fixture.debugElement.queryAll(By.css('siaf-button'))[1];
    expect(accept.componentInstance.disabled).toBeTrue();
  });

  it('Aceptar habilitado cuando hay selección', () => {
    render({ selectedIds: ['A'] });
    const accept = fixture.debugElement.queryAll(By.css('siaf-button'))[1];
    expect(accept.componentInstance.disabled).toBeFalse();
  });

  it('Aceptar emite (accepted) con los ids seleccionados — no cierra solo', () => {
    render({ selectedIds: ['A'] });
    let emitted: string[] | undefined;
    let closed = false;
    component.accepted.subscribe(v => (emitted = v));
    component.closed.subscribe(() => (closed = true));

    fixture.debugElement.queryAll(By.css('siaf-button'))[1].triggerEventHandler('click', null);

    expect(emitted).toEqual(['A']);
    expect(closed).toBeFalse();
  });

  it('paginated=false no renderiza siaf-pagination', () => {
    render();
    expect(fixture.debugElement.query(By.css('siaf-pagination'))).toBeNull();
  });

  it('paginated=true renderiza paginación inferior; showTopPagination añade la superior', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('rows', SAMPLE_CLASES);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('paginated', true);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('siaf-pagination')).length).toBe(1);

    fixture.componentRef.setInput('showTopPagination', true);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('siaf-pagination')).length).toBe(2);
  });

  it('paginación reenvía previous/next/rowsPerPageChange', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('rows', SAMPLE_CLASES);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('paginated', true);
    fixture.detectChanges();

    let prev = 0, next = 0, rpp = -1;
    component.previousPage.subscribe(() => prev++);
    component.nextPage.subscribe(() => next++);
    component.rowsPerPageChange.subscribe(v => (rpp = v));

    const pag = fixture.debugElement.query(By.css('siaf-pagination'));
    pag.triggerEventHandler('previous', null);
    pag.triggerEventHandler('next', null);
    pag.triggerEventHandler('rowsPerPageChange', 50);

    expect(prev).toBe(1);
    expect(next).toBe(1);
    expect(rpp).toBe(50);
  });

  it('showSelectAll en mode=multiple renderiza siaf-table-controls (no la paginación superior)', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('mode', 'multiple');
    fixture.componentRef.setInput('rows', SAMPLE_CLASES);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('paginated', true);
    fixture.componentRef.setInput('showTopPagination', true);
    fixture.componentRef.setInput('showSelectAll', true);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('siaf-table-controls'))).not.toBeNull();
  });

  it('select-all reenvía (selectionChange) del table-controls como selectAllChange', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('mode', 'multiple');
    fixture.componentRef.setInput('rows', SAMPLE_CLASES);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('showSelectAll', true);
    fixture.detectChanges();

    let received: boolean | undefined;
    component.selectAllChange.subscribe(v => (received = v));
    fixture.debugElement.query(By.css('siaf-table-controls')).triggerEventHandler('selectionChange', true);
    expect(received).toBeTrue();
  });

  it('customTable=true proyecta contenido en vez de la tabla declarativa', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('customTable', true);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('rows', SAMPLE_CLASES);
    fixture.detectChanges();
    // La tabla auto-generada no se renderiza (se proyecta contenido externo)
    expect(fixture.debugElement.query(By.css('thead'))).toBeNull();
    expect(fixture.debugElement.query(By.css('table'))).toBeNull();
  });

  it('Cancelar y X emiten (closed) sin emitir accepted', () => {
    render({ selectedIds: ['A'] });
    let acceptedCount = 0;
    let closedCount = 0;
    component.accepted.subscribe(() => acceptedCount++);
    component.closed.subscribe(() => closedCount++);

    // Botón Cancelar
    fixture.debugElement.queryAll(By.css('siaf-button'))[0].triggerEventHandler('click', null);
    // Botón X (icono close)
    fixture.debugElement.query(By.css('header button')).triggerEventHandler('click', null);

    expect(closedCount).toBe(2);
    expect(acceptedCount).toBe(0);
  });
});
