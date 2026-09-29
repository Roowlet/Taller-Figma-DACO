import { COMPONENTES_EJEMPLO, EJEMPLOS_RESPONSIVE, EJEMPLO_POR_SELECTOR, MOTIVO_SIN_EJEMPLO } from './ejemplos';
import { CATEGORIAS_UI_KIT, CATEGORIA_POR_SELECTOR, SELECTORES_OCULTOS } from './ui-kit.catalogo';
import { MANIFIESTO_UI_KIT } from './ui-kit.manifest';

/**
 * Guardas del catálogo /ui-kit. Si falla "tiene categoría", se agregó un componente a
 * shared/ o layout/ sin declararlo en `ui-kit.catalogo.ts`: sin ficha no está terminado.
 * Si fallan las del manifiesto, falta correr `npm run ui-kit:manifest`.
 */
describe('Catálogo de componentes (ui-kit)', () => {
  const selectores = new Set(MANIFIESTO_UI_KIT.map((f) => f.selector));
  const visibles = MANIFIESTO_UI_KIT.filter((f) => !SELECTORES_OCULTOS.includes(f.selector));

  it('cada componente visible tiene categoría', () => {
    const sinCategoria = visibles.filter((f) => !CATEGORIA_POR_SELECTOR[f.selector]).map((f) => f.selector);
    expect(sinCategoria).withContext('Declararlos en CATEGORIA_POR_SELECTOR (ui-kit.catalogo.ts)').toEqual([]);
  });

  it('la configuración no menciona componentes que ya no existen', () => {
    const huerfanos = [...Object.keys(CATEGORIA_POR_SELECTOR), ...SELECTORES_OCULTOS, ...EJEMPLO_POR_SELECTOR.keys(), ...Object.keys(MOTIVO_SIN_EJEMPLO)]
      .filter((s) => !selectores.has(s));
    expect(huerfanos).withContext('Selector renombrado o borrado: actualizar el catálogo o regenerar el manifiesto').toEqual([]);
  });

  it('cada categoría declarada existe y ninguna queda vacía', () => {
    const ids = new Set(CATEGORIAS_UI_KIT.map((c) => c.id));
    expect(Object.values(CATEGORIA_POR_SELECTOR).filter((id) => !ids.has(id))).toEqual([]);
    for (const c of CATEGORIAS_UI_KIT) {
      expect(Object.values(CATEGORIA_POR_SELECTOR)).withContext(c.id).toContain(c.id);
    }
  });

  it('cada componente visible tiene ejemplo en vivo o un motivo declarado', () => {
    const sinEjemplo = visibles.filter((f) => !EJEMPLO_POR_SELECTOR.has(f.selector) && !MOTIVO_SIN_EJEMPLO[f.selector]).map((f) => f.selector);
    expect(sinEjemplo).withContext('Agregar su @case en ejemplos/ (con datos de muestra si usa la API)').toEqual([]);
  });

  it('los ejemplos responsive existen (se pintan en marcos de escritorio y móvil)', () => {
    expect(Object.keys(EJEMPLOS_RESPONSIVE).filter((s) => !EJEMPLO_POR_SELECTOR.has(s))).toEqual([]);
    expect(EJEMPLOS_RESPONSIVE['siaf-navbar']).toBeDefined();
  });

  it('un selector no aparece en dos componentes de ejemplos', () => {
    const todos = COMPONENTES_EJEMPLO.flatMap((c) => c.selectores);
    expect(todos.length).toBe(new Set(todos).size);
  });

  it('marca como sin uso lo que ninguna pantalla pinta ni carga por ruta', () => {
    const porSelector = new Map(MANIFIESTO_UI_KIT.map((f) => [f.selector, f]));
    expect(porSelector.get('siaf-collapsible-card')?.sinUso).toBeTrue();
    expect(porSelector.get('siaf-button')?.sinUso).toBeFalse();
    expect(porSelector.get('[siafTooltip]')?.sinUso).toBeFalse();
  });

  it('una familia va entera en una categoría: todos los paneles laterales en Overlays', () => {
    for (const panel of ['siaf-side-nav', 'siaf-side-panel', 'siaf-selection-side-nav', 'siaf-upload-side-nav', 'siaf-column-visibility-panel', 'siaf-query-parameters-panel']) {
      expect(CATEGORIA_POR_SELECTOR[panel]).withContext(panel).toBe('overlays');
    }
    expect(CATEGORIA_POR_SELECTOR['siaf-action-tracker']).toBe(CATEGORIA_POR_SELECTOR['siaf-detail-history-tabs']);
  });

  it('una pantalla armada solo con configuración va en Plantillas, no con los layouts que llena cada pantalla', () => {
    for (const plantilla of ['siaf-documents-records-page', 'siaf-query-report-page']) {
      expect(CATEGORIA_POR_SELECTOR[plantilla]).withContext(plantilla).toBe('plantillas');
    }
    for (const layout of ['siaf-solicitude-page-layout', 'siaf-page-shell']) {
      expect(CATEGORIA_POR_SELECTOR[layout]).withContext(layout).toBe('paginas');
    }
    const titulos = CATEGORIAS_UI_KIT.map((c) => c.titulo);
    expect(titulos.indexOf('Plantillas de pantalla')).toBe(titulos.indexOf('Layouts de página') + 1);
  });

  it('el manifiesto trae la documentación extraída del código', () => {
    const boton = MANIFIESTO_UI_KIT.find((f) => f.selector === 'siaf-button')!;
    expect(boton.clase).toBe('ButtonComponent');
    expect(boton.importacion).toBe('@siaf/ui/button/button.component');
    expect(boton.descripcion).toContain('Botón base');
    expect(boton.entradas.find((e) => e.nombre === 'size')?.tipo).toBe("'sm' | 'md'");
    expect(MANIFIESTO_UI_KIT.find((f) => f.selector === 'siaf-icon')!.entradas.find((e) => e.nombre === 'name')?.requerida).toBeTrue();
    expect(MANIFIESTO_UI_KIT.find((f) => f.selector === 'siaf-tabs')!.eventos.map((e) => e.nombre)).toContain('activeIdChange');
  });
});
