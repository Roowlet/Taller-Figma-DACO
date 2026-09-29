import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskCardComponent, DeskCardVariant, formatearContador } from './desk-card.component';

/** Lo que llega al lector de pantalla: el texto que no está bajo `aria-hidden` (el nombre del ícono sí lo está). */
const textoLeido = (raiz: Element): string => {
  const trozos: string[] = [];
  const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  while (recorrido.nextNode()) {
    const nodo = recorrido.currentNode;
    if (nodo.textContent?.trim() && !nodo.parentElement?.closest('[aria-hidden="true"]')) trozos.push(nodo.textContent.trim());
  }
  return trozos.join(' ');
};

describe('DeskCardComponent', () => {
  let fixture: ComponentFixture<DeskCardComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const q = <T extends HTMLElement>(selector: string): T | null => el().querySelector<T>(selector);

  const montar = (variante: DeskCardVariant, entradas: Record<string, unknown> = {}): void => {
    fixture = TestBed.createComponent(DeskCardComponent);
    fixture.componentRef.setInput('variant', variante);
    fixture.componentRef.setInput('title', 'Bandeja de Documentos');
    fixture.componentRef.setInput('icon', 'inbox');
    for (const [nombre, valor] of Object.entries(entradas)) fixture.componentRef.setInput(nombre, valor);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DeskCardComponent] }).compileComponents();
  });

  it('el número lleva dos dígitos como mínimo y no admite decimales ni negativos', () => {
    expect(formatearContador(0)).toBe('00');
    expect(formatearContador(4)).toBe('04');
    expect(formatearContador(128)).toBe('128');
    expect(formatearContador(3.7)).toBe('03');
    expect(formatearContador(-2)).toBe('00');
    expect(formatearContador(null)).toBe('00');
  });

  it('featured: ícono en recuadro, título y número; el lector de pantalla oye el valor sin ceros', () => {
    montar('featured', { value: 4, tone: 'accent' });
    expect(q('article')?.getAttribute('aria-label')).toBe('Bandeja de Documentos');
    const recuadro = q('[data-icono]')!;
    expect(recuadro.className).toContain('border-[var(--sys-color-divider-default)]');
    expect(recuadro.className).toContain('sm:size-[98px]');
    expect(recuadro.className).toContain('text-[var(--sys-color-text-brand-accent)]');
    expect(q('[data-numero]')?.textContent?.trim()).toBe('04');
    expect(textoLeido(q('article')!)).toBe('Bandeja de Documentos 4');
  });

  it('featured sin número (como Procesos) no deja el hueco del contador', () => {
    montar('featured');
    expect(q('[data-numero]')).toBeNull();
    expect(q('.sr-only')).toBeNull();
  });

  it('counter: título y número a la izquierda, ícono de color a la derecha y sin recuadro', () => {
    montar('counter', { title: 'Recibidos', icon: 'description', value: 0, tone: 'success' });
    const tarjeta = q('article')!;
    expect(tarjeta.className).toContain('justify-between');
    expect(tarjeta.lastElementChild?.hasAttribute('data-icono')).withContext('el ícono va al final').toBeTrue();
    const icono = q('[data-icono]')!;
    expect(icono.className).not.toContain('border');
    expect(icono.className).toContain('text-[var(--sys-color-text-feedback-success)]');
    expect(q('[data-numero]')?.textContent?.trim()).toBe('00');
  });

  it('shortcut: ícono en recuadro de 74 px y título, sin número aunque reciba uno', () => {
    montar('shortcut', { title: 'Crear documento', icon: 'add', value: 9 });
    expect(q('[data-icono]')?.className).toContain('size-[74px]');
    expect(q('[data-icono]')?.className).not.toContain('sm:size-[98px]');
    expect(q('[data-numero]')).toBeNull();
  });

  it('sin interactive es un article que no recibe foco ni emite', () => {
    montar('featured');
    const emitidos = jasmine.createSpy('activated');
    fixture.componentInstance.activated.subscribe(emitidos);
    expect(q('button')).toBeNull();
    expect(q('[tabindex]')).toBeNull();
    q('article')!.click();
    expect(emitidos).not.toHaveBeenCalled();
  });

  it('con interactive toda la tarjeta es un button nativo que emite activated, nombrado con su texto', () => {
    montar('featured', { title: 'Procesos', icon: 'picture_in_picture', interactive: true });
    const emitidos = jasmine.createSpy('activated');
    fixture.componentInstance.activated.subscribe(emitidos);
    const boton = q<HTMLButtonElement>('button')!;
    expect(boton.type).toBe('button');
    expect(q('article')).toBeNull();
    expect(textoLeido(boton)).toBe('Procesos');
    expect(boton.querySelector('p, div')).withContext('dentro de un button solo contenido de frase').toBeNull();
    boton.click();
    expect(emitidos).toHaveBeenCalledTimes(1);
  });
});
