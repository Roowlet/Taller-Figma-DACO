import { FichaComponente } from './ui-kit.model';
import { MANIFIESTO_UI_KIT } from './ui-kit.manifest';
import {
  MOTIVO_SESION,
  PosicionSeccion,
  agrupar,
  bloquesDeDescripcion,
  filtrar,
  idDeSelector,
  nombreDeUso,
  seccionEnLectura,
  segmentar,
  snippetUso,
  urlDeNodoFigma,
  usuariosDe,
} from './ui-kit.vista';

const ficha = (extra: Partial<FichaComponente>): FichaComponente => ({
  selector: 'siaf-x',
  clase: 'XComponent',
  tipo: 'componente',
  capa: 'ui',
  importacion: '@siaf/ui/x/x.component',
  archivo: 'src/app/shared/ui/x/x.component.ts',
  descripcion: '',
  usaSesion: false,
  proyectaContenido: false,
  entradas: [],
  eventos: [],
  usar: null,
  evitar: null,
  teclado: null,
  accesibilidad: null,
  figma: [],
  aria: { roles: [], atributos: [] },
  tokens: [],
  usa: [],
  ...extra,
});

describe('ui-kit.vista', () => {
  describe('bloquesDeDescripcion', () => {
    it('separa párrafos, une las líneas y marca código y negrita', () => {
      const bloques = bloquesDeDescripcion('Primera línea\nsigue con `codigo` y **fuerte**.\n\nSegundo párrafo.');
      expect(bloques.length).toBe(2);
      expect(bloques[0]).toEqual({
        tipo: 'parrafo',
        segmentos: [
          { tipo: 'texto', texto: 'Primera línea sigue con ' },
          { tipo: 'codigo', texto: 'codigo' },
          { tipo: 'texto', texto: ' y ' },
          { tipo: 'negrita', texto: 'fuerte' },
          { tipo: 'texto', texto: '.' },
        ],
      });
    });

    it('reconoce listas numeradas y con viñetas, con líneas de continuación', () => {
      const [intro, lista] = bloquesDeDescripcion('Estados:\n1. **Idle** — chip neutro.\n2. **Selected** — al click\n   en la X limpia.');
      expect(intro.tipo).toBe('parrafo');
      expect(lista.tipo).toBe('lista');
      if (lista.tipo !== 'lista') return;
      expect(lista.ordenada).toBeTrue();
      expect(lista.items.length).toBe(2);
      expect(lista.items[1].map((s) => s.texto).join('')).toBe('Selected — al click en la X limpia.');
    });

    it('convierte en bloque de código tanto el triple backtick como un ejemplo con sangría', () => {
      const conFence = bloquesDeDescripcion('Uso:\n\n```html\n<td siafTooltip>\n\n<siaf-icon />\n```');
      expect(conFence[1]).toEqual({ tipo: 'codigo', texto: '<td siafTooltip>\n\n<siaf-icon />' });

      const conSangria = bloquesDeDescripcion('Ejemplo:\n\n  <siaf-page-shell>\n    <p>hola</p>\n  </siaf-page-shell>');
      expect(conSangria[1]).toEqual({ tipo: 'codigo', texto: '<siaf-page-shell>\n  <p>hola</p>\n</siaf-page-shell>' });
    });
  });

  it('segmentar ignora trozos vacíos', () => {
    expect(segmentar('`a`')).toEqual([{ tipo: 'codigo', texto: 'a' }]);
  });

  describe('snippetUso', () => {
    it('incluye solo las entradas obligatorias', () => {
      const f = ficha({ entradas: [
        { nombre: 'rows', tipo: 'T[]', porDefecto: null, requerida: true, descripcion: null },
        { nombre: 'dense', tipo: 'boolean', porDefecto: 'false', requerida: false, descripcion: null },
      ] });
      expect(snippetUso(f)).toBe('<siaf-x [rows]="…" />');
    });

    it('usa etiqueta de cierre si proyecta contenido y atributo si es directiva', () => {
      expect(snippetUso(ficha({ proyectaContenido: true }))).toBe('<siaf-x>…</siaf-x>');
      expect(snippetUso(ficha({ selector: '[siafTooltip]', tipo: 'directiva' }))).toBe('<span siafTooltip="…"></span>');
    });
  });

  it('nombreDeUso quita los corchetes de un selector de atributo y deja igual una etiqueta', () => {
    expect(nombreDeUso('[siafTooltip]')).toBe('siafTooltip');
    expect(nombreDeUso('siaf-button')).toBe('siaf-button');
    expect(agrupar(MANIFIESTO_UI_KIT)[0].fichas.find((f) => f.selector === '[siafTooltip]')?.nombre).toBe('siafTooltip');
  });

  it('idDeSelector deja un ancla válida para la URL', () => {
    expect(idDeSelector('[siafTooltip]')).toBe('siafTooltip');
    expect(idDeSelector('siaf-menu')).toBe('siaf-menu');
  });

  describe('usuariosDe («Lo usan»)', () => {
    const fichas = agrupar(MANIFIESTO_UI_KIT).flatMap((g) => g.fichas);
    const de = (selector: string) => fichas.find((f) => f.selector === selector)!;

    it('es la relación inversa de los componentes que pinta, ordenada por nombre', () => {
      expect(de('siaf-badge').usadoPor.map((u) => u.nombre)).toEqual(['siaf-list', 'siaf-navbar', 'siaf-tabs', 'siaf-tray-menu']);
      for (const f of fichas) {
        for (const usado of f.componentesUsados) {
          const hijo = fichas.find((x) => x.selector === usado.selector);
          if (hijo) expect(hijo.usadoPor.map((u) => u.selector)).withContext(`${f.selector} → ${usado.selector}`).toContain(f.selector);
        }
      }
    });

    it('incluye a los ocultos del catálogo sin ficha a la que enlazar', () => {
      expect(de('siaf-navbar').usadoPor).toEqual([{ selector: 'siaf-app-shell', nombre: 'siaf-app-shell', id: 'siaf-app-shell', enCatalogo: false }]);
      expect(de('siaf-badge').usadoPor.every((u) => u.enCatalogo)).toBeTrue();
    });

    it('un componente no se cuenta a sí mismo', () => {
      const propio = ficha({ selector: 'siaf-x', usa: ['siaf-x'] });
      expect(usuariosDe('siaf-x', [propio])).toEqual([]);
    });
  });

  describe('enlazarFichas', () => {
    const fichas = agrupar(MANIFIESTO_UI_KIT).flatMap((g) => g.fichas);
    const segmentosDe = (selector: string) => {
      const f = fichas.find((x) => x.selector === selector)!;
      return [f.bloques, f.bloquesUsar, f.bloquesEvitar, f.bloquesTeclado, f.bloquesAccesibilidad]
        .flat()
        .flatMap((b) => (b.tipo === 'parrafo' ? b.segmentos : b.tipo === 'lista' ? b.items.flat() : []));
    };

    it('el código que nombra otra ficha visible enlaza a ella: el buscador de tablas lleva a su variante', () => {
      const variante = segmentosDe('siaf-form-table-search').find((s) => s.texto === 'siaf-records-search-toolbar');
      expect(variante?.enlace).toBe('siaf-records-search-toolbar');
      const vuelta = segmentosDe('siaf-records-search-toolbar').find((s) => s.texto === 'siaf-form-table-search');
      expect(vuelta?.enlace).toBe('siaf-form-table-search');
    });

    it('una ficha no se enlaza consigo misma y el código que no es una ficha queda sin enlace', () => {
      const propios = segmentosDe('siaf-records-search-toolbar');
      expect(propios.filter((s) => s.enlace === 'siaf-records-search-toolbar')).toEqual([]);
      expect(propios.find((s) => s.texto === 'actions')?.enlace).toBeUndefined();
    });

    it('una directiva se enlaza por su nombre de uso, sin corchetes', () => {
      const directiva = fichas.find((f) => f.selector === '[siafTooltip]')!;
      const enlazados = fichas.flatMap((f) => segmentosDe(f.selector)).filter((s) => s.enlace === directiva.id);
      expect(enlazados.length).toBeGreaterThan(0);
    });
  });

  describe('seccionEnLectura', () => {
    const secciones: PosicionSeccion[] = [
      { id: 'color', arriba: -900 },
      { id: 'siaf-icon', arriba: 40 },
      { id: 'siaf-button', arriba: 700 },
      { id: 'siaf-menu', arriba: 1500 },
    ];

    it('elige la última sección que ya cruzó la línea de lectura', () => {
      expect(seccionEnLectura(secciones, 128)).toBe('siaf-icon');
      expect(seccionEnLectura(secciones, 700)).toBe('siaf-button');
    });

    it('arriba de la primera sección (la introducción) no marca ninguna', () => {
      expect(seccionEnLectura([{ id: 'color', arriba: 400 }], 128)).toBeNull();
      expect(seccionEnLectura([], 128)).toBeNull();
    });

    it('deja de medir en la primera sección que está debajo de la línea', () => {
      const medidas: string[] = [];
      function* medir(): Generator<PosicionSeccion> {
        for (const s of secciones) {
          medidas.push(s.id);
          yield s;
        }
      }
      expect(seccionEnLectura(medir(), 128)).toBe('siaf-icon');
      // siaf-menu no se mide: siaf-button ya estaba debajo de la línea.
      expect(medidas).toEqual(['color', 'siaf-icon', 'siaf-button']);
      medidas.length = 0;
      expect(seccionEnLectura(medir(), -1000)).toBeNull();
      expect(medidas).toEqual(['color']);
    });
  });

  describe('agrupar y filtrar', () => {
    const grupos = agrupar(MANIFIESTO_UI_KIT);

    it('respeta el orden de categorías y el curado dentro de cada una, sin las pantallas ocultas', () => {
      expect(grupos[0].categoria.titulo).toBe('Fundamentos');
      expect(grupos[0].fichas[0].selector).toBe('siaf-icon');
      const todos = grupos.flatMap((g) => g.fichas.map((f) => f.selector));
      expect(todos).not.toContain('siaf-app-shell');
      expect(grupos.some((g) => g.categoria.titulo === 'Otros')).toBeFalse();
    });

    it('los componentes que usan la API también tienen ejemplo (con datos de muestra)', () => {
      const fichas = grupos.flatMap((g) => g.fichas);
      const navbar = fichas.find((f) => f.selector === 'siaf-navbar')!;
      expect(navbar.usaSesion).toBeTrue();
      expect(navbar.ejemplo).not.toBeNull();
      expect(navbar.motivoSinEjemplo).toBeNull();
      expect(fichas.filter((f) => !f.ejemplo).map((f) => f.selector)).toEqual([]);
    });

    it('sin ejemplo, un componente con sesión explica por qué', () => {
      const [grupo] = agrupar([{ ...MANIFIESTO_UI_KIT.find((f) => f.selector === 'siaf-navbar')!, selector: 'siaf-navbar-futuro' }]);
      expect(grupo.fichas[0].motivoSinEjemplo).toBe(MOTIVO_SESION);
    });

    it('busca sin distinguir acentos ni mayúsculas, también en la descripción', () => {
      const porDescripcion = filtrar(grupos, 'BOTÓN BASE').flatMap((g) => g.fichas.map((f) => f.selector));
      expect(porDescripcion).toContain('siaf-button');
      expect(filtrar(grupos, 'no-existe-nada')).toEqual([]);
      expect(filtrar(grupos, '   ').length).toBe(grupos.length);
    });
  });

  describe('pestañas de la ficha', () => {
    const tabs = agrupar(MANIFIESTO_UI_KIT).flatMap((g) => g.fichas).find((f) => f.selector === 'siaf-tabs')!;

    it('Uso y Accesibilidad salen de @usar, @evitar, @teclado y @accesibilidad del JSDoc', () => {
      expect(tabs.bloquesUsar[0].tipo).toBe('lista');
      expect(tabs.bloquesEvitar.length).toBeGreaterThan(0);
      expect(tabs.bloquesTeclado.length).toBeGreaterThan(0);
      expect(tabs.bloquesAccesibilidad.length).toBeGreaterThan(0);
      // Las etiquetas no se mezclan con la descripción.
      expect(tabs.descripcion).not.toContain('@usar');
      expect(tabs.descripcion).not.toContain('Para alternar entre vistas');
    });

    it('Especificaciones: nodo del Figma con enlace, componentes que pinta y tokens con su valor', () => {
      expect(tabs.enlacesFigma).toEqual([{ nodo: '2588:135', nombre: 'Tabs content', url: urlDeNodoFigma('2588:135') }]);
      expect(urlDeNodoFigma('2588:135')).toBe('https://www.figma.com/design/mJrG11d0rWf7BjPuE2ApPZ/?node-id=2588-135');
      expect(tabs.componentesUsados.map((c) => c.selector)).toEqual(['siaf-badge']);

      const divider = tabs.tokensConValor.find((t) => t.token === '--sys-color-divider-strong')!;
      expect(divider.via).toEqual(['var()']);
      expect(divider.valor?.tipo).toBe('color');
      expect(divider.seccion).toBe('color');
      const espacio = tabs.tokensConValor.find((t) => t.token === '--sys-gap-base-md')!;
      expect(espacio.via).toContain('px-siaf-md');
      expect(espacio.valor).toEqual({ tipo: 'medida', claro: '16px', oscuro: null });
    });

    it('los «nodo 1234:567» de la descripción también cuentan como nodos del Figma', () => {
      const [grupo] = agrupar([ficha({ selector: 'siaf-tabs', figma: [{ nodo: '1264:580', nombre: null }] })]);
      expect(grupo.fichas[0].enlacesFigma[0].url).toContain('node-id=1264-580');
      const menu = MANIFIESTO_UI_KIT.find((f) => f.selector === 'siaf-menu')!;
      expect(menu.figma.map((n) => n.nodo)).toContain('7440:34249');
    });

    it('Accesibilidad lee roles y atributos ARIA del código', () => {
      expect(tabs.aria.roles).toEqual(['tab', 'tablist']);
      expect(tabs.aria.atributos).toContain('aria-selected');
    });
  });
});
