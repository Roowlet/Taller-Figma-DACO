import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ESPERA_AL_SALIR_MS, TooltipDirective } from './tooltip.directive';

const TEXTO_LARGO = 'Un texto suficientemente largo como para no entrar en el contenedor y quedar cortado';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<a class="truncate" style="display:block;width:80px;overflow:hidden;white-space:nowrap" href="#" siafTooltip>{{ texto }}</a>`
})
class HostComponent {
  texto = TEXTO_LARGO;
}

function tooltip(): HTMLElement | null {
  return document.body.querySelector('[role="tooltip"]');
}

function limpiarGlobos(): void {
  document.querySelectorAll('[role="tooltip"]').forEach((t) => t.remove());
}

describe('TooltipDirective — soporte táctil', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('a');
  });

  afterEach(() => {
    limpiarGlobos();
    fixture.nativeElement.remove();
  });

  function pointer(tipo: string, opts: PointerEventInit = {}): PointerEvent {
    return new PointerEvent(tipo, { pointerType: 'touch', clientX: 10, clientY: 10, bubbles: true, ...opts });
  }

  it('muestra el tooltip al mantener pulsado', fakeAsync(() => {
    el.dispatchEvent(pointer('pointerdown'));
    expect(tooltip()).toBeNull();

    tick(500);

    expect(tooltip()?.textContent).toBe(TEXTO_LARGO);
    el.dispatchEvent(pointer('pointerup'));
  }));

  it('no lo muestra con un tap corto', fakeAsync(() => {
    el.dispatchEvent(pointer('pointerdown'));
    tick(200);
    el.dispatchEvent(pointer('pointerup'));
    tick(500);

    expect(tooltip()).toBeNull();
  }));

  it('lo oculta al soltar', fakeAsync(() => {
    el.dispatchEvent(pointer('pointerdown'));
    tick(500);
    el.dispatchEvent(pointer('pointerup'));

    expect(tooltip()).toBeNull();
  }));

  it('cancela la pulsación si el dedo se desplaza (scroll)', fakeAsync(() => {
    el.dispatchEvent(pointer('pointerdown'));
    el.dispatchEvent(pointer('pointermove', { clientX: 10, clientY: 60 }));
    tick(500);

    expect(tooltip()).toBeNull();
  }));

  it('anula el click que dispara el navegador tras la pulsación larga', fakeAsync(() => {
    el.dispatchEvent(pointer('pointerdown'));
    tick(500);
    el.dispatchEvent(pointer('pointerup'));

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
  }));

  it('no anula el click si el texto no estaba cortado', fakeAsync(() => {
    fixture.componentInstance.texto = 'corto';
    fixture.detectChanges();

    el.dispatchEvent(pointer('pointerdown'));
    tick(500);
    el.dispatchEvent(pointer('pointerup'));

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(false);
  }));

  it('no responde al hover en un dispositivo sin hover real', () => {
    // Los navegadores móviles emulan eventos de mouse al tocar: si atendiéramos
    // el mouseenter, el tooltip aparecería con un tap y quedaría pegado, porque
    // nunca llega un mouseleave fiable.
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);

    el.dispatchEvent(new MouseEvent('mouseenter'));

    expect(tooltip()).toBeNull();
  });

  it('sí responde al hover en un dispositivo con mouse', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

    el.dispatchEvent(new MouseEvent('mouseenter'));

    expect(tooltip()?.textContent).toBe(TEXTO_LARGO);
  });

  it('ignora el pointerdown que no es táctil (el mouse ya usa hover)', fakeAsync(() => {
    el.dispatchEvent(pointer('pointerdown', { pointerType: 'mouse' }));
    tick(500);

    expect(tooltip()).toBeNull();
  }));
});

describe('TooltipDirective — contenido en hover o foco (WCAG 1.4.13 y 1.4.3)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  const luminancia = (color: string): number => {
    const [r, g, b] = (color.match(/\d+(\.\d+)?/g) ?? [])
      .slice(0, 3)
      .map((canal) => Number(canal) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contraste = (a: string, b: string): number => {
    const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (claro + 0.05) / (oscuro + 0.05);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('a');
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
  });

  afterEach(() => {
    limpiarGlobos();
    fixture.nativeElement.remove();
  });

  it('Escape oculta el globo sin llamar a preventDefault (el panel que lo contiene también recibe la tecla)', () => {
    el.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip()).not.toBeNull();

    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    el.dispatchEvent(escape);

    expect(tooltip()).toBeNull();
    expect(escape.defaultPrevented).toBeFalse();
  });

  it('el globo es solo visual (aria-hidden) y acepta el puntero', () => {
    el.dispatchEvent(new MouseEvent('mouseenter'));
    const globo = tooltip()!;
    expect(globo.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(globo).pointerEvents).not.toBe('none');
  });

  it('se puede llevar el puntero al globo sin que desaparezca', fakeAsync(() => {
    el.dispatchEvent(new MouseEvent('mouseenter'));
    el.dispatchEvent(new MouseEvent('mouseleave'));
    tick(ESPERA_AL_SALIR_MS - 50);
    tooltip()!.dispatchEvent(new MouseEvent('mouseenter'));
    tick(1000);
    expect(tooltip()).not.toBeNull();

    tooltip()!.dispatchEvent(new MouseEvent('mouseleave'));
    tick(ESPERA_AL_SALIR_MS);
    expect(tooltip()).toBeNull();
  }));

  it('si el puntero no llega al globo, se oculta tras la espera', fakeAsync(() => {
    el.dispatchEvent(new MouseEvent('mouseenter'));
    el.dispatchEvent(new MouseEvent('mouseleave'));
    expect(tooltip()).not.toBeNull();

    tick(ESPERA_AL_SALIR_MS);
    expect(tooltip()).toBeNull();
  }));

  it('mientras el elemento tiene el foco, quitar el puntero no lo oculta', fakeAsync(() => {
    el.focus();
    expect(tooltip()).not.toBeNull();

    el.dispatchEvent(new MouseEvent('mouseleave'));
    tick(ESPERA_AL_SALIR_MS * 2);
    expect(tooltip()).not.toBeNull();

    el.blur();
    expect(tooltip()).toBeNull();
  }));

  for (const tema of ['light', 'dark']) {
    it(`el texto del globo pasa 4.5:1 en tema ${tema}`, () => {
      const raiz = document.documentElement;
      const temaPrevio = raiz.getAttribute('data-theme');
      raiz.setAttribute('data-theme', tema);
      try {
        el.dispatchEvent(new MouseEvent('mouseenter'));
        const estilo = getComputedStyle(tooltip()!);
        expect(contraste(estilo.color, estilo.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      } finally {
        if (temaPrevio === null) raiz.removeAttribute('data-theme');
        else raiz.setAttribute('data-theme', temaPrevio);
      }
    });
  }
});

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <span id="ayuda" tabindex="0" aria-label="Estado" siafTooltip="Solo lectura: el documento ya fue aprobado">i</span>
    <span id="repetido" tabindex="0" aria-label="Criterios de búsqueda ingresados" siafTooltip="Criterios de búsqueda ingresados">i</span>
    <span id="envoltorio" siafTooltip="Guarda el documento sin enviarlo"><button id="grabar" type="button">Grabar</button></span>
    <span id="truncado" tabindex="0" siafTooltip>Texto</span>
    <p id="nota">Nota previa</p>
    @if (conAyuda) {
      <button id="dinamico" type="button" aria-describedby="nota" [siafTooltip]="ayuda">Dinámico</button>
    }
  `
})
class AyudaComponent {
  ayuda = 'Primera ayuda';
  conAyuda = true;
}

