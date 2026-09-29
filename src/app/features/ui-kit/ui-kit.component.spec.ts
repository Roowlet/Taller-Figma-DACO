import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CLAVE_TEMA } from '../../shared/utils/tema.util';
import { COMPONENTES_EJEMPLO } from './ejemplos';
import { UiKitComponent } from './ui-kit.component';

/** El scroll avisa en el cuadro siguiente y el índice mide en el otro: se esperan unos cuadros. */
const cuadros = async (cantidad = 3): Promise<void> => {
  for (let i = 0; i < cantidad; i++) await new Promise((listo) => requestAnimationFrame(() => listo(null)));
};

describe('UiKitComponent', () => {
  let fixture: ComponentFixture<UiKitComponent>;
  let component: UiKitComponent;
  let temaPrevio: string | null;

  beforeEach(async () => {
    temaPrevio = localStorage.getItem(CLAVE_TEMA);
    localStorage.setItem(CLAVE_TEMA, 'light');
    await TestBed.configureTestingModule({
      imports: [UiKitComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(UiKitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.scrollTo(0, 0);
    if (temaPrevio === null) localStorage.removeItem(CLAVE_TEMA);
    else localStorage.setItem(CLAVE_TEMA, temaPrevio);
    document.documentElement.setAttribute('data-theme', temaPrevio ?? 'light');
  });

  it('pinta una ficha y un enlace del índice por componente visible', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('siaf-ui-kit-ficha').length).toBe(component.total);
    expect(el.querySelectorAll('a[data-indice]').length).toBe(component.total);
    expect(el.querySelector('#siaf-button')).not.toBeNull();
  });

  it('el índice empieza por los fundamentos visuales y la búsqueda también los filtra', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('a[data-indice-fundamento]').length).toBe(7);
    expect(el.querySelector('#color[data-fundamento]')).not.toBeNull();

    component.busqueda.set('sombras');
    fixture.detectChanges();
    expect(Array.from(el.querySelectorAll('[data-fundamento]')).map((s) => s.id)).toEqual(['sombras']);

    component.busqueda.set('siaf-tabs');
    fixture.detectChanges();
    expect(el.querySelector('[data-fundamento]')).toBeNull();
  });

  it('la búsqueda reduce fichas e índice', () => {
    component.busqueda.set('siaf-tabs');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(component.totalFiltrado()).toBeLessThan(component.total);
    expect(el.querySelector('#siaf-tabs')).not.toBeNull();
    expect(el.querySelector('#siaf-button')).toBeNull();
  });

  it('sin resultados muestra el estado vacío', () => {
    component.busqueda.set('zzz-no-existe');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('siaf-empty-state')).not.toBeNull();
  });

  it('el pie de página da crédito a los autores, también sin resultados', () => {
    component.busqueda.set('zzz-no-existe');
    fixture.detectChanges();
    const autores = fixture.nativeElement.querySelector('footer [data-ui-kit-autores]');
    expect(autores?.textContent.replace(/\s+/g, ' ').trim()).toBe('Creado por Brian Meneses y Adib Checori');
  });

  it('el modo oscuro cambia data-theme y guarda la preferencia compartida con la app', () => {
    component.alternarTema();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(CLAVE_TEMA)).toBe('dark');
    expect(component.logo()).toContain('white');
  });

  it('el índice marca la ficha elegida y cierra el panel en móvil', () => {
    component.indiceAbierto.set(true);
    component.irA(new Event('click'), 'siaf-menu');
    expect(component.activo()).toBe('siaf-menu');
    expect(component.indiceAbierto()).toBeFalse();
  });

  it('el título y el buscador del índice quedan fijos: solo la lista se desplaza, con la categoría pegada arriba', () => {
    const el: HTMLElement = fixture.nativeElement;
    const fijo = el.querySelector<HTMLElement>('aside [data-ui-kit-indice-fijo]')!;
    const lista = el.querySelector<HTMLElement>('aside [data-ui-kit-indice-lista]')!;
    expect(fijo.querySelector('siaf-input')).not.toBeNull();
    expect(lista.contains(fijo)).toBeFalse();
    expect(lista.querySelectorAll('a[data-destino]').length).toBe(component.total + 7);
    expect(getComputedStyle(lista).overflowY).toBe('auto');
    expect(getComputedStyle(fijo).flexShrink).toBe('0');
    expect(getComputedStyle(el.querySelector('aside')!).overflowY).toBe('visible');
    // Sin relleno superior en la lista: el título de la categoría se pega a su borde.
    expect(getComputedStyle(lista).paddingTop).toBe('0px');
    expect(getComputedStyle(lista.querySelector('p')!).position).toBe('sticky');
  });

  it('al hacer scroll marca la ficha que se lee y su categoría, y arriba de todo ninguna', async () => {
    const el: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    el.querySelector<HTMLElement>('#siaf-tabs')!.scrollIntoView({ block: 'start' });
    await cuadros();
    fixture.detectChanges();
    expect(component.activo()).toBe('siaf-tabs');
    expect(el.querySelector('[aria-current="location"]')?.getAttribute('data-destino')).toBe('siaf-tabs');
    expect(el.querySelector('[data-grupo-activo]')?.textContent?.trim()).toBe('Navegación');
    expect(el.querySelector('[data-ui-kit-franja]')?.textContent).toContain('siaf-tabs');

    el.querySelector<HTMLElement>('#color')!.scrollIntoView({ block: 'start' });
    await cuadros();
    fixture.detectChanges();
    expect(component.activo()).toBe('color');
    expect(el.querySelector('[data-grupo-activo]')?.textContent?.trim()).toBe('Fundamentos visuales');

    window.scrollTo(0, 0);
    await cuadros();
    fixture.detectChanges();
    expect(component.activo()).toBeNull();
    expect(el.querySelector('aside [aria-current]')).toBeNull();
  });

  it('lo elegido en el índice sigue marcado mientras dura su desplazamiento y cambia con el scroll siguiente', async () => {
    await fixture.whenStable();
    // Sin la animación del navegador: los cuadros del desplazamiento se simulan con scrollTo.
    const desplazar = spyOn(Element.prototype, 'scrollIntoView');
    component.irA(new Event('click'), 'siaf-menu');
    expect(desplazar).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    // En camino pasa por otras secciones: la marca no cambia.
    window.scrollTo(0, 400);
    await cuadros();
    expect(component.activo()).toBe('siaf-menu');

    // Terminado el desplazamiento, el scroll del usuario vuelve a mandar.
    await new Promise((listo) => setTimeout(listo, 200));
    window.scrollTo(0, 0);
    await cuadros();
    expect(component.activo()).toBeNull();
  });

  it('un enlace interno de una ficha desplaza dentro del catálogo en vez de navegar fuera de /ui-kit', () => {
    const el: HTMLElement = fixture.nativeElement;
    const enlace = el.querySelector<HTMLAnchorElement>('#siaf-form-table-search a[data-enlace-ficha][href="#siaf-records-search-toolbar"]');
    expect(enlace).withContext('la descripción del buscador enlaza a su variante').not.toBeNull();
    const desplazar = spyOn(Element.prototype, 'scrollIntoView');
    // Registra si el catálogo lo interceptó y, por las dudas, evita que el clic navegue la página de pruebas.
    let interceptado: boolean | null = null;
    const registrar = (evento: Event): void => {
      interceptado = evento.defaultPrevented;
      evento.preventDefault();
    };
    document.addEventListener('click', registrar);
    try {
      enlace!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    } finally {
      document.removeEventListener('click', registrar);
    }
    expect(interceptado).toBeTrue();
    expect(component.activo()).toBe('siaf-records-search-toolbar');
    expect(desplazar).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('la franja móvil dice en qué sección estás y abre el índice con el foco en esa ficha', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const franja = el.querySelector<HTMLButtonElement>('[data-ui-kit-franja]')!;
    expect(franja.textContent).toContain('Elige un componente o fundamento');

    component.activo.set('siaf-button');
    fixture.detectChanges();
    expect(franja.textContent).toContain('Botones y acciones');
    expect(franja.textContent).toContain('siaf-button');
    expect(franja.getAttribute('aria-expanded')).toBe('false');

    franja.focus();
    franja.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(franja.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.getAttribute('data-destino')).toBe('siaf-button');
  });
});

