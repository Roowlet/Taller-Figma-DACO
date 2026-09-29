import { DestroyRef } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SIDE_PANEL_ANIM_MS, SidePanelAnimacion } from './side-panel-animacion';

describe('SidePanelAnimacion', () => {
  let alDestruir: (() => void)[];
  const destroyRef = { onDestroy: (fn: () => void) => { alDestruir.push(fn); return () => {}; } } as unknown as DestroyRef;
  const estado = (anim: SidePanelAnimacion) => [anim.visible(), anim.cerrando()];

  beforeEach(() => (alDestruir = []));

  it('monta al abrir y retiene el DOM durante los 300 ms de la salida', fakeAsync(() => {
    const anim = new SidePanelAnimacion(destroyRef);
    anim.actualizar(true);
    expect(estado(anim)).toEqual([true, false]);

    anim.actualizar(false);
    expect(estado(anim)).toEqual([true, true]);
    tick(SIDE_PANEL_ANIM_MS);
    expect(estado(anim)).toEqual([false, false]);
  }));

  it('reabrir a mitad de la salida cancela el desmontaje', fakeAsync(() => {
    const anim = new SidePanelAnimacion(destroyRef);
    anim.actualizar(true);
    anim.actualizar(false);
    tick(SIDE_PANEL_ANIM_MS / 2);

    anim.actualizar(true);
    tick(SIDE_PANEL_ANIM_MS);
    expect(estado(anim)).toEqual([true, false]);
  }));

  it('al destruirse el componente cancela la salida pendiente', fakeAsync(() => {
    const anim = new SidePanelAnimacion(destroyRef);
    anim.actualizar(true);
    anim.actualizar(false);

    alDestruir.forEach((fn) => fn());
    tick(SIDE_PANEL_ANIM_MS);
    // El timer no llegó a correr: sin el hook, escribiría signals de un componente destruido.
    expect(estado(anim)).toEqual([true, true]);
  }));

  it('dentro de un componente toma su DestroyRef sin pasarlo', () => {
    const anim = TestBed.runInInjectionContext(() => new SidePanelAnimacion());
    expect(estado(anim)).toEqual([false, false]);
  });
});
