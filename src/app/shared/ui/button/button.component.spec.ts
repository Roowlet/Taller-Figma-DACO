import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  const boton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
  });

  it('por defecto es filled Default: 40 px, relleno 16 y fondo acento', () => {
    expect(boton().dataset['tipo']).toBe('filled');
    expect(boton().classList).toContain('min-h-10');
    expect(boton().classList).toContain('px-siaf-md');
    expect(boton().classList).toContain('bg-[var(--sys-color-bg-brand-accent)]');
  });

  it('los nombres anteriores apuntan a las variantes del Figma', () => {
    const casos: Array<[string, string]> = [['accent', 'filled'], ['primary', 'filled'], ['secondary', 'outline'], ['ghost', 'text'], ['outline', 'outline'], ['text', 'text']];
    for (const [variante, tipo] of casos) {
      fixture.componentRef.setInput('variant', variante);
      fixture.detectChanges();
      expect(boton().dataset['tipo']).withContext(variante).toBe(tipo);
    }
  });

  it('small: 32 px con el mismo relleno horizontal y texto de 14 px', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(boton().classList).toContain('min-h-8');
    expect(boton().classList).toContain('px-siaf-md');
    expect(boton().querySelector('span')!.classList).toContain('text-sm');
  });

  it('íconos de 24 px; el botón de ícono pequeño outline baja a 20', () => {
    fixture.componentRef.setInput('icon', 'add');
    fixture.detectChanges();
    expect(fixture.componentInstance.iconSize).toBe(24);

    fixture.componentRef.setInput('variant', 'outline');
    fixture.componentRef.setInput('iconOnly', true);
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('ariaLabel', 'Agregar');
    fixture.detectChanges();
    expect(fixture.componentInstance.iconSize).toBe(20);
    expect(boton().getAttribute('aria-label')).toBe('Agregar');
  });

  it('botón de ícono: 40 / 32 px, ícono gris en outline y standard, 20 px en small salvo filled', () => {
    fixture.componentRef.setInput('icon', 'add');
    fixture.componentRef.setInput('iconOnly', true);
    fixture.componentRef.setInput('ariaLabel', 'Agregar');
    fixture.componentRef.setInput('variant', 'standard');
    fixture.detectChanges();
    expect(boton().dataset['tipo']).toBe('text');
    expect(boton().classList).toContain('size-10');
    expect(boton().classList).toContain('text-[var(--sys-color-icon-states-enabled)]');

    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(boton().classList).toContain('size-8');
    expect(fixture.componentInstance.iconSize).toBe(20);

    fixture.componentRef.setInput('variant', 'filled');
    fixture.detectChanges();
    expect(fixture.componentInstance.iconSize).toBe(24);
  });

  it('activated deja el botón presionado: aria-pressed, capa y color del Figma', () => {
    // Sin transiciones: los colores se leen apenas cambia el estado.
    const sinTransiciones = document.createElement('style');
    sinTransiciones.textContent = '*, *::before { transition: none !important; }';
    document.head.append(sinTransiciones);
    const color = (token: string): string => {
      const prueba = document.createElement('span');
      prueba.style.color = `var(${token})`;
      document.body.append(prueba);
      const valor = getComputedStyle(prueba).color;
      prueba.remove();
      return valor;
    };
    fixture.componentRef.setInput('icon', 'star_border');
    fixture.componentRef.setInput('iconOnly', true);
    fixture.componentRef.setInput('ariaLabel', 'Favorito');
    fixture.componentRef.setInput('variant', 'outline');
    fixture.componentRef.setInput('activated', true);
    fixture.detectChanges();

    expect(boton().getAttribute('aria-pressed')).toBe('true');
    expect(getComputedStyle(boton()).color).toBe(color('--sys-color-icon-states-active'));
    expect(getComputedStyle(boton()).borderTopColor).toBe(color('--sys-color-border-states-active'));
    expect(getComputedStyle(boton(), '::before').backgroundColor).toBe(color('--sys-color-bg-states-light-activated'));

    fixture.componentRef.setInput('variant', 'filled');
    fixture.detectChanges();
    expect(getComputedStyle(boton(), '::before').backgroundColor).toBe(color('--sys-color-bg-states-dark-selected'));

    fixture.componentRef.setInput('activated', false);
    fixture.detectChanges();
    expect(boton().getAttribute('aria-pressed')).toBeNull();
    sinTransiciones.remove();
  });

  it('deshabilitado: fondo blanco con capa gris y texto gris', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const estilo = getComputedStyle(boton());
    const capa = getComputedStyle(boton(), '::before');
    const raiz = getComputedStyle(document.documentElement);
    const color = (token: string): string => {
      const prueba = document.createElement('span');
      prueba.style.color = `var(${token})`;
      document.body.append(prueba);
      const valor = getComputedStyle(prueba).color;
      prueba.remove();
      return valor;
    };
    expect(boton().disabled).toBeTrue();
    expect(raiz.getPropertyValue('--sys-color-bg-brand-white')).not.toBe('');
    expect(estilo.backgroundColor).toBe(color('--sys-color-bg-brand-white'));
    expect(estilo.color).toBe(color('--sys-color-text-neutral-disabled'));
    expect(capa.backgroundColor).toBe(color('--sys-color-bg-states-light-disabled'));
    // La capa cubre el borde transparente: si no, el fondo blanco asoma como un contorno.
    expect(capa.top).toBe('-1px');
    expect(capa.left).toBe('-1px');
  });

  it('deshabilitado en modo oscuro: superficie deshabilitada del tema con borde y sin capa', () => {
    const temaPrevio = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const color = (token: string): string => {
        const prueba = document.createElement('span');
        prueba.style.color = `var(${token})`;
        document.body.append(prueba);
        const valor = getComputedStyle(prueba).color;
        prueba.remove();
        return valor;
      };
      const estilo = getComputedStyle(boton());
      expect(estilo.backgroundColor).toBe(color('--sys-color-bg-surfaces-disabled'));
      expect(estilo.borderTopColor).toBe(color('--sys-color-border-states-disabled'));
      expect(estilo.color).toBe(color('--sys-color-text-neutral-disabled'));
      expect(getComputedStyle(boton(), '::before').backgroundColor).toBe('rgba(0, 0, 0, 0)');
    } finally {
      if (temaPrevio === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', temaPrevio);
    }
  });
});
