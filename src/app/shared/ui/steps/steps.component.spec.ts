import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepItem, StepsComponent } from './steps.component';

describe('StepsComponent', () => {
  let fixture: ComponentFixture<StepsComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const pasos = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('li[data-estado]'));
  const circulo = (li: HTMLElement): HTMLElement => li.querySelector<HTMLElement>('[aria-hidden="true"] > span')!;
  const lineas = (): number => el().querySelectorAll('[aria-hidden="true"] > span.bg-\\[var\\(--sys-color-divider-default\\)\\]').length;

  const lista: StepItem[] = [
    { label: 'Elaborado', description: 'El creador registra el documento' },
    { label: 'Verificado', description: 'Revisión del creador' },
    { label: 'Aprobado' },
    { label: 'Registrado' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StepsComponent] }).compileComponents();
    fixture = TestBed.createComponent(StepsComponent);
    fixture.componentRef.setInput('steps', lista);
    fixture.componentRef.setInput('activeStep', 2);
    fixture.detectChanges();
  });

  it('horizontal por defecto: número en círculos de 32 px y una línea entre pasos, no después del último', () => {
    expect(pasos().map((p) => p.dataset['estado'])).toEqual(['done', 'current', 'pending', 'pending']);
    expect(circulo(pasos()[0]).classList).toContain('size-8');
    expect(circulo(pasos()[2]).textContent?.trim()).toBe('3');
    expect(lineas()).toBe(lista.length - 1);
    expect(pasos()[1].getAttribute('aria-current')).toBe('step');
  });

  it('el activo y los anteriores van en color de marca; los siguientes en gris', () => {
    expect(circulo(pasos()[0]).classList).toContain('bg-brand-primary');
    expect(circulo(pasos()[1]).classList).toContain('bg-brand-primary');
    expect(circulo(pasos()[2]).classList).toContain('bg-[var(--sys-color-bg-surfaces-surface-high)]');
  });

  it('vertical default: círculos de 40 px con número', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    expect(circulo(pasos()[0]).classList).toContain('size-10');
    expect(circulo(pasos()[3]).textContent?.trim()).toBe('4');
    expect(lineas()).toBe(lista.length - 1);
  });

  it('vertical small: círculos de 24 px sin número', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    expect(circulo(pasos()[0]).classList).toContain('size-6');
    expect(circulo(pasos()[0]).textContent?.trim()).toBe('');
  });

  it('anuncia posición y estado de cada paso a los lectores de pantalla', () => {
    expect(pasos()[0].querySelector('.sr-only')?.textContent?.trim()).toBe(', paso 1 de 4, completado');
    expect(pasos()[1].querySelector('.sr-only')?.textContent?.trim()).toBe(', paso 2 de 4, paso actual');
  });

  it('el texto sr-only queda dentro del componente aunque la fila horizontal no entre en el ancho', () => {
    // Más pasos de los que caben en la ventana (124 px cada uno) dentro de un contenedor angosto.
    const muchos = Array.from({ length: Math.ceil(window.innerWidth / 124) + 4 }, (_, i) => ({ label: `Paso ${i + 1}` }));
    fixture.componentRef.setInput('steps', muchos);
    el().style.display = 'block';
    el().style.width = '300px';
    fixture.detectChanges();

    const fila = el().querySelector<HTMLElement>('ol')!;
    expect(fila.scrollWidth).withContext('la fila desborda su contenedor').toBeGreaterThan(300);

    for (const sr of Array.from(el().querySelectorAll<HTMLElement>('.sr-only'))) {
      // Su bloque contenedor es el propio paso: el desplazamiento de la fila lo recorta.
      expect(el().contains(sr.offsetParent)).withContext(sr.textContent ?? '').toBeTrue();
    }
    // Y la página no se desplaza en horizontal por culpa del componente.
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  });

  describe('variant="cards"', () => {
    const campos = (numero: string, tipo: string): StepItem['fields'] => [
      { label: 'N° modificación', value: numero },
      { label: 'Tipo de acción', value: tipo },
      { label: 'Fecha', value: '19/08/25 08:00:59' },
    ];
    const versiones: StepItem[] = [
      { label: 'Modificación 02', fields: campos('02', 'Modificación') },
      { label: 'Modificación 01', fields: campos('01', 'Modificación') },
      { label: 'Creación 0001', fields: campos('0001', 'Creación') },
    ];
    const filas = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('[data-steps-tarjetas] > li'));
    const tarjeta = (li: HTMLElement): HTMLButtonElement => li.querySelector<HTMLButtonElement>('siaf-stepper-card button')!;
    const punto = (li: HTMLElement): HTMLElement => li.querySelector<HTMLElement>('[data-steps-punto]')!;
    const lineasDe = (li: HTMLElement): HTMLElement[] => Array.from(li.querySelectorAll<HTMLElement>('[data-steps-linea]'));

    beforeEach(() => {
      fixture.componentRef.setInput('variant', 'cards');
      fixture.componentRef.setInput('steps', versiones);
      fixture.componentRef.setInput('activeStep', 1);
      fixture.detectChanges();
    });

    it('una tarjeta por versión con sus campos: la activa con aria-pressed, sombra, barra y punto azul; las demás con borde y punto gris', () => {
      expect(filas().length).toBe(3);
      expect(tarjeta(filas()[2]).textContent).toContain('Creación');
      expect(filas().map((li) => tarjeta(li).getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
      expect(tarjeta(filas()[0]).classList).toContain('shadow-siaf-elevation-2');
      expect(filas()[0].querySelector('[data-stepper-barra]')).not.toBeNull();
      expect(tarjeta(filas()[1]).classList).toContain('border-[var(--sys-color-divider-strong)]');
      expect(filas()[1].querySelector('[data-stepper-barra]')).toBeNull();
      expect(punto(filas()[0]).classList).toContain('bg-brand-primary');
      expect(punto(filas()[1]).classList).toContain('bg-[var(--sys-color-text-neutral-low)]');
      // No son pasos de un flujo: sin «paso actual» ni el texto oculto de los círculos.
      expect(el().querySelector('[aria-current]')).toBeNull();
      expect(el().querySelector('.sr-only')).toBeNull();
    });

    it('elegir otra tarjeta la marca y emite su número; la activa no emite', () => {
      const emitidos: number[] = [];
      fixture.componentInstance.activeStepChange.subscribe((numero) => emitidos.push(numero));
      tarjeta(filas()[0]).click();
      expect(emitidos).toEqual([]);

      tarjeta(filas()[2]).click();
      fixture.detectChanges();
      expect(emitidos).toEqual([3]);
      expect(tarjeta(filas()[2]).getAttribute('aria-pressed')).toBe('true');
      expect(tarjeta(filas()[0]).getAttribute('aria-pressed')).toBe('false');
      expect(punto(filas()[2]).classList).toContain('bg-brand-primary');
    });

    it('tarjetas de 200 px separadas 32 px, punto de 24 px centrado en su tarjeta y una línea continua del primer punto al último', () => {
      const [primera, segunda, tercera] = filas();
      for (const li of filas()) {
        const caja = tarjeta(li).getBoundingClientRect();
        const circulo = punto(li).getBoundingClientRect();
        expect(caja.width).toBe(200);
        expect(circulo.width).toBe(24);
        expect(Math.abs(circulo.top + circulo.height / 2 - (caja.top + caja.height / 2))).toBeLessThan(1);
        expect(Math.round(circulo.left - caja.right)).toBe(22);
      }
      expect(Math.round(segunda.getBoundingClientRect().top - primera.getBoundingClientRect().bottom)).toBe(32);
      // Sin línea arriba del primer punto ni abajo del último.
      expect(lineasDe(primera).length).toBe(1);
      expect(lineasDe(segunda).length).toBe(2);
      expect(lineasDe(tercera).length).toBe(1);
      // La línea de abajo de una fila termina donde empieza la de arriba de la siguiente.
      const abajo = lineasDe(primera)[0].getBoundingClientRect();
      const arriba = lineasDe(segunda)[0].getBoundingClientRect();
      expect(Math.abs(arriba.top - abajo.bottom)).toBeLessThan(1);
      expect(Math.abs(abajo.top - (punto(primera).getBoundingClientRect().top + 12))).toBeLessThan(1);
      expect(Math.abs(arriba.bottom - (punto(segunda).getBoundingClientRect().top + 12))).toBeLessThan(1);
    });
  });
});