describe('TooltipDirective — texto de ayuda para el lector (WCAG 4.1.2)', () => {
  let fixture: ComponentFixture<AyudaComponent>;
  const q = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AyudaComponent] }).compileComponents();
    fixture = TestBed.createComponent(AyudaComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    limpiarGlobos();
    fixture.nativeElement.remove();
  });

  it('enlaza una descripción oculta desde el inicio, sin esperar a que se pinte el globo', () => {
    const id = q('#ayuda').getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    const descripcion = document.getElementById(id!)!;
    expect(descripcion.textContent).toBe('Solo lectura: el documento ya fue aprobado');
    expect(descripcion.hidden).toBeTrue();
    expect(tooltip()).toBeNull();
  });

  it('no la repite si el nombre ya incluye el texto, y en modo truncado no enlaza nada', () => {
    expect(q('#repetido').hasAttribute('aria-describedby')).toBeFalse();
    expect(q('#truncado').hasAttribute('aria-describedby')).toBeFalse();
  });

  it('en un componente con un botón adentro, la descripción va en el botón que recibe el foco', () => {
    expect(q('#grabar').getAttribute('aria-describedby')).toBeTruthy();
    expect(q('#envoltorio').hasAttribute('aria-describedby')).toBeFalse();
  });

  it('conserva las descripciones previas, se actualiza con el texto y se quita al destruirse', () => {
    const boton = q('#dinamico');
    const [previa, propia] = boton.getAttribute('aria-describedby')!.split(' ');
    expect(previa).toBe('nota');

    fixture.componentInstance.ayuda = 'Otra ayuda';
    fixture.detectChanges();
    expect(document.getElementById(propia)!.textContent).toBe('Otra ayuda');

    fixture.componentInstance.ayuda = '';
    fixture.detectChanges();
    expect(boton.getAttribute('aria-describedby')).toBe('nota');
    expect(document.getElementById(propia)).toBeNull();

    fixture.componentInstance.ayuda = 'De nuevo';
    fixture.componentInstance.conAyuda = false;
    fixture.detectChanges();
    expect(document.querySelectorAll('[id^="siaf-tooltip-descripcion-"]').length)
      .withContext('solo quedan las descripciones de los otros elementos')
      .toBe(2);
  });
});

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <button id="opcion" type="button" style="display:block;width:120px">
      <span style="display:block;overflow:hidden;white-space:nowrap" siafTooltip>{{ largo }}</span>
      <span style="display:block;overflow:hidden;white-space:nowrap" siafTooltip>Segundo {{ largo }}</span>
    </button>
    <div id="contenedor" tabindex="0" style="width:120px">
      <span style="display:block;overflow:hidden;white-space:nowrap" siafTooltip>{{ largo }}</span>
    </div>
    <button id="afuera" type="button">Afuera</button>
  `
})
class ControlComponent {
  largo = TEXTO_LARGO;
}

describe('TooltipDirective — texto dentro de un control enfocable', () => {
  let fixture: ComponentFixture<ControlComponent>;
  const q = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const globos = (): HTMLElement[] => Array.from(document.body.querySelectorAll<HTMLElement>('[role="tooltip"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ControlComponent] }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
  });

  afterEach(() => {
    limpiarGlobos();
    fixture.nativeElement.remove();
  });

  it('al enfocar la opción aparece un solo globo con el primer texto cortado, y se oculta al salir', () => {
    q('#opcion').focus();
    expect(globos().length).toBe(1);
    expect(globos()[0].textContent).toBe(TEXTO_LARGO);

    q('#afuera').focus();
    expect(globos().length).toBe(0);
  });

  it('un contenedor con tabindex que no es un control no muestra el globo de su contenido', () => {
    q('#contenedor').focus();
    expect(globos().length).toBe(0);
  });
});
