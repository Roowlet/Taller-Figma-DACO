import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';

/**
 * Los fundamentos se generan leyendo los CSS con un script. Estos casos comparan cada valor generado con lo que el
 * navegador calcula a partir de los estilos reales de la app: si el extractor se equivoca al seguir una cadena de
 * var(), un tema o un breakpoint, falla aquí.
 */
describe('Fundamentos visuales: los datos generados coinciden con los estilos reales', () => {
  const raiz = document.documentElement;
  let temaPrevio: string | null;
  let prueba: HTMLElement;

  beforeEach(() => {
    temaPrevio = raiz.getAttribute('data-theme');
    prueba = document.createElement('div');
    document.body.append(prueba);
  });

  afterEach(() => {
    prueba.remove();
    if (temaPrevio === null) raiz.removeAttribute('data-theme');
    else raiz.setAttribute('data-theme', temaPrevio);
  });

  /** Valor calculado de una propiedad con el valor dado (var() o literal). */
  const calcular = (propiedad: string, valor: string): string => {
    prueba.style.setProperty(propiedad, valor);
    const resultado = getComputedStyle(prueba).getPropertyValue(propiedad);
    prueba.style.removeProperty(propiedad);
    return resultado;
  };

  const colores = FUNDAMENTOS_UI_KIT.colores.flatMap((g) => g.tokens);

  it('hay datos de las seis secciones', () => {
    expect(colores.length).toBeGreaterThan(100);
    expect(FUNDAMENTOS_UI_KIT.paleta.length).toBeGreaterThan(10);
    expect(FUNDAMENTOS_UI_KIT.tipografia.tamanos.length).toBeGreaterThan(10);
    expect(FUNDAMENTOS_UI_KIT.espaciado.gap.length).toBe(8);
    expect(FUNDAMENTOS_UI_KIT.radios.length).toBeGreaterThan(3);
    expect(FUNDAMENTOS_UI_KIT.sombras.length).toBeGreaterThan(3);
    expect(FUNDAMENTOS_UI_KIT.iconos.nombres).toContain('calendar_today');
  });

  it('cada color vale lo mismo que su token en tema claro', () => {
    raiz.setAttribute('data-theme', 'light');
    for (const t of colores.filter((c) => c.claro)) {
      expect(calcular('color', `var(${t.nombre})`)).withContext(t.nombre).toBe(calcular('color', t.claro!));
    }
  });

  it('cada color vale lo mismo que su token en tema oscuro', () => {
    raiz.setAttribute('data-theme', 'dark');
    for (const t of colores.filter((c) => c.oscuro)) {
      expect(calcular('color', `var(${t.nombre})`)).withContext(t.nombre).toBe(calcular('color', t.oscuro!));
    }
  });

  it('«Igual en oscuro» marca justo los colores que el tema oscuro no cambia', () => {
    const valorEn = (tema: string, token: string): string => {
      raiz.setAttribute('data-theme', tema);
      return calcular('color', `var(${token})`);
    };
    for (const t of colores.filter((c) => !c.soloOscuro)) {
      const igual = valorEn('light', t.nombre) === valorEn('dark', t.nombre);
      if (t.sinOscuro) expect(igual).withContext(t.nombre).toBeTrue();
    }
  });

  it('los tamaños de texto, espaciados y radios coinciden con el breakpoint de la ventana', () => {
    const dispositivo = matchMedia('(max-width: 767px)').matches ? 'movil' : matchMedia('(max-width: 1023px)').matches ? 'tablet' : 'escritorio';
    for (const t of FUNDAMENTOS_UI_KIT.tipografia.tamanos) {
      expect(calcular('font-size', `var(${t.token})`)).withContext(t.token).toBe(t[dispositivo]!);
    }
    for (const m of [...FUNDAMENTOS_UI_KIT.espaciado.gap, ...FUNDAMENTOS_UI_KIT.espaciado.padding, ...FUNDAMENTOS_UI_KIT.radios]) {
      expect(calcular('width', `var(${m.token})`)).withContext(m.token).toBe(m[dispositivo]!);
    }
  });

  it('cada sombra coincide con su token en ambos temas', () => {
    for (const tema of ['light', 'dark'] as const) {
      raiz.setAttribute('data-theme', tema);
      for (const s of FUNDAMENTOS_UI_KIT.sombras) {
        const esperada = tema === 'dark' ? (s.oscuro ?? s.claro) : s.claro;
        expect(calcular('box-shadow', `var(${s.token})`)).withContext(`${s.token} (${tema})`).toBe(calcular('box-shadow', esperada!));
      }
    }
  });

  it('no quedan variables --sys-* usadas sin definir (se corrigieron las 11 el 2026-09-14)', () => {
    // Sin definir y sin respaldo, la propiedad queda sin valor: un texto sin color propio o un fondo transparente.
    // Si falla, usar el token existente: /ui-kit#color y la sección «Revisión de tokens» muestran dónde está cada una.
    const detalle = FUNDAMENTOS_UI_KIT.sinDefinir.map((v) => `${v.nombre} en ${v.archivos.join(', ')}`).join('\n');
    expect(FUNDAMENTOS_UI_KIT.sinDefinir.length).withContext(detalle).toBe(0);
  });
});
