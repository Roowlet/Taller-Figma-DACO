import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RecordsTabsComponent } from './records-tabs.component';

describe('RecordsTabsComponent', () => {
  let fixture: ComponentFixture<RecordsTabsComponent>;
  let component: RecordsTabsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RecordsTabsComponent] }).compileComponents();
    fixture = TestBed.createComponent(RecordsTabsComponent);
    component = fixture.componentInstance;
  });

  function render(tabs: { id: string; label: string; count?: number }[], activeId = ''): void {
    fixture.componentRef.setInput('tabs', tabs);
    fixture.componentRef.setInput('activeId', activeId);
    fixture.detectChanges();
  }

  const pestanas = () => fixture.debugElement.queryAll(By.css('button[role="tab"]'));

  it('renderiza una pestaña por entrada con siaf-tabs subrayado', () => {
    render([
      { id: 'documents', label: 'Documentos' },
      { id: 'records', label: 'Registros' },
    ]);
    expect(fixture.debugElement.query(By.css('siaf-tabs [role="tablist"]')).attributes['data-borde']).toBeUndefined();
    expect(pestanas().length).toBe(2);
    expect(pestanas()[0].nativeElement.textContent).toContain('Documentos');
    expect(pestanas()[1].nativeElement.textContent).toContain('Registros');
  });

  it('marca aria-selected sólo en la activa', () => {
    render(
      [
        { id: 'documents', label: 'Documentos' },
        { id: 'records', label: 'Registros' },
      ],
      'documents',
    );
    expect(pestanas()[0].attributes['aria-selected']).toBe('true');
    expect(pestanas()[1].attributes['aria-selected']).toBe('false');
  });

  it('al hacer click en otra pestaña emite activeIdChange', () => {
    render(
      [
        { id: 'documents', label: 'Documentos' },
        { id: 'records', label: 'Registros' },
      ],
      'documents',
    );
    let emitted: string | undefined;
    component.activeIdChange.subscribe(v => (emitted = v));

    pestanas()[1].nativeElement.click();
    expect(emitted).toBe('records');
  });

  it('click en la pestaña ya activa NO re-emite', () => {
    render([{ id: 'documents', label: 'Documentos' }], 'documents');
    let calls = 0;
    component.activeIdChange.subscribe(() => calls++);
    pestanas()[0].nativeElement.click();
    expect(calls).toBe(0);
  });

  it('count opcional se renderiza con siaf-badge', () => {
    render([{ id: 'documents', label: 'Documentos', count: 7 }], 'documents');
    expect(pestanas()[0].nativeElement.textContent).toContain('Documentos');
    expect(pestanas()[0].query(By.css('siaf-badge')).nativeElement.textContent.trim()).toBe('7');
  });

  it('count omitido NO renderiza badge', () => {
    render([{ id: 'documents', label: 'Documentos' }], 'documents');
    expect(fixture.debugElement.query(By.css('siaf-badge'))).toBeNull();
  });

  it('la flecha derecha pasa a la siguiente pestaña', () => {
    render(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      'a',
    );
    let last: string | undefined;
    component.activeIdChange.subscribe(v => (last = v));
    pestanas()[0].nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(last).toBe('b');
  });
});