describe('Ejemplos en vivo del ui-kit', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  // Cada selector declarado debe tener su @case (si falta, el ejemplo sale vacío) y ninguno puede
  // tocar la red: /ui-kit no tiene sesión y un 401 manda al usuario al login. Se abren también
  // los paneles (botones `data-ui-kit-abrir`), que es cuando los historiales piden sus datos.
  // Van en el DOM para ver el foco: un ejemplo que se pinta abierto no puede quitárselo a la página
  // (el catálogo saltaba al ejemplo del popover al cargar).
  for (const componente of COMPONENTES_EJEMPLO) {
    for (const selector of componente.selectores) {
      it(`${componente.name} pinta ${selector} sin peticiones HTTP ni tomar el foco`, async () => {
        const fixture = TestBed.createComponent(componente);
        const el = fixture.nativeElement as HTMLElement;
        const enfocados: string[] = [];
        const alEnfocar = (evento: FocusEvent): void => {
          const destino = evento.target as HTMLElement;
          if (el.contains(destino)) enfocados.push(destino.getAttribute('aria-label') || destino.textContent?.trim() || destino.tagName);
        };
        document.body.appendChild(el);
        (document.activeElement as HTMLElement | null)?.blur();
        document.addEventListener('focusin', alEnfocar);
        try {
          fixture.componentRef.setInput('selector', selector);
          fixture.detectChanges();
          await fixture.whenStable();
          fixture.detectChanges();
          document.removeEventListener('focusin', alEnfocar);
          expect(el.children.length).withContext(selector).toBeGreaterThan(0);
          expect(enfocados).withContext(`${selector} tomó el foco al pintarse`).toEqual([]);
          el.querySelectorAll<HTMLElement>('[data-ui-kit-abrir] button').forEach((b) => b.click());
          fixture.detectChanges();
          await fixture.whenStable();
          fixture.detectChanges();
          TestBed.inject(HttpTestingController).verify();
        } finally {
          document.removeEventListener('focusin', alEnfocar);
          el.remove();
        }
      });
    }
  }
});
