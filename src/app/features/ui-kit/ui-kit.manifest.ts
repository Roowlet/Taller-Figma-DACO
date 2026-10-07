// GENERADO por scripts/generar-ui-kit.mjs — no editar a mano.
// Regenerar con `npm run ui-kit:manifest` después de cambiar un componente.
import type { FichaComponente } from './ui-kit.model';

export const MANIFIESTO_UI_KIT: readonly FichaComponente[] = [
  {
    "selector": "[siafFoco]",
    "clase": "FocoDirective",
    "tipo": "directiva",
    "capa": "ui",
    "importacion": "@siaf/ui/foco/foco.directive",
    "archivo": "src/app/shared/ui/foco/foco.directive.ts",
    "descripcion": "Maneja el foco de un diálogo, panel lateral o panel desplegable, con el patrón que ya tenía `siaf-modal`\n(WCAG 2.4.3 Orden del foco, 2.1.1 Teclado y 2.1.2 Sin trampas de teclado):\n\n- Al activarse guarda el elemento enfocado y lleva el foco adentro: al elemento marcado con `data-foco-inicial`,\n  si no al primer control y, si no hay controles, al propio contenedor (que recibe `tabindex=\"-1\"`). Sin atrapar Tab\n  (panel no modal), solo si al abrirse había un control enfocado: lo que se pinta abierto al cargar la página no le\n  quita el foco a nadie ni mueve el scroll.\n- Con `siafFocoAtrapar` en true (por defecto), Tab y Shift + Tab dan la vuelta dentro del contenedor.\n- Escape emite `siafFocoEscape`: el componente decide cerrar. Sin nadie escuchando, Escape no hace nada.\n- Al desactivarse (o al destruirse) devuelve el foco al elemento que lo tenía, si el foco llegó a entrar, ese\n  elemento sigue en la página y el foco no se fue a otro lado.\n- `siafFocoSalida` avisa cuando el foco sale del contenedor hacia otro control (con Tab o Shift + Tab, también si\n  antes pasó por la barra del navegador): un desplegable se cierra ahí. Si el foco ya está en otro control, al\n  desactivarse no lo devuelve.\n\nSe pone en el elemento que contiene los controles (el `aside` del panel, la `section` del diálogo) y se activa con\nel mismo `open` del componente; con la animación de `SidePanelAnimacion` el foco vuelve apenas empieza a cerrar.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "siafFoco",
        "tipo": "boolean | '' | null | undefined",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Activa el manejo del foco; basta con escribir el atributo (`siafFoco`) para activarlo al pintarse."
      },
      {
        "nombre": "siafFocoAtrapar",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Tab da la vuelta dentro del contenedor (diálogos modales). En false, solo mueve el foco y atiende Escape."
      }
    ],
    "eventos": [
      {
        "nombre": "siafFocoEscape",
        "tipo": "KeyboardEvent",
        "descripcion": "Escape dentro del contenedor mientras está activo."
      },
      {
        "nombre": "siafFocoSalida",
        "tipo": "FocusEvent",
        "descripcion": "El foco salió del contenedor hacia otro control de la página (un desplegable se cierra)."
      }
    ],
    "usar": "- En todo modal o panel lateral del kit: `siaf-modal`, `siaf-annulment-modal`, `siaf-side-nav`, `siaf-side-panel`,\n  los paneles de selección, carga, columnas e historiales.\n- Con `siafFocoAtrapar` en false para paneles no modales que se abren sobre la página, como el de notificaciones o\n  el filtro personalizado de la bandeja: el foco entra y Escape cierra, pero Tab puede salir.\n- En desplegables (menús, listas de un select, calendario, popover) con `siafFocoAtrapar` en false y\n  `siafFocoSalida` para cerrarlos cuando el foco se va con Tab. La capa invisible que cierra al pulsar fuera va con\n  `tabindex=\"-1\"`, `aria-hidden` y sin robar el foco al pulsarla.\n- En un overlay que bloquea la página mientras se procesa (`siaf-loader-overlay`), sin `siafFocoEscape`.",
    "evitar": "- Reescribir a mano en otro componente el guardado y devolución del foco o la vuelta de Tab: usar esta directiva.\n- En menús de opciones con flechas: `siaf-menu` ya maneja su propio teclado.\n- En contenido que no se abre ni se cierra (una tarjeta, una sección de la página).",
    "teclado": "- **Tab / Shift + Tab**: con `siafFocoAtrapar` en true, recorren los controles del contenedor y dan la vuelta del\n  último al primero; en false, siguen el orden normal de la página.\n- **Escape**: emite `siafFocoEscape` para que el componente cierre; el foco vuelve a donde estaba al abrir.\n- **Tab** fuera de un desplegable: emite `siafFocoSalida` y el foco sigue al control siguiente.",
    "accesibilidad": "- **2.4.3 Orden del foco (A)**: mueve el foco al abrir y lo devuelve al cerrar, así el recorrido con Tab sigue\n  desde el control que abrió el panel.\n- **2.1.2 Sin trampas de teclado (A)**: el foco queda atrapado solo mientras el diálogo está activo y Escape siempre\n  ofrece la salida cuando el componente escucha `siafFocoEscape`.\n- **2.1.1 Teclado (A)**: cerrar con Escape equivale al botón de cerrar.\n- **4.1.2 Nombre, función y valor (A)**: no pone roles: el componente declara `role=\"dialog\"`, `aria-modal` y el\n  nombre (`aria-labelledby` o `aria-label`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "[siafTooltip]",
    "clase": "TooltipDirective",
    "tipo": "directiva",
    "capa": "ui",
    "importacion": "@siaf/ui/tooltip/tooltip.directive",
    "archivo": "src/app/shared/ui/tooltip/tooltip.directive.ts",
    "descripcion": "Tooltip para textos truncados y elementos con ayuda contextual.\n\nEs el único tooltip del design system (el componente envoltorio `siaf-tooltip` se retiró en\n2026-09: pintaba el globo con CSS dentro del elemento). Se monta en `document.body` con\n`position: fixed`, así que **nunca lo recorta**\nun contenedor con `overflow` — el caso de las tablas con scroll horizontal.\nAdemás no agrega nodos al DOM hasta que el usuario lo pide.\n\nEn escritorio se muestra al pasar el mouse o al enfocar con el teclado el elemento o el control que lo contiene\n(la opción de un menú, un botón); el puntero puede pasar al globo sin que desaparezca y Escape lo oculta. En\nmóvil no hay hover, así que se muestra manteniendo pulsado ~500 ms; el texto\nque puede envolver en pantallas chicas debería usar `sm:truncate` en vez de\n`truncate` y no depender de este gesto.\n\nDos modos según se le pase texto o no:\n\n```html\n<!-- Texto truncado: usa el propio contenido y SOLO aparece si está cortado -->\n<td class=\"truncate\" siafTooltip>{{ fila.nombre }}</td>\n\n<!-- Ayuda contextual: texto explícito, siempre visible al hover -->\n<siaf-icon name=\"info\" siafTooltip=\"Explicación del campo\" />\n```",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "siafTooltip",
        "tipo": "string | null | undefined",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Texto a mostrar. Vacío = usa el textContent del elemento (modo truncado)."
      },
      {
        "nombre": "tooltipMode",
        "tipo": "'auto' | 'always' | 'truncated'",
        "porDefecto": "'auto'",
        "requerida": false,
        "descripcion": "Fuerza el comportamiento respecto al truncado: - `auto` (default): si NO se pasó texto, solo aparece cuando está truncado. - `always`: aparece siempre. - `truncated`: aparece solo cuando el contenido está truncado."
      }
    ],
    "eventos": [],
    "usar": "- Texto que se corta con `truncate` y cuyo valor completo importa: celdas de la grilla de la bandeja\n  (`siaf-documents-records-table`), descripciones en la solicitud del catálogo de eventos, datos de\n  `siaf-summary-card` y el usuario y la oficina de `siaf-navbar`. Solo aparece si el texto está cortado.\n- Ayuda breve junto a un ícono `info`, como «Criterios de búsqueda ingresados» en las consultas de Plan de Cuentas,\n  Asiento de ajuste, Catálogo de ajuste y Contabilización, con `tabindex=\"0\"` y `aria-label` en el elemento.\n- Para mostrar al pasar el mouse qué hace un botón de solo ícono, como «Carga masiva» en la carga masiva de cuentas\n  contables, sin quitar su `ariaLabel`.\n- Dentro de tablas o paneles con scroll: el globo se monta en el `body` y el contenedor no lo recorta.",
    "evitar": "- Para información imprescindible, instrucciones o errores: dejarla visible (`siaf-input` con su error, `message-box`\n  o `siaf-alert`); el globo solo aparece con el puntero o el foco y en móvil exige una pulsación larga.\n- Para contenido con título, enlaces o botones: usar `siaf-popover`; el globo solo muestra texto.\n- Para texto que puede envolver en pantallas chicas: usar `sm:truncate` en vez de `truncate` y no depender del globo.\n- Un globo hecho a mano con CSS o con el atributo `title`: esta directiva es el único tooltip del kit.",
    "teclado": "- **Tab**: al llegar el foco al elemento, o al control que contiene el texto (una opción de `siaf-menu`,\n  `siaf-select-options` o `siaf-list`, un botón, un enlace), aparece el globo; al salir se oculta. Si el control\n  tiene varios textos cortados, muestra el primero. En dispositivos sin hover no aparece con el foco.\n- **Escape**: oculta el globo; el menú o el panel que lo contiene sigue recibiendo la tecla.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: con texto de ayuda, el control queda enlazado por `aria-describedby` a una\n  descripción oculta que existe desde el inicio, así el lector la anuncia al enfocarlo aunque el globo no se haya\n  pintado; si el nombre del control ya incluye ese texto, no lo repite. El globo es `role=\"tooltip\"` con\n  `aria-hidden` (solo visual). En modo truncado no se enlaza: el texto completo ya está en el DOM.\n- **1.4.13 Contenido en hover o foco (AA)**: Escape lo oculta sin mover el puntero ni el foco; se puede llevar el\n  puntero sobre el globo sin que desaparezca (espera 150 ms al salir del elemento) y sigue visible mientras el\n  elemento tenga el puntero o el foco. Se oculta al desplazar la página.\n- **1.4.3 Contraste mínimo (AA)**: `text-brand-white` sobre `bg-feedback-dark-default` 12.24:1 en claro; en oscuro,\n  sobre `bg-snackbar` (el mismo fondo del snackbar), 15.71:1.\n- **Pendiente · 2.1.1 Teclado (A)**: la directiva no agrega `tabindex`: un texto cortado que no está dentro de un\n  control enfocable (un título, una celda, una etiqueta) solo se completa con el mouse o con la pulsación larga; el\n  lector de pantalla sí lee el texto entero.",
    "figma": [],
    "aria": {
      "roles": [
        "tooltip"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-feedback-dark-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-snackbar",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-md",
        "via": [
          "shadow-siaf-md"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "empty-section",
    "clase": "EmptySectionComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/empty-section/empty-section.component",
    "archivo": "src/app/shared/ui/empty-section/empty-section.component.ts",
    "descripcion": "Bloque de estado vacío de una sección: título, botón de acción (lupa por defecto) y recuadro\ncon el mensaje; `[message]` se reemplaza por el valor una vez que el usuario elige uno.\n\nEs el componente canónico para ese patrón: úsalo SIEMPRE en vez de rehacer el título + botón +\n`message-box` a mano (ya se reinventó una vez en el proyecto).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "actionIcon",
        "tipo": "string",
        "porDefecto": "'search'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "message",
        "tipo": "string",
        "porDefecto": "'No se ha seleccionado ningún tipo. Haga clic en el botón p…",
        "requerida": false,
        "descripcion": "Texto del recuadro: se reemplaza por el valor una vez seleccionado."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "actionClicked",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para un dato que se elige desde un panel lateral: título, lupa y recuadro que pasa a mostrar lo elegido\n  (atributos del evento en el catálogo de eventos, «Buscar evento» en el catálogo de eventos contables).\n- Para selección múltiple, pasando en `message` los valores elegidos separados por comas («Ámbito\n  institucional», «Conceptos para eventos contables»).\n- Con `disabled` mientras no se puede elegir: en una modificación de vigencia o cuando el campo depende de\n  otro que aún no tiene valor.",
    "evitar": "- Rehacer a mano el título, el botón y el `message-box`: este es el componente canónico.\n- Cuando ya hay un ítem elegido con varios datos: pasar a `siaf-summary-card` (como «Buscar evento» en el\n  catálogo de eventos contables) o a la grilla estándar con `siaf-table-controls` si son dos o más.\n- Para una pantalla de consulta sin resultados: usar `siaf-empty-state`.",
    "teclado": "- **Tab**: enfoca el botón de acción; deshabilitado no recibe el foco.\n- **Enter / Espacio**: emiten `actionClicked` (el botón sigue `siaf-button`).",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es un `<section>` con el título en un `<h3>` de nivel fijo y el\n  mensaje en un párrafo (`message-box`).\n- **4.1.2 Nombre, función y valor (A)**: el botón de ícono recibe `title` como `ariaLabel`, así que nombra la\n  sección y no la acción; sin `title` se leería el nombre del ícono. El padre debe dar siempre `title`.\n- **1.1.1 Contenido no textual (A)**: la lupa es decorativa; el nombre del botón sale de `ariaLabel`.\n- **4.1.3 Mensajes de estado (AA)**: el recuadro no es región viva: al elegir un valor, el texto nuevo no se\n  anuncia.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` 16.29:1 (16.53:1 en oscuro) y mensaje\n  `text-neutral-medium` sobre `bg-surfaces-surface-low` 13.46:1 (12.09:1).\n- **2.4.7 Foco visible (AA)**: el botón muestra el borde `border-states-focus` (5.35:1) y la capa de foco.\n- **2.5.8 Tamaño del objetivo (AA)**: el botón mide 40 × 40 px.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      }
    ],
    "usa": [
      "message-box",
      "siaf-button"
    ],
    "sinUso": true
  },
  {
    "selector": "message-box",
    "clase": "MessageBoxComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/message-box/message-box.component",
    "archivo": "src/app/shared/ui/message-box/message-box.component.ts",
    "descripcion": "Recuadro informativo de una línea: fondo de superficie baja y un texto secundario.\n\nÚsalo para avisos o notas breves dentro de un formulario o sección. Ya existe en el kit y se\nreinventó a mano alguna vez: no vuelvas a maquetar este bloque. Para el estado vacío con título y\nlupa, el componente canónico es `empty-section`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "text",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Como marcador gris de una sección que aún no tiene contenido: «No se han adjuntado archivos…» en el\n  documento de sustento de la carga masiva del Plan de Cuentas.\n- Para una nota breve y fija dentro de un formulario, sin tono de éxito, advertencia ni error.\n- Ya va dentro de `empty-section`, donde muestra el mensaje inicial o el valor elegido.",
    "evitar": "- Para el patrón título + lupa + recuadro: usar `empty-section`.\n- Para avisos con tono (información, advertencia, error) o que deben anunciarse: usar `siaf-alert`.\n- Para confirmar una acción que acaba de terminar: usar `siaf-snackbar`.\n- Para una pantalla de consulta sin resultados: usar `siaf-empty-state`.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es un párrafo dentro de un recuadro, sin rol ni encabezado propio:\n  el título lo pone la sección que lo contiene.\n- **1.4.3 Contraste mínimo (AA)**: `text-neutral-medium` sobre `bg-surfaces-surface-low`, 13.46:1 en claro y\n  12.09:1 en oscuro.\n- **4.1.3 Mensajes de estado (AA)**: no es región viva: si el texto cambia tras una acción, no se anuncia.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "readonly-field",
    "clase": "ReadonlyFieldComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/readonly-field/readonly-field.component",
    "archivo": "src/app/shared/ui/readonly-field/readonly-field.component.ts",
    "descripcion": "Campo de solo lectura con caption flotante que muestra el valor o `--` cuando está vacío.\n\nÚsalo para mostrar datos ya grabados en las pantallas de consulta o en el modo lectura de una\nsolicitud. No confundir con `siaf-readonly`, que es otro componente distinto y sin consumidores.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "caption",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "required",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- En el modo lectura de una solicitud, en lugar del campo editable y con el mismo caption: cuenta contable, carga\n  masiva del plan de cuentas, clase de ajuste, tipo de asiento y asiento de ajuste.\n- Para los criterios de búsqueda sobre los resultados de las consultas (plan de cuentas, asiento de ajuste, tipos de\n  asiento, contabilización) y la cabecera de un detalle o reporte (pedido de contabilización, apertura contable,\n  libros contables).\n- Para leer un dato con contraste completo: un campo `[disabled]` pinta el texto tenue (exento de contraste) y aquí\n  el valor va en `text-neutral-high`.\n- `[required]` solo para repetir el asterisco del campo editable, así la lectura se ve igual que la edición.",
    "evitar": "- Para un dato que el usuario puede cambiar: usar `siaf-input`, `text-area-control` o `siaf-date-time-picker`.\n- Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`; para un aviso breve, `message-box`.\n- Confundirlo con `siaf-readonly`, el recuadro gris con etiqueta en mayúsculas que ninguna pantalla usa.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es texto estático, no un campo: el caption va antes del valor en el DOM,\n  así que se leen juntos y en orden; no usa `dt`/`dd` ni `aria-labelledby`.\n- **1.4.3 Contraste mínimo (AA)**: caption `text-neutral-low` 5.01:1 (8.86:1 oscuro), valor `text-neutral-high`\n  16.29:1 y asterisco `text-feedback-danger` 9.84:1 sobre `bg-surfaces-surface`.\n- **1.4.1 Uso del color (A)**: el obligatorio se marca con un asterisco, no solo con el color.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "px-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-accordion",
    "clase": "AccordionComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/accordion/accordion.component",
    "archivo": "src/app/shared/ui/accordion/accordion.component.ts",
    "descripcion": "Lista de secciones colapsables (details/summary) a partir de un arreglo de ítems.\n\nUsarlo para preguntas frecuentes o bloques de contenido plegable. Variante `default` para\npantallas internas y `landing` para la portada pública. Un ítem con `disabled` no se abre.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "items",
        "tipo": "AccordionItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "openId",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'default' | 'landing'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Preguntas frecuentes de la portada pública con la variante `landing` (pantalla de Preguntas frecuentes).\n- Ayudas o notas de solo texto en pantallas internas que el usuario abre a demanda (variante `default`).\n- Cuando cada sección es un título y un párrafo: `openId` elige cuál empieza abierta y el resto lo maneja el\n  `details` nativo (pueden quedar varias abiertas).",
    "evitar": "- Para contenido rico (formularios, grillas, botones): el ítem solo acepta texto; usar `siaf-expansion-panel`.\n- Para ítems de una selección que se quitan con X: usar `siaf-collapsible-card`.\n- Para secciones obligatorias de una solicitud: dejarlas visibles en `siaf-solicitude-form-card`.\n- Marcar `disabled` para esconder un ítem: sigue enfocable y se despliega vacío; mejor no incluirlo.",
    "teclado": "- **Tab**: pasa de un título a otro (cada título es un `summary` nativo).\n- **Enter / Espacio**: abren o cierran la sección enfocada (comportamiento nativo de `details`).",
    "accesibilidad": "- **Pendiente · 4.1.2 Nombre, función y valor (A)**: `details` y `summary` nativos anuncian cada título como\n  desplegable con su estado, sin ARIA extra; pero un ítem `disabled` solo se atenúa (`opacity-50`): su `summary`\n  sigue recibiendo foco, se despliega vacío al pulsarlo y no publica `aria-disabled`.\n- **1.1.1 Contenido no textual (A)**: la flecha y los íconos más / menos de `landing` son `siaf-icon` decorativos\n  (`aria-hidden`).\n- **1.4.1 Uso del color (A)**: abierto o cerrado se ve en la flecha que gira o en el cambio de más a menos, no solo\n  en el fondo.\n- **1.4.3 Contraste mínimo (AA)**: en `default`, título `text-neutral-high` 16.29:1 (oscuro 16.53:1) y contenido\n  `text-neutral-low` 5.01:1 (8.86:1) sobre la superficie; `landing` usa colores fijos (`#555`, `#d52d50`) fuera de\n  los tokens, así que su contraste depende del fondo de la portada.\n- **2.4.7 Foco visible (AA)**: no define estilo de foco ni lo quita: el `summary` muestra el contorno por defecto\n  del navegador.\n- **2.5.8 Tamaño del objetivo (AA)**: cada título ocupa todo el ancho y mide al menos 48 px de alto (72 px en\n  `landing`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border",
          "divide-border"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-radius-lg",
        "via": [
          "rounded-siaf-lg"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-account-history-panel",
    "clase": "AccountHistoryPanelComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/account-history-panel/account-history-panel.component",
    "archivo": "src/app/shared/components/account-history-panel/account-history-panel.component.ts",
    "descripcion": "Panel lateral a pantalla completa «Historial del registro» de una cuenta contable, que abre la bandeja\n`siaf-documents-records-page` desde la pestaña Registros.\n\nAl abrirse con un `record` pide a la API el detalle de la cuenta y su historial de solicitudes, y muestra la cuenta\n(datos, atributos, dinámica contable y entidades del estado) junto con la solicitud que la creó (documento,\nsustento y `siaf-action-tracker`). Se cierra con la X o pulsando el fondo, que emiten `closed`.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "record",
        "tipo": "DocumentsRecordsRow | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para ver desde la bandeja del plan de cuentas cómo quedó una cuenta contable y quién elaboró, verificó y aprobó\n  la solicitud que la creó, sin abrir esa solicitud.\n- Para consultar en solo lectura atributos, dinámica contable, cuentas anteriores, entidades del estado y sustento\n  de un registro.",
    "evitar": "- Para registros que no son cuentas contables: sus secciones son las del plan de cuentas; los asientos de ajuste\n  usan `siaf-asiento-history-panel` (`recordHistoryKind: 'asiento'`).\n- Para el historial de estados de un documento (pestaña Documentos): usar `siaf-document-history-panel`.\n- Dentro de la solicitud abierta: usar `siaf-detail-history-tabs` y `siaf-action-tracker` en la página.\n- Para modificar la cuenta: el panel es de solo lectura; el cambio va por una solicitud de modificación.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X; recorre los controles de la tabla de entidades y da la vuelta sin salir\n  del panel (`siaf-table-controls` y `siaf-pagination` siguen su propio teclado).\n- **Enter / Espacio** en la X: cierran el panel (emite `closed`).\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón de historial.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: es `role=\"dialog\"` con `aria-modal=\"true\"` y nombre desde su título\n  (`aria-labelledby`); la X se llama «Cerrar historial de cuenta contable».\n- **1.3.1 Información y relaciones (A)**: títulos `h2` y `h3` por sección, cuentas anteriores y entidades en una\n  `table` con `thead` y `th`, y «¿Está visible?» como checkbox nativo deshabilitado dentro de su `label`.\n- **1.4.1 Uso del color (A)**: el estado del registro va en `siaf-record-status-tag`, con ícono y texto.\n- **1.4.3 Contraste mínimo (AA)**: títulos y valores `text-neutral-high` 16.29:1 (oscuro 16.53:1), etiquetas\n  `text-neutral-low` 5.01:1 (8.86:1) y textos `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y lo retiene en el panel; al cerrar (X,\n  Escape o clic en el fondo) lo devuelve al botón de historial.\n- **2.4.7 Foco visible (AA)**: la X no define estilo de foco: muestra el contorno por defecto del navegador.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: la señal `loading` no se pinta: mientras responde la API los\n  campos muestran «--» sin aviso visual ni `aria-live`.\n- **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que\n  se cierra con Escape y se puede recorrer con el puntero.\n- **Pendiente · 2.1.1 Teclado (A)**: esos valores no reciben foco, así que con teclado el globo no aparece (el lector\n  de pantalla sí lee el valor entero).",
    "figma": [],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "mt-siaf-lg",
          "px-siaf-lg",
          "py-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "gap-y-siaf-md",
          "mb-siaf-md",
          "px-siaf-md",
          "py-siaf-md",
          "top-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "gap-siaf-xl",
          "gap-x-siaf-xl",
          "mb-siaf-xl",
          "px-siaf-xl",
          "py-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "mt-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-l-siaf-md",
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-l-siaf-sm",
          "rounded-r-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-action-tracker",
      "siaf-icon",
      "siaf-pagination",
      "siaf-record-status-tag",
      "siaf-steps",
      "siaf-summary-card",
      "siaf-table-controls"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-action-tracker",
    "clase": "ActionTrackerComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/action-tracker/action-tracker.component",
    "archivo": "src/app/shared/ui/action-tracker/action-tracker.component.ts",
    "descripcion": "Trazabilidad de una solicitud: pestañas Detalle/Historial y tarjetas de quién hizo qué y cuándo.\n\nEs el componente canónico para mostrar el avance y los comentarios de un documento (lo usan 11\narchivos). No usar `siaf-steps` para esto: sus pasos no muestran responsables ni comentarios.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "activeTab",
        "tipo": "'detail' | 'history'",
        "porDefecto": "'detail'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "'Lorem ipsum dolor sit amet, consectetur adipiscing elit, s…",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "detailType",
        "tipo": "'default' | 'rejection-explanation' | 'rejection-reason' | 'evaluation-comment' | 'acceptance-comment' | 'observation-comment'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "historyRows",
        "tipo": "ActionTrackerHistoryRow[]",
        "porDefecto": "[ { iteration: '1', process: 'Aceptar Solicitud', reason: '…",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showSummaryCards",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showTabs",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "summaryItems",
        "tipo": "ActionTrackerSummary[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'default' | 'detail'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Al pie de las pantallas de solicitud, para quién elaboró, verificó y aprobó y cuándo (`[showSummaryCards]=\"true\"`\n  y `[showTabs]=\"false\"`): plan de cuentas, catálogo de ajustes, asiento de ajuste, apertura contable y\n  Contabilización.\n- Dentro de `siaf-account-history-panel` y `siaf-asiento-history-panel`, para cerrar el historial del registro con\n  sus responsables.\n- Con `summaryItems` reales: un `actionBy` o `date` vacío muestra «No asignado aún» o «Fecha y hora no registradas».",
    "evitar": "- Para comentarios e iteraciones con pestañas Detalle / Historial: usar `siaf-detail-history-tabs`; las pestañas de\n  este componente no cambian al pulsarlas y sus valores por defecto son de muestra.\n- Para pasos numerados de un flujo: usar `siaf-steps`; para hitos con fecha, `siaf-timeline`.\n- Para el historial de estados de un documento desde la bandeja: usar `siaf-document-history-panel`.",
    "teclado": "- Tal como lo usa la app (solo tarjetas de responsables) no recibe foco: no es interactivo.\n- **Tab** (con `showTabs` o `variant=\"detail\"`): enfoca los botones Detalle e Historial.\n- **Enter / Espacio**: no cambian de pestaña; la activa la fija el padre con `activeTab`.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: el historial es una `table` con `thead` y `th` bajo un `h3`; en las\n  tarjetas cada etiqueta precede a su valor en el orden de lectura.\n- **1.4.1 Uso del color (A)**: responsables, fechas y procesos van en texto; la pestaña activa además va en negrita\n  y subrayada.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: en las tarjetas, etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1)\n  y valores `text-neutral-high` 16.29:1 (16.53:1) cumplen; la pestaña activa usa la clase `text-brand-primary`\n  (color de fondo de marca), que en oscuro no llega a 4.5:1: da 2.66:1 sobre la superficie y la franja es\n  `surface-low`, más clara.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: las pestañas Detalle / Historial son `button` sin acción, sin\n  `role=\"tab\"` ni `aria-selected`: la activa solo se distingue a la vista.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "border-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "pt-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "px-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-b-siaf-md",
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-l-siaf-sm",
          "rounded-r-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-alert",
    "clase": "AlertComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/alert/alert.component",
    "archivo": "src/app/shared/ui/alert/alert.component.ts",
    "descripcion": "Mensaje de feedback en línea, con tono (neutral/info/éxito/advertencia/error), ícono y cierre opcional.\nEl título, el ícono y la × se apagan por separado (`title` vacío, `leadingIcon`, `showClose`); con varias líneas\nde texto, el ícono y la × quedan arriba, a la altura del título.\n\nUsarlo para avisos fijos dentro de una pantalla o formulario. Para confirmaciones de acciones de\nsolicitud (aprobar, observar, rechazar) el canónico es `siaf-request-approval-modals` con su snackbar.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "leadingIcon",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showClose",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "tone",
        "tipo": "'neutral' | 'info' | 'success' | 'warning' | 'error'",
        "porDefecto": "'neutral'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para validar un dato en línea mientras se llena el formulario: el código de la cuenta en la solicitud del\n  Plan de Cuentas (formato inválido, código ya registrado, validación exitosa).\n- Para explicar por qué algo no se puede editar: «No se puede modificar la vigencia» de una cuenta en uso.\n- Para errores de carga o de una acción que el usuario cierra con `showClose`: «No se pudo cargar el\n  documento» en Apertura contable, o «Sin conexión con el servidor» cuando se muestran datos de demostración.\n- Para un estado que exige atención en un detalle: «Solicitud fallida en el procesado automático» en\n  Contabilización.",
    "evitar": "- Para confirmar que una acción terminó (grabar, verificar, aprobar): usar `siaf-snackbar`, que en las\n  solicitudes ya emite `siaf-request-approval-modals`.\n- Para notas grises sin tono: usar `message-box`.\n- Para pedir una decisión antes de seguir: usar `siaf-modal`.\n- Para el estado de un documento o registro: usar `siaf-flow-status-tag` o `siaf-record-status-tag`.",
    "teclado": "- **Tab**: con `showClose`, enfoca la × del aviso; sin ella, el aviso no recibe foco.\n- **Enter / Espacio**: la × emite `closed` (botón nativo); quien retira el aviso es el padre.",
    "accesibilidad": "- **4.1.3 Mensajes de estado (AA)**: el contenedor es `role=\"alert\"` en todos los tonos: al insertarse se\n  anuncia de inmediato, también los neutrales, informativos y de éxito.\n- **1.1.1 Contenido no textual (A)**: el ícono del tono va con `aria-hidden`; el tipo de aviso tiene que quedar\n  dicho en `title` o `description`.\n- **1.4.1 Uso del color (A)**: cada tono cambia de color y de ícono, salvo neutral y éxito, que comparten\n  `check_circle`: entre esos dos solo el texto los distingue.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: `warning` en claro pone `text-feedback-warning` sobre\n  `bg-feedback-light-warning` con 4.43:1. Los demás cumplen (info 5.81:1, éxito 5.31:1, error 6.21:1,\n  neutral 11.46:1) y en oscuro todos superan 8:1.\n- **4.1.2 Nombre, función y valor (A)**: la × es un `<button>` con `aria-label=\"Cerrar alerta\"`.\n- **2.4.7 Foco visible (AA)**: la × muestra un contorno de 2 px del color del texto del tono (4.43:1 o más\n  sobre el fondo del aviso).\n- **2.5.8 Tamaño del objetivo (AA)**: la × mide 40 × 40 px.\n- **2.4.3 Orden del foco (A)**: al cerrar, el padre retira el aviso y el foco queda en el documento; conviene\n  llevarlo a un control cercano.",
    "figma": [
      {
        "nodo": "6989:873",
        "nombre": "Alerts"
      }
    ],
    "aria": {
      "roles": [
        "alert"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-feedback-light-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-annulment-modal",
    "clase": "AnnulmentModalComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/annulment-modal/annulment-modal.component",
    "archivo": "src/app/shared/ui/annulment-modal/annulment-modal.component.ts",
    "descripcion": "Modal de confirmación de una solicitud de anulación: detalle obligatorio y sustento .pdf antes de un paso que no se\npuede revertir. El detalle es `text-area-control` (obligatorio, hasta 1000 caracteres) y el sustento, `siaf-uploader`\ncompacto; «Aceptar» se habilita con los dos y emite `accepted` con el detalle y el archivo. Cada vez que se abre\nempieza vacío.\n\nHoy tiene 0 consumidores y se conserva a propósito: queda reservado para el flujo de anulación de\nRAA que los MFD contemplan (`tipoAccion: 'anulacion'` ya existe en el catálogo) y que aún no se\nconstruye. No borrarlo ni reutilizarlo como modal genérico.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "uploadDescription",
        "tipo": "string",
        "porDefecto": "'Adjunte el documento que respalda la solicitud.'",
        "requerida": false,
        "descripcion": "Explicación bajo el título: qué documento se adjunta."
      },
      {
        "nombre": "uploadTitle",
        "tipo": "string",
        "porDefecto": "'Sustento de la anulación'",
        "requerida": false,
        "descripcion": "Título de la sección del sustento."
      }
    ],
    "eventos": [
      {
        "nombre": "accepted",
        "tipo": "AnnulmentRequest",
        "descripcion": "Aceptar, con el detalle y el sustento cargado."
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": "X, Cancelar o Escape."
      }
    ],
    "usar": "- Reservado para la solicitud de anulación de un registro de asiento de ajuste (RAA) aprobado, cuando se construya\n  ese flujo: pide el detalle de anulación y el sustento antes de un paso que no se puede revertir.\n- `accepted` trae `{ detail, file }` para enviar la solicitud; `closed`, al cancelar, con la X o con Escape.\n- `uploadTitle` y `uploadDescription` para nombrar el sustento que pide cada caso.",
    "evitar": "- Como confirmación genérica: usar `siaf-modal` (presets o `custom`).\n- Para observar o rechazar con motivo: usar `siaf-request-approval-modals` o `siaf-modal` con `observe` / `reject`.\n- Para adjuntar el sustento de una solicitud que no es de anulación: usar `siaf-upload-side-nav`.",
    "teclado": "- **Tab / Shift + Tab**: al abrir, el foco entra en la X; recorren el detalle, «Elegir archivo», los botones de la\n  tarjeta del archivo y Cancelar / Aceptar, y dan la vuelta sin salir del diálogo.\n- **Escape**: cierra como la X (emite `closed`) y el foco vuelve al control que abrió el diálogo.\n- **Enter / Espacio**: en «Elegir archivo» abren el diálogo de archivos del sistema; la X y Cancelar emiten `closed`,\n  y Aceptar emite `accepted` cuando hay detalle y archivo.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"dialog\"` con `aria-modal=\"true\"`, `aria-labelledby` al título y\n  `aria-describedby` a la advertencia; la X se llama «Cerrar» (ícono con `label`).\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al control que\n  lo abrió; Tab no sale hacia la página de atrás.\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.\n- **3.3.2 Etiquetas o instrucciones (A)**: el detalle se ve siempre nombrado (dentro del campo o flotante) con\n  asterisco y `aria-required`, y el sustento tiene su título, su explicación y los formatos que admite. Aceptar\n  sigue deshabilitado hasta completar los dos.\n- **Pendiente · 1.3.1 Información y relaciones (A)**: de `text-area-control`: el contador «0/1000» va dentro del\n  `<label>` del detalle y se suma a su nombre.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: de `siaf-uploader`: ni el avance ni el rechazo de un archivo se\n  anuncian.\n- **2.4.7 Foco visible (AA)**: la X muestra el anillo `border-states-focus` de 2 px; el detalle pasa al borde azul\n  de 2 px y «Elegir archivo» pinta el contorno del kit.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del detalle vacío es `border-states-enabled` (2.44:1 en\n  claro, 2.59:1 en oscuro).\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` y textos `text-neutral-medium` sobre\n  `surface-highest`, que en claro es el blanco de la superficie (16.29:1 y 14.53:1).",
    "figma": [],
    "aria": {
      "roles": [
        "dialog",
        "presentation"
      ],
      "atributos": [
        "aria-describedby",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "pb-siaf-lg",
          "px-siaf-lg",
          "right-siaf-lg",
          "top-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-icon",
      "siaf-uploader",
      "text-area-control"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-app-shell",
    "clase": "AppShellComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/shell/app-shell.component",
    "archivo": "src/app/layout/shell/app-shell.component.ts",
    "descripcion": "Armazón de la app autenticada: navbar, sidebar y los paneles flotantes sobre los que vive el router-outlet.\n\nCentraliza qué panel está abierto (procesos, bandeja, ajustes, crear documento, navegación móvil) —\nson mutuamente excluyentes y todos se cierran en cada `NavigationEnd` — y sincroniza la sección activa\ncon la URL. Escucha a `ShellNavigationService` para que cualquier página pida abrir el menú de procesos\no el diálogo de creación. Las opciones de \"Crear documento\" se arman desde los tipos de documento del\nAPI y caen a una config estática si la llamada falla; el botón depende del permiso `document.create`.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [],
    "eventos": [],
    "usar": null,
    "evitar": null,
    "teclado": null,
    "accesibilidad": null,
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface-lowest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      }
    ],
    "usa": [
      "siaf-create-document",
      "siaf-mobile-navigation-menu",
      "siaf-navbar",
      "siaf-process-menu-tree",
      "siaf-sidebar",
      "siaf-tray-documents-view",
      "siaf-tray-menu",
      "siaf-tray-notifications-view"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-asiento-history-panel",
    "clase": "AsientoHistoryPanelComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/asiento-history-panel/asiento-history-panel.component",
    "archivo": "src/app/shared/components/asiento-history-panel/asiento-history-panel.component.ts",
    "descripcion": "Historial del registro para asientos de ajuste (SRAA) — pestaña Registros.\n\nMisma cáscara que `siaf-account-history-panel` (overlay + stepper +\ndocumento + secciones + sustento + tracker) pero con la estructura del\nasiento: ámbito, período, fecha de contabilización, clase/detalle, glosa\ny la grilla de cuentas contables con totales Debe/Haber. Todo sale del\ndocumento ya grabado (`obtenerDetalle`); las fechas del período se\nresuelven contra la configuración de Apertura Contable.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "record",
        "tipo": "DocumentsRecordsRow | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para ver desde la bandeja de asientos de ajuste (pestaña Registros, `recordHistoryKind: 'asiento'`) cómo quedó un\n  asiento y quién elaboró, verificó y aprobó su solicitud.\n- Para revisar en solo lectura ámbito, período, glosa y cuentas con sus totales Debe y Haber, buscando y paginando\n  cuando el asiento tiene muchas cuentas.",
    "evitar": "- Para registros del plan de cuentas: usar `siaf-account-history-panel`; para el historial de estados de un\n  documento, `siaf-document-history-panel`.\n- Dentro de la solicitud abierta: usar la pantalla del asiento con `siaf-detail-history-tabs` y\n  `siaf-action-tracker`.\n- Para revertir o modificar el asiento: el panel es de solo lectura; el cambio va por una solicitud.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X; recorre «Código de asiento», el buscador y la paginación, y da la vuelta\n  sin salir del panel.\n- **Enter / Espacio** en la X: cierran el panel (emite `closed`).\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón de historial.\n- **Enter / Espacio** en «Código de asiento»: pliegan o despliegan las cuentas contables.\n- **Enter** en el buscador: aplica el filtro. El buscador sigue `siaf-input` y la paginación `siaf-pagination`.",
    "accesibilidad": "- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el panel es `role=\"dialog\"` con `aria-modal` y nombre desde su\n  título, y la X se llama «Cerrar historial del asiento de ajuste»; pero «Código de asiento» no publica\n  `aria-expanded` ni `aria-controls`: su estado solo se ve en la flecha.\n- **1.3.1 Información y relaciones (A)**: títulos `h2` y `h3` por sección y cuentas en una `table` con `thead` y\n  `th`; los totales Debe y Haber van en filas con su rótulo.\n- **1.4.1 Uso del color (A)**: el tipo de movimiento va en texto, el estado del registro en\n  `siaf-record-status-tag` con ícono, y los obligatorios llevan asterisco.\n- **1.4.3 Contraste mínimo (AA)**: valores `text-neutral-high` 16.29:1 (oscuro 16.53:1), etiquetas\n  `text-neutral-low` 5.01:1 (8.86:1) y asterisco `text-feedback-danger` 9.84:1 (10.59:1) sobre la superficie.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y lo retiene en el panel; al cerrar (X,\n  Escape o clic en el fondo) lo devuelve al botón de historial.\n- **2.4.7 Foco visible (AA)**: la X y «Código de asiento» no definen estilo de foco: muestran el contorno por\n  defecto del navegador.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: ni la carga del detalle ni el resultado del buscador se anuncian;\n  mientras responde la API los campos muestran «--».\n- **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que\n  se cierra con Escape y se puede recorrer con el puntero.\n- **Pendiente · 2.1.1 Teclado (A)**: esos valores no reciben foco, así que con teclado el globo no aparece (el lector\n  de pantalla sí lee el valor entero).",
    "figma": [],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "mt-siaf-lg",
          "px-siaf-lg",
          "py-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "mb-siaf-md",
          "pb-siaf-md",
          "px-siaf-md",
          "py-siaf-md",
          "top-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "gap-siaf-xl",
          "mb-siaf-xl",
          "px-siaf-xl",
          "py-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "mt-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-l-siaf-md",
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-l-siaf-sm",
          "rounded-r-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-action-tracker",
      "siaf-icon",
      "siaf-input",
      "siaf-pagination",
      "siaf-record-status-tag",
      "siaf-steps"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-badge",
    "clase": "BadgeComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/badge/badge.component",
    "archivo": "src/app/shared/ui/badge/badge.component.ts",
    "descripcion": "Badge de notificación (Figma UI KIT, nodo 7262:6493 «Badges»): indica una notificación o el número de\nelementos de un destino. Va en el borde final de un ícono o al final de un ítem de lista.\n\nSin `label` es un **punto** (12 px, o 8 px en `small`); con `label` es un **contador** en píldora\n(20 px de alto, o 16 px en `small`) que crece con el texto. `color`: `accent` (rojo, por defecto) o\n`primary` (azul). Con `max`, un número mayor se muestra como «99+». Un punto es decorativo salvo que\nlleve `ariaLabel`; al contador conviene darle uno que diga qué cuenta («3 notificaciones sin leer»).\n\nPara el estado de un documento o registro van `siaf-flow-status-tag` / `siaf-record-status-tag`; para otra\netiqueta con color, `siaf-status-tag`, y para valores que se eligen, filtran o quitan, `siaf-tag`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre accesible: qué indica el badge."
      },
      {
        "nombre": "color",
        "tipo": "'accent' | 'primary'",
        "porDefecto": "'accent'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string | number | null | undefined",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Texto o número del contador. Vacío o `null`: punto."
      },
      {
        "nombre": "max",
        "tipo": "number | null | undefined",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Tope para contadores numéricos: por encima se muestra `max+`."
      },
      {
        "nombre": "minWidth",
        "tipo": "number | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Ancho mínimo del contador en px (ej. 32 al final de un ítem de lista, como en el Figma)."
      },
      {
        "nombre": "size",
        "tipo": "'standard' | 'small'",
        "porDefecto": "'standard'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para el número de pendientes de un destino: cada opción de la Bandeja (`siaf-tray-menu`) y las pestañas con\n  conteo de `siaf-tabs`.\n- Sobre la campana del navbar, con `size=\"small\"` y `max` 99, para las notificaciones sin leer.\n- Al final de un ítem de `siaf-list`, con `minWidth` 32 como en el Figma.\n- Como punto, sin `label`, para avisar que hay novedades cuando el número no importa.",
    "evitar": "- Para el estado de un documento o registro: usar `siaf-flow-status-tag` o `siaf-record-status-tag`; para otro estado,\n  `siaf-status-tag`.\n- Para etiquetas con texto o categorías con color: usar `siaf-status-tag`; para filtros aplicados u opciones que se\n  eligen: `siaf-tag`.\n- Para distinguir tipos de aviso solo por el color (`accent` rojo frente a `primary` azul).\n- Suelto y sin `ariaLabel`: si el número ya está en el nombre del control, ocultarlo con `aria-hidden` (como\n  en el navbar); si no, darle `ariaLabel`.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.1.1 Contenido no textual (A)**: sin `ariaLabel`, el punto lleva `aria-hidden` y el contador se lee como un\n  número suelto; con `ariaLabel`, recibe ese nombre. El padre debe darlo cuando el número no está ya en el\n  control que lo contiene.\n- **4.1.3 Mensajes de estado (AA)**: con `ariaLabel` es `role=\"status\"`, así que los cambios del contador se\n  anuncian de forma educada; sin él, no se anuncian.\n- **1.4.1 Uso del color (A)**: `accent` y `primary` solo cambian el color; el punto informa por su presencia y\n  el contador por su número.\n- **1.4.3 Contraste mínimo (AA)**: texto blanco sobre `bg-brand-accent` 4.89:1 (5.65:1 en oscuro) y sobre\n  `bg-brand-primary` 8.79:1 (6.67:1).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el punto `primary` (`bg-brand-primary`) queda en\n  2.66:1 sobre la superficie; el `accent` cumple (4.89:1 en claro, 3.14:1 en oscuro).",
    "figma": [
      {
        "nodo": "7262:6493",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "status"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "px-siaf-xxs"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-bar-chart",
    "clase": "BarChartComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/bar-chart/bar-chart.component",
    "archivo": "src/app/shared/ui/bar-chart/bar-chart.component.ts",
    "descripcion": "Gráfico de barras del kit (Figma UI KIT, página «Graphics»: «Bar», «Bar grouped», «Comparative bars» y «Stacked\nbar»), dibujado con Chart.js. Con una serie son barras simples; con dos o más, agrupadas por categoría; y con una sola\ncategoría (o ninguna), el comparativo: las series lado a lado, sin etiqueta de categoría y con un tooltip por barra.\n`orientation=\"horizontal\"`\npone las categorías a la izquierda. Con `stacked` las series se apilan en cada categoría, con 2 px de aire entre\ntramos y el porcentaje de cada tramo adentro cuando entra; con una sola categoría es la barra 100 % del Figma: una\nbarra horizontal que llena el ancho, sin ejes, con el nombre de cada tramo debajo. Los colores salen de la paleta del\nkit (`TOKENS_SERIES`) y se vuelven a leer al cambiar de tema; la leyenda y el tooltip son `siaf-chart-legend` y\n`siaf-chart-tooltip`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Gráfico de barras'",
        "requerida": false,
        "descripcion": "Nombre accesible del gráfico y título de su tabla de datos."
      },
      {
        "nombre": "categories",
        "tipo": "readonly string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Etiquetas de las categorías (meses, estados). Con una sola, o ninguna, es el comparativo o la barra 100 %."
      },
      {
        "nombre": "categoryLabel",
        "tipo": "string",
        "porDefecto": "'Categoría'",
        "requerida": false,
        "descripcion": "Encabezado de la columna de categorías en la tabla de datos."
      },
      {
        "nombre": "height",
        "tipo": "number",
        "porDefecto": "252",
        "requerida": false,
        "descripcion": "Alto del área del gráfico en px (sin la leyenda)."
      },
      {
        "nombre": "max",
        "tipo": "number | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Máximo del eje de valores; sin él, Chart.js elige uno redondo por encima del mayor valor."
      },
      {
        "nombre": "orientation",
        "tipo": "'vertical' | 'horizontal'",
        "porDefecto": "'vertical'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "series",
        "tipo": "readonly ChartSeries[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "stacked",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Apila las series de cada categoría. Con una sola categoría es la barra 100 % del Figma («Stacked bar»): horizontal, sin ejes, con el porcentaje de cada tramo adentro y su nombre debajo."
      },
      {
        "nombre": "valueSuffix",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Sufijo de los valores en el eje, el tooltip y la tabla (por ejemplo `%`)."
      }
    ],
    "eventos": [],
    "usar": "- Para comparar cantidades entre categorías o meses (recaudación, documentos por estado), con pocas series.\n- Dentro de `siaf-chart-section`, que le pone título y descripción.\n- `valueSuffix=\"%\"` cuando los valores son porcentajes, y `ariaLabel` con lo que muestra el gráfico.\n- `stacked` para las partes de un total en cada categoría y, con una sola categoría, para la composición de un total\n  en una barra (activos y patrimonio).",
    "evitar": "- Para la evolución de un valor a lo largo del tiempo: usar `siaf-line-chart`.\n- Para variaciones que suben y bajan respecto de cero: usar `siaf-diverging-chart`.\n- Para las partes de un total en un anillo, con el porcentaje de cada parte al centro: usar `siaf-donut-chart`.\n- Con más de cuatro series: la paleta da la vuelta y los colores se repiten.\n- Para un solo número destacado: usar `siaf-kpi-card`.",
    "teclado": "- **Tab**: enfoca el gráfico (una sola parada).\n- **Flecha derecha / izquierda** (vertical) o **abajo / arriba** (horizontal): recorren las categorías y muestran el\n  tooltip con el valor de cada serie; dan la vuelta.\n- En el comparativo, las flechas pasan de una barra a la siguiente y el tooltip muestra solo su valor.\n- **Inicio / Fin**: van a la primera o a la última categoría.\n- **Escape**: oculta el tooltip; salir del gráfico también lo oculta.",
    "accesibilidad": "- **1.1.1 Contenido no textual (A)**: el lienzo es `role=\"img\"` con `ariaLabel` y, además, hay una tabla de datos\n  oculta (`sr-only`) con una fila por categoría y una columna por serie.\n- **1.3.1 Información y relaciones (A)**: la tabla usa `caption`, `th scope=\"col\"` para las series y\n  `th scope=\"row\"` para las categorías.\n- **2.1.1 Teclado (A)**: los valores se recorren con las flechas; al moverse, una región `aria-live` anuncia la\n  categoría y los valores.\n- **2.4.7 Foco visible (AA)**: el lienzo enfocado muestra el contorno de 2 px `border-states-focus`.\n- **1.4.1 Uso del color (A)**: las series se distinguen por color, pero sus nombres están en la leyenda, en el\n  tooltip y en la tabla de datos.\n- **1.4.3 Contraste mínimo (AA)**: el porcentaje dentro de un tramo apilado toma, entre blanco, `text-neutral-high` y la\n  superficie, el de más contraste con su color (4.71:1 como mínimo, en claro y en oscuro); lo dibujado en el lienzo\n  está también en la tabla de datos.\n- **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el tooltip sin mover el puntero ni el foco.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro las barras de las series 1 y 2 (`bg-brand-primary`,\n  2.66:1, y `bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie y la 2 y la 3 quedan del mismo tono;\n  la paleta oscura de los gráficos está por definir con diseño.",
    "figma": [
      {
        "nodo": "22743:375",
        "nombre": "Bar"
      },
      {
        "nodo": "22743:507",
        "nombre": "Bar grouped"
      },
      {
        "nodo": "22743:622",
        "nombre": "Comparative bars"
      },
      {
        "nodo": "22743:356",
        "nombre": "Stacked bar"
      }
    ],
    "aria": {
      "roles": [
        "img"
      ],
      "atributos": [
        "aria-label",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "pt-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-chart-legend",
      "siaf-chart-tooltip"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-breadcrumb",
    "clase": "BreadcrumbComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/breadcrumb/breadcrumb.component",
    "archivo": "src/app/shared/components/breadcrumb/breadcrumb.component.ts",
    "descripcion": "Ruta de navegación (migas de pan) de la página: enlace de inicio con ícono de casa y los niveles hasta la pantalla\nactual, en un `<nav>` con lista ordenada. Con rutas largas colapsa los niveles intermedios detrás del botón «…»: en\nescritorio, con más de tres niveles, quedan visibles los dos últimos; en móvil, solo el último. Si el primer ítem se\nllama «Inicio», la casa usa su ruta en vez de `homeHref`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "homeHref",
        "tipo": "string",
        "porDefecto": "'#'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "items",
        "tipo": "BreadcrumbItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Arriba de toda pantalla del shell, sobre el título. Ya lo traen `siaf-documents-records-page` (bandejas),\n  `siaf-solicitude-page-layout` (solicitudes) y `siaf-page-shell`; las listas de Admin (Gestor de Usuarios,\n  Entidades, Perfiles funcionales) y la configuración de Apertura contable lo usan directo.\n- Con los niveles armados por `buildProcessBreadcrumbs` (`shared/utils/breadcrumbs.util.ts`), que los toma del árbol\n  de procesos y avisa en desarrollo si el proceso no existe.\n- En las páginas públicas del landing (noticia, servicio, sistema), con `homeHref=\"/landing\"`.",
    "evitar": "- En páginas que ya usan `siaf-documents-records-page`, `siaf-solicitude-page-layout` o `siaf-page-shell`: no agregar\n  otro.\n- Escribir los niveles a mano repitiendo el árbol del menú: usar `buildProcessBreadcrumbs`.\n- Para alternar vistas de la misma pantalla: usar `siaf-tabs` o `siaf-records-tabs`; para las etapas de un flujo,\n  `siaf-steps` o `siaf-action-tracker`.",
    "teclado": "- **Tab**: recorre el enlace de inicio, el botón «…» (si hay niveles ocultos) y los niveles con enlace; el nivel\n  actual es texto y no recibe foco.\n- **Enter**: sigue el enlace enfocado.\n- **Enter / Espacio** en «…»: abre o cierra la lista de niveles intermedios; al abrirla, el foco pasa al primer\n  nivel con enlace.\n- **Escape**: con la lista abierta, la cierra y el foco vuelve a «…». Salir de la lista con Tab o pulsar fuera\n  también la cierra.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: `<nav aria-label=\"Ruta de navegación\">` con lista ordenada (`<ol>` y\n  `<li>`); las flechas separadoras son íconos decorativos y el enlace de inicio lleva `aria-label=\"Inicio\"`.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: «…» es un `<button>` con `aria-label=\"Niveles intermedios\"`,\n  `aria-expanded` y `aria-controls` hacia una lista (`<ul>`) de enlaces, el patrón de revelación de una navegación;\n  falta que el nivel actual marque `aria-current=\"page\"`.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir la lista el foco entra en el primer nivel con enlace y al\n  cerrarla con Escape vuelve a «…»; salir de la lista con Tab la cierra.\n- **Pendiente · 2.1.1 Teclado (A)**: enlaces y «…» se alcanzan con Tab, pero el nivel actual y los niveles sin enlace\n  no reciben foco: si su texto se corta, el completo (`siafTooltip`) solo aparece con el mouse.\n- **2.4.7 Foco visible (AA)**: inicio y «…» tienen contorno de 2 px con separación (`border-states-focus`); los\n  enlaces de texto usan el anillo del navegador.\n- **1.4.11 Contraste no textual (AA)**: el contorno de foco de inicio y «…» es el azul del kit\n  (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro sobre la superficie).\n- **1.4.3 Contraste mínimo (AA)**: niveles con enlace `text-text` (16.29:1 claro / 16.53:1 oscuro) y nivel actual\n  `text-text-muted` (5.01:1 / 8.86:1) sobre `bg-surface`.\n- **2.5.8 Tamaño del objetivo (AA)**: inicio y «…» miden 32×32 px; los enlaces de texto son bajos (texto de 12 px),\n  pero la flecha y los espacios los separan unos 20 px (excepción por espaciado).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-controls",
        "aria-expanded",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-button",
    "clase": "ButtonComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/button/button.component",
    "archivo": "src/app/shared/ui/button/button.component.ts",
    "descripcion": "Botón base del design system (Figma UI KIT, nodo 8305:2071 «Buttons»).\n\n- `variant`: `filled` (rojo acento), `outline` (borde gris) o `text` (sin borde). Siguen valiendo los\n  nombres de siempre: `accent` / `primary` = filled, `secondary` = outline, `ghost` = text.\n- `size`: `md` (Default, 40 px) o `sm` (Small, 32 px); en ambos, texto de 14 px e íconos de 24.\n- Estados del Figma con una capa sobre el fondo: hover (capa + elevación 2; outline con borde azul),\n  foco con teclado (borde azul + capa + elevación 2), presionado (capa + elevación 8) y deshabilitado\n  (fondo blanco con capa gris y texto gris; en modo oscuro, la superficie deshabilitada del tema con su borde).\n- Ícono opcional al inicio, al final o solo ícono (`iconOnly`, que exige `ariaLabel` en español), y `loading`.\n- Botón de ícono (Figma «Icon buttons», nodo 8307:5607): 40 / 32 px; `standard` es el nombre del Figma para\n  `text`. En outline y standard el ícono va en gris; en Small mide 20 px (24 en filled). `[activated]` lo deja\n  presionado como interruptor (`aria-pressed`): filled con capa y elevación 1; outline y standard con capa\n  azul, ícono azul y, en outline, borde azul.\n\nEs el botón canónico de la app: usarlo siempre en vez de un `<button>` con clases sueltas.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "activated",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Botón de ícono presionado (interruptor): estado «Activated» del Figma."
      },
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "iconOnly",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "iconPosition",
        "tipo": "'start' | 'end'",
        "porDefecto": "'start'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "loading",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "size",
        "tipo": "'sm' | 'md'",
        "porDefecto": "'md'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "type",
        "tipo": "'button' | 'submit' | 'reset'",
        "porDefecto": "'button'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'accent' | 'primary' | 'standard' | 'filled' | 'outline' | 'text' | 'secondary' | 'ghost'",
        "porDefecto": "'filled'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- `filled` para la acción principal de la vista (una sola por bloque): Grabar, Aprobar, Crear documento.\n- `outline` para acciones secundarias junto a la principal (Cancelar, Editar) y `text` para las de menor peso.\n- Botón de ícono (`iconOnly`) en barras de herramientas y filas de tabla, siempre con `ariaLabel`.\n- `sm` (32 px) dentro de tablas, tarjetas compactas y barras densas; `md` (40 px) en el resto.",
    "evitar": "- Para navegar a otra pantalla: usar un enlace (`routerLink`); el botón ejecuta acciones.\n- Varios `filled` en el mismo bloque: compiten entre sí; dejar uno y bajar el resto a `outline` o `text`.\n- Para acciones destructivas no hay variante `danger`: usar `filled` y confirmar con un modal.\n- Para abrir un menú de opciones: usar `siaf-icon-dropdown-menu`.",
    "teclado": "- **Tab**: enfoca el botón; el foco con teclado muestra el borde azul y la capa de estado.\n- **Enter / Espacio**: ejecutan la acción. Deshabilitado o en `loading`, no recibe el foco.",
    "accesibilidad": "- **1.1.1 Contenido no textual (A)**: el ícono (`siaf-icon`) y el indicador de `loading` llevan `aria-hidden`; el\n  nombre sale del texto proyectado o de `ariaLabel`.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: es un `<button>` nativo con `type=\"button\"` por defecto (en\n  formularios, `type=\"submit\"` explícito) y `disabled` nativo; `iconOnly` necesita `ariaLabel` en español (sin él,\n  el lector leería el nombre del ícono, p. ej. «file_upload») y `loading` publica `aria-busy`. Falta el estado\n  apagado del interruptor: `activated` pone `aria-pressed=\"true\"`, pero al desactivarse quita el atributo en vez de\n  dejar `false`.\n- **2.4.7 Foco visible (AA)**: `outline-none` se reemplaza en `:focus-visible` por el borde `border-states-focus`\n  (5.35:1 claro / 10.15:1 oscuro), la capa de foco y la elevación 2.\n- **1.4.3 Contraste mínimo (AA)**: `filled` pinta `text-brand-white` sobre `bg-brand-accent` (4.89:1 claro / 5.65:1\n  oscuro); `outline` y `text`, `text-neutral-medium` sobre la superficie (14.53:1 / 12.87:1). El deshabilitado está\n  exento.\n- **1.4.11 Contraste no textual (AA)**: relleno de `filled` (`bg-brand-accent`, 4.89:1 / 3.14:1) e ícono gris de\n  `iconOnly` en outline y standard (`icon-states-enabled`, 8.70:1 / 12.87:1) sobre la superficie. El borde gris de\n  `outline` (`border-states-enabled`, 2.44:1 / 2.59:1) no llega a 3:1, pero al botón lo identifican su texto o su\n  ícono.\n- **Pendiente · 1.4.1 Uso del color (A)**: en `outline` y `standard`, `activated` solo cambia colores (capa, ícono\n  y, en outline, borde azules; en oscuro ese borde, `border-states-active`, queda en 2.02:1). En `filled` lo\n  distingue además la elevación 1.\n- **2.5.8 Tamaño del objetivo (AA)**: `md` mide 40 px de alto y `sm` 32 px; el botón de ícono, 40×40 o 32×32.\n- **4.1.3 Mensajes de estado (AA)**: `loading` solo deshabilita el botón y publica `aria-busy`; el resultado lo debe\n  anunciar el padre (por ejemplo, con `siaf-snackbar`).",
    "figma": [
      {
        "nodo": "8305:2071",
        "nombre": "Buttons"
      },
      {
        "nodo": "8307:5607",
        "nombre": "Icon buttons"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-busy",
        "aria-hidden",
        "aria-label",
        "aria-pressed"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "p-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "p-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-shadow-elevation-2",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-shadow-elevation-8",
        "via": [
          "var()"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-buttons-group",
    "clase": "ButtonsGroupComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/buttons-group/buttons-group.component",
    "archivo": "src/app/shared/ui/buttons-group/buttons-group.component.ts",
    "descripcion": "Grupo de botones segmentado y unido, con una sola opción activa a la vez.\n\nUsarlo para alternar entre pocas vistas o modos excluyentes. Para elegir un valor dentro de un\nformulario van `siaf-radio-group` (con `[inline]` para Si/No) o un select, no este control.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre del grupo para el lector de pantalla («Vista del resultado»)."
      },
      {
        "nombre": "iconOnly",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Las opciones con `icon` muestran solo el ícono; su etiqueta nombra el botón y aparece en el tooltip."
      },
      {
        "nombre": "items",
        "tipo": "ButtonGroupItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "valueChange",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Para alternar sub-vistas excluyentes de una misma sección, como «Tipo de asiento de ajuste» y «Clases de ajustes y\n  Detalles de ajustes» en la pestaña Registros de la bandeja del catálogo de ajuste.\n- Para filtros o modos rápidos de pocas opciones cortas que se aplican al instante, como «Todos | Igual en oscuro |\n  Fuera de Figma» en los colores y la variante y el tamaño de los íconos, en los fundamentos del `/ui-kit`.\n- Con `icon` en cada opción e `iconOnly` para un selector de vista compacto, como «Vista de datos | Vista de\n  gráficas» del resultado de `siaf-query-report-page` (Guía de Estructura de Pantallas, nodo 22715:21316): la\n  etiqueta nombra el botón y aparece en el tooltip.",
    "evitar": "- Para elegir un valor dentro de un formulario: usar `siaf-radio-group` (con `[inline]` para Si/No) o\n  `siaf-select-options`.\n- Para las vistas principales de una pantalla (Documentos / Registros, Detalle / Historial): usar `siaf-records-tabs`\n  o `siaf-tabs`.\n- Para acciones independientes (Grabar, Cancelar): usar `siaf-button` sueltos.\n- Con muchas opciones o textos largos: usar `siaf-filter-pill` o `siaf-select-options`.",
    "teclado": "- **Tab**: pasa por cada opción del grupo (todas entran en el orden de tabulación; no hay navegación con flechas).\n- **Enter / Espacio**: eligen la opción enfocada y emiten `valueChange`.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: cada opción es un `<button>` nativo con `aria-pressed` según esté elegida,\n  dentro de un `role=\"group\"` nombrado con `ariaLabel`; con `iconOnly`, el botón se llama como su etiqueta.\n- **1.1.1 Contenido no textual (A)**: con `iconOnly` el ícono es decorativo y la etiqueta va en `aria-label` y en el\n  tooltip.\n- **2.1.1 Teclado (A)**: Tab llega a cada opción y Enter o Espacio la eligen.\n- **2.4.7 Foco visible (AA)**: contorno de 2 px con separación de 2 px (`focus-visible:outline`).\n- **1.4.3 Contraste mínimo (AA)**: inactivas `text-neutral-medium` (en claro su fondo `bg-states-light-enabled` es\n  transparente: 14.53:1 sobre la superficie); activa `text-neutral-activated` sobre la capa azul\n  `bg-states-light-activated`.\n- **1.4.1 Uso del color (A)**: la activa además va en negrita (`font-bold`); con `iconOnly` no hay texto que marcar y\n  la distinguen el borde y la capa azul, además de `aria-pressed`.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el contorno de foco usa `border-states-active`: 8.79:1 en claro,\n  pero 2.02:1 en oscuro.\n- **2.5.8 Tamaño del objetivo (AA)**: cada opción mide al menos 40 px de alto.",
    "figma": [],
    "aria": {
      "roles": [
        "group"
      ],
      "atributos": [
        "aria-label",
        "aria-pressed"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-dark-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-l-siaf-md",
          "rounded-r-siaf-md",
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-card",
    "clase": "CardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/card/card.component",
    "archivo": "src/app/shared/ui/card/card.component.ts",
    "descripcion": "Contenedor con borde, cabecera opcional (título y descripción) y cuerpo proyectado.\n\nUsarlo para agrupar contenido genérico de una pantalla. Para mostrar el ítem elegido desde un side\npanel el canónico es `siaf-summary-card`, y para el estado vacío, `empty-section`.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para agrupar contenido libre con un título y una descripción corta fuera de las solicitudes: un bloque\n  informativo de un tablero, de una consulta o de una pantalla de Admin.\n- Cuando el bloque necesita su propio encabezado (`h2`) y el cuerpo lo arma el padre.\n- Hoy no tiene consumidores en la app: revisar antes si una tarjeta específica del kit ya lo resuelve.",
    "evitar": "- En las pantallas de solicitud: usar `siaf-solicitude-form-card` (título en mayúsculas, `card-actions` y `loading`).\n- Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`; para el estado vacío, `empty-section`.\n- Para el N° y el estado del documento abierto: usar `siaf-document-summary-card`.\n- Anidar una `siaf-card` dentro de otra: se duplican borde y sombra; separar con encabezados.",
    "teclado": "- No recibe foco: no es interactivo; lo que se proyecta en el cuerpo sigue el teclado de su componente.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: el título es un `h2` y la descripción un párrafo dentro de un `section`;\n  el padre debe ubicar la tarjeta donde un `h2` respete la jerarquía de encabezados.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` 16.29:1 (oscuro 16.53:1) y descripción\n  `text-neutral-low` 5.01:1 (8.86:1) sobre la superficie.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-radius-lg",
        "via": [
          "rounded-siaf-lg"
        ]
      },
      {
        "token": "--sys-shadow-sm",
        "via": [
          "shadow-siaf-sm"
        ]
      }
    ],
    "usa": [],
    "sinUso": true
  },
  {
    "selector": "siaf-cascading-menu",
    "clase": "CascadingMenuComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/cascading-menu/cascading-menu.component",
    "archivo": "src/app/shared/ui/cascading-menu/cascading-menu.component.ts",
    "descripcion": "Menú de dos niveles anclado a un disparador: una lista de categorías y, al elegir una, sus opciones al\ncostado.\n\nEs `siaf-menu` con submenú, con el diseño del UI KIT: el aspecto, el teclado (↑ ↓ → ← Escape) y el lado\ndel submenú (derecha, izquierda o debajo según el espacio) salen de ahí, así que un cambio de diseño se\nhace en `siaf-menu`. Este componente solo agrega el disparador proyectado, `open` controlado por el padre,\nel cierre al pulsar fuera y la selección con su categoría (`CascadingMenuSelection`).",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "groups",
        "tipo": "CascadingMenuGroup[]",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "selected",
        "tipo": "CascadingMenuSelection",
        "descripcion": null
      }
    ],
    "usar": "- Botón «+» que agrega un ítem eligiendo primero una categoría y después su tipo: en la solicitud del catálogo de\n  eventos, la clase de evento y luego la etapa.\n- Opciones agrupadas en pocas categorías con listas cortas, cuando juntarlas en un solo menú lo haría largo.\n- Cuando el padre necesita la categoría y la opción juntas: `selected` emite ambas (`CascadingMenuSelection`).",
    "evitar": "- Con un solo nivel de opciones: usar `siaf-icon-dropdown-menu`, que además lleva el foco al menú y marca\n  `aria-expanded` en su botón.\n- Para catálogos largos o con más de dos niveles: usar un panel lateral de selección (`siaf-selection-side-nav`) o\n  `siaf-tree-view`.\n- Para elegir un valor de formulario: usar `siaf-select-options`.\n- Rehacer a mano el submenú o su teclado: salen de `siaf-menu`.",
    "teclado": "- **Escape**: cierra todo el menú, también desde el submenú (se escucha en `document`), y emite `closed`.\n- **Flecha arriba / abajo** e **Inicio / Fin**: recorren las categorías o las opciones del submenú.\n- **Flecha derecha**, **Enter** o **Espacio** sobre una categoría: abren sus opciones al costado y enfocan la\n  primera.\n- **Flecha izquierda**: cierra el submenú y devuelve el foco a la categoría.\n- **Enter / Espacio** sobre una opción: la eligen, emiten `selected` y cierran el menú.\n- **Tab**: al abrir, el foco entra en la primera categoría; salir del menú con Tab lo cierra.\n- El disparador proyectado sigue el teclado de su propio componente (normalmente `siaf-button`).",
    "accesibilidad": "- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el panel es `siaf-menu` (`role=\"menu\"`; las categorías con\n  `aria-haspopup` y `aria-expanded`), pero el disparador proyectado no recibe `aria-haspopup` ni `aria-expanded`\n  (`siaf-button` no los expone). Además el padre debe dar `ariaLabel` al menú: por defecto va vacío y la solicitud\n  del catálogo de eventos no lo pasa.\n- **2.1.1 Teclado (A)**: abrir categorías, elegir y cerrar se hace con teclado; Escape se escucha en `document` y Tab\n  sale del menú sin trampa.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en la primera categoría y al cerrar (Escape,\n  elegir o salir con Tab) vuelve al disparador. La capa que cierra al pulsar fuera no es parada de Tab.\n- **2.4.7 Foco visible (AA)**: heredado de `siaf-menu`: la opción enfocada lleva un contorno interior azul de 2 px\n  (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro).\n- **2.5.8 Tamaño del objetivo (AA)**: categorías y opciones de 48 px de alto (`siaf-menu` en densidad `standard`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden"
      ]
    },
    "tokens": [],
    "usa": [
      "[siafFoco]",
      "siaf-menu"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-chart-legend",
    "clase": "ChartLegendComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/chart-legend/chart-legend.component",
    "archivo": "src/app/shared/ui/chart-legend/chart-legend.component.ts",
    "descripcion": "Leyenda de los gráficos del kit (Figma UI KIT, página «Graphics», «Leyenda»): un punto de 15 px con el color de\ncada serie y su nombre, alineados a la derecha sobre el gráfico.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "items",
        "tipo": "readonly ChartLegendItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Dentro de los gráficos del kit: `siaf-bar-chart` y `siaf-line-chart` la arman solos con los nombres de sus\n  series; `siaf-diverging-chart`, con los de sus dos lados, y `siaf-donut-chart`, con los de sus partes.\n- En un gráfico propio que use la paleta del kit (`TOKENS_SERIES`), para que colores y nombres coincidan.",
    "evitar": "- Como única forma de leer los datos: el gráfico debe traer además su tooltip y su tabla de datos.\n- Para filtros o selección de series: no es interactiva.",
    "teclado": "- No recibe foco: no es interactiva.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es una lista (`ul` y `li`); el punto de color va con `aria-hidden` y el\n  nombre de la serie queda en texto.\n- **1.4.1 Uso del color (A)**: el color solo relaciona la leyenda con las barras; los valores de cada serie también\n  están en el tooltip y en la tabla de datos del gráfico.\n- **1.4.3 Contraste mínimo (AA)**: nombres en `text-neutral-medium` sobre la superficie (14.53:1 claro / 12.87:1\n  oscuro).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro los puntos de las series 1 y 2 (`bg-brand-primary`,\n  2.66:1, y `bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie y la 2 y la 3 quedan del mismo tono;\n  la paleta oscura de los gráficos está por definir con diseño.",
    "figma": [
      {
        "nodo": "22743:508",
        "nombre": "Leyenda"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-x-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "gap-y-siaf-xs"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-chart-section",
    "clase": "ChartSectionComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/chart-section/chart-section.component",
    "archivo": "src/app/shared/ui/chart-section/chart-section.component.ts",
    "descripcion": "Sección de gráfico (Figma UI KIT, nodo 22743:668 «Section-graph»): tarjeta con título, descripción opcional y el\ngráfico proyectado debajo. Es la pieza que se usa en pantalla; los gráficos del kit (`siaf-bar-chart`,\n`siaf-line-chart`, `siaf-diverging-chart` y `siaf-donut-chart`) van adentro.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Línea bajo el título que explica qué mide el gráfico; vacía, no se muestra."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para presentar un gráfico con su título y una línea que explique qué mide, por ejemplo «Evolución comparada» y\n  «Crecimiento acumulado de recaudación».\n- Con un gráfico del kit proyectado: `<siaf-chart-section title=\"…\"><siaf-bar-chart … /></siaf-chart-section>`.",
    "evitar": "- Para un número destacado sin gráfico: usar `siaf-kpi-card`.\n- Para tarjetas de datos o formularios: usar `siaf-card` o `siaf-solicitude-form-card`.",
    "teclado": "- No recibe foco: el gráfico proyectado sigue su propio teclado.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es un `section` con el título como `h3` y `aria-labelledby`, así la\n  sección y su gráfico quedan nombrados.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-medium` (14.53:1 claro / 12.87:1 oscuro) y descripción\n  `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie.",
    "figma": [
      {
        "nodo": "22743:668",
        "nombre": "Section-graph"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-labelledby"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "p-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-chart-tooltip",
    "clase": "ChartTooltipComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/chart-tooltip/chart-tooltip.component",
    "archivo": "src/app/shared/ui/chart-tooltip/chart-tooltip.component.ts",
    "descripcion": "Tooltip de los gráficos (Figma UI KIT, nodo 22758:6756 «Tooltip-graph»): caja oscura con un título (la categoría)\ny una fila por serie con su cuadrado de color y el valor. Solo dibuja la caja: la muestra y la posiciona el\ngráfico que la usa al pasar el puntero o recorrer los datos con el teclado.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "items",
        "tipo": "readonly ChartTooltipItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Título: la categoría del punto (por ejemplo «Mar»)."
      }
    ],
    "eventos": [],
    "usar": "- Dentro de los gráficos del kit: `siaf-bar-chart`, `siaf-line-chart` y `siaf-diverging-chart` la pintan sobre la\n  categoría activa.\n- En un gráfico propio del kit, para mostrar los valores de un punto con el mismo diseño.",
    "evitar": "- Como tooltip de texto de un botón o de algo truncado: usar `siafTooltip`.\n- Con contenido interactivo: el tooltip no recibe el puntero ni el foco.",
    "teclado": "- No recibe foco: la abre y la cierra el gráfico (flechas para recorrer, Escape para cerrarla).",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: cada serie es un párrafo con su nombre y su valor en texto; el cuadrado de\n  color va con `aria-hidden`.\n- **1.4.3 Contraste mínimo (AA)**: texto `text-brand-white` sobre `bg-on-surfaces-high` (12.85:1) en claro; en\n  oscuro, sobre `bg-snackbar` (15.71:1), porque el fondo del Figma se funde con la superficie oscura.\n- **4.1.3 Mensajes de estado (AA)**: la caja no es región viva: el gráfico anuncia los valores en su propia región\n  `aria-live` cuando se recorren con el teclado.",
    "figma": [
      {
        "nodo": "22758:6756",
        "nombre": "Tooltip-graph"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-on-surfaces-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-snackbar",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-6",
        "via": [
          "shadow-siaf-elevation-6"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-checkbox",
    "clase": "CheckboxComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/checkbox/checkbox.component",
    "archivo": "src/app/shared/ui/checkbox/checkbox.component.ts",
    "descripcion": "Checkbox con etiqueta, descripción y marca de requerido, integrado a formularios vía ControlValueAccessor.\n\nTiene 0 consumidores: no usarlo. Las grillas y paneles de la app usan `<input type=\"checkbox\">`\nnativo con clases `accent-*` (el color de un check nativo se pinta con `accent-*`, nunca `text-*`).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "checked",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "required",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "checkedChange",
        "tipo": "boolean",
        "descripcion": null
      }
    ],
    "usar": "- Para una casilla suelta de formulario que se graba con el resto, con etiqueta y ayuda debajo: por ejemplo\n  «Habilitar verificación en dos pasos» del usuario en Admin, hoy hecha con un checkbox nativo.\n- Para una aceptación obligatoria antes de grabar: `[required]` pinta el asterisco y publica `aria-required`.\n- Con `formControlName`, `ngModel` o `[(checked)]`.",
    "evitar": "- Para la selección de filas en grillas y paneles: checkbox nativo, como en `siaf-table-controls` y\n  `siaf-selection-side-nav`.\n- Para encender o apagar algo con efecto inmediato: usar `siaf-switch`.\n- Para una sola opción entre varias o un Sí/No: usar `siaf-radio-group` con `[inline]`.",
    "teclado": "- **Tab**: enfoca la casilla.\n- **Espacio**: la marca o la desmarca (checkbox nativo).",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: el `<input type=\"checkbox\">` va dentro de su `<label>`; la descripción\n  también, así que se suma al nombre en vez de ir por `aria-describedby`.\n- **4.1.2 Nombre, función y valor (A)**: checkbox nativo: el navegador publica el rol, el marcado y `disabled`.\n- **3.3.2 Etiquetas o instrucciones (A)**: etiqueta visible; el obligatorio lleva asterisco y `aria-required`.\n- **Pendiente · 3.3.1 Identificación de errores (A)**: no tiene entrada de error ni `aria-invalid`; si falta marcar\n  una casilla obligatoria, el aviso lo tiene que pintar y asociar el padre.\n- **2.4.7 Foco visible (AA)**: no define estilo propio (`focus:ring-brand-primary` fija el color del anillo, no su\n  ancho); queda el anillo de foco nativo del navegador.\n- **1.4.11 Contraste no textual (AA)**: la casilla la dibuja el estilo global de `styles.css`: borde de 2 px\n  `icon-states-enabled` (8.70:1 claro, 12.87:1 oscuro) y, marcada, relleno `icon-states-active` (8.79:1 / 10.15:1).\n- **1.4.3 Contraste mínimo (AA)**: etiqueta `text-neutral-high` 16.29:1, descripción `text-neutral-low` 5.01:1 y\n  asterisco `text-feedback-danger` 9.84:1.\n- **2.5.8 Tamaño del objetivo (AA)**: la casilla mide 16 px, pero toda la `label` es clicable; sin descripción mide\n  20 px de alto, así que el padre debe separar las casillas.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-required"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "ring-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-collapsible-card",
    "clase": "CollapsibleCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/collapsible-card/collapsible-card.component",
    "archivo": "src/app/shared/ui/collapsible-card/collapsible-card.component.ts",
    "descripcion": "Tarjeta colapsable (Figma UI KIT, nodo 19632:66 «accordion/collapsible_card»): cabecera de 60 px con una\nmarca azul a la izquierda, la flecha, la información del ítem y una X para quitarlo; al abrir, el detalle\naparece debajo separado por una línea.\n\nLa cabecera se proyecta con el atributo `card-info` y el detalle con el contenido sin atributo, así que\nsirve para cualquier ítem de una lista (un documento, un asiento…). `[(expanded)]` controla si está\nabierta; la X emite `closed` y se oculta con `[closable]=\"false\"`. El padre decide qué hacer al cerrar.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "closable",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Muestra la X que emite `closed`."
      },
      {
        "nombre": "closeLabel",
        "tipo": "string",
        "porDefecto": "'Quitar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "expanded",
        "tipo": "boolean",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "expandedChange",
        "tipo": "boolean",
        "descripcion": null
      }
    ],
    "usar": "- Ítems de una lista que se revisan de a uno: un documento o un asiento con su resumen en la cabecera y todos sus\n  datos al abrir.\n- Cuando además el usuario puede quitar el ítem con la X y el padre decide qué pasa con `closed`.\n- Hoy sin uso en la app; empieza cerrada y `[(expanded)]` sirve para abrir la primera o recordar el estado.",
    "evitar": "- Para 2 o más registros comparables en una solicitud: usar la grilla estándar (`siaf-table-controls` + tabla +\n  `siaf-pagination`).\n- Para el único ítem elegido desde un panel lateral, sin detalle que desplegar: usar `siaf-summary-card`.\n- Para secciones con título y menú ⋮, sin X: usar `siaf-expansion-panel`; para preguntas de solo texto,\n  `siaf-accordion`.\n- Con la X visible en modo consulta: ocultarla con `[closable]=\"false\"`.",
    "teclado": "- **Tab**: pasa por la flecha, lo que el padre proyecte en la cabecera y la X.\n- **Enter / Espacio** en la flecha: abren o cierran el detalle y emiten `expandedChange`.\n- **Enter / Espacio** en la X: emiten `closed`; si el padre quita la tarjeta, el foco no se mueve solo.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: la flecha es un `button` con `aria-expanded`, `aria-controls` hacia el\n  detalle y nombre «Expandir detalle» / «Contraer detalle»; la X toma su nombre de `closeLabel`, que el padre debe\n  completar con el ítem (por ejemplo «Quitar documento PAA-…») cuando hay varias tarjetas.\n- **1.3.1 Información y relaciones (A)**: el detalle abierto es `role=\"region\"` rotulado por la cabecera\n  (`aria-labelledby`).\n- **1.1.1 Contenido no textual (A)**: la marca azul y los íconos de los botones son decorativos (`aria-hidden`).\n- **1.4.1 Uso del color (A)**: abierta o cerrada se distingue por la flecha y por el detalle visible; la marca azul\n  no indica estado.\n- **2.4.3 Orden del foco (A)**: al quitar la tarjeta, el padre debe llevar el foco al ítem siguiente o a la acción\n  de agregar: el componente no lo mueve.\n- **2.4.7 Foco visible (AA)**: los dos botones muestran un contorno de 2 px `border-states-focus` separado 2 px.\n- **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /\n  10.15:1 oscuro sobre la superficie).\n- **2.5.8 Tamaño del objetivo (AA)**: flecha y X miden 32 × 32 px.",
    "figma": [
      {
        "nodo": "19632:66",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "region"
      ],
      "atributos": [
        "aria-controls",
        "aria-expanded",
        "aria-hidden",
        "aria-label",
        "aria-labelledby"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-r-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-column-visibility-panel",
    "clase": "ColumnVisibilityPanelComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/column-visibility-panel/column-visibility-panel.component",
    "archivo": "src/app/shared/ui/column-visibility-panel/column-visibility-panel.component.ts",
    "descripcion": "Panel lateral modal para mostrar u ocultar columnas de una grilla, agrupadas en\nPredeterminado / Más columnas / Interno (estas últimas fijas, no desmarcables).\n\nÚsalo junto a `siaf-documents-records-table` y sus `DocumentsRecordsColumn`; el\ncomponente es controlado (recibe el estado y emite toggles, no decide la visibilidad).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "allSelected",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "defaultColumns",
        "tipo": "DocumentsRecordsColumn[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "dirty",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "internalColumns",
        "tipo": "DocumentsRecordsColumn[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "isColumnVisible",
        "tipo": "(columnKey: string) => boolean",
        "porDefecto": "() => false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "moreColumns",
        "tipo": "DocumentsRecordsColumn[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "applied",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "toggleAll",
        "tipo": "Event",
        "descripcion": null
      },
      {
        "nombre": "toggleColumn",
        "tipo": "{ key: string; event: Event; }",
        "descripcion": null
      }
    ],
    "usar": "- En la bandeja «Documentos y registros» (`siaf-documents-records-page`), desde «Más opciones → Ocultar o mostrar\n  columnas», para elegir qué columnas se ven en Documentos o en Registros.\n- En otra grilla con `DocumentsRecordsColumn` cuando el padre guarda un borrador de columnas ocultas y solo lo aplica\n  con Aplicar (`dirty` habilita el botón).",
    "evitar": "- Para filtrar filas: usar `siaf-custom-filter`, `siaf-filter-pill` o el buscador de la grilla.\n- Para elegir registros de un catálogo: usar `siaf-selection-side-nav`.\n- Para un menú corto de opciones sobre la grilla: usar `siaf-icon-dropdown-menu`.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X; recorre «Seleccionar todo», las casillas de cada columna y Cancelar /\n  Aplicar, y da la vuelta sin salir del panel; las de Interno están deshabilitadas y no reciben foco.\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.\n- **Espacio**: marca o desmarca la casilla enfocada (emite `toggleAll` o `toggleColumn`).\n- **Enter / Espacio**: activan la X y Cancelar (emiten `closed`) y Aplicar (emite `applied`; habilitado solo con\n  cambios).",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"dialog\"` con `aria-modal=\"true\"` y `aria-labelledby` al título; la X\n  se llama «Cerrar» y cada casilla toma su nombre del texto de la columna (`<label>`).\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X aunque en la bandeja el panel se pinte\n  al final de la página, y al cerrar lo devuelve al botón que lo abrió.\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.\n- **1.3.1 Información y relaciones (A)**: título `h2` y los grupos Predeterminado / Más columnas / Interno con `h3`.\n- **2.4.7 Foco visible (AA)**: sin estilo propio pero sin `outline-none`: la X, Cancelar y las casillas muestran el\n  anillo nativo del navegador; Aplicar sigue `siaf-button`.\n- **2.5.8 Tamaño del objetivo (AA)**: cada fila mide 48 px y toda la fila marca la casilla; la X y Cancelar, 40 px.\n- **1.4.11 Contraste no textual (AA)**: las casillas llevan borde `icon-states-enabled` de 2 px (8.70:1 sobre la\n  superficie en claro).\n- **1.4.3 Contraste mínimo (AA)**: título `text-text` sobre `bg-surface` (16.29:1 / 16.53:1); las etiquetas\n  `text-neutral-medium` van sobre `surface-highest`, que en claro es el blanco de la superficie (14.53:1).",
    "figma": [],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "px-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-consultas-filtros-chips",
    "clase": "ConsultasFiltrosChipsComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/consultas-filtros-chips/consultas-filtros-chips.component",
    "archivo": "src/app/shared/components/consultas-filtros-chips/consultas-filtros-chips.component.ts",
    "descripcion": "Chips de filtros aplicados de las pantallas \"Consultas y reportes\"\n(transversal — antes vivía clonado en plan-cuentas/asiento-ajuste/catálogo).\n\nLos chips van en UNA sola línea con scroll horizontal invisible (sin barra;\nse desplaza con rueda/arrastre). El botón \"Quitar filtros\" queda fijo a la\nderecha, fuera del scroll, con 12px de separación: los chips que no caben\nse cortan en ese borde.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "chips",
        "tipo": "FiltroChip[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "cleared",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Arriba de los resultados de Consultas y reportes (plan de cuentas, asiento de ajuste, catálogo de tipos de\n  asiento y libros contables) para mostrar con qué criterios se buscó.\n- Con varios criterios o varios valores por criterio: cada chip lee «Etiqueta: valor, valor» en una sola línea.\n- Para volver al inicio de la consulta con un solo botón: «Quitar filtros» emite `cleared`.",
    "evitar": "- Para elegir o cambiar un filtro: los chips no son interactivos; usar `siaf-filter-pill` (opciones cerradas) o\n  `siaf-custom-filter` (condiciones).\n- Para quitar un solo criterio: no hay × por chip; usar `siaf-filter-pill`, que limpia su propio valor.\n- Rehacer la sección con `siaf-tag` sueltos en cada módulo: ya estuvo clonada en tres.\n- Para el bloque «Parámetros aplicados» de la Guía de Estructura de Pantallas (tarjetas con ícono, nombre y valor):\n  es otro componente, `siaf-parametros-aplicados`. Las consultas de hoy siguen con estos chips.",
    "teclado": "- **Tab**: llega al botón «Quitar filtros»; los chips no reciben foco.\n- **Enter / Espacio**: quitan todos los filtros (emite `cleared`). El botón sigue `siaf-button`.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: `<section>` con título `<h3>` «Filtros aplicados de búsqueda»; cada chip\n  se lee como texto «Etiqueta: valores».\n- **1.4.3 Contraste mínimo (AA)**: el título va en `text-neutral-medium` (14.53:1 / 12.87:1) y los chips son\n  `siaf-tag` `input` elegidos, con `text-neutral-activated` sobre la capa `bg-states-light-selected` (7.69:1 /\n  17.15:1).\n- **Pendiente · 2.5.3 Etiqueta en el nombre (A)**: el botón muestra «Quitar filtros», pero su `ariaLabel` es\n  «Quitar todos los filtros», que no contiene el texto visible tal cual (afecta al control por voz).\n- **Pendiente · 2.1.1 Teclado (A)**: el carril de chips se desplaza sin barra y sin `tabindex`; los chips que no\n  caben quedan cortados y, con teclado, dependen de que el navegador enfoque el contenedor (el lector los lee todos).\n- **Pendiente · 2.4.3 Orden del foco (A)**: en las cuatro Consultas, `cleared` devuelve la pantalla al estado vacío\n  y el bloque desaparece con el foco adentro; el padre debe llevarlo (p. ej. al botón «Búsqueda» de la cabecera).\n- **2.4.7 Foco visible (AA)**: el botón es `siaf-button`: borde `border-states-focus` (5.35:1 / 10.15:1) y capa.\n- **2.5.8 Tamaño del objetivo (AA)**: el botón mide 40 px de alto.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-button",
      "siaf-tag"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-create-document",
    "clase": "CreateDocumentComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/create-document/create-document.component",
    "archivo": "src/app/shared/components/create-document/create-document.component.ts",
    "descripcion": "Formulario «Crear documento»: pide proceso, documento y tipo de acción y emite `accepted` con esa selección y la ruta\nde la solicitud a abrir. La variante `sidepanel` (panel del shell) busca el proceso entre `processOptions`, que\npor defecto salen del árbol `DEFAULT_PROCESS_TREE`; `dropdown` (popover) solo pide documento y tipo de acción.\nCon `fields` el padre controla los campos y recibe cada cambio por `fieldValueChange`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "acceptDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "fields",
        "tipo": "CreateDocumentField[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "processOptions",
        "tipo": "CreateDocumentProcessOption[]",
        "porDefecto": "CREATE_DOCUMENT_PROCESSES",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "'Crear documento'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'sidepanel' | 'dropdown'",
        "porDefecto": "'sidepanel'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "accepted",
        "tipo": "CreateDocumentAccepted",
        "descripcion": null
      },
      {
        "nombre": "canceled",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "fieldSelected",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "fieldValueChange",
        "tipo": "CreateDocumentSelection",
        "descripcion": null
      }
    ],
    "usar": "- Desde «Crear» del sidebar o del menú móvil: el shell lo abre como `sidepanel` con las opciones que arma de los tipos\n  de documento del API.\n- En la bandeja, como popover del botón «Crear documento» de `siaf-documents-records-page` (`dropdown` con `fields`\n  controlados para Documento y Tipo de acción).",
    "evitar": "- Pintar otro `sidepanel` en una página: pedir el del shell con `ShellNavigationService.openCreateDocument()`.\n- Para los campos de la solicitud misma: usar `siaf-input` dentro de `siaf-solicitude-page-layout`.\n- Para elegir un registro de un catálogo con columnas: usar `siaf-selection-side-nav`.\n- Copiar a mano la lista de procesos: sale de `DEFAULT_PROCESS_TREE` o de `processOptions`.",
    "teclado": "- **Tab**: recorre el buscador de procesos (en `sidepanel`), Documento, Tipo de acción y Cancelar / Aceptar;\n  Documento y Tipo de acción siguen deshabilitados hasta elegir el campo anterior.\n- **Enter / Espacio** en Documento o Tipo de acción: abre o cierra sus opciones; al abrir, el foco entra en la\n  opción elegida, que sigue `siaf-select-options` (flechas, Inicio, Fin, Enter o Espacio). Escape o salir con Tab\n  las cierra y el foco vuelve al campo.\n- **Flecha abajo** en el buscador de procesos: entra a la lista (si estaba cerrada, primero la abre);\n  **flechas arriba / abajo** la recorren y **Enter** elige el proceso (el foco vuelve al buscador).\n- **Escape**: en el buscador cierra la lista; en un proceso, cierra la lista y vuelve al buscador.\n- **Enter / Espacio** en Cancelar y Aceptar: emiten `canceled` y `accepted`.",
    "accesibilidad": "- **2.1.1 Teclado (A)**: el buscador es un `combobox` con `aria-expanded`: flecha abajo entra a la lista de procesos,\n  las flechas la recorren y Enter elige; la lista ya no se cierra al pasar del buscador a ella.\n- **2.4.7 Foco visible (AA)**: Documento, Tipo de acción y el buscador muestran el borde azul de 2 px\n  (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro) al recibir el foco, también si ya tienen valor.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, las opciones de Documento y Tipo de acción reciben el foco al abrir y\n  al elegir, cerrar con Escape o salir con Tab vuelve al campo; al elegir un proceso el foco vuelve al buscador.\n- **4.1.2 Nombre, función y valor (A)**: el buscador es un `combobox` con `aria-expanded` y `aria-controls` hacia\n  la lista `role=\"listbox\"` «Procesos», y el proceso elegido lleva `aria-selected`. Documento y Tipo de acción\n  publican `aria-expanded` y `aria-haspopup=\"listbox\"`.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde de los campos en reposo es `border-states-enabled`\n  (2.44:1 / 2.59:1); el de foco, `border-states-focus` (5.35:1 / 10.15:1), sí cumple.\n- **3.3.2 Etiquetas o instrucciones (A)**: cada campo muestra su nombre (en el placeholder o como etiqueta flotante)\n  con asterisco en los obligatorios; no llevan `aria-required`.\n- **1.3.1 Información y relaciones (A)**: sección con `aria-label=\"Crear documento\"` (fijo aunque cambie `title`) y\n  título `h2`; cada campo va dentro de su `<label>`.\n- **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` (14.53:1 / 12.87:1) y placeholder `text-neutral-low`\n  (5.01:1 / 8.86:1) sobre el `bg-surface` de los campos.",
    "figma": [],
    "aria": {
      "roles": [
        "combobox",
        "listbox",
        "option"
      ],
      "atributos": [
        "aria-autocomplete",
        "aria-controls",
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label",
        "aria-selected"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-field",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface",
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md",
          "pl-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "pr-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "pb-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "px-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-button",
      "siaf-icon",
      "siaf-select-options"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-custom-filter",
    "clase": "CustomFilterComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/custom-filter/custom-filter.component",
    "archivo": "src/app/shared/components/custom-filter/custom-filter.component.ts",
    "descripcion": "Panel de filtros personalizados: filas de condición con los selects Campo, Condición y Valor (`siaf-input`) que se\nagregan o quitan; cambiar el Campo vacía la Condición y el Valor, e `initialRows` precarga las filas al editar un\nfiltro ya aplicado.\n\n`aplicar` emite solo las filas completas, `cancelar` las limpia y, con `deleteEnabled`, quitar la única fila emite\n`eliminar`. Solo pinta el contenido: el padre lo abre como panel flotante y lo cierra.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "campoOptions",
        "tipo": "TextFieldOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "condicionOptions",
        "tipo": "TextFieldOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "deleteEnabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "initialRows",
        "tipo": "FilterRow[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "valorOptions",
        "tipo": "TextFieldOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "aplicar",
        "tipo": "CustomFilterApplyEvent",
        "descripcion": null
      },
      {
        "nombre": "cancelar",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "eliminar",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para el panel «Agregar filtro» de la bandeja y de las pestañas Documentos / Registros\n  (`siaf-documents-records-page`): cada filtro aplicado queda como un chip que se puede reabrir.\n- Para editar ese chip: abrirlo con `initialRows` y `[deleteEnabled]=\"true\"`, así quitar la única condición elimina\n  el filtro.\n- Cuando el criterio combina un campo, una condición (Es igual a, Contiene) y un valor elegido de una lista.",
    "evitar": "- Para filtrar por un solo campo con pocas opciones (Estado, Tipo de acción): `siaf-filter-pill`.\n- Para buscar texto libre: `siaf-form-table-search` (en Documentos y registros y la bandeja, su variante\n  `siaf-records-search-toolbar`).\n- Para mostrar los criterios ya aplicados en Consultas y reportes: `siaf-consultas-filtros-chips`.",
    "teclado": "- **Tab**: al abrirse, el foco entra en el primer campo; recorre fila por fila los selects Campo, Condición y Valor y\n  la papelera; después «Agregar condición», Aplicar (habilitado solo con una fila completa) y Cancelar.\n- **Enter / Espacio**: en «Agregar condición» suman una fila; en la papelera la quitan (con `deleteEnabled` y una\n  sola fila, emiten `eliminar`).\n- Los selects siguen `siaf-input` y Aplicar / Cancelar, `siaf-button`.\n- **Escape**: emite `cancelar` para que el padre cierre el panel; el foco vuelve al botón que lo abrió. Con la lista\n  de un select abierta, Escape cierra solo la lista.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: el título «Agregar filtros personalizados» es un `<span>`, no\n  un encabezado, y las filas no se agrupan (`fieldset` o `role=\"group\"`): con varias condiciones se repiten «Campo»,\n  «Condición», «Valor» y «Eliminar condicion» sin decir de qué fila son.\n- **4.1.2 Nombre, función y valor (A)**: los selects de `siaf-input` publican `aria-haspopup=\"listbox\"` y\n  `aria-expanded`; la papelera es un `<button>` con `aria-label` («Eliminar condicion», sin tilde) y Aplicar usa\n  `disabled`.\n- **Pendiente · 2.4.3 Orden del foco (A)**: con `siafFoco` (sin atrapar Tab) el foco entra al abrirse y vuelve al\n  botón que lo abrió al cerrarse, pero al agregar una condición el foco no pasa a la fila nueva y, al quitar la fila\n  final, su papelera desaparece sin mover el foco.\n- **3.3.2 Etiquetas o instrucciones (A)**: cada select muestra su etiqueta (Campo, Condición, Valor); no hay texto\n  que diga que Aplicar necesita una fila completa.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-medium` (14.53:1 / 12.87:1), «Agregar condición»\n  `text-neutral-high` (16.29:1 / 16.53:1) y papelera `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: los selects heredan de `siaf-input` el borde\n  `border-states-enabled` (2.44:1 / 2.59:1) mientras no tienen foco ni valor.\n- **2.4.7 Foco visible (AA)**: «Agregar condición» y la papelera muestran un contorno de 2 px del color de su texto\n  (`focus-visible:outline-2`); los selects y los botones, el de su componente.\n- **2.5.8 Tamaño del objetivo (AA)**: papelera de 32 px, «Agregar condición» de unos 28 px de alto y Aplicar /\n  Cancelar de 32 px (`siaf-button` en `sm`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "p-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-icon",
      "siaf-input"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-data-table",
    "clase": "DataTableComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/data-table/data-table.component",
    "archivo": "src/app/shared/components/data-table/data-table.component.ts",
    "descripcion": "Tabla de solo lectura: una cabecera con las `columns` y una fila por registro con el texto de cada celda\n(`row[column.key]`); `idKey` identifica las filas.\n\nUsa las clases globales `siaf-table-*` (cabecera fija y scroll con alto máximo de 480 px, 320 px en móvil). No\nselecciona, no ordena ni pagina; `siaf-table` la envuelve con la misma API.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "columns",
        "tipo": "DataTableColumn[]",
        "porDefecto": "[]",
        "requerida": true,
        "descripcion": null
      },
      {
        "nombre": "idKey",
        "tipo": "string",
        "porDefecto": "'id'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rows",
        "tipo": "DataTableRow[]",
        "porDefecto": "[]",
        "requerida": true,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para un listado corto de solo lectura con texto plano en cada celda (número, documento, estado como texto), sin\n  acciones por fila.\n- Hoy solo la pinta `siaf-table`, que ninguna pantalla usa: es la base para un listado nuevo antes de escribir otra\n  `<table>` a mano.",
    "evitar": "- Para celdas con enlace al documento, tag de estado, checkbox o historial: `siaf-documents-records-table`.\n- Para seleccionar o paginar: no lo hace sola; va dentro de la grilla estándar (`siaf-table-controls` arriba y\n  `siaf-pagination` con `position=\"Bottom\"` y `rowPage` abajo).\n- Para ítems sin columnas (título, descripción, ícono): `siaf-list`.",
    "teclado": "- No recibe foco: no es interactiva. Si las filas pasan el alto máximo, el contenedor con scroll no lleva\n  `tabindex`: desplazarlo con el teclado depende del navegador.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: `<table>` con `<thead>`, `<tbody>` y un `<th>` por columna (sin `scope`,\n  que con una sola fila de cabecera no hace falta). No admite `<caption>` ni `ariaLabel`: el padre debe titularla\n  con un encabezado cercano. No ordena columnas, así que no aplica `aria-sort`.\n- **1.4.3 Contraste mínimo (AA)**: celdas en `text-neutral-high` sobre la superficie (16.29:1 / 16.53:1); la\n  cabecera, en `text-neutral-high` sobre `bg-surfaces-surface-high` (más que `text-neutral-medium` en ese fondo,\n  11.46:1 / 11.39:1).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-date-time-picker",
    "clase": "DateTimePickerComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/date-time-picker/date-time-picker.component",
    "archivo": "src/app/shared/ui/date-time-picker/date-time-picker.component.ts",
    "descripcion": "Selector de fecha (y opcionalmente hora) con calendario propio, label flotante,\nestados de error/éxito y `[minDate]` para deshabilitar días anteriores.\n\nEs el control canónico de fecha del design system: úsalo en vez de un `input type=\"date\"`\nnativo para que el campo respete tokens, textos en español y el formato dd/mm/aaaa.\n\nEn la cabecera del calendario, el mes y el año son botones: el mes abre los 12 meses y el año una\ngrilla de 12 años (las flechas dobles pasan de página). Al elegir, vuelve a los días de ese mes o año.\nCon `minDate`, los meses y años que terminan antes quedan deshabilitados.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "defaultToToday",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "error",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "fullWidth",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "hint",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "minDate",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Fecha mínima seleccionable en formato ISO (YYYY-MM-DD). Los días anteriores quedan deshabilitados."
      },
      {
        "nombre": "placeholder",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "required",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "state",
        "tipo": "'success' | 'error' | 'enabled'",
        "porDefecto": "'enabled'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'date' | 'datetime'",
        "porDefecto": "'date'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "valueChange",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Para las fechas de vigencia de una solicitud («Fecha inicio desde» y «Fecha fin hasta» en clase de ajuste, tipo de\n  asiento, evento y evento contable), con `[minDate]` para que el fin no quede antes del inicio.\n- Para los rangos «Fecha desde» / «Fecha hasta» de los paneles de búsqueda de las consultas y de libros contables.\n- Para una fecha puntual de un formulario: la fecha del asiento de ajuste o las fechas de contrato del usuario en Admin.",
    "evitar": "- Un `input type=\"date\"` nativo o un `siaf-input` con `trailingIcon=\"calendar_today\"` (como la vigencia del\n  formulario de cuenta contable): usar este componente.\n- Dejar `defaultToToday` en `true` en filtros o fechas opcionales: pinta la fecha de hoy sin emitirla, así que el\n  padre sigue vacío. Pasar `[defaultToToday]=\"false\"`.\n- `variant=\"datetime\"` para capturar una hora: los campos de hora no están conectados; emite solo la fecha y la\n  muestra con 00:00:00.\n- Para mostrar una fecha que no se edita: en modo lectura va `readonly-field`, no el selector `[disabled]`.",
    "teclado": "- **Tab**: enfoca el campo. Al abrir el calendario el foco entra en el día elegido (o en hoy); desde ahí recorre\n  las flechas de la cabecera, el mes, el año y cada día habilitado, y salir con Tab cierra el calendario.\n- **Enter / Espacio**: en el campo abren o cierran el calendario; dentro, activan la flecha o eligen el día, mes o\n  año enfocado (botones nativos). Cancelar y Aceptar de `datetime` siguen `siaf-button`.\n- **Escape**: cierra el calendario y el foco vuelve al campo.\n- **Flechas**: no están implementadas entre los días; el calendario también se cierra al elegir un día (variante\n  `date`) o con Cancelar o Aceptar.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: la etiqueta no se une al botón del campo con `aria-labelledby`\n  ni `aria-label`: un único `<label>` envuelve etiqueta flotante, botón, ayuda, error y calendario, y con fecha\n  elegida el botón muestra solo la fecha. En `datetime`, los tres campos de hora no tienen etiqueta.\n- **Pendiente · 3.3.1 Identificación de errores (A)**: el texto de `error` se ve bajo el campo, pero no se asocia con\n  `aria-describedby` ni se anuncia al aparecer; con `state=\"error\"` y sin `error`, el aviso es solo el borde rojo.\n- **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: el obligatorio es solo el asterisco rojo: `aria-required` va\n  en un `<button>`, rol que no admite ese atributo en ARIA 1.2.\n- **4.1.2 Nombre, función y valor (A)**: el campo publica `aria-haspopup=\"dialog\"` y `aria-expanded`; el calendario\n  es `role=\"dialog\"` con `aria-label`, y las grillas de meses y años, `role=\"listbox\"` con `aria-selected`.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada día se lee solo como número («05») y el día elegido no\n  publica estado (`aria-selected` o `aria-pressed`); las grillas `listbox` no responden a flechas.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en el día elegido (o en hoy) y al cerrarse\n  (un día, Cancelar, Aceptar, Escape o salir con Tab) vuelve al campo.\n- **2.4.7 Foco visible (AA)**: el botón del campo pasa al borde azul de 2 px (`border-states-focus`, 5.35:1 claro /\n  10.15:1 oscuro) al recibir el foco, también con valor (éxito); con error, el borde sigue rojo y el foco se ve en un\n  contorno azul por fuera. Los botones del calendario conservan el anillo nativo.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo vacío es `border-states-enabled` (2.44:1\n  claro, 2.59:1 oscuro).\n- **1.4.3 Contraste mínimo (AA)**: valor `text-neutral-high` 16.29:1, etiqueta `text-neutral-low` 5.01:1, días\n  `text-neutral-medium` 14.53:1 y día elegido en blanco sobre `bg-brand-primary` 8.79:1 (6.67:1 oscuro). Con valor,\n  la ayuda pasa a `text-feedback-success`, par que la tabla no mide.\n- **Pendiente · 2.5.8 Tamaño del objetivo (AA)**: las flechas de la cabecera miden 20 px (`size-5`) con 4 px entre\n  ellas; los días miden 36 px y el campo, 40 px.",
    "figma": [],
    "aria": {
      "roles": [
        "dialog",
        "listbox",
        "option"
      ],
      "atributos": [
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label",
        "aria-required",
        "aria-selected"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "mt-siaf-xs",
          "p-siaf-xs",
          "pt-siaf-xs",
          "px-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "px-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-2",
        "via": [
          "shadow-siaf-elevation-2"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-button",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-desk-card",
    "clase": "DeskCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/desk-card/desk-card.component",
    "archivo": "src/app/shared/ui/desk-card/desk-card.component.ts",
    "descripcion": "Tarjeta del Panel de inicio (escritorio virtual): ícono, título y un número opcional, en las tres formas de esa\npantalla. `featured` es la grande, con el ícono en un recuadro y el número bajo el título (Bandeja de Documentos, o\nProcesos sin número); `counter`, un contador con el título y el número a la izquierda y el ícono de color a la\nderecha, sin recuadro (Recibidos, Enviados, Borradores, Notificaciones); `shortcut`, un acceso con el ícono en\nrecuadro y el título, que no muestra número (Consulta y Reportes, Crear documento). El número va con dos dígitos\ncomo mínimo («04»).\n\nCon `interactive` toda la tarjeta es un `button` que emite `activated`; sin él es un `article` que no recibe foco.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": true,
        "descripcion": "Ícono de Material Icons."
      },
      {
        "nombre": "interactive",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Toda la tarjeta pasa a ser un `button` que emite `activated`."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": true,
        "descripcion": "Qué es la tarjeta («Bandeja de Documentos»); también nombra el `article`."
      },
      {
        "nombre": "tone",
        "tipo": "'neutral' | 'success' | 'warning' | 'accent' | 'primary'",
        "porDefecto": "'neutral'",
        "requerida": false,
        "descripcion": "Color del ícono."
      },
      {
        "nombre": "value",
        "tipo": "number | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Número de `featured` y `counter`; con `null` no se muestra. `shortcut` nunca lo muestra."
      },
      {
        "nombre": "variant",
        "tipo": "'featured' | 'counter' | 'shortcut'",
        "porDefecto": "'shortcut'",
        "requerida": false,
        "descripcion": "`featured` (grande, número opcional), `counter` (contador) o `shortcut` (acceso, sin número)."
      }
    ],
    "eventos": [
      {
        "nombre": "activated",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- En el Panel de inicio (`siaf-virtual-desk`): Bandeja de Documentos y Procesos arriba (`featured`), los contadores\n  de la bandeja (`counter`) y los accesos (`shortcut`) debajo.\n- Con `interactive` cuando pulsarla abre algo, como «Procesos», que abre el menú de procesos del shell.\n- `tone` para el color del ícono, que acompaña al título: Enviados y Crear documento en `accent`, Recibidos en\n  `success`, Borradores en `warning`.",
    "evitar": "- Para un monto con su avance respecto de una meta, en un tablero: usar `siaf-kpi-card`.\n- Para agrupar contenido de una pantalla: usar `siaf-card`.\n- `interactive` en una tarjeta que no hace nada al pulsarla: parece un acceso roto.\n- Con enlaces o botones adentro: la tarjeta interactiva ya es un `button` y no admite otros controles.\n- Para decir algo solo con el color del ícono: el título tiene que decirlo.",
    "teclado": "- **Tab**: enfoca la tarjeta si es `interactive`; si no, no recibe foco.\n- **Enter / Espacio**: en la interactiva, emiten `activated`.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: la interactiva es un `button` nativo nombrado con su texto; la otra es un\n  `article` nombrado con el título.\n- **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`aria-hidden`): el título dice qué es.\n- **1.3.1 Información y relaciones (A)**: el número visible, con ceros a la izquierda, se oculta al lector de\n  pantalla, que lee el valor sin relleno («4» y no «cero cuatro»).\n- **1.4.1 Uso del color (A)**: el tono del ícono no dice nada por sí solo.\n- **1.4.3 Contraste mínimo (AA)**: título y número `text-brand-secondary` sobre la superficie (8.70:1 claro /\n  12.87:1 oscuro), y 8.06:1 / 8.66:1 sobre el fondo de hover de la interactiva.\n- **1.4.11 Contraste no textual (AA)**: los íconos quedan sobre 3:1 aunque son decorativos (`accent` 4.14:1 /\n  4.29:1 es el más bajo).\n- **2.4.7 Foco visible (AA)**: contorno de 2 px `border-states-focus` separado 2 px (5.35:1 claro / 10.15:1 oscuro).\n- **2.5.8 Tamaño del objetivo (AA)**: toda la tarjeta es el objetivo, de al menos 120 px de alto.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-primary",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-secondary",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "p-siaf-xl",
          "px-siaf-xl"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-detail-history-tabs",
    "clase": "DetailHistoryTabsComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/detail-history-tabs/detail-history-tabs.component",
    "archivo": "src/app/shared/components/detail-history-tabs/detail-history-tabs.component.ts",
    "descripcion": "Tabs reutilizables \"Detalle | Historial\" para vistas de solicitudes.\n- Detalle: muestra un único comentario contextual (observación, rechazo, etc.)\n- Historial: tabla completa con todas las iteraciones del flujo.\n\nDiseño basado en Figma nodes 6591:3280 (tabs) y 30:6121 (historial). La franja de pestañas es\n`siaf-tabs` subrayado (Figma «Tabs», Border=False).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "comentario",
        "tipo": "DetailHistoryComment | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Comentario del estado actual (opcional). Si está vacío se muestra `emptyDetalle`."
      },
      {
        "nombre": "detalleLabel",
        "tipo": "string",
        "porDefecto": "'Detalle'",
        "requerida": false,
        "descripcion": "Etiquetas configurables."
      },
      {
        "nombre": "emptyDetalle",
        "tipo": "string",
        "porDefecto": "'Sin comentarios para mostrar.'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "emptyHistorial",
        "tipo": "string",
        "porDefecto": "'Sin registros en el historial.'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "emptyText",
        "tipo": "string",
        "porDefecto": "'—'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "entries",
        "tipo": "DetailHistoryEntry[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Entradas a renderizar en la tabla del historial."
      },
      {
        "nombre": "historialLabel",
        "tipo": "string",
        "porDefecto": "'Historial'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "historialTitle",
        "tipo": "string",
        "porDefecto": "'Historial de comentarios y detalles'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- En la solicitud abierta, para el comentario vigente (observación o motivo de rechazo) y la tabla de iteraciones:\n  plan de cuentas (individual y carga masiva), clase y tipo de asiento de ajuste, asiento de ajuste y solicitud de\n  apertura contable.\n- Encima de `siaf-action-tracker`, que completa la trazabilidad con los responsables.\n- Con `buildHistoryEntries` y `buildCurrentComment` de `detail-history-tabs.utils.ts` para armar los datos desde el\n  historial de la solicitud.",
    "evitar": "- Para ver el historial desde la bandeja sin abrir la solicitud: usar `siaf-document-history-panel`.\n- Para quién elaboró, verificó y aprobó: usar `siaf-action-tracker`.\n- Para otras pestañas: usar `siaf-tabs` directamente; este componente fija Detalle / Historial y sus columnas.\n- Rehacer a mano la tabla de iteraciones en otra solicitud: reusar este componente.",
    "teclado": "- **Tab**: entra a la fila de pestañas en la activa y sale al contenido.\n- **Flecha izquierda / derecha**: pasan de Detalle a Historial y viceversa, como en `siaf-tabs`.\n- **Inicio / Fin**: van a Detalle o a Historial.",
    "accesibilidad": "- **Pendiente · 4.1.2 Nombre, función y valor (A)**: las pestañas son `siaf-tabs` (`role=\"tab\"` con\n  `aria-selected`), pero la fila no recibe `ariaLabel` y el contenido no es `role=\"tabpanel\"` con `aria-labelledby`.\n- **1.3.1 Información y relaciones (A)**: el historial es una `table` con `thead` y `th` bajo un `h3`; el comentario\n  va como rótulo y párrafo.\n- **1.4.1 Uso del color (A)**: la pestaña activa va en negrita con subrayado; proceso, comentario y fecha de cada\n  iteración están en texto.\n- **1.4.3 Contraste mínimo (AA)**: pestañas inactivas `text-neutral-low` 4.64:1 (oscuro 8.32:1) sobre\n  `surface-low`; rótulo `text-neutral-low` 5.01:1 (8.86:1), celdas `text-neutral-medium` 14.53:1 (12.87:1) y título\n  `text-neutral-high` 16.29:1 (16.53:1) sobre la superficie.\n- **2.1.1 Teclado (A)**: se cambia de pestaña con flechas, Inicio y Fin; solo la activa entra en el orden de\n  tabulación.\n- **2.4.7 Foco visible (AA)**: sigue `siaf-tabs`: borde interior de 2 px `border-states-focus` y capa de foco.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-border-radius-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-padding-base-md",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-padding-base-sm",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-padding-base-xl",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-padding-base-xxs",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-typography-size-body-2",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-typography-size-caption-1",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-typography-size-heading-6",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-typography-size-overline-1",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-typography-weight-bold",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-typography-weight-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-typography-weight-regular",
        "via": [
          "var()"
        ]
      }
    ],
    "usa": [
      "siaf-tabs"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-diverging-chart",
    "clase": "DivergingChartComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/diverging-chart/diverging-chart.component",
    "archivo": "src/app/shared/ui/diverging-chart/diverging-chart.component.ts",
    "descripcion": "Gráfico divergente del kit (Figma UI KIT, página «Graphics»: «Divergente»), dibujado con Chart.js: una barra\nhorizontal por categoría que sale de la línea del cero (`divider-strong`) hacia la izquierda si el valor es negativo\ny hacia la derecha si es positivo. El eje es simétrico, con cinco marcas (−2p, −p, 0, p y 2p) y un paso redondo que\ncubre al mayor valor, salvo que `max` fije el límite. Cada lado tiene su color y su nombre en la leyenda:\n`negativeLabel` con el primario y `positiveLabel` con el secundario.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Gráfico divergente'",
        "requerida": false,
        "descripcion": "Nombre accesible del gráfico y título de su tabla de datos."
      },
      {
        "nombre": "categories",
        "tipo": "readonly string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Etiquetas de las categorías (meses, rubros), de arriba abajo."
      },
      {
        "nombre": "categoryLabel",
        "tipo": "string",
        "porDefecto": "'Categoría'",
        "requerida": false,
        "descripcion": "Encabezado de la columna de categorías en la tabla de datos."
      },
      {
        "nombre": "height",
        "tipo": "number",
        "porDefecto": "252",
        "requerida": false,
        "descripcion": "Alto del área del gráfico en px (sin la leyenda)."
      },
      {
        "nombre": "max",
        "tipo": "number | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Límite del eje a cada lado del cero; sin él, el doble de un paso redondo que cubre al mayor valor absoluto."
      },
      {
        "nombre": "negativeLabel",
        "tipo": "string",
        "porDefecto": "'Negativo'",
        "requerida": false,
        "descripcion": "Qué significa el lado negativo, en color primario: nombre en la leyenda, el tooltip y la tabla."
      },
      {
        "nombre": "positiveLabel",
        "tipo": "string",
        "porDefecto": "'Positivo'",
        "requerida": false,
        "descripcion": "Qué significa el lado positivo, en color secundario: nombre en la leyenda, el tooltip y la tabla."
      },
      {
        "nombre": "values",
        "tipo": "readonly number[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Un valor con signo por categoría, en el mismo orden que `categories`."
      },
      {
        "nombre": "valueSuffix",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Sufijo de los valores en el eje, el tooltip y la tabla (por ejemplo `%`)."
      }
    ],
    "eventos": [],
    "usar": "- Para variaciones respecto de cero por mes o categoría: variación de existencias, superávit y déficit.\n- `negativeLabel` y `positiveLabel` con lo que significa cada lado, como «Disminución» y «Aumento».\n- Dentro de `siaf-chart-section`, que le pone título y descripción.",
    "evitar": "- Para valores que no cambian de signo: usar `siaf-bar-chart`, horizontal si las etiquetas son largas.\n- Para varias series por categoría: usar `siaf-bar-chart` agrupado.\n- Para la evolución de un valor en el tiempo: usar `siaf-line-chart`.",
    "teclado": "- **Tab**: enfoca el gráfico (una sola parada).\n- **Flecha abajo / arriba**: recorren las categorías y muestran el tooltip con su valor; dan la vuelta.\n- **Inicio / Fin**: van a la primera o a la última categoría.\n- **Escape**: oculta el tooltip; salir del gráfico también lo oculta.",
    "accesibilidad": "- **1.1.1 Contenido no textual (A)**: el lienzo es `role=\"img\"` con `ariaLabel` y, además, hay una tabla de datos\n  oculta (`sr-only`) con una fila por categoría y el valor en la columna de su lado.\n- **1.3.1 Información y relaciones (A)**: la tabla usa `caption`, `th scope=\"col\"` para los dos lados y\n  `th scope=\"row\"` para las categorías.\n- **2.1.1 Teclado (A)**: los valores se recorren con las flechas; al moverse, una región `aria-live` anuncia la\n  categoría, el lado y el valor.\n- **2.4.7 Foco visible (AA)**: el lienzo enfocado muestra el contorno de 2 px `border-states-focus`.\n- **1.4.1 Uso del color (A)**: el lado no depende solo del color: la barra queda a la izquierda o a la derecha del\n  cero, el valor lleva su signo y el nombre del lado está en la leyenda, en el tooltip y en la tabla.\n- **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el tooltip sin mover el puntero ni el foco.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro las barras de los dos lados (`bg-brand-primary`,\n  2.66:1, y `bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie; la paleta oscura de los gráficos está\n  por definir con diseño.",
    "figma": [
      {
        "nodo": "22743:260",
        "nombre": "Divergente"
      }
    ],
    "aria": {
      "roles": [
        "img"
      ],
      "atributos": [
        "aria-label",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "pt-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-chart-legend",
      "siaf-chart-tooltip"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-divider",
    "clase": "DividerComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/divider/divider.component",
    "archivo": "src/app/shared/ui/divider/divider.component.ts",
    "descripcion": "Línea separadora de 1 px con `role=\"separator\"` (Figma UI KIT, nodo 8184:10561 «Dividers»).\n\nVariantes del Figma: `full-width` (por defecto) separa secciones de contenido distinto; `inset` deja\n16 px al inicio, para separar ítems de una lista que comparten sangría; `middle-inset` deja 16 px a\nambos lados. En `vertical` la sangría va arriba y abajo, y la línea ocupa el alto de la fila.\n\nLos side panels van SIN líneas separadoras por regla de diseño (título/contenido/botones).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "orientation",
        "tipo": "'vertical' | 'horizontal'",
        "porDefecto": "'horizontal'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'full-width' | 'inset' | 'middle-inset'",
        "porDefecto": "'full-width'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Entre grupos de opciones de un menú: `siaf-menu` lo pinta con `divider` en la opción, como en el menú Favorito de\n  la bandeja («Solicitudes observadas» y «Guardar búsqueda actual»).\n- Bajo cada ítem de `siaf-list` con `dividers` (ancho completo); fuera de ella, `inset` separa ítems que comparten\n  sangría.\n- `full-width` para separar secciones de contenido distinto dentro de una tarjeta, y `vertical` entre grupos de\n  controles de una misma fila.",
    "evitar": "- En paneles laterales (`siaf-side-nav`, `siaf-side-panel`, `siaf-selection-side-nav`): van sin líneas entre título,\n  contenido y botones, por regla de diseño. La excepción es el panel de filtros de `siaf-side-panel`, que el Figma\n  separa del contenido con líneas.\n- Para separar filas de una grilla: `siaf-data-table` y `siaf-documents-records-table` ya dibujan el borde de cada\n  fila.\n- Un `<hr>` o un `div` con `border-b` hecho a mano: usar `siaf-divider`, que toma el color del token y publica\n  `role=\"separator\"`.\n- Como única señal de agrupación: la línea es tenue; acompañarla de espacio o de un título.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: la línea es `role=\"separator\"` con `aria-orientation` (`horizontal` o\n  `vertical`).\n- **1.4.11 Contraste no textual (AA)**: no se exige: la línea (`divider-default`, 1.27:1 claro / 1.50:1 oscuro) es\n  decorativa y no identifica un control ni un estado; por eso la agrupación no debe depender solo de ella.",
    "figma": [
      {
        "nodo": "8184:10561",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "separator"
      ],
      "atributos": [
        "aria-orientation"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-document-history-panel",
    "clase": "DocumentHistoryPanelComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/document-history-panel/document-history-panel.component",
    "archivo": "src/app/shared/components/document-history-panel/document-history-panel.component.ts",
    "descripcion": "Panel lateral a pantalla completa «Historial del documento», que abre la bandeja `siaf-documents-records-page`\ndesde la pestaña Documentos.\n\nMuestra el documento, su N° y el tipo de acción, una sección plegable opcional de atributos y la tabla «Historial\nde estados» (usuario, unidad organizacional, fecha y estado con `siaf-flow-status-tag`), que pide a la API con\n`solicitudId` o toma de `staticRows` sin consultar. Se cierra con la X o pulsando el fondo, que emiten `closed`.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "summary",
        "tipo": "DocumentHistorySummary",
        "porDefecto": "{ solicitudId: '', document: '', number: '', actionType: ''…",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para ver desde la pestaña Documentos de cualquier bandeja quién movió el documento y cuándo pasó por Elaborado,\n  Verificado, Observado o Aprobado, sin abrir la solicitud.\n- Con `attributes` y `staticRows` para documentos que no son solicitudes del flujo, como los asientos de apertura\n  anual (Registrado, Procesado, Anulado).",
    "evitar": "- Para registros (pestaña Registros): usar `siaf-account-history-panel` o `siaf-asiento-history-panel`.\n- Dentro de la solicitud abierta: usar `siaf-detail-history-tabs` y `siaf-action-tracker` en la página.\n- Para mostrar comentarios u observaciones: la tabla no pinta el `comentario` aunque viaje en cada fila; usar\n  `siaf-detail-history-tabs`.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X; recorre el botón de atributos y da la vuelta sin salir del panel.\n- **Enter / Espacio** en la X: cierran el panel (emite `closed`).\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón de historial.\n- **Enter / Espacio** en el botón de atributos: pliegan o despliegan la sección.",
    "accesibilidad": "- **Pendiente · 4.1.2 Nombre, función y valor (A)**: es `role=\"dialog\"` con `aria-modal`, nombre desde su título y\n  la X «Cerrar historial»; pero el botón de atributos no publica `aria-expanded` ni `aria-controls`: su estado solo\n  se ve en la flecha.\n- **1.3.1 Información y relaciones (A)**: título `h2`, subtítulo `h3` y estados en una `table` con `thead` y `th`.\n- **1.4.1 Uso del color (A)**: cada estado va escrito en `siaf-flow-status-tag`.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1), valores\n  `text-neutral-high` 16.29:1 (16.53:1) y celdas `text-neutral-medium` 14.53:1 (12.87:1) cumplen, pero el estado\n  Observado da 3.39:1 en claro.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y lo retiene en el panel; al cerrar (X,\n  Escape o clic en el fondo) lo devuelve al botón de historial.\n- **2.4.7 Foco visible (AA)**: la X y el botón de atributos no definen estilo de foco: muestran el contorno por\n  defecto del navegador.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: la carga pinta filas grises animadas sin texto ni `aria-busy`, así\n  que no se anuncia.",
    "figma": [],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "mb-siaf-md",
          "mt-siaf-md",
          "p-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "px-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-l-siaf-md",
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-l-siaf-sm",
          "rounded-r-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-flow-status-tag",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-document-summary-card",
    "clase": "DocumentSummaryCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/document-summary-card/document-summary-card.component",
    "archivo": "src/app/shared/ui/document-summary-card/document-summary-card.component.ts",
    "descripcion": "Card de cabecera de un documento: N° de documento, N° de documento contable (opcional)\ny su estado de flujo, con layout distinto en móvil y escritorio.\n\nÚsalo en las páginas de solicitud para resumir el documento abierto. Para la card de\n\"ítem seleccionado\" desde un side panel el componente canónico es `siaf-summary-card`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "contableNumber",
        "tipo": "string | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Número de documento contable (ej: AA-1-2026-01) — opcional, se muestra como tercera fila"
      },
      {
        "nombre": "contableNumberLabel",
        "tipo": "string",
        "porDefecto": "'N° Doc. Contable'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "documentNumber",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "documentNumberLabel",
        "tipo": "string",
        "porDefecto": "'N° documento'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "status",
        "tipo": "FlowStatus",
        "porDefecto": "ESTADO.ELABORADO",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "statusLabel",
        "tipo": "string",
        "porDefecto": "'Estado'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- En la cabecera de las pantallas de solicitud, junto a `siaf-solicitude-info-card`, para el N° y el estado del\n  documento abierto: plan de cuentas, catálogo de ajustes, catálogo de eventos, eventos contables y apertura contable.\n- Con `contableNumber` cuando el documento ya tiene N° de documento contable: asiento de ajuste y asiento anual de\n  apertura contable.\n- En el detalle de los documentos y pedidos de Contabilización.",
    "evitar": "- Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`.\n- Para datos generales como fecha, ente rector o entidad: usar `siaf-solicitude-info-card`.\n- Para el estado de un registro (Activo, Anulado): usar `siaf-record-status-tag`; esta card muestra el estado del\n  flujo del documento.\n- Etiquetas largas: en escritorio la columna mide 140 px y la etiqueta se trunca.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: cada etiqueta precede a su valor en el orden de lectura; las versiones\n  móvil y escritorio se ocultan con `display: none`, así que el lector de pantalla lee una sola.\n- **1.4.1 Uso del color (A)**: el estado va escrito en `siaf-flow-status-tag`, no solo en el color.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1) y N° de\n  documento `text-neutral-high` 16.29:1 (16.53:1) cumplen, pero el N° contable usa la clase `text-brand-primary`\n  (color de fondo de marca), 2.66:1 en oscuro, y el estado Observado / Pendiente / Fallido da 3.39:1 en claro.\n- **1.4.13 Contenido en hover o foco (AA)**: en escritorio el N° truncado se completa con `siafTooltip`, que se\n  cierra con Escape y se puede recorrer con el puntero.\n- **Pendiente · 2.1.1 Teclado (A)**: ese texto no recibe foco, así que con teclado el globo no aparece (el lector de\n  pantalla sí lee el valor entero).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-flow-status-tag"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-documents-records-page",
    "clase": "DocumentsRecordsPageComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/documents-records-page/documents-records-page.component",
    "archivo": "src/app/shared/components/documents-records-page/documents-records-page.component.ts",
    "descripcion": "Pantalla «Documentos y registros» de un proceso, armada desde un `DocumentsRecordsConfig`: breadcrumb, título,\n«Crear documento», pestañas Documentos / Registros, buscador con menús y filtros, grilla estándar con paginación y\nlos paneles de historial y de columnas.\nAplica las reglas de rol (el creador verifica elaborados, el aprobador aprueba verificados y el resto solo consulta;\n`modoConsulta` quita crear y las acciones) y ejecuta verificar o aprobar en lote contra el backend.\nCon `serverQuery` / `serverRecordsQuery` la búsqueda y la paginación las resuelve el padre en el servidor, y la\nselección sobrevive al refresco por polling.",
    "usaSesion": true,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "config",
        "tipo": "DocumentsRecordsConfig",
        "porDefecto": null,
        "requerida": true,
        "descripcion": null
      },
      {
        "nombre": "loading",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "documentsQueryChange",
        "tipo": "DocumentsQuery",
        "descripcion": "Consulta remota de la pestaña Documentos (solo si la config declara `serverQuery`): se emite al confirmar la búsqueda (Enter/lupa), al cambiar de página y al cambiar el tamaño de página. El padre la resuelve contra el backend y devuelve `documentRows` ya filtrados y paginados."
      },
      {
        "nombre": "recordsQueryChange",
        "tipo": "DocumentsQuery",
        "descripcion": "Igual que `documentsQueryChange`, para la pestaña Registros (`serverRecordsQuery`)."
      },
      {
        "nombre": "tabChange",
        "tipo": "'documents' | 'records'",
        "descripcion": null
      }
    ],
    "usar": "- Como pantalla principal de cada proceso: plan de cuentas, asiento de ajuste, catálogo de ajuste, catálogo de\n  eventos, eventos contables, contabilización y apertura contable (por entidad y anual).\n- Cuando el creador verifica o el aprobador aprueba varias solicitudes a la vez: el botón, el modal y el snackbar\n  salen del rol, sin código en el padre.\n- Con `modoConsulta` en procesos de solo consulta (contabilización, apertura anual) y con `serverQuery` /\n  `serverRecordsQuery` cuando el backend busca y pagina (plan de cuentas, asiento de ajuste, catálogos, apertura).",
    "evitar": "- Para «Consultas y reportes» con búsqueda por criterios: usar `siaf-page-shell` con `siaf-page-header`.\n- Para ver o editar una solicitud: usar `siaf-solicitude-page-layout`.\n- Rearmar una bandeja con `siaf-table-controls`, `siaf-documents-records-table` y `siaf-pagination` sueltos, o\n  duplicar las reglas de rol: declarar otro `DocumentsRecordsConfig`.\n- Para la Bandeja de Documentos del shell (Recibidos, Enviados, Borradores, Papelera): es `siaf-tray-documents-view`.",
    "teclado": "- **Tab**: recorre el breadcrumb, «Crear documento», las pestañas, el buscador y sus menús, los filtros, «Agregar\n  filtro», la barra de la grilla, la tabla y la paginación; cada control sigue su componente.\n- **Flechas izquierda / derecha, Inicio y Fin**: cambian entre Documentos y Registros (`siaf-tabs`).\n- **Enter** en el buscador: aplica la búsqueda (con búsqueda en el servidor, recién ahí consulta).\n- **Enter / Espacio** en un chip de filtro personalizado: lo abre para editarlo; en su X, lo quita.\n- **Escape**: cierra el popover «Crear documento» o el filtro personalizado y el foco vuelve a su botón; salir del\n  popover con Tab también lo cierra. Las capas transparentes que cierran al pulsar fuera no son paradas de Tab.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: el título del proceso es el `h1` y «Documentos existentes» / «Registros\n  existentes», el `h2` de la grilla; el breadcrumb es un `nav` y la página vive dentro del `main` del shell.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: las pestañas no apuntan a un `role=\"tabpanel\"` (la grilla no lo\n  declara), y la X que quita un filtro personalizado es un `span` `role=\"button\"` dentro de otro `<button>`: un\n  control anidado en un botón puede no anunciarse.\n- **Pendiente · 2.5.3 Etiqueta en el nombre (A)**: cada chip de filtro personalizado se llama «Filtro personalizado\n  aplicado» y su texto visible («Campo: valor») no forma parte del nombre.\n- **2.4.3 Orden del foco (A)**: el popover «Crear documento» y el filtro personalizado reciben el foco al abrirse,\n  cierran con Escape y lo devuelven a su botón (`siafFoco`).\n- **Pendiente · 2.4.11 Foco no oculto (AA)**: en escritorio la cabecera (breadcrumb, título y pestañas) queda fija\n  bajo el navbar y no hay `scroll-padding`: al volver con Shift + Tab, un control de la grilla puede quedar tapado.\n- **4.1.3 Mensajes de estado (AA)**: la carga de la grilla se anuncia con `siaf-table-skeleton` (`role=\"status\"`) y\n  el resultado de verificar o aprobar en lote con `siaf-snackbar` (`role=\"status\"`; `role=\"alert\"` si falla).\n- **2.4.7 Foco visible (AA)**: los chips de filtro personalizado y «Agregar filtro» no tienen estilo propio ni\n  `outline-none`: queda el anillo nativo; el resto sigue su componente.\n- **1.4.3 Contraste mínimo (AA)**: `h1` y `h2` en `text-text` (16.29:1 / 16.53:1) y el subtítulo en\n  `text-text-muted` (5.01:1 / 8.86:1) sobre `bg-surface`.",
    "figma": [],
    "aria": {
      "roles": [
        "button"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-lowest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "bottom-siaf-lg",
          "p-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "inset-x-siaf-md",
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "pt-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "pb-siaf-xs",
          "px-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-account-history-panel",
      "siaf-asiento-history-panel",
      "siaf-breadcrumb",
      "siaf-button",
      "siaf-column-visibility-panel",
      "siaf-create-document",
      "siaf-custom-filter",
      "siaf-document-history-panel",
      "siaf-documents-records-table",
      "siaf-filter-pill",
      "siaf-icon",
      "siaf-icon-dropdown-menu",
      "siaf-modal",
      "siaf-pagination",
      "siaf-records-search-toolbar",
      "siaf-records-tabs",
      "siaf-snackbar",
      "siaf-table-controls",
      "siaf-table-skeleton"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-documents-records-table",
    "clase": "DocumentsRecordsTableComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/documents-records-table/documents-records-table.component",
    "archivo": "src/app/shared/ui/documents-records-table/documents-records-table.component.ts",
    "descripcion": "Tabla de las pestañas Documentos / Registros: columnas configurables, celdas por tipo\n(enlace al documento, tag de flujo, tag de registro), checkbox de selección y botón de historial.\n\nEs la tabla interna de `siaf-documents-records-page`; para una grilla nueva compón la grilla\nestándar (`siaf-table-controls` arriba + `siaf-pagination Bottom` abajo) alrededor de ella.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "activeTab",
        "tipo": "'documents' | 'records'",
        "porDefecto": "'documents'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "columns",
        "tipo": "DocumentsRecordsColumn[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "documentRoute",
        "tipo": "(row: DocumentsRecordsRow) => string",
        "porDefecto": "() => ''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "minWidthClass",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "recordTrackKey",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rows",
        "tipo": "DocumentsRecordsRow[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "selectionDisabled",
        "tipo": "(row: DocumentsRecordsRow) => boolean",
        "porDefecto": "() => false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "historyOpened",
        "tipo": "DocumentsRecordsRow",
        "descripcion": null
      },
      {
        "nombre": "selectionChanged",
        "tipo": "DocumentsRecordsSelectionChange",
        "descripcion": null
      }
    ],
    "usar": "- En las pestañas Documentos / Registros de `siaf-documents-records-page` (plan de cuentas, asiento de ajuste,\n  catálogo de ajuste, catálogos de eventos, apertura contable y contabilización).\n- Cuando las columnas vienen de configuración (`DocumentsRecordsColumn` con `kind`, `align` y `widthClass`) y el\n  panel de columnas decide cuáles se ven.\n- Con `selectionDisabled` para dejar marcables solo los documentos de la acción masiva: Elaborados para el creador\n  (Verificar) y Verificados para el aprobador (Aprobar).",
    "evitar": "- Para un listado de solo lectura con texto plano: `siaf-table`.\n- Usarla sola, sin barra ni paginado: va dentro de la grilla estándar (`siaf-table-controls` arriba, con el\n  seleccionar todo, y `siaf-pagination` con `position=\"Bottom\"` y `rowPage` abajo).\n- Mientras llegan las filas: `siaf-table-skeleton` con las mismas columnas y `minWidthClass`, no la tabla vacía.\n- Copiar su marcado en otra pantalla: `siaf-tray-documents-view` todavía tiene una tabla parecida hecha a mano.",
    "teclado": "- **Tab**: recorre, fila por fila, el checkbox (solo en Documentos), el enlace al documento y el botón de historial;\n  un checkbox deshabilitado queda fuera.\n- **Espacio**: marca o desmarca el checkbox de la fila (emite `selectionChanged`).\n- **Enter**: en el enlace, abre el documento (`routerLink`).\n- **Enter / Espacio**: en el botón de historial, emiten `historyOpened`.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: `<table>` con `<thead>` y un `<th>` por columna (sin `scope`, que con una\n  sola fila de cabecera no hace falta); las columnas del checkbox y del historial tienen el `<th>` vacío. No ordena\n  columnas, así que no aplica `aria-sort`.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el checkbox de cada fila no tiene nombre (ni `aria-label` ni\n  `<label>`). El botón de historial sí lleva `aria-label`, pero en Registros dice siempre «Ver historial de cuenta\n  contable», también en los asientos de ajuste.\n- **Pendiente · 2.1.1 Teclado (A)**: la fila no es clicable y sus acciones son nativas, pero el texto completo de\n  las cabeceras y celdas cortadas solo sale con `siafTooltip` al pasar el mouse: esas celdas no reciben foco (el\n  enlace sí lo muestra al enfocarlo).\n- **1.4.13 Contenido en hover o foco (AA)**: ese tooltip se cierra con Escape y se puede recorrer con el puntero.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: el enlace va en `text-neutral-high` (16.29:1 / 16.53:1) y «Nuevo» en\n  blanco sobre `bg-brand-primary` (8.79:1 / 6.67:1), pero la etiqueta Observado de `siaf-flow-status-tag` (también\n  Pendiente y Fallido) da 3.39:1 en claro, y el enlace en hover (`text-brand-primary`) pinta en oscuro con\n  `bg-brand-primary` (2.66:1 sobre la superficie).\n- **1.4.1 Uso del color (A)**: los estados llevan su nombre en la etiqueta y «Nuevo» es texto.\n- **2.4.7 Foco visible (AA)**: sin estilo propio: enlace, checkbox y botón muestran el anillo nativo del navegador.\n- **2.5.8 Tamaño del objetivo (AA)**: botón de historial de 32 px; el checkbox mide 16 px, pero cumple por\n  espaciado (celda de 40 × 58 px).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-high",
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "px-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-l-siaf-sm",
          "rounded-r-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-flow-status-tag",
      "siaf-icon",
      "siaf-record-status-tag"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-donut-chart",
    "clase": "DonutChartComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/donut-chart/donut-chart.component",
    "archivo": "src/app/shared/ui/donut-chart/donut-chart.component.ts",
    "descripcion": "Gráfico de dona del kit (Figma UI KIT, página «Graphics»: «Progress» y su pieza «.a.progress»), dibujado con\nChart.js: un anillo de 150 px con las partes de un total, cada una con su color y su nombre en la leyenda. Al pasar el\npuntero sobre un tramo, o al llegar a él con el teclado, el tramo se engrosa con las puntas redondeadas y el centro\nmuestra su nombre y su porcentaje del total. Los colores siguen el orden del Figma: primario, éxito y advertencia, y\nel secundario al final (`TOKENS_DONA`).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Gráfico de dona'",
        "requerida": false,
        "descripcion": "Nombre accesible del gráfico y título de su tabla de datos."
      },
      {
        "nombre": "categories",
        "tipo": "readonly string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Nombres de las partes, en el orden de la leyenda y del anillo (sentido horario desde arriba)."
      },
      {
        "nombre": "categoryLabel",
        "tipo": "string",
        "porDefecto": "'Categoría'",
        "requerida": false,
        "descripcion": "Encabezado de la columna de las partes en la tabla de datos."
      },
      {
        "nombre": "height",
        "tipo": "number",
        "porDefecto": "252",
        "requerida": false,
        "descripcion": "Alto del área del gráfico en px (sin la leyenda)."
      },
      {
        "nombre": "valueLabel",
        "tipo": "string",
        "porDefecto": "'Valor'",
        "requerida": false,
        "descripcion": "Encabezado de la columna de los valores en la tabla de datos."
      },
      {
        "nombre": "values",
        "tipo": "readonly number[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Un valor por parte, en el mismo orden que `categories`; los negativos o vacíos no dibujan tramo."
      },
      {
        "nombre": "valueSuffix",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Sufijo de los valores en la tabla de datos y el anuncio (por ejemplo `%`)."
      }
    ],
    "eventos": [],
    "usar": "- Para ver cómo se reparte un total entre pocas partes: activos, patrimonio y pasivos de un balance.\n- Dentro de `siaf-chart-section`, que le pone título y descripción.\n- `valueSuffix` cuando los valores llevan unidad en la tabla de datos; el centro siempre muestra el porcentaje.",
    "evitar": "- Para un avance de 0 a 100 %: usar `siaf-progress-circular`.\n- Para comparar cantidades entre categorías: usar `siaf-bar-chart`.\n- Para la composición de un total en una barra, con el porcentaje de cada parte a la vista: usar `siaf-bar-chart` con\n  `stacked` y una sola categoría.\n- Con más de cuatro partes: la paleta da la vuelta y los colores se repiten.",
    "teclado": "- **Tab**: enfoca el gráfico (una sola parada).\n- **Flecha derecha / izquierda**: recorren los tramos y muestran al centro el nombre y el porcentaje de cada uno; dan la\n  vuelta.\n- **Inicio / Fin**: van al primer o al último tramo.\n- **Escape**: oculta el centro; salir del gráfico también lo oculta.",
    "accesibilidad": "- **1.1.1 Contenido no textual (A)**: el lienzo es `role=\"img\"` con `ariaLabel` y, además, hay una tabla de datos\n  oculta (`sr-only`) con el valor y el porcentaje de cada parte.\n- **1.3.1 Información y relaciones (A)**: la tabla usa `caption`, `th scope=\"col\"` y `th scope=\"row\"` para cada parte.\n- **2.1.1 Teclado (A)**: los tramos se recorren con las flechas; al moverse, una región `aria-live` anuncia la parte, su\n  porcentaje y su valor.\n- **2.4.7 Foco visible (AA)**: el lienzo enfocado muestra el contorno de 2 px `border-states-focus`.\n- **1.4.1 Uso del color (A)**: las partes se distinguen por color, pero sus nombres están en la leyenda, en el centro y\n  en la tabla de datos.\n- **1.4.3 Contraste mínimo (AA)**: el centro va en `text-neutral-medium` sobre la superficie.\n- **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el centro sin mover el puntero ni el foco.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro los tramos primario (`bg-brand-primary`, 2.66:1) y\n  secundario (`bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie; la paleta oscura de los gráficos está\n  por definir con diseño.",
    "figma": [
      {
        "nodo": "22743:343",
        "nombre": "Progress"
      },
      {
        "nodo": "22743:245",
        "nombre": ".a.progress"
      }
    ],
    "aria": {
      "roles": [
        "img"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "pt-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-chart-legend"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-empty-state",
    "clase": "EmptyStateComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/empty-state/empty-state.component",
    "archivo": "src/app/shared/ui/empty-state/empty-state.component.ts",
    "descripcion": "Estado vacío ilustrado para pantallas de consulta, reportes y\nlistados. Centra una ilustración + título + descripción y, opcional,\nun CTA primario.\n\nNo confundir con `empty-section` (shared/ui/empty-section), que es\nun placeholder de SECCIÓN dentro de un formulario.\n\nEjemplo:\n\n  <siaf-empty-state\n    illustration=\"no-results\"\n    title=\"Aún no se encontraron resultados\"\n    description=\"Ingrese los criterios de búsqueda para visualizar la información disponible.\"\n  />",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "actionDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "actionIcon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "actionLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "illustration",
        "tipo": "'no-results' | 'no-data' | 'no-selection' | 'no-records'",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "actionClicked",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- En las pantallas de Consultas y reportes antes de la primera búsqueda: «Aún no se encontraron resultados»\n  (Plan de Cuentas, Asiento de ajuste, Catálogo de tipos de asiento, Contabilización, Libros contables).\n- Cuando un listado no tiene registros (`illustration=\"no-data\"`) o falta elegir un registro para ver su\n  detalle (`no-selection`).\n- `illustration=\"no-records\"` (la hoja con casillas «Sin registros», exportada del Figma) en la plantilla\n  `siaf-query-report-page`, la nueva versión de Consultas y reportes.\n- Con `actionLabel` cuando hay una acción directa para salir del vacío.",
    "evitar": "- Para una sección de formulario sin valor elegido: usar `empty-section`.\n- Para una nota breve dentro de una tarjeta: usar `message-box`.\n- Mientras los datos cargan: usar `siaf-table-skeleton` o `siaf-loader`.\n- Para un error al cargar: usar `siaf-alert` con `tone=\"error\"`.",
    "teclado": "- **Tab**: con `actionLabel`, enfoca el botón de acción (deshabilitado no recibe el foco); sin él, no hay nada\n  que enfocar.\n- **Enter / Espacio**: el botón emite `actionClicked` (sigue `siaf-button`).",
    "accesibilidad": "- **1.1.1 Contenido no textual (A)**: la ilustración SVG va con `aria-hidden`; el mensaje está en el título y la\n  descripción.\n- **1.3.1 Información y relaciones (A)**: el título es un `<h2>` de nivel fijo, que encaja bajo el `<h1>` de\n  `siaf-page-header` en las consultas; la descripción es un párrafo.\n- **4.1.3 Mensajes de estado (AA)**: el bloque es `aria-live=\"polite\"` y anuncia los cambios de título o\n  descripción; si el padre lo inserta ya lleno con un bloque if, no todos los lectores lo anuncian.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` 16.29:1 (16.53:1 en oscuro) y descripción\n  `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.\n- **4.1.2 Nombre, función y valor (A)**: el botón de acción es un `siaf-button` con `ariaLabel` igual a su texto\n  visible (`actionLabel`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "gap-siaf-xl",
          "py-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "mt-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-button"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-expansion-panel",
    "clase": "ExpansionPanelComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/expansion-panel/expansion-panel.component",
    "archivo": "src/app/shared/ui/expansion-panel/expansion-panel.component.ts",
    "descripcion": "Panel expandible de una sola sección (Figma UI KIT, nodo 9214:5839 «Expansion panels»): tarjeta con borde,\ncabecera con la flecha, el título y un menú ⋮ opcional, y el contenido proyectado debajo al expandir.\n\nSe apilan varios para armar un acordeón con contenido libre. `[(expanded)]` controla si está abierto; el\nmenú aparece solo con `actions` (reusa `siaf-icon-dropdown-menu`) y emite `action` con el valor elegido.\nPara una lista de preguntas de solo texto va `siaf-accordion`; con marca lateral y X, `siaf-collapsible-card`.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "actions",
        "tipo": "IconDropdownMenuItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Opciones del menú ⋮. Sin opciones no se muestra el botón."
      },
      {
        "nombre": "expanded",
        "tipo": "boolean",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "menuWidth",
        "tipo": "number",
        "porDefecto": "200",
        "requerida": false,
        "descripcion": "Ancho del menú ⋮ en px."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "action",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "expandedChange",
        "tipo": "boolean",
        "descripcion": null
      }
    ],
    "usar": "- Bloques repetibles con contenido rico que el usuario pliega: cada asiento contable del formulario de eventos\n  contables, con su grilla de cuentas adentro.\n- Cuando cada bloque necesita acciones propias en el menú ⋮ (por ejemplo, «Eliminar asiento») mediante `actions`.\n- Secciones largas de consulta que conviene plegar, como la paleta tonal en los fundamentos de `/ui-kit`.",
    "evitar": "- Para preguntas frecuentes de solo texto: usar `siaf-accordion`.\n- Para ítems de una selección con marca lateral que se quitan con X: usar `siaf-collapsible-card`.\n- Para secciones obligatorias de la solicitud que siempre deben verse: usar `siaf-solicitude-form-card` sin plegar.\n- Para un menú de acciones sin contenido plegable: usar `siaf-icon-dropdown-menu` directamente.",
    "teclado": "- **Tab**: pasa por la flecha, el menú ⋮ (si hay `actions`) y después por el contenido abierto.\n- **Enter / Espacio** en la flecha: abren o cierran el panel y emiten `expandedChange`.\n- El título también abre y cierra con clic, pero no recibe foco: con teclado se usa la flecha. El menú ⋮ sigue\n  `siaf-icon-dropdown-menu`; si una acción quita el panel, el padre debe mover el foco.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: la flecha es un `button` con `aria-expanded`, `aria-controls` hacia el\n  contenido y nombre «Expandir …» / «Contraer …» con el `title`; el ⋮ se llama «Más opciones de …».\n- **1.3.1 Información y relaciones (A)**: el título es un `h3` y el contenido abierto un `role=\"region\"` rotulado\n  por él; el padre debe ubicar el panel donde un `h3` respete la jerarquía.\n- **2.1.1 Teclado (A)**: el clic en el título tiene su equivalente en la flecha, que es un botón nativo.\n- **1.4.1 Uso del color (A)**: abierto o cerrado se distingue por la flecha, no por color.\n- **1.4.3 Contraste mínimo (AA)**: título y contenido en `text-neutral-medium` sobre la superficie, 14.53:1 (oscuro\n  12.87:1).\n- **2.4.7 Foco visible (AA)**: la flecha muestra un contorno de 2 px `border-states-focus` separado 2 px.\n- **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /\n  10.15:1 oscuro sobre la superficie).\n- **2.5.8 Tamaño del objetivo (AA)**: flecha y ⋮ miden 40 × 40 px.",
    "figma": [
      {
        "nodo": "9214:5839",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "region"
      ],
      "atributos": [
        "aria-controls",
        "aria-expanded",
        "aria-label",
        "aria-labelledby"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "px-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-icon",
      "siaf-icon-dropdown-menu"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-filter-pill",
    "clase": "FilterPillComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/filter-pill/filter-pill.component",
    "archivo": "src/app/shared/components/filter-pill/filter-pill.component.ts",
    "descripcion": "Píldora dropdown de filtro, dibujada con `siaf-tag` en variante `filter` (Figma «Filter tags»), con dos estados:\n\n1. **Sin valor** — tag sin elegir con `Label ▾`. Al pulsarlo abre el menú.\n2. **Con valor** — tag elegido con `✓ Label: valor ✕`. La × limpia; pulsar el tag vuelve a abrir el menú.\n\nLa × es un botón al lado del tag, dentro del mismo borde (no un control dentro del botón).\n\nReemplaza el patrón inline repetido 4 veces en\n`siaf-documents-records-page` (filtros Estado, Tipo de acción,\nEs imputable, Naturaleza) y es el que vamos a usar en las\npróximas pantallas de \"Consultas y reportes …\".\n\nLas opciones se muestran con `siaf-menu` compact (220 px). Abierto con el\nteclado, el foco entra en la primera opción; Escape o pulsar fuera cierra.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Etiqueta visible en el chip (p.ej. \"Estado\")."
      },
      {
        "nombre": "options",
        "tipo": "readonly (string | FilterPillOption)[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Opciones del menú. Puede ser string[] (label === value) u objetos FilterPillOption con label y value distintos."
      },
      {
        "nombre": "selectedValue",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Valor actualmente seleccionado (string vacío = sin selección)."
      }
    ],
    "eventos": [
      {
        "nombre": "selectedValueChange",
        "tipo": "string",
        "descripcion": "Emite el nuevo valor seleccionado, o '' al limpiar."
      }
    ],
    "usar": "- Para filtros rápidos de un campo con pocas opciones sobre una grilla: Estado y Tipo de acción en la bandeja y en\n  la pestaña Documentos, y los filtros que configura cada módulo en Registros.\n- En los resultados de Consultas y reportes: Naturaleza y Es imputable (plan de cuentas), Tipo de acción (asiento\n  de ajuste), Estados y Vigencia (catálogo de tipos de asiento).\n- Cuando el valor elegido debe verse en la propia píldora («Estado: Aprobado») y limpiarse con su ×.",
    "evitar": "- Para condiciones compuestas (campo, condición y valor): `siaf-custom-filter`.\n- Para elegir varias opciones a la vez: la píldora guarda un solo valor; usar `siaf-input` con\n  `type=\"select-multiple\"`.\n- Como campo de formulario con etiqueta y error: `siaf-input` con `type=\"select\"`.",
    "teclado": "- **Tab**: enfoca la píldora; con un valor elegido, también su × («Quitar filtro …»).\n- **Enter / Espacio**: abren o cierran el menú; al abrir, el foco pasa a la primera opción. Sobre la ×, limpian\n  el filtro y el foco queda en la píldora.\n- **Escape**: cierra el menú y el foco vuelve a la píldora; salir del menú con Tab también lo cierra. Dentro del\n  menú, flechas, Inicio, Fin, Enter y Espacio siguen `siaf-menu`.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: el tag es un `<button>` con `aria-haspopup=\"menu\"` y `aria-expanded`, con y\n  sin valor, y el menú toma `label` como nombre; con valor, la × es otro `<button>` a su lado, «Quitar filtro …».\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en la primera opción (con o sin valor) y al\n  elegir, limpiar, cerrar con Escape o salir con Tab vuelve a la píldora.\n- **1.4.1 Uso del color (A)**: con valor no depende del color: suma el ícono check y el texto «Etiqueta: valor».\n- **1.4.3 Contraste mínimo (AA)**: sin valor, `text-neutral-medium` sobre la superficie (14.53:1 / 12.87:1); con\n  valor, `text-neutral-activated` sobre la capa `bg-states-light-selected` (7.69:1 / 17.15:1).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde sin valor es `border-states-enabled` (2.44:1 / 2.59:1)\n  y el borde con valor, `border-states-active`, baja a 2.02:1 en oscuro.\n- **2.4.7 Foco visible (AA)**: el tag y la × muestran el anillo del kit de `siaf-tag` (2 px `border-states-focus`);\n  las opciones, el contorno interior azul de `siaf-menu`.\n- **Pendiente · 2.5.8 Tamaño del objetivo (AA)**: la píldora mide 32 px de alto, pero la × mide 20 × 20 px, pegada\n  al botón del tag, sin el espacio libre que pide la excepción.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden"
      ]
    },
    "tokens": [],
    "usa": [
      "[siafFoco]",
      "siaf-menu",
      "siaf-tag"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-flow-status-tag",
    "clase": "FlowStatusTagComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/flow-status-tag/flow-status-tag.component",
    "archivo": "src/app/shared/ui/flow-status-tag/flow-status-tag.component.ts",
    "descripcion": "Etiqueta del estado de flujo de un documento (Elaborado, Verificado, Observado, Anulado…), con el estilo `solid` de\n`siaf-status-tag`: fondo oscuro del tono y texto blanco. El tono de cada estado es el del Figma «flow tags»: gris para\nElaborado y Registrado; azul para Verificado, Validado, Revisado, Generado y En proceso; verde para Autorizado,\nFirmado, Aprobado, Aceptado, Publicado y Procesado; amarillo para Observado, Pendiente y Fallido; y rojo para\nEliminado, Rechazado y Anulado.\n\nJunto con `siaf-record-status-tag` son las etiquetas de estado del proyecto: el mapa de estado a tono vive aquí.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "size",
        "tipo": "'standard' | 'small'",
        "porDefecto": "'small'",
        "requerida": false,
        "descripcion": "`small` (24 px) o `standard` (32 px)."
      },
      {
        "nombre": "status",
        "tipo": "FlowStatus",
        "porDefecto": "'Elaborado'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- En la columna de estado de la bandeja (`siaf-tray-documents-view`) y de `siaf-documents-records-table`.\n- En el resumen de una solicitud (`siaf-document-summary-card`) y en cada fila del historial del documento\n  (`siaf-document-history-panel`).\n- `small` (24 px, el valor por defecto) en tablas y resúmenes, que es lo que usan todas las pantallas; `standard`\n  (32 px) sola, junto a un título.",
    "evitar": "- Para el estado de un registro (Activo, Inactivo, Abierto, Cerrado): usar `siaf-record-status-tag`.\n- Para otros estados con los tonos del Figma: usar `siaf-status-tag` directo.\n- Para categorías, filtros o marcas libres: usar `siaf-tag`; para contadores, `siaf-badge`.\n- Pintar a mano un `<span>` con el color del estado: el mapa de estado a tono vive aquí.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.4.1 Uso del color (A)**: el estado va escrito; el color solo lo refuerza y varios estados comparten tono.\n- **1.4.3 Contraste mínimo (AA)**: texto blanco de 12 px sobre el fondo del tono, en claro: 12.24:1 en gris, 5.82:1\n  en azul, 4.71:1 en verde y 7.13:1 en rojo. En oscuro, con los tonos oscuros de `--sys-color-bg-status-solid-*`,\n  cumplen los cinco (de 5.31:1 en amarillo a 7.97:1 en gris).\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: en claro, en amarillo (Observado, Pendiente y Fallido) el blanco sobre\n  `bg-status-solid-warning` da 3.39:1; es el color del Figma, a revisar con diseño.\n- **1.3.1 Información y relaciones (A)**: es un `<span>` con el nombre del estado; el contexto lo da el padre\n  (cabecera de la columna o etiqueta del resumen).\n- **4.1.3 Mensajes de estado (AA)**: no es región viva: el cambio de estado tras verificar o aprobar no lo\n  anuncia la etiqueta, sino el `siaf-snackbar` de confirmación.",
    "figma": [
      {
        "nodo": "2576:10069",
        "nombre": "flow tags"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [],
    "usa": [
      "siaf-status-tag"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-form-table-search",
    "clase": "FormTableSearchComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/form-table-search/form-table-search.component",
    "archivo": "src/app/shared/components/form-table-search/form-table-search.component.ts",
    "descripcion": "Buscador de tabla: un `siaf-input` con lupa a todo el ancho y, a la derecha, dos botones de ícono: Filtrar y Más\nopciones, que emiten `filter` y `more`.\n\nCon `variant=\"reports\"` es el buscador de Consultas y reportes (Figma «Guía de Estructura de Pantallas», nodo\n22402:16457 «Search for table»): el segundo botón pasa a ser Columnas (`view_column`), que emite `columns`.\n\nEscribir solo registra el texto: la búsqueda sale por `valueChange` al pulsar Enter o la lupa, y lo tecleado se\ndescarta si el padre reescribe `value`.\n\nTiene además otra variante, como componente aparte, para Documentos y registros y la Bandeja de Documentos:\n`siaf-records-search-toolbar`, el mismo campo con las acciones de la derecha proyectadas (los menús Campos, Favorito\ny Más opciones) en vez de estos dos botones fijos.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Buscar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "columnsLabel",
        "tipo": "string",
        "porDefecto": "'Ocultar o mostrar columnas'",
        "requerida": false,
        "descripcion": "Nombre accesible del botón Columnas de la variante `reports`."
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "filterLabel",
        "tipo": "string",
        "porDefecto": "'Filtrar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "moreLabel",
        "tipo": "string",
        "porDefecto": "'Mas opciones'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "placeholder",
        "tipo": "string",
        "porDefecto": "'Buscar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'default' | 'reports'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": "`default`: Filtrar y Más opciones. `reports`: el de Consultas y reportes, con Filtrar y Columnas."
      }
    ],
    "eventos": [
      {
        "nombre": "columns",
        "tipo": "void",
        "descripcion": "Botón Columnas de la variante `reports`."
      },
      {
        "nombre": "filter",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "more",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "valueChange",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Sobre las tablas de las solicitudes (cuentas contables, tipos de asiento, clases de ajuste, asiento de ajuste,\n  eventos contables) y en el panel lateral de selección (`siaf-selection-side-nav`).\n- Con `variant=\"reports\"` en Consultas y reportes: Plan de cuentas, Asiento de ajuste, Tipos de asiento, Pedidos de\n  contabilización y Libros contables.\n- En el detalle de Contabilización y en los listados de Admin (usuarios, entidades, unidades y correlativos).\n- En Apertura contable: cuentas contables del detalle anual, aperturas mensuales de la configuración e historial de\n  la configuración.\n- Cuando la búsqueda debe confirmarse con Enter o la lupa y no a cada tecla (búsqueda en servidor o muchas filas).",
    "evitar": "- En las pestañas Documentos / Registros y en la Bandeja de Documentos, con menús a la derecha:\n  `siaf-records-search-toolbar`, que los proyecta.\n- Esperar que los botones hagan algo por sí solos: emiten `filter`, `more` y `columns`, y si la pantalla no los escucha\n  se pintan y no hacen nada (hoy ninguna consulta escucha Filtrar ni Columnas).\n- Para filtrar por opciones cerradas o por condiciones: `siaf-filter-pill` o `siaf-custom-filter` junto al buscador.",
    "teclado": "- **Tab**: recorre el campo, la lupa, Filtrar y Más opciones (o Columnas); con `disabled` quedan todos fuera.\n- **Enter**: en el campo, confirma la búsqueda y emite `valueChange` con lo escrito; escribir no busca.\n- **Enter / Espacio**: en la lupa confirman igual; en Filtrar, Más opciones y Columnas emiten `filter`, `more` y\n  `columns`.",
    "accesibilidad": "- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el input `ariaLabel` no se usa en la plantilla; el nombre del\n  campo sale de `placeholder` («Buscar» por defecto), así que «Buscar cuentas contables» o «Buscar en pedidos» no\n  llegan al lector. Los botones sí llevan `filterLabel` («Filtrar»), `moreLabel` («Mas opciones», sin tilde) y\n  `columnsLabel` («Ocultar o mostrar columnas»).\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: ni el buscador ni la grilla anuncian el resultado; la pantalla debe\n  anunciar el total (p. ej. con `role=\"status\"`).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo sin foco es `border-states-enabled` (2.44:1 /\n  2.59:1). El anillo de foco de la lupa y de los botones ya es el azul del kit (`border-states-focus`, 5.35:1 /\n  10.15:1) y los íconos cumplen (`text-neutral-high`; la lupa, `text-neutral-medium`).\n- **2.4.7 Foco visible (AA)**: el campo pasa a un borde de 2 px `border-states-focus` (5.35:1 / 10.15:1); la lupa y\n  los botones muestran un anillo de 2 px separado 2 px.\n- **2.5.8 Tamaño del objetivo (AA)**: Filtrar, Más opciones y Columnas miden 40 px; la lupa, 24 px.",
    "figma": [
      {
        "nodo": "22402:16457",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon",
      "siaf-input"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-icon",
    "clase": "IconComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/icon/icon.component",
    "archivo": "src/app/shared/ui/icon/icon.component.ts",
    "descripcion": "Icono de Material Icons por nombre, con tamaño en px, variante de familia y alias para\nnombres que no existen en la fuente; decorativo por defecto (`aria-hidden`).\n\nEs la única forma de pintar iconos en el design system: úsalo en vez de escribir a mano\nun `<span class=\"material-icons\">` o de incrustar SVG sueltos.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "decorative",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "name",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": true,
        "descripcion": null
      },
      {
        "nombre": "size",
        "tipo": "number",
        "porDefecto": "20",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'filled' | 'outlined' | 'round' | 'sharp' | 'two-tone'",
        "porDefecto": "'outlined'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para todo ícono de la app: dentro de `siaf-button` (`icon`), en las opciones de `siaf-menu`, la casa y las flechas\n  de `siaf-breadcrumb` o el `info` de ayuda de las consultas.\n- Decorativo (por defecto) cuando acompaña un texto que ya dice lo mismo, como el `add` de «Crear documento».\n- Con `label` y `[decorative]=\"false\"` solo si el ícono comunica algo que no dice ningún texto cercano, como el ícono\n  de un campo de `siaf-summary-card` (`iconLabel`).\n- `size` en px para igualar el Figma (24 en botones, 20 en menús compactos) y `variant` de la familia\n  (`outlined` por defecto).",
    "evitar": "- Un `<span class=\"material-icons\">` escrito a mano o un SVG suelto: usar siempre `siaf-icon`.\n- Nombres que no existen en `material-icons` (inventados o solo de Material Symbols): se pintan como texto;\n  `npm run icons:check` los detecta en CI.\n- Como botón con clic propio: no recibe foco ni responde al teclado; usar `siaf-button` con `iconOnly` y `ariaLabel`.\n- Para checkbox o radio: van con el `<input>` nativo del kit, no con íconos.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **Pendiente · 1.1.1 Contenido no textual (A)**: es decorativo por defecto (`aria-hidden=\"true\"`), lo correcto\n  junto a un texto. Con `[decorative]=\"false\"` el `<span>` recibe `aria-label` con `label`, pero no `role=\"img\"`, y\n  ARIA no admite nombrar un elemento genérico: un lector puede ignorarlo y leer el nombre de la ligadura (p. ej.\n  «close»). Sin `label`, ese nombre es lo único que hay.\n- **1.4.1 Uso del color (A)**: toma el color del texto del padre; si marca un estado, el padre debe acompañarlo de\n  texto o de otra forma, no solo del color.\n- **1.4.11 Contraste no textual (AA)**: depende del color del padre; con `icon-states-enabled` (8.70:1 claro /\n  12.87:1 oscuro) o `icon-states-active` (8.79:1 / 10.15:1) sobre la superficie cumple 3:1.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-icon-dropdown-menu",
    "clase": "IconDropdownMenuComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/icon-dropdown-menu/icon-dropdown-menu.component",
    "archivo": "src/app/shared/ui/icon-dropdown-menu/icon-dropdown-menu.component.ts",
    "descripcion": "Botón cuadrado (40×40) con icono que abre un menú flotante. Cubre\nlos 3 patrones idénticos que estaban inline en\n`siaf-documents-records-page`:\n  - \"Campos\" (layers)\n  - \"Favorito\" (star_border)\n  - \"Más opciones\" (more_vert)\n\nTambién sirve para cualquier botón-acción que necesite ofrecer una\nlista corta de comandos (kebab menus de tablas, etc.).\n\nEl panel es `siaf-menu`, compact salvo `density=\"standard\"` (diseño del Figma UI KIT):\neste componente solo pone el botón, lo ancla (`align`), cierra al pulsar\nfuera o con Escape y respeta `closeOnSelect`. Un cambio de diseño del\nmenú se hace en `siaf-menu`. Abierto con el teclado, el foco entra en la\nprimera opción y ↑ ↓ recorren el resto.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "align",
        "tipo": "'left' | 'right'",
        "porDefecto": "'right'",
        "requerida": false,
        "descripcion": "Alineación del menú respecto al botón. Default: 'right'."
      },
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Más opciones'",
        "requerida": false,
        "descripcion": "aria-label del botón (también se usa en aria-labels secundarios)."
      },
      {
        "nombre": "closeOnSelect",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Si true, NO cierra el menú al seleccionar un item (útil para items `hasChildren` donde el padre va a abrir un submenú separado)."
      },
      {
        "nombre": "density",
        "tipo": "'standard' | 'compact'",
        "porDefecto": "'compact'",
        "requerida": false,
        "descripcion": "Densidad del menú: `compact` (32 px por opción, la de las barras de búsqueda) o `standard` (48 px)."
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Deshabilita el botón disparador."
      },
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre del icono Material Symbols."
      },
      {
        "nombre": "items",
        "tipo": "IconDropdownMenuItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Items del menú."
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Texto del disparador: con él, el botón es de contorno (Figma «Buttons» outline, 40 px) con el ícono y el texto, y el texto lo nombra; sin él, es el botón de solo ícono."
      },
      {
        "nombre": "menuWidth",
        "tipo": "number",
        "porDefecto": "248",
        "requerida": false,
        "descripcion": "Ancho del menú flotante en px. Default 248."
      },
      {
        "nombre": "variant",
        "tipo": "'accent' | 'ghost'",
        "porDefecto": "'ghost'",
        "requerida": false,
        "descripcion": "Estilo del botón disparador: 'ghost' (default) o 'accent' (color de marca)."
      }
    ],
    "eventos": [
      {
        "nombre": "selected",
        "tipo": "string",
        "descripcion": "Emite el `value` del item seleccionado (o `label` si no tiene value)."
      }
    ],
    "usar": "- Botones de ícono de la barra de búsqueda de la bandeja (`siaf-documents-records-page`): Campos (`layers`), Favorito\n  (`star_border`) y Más opciones (`more_vert`).\n- Exportar con `variant=\"accent\"` e ícono `file_download` en el encabezado de resultados de las consultas (Plan de\n  Cuentas, Asiento de ajuste, Catálogo de ajuste, Contabilización y Libros contables).\n- Acciones sobre las filas marcadas, proyectado en `siaf-table-controls` con el atributo `tableAction` (Gestor de\n  Usuarios de Admin, descarga de Libros contables), y el menú ⋮ de `siaf-expansion-panel`.\n- Con `label` cuando el Figma pide un botón con texto que abre el menú: «Exportar» (Excel, CSV y PDF) del resultado de\n  `siaf-query-report-page`, con `density=\"standard\"` como su menú «Opciones de tabla» (nodo 22402:16485).",
    "evitar": "- Para una sola acción: usar `siaf-button` con `iconOnly` y `ariaLabel`, sin menú.\n- Con opciones en dos niveles: usar `siaf-cascading-menu`.\n- Para filtrar por un valor que debe quedar a la vista: usar `siaf-filter-pill`.\n- Un botón de ícono con una lista flotante hecha a mano: este componente ya da `aria-expanded`, Escape y el cierre al\n  pulsar fuera, y dibuja el panel con `siaf-menu`.",
    "teclado": "- **Tab**: enfoca el botón.\n- **Enter / Espacio**: abren o cierran el menú; al abrir, el foco entra en la primera opción habilitada.\n- **Flecha arriba / abajo** e **Inicio / Fin**: recorren las opciones (de `siaf-menu`).\n- **Enter / Espacio** sobre una opción: la eligen y cierran el menú, salvo con `closeOnSelect=false`.\n- **Escape**: cierra el menú y el foco vuelve al botón.\n- **Tab** desde el menú: lo cierra y el foco sigue al control siguiente.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: el disparador es un `<button>` con `aria-label` (por defecto «Más opciones»:\n  el padre debe dar uno propio, como «Exportar resultados»), `aria-haspopup=\"menu\"` y `aria-expanded`; el panel es\n  `siaf-menu` con el mismo nombre. Con `label`, el texto visible nombra el botón y el menú, sin `aria-label`.\n- **2.5.3 Etiqueta en el nombre (A)**: con `label`, el nombre es el mismo texto que se ve.\n- **1.1.1 Contenido no textual (A)**: el ícono del botón es decorativo (`siaf-icon`); el nombre lo da `aria-label`.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en la primera opción y al cerrar (Escape o\n  elegir) vuelve al botón; salir con Tab cierra el menú. La capa que cierra al pulsar fuera no es parada de Tab.\n- **2.4.7 Foco visible (AA)**: el botón tiene contorno de 2 px `bg-brand-accent` en `accent` (4.89:1 claro / 3.14:1\n  oscuro), el anillo del kit `border-states-focus` con `label` y el anillo del navegador en `ghost`; las opciones, el\n  contorno interior azul de `siaf-menu` (`border-states-focus`).\n- **1.4.11 Contraste no textual (AA)**: en `accent`, relleno 4.89:1 / 3.14:1 sobre la superficie e ícono blanco\n  (`text-brand-white` sobre `bg-brand-accent`) 4.89:1 / 5.65:1; en `ghost` el ícono hereda el color del texto del\n  padre.\n- **2.5.8 Tamaño del objetivo (AA)**: botón de 40 px de alto y opciones de 32 px (`compact`) o 48 px (`standard`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-icon",
      "siaf-menu"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-input",
    "clase": "TextFieldComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/text-field/text-field.component",
    "archivo": "src/app/shared/ui/text-field/text-field.component.ts",
    "descripcion": "Input canónico del design system: texto, número, decimal, correo, contraseña y select simple/múltiple,\ncon etiqueta flotante, borde verde de éxito al escribir e integración con formularios reactivos.\n\nUsarlo para TODO campo de formulario y también para los buscadores de la app, ya migrados a él;\npara mostrar un dato de solo lectura, el mismo componente con `[disabled]`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "autocomplete",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "autoSuccess",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Mantiene el borde neutro después de escribir cuando el contexto no representa una validación."
      },
      {
        "nombre": "clearable",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "decimals",
        "tipo": "number",
        "porDefecto": "2",
        "requerida": false,
        "descripcion": "Decimales admitidos cuando `type=\"decimal\"` (importes contables: 2)."
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "error",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "hint",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "leadingIcon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "options",
        "tipo": "TextFieldOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "placeholder",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "required",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "selectAllLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "En `select-multiple`, la lista del Figma «Parámetros de consulta»: una casilla por opción, arriba esta fila para marcar o desmarcar todas, y el valor en una sola línea en vez de chips."
      },
      {
        "nombre": "state",
        "tipo": "'success' | 'error' | 'enabled'",
        "porDefecto": "'enabled'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "trailingButtonLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "trailingIcon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "type",
        "tipo": "'number' | 'text' | 'decimal' | 'email' | 'correo' | 'password' | 'select' | 'select-multiple'",
        "porDefecto": "'text'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string | number | string[]",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "trailingAction",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "valueChange",
        "tipo": "string | number | string[]",
        "descripcion": null
      }
    ],
    "usar": "- Para los campos de una línea de las solicitudes y de Admin: nombre de clase de ajuste, número de documento o\n  correo institucional del usuario.\n- `type=\"select\"` o `select-multiple` para listas cortas y cerradas: tipo de plan contable, tipo de libro y mes,\n  ámbitos institucionales o estados en los paneles de búsqueda.\n- `type=\"decimal\"` para importes, como el importe de cada cuenta del asiento de ajuste; `number` solo para enteros.\n- `select-multiple` con `selectAllLabel=\"Seleccionar todo\"` en los paneles de parámetros de las consultas: casillas,\n  la fila para marcar todas y el valor en una línea.\n- Con `trailingIcon` y `trailingButtonLabel` para una acción dentro del campo: «Buscar» en la bandeja de documentos\n  y en `siaf-records-search-toolbar`, «Mostrar contraseña» en el login.",
    "evitar": "- Para fechas: usar `siaf-date-time-picker`, no `trailingIcon=\"calendar_today\"` (como la vigencia del formulario de\n  cuenta contable).\n- Para textos largos (justificación, glosa, descripción): usar `text-area-control`.\n- Para elegir de un catálogo largo que hay que buscar (los atributos del evento, por ejemplo): usar `empty-section`\n  con `siaf-selection-side-nav`; para un Sí/No, `siaf-radio-group` con `[inline]`.\n- `type=\"number\"` para importes: el campo se vacía al teclear el separador; usar `decimal`.",
    "teclado": "- **Tab**: enfoca el campo o el botón del select; el botón de `trailingIcon` es otra parada.\n- **Texto, número, decimal, correo y contraseña**: el teclado nativo del `<input>`; en `decimal` se descarta lo que\n  no sea dígito o separador (la coma se guarda como punto) y al salir se completan los decimales.\n- **Enter / Espacio** (select): abren o cierran la lista; al abrir, el foco entra en la opción elegida (o en la\n  primera), que siguen `siaf-select-options` (flechas, Inicio y Fin).\n- **Escape** (select): cierra la lista y el foco vuelve al botón del campo; salir de la lista con Tab también la\n  cierra. Con la lista abierta, Escape no cierra el panel que contiene al campo.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: en los tipos de texto el `<label>` envuelve el `<input>`, pero\n  la etiqueta flotante solo existe con foco o valor, y la ayuda y el error, dentro del mismo `<label>`, se suman al\n  nombre en vez de ir por `aria-describedby`. Con `hint` y el campo vacío, la ayuda desplaza al `placeholder` como\n  nombre.\n- **Pendiente · 3.3.1 Identificación de errores (A)**: el error se ve (borde rojo de 2 px, ícono y texto), pero el\n  `<input>` no publica `aria-invalid` y el texto no se anuncia al aparecer; con `state=\"error\"` y sin `error`, el\n  aviso es solo el color del borde.\n- **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: el `<input>` de texto publica `aria-required`, pero en `select`\n  y `select-multiple` el obligatorio es solo el asterisco: el botón no lo publica.\n- **4.1.2 Nombre, función y valor (A)**: el select es un `<button>` con `aria-haspopup=\"listbox\"`, `aria-expanded` y\n  `aria-label` con la etiqueta. El botón de `trailingIcon` se nombra con `trailingButtonLabel`: el padre debe darlo\n  o queda sin nombre.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el `aria-label` del select tapa el valor elegido, que no se\n  anuncia; «Limpiar» y la X de cada chip son `span` con `role=\"button\"` anidados dentro del botón, cuyos hijos son\n  presentacionales.\n- **Pendiente · 2.1.1 Teclado (A)**: «Limpiar» (`clearable`) y «Quitar» de cada chip tienen `tabindex=\"-1\"`: solo\n  funcionan con el mouse (en `select-multiple` se puede desmarcar desde la lista).\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el select el foco entra en la opción elegida y al elegir en\n  `select`, cerrar con Escape o salir con Tab vuelve al botón del campo.\n- **2.4.7 Foco visible (AA)**: el foco pinta el borde de 2 px `border-states-focus` (5.35:1 claro / 10.15:1 oscuro),\n  también en éxito (el select con valor) y al llegar con Tab al botón del select. Con error, el borde sigue rojo y el\n  foco se ve en un contorno azul de 2 px por fuera.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo vacío es `border-states-enabled` (2.44:1\n  claro, 2.59:1 oscuro).\n- **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` 14.53:1, valor del select `text-neutral-high` 16.29:1,\n  etiqueta y `placeholder` `text-neutral-low` 5.01:1 y error `text-feedback-danger` 9.84:1.",
    "figma": [],
    "aria": {
      "roles": [
        "button"
      ],
      "atributos": [
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label",
        "aria-required"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "mt-siaf-xs",
          "px-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "px-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-icon",
      "siaf-select-options"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-kpi-card",
    "clase": "KpiCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/kpi-card/kpi-card.component",
    "archivo": "src/app/shared/ui/kpi-card/kpi-card.component.ts",
    "descripcion": "Tarjeta de indicador (Figma UI KIT, nodo 22743:662 «KPI card»): título, ícono en una caja de color, el monto\ndestacado y la barra de avance con su porcentaje, que siempre se muestra, como en el Figma (0 % sin `progress`). La\ncaja del ícono tiene cuatro tonos del Figma (`informative`, `success`, `warning` y `danger`); la barra es\n`siaf-loading-progress`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "amount",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Monto ya formateado («$1,245,800.00»)."
      },
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "'arrow_outward'",
        "requerida": false,
        "descripcion": "Ícono de Material Icons de la caja; por defecto la flecha del Figma."
      },
      {
        "nombre": "progress",
        "tipo": "number",
        "porDefecto": "0",
        "requerida": false,
        "descripcion": "Avance de 0 a 100 de la barra, que siempre se muestra; se recorta a ese rango."
      },
      {
        "nombre": "progressLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre de la barra para el lector de pantalla; por defecto, el título."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Qué mide el indicador («Total Activos»); también nombra la tarjeta y la barra."
      },
      {
        "nombre": "tone",
        "tipo": "'success' | 'warning' | 'informative' | 'danger'",
        "porDefecto": "'informative'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para un número clave de un tablero, como «Total Activos», con su avance respecto de una meta.\n- `tone` para acompañar el sentido del dato (éxito, advertencia, riesgo), repitiéndolo en el título o el monto.\n- En una grilla junto a otras tarjetas KPI, sobre las `siaf-chart-section` del mismo tablero.",
    "evitar": "- Para una serie de valores o una comparación: usar `siaf-bar-chart` o `siaf-line-chart` dentro de\n  `siaf-chart-section`.\n- Para el resumen de un documento o registro elegido: usar `siaf-summary-card`.\n- Para un número sin avance que medir: la barra siempre se muestra y quedaría en 0 %.\n- Como única señal de un estado: el tono es solo color.",
    "teclado": "- No recibe foco: no es interactiva.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es un `article` nombrado con el título; el ícono es decorativo\n  (`aria-hidden`).\n- **4.1.2 Nombre, función y valor (A)**: la barra es `role=\"progressbar\"` con `aria-valuenow` y el título como\n  nombre; el porcentaje visible va con `aria-hidden` para no leerse dos veces.\n- **1.4.1 Uso del color (A)**: el tono del ícono no dice nada por sí solo; el sentido del dato debe estar en el\n  título o en el monto.\n- **1.4.3 Contraste mínimo (AA)**: monto `text-neutral-high` (16.29:1 claro / 16.53:1 oscuro), título\n  `text-neutral-low` (5.01:1 / 8.86:1) y porcentaje `text-neutral-medium` sobre la superficie.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el relleno de la barra (`bg-brand-primary`) no llega\n  a 3:1 sobre su riel; la paleta oscura de los gráficos está por definir con diseño.",
    "figma": [
      {
        "nodo": "22743:662",
        "nombre": "KPI card"
      },
      {
        "nodo": "22743:236",
        "nombre": ".a.kpi-icon-box"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "p-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "p-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-icon",
      "siaf-loading-progress"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-line-chart",
    "clase": "LineChartComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/line-chart/line-chart.component",
    "archivo": "src/app/shared/ui/line-chart/line-chart.component.ts",
    "descripcion": "Gráfico de línea del kit (Figma UI KIT, página «Graphics»: «Line»), dibujado con Chart.js: por serie, una línea de\n4 px con un punto de 12 px en cada categoría, para seguir cómo evoluciona un valor. El eje de valores no arranca en\ncero, porque la línea compara la forma y no el largo: Chart.js elige un rango redondo alrededor de los datos, que se\nfija con `min` y `max`. Comparte con `siaf-bar-chart` la paleta del kit, la leyenda, el tooltip, el teclado y la\ntabla de datos.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Gráfico de línea'",
        "requerida": false,
        "descripcion": "Nombre accesible del gráfico y título de su tabla de datos."
      },
      {
        "nombre": "categories",
        "tipo": "readonly string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Etiquetas de las categorías, en orden (meses, periodos)."
      },
      {
        "nombre": "categoryLabel",
        "tipo": "string",
        "porDefecto": "'Categoría'",
        "requerida": false,
        "descripcion": "Encabezado de la columna de categorías en la tabla de datos."
      },
      {
        "nombre": "height",
        "tipo": "number",
        "porDefecto": "252",
        "requerida": false,
        "descripcion": "Alto del área del gráfico en px (sin la leyenda)."
      },
      {
        "nombre": "max",
        "tipo": "number | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Máximo del eje de valores; sin él, Chart.js elige uno redondo por encima del mayor valor."
      },
      {
        "nombre": "min",
        "tipo": "number | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Mínimo del eje de valores; sin él, Chart.js elige uno redondo por debajo del menor valor."
      },
      {
        "nombre": "series",
        "tipo": "readonly ChartSeries[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "valueSuffix",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Sufijo de los valores en el eje, el tooltip y la tabla (por ejemplo `%`)."
      }
    ],
    "eventos": [],
    "usar": "- Para la evolución de uno o más valores a lo largo de meses o periodos, como activos y existencias por mes.\n- Dentro de `siaf-chart-section`, que le pone título y descripción.\n- `min` y `max` para fijar el rango del eje (en el Figma, de 100 a 500), y `valueSuffix=\"%\"` para porcentajes.",
    "evitar": "- Para comparar cantidades entre categorías sin un orden en el tiempo: usar `siaf-bar-chart`.\n- Para variaciones que suben y bajan respecto de cero: usar `siaf-diverging-chart`.\n- Con más de cuatro series: la paleta da la vuelta y los colores se repiten.",
    "teclado": "- **Tab**: enfoca el gráfico (una sola parada).\n- **Flecha derecha / izquierda**: recorren las categorías y muestran el tooltip con el valor de cada serie; dan la\n  vuelta.\n- **Inicio / Fin**: van a la primera o a la última categoría.\n- **Escape**: oculta el tooltip; salir del gráfico también lo oculta.",
    "accesibilidad": "- **1.1.1 Contenido no textual (A)**: el lienzo es `role=\"img\"` con `ariaLabel` y, además, hay una tabla de datos\n  oculta (`sr-only`) con una fila por categoría y una columna por serie.\n- **1.3.1 Información y relaciones (A)**: la tabla usa `caption`, `th scope=\"col\"` para las series y\n  `th scope=\"row\"` para las categorías.\n- **2.1.1 Teclado (A)**: los valores se recorren con las flechas; al moverse, una región `aria-live` anuncia la\n  categoría y los valores.\n- **2.4.7 Foco visible (AA)**: el lienzo enfocado muestra el contorno de 2 px `border-states-focus`.\n- **1.4.1 Uso del color (A)**: las líneas se distinguen solo por color (el Figma no usa trazos distintos), pero sus\n  nombres están en la leyenda, en el tooltip y en la tabla de datos.\n- **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el tooltip sin mover el puntero ni el foco.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro las líneas de las series 1 y 2 (`bg-brand-primary`,\n  2.66:1, y `bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie; la paleta oscura de los gráficos está\n  por definir con diseño.",
    "figma": [
      {
        "nodo": "22743:299",
        "nombre": "Line"
      }
    ],
    "aria": {
      "roles": [
        "img"
      ],
      "atributos": [
        "aria-label",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "pt-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-chart-legend",
      "siaf-chart-tooltip"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-list",
    "clase": "ListComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/list/list.component",
    "archivo": "src/app/shared/ui/list/list.component.ts",
    "descripcion": "Lista de ítems (Figma UI KIT, nodo 7421:7061 «Lists»): cada ítem con título, texto de apoyo y\noverline opcionales, un elemento inicial (ícono, avatar con iniciales, switch o thumbnail) y uno final\n(ícono, badge contador o switch).\n\n- `size`: `standard` (48 px mínimo, íconos de 24) o `compact` (32 px, íconos de 20).\n- El tipo de 1, 2 o 3+ líneas sale del contenido: sin descripción es de 1 línea; con descripción, esta\n  se corta en una línea con tooltip, salvo `[wrapDescription]=\"true\"`, que la deja crecer (3 líneas +).\n- `dividers` agrega `siaf-divider` bajo cada ítem, menos el último (solo en vertical).\n- `orientation=\"horizontal\"` pone los ítems en fila, con 4 px de separación, 230 px de ancho, el contenido centrado y\n  el título y la descripción en una línea cada uno (con tooltip si se cortan); el desplazamiento lo maneja el\n  contenedor. `outlined` les pone borde: son las tarjetas de «Parámetros aplicados»\n  (`siaf-parametros-aplicados`).\n- `selectable` la vuelve una lista de opciones: hover, foco con teclado y seleccionado (fondo azul,\n  título en negrita e ícono inicial en azul), con `[(selectedId)]`. Sin `selectable` es estática.\n- Los switches son `siaf-switch` y emiten `switchChange` sin cambiar la selección.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "dividers",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "items",
        "tipo": "ListItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "orientation",
        "tipo": "'vertical' | 'horizontal'",
        "porDefecto": "'vertical'",
        "requerida": false,
        "descripcion": "`vertical` (por defecto) o `horizontal`: ítems en fila de 230 px, sin desplazamiento propio."
      },
      {
        "nombre": "outlined",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Ítems con borde `border-states-enabled` (tarjetas)."
      },
      {
        "nombre": "selectable",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Convierte la lista en opciones seleccionables con hover, foco y seleccionado."
      },
      {
        "nombre": "selectedId",
        "tipo": "string | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "size",
        "tipo": "'standard' | 'compact'",
        "porDefecto": "'standard'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "wrapDescription",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Deja crecer la descripción en varias líneas (Figma «3 line+»). Por defecto se corta en una."
      }
    ],
    "eventos": [
      {
        "nombre": "selectedIdChange",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "switchChange",
        "tipo": "ListSwitchChange",
        "descripcion": null
      }
    ],
    "usar": "- Para listas verticales de ítems con título, texto de apoyo e ícono, avatar o miniatura (p. ej. los documentos de\n  un expediente, o novedades y capacitaciones).\n- Con switches (`leading` o `trailing` de tipo `switch`) para una lista de preferencias, como «Avisar al aprobador».\n- Con `selectable` y `[(selectedId)]` para elegir un ítem de una lista corta. Hoy ninguna pantalla la usa.\n- En horizontal y con `outlined` para una fila de tarjetas con ícono, título y valor, como los parámetros de una\n  consulta: `siaf-parametros-aplicados` ya la arma con su título y su botón para desplazar.",
    "evitar": "- Para datos en columnas: `siaf-table` o `siaf-data-table`.\n- Para opciones que se abren desde un botón: `siaf-menu` o `siaf-icon-dropdown-menu`.\n- Combinar `selectable` con switches: el switch queda dentro de un `role=\"option\"`, que no admite controles adentro.\n- Para una jerarquía de nodos: `siaf-tree-view` o `siaf-process-menu-tree`.",
    "teclado": "- **Tab**: con `selectable`, la lista es una sola parada: entra por la última opción enfocada (al principio, la\n  elegida o la primera) y la siguiente pulsación sale; sin `selectable`, solo pasa por los switches.\n- **Flecha abajo / arriba**: con `selectable`, pasan a la opción siguiente o anterior y dan la vuelta (en horizontal,\n  también **derecha / izquierda**).\n- **Inicio / Fin**: van a la primera o a la última opción.\n- **Enter / Espacio**: eligen la opción enfocada y emiten `selectedIdChange`; sobre un switch interno lo dejan\n  actuar.\n- Los switches siguen `siaf-switch`.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: `<ul>` y `<li>` reales; overline, título y descripción van como texto en\n  orden de lectura.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: con `selectable` es `role=\"listbox\"` con opciones\n  `role=\"option\"` y `aria-selected` (el padre debe dar `ariaLabel`); pero un switch dentro de una opción queda\n  anidado, y ARIA trata los hijos de una opción como presentacionales.\n- **1.1.1 Contenido no textual (A)**: íconos y avatar son decorativos (`aria-hidden`); la miniatura lleva `alt`\n  vacío salvo que el padre dé uno (debe darlo si la imagen informa) y el badge contador necesita `ariaLabel` para\n  decir qué cuenta.\n- **2.1.1 Teclado (A)**: en una lista seleccionable, al enfocar la opción aparece el globo con la descripción\n  cortada.\n- **Pendiente · 2.1.1 Teclado (A)**: sin `selectable` las filas no reciben foco y la descripción cortada solo se\n  completa con el mouse (la alternativa es `wrapDescription`).\n- **1.4.13 Contenido en hover o foco (AA)**: ese tooltip (`siafTooltip`) se cierra con Escape y se puede recorrer con\n  el puntero.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: título `text-neutral-medium` (14.53:1 / 12.87:1) y descripción\n  `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie; en el ítem seleccionado la descripción queda sobre la\n  capa `bg-states-light-selected`, que en claro la deja por debajo de 4.5:1.\n- **1.4.1 Uso del color (A)**: el seleccionado no depende solo del fondo azul: el título pasa a negrita.\n- **2.4.7 Foco visible (AA)**: la opción enfocada con teclado lleva un contorno interior azul de 2 px\n  (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro), el mismo de `siaf-menu`, además de la capa\n  `bg-states-light-focus`, que sola casi no se veía (1.27:1 en claro y sin redefinir en oscuro).\n- **2.5.8 Tamaño del objetivo (AA)**: ítems de 48 px (`standard`) o 32 px (`compact`) de alto como mínimo.",
    "figma": [
      {
        "nodo": "7421:7061",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "listbox",
        "option"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label",
        "aria-orientation",
        "aria-selected"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-highlight",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-primary",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-badge",
      "siaf-divider",
      "siaf-icon",
      "siaf-switch"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-loader",
    "clase": "LoaderComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/loader/loader.component",
    "archivo": "src/app/shared/ui/loader/loader.component.ts",
    "descripcion": "Indicador de carga en línea: ocho puntos en círculo que se atenúan por turnos.\n\nÚsalo dentro de un botón, celda o bloque que está esperando datos. Si necesitas tapar toda la\npantalla mientras se procesa una acción, usa `siaf-loader-overlay`, que ya envuelve a este.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "decorative",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "dotSize",
        "tipo": "number",
        "porDefecto": "6",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "'Cargando'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "size",
        "tipo": "number",
        "porDefecto": "32",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "tone",
        "tipo": "'current' | 'light' | 'brand'",
        "porDefecto": "'current'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Mientras se valida o procesa un archivo dentro de la misma tarjeta, con un texto visible al lado: carga\n  masiva del catálogo de eventos («Validando el archivo de eventos...») y carga masiva del Plan de Cuentas.\n- Dentro de una celda o un bloque que espera datos, sin bloquear el resto de la pantalla.\n- Con `tone=\"light\"` sobre fondos oscuros y `decorative` cuando otro elemento ya anuncia la espera, como hace\n  `siaf-loader-overlay`.",
    "evitar": "- Para bloquear la pantalla mientras se graba, verifica o aprueba: usar `siaf-loader-overlay`.\n- Para la carga inicial de una grilla: usar `siaf-table-skeleton`.\n- Dentro de `siaf-button`: usar su `loading`, que ya pinta el giro y publica `aria-busy`.\n- Para un avance con porcentaje conocido: usar `siaf-progress-circular`.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **4.1.3 Mensajes de estado (AA)**: sin `decorative` es `role=\"status\"` con `aria-label` («Cargando» por\n  defecto), pero no tiene texto dentro y no todos los lectores anuncian una región que solo tiene nombre; el\n  texto visible de al lado tampoco forma parte de la región.\n- **1.1.1 Contenido no textual (A)**: los puntos son decorativos; el nombre sale de `label`, que conviene que\n  diga qué se espera. Con `decorative` queda con `aria-hidden` y el padre debe anunciar la espera.\n- **1.4.11 Contraste no textual (AA)**: `current` toma el color de texto del padre, `brand` usa\n  `bg-brand-accent` (4.89:1 en claro, 3.14:1 en oscuro sobre la superficie) y `light` es solo para fondos\n  oscuros.",
    "figma": [],
    "aria": {
      "roles": [
        "status"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-brand-white",
        "via": [
          "var()"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-loader-overlay",
    "clase": "LoaderOverlayComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/loader-overlay/loader-overlay.component",
    "archivo": "src/app/shared/ui/loader-overlay/loader-overlay.component.ts",
    "descripcion": "Capa a pantalla completa que oscurece la vista y muestra el `siaf-loader` con un mensaje.\n\nÚsalo para bloquear la interacción mientras se procesa una acción del usuario (grabar, verificar,\naprobar). Para una espera localizada que no debe bloquear la pantalla, usa `siaf-loader` directo.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "dotSize",
        "tipo": "number",
        "porDefecto": "6",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "'Procesando'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "message",
        "tipo": "string",
        "porDefecto": "'Procesando...'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "size",
        "tipo": "number",
        "porDefecto": "32",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Mientras se ejecuta una acción de la solicitud (grabar, verificar, aprobar): ya lo pinta\n  `siaf-request-approval-modals` con `saving`.\n- Mientras carga un documento existente que no se debe tocar hasta que termine: «Cargando documento...» en la\n  carga masiva del Plan de Cuentas.\n- Con un `message` corto que diga qué se procesa y un `label` para el lector de pantalla.",
    "evitar": "- Para esperas locales que no deben bloquear la pantalla: usar `siaf-loader` o `siaf-table-skeleton`.\n- Agregar otro en páginas que ya usan `siaf-request-approval-modals`: ese ya trae el suyo.\n- Como única barrera contra un doble envío: el teclado sigue llegando a la página (ver Notas).",
    "teclado": "- **Tab**: mientras está abierta, el foco queda en la capa y no llega a la página de atrás; al cerrarse vuelve al\n  control que lo tenía. No se cierra con Escape: la cierra el padre al terminar.",
    "accesibilidad": "- **4.1.3 Mensajes de estado (AA)**: la capa es `role=\"status\"` con `aria-live=\"polite\"`, `aria-label` y el\n  mensaje dentro; como se crea ya llena (bloque if), no todos los lectores la anuncian.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrirse el foco pasa a la capa y Tab no sale de ella; al cerrarse\n  vuelve al control que lo tenía. El lector de pantalla todavía puede recorrer la página de atrás con su cursor\n  virtual: el padre debe deshabilitar las acciones mientras dura, como `confirmDisabled` en\n  `siaf-request-approval-modals`.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: el mensaje es blanco sobre negro al 40 % (`bg-black/40`); encima\n  de una superficie clara no llega a 4.5:1. En oscuro cumple.\n- **1.1.1 Contenido no textual (A)**: el `siaf-loader` interno va `decorative` (`aria-hidden`); la espera se\n  comunica con el mensaje y `label`.",
    "figma": [],
    "aria": {
      "roles": [
        "status"
      ],
      "atributos": [
        "aria-label",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-loader"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-loading-progress",
    "clase": "LoadingProgressComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/loading-progress/loading-progress.component",
    "archivo": "src/app/shared/ui/loading-progress/loading-progress.component.ts",
    "descripcion": "Indicador de progreso en dos variantes: spinner circular o barra horizontal con porcentaje.\n\nLas esperas reales de las pantallas se resuelven con textos \"Cargando…\" y `animate-pulse`, o con `siaf-loader` /\n`siaf-loader-overlay`. La barra es la de `siaf-kpi-card` (Figma «Progress/lineal»); fuera de ella, no la\nintroduzcas sin acordarlo antes.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre de la barra para el lector de pantalla («Avance» si no hay)."
      },
      {
        "nombre": "size",
        "tipo": "number",
        "porDefecto": "24",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "number",
        "porDefecto": "50",
        "requerida": false,
        "descripcion": "Avance de 0 a 100 de la barra; se recorta a ese rango."
      },
      {
        "nombre": "variant",
        "tipo": "'spinner' | 'bar'",
        "porDefecto": "'spinner'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- La barra (`variant=\"bar\"` con `value` y `label`) para un avance real y medible, como la meta de una\n  `siaf-kpi-card`.\n- El spinner solo si se acuerda: las pantallas esperan con `siaf-loader`.",
    "evitar": "- Para esperas sin porcentaje: usar `siaf-loader`, o `siaf-loader-overlay` si hay que bloquear la pantalla.\n- Para un avance de 0 a 100 %: usar `siaf-progress-circular`, que ya publica `role=\"progressbar\"`.\n- Dentro de `siaf-button`: usar su `loading`.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **Pendiente · 4.1.3 Mensajes de estado (AA)**: el spinner no tiene `role`, nombre ni `aria-live`: para un\n  lector de pantalla la espera no existe.\n- **4.1.2 Nombre, función y valor (A)**: la barra es `role=\"progressbar\"` con `aria-valuemin` 0, `aria-valuemax`\n  100, `aria-valuenow` redondeado y `label` como nombre («Avance» si no hay). El porcentaje en texto lo pone quien\n  la usa, como `siaf-kpi-card`.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el azul `bg-brand-primary` del spinner queda en\n  2.66:1 sobre la superficie.",
    "figma": [],
    "aria": {
      "roles": [
        "progressbar"
      ],
      "atributos": [
        "aria-label",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "border-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-menu",
    "clase": "MenuComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/menu/menu.component",
    "archivo": "src/app/shared/ui/menu/menu.component.ts",
    "descripcion": "Menú de opciones del design system (Figma UI KIT, nodo 7440:34249 «menus»): panel de 280 px con\nsombra de elevación 8 y una opción por fila.\n\n- `leading`: `none`, `icon` (el `icon` de cada opción), `radio` (elección única, `[(selectedValue)]`)\n  o `checkbox` (varias, `[(selectedValues)]`), con el radio y el checkbox nativos del kit.\n- Al final, `trailingIcon` por opción, o la flecha de submenú: con `children` el submenú se abre al costado\n  (puntero, clic, → o Enter; ← o Escape lo cierra) y su elección sale por el mismo `selected`. Se abre a la\n  derecha, o a la izquierda / debajo si no entra en la ventana. El nivel 2\n  lleva íconos si el menú los lleva; `submenuLeading=\"none\"` lo deja solo con texto.\n- `density`: `standard` (48 px por opción, íconos de 24) o `compact` (32 px, íconos de 20).\n- Un texto que no entra se corta y muestra el completo con `siafTooltip`.\n- `maxHeight` agrega scroll. Se navega con ↑ ↓ Inicio Fin y Escape emite `closed`.\n\nEmite `selected` con el valor elegido. Es solo el panel: para abrirlo desde un botón con ícono va\n`siaf-icon-dropdown-menu`, y para dos niveles, `siaf-cascading-menu`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "density",
        "tipo": "'standard' | 'compact'",
        "porDefecto": "'standard'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "esSubmenu",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Uso interno: el panel es un submenú (← también lo cierra)."
      },
      {
        "nombre": "items",
        "tipo": "MenuItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "leading",
        "tipo": "'none' | 'icon' | 'radio' | 'checkbox'",
        "porDefecto": "'none'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "maxHeight",
        "tipo": "number | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Alto máximo en px; por encima aparece el scroll."
      },
      {
        "nombre": "selectedValue",
        "tipo": "string | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Opción marcada con `leading=\"radio\"`."
      },
      {
        "nombre": "selectedValues",
        "tipo": "string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Opciones marcadas con `leading=\"checkbox\"`."
      },
      {
        "nombre": "submenuLeading",
        "tipo": "'none' | 'icon' | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Elemento inicial de las opciones del submenú. Por defecto, íconos si este menú los usa; si no, nada."
      },
      {
        "nombre": "width",
        "tipo": "number",
        "porDefecto": "280",
        "requerida": false,
        "descripcion": "Ancho del panel en px (280 en el Figma)."
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "selected",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "selectedValueChange",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "selectedValuesChange",
        "tipo": "string[]",
        "descripcion": null
      }
    ],
    "usar": "- Como panel de opciones de los disparadores del kit: `siaf-icon-dropdown-menu` (Campos, Favorito y Exportar),\n  `siaf-filter-pill` (filtros Estado y Tipo de acción de la bandeja) y `siaf-cascading-menu` (el «+» de la solicitud\n  del catálogo de eventos).\n- `leading=\"radio\"` o `checkbox` cuando la opción queda marcada (una sola o varias), en vez de dibujar el check a\n  mano.\n- `children` para un segundo nivel corto; `density=\"compact\"` en barras y filtros, `standard` en menús sueltos.",
    "evitar": "- Para abrirlo desde un botón: no armar a mano el disparador, la apertura y el cierre; usar `siaf-icon-dropdown-menu`\n  o `siaf-cascading-menu`.\n- Para elegir un valor dentro de un formulario: usar `siaf-select-options` o `siaf-radio-group`.\n- Para contenido con título, texto o acciones al pie: usar `siaf-popover`.\n- Para navegar entre pantallas: usar `siaf-process-menu-tree` o enlaces.",
    "teclado": "- **Tab**: el menú es una sola parada: entra en la última opción enfocada (al principio, la primera habilitada) y la\n  siguiente pulsación sale del menú; las opciones se recorren con las flechas.\n- **Flecha arriba / abajo**: pasan a la opción habilitada anterior o siguiente (dan la vuelta).\n- **Inicio / Fin**: van a la primera o a la última opción habilitada.\n- **Enter / Espacio**: eligen la opción y emiten `selected` (con `radio` la marcan y con `checkbox` la alternan); en\n  una opción con `children`, abren el submenú y enfocan su primera opción.\n- **Flecha derecha**: abre el submenú de la opción y enfoca su primera opción.\n- **Flecha izquierda** (dentro del submenú): lo cierra y devuelve el foco a la opción que lo abrió.\n- **Escape**: en un submenú hace lo mismo que la flecha izquierda; en el menú principal emite `closed` y quien lo\n  abre decide cerrarlo.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: el panel es `role=\"menu\"` con `aria-label` (el padre debe dar `ariaLabel`;\n  el submenú toma el texto de su opción) y cada opción, `menuitem`, `menuitemradio` o `menuitemcheckbox` con\n  `aria-checked` y `aria-disabled`; las que abren submenú llevan `aria-haspopup` y `aria-expanded`.\n- **1.1.1 Contenido no textual (A)**: los íconos son decorativos y el radio y el checkbox nativos llevan\n  `aria-hidden` y `tabindex=\"-1\"`: el estado lo publica `aria-checked`.\n- **2.1.1 Teclado (A)**: todo se opera con teclado y Tab sale del menú sin trampa; al enfocar una opción cortada,\n  `siafTooltip` muestra su texto completo.\n- **2.4.3 Orden del foco (A)**: abrir un submenú con teclado enfoca su primera opción y cerrarlo con flecha izquierda\n  o Escape devuelve el foco a la opción que lo abrió. Llevar el foco al menú al abrirlo le toca al disparador\n  (`siaf-icon-dropdown-menu` lo hace).\n- **2.4.7 Foco visible (AA)**: la opción enfocada con teclado lleva un contorno interior azul de 2 px\n  (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro) además de la capa gris `bg-states-light-focus`, que sola no\n  se distinguía en oscuro.\n- **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` sobre `bg-surfaces-surface-highest`, que en claro es\n  blanco como la superficie (14.53:1). Las opciones deshabilitadas (`opacity-40`) están exentas.\n- **1.4.13 Contenido en hover o foco (AA)**: el submenú que abre el puntero se pega a su opción dentro del mismo\n  contenedor, así que se puede pasar el puntero sobre él sin que se cierre; se cierra con flecha izquierda o Escape.\n- **2.5.8 Tamaño del objetivo (AA)**: 48 px por opción en `standard` y 32 px en `compact`.",
    "figma": [
      {
        "nodo": "7440:34249",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "menu"
      ],
      "atributos": [
        "aria-checked",
        "aria-disabled",
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "accent-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "my-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-8",
        "via": [
          "shadow-siaf-elevation-8"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-divider",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-mobile-navigation-menu",
    "clase": "MobileNavigationMenuComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/mobile-navigation-menu/mobile-navigation-menu.component",
    "archivo": "src/app/layout/mobile-navigation-menu/mobile-navigation-menu.component.ts",
    "descripcion": "Versión móvil del sidebar: la navegación principal del shell cuando no hay espacio para la barra fija.\n\nReusa el mismo tipo `SidebarNavigation` que `siaf-sidebar`, así que el shell trata ambos con los mismos\nhandlers. Los ítems están fijos en el componente; \"Ayuda\" no es una sección navegable — emite `help`\naparte y nunca se marca como activo.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ctaAdd",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "navigation",
        "tipo": "'Default' | 'Panel' | 'Bandeja' | 'Proceso' | 'Ajustes'",
        "porDefecto": "'Panel'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "created",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "help",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "navigationChanged",
        "tipo": "'Default' | 'Panel' | 'Bandeja' | 'Proceso' | 'Ajustes'",
        "descripcion": null
      }
    ],
    "usar": "- Como navegación principal por debajo de `lg` (1024 px): `siaf-app-shell` lo abre a pantalla completa desde el\n  botón de menú de `siaf-navbar`, en lugar del rail.\n- Para ofrecer en una sola lista Crear documento, Panel, Bandeja, Procesos, Ayuda y Ajustes, con `ctaAdd` atado al\n  permiso `document.create`.",
    "evitar": "- En escritorio: la barra fija es `siaf-sidebar` (variante `rail`), que emite los mismos eventos.\n- Para listar procesos o secciones de la bandeja: al elegir el destino, el armazón abre `siaf-process-menu-tree` o\n  `siaf-tray-menu`.\n- Para una lista de opciones dentro de una pantalla: usar `siaf-list`, o `siaf-menu` si son acciones.",
    "teclado": "- **Tab**: recorre «Crear documento» (se salta si `ctaAdd` es false) y los cinco destinos, en orden.\n- **Enter / Espacio**: eligen el destino (`navigationChanged`); «Ayuda» emite `help` y «Crear documento», `created`.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con `h2` y un `<nav>`, pero ninguno tiene\n  `aria-label` y los destinos son botones sueltos, sin lista `ul`/`li`: el lector no dice cuántos hay.\n- **1.4.1 Uso del color (A)**: el destino activo, además del fondo y el color, va en negrita.\n- **1.4.3 Contraste mínimo (AA)**: «Crear documento» en `text-brand-white` sobre `bg-brand-accent` (4.89:1 / 5.65:1);\n  en claro, destinos en `text-neutral-medium` sobre blanco (14.53:1). En oscuro el fondo es `bg-surfaces-field` y\n  falta medirlo.\n- **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro\n  / 10.15:1 oscuro sobre la superficie).\n- **Pendiente · 2.4.3 Orden del foco (A)**: no toma el foco al abrirse (el Tab pasa antes por el logo, la campana y el\n  perfil del navbar), no cierra con Escape y la página de fondo sigue en el orden de tabulación. Le toca al armazón,\n  que hoy no lo hace.\n- **2.4.7 Foco visible (AA)**: los destinos muestran un contorno azul de 2 px con `focus-visible`; «Crear documento»\n  no tiene estilo propio y queda con el anillo del navegador.\n- **2.5.8 Tamaño del objetivo (AA)**: destinos de 48 px de alto y «Crear documento» de 40 px, a todo el ancho.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada destino es un `<button>` con su texto como nombre y «Crear\n  documento» usa `disabled`, pero el activo solo se marca con estilo: falta `aria-current`.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-field",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-modal",
    "clase": "ModalComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/modal/modal.component",
    "archivo": "src/app/shared/ui/modal/modal.component.ts",
    "descripcion": "Modal de confirmación con presets por acción (grabar, verificar, aprobar, observar, rechazar…)\nque resuelven título, descripción, ilustración y motivo obligatorio; `custom` deja todo abierto.\n\nEs el diálogo canónico del kit: úsalo para cualquier confirmación en vez de maquetar un overlay.\nLos mensajes de resultado tras la acción van por `siaf-request-approval-modals` (snackbar).",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "cancelLabel",
        "tipo": "string",
        "porDefecto": "\"Cancelar\"",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "confirmDisabled",
        "tipo": "boolean | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "confirmLabel",
        "tipo": "string",
        "porDefecto": "\"\"",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "confirmVariant",
        "tipo": "'accent' | 'primary' | 'standard' | 'filled' | 'outline' | 'text' | 'secondary' | 'ghost'",
        "porDefecto": "\"primary\"",
        "requerida": false,
        "descripcion": "Variante del botón de confirmar (las de `siaf-button`)."
      },
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "\"\"",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "hasProjectedActions",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "\"\"",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "illustrationSrc",
        "tipo": "string",
        "porDefecto": "\"\"",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reason",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reasonDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reasonLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reasonMaxLength",
        "tipo": "number",
        "porDefecto": "500",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reasonPlaceholder",
        "tipo": "string",
        "porDefecto": "\"Motivo\"",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reasonType",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reasonTypeLabel",
        "tipo": "string",
        "porDefecto": "'Motivo'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reasonTypeOptions",
        "tipo": "string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Opciones para el dropdown de tipo/motivo. Si está vacío, no se muestra el select."
      },
      {
        "nombre": "showClose",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showFooter",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showIllustration",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "\"\"",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "ModalVariant",
        "porDefecto": "\"custom\"",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "canceled",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "confirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "reasonChange",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "reasonTypeChange",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Para confirmar una acción sobre una solicitud con su preset (`save`, `verify`, `approve`, `delete-request`,\n  `observe`, `reject`…); en las request-pages llegan ya armados por `siaf-request-approval-modals`.\n- En las acciones masivas de la bandeja: «¿Deseas verificar / aprobar múltiples solicitudes?» de\n  `siaf-documents-records-page` (`custom` con ilustración).\n- Con `custom` y contenido proyectado para diálogos cortos con campos, como «Cambiar contraseña» del escritorio\n  virtual.\n- `observe` y `reject` para pedir el motivo (`reason` / `reasonChange`): Aceptar se habilita al escribirlo.",
    "evitar": "- Repetir a mano en una request-page los seis modales del flujo: usar `siaf-request-approval-modals`.\n- Para avisar el resultado después de confirmar: usar `siaf-snackbar`; para bloquear mientras se procesa,\n  `siaf-loader-overlay`.\n- Para buscar y elegir registros o adjuntar archivos: usar `siaf-selection-side-nav` o `siaf-upload-side-nav`.\n- Dentro de un bloque if sin enlazar `open`: sin ese input no se pinta; y si el bloque lo destruye al cerrar, no anima\n  la salida (el foco sí vuelve al control que lo abrió).",
    "teclado": "- **Tab / Shift + Tab**: al abrir, el foco ya está en el primer control (la X si `showClose`, o el diálogo si no hay\n  controles); recorren los controles y dan la vuelta del último al primero sin salir del diálogo.\n- **Escape**: cierra como Cancelar (emite `canceled` y `closed`) y devuelve el foco al elemento que lo tenía antes\n  de abrir.\n- **Enter / Espacio**: activan la X, Cancelar y Aceptar (emite `confirmed`); el campo de motivo sigue\n  `text-area-control`.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"dialog\"` con `aria-modal=\"true\"`, `aria-labelledby` al título y\n  `aria-describedby` a la descripción; la X se llama «Cerrar» (ícono con `label`).\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir mueve el foco al primer control y al cerrar (con `open` en\n  false o al destruirse) lo devuelve a donde estaba.\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro del diálogo mientras está abierto, pero Escape siempre lo\n  cierra.\n- **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: en `observe` y `reject` el motivo es obligatorio (Aceptar\n  sigue deshabilitado sin texto) pero no se marca: no pasa `required` a `text-area-control`, que pondría el\n  asterisco y `aria-required`.\n- **2.4.7 Foco visible (AA)**: la X muestra un anillo `border-states-focus` de 2 px con `focus-visible`; los\n  botones del pie siguen `siaf-button`.\n- **1.4.11 Contraste no textual (AA)**: ese anillo es el azul del kit (`border-states-focus`, 5.35:1 claro / 10.15:1\n  oscuro sobre la superficie).\n- **1.1.1 Contenido no textual (A)**: la ilustración va con `alt=\"\"` y el ícono de respaldo es decorativo.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` y descripción `text-neutral-medium` sobre\n  `surface-highest`, que en claro es el blanco de la superficie (16.29:1 y 14.53:1).",
    "figma": [],
    "aria": {
      "roles": [
        "dialog",
        "presentation"
      ],
      "atributos": [
        "aria-describedby",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "pb-siaf-lg",
          "px-siaf-lg",
          "right-siaf-lg",
          "top-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-icon",
      "siaf-input",
      "text-area-control"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-navbar",
    "clase": "NavbarComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/navbar/navbar.component",
    "archivo": "src/app/layout/navbar/navbar.component.ts",
    "descripcion": "Barra superior del shell autenticado: logo, campana de notificaciones y menú de usuario.\n\nEl contador de la campana sale de `NotificationsStateService.unreadCount()` (actualizado por socket) y\nal abrir el panel dispara un `refresh()`. El menú de usuario incluye cambio de perfil vía `AuthService`,\ncierre de sesión y el toggle de tema, que persiste en localStorage y anima el cambio con View Transitions\ncuando el navegador las soporta. Un click fuera del componente cierra ambos desplegables.",
    "usaSesion": true,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "homeHref",
        "tipo": "string",
        "porDefecto": "'/panel'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "initials",
        "tipo": "string",
        "porDefecto": "'JP'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "officeName",
        "tipo": "string",
        "porDefecto": "'Office name'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showMenu",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showNotifications",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showProfile",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "userName",
        "tipo": "string",
        "porDefecto": "'Juan Doe Perez Perez'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "menuClicked",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Una sola vez, arriba de todo el armazón autenticado: `siaf-app-shell` la fija con `sticky top-0` y le pasa\n  `userName` y `officeName` de la sesión.\n- Para dar acceso desde cualquier pantalla a las notificaciones (contador en vivo por socket), al cambio de perfil,\n  al tema claro u oscuro y al cierre de sesión.\n- En un armazón reducido, con `showMenu`, `showNotifications` o `showProfile` en false; lo proyectado se pinta antes\n  de la campana.",
    "evitar": "- Como cabecera de una pantalla o de una solicitud: usar `siaf-page-header` o `siaf-solicitude-header`; la barra ya\n  la pinta el armazón y no se repite dentro de una página.\n- En pantallas sin sesión, como el login: lee `AuthService` y el estado de notificaciones por socket.\n- Para un menú de opciones en otra parte: usar `siaf-icon-dropdown-menu` o `siaf-menu`; el menú de usuario está\n  hecho a mano y no se reutiliza.",
    "teclado": "- **Tab**: recorre el botón de menú, el logo, la campana y el perfil. Al abrir el menú de usuario o el panel de\n  notificaciones, el foco entra en su primera opción; salir con Tab los cierra.\n- **Escape**: cierra el desplegable abierto y el foco vuelve a su botón (perfil o campana).\n- **Enter / Espacio**: el botón de menú emite `menuClicked`; la campana y el perfil abren o cierran su desplegable\n  (abrir uno cierra el otro).\n- **Enter** en el logo: va a `homeHref`.\n- **Enter / Espacio** en una opción del menú de usuario: la ejecuta; «Perfil» muestra u oculta la lista de perfiles.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: la barra es un `<header>`, pero solo cuenta como región\n  `banner` fuera de `<main>`, y `siaf-app-shell` hoy la pinta dentro.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: la barra (`text-brand-white` sobre `bg-brand-primary`, 8.79:1 / 6.67:1)\n  y el menú (`text-neutral-medium` sobre la superficie, 14.53:1 / 12.87:1) cumplen; en oscuro, el perfil activo usa\n  la clase `text-brand-primary` (el azul de fondo de marca) y no llega a 4.5:1.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el contorno blanco de los botones de la barra cumple (8.79:1 /\n  6.67:1) y el de las opciones es el azul del kit (`border-states-focus`, 5.35:1 / 10.15:1), pero en oscuro el ícono\n  del perfil activo no llega a 3:1.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, el menú de usuario y el panel de notificaciones reciben el foco al\n  abrir, cierran con Escape o al salir con Tab, y al elegir tema o perfil el foco vuelve al botón de perfil.\n- **2.4.7 Foco visible (AA)**: contorno de 2 px con `focus-visible` en los botones de la barra y en las opciones del\n  menú; el logo y la lista de perfiles quedan con el anillo del navegador.\n- **Pendiente · 2.5.3 Etiqueta en el nombre (A)**: el botón de perfil muestra las iniciales y, desde `md`, el nombre y\n  la oficina, pero su `aria-label` fijo «Perfil de usuario» los reemplaza: el lector no dice quién inició sesión.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: la campana y el perfil publican `aria-expanded`, pero «Abrir\n  menu» no. El menú de usuario es un `role=\"menu\"` hecho a mano: sin flechas, «Perfil» sin `aria-expanded` y\n  perfiles `menuitem` sin `aria-checked` (el activo solo se ve); `siaf-menu` ya trae flechas, Escape y `aria-checked`.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: el número de no leídas va en el nombre de la campana\n  («Notificaciones, 3 sin leer») y el badge es `aria-hidden`, pero una notificación nueva no se anuncia: no hay\n  `role=\"status\"` ni `aria-live`.",
    "figma": [],
    "aria": {
      "roles": [
        "menu",
        "menuitem"
      ],
      "atributos": [
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-on-brand-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-lowest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "pl-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "pr-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-2",
        "via": [
          "shadow-siaf-elevation-2"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-badge",
      "siaf-icon",
      "siaf-notifications-panel"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-notifications-panel",
    "clase": "NotificationsPanelComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/notifications-panel/notifications-panel.component",
    "archivo": "src/app/layout/notifications-panel/notifications-panel.component.ts",
    "descripcion": "Desplegable de notificaciones que abre la campana del navbar (lista, skeleton, vacío y \"marcar leídas\").\n\nLee y muta el estado compartido de `NotificationsStateService` — la misma fuente del contador de la\ncampana — y no hace HTTP por su cuenta. Al tocar una notificación resuelve la ruta del documento por\ncódigo de tipo (SCC, SCMPC, SRAA, STAA, SCA, CAM) y navega, conservando compatibilidad con el campo\nviejo `solicitud` además del actual `documento`.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Solo como desplegable de la campana de `siaf-navbar`, que lo pinta al abrirse y lo quita al recibir `closed`.\n- Para revisar de un vistazo las notificaciones recientes y saltar al documento (SCC, SCMPC, SRAA, STAA, SCA o CAM)\n  sin pasar por la bandeja.",
    "evitar": "- Para el historial completo, con filtro y paginación: usar `siaf-tray-notifications-view` (Bandeja › Notificaciones).\n- Para avisar el resultado de una acción del usuario: usar `siaf-snackbar` o `siaf-alert`.\n- Suelto en una pantalla: `open` no lo oculta (lo decide quien lo pinta) y su posición supone la campana del navbar.",
    "teclado": "- **Tab**: al abrir, el foco entra en «Marcar todas como leídas», si hay no leídas, o en la primera notificación;\n  luego recorre cada notificación y puede salir del panel (no atrapa el foco: no es modal).\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve a la campana.\n- **Enter / Espacio**: en una notificación, emite `closed` y, si tiene documento, lo abre; en «Marcar todas como\n  leídas», las marca.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: encabezado `h3` y notificaciones en lista `ul`/`li`; cada una es un\n  `<button>` cuyo nombre reúne título, fecha, mensaje y número del documento.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: título `text-text` 16.29:1 / 16.53:1, mensaje `text-neutral-medium`\n  14.53:1 / 12.87:1, fecha `text-neutral-low` 5.01:1 / 8.86:1 y código blanco sobre `bg-brand-accent` 4.89:1 / 5.65:1;\n  pero «Marcar todas como leídas» usa la clase `text-brand-primary` (azul de fondo de marca) y en oscuro queda en\n  2.66:1.\n- **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro\n  / 10.15:1 oscuro sobre la superficie).\n- **Pendiente · 2.4.3 Orden del foco (A)**: con `siafFoco` (sin atrapar Tab) el foco entra al abrir y Escape cierra\n  devolviéndolo a la campana, pero al marcar todas como leídas el botón desaparece y el foco se pierde.\n- **2.4.7 Foco visible (AA)**: «Marcar todas como leídas» y cada notificación muestran un contorno azul de 2 px con\n  `focus-visible`.\n- **4.1.2 Nombre, función y valor (A)**: el panel es `role=\"dialog\"` con `aria-label=\"Notificaciones\"`, y la campana\n  de `siaf-navbar` publica `aria-expanded` y `aria-haspopup=\"dialog\"`.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: la carga se marca con `role=\"status\"` y `aria-live=\"polite\"`, pero no\n  se anuncia el resultado: ni el vacío «No tienes notificaciones nuevas.» ni el marcado de todas como leídas.",
    "figma": [],
    "aria": {
      "roles": [
        "dialog",
        "status"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "py-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-2",
        "via": [
          "shadow-siaf-elevation-2"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-page-header",
    "clase": "PageHeaderComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/page-header/page-header.component",
    "archivo": "src/app/shared/components/page-header/page-header.component.ts",
    "descripcion": "Header simple de pagina (titulo en mayusculas + slot de acciones).\n\nVariante \"ligera\" de `siaf-solicitude-header`, sin estados de\ndocumento ni eventos de workflow. Pensado para pantallas que solo\nnecesitan un titulo y opcionalmente un boton/grupo de acciones a\nla derecha (p. ej. \"Consultas y reportes …\" con CTA Busqueda).\n\nSlot:\n  <ng-content select=\"[actions]\" />  -> bloque a la derecha\n\nEjemplo:\n\n  <siaf-page-header title=\"Consultas y reportes …\">\n    <siaf-button actions variant=\"accent\" icon=\"manage_search\">\n      Busqueda\n    </siaf-button>\n  </siaf-page-header>",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "subtitle",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Como encabezado de las pantallas «Consultas y reportes» dentro de `siaf-page-shell` (plan de cuentas, asiento de\n  ajuste, catálogo de tipos de asiento, contabilización y libros contables), con el botón «Búsqueda» en `[actions]`.\n- En listados o vistas de solo lectura que solo necesitan título, subtítulo opcional y una o dos acciones a la derecha.",
    "evitar": "- En pantallas de solicitud con estados y botones del flujo: usar `siaf-solicitude-header` (o\n  `siaf-solicitude-page-layout`, que ya lo trae).\n- Como título de una sección o tarjeta: pinta un `h1`; usar el título de la tarjeta (`siaf-solicitude-form-card`).\n- Más de uno por página: cada uno agrega otro `h1`.",
    "teclado": "- No recibe foco: no es interactivo. Las acciones proyectadas en `[actions]` siguen su componente (`siaf-button`).",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: el título es el `h1` de la página y el subtítulo, un párrafo; el `header` no\n  funciona como banner porque vive dentro del `main` del shell.\n- **2.4.3 Orden del foco (A)**: las acciones van después del título en el DOM, igual que en pantalla.\n- **Pendiente · 2.1.1 Teclado (A)**: desde `sm` el título y el subtítulo se cortan y el texto completo sale con\n  `siafTooltip`, que se abre con el mouse o con el foco; como no son enfocables, con teclado no se puede ver (el\n  lector de pantalla sí lee el texto entero).\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` (16.29:1 / 16.53:1) y subtítulo `text-neutral-medium`\n  (14.53:1 / 12.87:1) sobre `bg-surface`.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-page-shell",
    "clase": "PageShellComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/page-shell/page-shell.component",
    "archivo": "src/app/shared/components/page-shell/page-shell.component.ts",
    "descripcion": "Esqueleto de pagina autenticada NO formulario.\n\nRenderiza el breadcrumb, deja al consumidor inyectar el header\n(slot `[pageHeader]`) y el cuerpo principal (slot default).\nPensado para las pantallas de \"Consultas y reportes …\", listados\nsimples y otras vistas que no necesitan el ciclo de un\n`siaf-solicitude-page-layout` (estados de documento, acciones de\nverificacion/aprobacion, etc.).\n\nEjemplo:\n\n  <siaf-page-shell [breadcrumbs]=\"breadcrumbs\">\n    <siaf-page-header pageHeader title=\"...\" />\n    <siaf-empty-state ... />\n  </siaf-page-shell>",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "breadcrumbs",
        "tipo": "BreadcrumbItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "homeHref",
        "tipo": "string",
        "porDefecto": "'/panel'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para las pantallas «Consultas y reportes» de cada proceso (plan de cuentas, asiento de ajuste, catálogo de tipos de\n  asiento, contabilización y libros contables): breadcrumb, `siaf-page-header` en `[pageHeader]` y el resultado o\n  `siaf-empty-state` en el cuerpo.\n- Para listados simples y vistas de solo lectura que no tienen el ciclo de una solicitud.",
    "evitar": "- Para solicitudes con estados y acciones del flujo: usar `siaf-solicitude-page-layout`.\n- Para la pantalla Documentos / Registros de un proceso: usar `siaf-documents-records-page`, que ya trae breadcrumb,\n  título y pestañas.\n- Sin `siaf-page-header` en `[pageHeader]`: la página queda sin `h1`.\n- Dentro de otro contenedor con alto propio: fija su alto a la ventana menos el navbar (`100vh - 56px`).",
    "teclado": "- No recibe foco: no es interactivo. El breadcrumb y el contenido proyectado siguen su componente.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: pinta el breadcrumb (`siaf-breadcrumb`, un `nav` con\n  `aria-label=\"Ruta de navegación\"`) y no trae encabezado propio: el `h1` lo pone el `siaf-page-header` proyectado en\n  `[pageHeader]`. No agrega landmarks: vive dentro del `main` del shell.\n- **2.4.3 Orden del foco (A)**: el DOM sigue el orden visual: breadcrumb, encabezado con sus acciones y cuerpo.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-lowest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-breadcrumb"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-pagination",
    "clase": "PaginationComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/pagination/pagination.component",
    "archivo": "src/app/shared/components/pagination/pagination.component.ts",
    "descripcion": "Paginación de las grillas: contador «1-10 de 800» y flechas Página anterior / Página siguiente, que se deshabilitan\nsolas en la primera y la última página.\n\nCon `position=\"Bottom\"` y `rowPage` suma a la izquierda el select nativo de filas por página; en `Top` es la versión\ncompacta que pinta `siaf-table-controls`. Solo emite eventos (`previous`, `next`, `rowsPerPageChange`): el padre\ncambia `page` y las filas.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "counterPage",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "navigation",
        "tipo": "'Inactive' | 'Activate'",
        "porDefecto": "'Activate'",
        "requerida": false,
        "descripcion": "'Activate' (default): flechas navegables — se deshabilitan solas en los bordes (page 1 / última). 'Inactive' fuerza ambas deshabilitadas."
      },
      {
        "nombre": "page",
        "tipo": "number",
        "porDefecto": "1",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "pageSize",
        "tipo": "number",
        "porDefecto": "10",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "position",
        "tipo": "'Top' | 'Bottom'",
        "porDefecto": "'Top'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rowPage",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rowsPerPage",
        "tipo": "number",
        "porDefecto": "10",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rowsPerPageOptions",
        "tipo": "number[]",
        "porDefecto": "[10, 25, 50, 100]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "totalItems",
        "tipo": "number",
        "porDefecto": "800",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "totalPages",
        "tipo": "number",
        "porDefecto": "1",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "next",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "previous",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "rowsPerPageChange",
        "tipo": "number",
        "descripcion": null
      },
      {
        "nombre": "rowsPerPageOpened",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Debajo de toda grilla, con `position=\"Bottom\"` y `[rowPage]=\"true\"`: bandeja, pestañas Documentos / Registros,\n  panel lateral de selección, listados de Admin y tablas de solicitudes y consultas.\n- Con `rowsPerPageOptions` propias si la tabla usa otros tamaños (detalle anual de apertura contable, pedidos de\n  contabilización).",
    "evitar": "- `position=\"Top\"` suelta sobre la tabla: la barra superior es siempre `siaf-table-controls`, que ya la incluye.\n- Forzar `navigation=\"Inactive\"` cuando todo cabe en una página: `Activate` (por defecto) ya deshabilita las flechas\n  en los bordes.\n- Para avanzar por las etapas de un flujo: `siaf-steps` o `siaf-button`.",
    "teclado": "- **Tab**: recorre el select de filas por página (con `rowPage`) y las flechas; una flecha deshabilitada queda fuera.\n- **Enter / Espacio**: en una flecha, cambian de página (emiten `previous` o `next`).\n- **Flechas arriba / abajo**: en el select nativo eligen otra cantidad de filas (emite `rowsPerPageChange`).",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es un `<nav aria-label=\"Paginación\">`; en la grilla estándar hay dos con el\n  mismo nombre (el de `siaf-table-controls` arriba y este abajo).\n- **4.1.2 Nombre, función y valor (A)**: las flechas son `<button>` con `aria-label` («Página anterior», «Página\n  siguiente») y `disabled` en los bordes; el select lleva `aria-label` «Filas por página».\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: el contador es un `<span>` sin `role=\"status\"` ni `aria-live`:\n  cambiar de página o de filas por página, o filtrar, no se anuncia.\n- **Pendiente · 2.4.3 Orden del foco (A)**: al llegar a la primera o la última página, la flecha enfocada pasa a\n  `disabled` y el componente no mueve el foco a otro control.\n- **1.4.3 Contraste mínimo (AA)**: contador en `text-neutral-low` (5.01:1 / 8.86:1) y valor del select en\n  `text-neutral-high` (16.29:1 / 16.53:1) sobre la superficie.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del select es `border-states-enabled` (2.44:1 /\n  2.59:1). El anillo de foco ya es el azul del kit (`border-states-focus`, 5.35:1 / 10.15:1).\n- **2.4.7 Foco visible (AA)**: el select y las flechas muestran un anillo de 2 px `border-states-focus` separado\n  2 px. El del select antes no se pintaba: con `outline-none`, Tailwind v4 dejaba el estilo del contorno en `none`.\n- **2.5.8 Tamaño del objetivo (AA)**: flechas de 40 px y select de 32 px de alto.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "pl-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "right-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-parametros-aplicados",
    "clase": "ParametrosAplicadosComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/parametros-aplicados/parametros-aplicados.component",
    "archivo": "src/app/shared/components/parametros-aplicados/parametros-aplicados.component.ts",
    "descripcion": "«Parámetros aplicados» de Consultas y reportes (Figma «Guía de Estructura de Pantallas», nodo 22402:16429): una\nfila de tarjetas con el ícono, el nombre y el valor de cada parámetro con que se hizo la consulta. Las tarjetas son\n`siaf-list` horizontal con borde, dentro de un carril con desplazamiento; si no entran todas, a la derecha aparece\nun botón con `chevron_right` sobre un desvanecido que avanza el carril y, cuando ya avanzó, a la izquierda otro con\n`chevron_left` que retrocede. Cada botón aparece solo si hay tarjetas de su lado.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "parametros",
        "tipo": "readonly ParametroAplicado[]",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Arriba de los resultados de una consulta, para mostrar con qué parámetros se buscó, cada uno con su ícono.\n- Con muchos parámetros o valores largos: el carril se desplaza y cada valor se corta con tooltip.",
    "evitar": "- Para elegir o cambiar un parámetro: las tarjetas no son interactivas; la búsqueda se cambia desde la cabecera de\n  la consulta, con `siaf-filter-pill` o con `siaf-custom-filter`.\n- Cuando la pantalla necesita «Quitar filtros»: este bloque no lo tiene (así está en el Figma); las consultas de hoy\n  siguen con `siaf-consultas-filtros-chips`.",
    "teclado": "- **Tab**: cuando las tarjetas no entran, el carril recibe el foco y las flechas izquierda y derecha lo desplazan;\n  después llega a los botones que retroceden y avanzan (los que estén a la vista).\n- **Enter / Espacio**: en un botón, retroceden o avanzan el carril.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: título `<h3>` y las tarjetas como `<ul>` / `<li>` de `siaf-list`; cada una se\n  lee «Nombre, valor».\n- **2.1.1 Teclado (A)**: el carril con desplazamiento es una `region` enfocable con nombre («Parámetros aplicados»),\n  así las tarjetas que no entran se alcanzan sin mouse; los botones hacen lo mismo con un clic.\n- **4.1.2 Nombre, función y valor (A)**: los botones se llaman «Ver parámetros anteriores» y «Ver más parámetros».\n- **2.4.3 Orden del foco (A)**: al llegar a un extremo desaparece el botón de ese lado; si tenía el foco, este pasa al\n  botón del otro lado (o al carril) en vez de perderse.\n- **1.1.1 Contenido no textual (A)**: los íconos son decorativos; el nombre del parámetro va como texto.\n- **2.4.7 Foco visible (AA)**: el carril y el botón muestran el anillo `border-states-focus` (5.35:1 / 10.15:1).\n- **1.4.11 Contraste no textual (AA)**: el borde de las tarjetas es decorativo (`border-states-enabled`); cada tarjeta\n  se distingue también por su espacio y su contenido.",
    "figma": [
      {
        "nodo": "22402:16429",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "region"
      ],
      "atributos": [
        "aria-hidden",
        "aria-labelledby"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface",
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "siaf-button",
      "siaf-list"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-popover",
    "clase": "PopoverComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/popover/popover.component",
    "archivo": "src/app/shared/ui/popover/popover.component.ts",
    "descripcion": "Popover: panel flotante anclado a un disparador, con título, texto y acciones de texto al pie\n(Figma UI KIT, nodo 9059:20300: «Full», «Title + Content» y «Content + Actions»).\n\nEl disparador se proyecta con el atributo `popover-trigger` y el padre controla `open`. Se arman los\ntres tipos con `title`, `text` y `actions`; para contenido más rico, lo que se proyecte sin atributo va\ndebajo del texto. Emite `closed` con Escape o al pulsar fuera, y `action` al elegir un botón.\n\nPara el texto completo de algo truncado va `siafTooltip`; para una lista de opciones, `siaf-menu` o\n`siaf-icon-dropdown-menu`.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "actions",
        "tipo": "PopoverAction[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "align",
        "tipo": "'start' | 'end'",
        "porDefecto": "'end'",
        "requerida": false,
        "descripcion": "Borde del disparador con el que se alinea el panel: `end` (derecha, por defecto) o `start`."
      },
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre accesible del panel cuando no tiene `title`."
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "text",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "action",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para una explicación breve anclada a un control que el usuario abre con un clic: la ayuda de un campo de la\n  solicitud o qué significa un estado.\n- Para una confirmación liviana con una o dos acciones de texto al pie («Ver detalle», «Cerrar») sin bloquear la\n  pantalla.\n- Hoy sin uso en la app: el padre controla `open` desde el disparador proyectado con `popover-trigger`.",
    "evitar": "- Para el texto completo de algo truncado: usar `siafTooltip`.\n- Para una lista de opciones o comandos: usar `siaf-menu` o `siaf-icon-dropdown-menu`.\n- Para confirmar acciones irreversibles (Eliminar, Anular) o pedir datos: usar `siaf-modal` o\n  `siaf-annulment-modal`.\n- Para contenido largo o formularios: usar `siaf-side-nav` (o `siaf-side-panel` si necesita todo el ancho).",
    "teclado": "- **Escape**: emite `closed` si está abierto; el padre pone `open` en false.\n- **Tab**: al abrir, el foco entra en la primera acción (o en el panel, si no tiene); salir con Tab emite `closed`.\n- **Enter / Espacio** en una acción: emiten `action` con su `value` (o su `label`).",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: el panel es `role=\"dialog\"` con nombre desde `title` (`aria-labelledby`) o\n  desde `ariaLabel`; el padre debe dar `ariaLabel` si no hay título y poner `aria-expanded` en el disparador, que el\n  componente no toca.\n- **1.4.13 Contenido en hover o foco (AA)**: no depende del hover: queda visible hasta Escape, un clic fuera o que\n  el padre lo cierre, y se puede recorrer con el puntero sin que desaparezca.\n- **2.1.2 Sin trampas de teclado (A)**: no retiene el foco; Tab sale del panel y Escape lo cierra.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en el panel y al cerrarse (Escape, una acción\n  o salir con Tab) vuelve al disparador.\n- **2.4.7 Foco visible (AA)**: las acciones muestran un contorno de 2 px `border-states-focus` separado 2 px.\n- **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /\n  10.15:1 oscuro sobre la superficie).\n- **2.5.8 Tamaño del objetivo (AA)**: cada acción mide al menos 32 px de alto.",
    "figma": [
      {
        "nodo": "9059:20300",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-labelledby"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "pt-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "pb-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "px-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-6",
        "via": [
          "shadow-siaf-elevation-6"
        ]
      }
    ],
    "usa": [
      "[siafFoco]"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-process-menu-tree",
    "clase": "ProcessMenuTreeComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/process-menu-tree/process-menu-tree.component",
    "archivo": "src/app/layout/process-menu-tree/process-menu-tree.component.ts",
    "descripcion": "Árbol canónico de procesos del shell: el menú jerárquico que abre la opción \"Procesos\" del sidebar.\n\nSus datos por defecto son `DEFAULT_PROCESS_TREE` de `shared/utils/process-tree.util` (este archivo solo\nre-exporta el tipo y las utilidades). Es el único menú en árbol: el shell también lo usa para \"Ajustes\" con\n`ADMIN_MENU_TREE` y otros textos, así que un árbol nuevo es solo otro arreglo de nodos. El campo de búsqueda\nfunciona como paleta de comandos: filtra la navegación en vivo, sin ir al servidor, y expande las ramas\ncon coincidencias. Los nodos `comingSoon` solo expanden — nunca emiten `nodeSelected`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "nodes",
        "tipo": "ProcessMenuNode[]",
        "porDefecto": "DEFAULT_PROCESS_TREE",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "placeholder",
        "tipo": "string",
        "porDefecto": "'Buscar proceso o procedimiento'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "searchLabel",
        "tipo": "string",
        "porDefecto": "'Buscar proceso o procedimiento'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "subtitle",
        "tipo": "string",
        "porDefecto": "'Seleccionar proceso o procedimiento'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "'Procesos'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "nodeSelected",
        "tipo": "ProcessMenuNode",
        "descripcion": null
      }
    ],
    "usar": "- Para el panel Procesos del armazón: `siaf-app-shell` lo abre desde el rail y navega a la `moduleRoute` o\n  `createRoute` del nodo emitido (plan de cuentas contables, catálogo de eventos, asientos de ajuste, apertura\n  contable…).\n- Para el menú Ajustes: el mismo componente con `ADMIN_MENU_TREE` y sus textos (`title`, `subtitle`, `placeholder`,\n  `searchLabel`), con gestión de usuarios, entidades y auditoría.\n- Para cualquier menú jerárquico nuevo del armazón: basta otro arreglo de `ProcessMenuNode`.",
    "evitar": "- Para envolverlo o copiarlo en otro componente de menú: por eso se retiró `siaf-admin-menu`; basta pasarle otros\n  `nodes` y textos.\n- Para mostrar datos jerárquicos de solo lectura dentro de una pantalla: usar `siaf-tree-view`.\n- Para buscar registros en el servidor: usar `siaf-form-table-search` (en Documentos y registros y la bandeja, su\n  variante `siaf-records-search-toolbar`); este buscador solo filtra la navegación en memoria.",
    "teclado": "- **Tab**: pasa por el buscador y su lupa, y luego por los nodos visibles en orden. La lupa no hace nada: el filtro\n  se aplica al escribir.\n- **Escribir en el buscador**: filtra el árbol en vivo, sin distinguir tildes ni mayúsculas, y abre las ramas con\n  coincidencias.\n- **Enter / Espacio** en un nodo: lo marca y emite `nodeSelected`; si tiene hijos, además los muestra u oculta. Los\n  nodos `comingSoon` solo expanden.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con `h2` y `h3`, pero la jerarquía solo se ve\n  (sangría y línea a la izquierda): los nodos son botones en `div` anidados, sin `ul`/`li` ni `role=\"tree\"`, y el\n  lector no anuncia nivel ni cantidad. Además, el `aria-label` del `aside` es fijo («Menu de procesos») y también se\n  lee en Ajustes.\n- **Pendiente · 1.4.1 Uso del color (A)**: el nodo elegido (y su ancestro de primer nivel) se distingue solo por el\n  fondo `bg-states-light-selected` y el color del texto; el peso de la fuente no cambia.\n- **1.4.3 Contraste mínimo (AA)**: en claro, título `text-neutral-high` 16.29:1 y nodos `text-neutral-medium` 14.53:1\n  sobre blanco; en oscuro el panel usa `bg-surfaces-field` y falta medirlo.\n- **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro\n  / 10.15:1 oscuro sobre la superficie).\n- **Pendiente · 2.4.3 Orden del foco (A)**: no toma el foco al abrirse ni cierra con Escape. El armazón lo pinta\n  después del rail: desde Procesos el Tab pasa antes por Ayuda y Ajustes, y si lo pide una página\n  (`ShellNavigationService`) queda antes que el botón que lo abrió.\n- **2.4.7 Foco visible (AA)**: cada nodo muestra un contorno azul de 2 px con `focus-visible`.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: los nodos con hijos publican `aria-expanded`, pero el elegido no\n  publica `aria-current`.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: al filtrar no se anuncia cuántos nodos quedan y, sin coincidencias,\n  el árbol queda vacío y sin mensaje.",
    "figma": [],
    "aria": {
      "roles": [
        "presentation"
      ],
      "atributos": [
        "aria-expanded",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-field",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "pt-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "mr-siaf-md",
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "pt-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "siaf-icon",
      "siaf-input"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-progress-circular",
    "clase": "ProgressCircularComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/progress-circular/progress-circular.component",
    "archivo": "src/app/shared/ui/progress-circular/progress-circular.component.ts",
    "descripcion": "Avance circular: anillo que se llena en sentido horario desde arriba, con el porcentaje al centro y una\netiqueta opcional encima (Figma UI KIT, nodo 20157:95 «Progress/circular»).\n\nEs para un avance determinado (0 a 100 %), como procedimientos completados o ítems conciliados. Para una\nespera sin porcentaje va `siaf-loader` o el spinner de `siaf-loading-progress`. El anillo mide 150 px y\n`size` lo escala junto con los textos; la etiqueta se muestra tal como se escribe y se corta en dos líneas.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Texto sobre el porcentaje (ej. «Completado»)."
      },
      {
        "nombre": "size",
        "tipo": "number",
        "porDefecto": "150",
        "requerida": false,
        "descripcion": "Lado del anillo en px; el grosor y los textos escalan con él."
      },
      {
        "nombre": "value",
        "tipo": "number",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Avance de 0 a 100; se recorta a ese rango."
      }
    ],
    "eventos": [],
    "usar": "- Para un avance determinado de 0 a 100 %, como procedimientos completados o ítems conciliados, con un `label`\n  que diga qué se mide.\n- En un resumen o tablero de proceso donde el porcentaje es el dato principal. Aún no lo usa ninguna pantalla.",
    "evitar": "- Para esperas sin porcentaje: usar `siaf-loader`, o `siaf-loader-overlay` si hay que bloquear la pantalla.\n- Para los pasos de un flujo: usar `siaf-steps` o `siaf-action-tracker`.\n- Para ver cómo se reparte un total entre varias partes: usar `siaf-donut-chart`.\n- Con `size` muy por debajo de 150 px: los textos escalan con el anillo (la etiqueta mide `size` × 0.08) y\n  dejan de leerse.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: es `role=\"progressbar\"` con `aria-valuemin` 0, `aria-valuemax` 100 y\n  `aria-valuenow` redondeado; el nombre es `label`, o «Avance» si no hay.\n- **1.1.1 Contenido no textual (A)**: el anillo SVG va con `aria-hidden` y el porcentaje también está en texto,\n  así que el anillo no es la única pista del avance.\n- **1.4.3 Contraste mínimo (AA)**: etiqueta y porcentaje en `text-neutral-medium`, 14.53:1 sobre la superficie\n  (12.87:1 en oscuro).\n- **4.1.3 Mensajes de estado (AA)**: una barra de progreso no es región viva: si `value` cambia en vivo, el\n  lector no lo anuncia solo y el padre debe avisar los hitos.",
    "figma": [
      {
        "nodo": "20157:95",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "progressbar"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "stroke-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      }
    ],
    "usa": [],
    "sinUso": true
  },
  {
    "selector": "siaf-query-parameters-panel",
    "clase": "QueryParametersPanelComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/query-parameters-panel/query-parameters-panel.component",
    "archivo": "src/app/shared/components/query-parameters-panel/query-parameters-panel.component.ts",
    "descripcion": "Panel lateral «Parámetros de consulta» (Guía de Estructura de Pantallas, nodo 22402:15484): los campos que la\npantalla declara (fechas, selects y selects múltiples con «Seleccionar todo»), «Limpiar todo» y «Aplicar consulta»,\nque se habilita cuando están los obligatorios y hay al menos un valor. Trabaja sobre un borrador: cerrar sin aplicar\nno cambia la consulta, y al volver a abrirlo muestra los parámetros aplicados.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "fields",
        "tipo": "readonly QueryReportParameterField[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "'Parámetros de consulta'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "values",
        "tipo": "QueryReportParameters | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "Parámetros aplicados: el borrador parte de ellos cada vez que se abre."
      }
    ],
    "eventos": [
      {
        "nombre": "applied",
        "tipo": "QueryReportParameters",
        "descripcion": "Valores ingresados, sin los campos vacíos."
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Desde «Parámetros» de `siaf-query-report-page`, que le pasa los `fields` de su configuración y los valores\n  aplicados.\n- `select-multiple` para criterios con varias opciones (entidades, fuentes de financiamiento): la lista trae\n  casillas y «Seleccionar todo».",
    "evitar": "- Para refinar un resultado ya consultado (condiciones, agrupar): eso es «Filtros avanzados».\n- Para elegir registros de un catálogo largo con búsqueda: usar `siaf-selection-side-nav`.\n- Para filtrar una grilla con píldoras: usar `siaf-filter-pill`.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X; recorre los campos, «Limpiar todo» y «Aplicar consulta», y da la vuelta\n  sin salir del panel.\n- **Escape**: cierra el panel sin aplicar (emite `closed`) y el foco vuelve al botón que lo abrió; con una lista\n  abierta, Escape cierra primero la lista.\n- **Enter / Espacio**: en «Aplicar consulta», emite `applied` con los valores y cierra.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"dialog\"` con `aria-modal=\"true\"` y `aria-labelledby` al título; la X\n  se llama «Cerrar» más el título.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al botón que lo\n  abrió.\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.\n- **3.3.2 Etiquetas o instrucciones (A)**: cada campo lleva su etiqueta y el asterisco de obligatorio; «Aplicar\n  consulta» queda deshabilitado hasta completarlos.\n- **1.3.1 Información y relaciones (A)**: el título es un `h2` y los campos van en el orden en que se leen.\n- **2.4.7 Foco visible (AA)**: la X muestra el contorno de 2 px `border-states-focus`; los campos y botones siguen su\n  componente.",
    "figma": [
      {
        "nodo": "22402:15484",
        "nombre": "Sidenav Parámetros de consulta"
      }
    ],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "pb-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "pt-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-8",
        "via": [
          "shadow-siaf-elevation-8"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-date-time-picker",
      "siaf-icon",
      "siaf-input"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-query-report-page",
    "clase": "QueryReportPageComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/query-report-page/query-report-page.component",
    "archivo": "src/app/shared/components/query-report-page/query-report-page.component.ts",
    "descripcion": "Plantilla de pantalla «Consultas y reportes» (Guía de Estructura de Pantallas, nodo 9455:107865): la nueva versión de\nlas consultas, armada desde un `QueryReportConfig`. Antes de consultar muestra el estado vacío; «Parámetros» abre\n`siaf-query-parameters-panel` y, al aplicar, emite `queried` para que la pantalla traiga el resultado. Con resultado\npinta «Parámetros aplicados», y en «Resultado de reporte» las pestañas, la card resumen, el buscador (Filtrar y\nColumnas), los filtros predeterminados, la tabla de datos detallada y la paginación. Buscar, filtrar y paginar\nocurren sobre las filas recibidas.\n\nCon `charts` en la configuración, el encabezado del resultado suma el selector «Vista de datos | Vista de gráficas»\n(nodo 22715:21316) y la vista de gráficas (nodo 22402:16766): tarjetas KPI y gráficos calculados con las mismas filas\nque muestra la tabla, es decir, después de buscar y filtrar; un gráfico que se queda sin datos muestra un aviso en vez\nde ejes vacíos. Esa vista se carga con `@defer` al abrirla, así Chart.js\nno pesa en la pantalla hasta que alguien la usa. «Exportar» abre el menú Excel, CSV y PDF y emite `exported` con el\nformato.\n\nNo llama a la API: la pantalla consulta y entrega `result` (con `loading` mientras tanto).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "activeTab",
        "tipo": "string",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Pestaña activa al empezar; por defecto, la primera."
      },
      {
        "nombre": "config",
        "tipo": "QueryReportConfig",
        "porDefecto": null,
        "requerida": true,
        "descripcion": null
      },
      {
        "nombre": "loading",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Mientras la pantalla consulta: la tabla o las gráficas pasan a esqueleto y «Exportar» se deshabilita."
      },
      {
        "nombre": "result",
        "tipo": "QueryReportResult | null",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Resultado de la consulta (o de la pestaña) para los parámetros aplicados."
      }
    ],
    "eventos": [
      {
        "nombre": "advancedFiltersRequested",
        "tipo": "void",
        "descripcion": "«Filtrar» del buscador (Filtros avanzados)."
      },
      {
        "nombre": "columnsRequested",
        "tipo": "void",
        "descripcion": "«Columnas» del buscador (Columnas visibles)."
      },
      {
        "nombre": "exported",
        "tipo": "QueryReportExportEvent",
        "descripcion": "Un formato de «Exportar»: la pantalla genera el archivo con las filas recibidas."
      },
      {
        "nombre": "favoritesRequested",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "linkClicked",
        "tipo": "{ row: ReportTableRow; column: ReportTableColumn; }",
        "descripcion": null
      },
      {
        "nombre": "queried",
        "tipo": "QueryReportParameters",
        "descripcion": "«Aplicar consulta»: la pantalla consulta con estos parámetros y entrega `result`."
      },
      {
        "nombre": "tabChanged",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Para una pantalla «Consultas y reportes» de un proceso: título, migas, campos de parámetros, columnas (con grupos y\n  la última fija), pestañas y filtros predeterminados en la configuración.\n- `tabs` cuando el reporte tiene varias vistas del mismo resultado: la pantalla recibe `tabChanged` y entrega el\n  resultado de esa pestaña.\n- `charts` para la vista de gráficas: cada KPI suma una columna (o cuenta filas), con un filtro opcional por valor, y\n  cada gráfico agrupa por una columna (o por mes, con una fecha), en valores, índice respecto de la primera categoría\n  (`index`) o variación respecto de ella (`change`). `width: 'narrow'` pone un gráfico en la columna de 336 px a la\n  derecha del anterior, como en el Figma.\n- `exported` para generar el archivo: trae el formato elegido y las filas que quedaron tras buscar y filtrar.\n- `favoritesRequested`, `advancedFiltersRequested` y `columnsRequested` para lo que la pantalla resuelve por su cuenta\n  mientras la plantilla no traiga esos paneles.",
    "evitar": "- Para la bandeja de documentos y registros de un proceso: usar `siaf-documents-records-page`.\n- Para una vista de solo lectura que no es un reporte: usar `siaf-page-shell` con `siaf-page-header`.\n- Maquetar otra consulta con estado vacío, panel de búsqueda y tabla a mano: pasar su configuración a esta\n  plantilla.\n- Calcular los KPI o los gráficos en la pantalla y pintarlos aparte: declararlos en `charts`, así siguen a la búsqueda\n  y a los filtros de la tabla.",
    "teclado": "- **Tab**: recorre las migas, «Favoritos» y «Parámetros», las tarjetas de parámetros aplicados, el selector de vista,\n  «Exportar», las pestañas y, en la vista de datos, el buscador y sus botones, los filtros, la tabla y la paginación;\n  en la de gráficas, cada gráfico.\n- **Enter** en el buscador: busca en todas las columnas (sin distinguir mayúsculas ni tildes) y vuelve a la primera\n  página.\n- El panel de parámetros, el selector de vista, el menú «Exportar», las pestañas, las píldoras, la tabla y los\n  gráficos siguen su componente.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: el título de la pantalla es el `h1` de `siaf-page-header`; el de la tarjeta\n  del resultado, un `h2`, y el de cada gráfico, el `h3` de `siaf-chart-section`.\n- **4.1.2 Nombre, función y valor (A)**: el selector de vista es un grupo «Vista del resultado» con `aria-pressed` en\n  cada botón, nombrado como su tooltip; «Exportar» anuncia su menú con `aria-haspopup` y `aria-expanded`.\n- **4.1.3 Mensajes de estado (AA)**: el total de filas tras buscar o filtrar se anuncia en una región\n  `aria-live=\"polite\"` que no se ve.\n- **2.4.3 Orden del foco (A)**: al cerrar el panel de parámetros el foco vuelve a «Parámetros».\n- **3.2.2 Al introducir datos (A)**: escribir en el buscador no cambia la tabla hasta pulsar Enter; elegir un filtro\n  predeterminado sí filtra al momento, y se anuncia.\n- **1.1.1 Contenido no textual (A)**: cada gráfico se llama como su título y lleva su tabla de datos oculta; con una\n  búsqueda o un filtro activos, una nota avisa con cuántas filas se calcularon.\n- **1.4.10 Reajuste del contenido (AA)**: en pantallas angostas las acciones del encabezado bajan, las tarjetas KPI\n  y los gráficos pasan a una columna y la tabla se desplaza dentro de su zona, sin desplazar la página.",
    "figma": [
      {
        "nodo": "9455:107865",
        "nombre": "Query and Report"
      },
      {
        "nodo": "22715:21316",
        "nombre": "Content head"
      },
      {
        "nodo": "22402:16766",
        "nombre": "Query and report - Charts result - 01"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-labelledby",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md",
          "pb-siaf-md",
          "pt-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "py-siaf-xl"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "message-box",
      "siaf-bar-chart",
      "siaf-button",
      "siaf-buttons-group",
      "siaf-chart-section",
      "siaf-diverging-chart",
      "siaf-donut-chart",
      "siaf-empty-state",
      "siaf-filter-pill",
      "siaf-form-table-search",
      "siaf-icon-dropdown-menu",
      "siaf-kpi-card",
      "siaf-line-chart",
      "siaf-page-header",
      "siaf-page-shell",
      "siaf-pagination",
      "siaf-parametros-aplicados",
      "siaf-query-parameters-panel",
      "siaf-report-summary-card",
      "siaf-report-table",
      "siaf-table-skeleton",
      "siaf-tabs"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-radio-group",
    "clase": "RadioComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/radio/radio.component",
    "archivo": "src/app/shared/ui/radio/radio.component.ts",
    "descripcion": "Grupo de radios (`siaf-radio-group`) con leyenda, marca de requerido y `ControlValueAccessor`.\n\nÚsalo para toda selección excluyente; con `[inline]` las opciones van en una sola línea, que es\nel formato de las preguntas Si/No. El color de la marca se pinta con `accent-*`, nunca con\n`text-*` (eso exigiría el plugin de forms de Tailwind).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "inline",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Opciones en una sola línea (ej. Si/No), en vez de apiladas."
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "name",
        "tipo": "string",
        "porDefecto": "'radio-group'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "options",
        "tipo": "RadioOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "required",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "valueChange",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Para las preguntas Sí/No en una línea con `[inline]`: «Cuenta Única del Tesoro (CUT)» y «¿Vigente?» en el catálogo\n  de eventos, «¿Tiene vigencia?» en el de eventos contables.\n- Para una sola opción entre pocas (2 a 5) que conviene ver todas a la vez; sin `inline` van apiladas.\n- Con `label`, para que el grupo tenga `legend`, y con un `name` propio por grupo.",
    "evitar": "- Para listas largas o que vienen de un catálogo: usar `siaf-input` con `type=\"select\"` o, si hay que buscar,\n  `siaf-selection-side-nav`.\n- Para marcar varias opciones o encender algo al instante: casillas o `siaf-switch`.\n- Repetir a mano los `input type=\"radio\"` con `accent-brand-primary`, como aún hacen las secciones de vigencia y de\n  dinámica del formulario de cuenta contable.\n- Dos grupos en la misma pantalla con el `name` por defecto: comparten `radio-group` y se desmarcan entre sí.",
    "teclado": "- **Tab**: entra al grupo por la opción marcada y sale de él.\n- **Flechas**: pasan a la opción anterior o siguiente y la marcan (radio nativo).\n- **Espacio**: marca la opción enfocada.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: `fieldset` con `legend` (el `label`) y cada radio dentro de su `<label>`.\n  El padre debe dar `label`: sin él el grupo queda sin nombre, como hoy en los formularios de eventos, que ponen la\n  pregunta fuera del componente.\n- **4.1.2 Nombre, función y valor (A)**: radios nativos: el navegador publica el rol, el marcado y `disabled`. El\n  padre debe dar un `name` único por grupo.\n- **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: el asterisco solo existe en la `legend`, y `aria-required` va\n  en cada radio, rol que no lo admite en ARIA 1.2 (sí `radiogroup`).\n- **Pendiente · 3.3.1 Identificación de errores (A)**: no tiene entrada de error ni `aria-invalid`; el aviso de un\n  grupo obligatorio sin respuesta lo tiene que pintar y asociar el padre.\n- **2.4.7 Foco visible (AA)**: no define estilo propio; queda el anillo de foco nativo del navegador.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el círculo lo dibuja el navegador y, marcado, lo pinta\n  `accent-brand-primary`: 8.79:1 en claro, pero 2.66:1 en oscuro.\n- **2.5.8 Tamaño del objetivo (AA)**: cada opción es una `label` de 40 px de alto, clicable entera.\n- **1.4.3 Contraste mínimo (AA)**: opciones y `legend` en `text-neutral-high` 16.29:1; asterisco\n  `text-feedback-danger` 9.84:1.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-required"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "accent-brand-primary"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-readonly",
    "clase": "ReadonlyComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/readonly/readonly.component",
    "archivo": "src/app/shared/ui/readonly/readonly.component.ts",
    "descripcion": "Bloque de solo lectura: etiqueta en mayúsculas sobre el valor, dentro de un recuadro gris.\n\nHoy no tiene consumidores: los datos de solo lectura se pintan con `siaf-text-field [disabled]`\no con `siaf-summary-card`. Ojo, `siaf-readonly-field` es un componente distinto: no lo confundas\ncon este.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Solo si un diseño pide el bloque gris con la etiqueta en mayúsculas sobre el valor; hoy ninguna pantalla lo usa.\n- Para un dato de contexto suelto dentro de un panel o modal (Entidad, Año fiscal) que debe verse como bloque.",
    "evitar": "- Para el modo lectura de una solicitud o los criterios de una consulta: usar `readonly-field`, que es el que usan\n  las pantallas.\n- Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`; para un aviso breve, `message-box`.\n- Para un dato que el usuario puede cambiar: usar `siaf-input`.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es texto estático: la etiqueta va antes del valor en el DOM, así que se\n  leen juntos y en orden; no usa `dt`/`dd` ni `aria-labelledby`.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: la etiqueta de 12 px va en `text-neutral-low` sobre\n  `bg-surfaces-surface-high` (`bg-surface-muted`), par que la tabla no mide: con los valores del tema claro no llega\n  a 4.5:1 (sobre `surface-low`, un fondo más claro, ya baja a 4.64:1).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [],
    "sinUso": true
  },
  {
    "selector": "siaf-record-status-tag",
    "clase": "RecordStatusTagComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/record-status-tag/record-status-tag.component",
    "archivo": "src/app/shared/ui/record-status-tag/record-status-tag.component.ts",
    "descripcion": "Etiqueta del estado de un registro (Activo, Anulado, Abierto, Cerrado, Procesado…), dibujada con `siaf-status-tag`.\nLos estados que están en el Figma siguen su familia: Abierto y Cerrado, las «Period tags» (fondo suave azul y gris,\nsin ícono); En Proceso y Validado, las «status items tags» (solo borde, azul, con `change_circle` y `fact_check`).\nActivo, Inactivo, Anulado, Eliminado y Procesado, que el Figma no tiene, van con fondo suave, su ícono y su tono de\nsiempre.\n\nEs la etiqueta del estado del registro, junto con `siaf-flow-status-tag` para el estado del flujo de la solicitud:\nel mapa de estado a estilo vive aquí.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "size",
        "tipo": "'standard' | 'small'",
        "porDefecto": "'small'",
        "requerida": false,
        "descripcion": "`small` (24 px) o `standard` (32 px)."
      },
      {
        "nombre": "status",
        "tipo": "'Validado' | 'Procesado' | 'Eliminado' | 'Anulado' | 'Activo' | 'Inactivo' | 'En Proceso' | 'Abierto' | 'Cerrado'",
        "porDefecto": "'Activo'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- En la columna de estado de las grillas de Admin (usuarios, entidades, unidades, correlativos) y de las\n  consultas del catálogo de tipos de asiento de ajuste.\n- En Apertura contable, para el estado del ejercicio, de los periodos y de los pliegos (Abierto, Cerrado).\n- En «Estado del registro» del historial (`siaf-account-history-panel`, `siaf-asiento-history-panel`) y en la\n  columna de estado de `siaf-documents-records-table`.\n- `small` (24 px, el valor por defecto) en tablas; `standard` (32 px) sola.",
    "evitar": "- Para el estado del flujo de una solicitud (Elaborado, Verificado, Observado): usar `siaf-flow-status-tag`.\n- Para otros estados con los tonos del Figma: usar `siaf-status-tag` directo.\n- Para etiquetas libres, categorías o filtros: usar `siaf-tag`; para contadores, `siaf-badge`.\n- Como control por sí mismo: si el estado dispara una acción, envolverlo en un `<button>` con `aria-label` que\n  diga la acción, como los periodos abiertos en la configuración de Apertura contable.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.4.1 Uso del color (A)**: el estado va escrito; el tono y el ícono solo lo refuerzan.\n- **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`siaf-icon` con `aria-hidden`); el estado se lee del\n  texto.\n- **1.4.3 Contraste mínimo (AA)**, en claro: con fondo suave, 5.81:1 en azul, 11.46:1 en gris y 6.21:1 en rojo;\n  con solo borde (En Proceso y Validado), 8.29:1 en azul sobre la superficie.\n- **1.3.1 Información y relaciones (A)**: es un `<span>`; el contexto lo da el padre (cabecera de la columna o\n  la etiqueta «Estado del registro»).\n- **4.1.3 Mensajes de estado (AA)**: no es región viva: un cambio de estado no se anuncia desde la etiqueta.",
    "figma": [
      {
        "nodo": "19299:105",
        "nombre": "Period tags"
      },
      {
        "nodo": "6756:221",
        "nombre": "status items tags"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [],
    "usa": [
      "siaf-status-tag"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-records-search-toolbar",
    "clase": "RecordsSearchToolbarComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/records-search-toolbar/records-search-toolbar.component",
    "archivo": "src/app/shared/components/records-search-toolbar/records-search-toolbar.component.ts",
    "descripcion": "Variante de `siaf-form-table-search` para Documentos y registros: el mismo campo con lupa a todo el ancho, pero sin\nlos botones fijos Filtrar y Más opciones; las acciones de la derecha se proyectan con el atributo `actions`. En\nDocumentos y registros son los menús Campos, Favorito y Más opciones (`siaf-icon-dropdown-menu`). Siempre lleva sus\nacciones: no hay variante sin ellas. En pantallas angostas las acciones bajan debajo del campo.\n\n```html\n<siaf-records-search-toolbar [value]=\"busqueda\" placeholder=\"Buscar\" (searchSubmit)=\"buscar($event)\">\n  <ng-container actions>\n    <siaf-icon-dropdown-menu icon=\"layers\" ariaLabel=\"Campos\" [items]=\"campos\" />\n    <siaf-icon-dropdown-menu icon=\"star_border\" ariaLabel=\"Favorito\" [items]=\"favoritos\" />\n    <siaf-icon-dropdown-menu icon=\"more_vert\" ariaLabel=\"Más opciones\" [items]=\"masOpciones\" />\n  </ng-container>\n</siaf-records-search-toolbar>\n```",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Buscar'",
        "requerida": false,
        "descripcion": "aria-label (también se usa como sr-only para lectores de pantalla)."
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Deshabilita el input."
      },
      {
        "nombre": "placeholder",
        "tipo": "string",
        "porDefecto": "'Buscar'",
        "requerida": false,
        "descripcion": "Placeholder visible."
      },
      {
        "nombre": "value",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Valor actual del input."
      }
    ],
    "eventos": [
      {
        "nombre": "searchSubmit",
        "tipo": "string",
        "descripcion": "Emite al confirmar la búsqueda (Enter o clic en la lupa). La búsqueda ya no se dispara por tecleo: con la búsqueda en el servidor, cada consulta es un viaje HTTP y disparar una por letra sería puro desperdicio. OJO con el nombre: los inputs `type=\"search\"` disparan un evento DOM nativo llamado `search` (Enter y la ✕ de limpiar). Un output llamado igual recibe también ese evento burbujeado, y el handler que espera un string termina pintando \"[object Event]\". Por eso `searchSubmit`."
      },
      {
        "nombre": "valueChange",
        "tipo": "string",
        "descripcion": "Emite el nuevo valor al tipear."
      }
    ],
    "usar": "- En la barra de las pestañas Documentos / Registros (`siaf-documents-records-page`) y en la Bandeja de Documentos\n  (`siaf-tray-documents-view`), con Campos, Favorito y Más opciones proyectados con el atributo `actions`.\n- Cuando las acciones de la derecha cambian según la pantalla: se proyectan, no vienen fijas.",
    "evitar": "- Sin acciones propias, sobre las tablas de las solicitudes o en Apertura contable: `siaf-form-table-search`, el\n  buscador del resto de las pantallas.\n- Para un campo de formulario con etiqueta y validación: `siaf-input`.\n- Para filtros por opciones o por condiciones: `siaf-filter-pill` y `siaf-custom-filter` debajo de la barra, no\n  como acciones.\n- Rehacer el campo con la lupa y los menús a mano: la bandeja lo hacía hasta 2026-09 y quedaba distinta.",
    "teclado": "- **Tab**: recorre el campo, la lupa y después las acciones proyectadas.\n- **Enter**: en el campo, confirma la búsqueda y emite `valueChange` y `searchSubmit` con lo escrito; escribir no\n  busca.\n- **Enter / Espacio**: en la lupa confirman igual. Las acciones siguen su componente (p. ej.\n  `siaf-icon-dropdown-menu`).",
    "accesibilidad": "- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el input `ariaLabel` no se usa en la plantilla, pese a lo que\n  dice su comentario: el nombre del campo sale de `placeholder`, hoy «Buscar» en todas las pantallas. Cada acción\n  proyectada necesita su propio `ariaLabel`.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: el resultado de la búsqueda no se anuncia; la pantalla debe\n  anunciar el total (p. ej. con `role=\"status\"`).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo sin foco es `border-states-enabled` (2.44:1 /\n  2.59:1). El anillo de foco de la lupa ya es el azul del kit (`border-states-focus`, 5.35:1 / 10.15:1).\n- **2.4.7 Foco visible (AA)**: el campo pasa a un borde de 2 px `border-states-focus` (5.35:1 / 10.15:1) y la lupa\n  muestra un anillo de 2 px.\n- **2.5.8 Tamaño del objetivo (AA)**: la lupa mide 24 px; las acciones, lo que defina su componente.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      }
    ],
    "usa": [
      "siaf-input"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-records-tabs",
    "clase": "RecordsTabsComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/records-tabs/records-tabs.component",
    "archivo": "src/app/shared/components/records-tabs/records-tabs.component.ts",
    "descripcion": "Pestañas de la franja debajo del header de la página de bandeja: `Documentos | Registros`.\n\nDibuja con `siaf-tabs` subrayado (Figma «Tabs», Border=False): un cambio de diseño de las pestañas se\nhace en `siaf-tabs`. Queda disponible para cualquier futura bandeja que necesite más pestañas\n(ej. \"Documentos | Registros | Histórico\").",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "activeId",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Pestaña activa. Si no matchea ningún `tab.id`, no se marca ninguna."
      },
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Pestañas'",
        "requerida": false,
        "descripcion": "Nombre accesible de la fila de pestañas."
      },
      {
        "nombre": "tabs",
        "tipo": "RecordsTabItem[]",
        "porDefecto": "[]",
        "requerida": true,
        "descripcion": "Pestañas a renderizar."
      }
    ],
    "eventos": [
      {
        "nombre": "activeIdChange",
        "tipo": "string",
        "descripcion": "Emite el `id` de la pestaña recién activada."
      }
    ],
    "usar": "- Franja «Documentos | Registros» bajo el encabezado de la bandeja (`siaf-documents-records-page`), igual en todos\n  los procesos que la usan.\n- Pestañas de primer nivel de una pantalla de gestión, como «Situación de apertura general | Pliegos» (o Unidades\n  ejecutoras) en la configuración de Apertura contable.\n- Bandejas futuras con más vistas del mismo conjunto de datos (por ejemplo, «Documentos | Registros | Histórico»).",
    "evitar": "- Cuando hace falta la pestaña de carpeta (`border=true`), `fullWidth` o `idBase` para enlazar el panel: usar\n  `siaf-tabs`, que los expone.\n- Para «Detalle | Historial» de un registro: usar `siaf-detail-history-tabs`.\n- Para sub-vistas dentro de una pestaña: usar `siaf-buttons-group`, como en Registros de la bandeja del catálogo de\n  ajuste.",
    "teclado": "- No agrega teclas propias: la fila es `siaf-tabs`.\n- **Tab**: entra en la pestaña activa y el siguiente Tab sale de la fila.\n- **Flecha izquierda / derecha** e **Inicio / Fin**: cambian de pestaña y la activan, lo que emite `activeIdChange`.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: dibuja `siaf-tabs` (`role=\"tablist\"` y pestañas `role=\"tab\"` con\n  `aria-selected`) y le pasa `ariaLabel`, que por defecto dice «Pestañas»: el padre debe dar uno propio, como\n  «Documentos y registros» en la bandeja (la configuración de Apertura contable deja el genérico).\n- **Pendiente · 1.3.1 Información y relaciones (A)**: no expone `idBase` de `siaf-tabs`, así que el contenido no\n  puede enlazarse a su pestaña con `role=\"tabpanel\"` y `aria-labelledby`; hoy ni la bandeja ni Apertura contable\n  marcan el panel.\n- **2.1.1 Teclado (A)**: flechas e Inicio / Fin de `siaf-tabs`; solo la activa entra en el orden de tabulación.\n- **2.4.7 Foco visible (AA)**: heredado de `siaf-tabs`: contorno interior azul de 2 px (`border-states-focus`),\n  también en la pestaña activa, que es la que recibe el foco.\n- **1.4.3 Contraste mínimo (AA)**: activa `text-neutral-activated` (8.79:1 claro / 17.76:1 oscuro) e inactivas\n  `text-neutral-low` (5.01:1 / 8.86:1) sobre `bg-surface`, el fondo de la cabecera de la bandeja.\n- **1.4.1 Uso del color (A)**: la activa va en negrita además del subrayado azul de 2 px.\n- **2.5.8 Tamaño del objetivo (AA)**: pestañas de 40 px de alto.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [],
    "usa": [
      "siaf-tabs"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-report-summary-card",
    "clase": "ReportSummaryCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/report-summary-card/report-summary-card.component",
    "archivo": "src/app/shared/ui/report-summary-card/report-summary-card.component.ts",
    "descripcion": "«Card resumen» del resultado de un reporte (Guía de Estructura de Pantallas, nodo 22402:16450): sobre un fondo gris\ncon borde, una etiqueta en versalitas, el ítem consultado con su ícono, título y descripción, y a la derecha sus\ndatos clave, cada uno con su etiqueta encima y el valor destacado.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Línea de apoyo bajo el título; si no entra, se corta con tooltip."
      },
      {
        "nombre": "fields",
        "tipo": "readonly ReportSummaryField[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Datos clave a la derecha, con su etiqueta encima."
      },
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Ícono de Material Icons del ítem."
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Qué se resume, en versalitas sobre el ítem («Entidad»); también nombra la sección."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": true,
        "descripcion": "Nombre del ítem consultado."
      }
    ],
    "eventos": [],
    "usar": "- En «Resultado de reporte» de `siaf-query-report-page`, entre las pestañas y el buscador, para resumir de qué es el\n  reporte: la entidad, la cuenta o el pliego consultado y sus totales.\n- Con dos o tres `fields` cortos (código, saldo, periodo); la descripción se corta en una línea con tooltip.",
    "evitar": "- Para el ítem elegido desde un panel lateral en una solicitud: usar `siaf-summary-card`, con indicador y ✕.\n- Para los criterios que el usuario aplicó: van en `siaf-parametros-aplicados`.\n- Para un monto con su avance: usar `siaf-kpi-card`.\n- Con muchos datos: no hace scroll; más de tres campos se apilan en pantallas angostas pero cansan la lectura.",
    "teclado": "- No recibe foco: no es interactiva. Si la descripción está cortada, su texto completo aparece con el puntero.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: es una `section` nombrada con la etiqueta; los datos son una lista de\n  definiciones (`dl`), así cada valor se lee con su etiqueta.\n- **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`aria-hidden`): el título dice qué es.\n- **1.4.3 Contraste mínimo (AA)**: título, descripción y valores `text-neutral-medium` sobre `surface-low` (13.46:1\n  claro / 12.09:1 oscuro) y etiquetas `text-neutral-low` (4.64:1 / 8.32:1), la más justa en claro.\n- **1.4.12 Espaciado del texto (AA)**: los textos no tienen alto fijo; el título y los valores pasan a otra línea si\n  no entran.",
    "figma": [
      {
        "nodo": "22402:16450",
        "nombre": "Card resumen"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "pt-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "pb-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-report-table",
    "clase": "ReportTableComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/report-table/report-table.component",
    "archivo": "src/app/shared/ui/report-table/report-table.component.ts",
    "descripcion": "Tabla de datos de un reporte (Guía de Estructura de Pantallas, «Tabla de datos detallada»): cabecera gris en dos\nniveles cuando las columnas tienen `group` (el grupo centrado arriba y cada columna debajo), filas de al menos 48 px\nque pasan a dos líneas si el texto no entra, importes alineados a la derecha, valores `link` en azul y la última\ncolumna fija a la derecha con sombra al desplazar horizontalmente. La cabecera queda fija al desplazar vertical\n(480 px de alto máximo, 320 px en móvil).\n\nNo pagina, no filtra ni ordena: recibe las filas de la página visible.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Resultado del reporte'",
        "requerida": false,
        "descripcion": "Nombre de la tabla y de su zona desplazable."
      },
      {
        "nombre": "columns",
        "tipo": "readonly ReportTableColumn[]",
        "porDefecto": "[]",
        "requerida": true,
        "descripcion": null
      },
      {
        "nombre": "emptyMessage",
        "tipo": "string",
        "porDefecto": "'No se encontraron resultados con los filtros aplicados.'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rowKey",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Clave que identifica cada fila; sin ella se usa la posición."
      },
      {
        "nombre": "rows",
        "tipo": "readonly ReportTableRow[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Filas de la página visible: cada clave de columna con su texto ya formateado."
      }
    ],
    "eventos": [
      {
        "nombre": "linkClicked",
        "tipo": "{ row: ReportTableRow; column: ReportTableColumn; }",
        "descripcion": null
      }
    ],
    "usar": "- En «Resultado de reporte» de `siaf-query-report-page`, con `siaf-pagination` debajo.\n- Con `group` para reportes anchos con columnas emparentadas (Acreditación: secuencia y fecha; Beneficiario: código y\n  descripción) y `fixed` en el importe final, para leerlo mientras se desplaza.\n- `kind: 'link'` en la columna que abre el documento de la fila.",
    "evitar": "- Para grillas con selección de filas y acciones: usar la grilla estándar (`siaf-table-controls` y\n  `siaf-pagination`) o `siaf-documents-records-table`.\n- Para una tabla corta de solo lectura sin grupos: usar `siaf-data-table`.\n- `fixed` en una columna que no es la última: solo se fija la del extremo derecho.",
    "teclado": "- **Tab**: entra en la zona desplazable de la tabla (con flechas se desplaza) y luego en cada enlace.\n- **Enter / Espacio**: en un enlace, emiten `linkClicked` con la fila y la columna.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: tabla real con `thead`; los grupos son `th scope=\"colgroup\"` y las columnas\n  `th scope=\"col\"`, así cada celda se anuncia con su grupo y su columna.\n- **4.1.2 Nombre, función y valor (A)**: la tabla toma su nombre de `ariaLabel`; los enlaces son `button` nativos\n  con el texto del valor.\n- **2.1.1 Teclado (A)**: la zona desplazable es `role=\"region\"` con nombre y `tabindex=\"0\"`, para desplazarla con\n  flechas sin mouse.\n- **2.4.7 Foco visible (AA)**: la zona y los enlaces muestran el contorno de 2 px `border-states-focus`.\n- **4.1.3 Mensajes de estado (AA)**: sin filas, el aviso de la tabla es `role=\"status\"`.\n- **1.4.3 Contraste mínimo (AA)**: cabecera `text-neutral-high` sobre `surface-high` (12.84:1 claro / 14.62:1\n  oscuro), celdas `text-neutral-medium` (14.53:1 / 12.87:1) y enlaces `text-brand-primary` (8.79:1 / 10.15:1) sobre\n  la superficie.",
    "figma": [
      {
        "nodo": "22715:12806",
        "nombre": "Tabla de datos detallada"
      }
    ],
    "aria": {
      "roles": [
        "region",
        "status"
      ],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-primary",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "py-siaf-xl"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-6",
        "via": [
          "shadow-siaf-elevation-6",
          "var()"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-request-approval-modals",
    "clase": "RequestApprovalModalsComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/request-approval-modals/request-approval-modals.component",
    "archivo": "src/app/shared/components/request-approval-modals/request-approval-modals.component.ts",
    "descripcion": "Bloque de modales del flujo de aprobación de una solicitud/documento\n(grabar, verificar, eliminar, aprobar, observar, rechazar) + loader\noverlay + snackbar de confirmación. Reemplaza el bloque idéntico de\n~90 líneas repetido al final de las 5 páginas de request.\n\nEl estado (qué modal está abierto, el comentario de aprobación, etc.)\nlo sigue manejando el padre — este componente solo renderiza y\nreenvía eventos:\n\n  <siaf-request-approval-modals\n    [saveOpen]=\"saveModalOpen\" ...\n    [saving]=\"saving()\"\n    [reason]=\"approvalComment()\"\n    (saveConfirmed)=\"onConfirmSave()\"\n    (saveClosed)=\"saveModalOpen = false\"\n    (approvalClosed)=\"closeApprovalModals()\"\n    ...\n  />",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "approveOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "deleteOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "loaderLabel",
        "tipo": "string",
        "porDefecto": "'Grabando'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "loaderMessage",
        "tipo": "string",
        "porDefecto": "'Grabando solicitud...'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "observeOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "reason",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Comentario de la observación / motivo del rechazo."
      },
      {
        "nombre": "rejectOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rejectReasonType",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rejectReasonTypeOptions",
        "tipo": "string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "requestNumber",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "requestType",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Tipo de acción real ('modificación', 'reversión', …) — pisa la palabra del preset para que el snackbar no diga siempre \"creación\"."
      },
      {
        "nombre": "saveOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "saving",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Acción en curso — deshabilita confirmar y muestra el loader."
      },
      {
        "nombre": "snackbarMessage",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "snackbarOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "snackbarTone",
        "tipo": "'success' | 'error'",
        "porDefecto": "'success'",
        "requerida": false,
        "descripcion": "Tono del snackbar (success/error) y mensaje libre (pisa a variant)."
      },
      {
        "nombre": "snackbarVariant",
        "tipo": "SnackbarVariant",
        "porDefecto": "'custom'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "verifyOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "approvalClosed",
        "tipo": "void",
        "descripcion": "Cierre de cualquiera de los modales de aprobación (approve/observe/reject)."
      },
      {
        "nombre": "approveConfirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "deleteClosed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "deleteConfirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "observeConfirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "reasonChange",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "rejectConfirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "rejectReasonTypeChange",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "saveClosed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "saveConfirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "snackbarClosed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "verifyClosed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "verifyConfirmed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Al final de toda request-page con el ciclo grabar → verificar → aprobar, observar o rechazar: plan de cuentas\n  (solicitud y carga masiva), asiento de ajuste, catálogo de ajuste (tipo y clase), catálogo de eventos (SCE y SCM),\n  eventos contables y apertura contable.\n- Para confirmar y avisar con un solo bloque: `saving` muestra el loader y el snackbar dice el tipo real de acción\n  (`requestType`) y el número de la solicitud (`requestNumber`).\n- Con `snackbarTone=\"error\"` y `snackbarMessage` para mostrar el mensaje del backend cuando la acción falla.",
    "evitar": "- Para una confirmación fuera del flujo de aprobación (p. ej. cambiar contraseña): usar `siaf-modal` directo.\n- En la bandeja: `siaf-documents-records-page` ya trae sus modales de verificar y aprobar múltiples.\n- Para la carga inicial de la página: el loader es solo para acciones; la espera inicial va con `loading` del layout\n  o `siaf-table-skeleton`.\n- Volver a pintar a mano `siaf-modal`, `siaf-loader-overlay` o `siaf-snackbar` junto a él: el padre solo maneja\n  `saveOpen`, `approveOpen`… y los eventos.",
    "teclado": "- No agrega teclado propio: cada confirmación sigue `siaf-modal` (el foco entra al abrir, Tab da la vuelta dentro,\n  Escape cancela y Enter o Espacio activan Cancelar y Aceptar).\n- El aviso sigue `siaf-snackbar`: no toma el foco al aparecer y su X se alcanza con Tab.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: cada confirmación es un `siaf-modal` (`role=\"dialog\"`, `aria-modal`) cuyo\n  nombre es el título del preset: «¿Grabar solicitud?», «¿Aprobar solicitud?», «¿Rechazar solicitud?»…\n- **2.4.3 Orden del foco (A)**: hereda de `siaf-modal` el foco al abrir y la vuelta al disparador al cerrar; el padre\n  debe bajar `saveOpen`, `approveOpen`… a false en vez de destruir el componente.\n- **2.1.2 Sin trampas de teclado (A)**: Escape cierra cada modal como Cancelar y emite `saveClosed`, `verifyClosed`,\n  `deleteClosed` o `approvalClosed`.\n- **4.1.3 Mensajes de estado (AA)**: el resultado se anuncia con `siaf-snackbar` (`role=\"status\"`; `role=\"alert\"` con\n  `snackbarTone=\"error\"`) y la espera con `siaf-loader-overlay` (`role=\"status\"`, `aria-live=\"polite\"` y\n  `loaderLabel` como nombre).\n- **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: observar y rechazar exigen el motivo sin marcarlo como\n  obligatorio (hereda de `siaf-modal`).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el anillo de foco de la X de cada modal queda bajo 3:1\n  (hereda de `siaf-modal`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "bottom-siaf-lg"
        ]
      }
    ],
    "usa": [
      "siaf-loader-overlay",
      "siaf-modal",
      "siaf-snackbar"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-select-options",
    "clase": "SelectOptionsComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/select-options/select-options.component",
    "archivo": "src/app/shared/ui/select-options/select-options.component.ts",
    "descripcion": "Listbox de opciones (simple o múltiple) con check en las seleccionadas y navegación por teclado.\n\nÚsalo como el panel desplegable de un selector: emite el valor elegido, no guarda estado ni pinta\nel input. Quien lo usa decide cómo abrirlo y qué hacer con la selección.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "checkboxes",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Con `multiple`, una casilla nativa por opción en vez del check (Figma «Menu» con casillas)."
      },
      {
        "nombre": "multiple",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "options",
        "tipo": "SelectOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "selectAllLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Con casillas, agrega arriba la fila que marca o desmarca todas («Seleccionar todo»)."
      },
      {
        "nombre": "selectedValue",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "selectedValues",
        "tipo": "string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "allSelected",
        "tipo": "boolean",
        "descripcion": "«Seleccionar todo»: `true` para marcar todas las habilitadas, `false` para desmarcarlas."
      },
      {
        "nombre": "selected",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Como panel desplegable de `siaf-input` con `type=\"select\"` o `select-multiple`: el campo lo abre, lo cierra y\n  guarda el valor.\n- Como lista de opciones de un componente compuesto con su propio disparador, como los select del panel «Crear\n  documento» (`siaf-create-document`).\n- `[multiple]` cuando se marcan varias opciones con check sin cerrar la lista.\n- `[checkboxes]` con `selectAllLabel` en una lista múltiple como la del Figma «Parámetros de consulta»: una casilla\n  por opción y, arriba, «Seleccionar todo», que emite `allSelected`.",
    "evitar": "- Para un campo de formulario completo: usar `siaf-input` con `type=\"select\"`, que ya pinta etiqueta, borde y error.\n- Para un menú de acciones (Editar, Anular, Exportar): usar `siaf-menu` o `siaf-icon-dropdown-menu`.\n- Para catálogos largos: no filtra ni busca; usar `siaf-selection-side-nav`.",
    "teclado": "- **Tab**: la lista es una sola parada: entra por la última opción enfocada (al principio, la elegida o la primera\n  habilitada) y la siguiente pulsación sale.\n- **Flecha abajo / arriba**: pasan a la opción habilitada siguiente o anterior y dan la vuelta.\n- **Inicio / Fin**: van a la primera o a la última opción habilitada.\n- **Enter / Espacio**: eligen la opción enfocada (emite `selected`); abrir, cerrar y Escape los maneja quien lo usa.\n  La opción elegida lleva `data-foco-inicial`: con `siafFoco`, el foco entra por ella al abrir la lista.\n- Con casillas, **Enter / Espacio** en «Seleccionar todo» marca o desmarca todas (emite `allSelected`).",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"listbox\"` con `aria-multiselectable`; cada opción es `role=\"option\"`\n  con `aria-selected` y `disabled` nativo.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el `listbox` no tiene nombre (`aria-label` o `aria-labelledby`)\n  ni una entrada para recibirlo del padre.\n- **2.1.1 Teclado (A)**: al enfocar una opción con la etiqueta cortada aparece su texto completo (`siafTooltip`).\n- **2.4.7 Foco visible (AA)**: la opción enfocada con teclado lleva un contorno interior azul de 2 px\n  (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro), el mismo de `siaf-menu` y `siaf-list`; no cambia el\n  fondo, así la elegida sigue marcada mientras tiene el foco.\n- **1.4.1 Uso del color (A)**: la opción elegida además va en negrita y con un check (`aria-hidden`); con casillas,\n  con la casilla marcada.\n- **1.1.1 Contenido no textual (A)**: con casillas, cada opción es un elemento con `role=\"option\"` (un `<input>` no\n  puede ir dentro de un botón) y la casilla nativa lleva `aria-hidden` y `tabindex=\"-1\"`: el estado lo publica\n  `aria-selected`.\n- **1.4.3 Contraste mínimo (AA)**: en claro, las opciones van en `text-neutral-medium` 14.53:1 sobre la superficie;\n  la elegida, `text-neutral-activated` sobre `bg-states-light-selected`, par que la tabla no mide.\n- **2.5.8 Tamaño del objetivo (AA)**: cada opción mide al menos 48 px de alto (`min-h-12`) y ocupa todo el ancho.",
    "figma": [],
    "aria": {
      "roles": [
        "listbox",
        "option"
      ],
      "atributos": [
        "aria-disabled",
        "aria-hidden",
        "aria-multiselectable",
        "aria-selected"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-floating",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-selection-side-nav",
    "clase": "SelectionSideNavComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/selection-side-nav/selection-side-nav.component",
    "archivo": "src/app/shared/components/selection-side-nav/selection-side-nav.component.ts",
    "descripcion": "Side-nav genérico para seleccionar uno o varios elementos de un\ncatálogo. Reemplaza los 15 paneles inline repetidos en los\nformularios de solicitud.\n\nVariantes:\n- **single** — radio buttons, emite `accepted` con un único id.\n- **multiple** — checkboxes, emite `accepted` con los ids seleccionados.\n\nComportamiento:\n- Click en la fila marca/desmarca la selección (igual que click en\n  el control).\n- Backdrop (click afuera) cierra sin emitir.\n- X del header cierra sin emitir.\n- Cancelar cierra sin emitir.\n- Aceptar emite y cierra (el padre cierra explícitamente via\n  `(accepted)`).\n\nEjemplo single:\n\n  <siaf-selection-side-nav\n    [open]=\"clasePanelOpen()\"\n    title=\"Buscar clase de ajuste\"\n    mode=\"single\"\n    [rows]=\"filteredClases()\"\n    [columns]=\"claseColumns\"\n    [searchValue]=\"claseSearch()\"\n    [selectedIds]=\"tempClaseId() ? [tempClaseId()] : []\"\n    (searchChange)=\"claseSearch.set($event)\"\n    (selectionChange)=\"onClaseTempChange($event)\"\n    (closed)=\"clasePanelOpen.set(false)\"\n    (accepted)=\"confirmClaseExistente()\"\n  />",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "acceptLabel",
        "tipo": "string",
        "porDefecto": "'Aceptar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "cancelLabel",
        "tipo": "string",
        "porDefecto": "'Cancelar'",
        "requerida": false,
        "descripcion": "Etiquetas de botones (i18n-friendly)."
      },
      {
        "nombre": "columns",
        "tipo": "SelectionColumn<T>[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Columnas a mostrar."
      },
      {
        "nombre": "customTable",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Escape hatch para casos que no encajan en la tabla declarativa (p.ej. estructuras jerárquicas con grupos expandibles). Cuando es true, en vez de la tabla auto-generada se proyecta el contenido del componente (`<ng-content>`). El shell (overlay, header, búsqueda, paginación, footer) se mantiene; `columns`/`rows` se ignoran. La selección la maneja el padre; usa `selectedIds` para controlar el disabled de Aceptar."
      },
      {
        "nombre": "disabledIds",
        "tipo": "string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Ids no seleccionables (fila atenuada, checkbox/radio deshabilitado)."
      },
      {
        "nombre": "emptyMessage",
        "tipo": "string",
        "porDefecto": "'No se encontraron resultados.'",
        "requerida": false,
        "descripcion": "Texto en la tabla cuando no hay filas."
      },
      {
        "nombre": "idKey",
        "tipo": "string",
        "porDefecto": "'id'",
        "requerida": false,
        "descripcion": "Propiedad de cada fila que la identifica unívocamente. Default: 'id'."
      },
      {
        "nombre": "mode",
        "tipo": "'single' | 'multiple'",
        "porDefecto": "'single'",
        "requerida": false,
        "descripcion": "'single' (radio) o 'multiple' (checkbox)."
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Si está abierto. Cuando se pasa a false el componente no renderiza nada."
      },
      {
        "nombre": "page",
        "tipo": "number",
        "porDefecto": "1",
        "requerida": false,
        "descripcion": "Página actual (1-based)."
      },
      {
        "nombre": "pageSize",
        "tipo": "number",
        "porDefecto": "10",
        "requerida": false,
        "descripcion": "Tamaño de página."
      },
      {
        "nombre": "paginated",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Activa la paginación. Cuando es true, las `rows` que recibe ya están paginadas por el padre; el componente solo renderiza los controles `siaf-pagination` y emite los eventos de navegación."
      },
      {
        "nombre": "requireSelection",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Si Aceptar exige al menos 1 selección. Default: true."
      },
      {
        "nombre": "rows",
        "tipo": "T[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Filas a renderizar. Ya filtradas por el padre."
      },
      {
        "nombre": "rowsPerPage",
        "tipo": "number",
        "porDefecto": "10",
        "requerida": false,
        "descripcion": "Filas por página seleccionadas."
      },
      {
        "nombre": "rowsPerPageOptions",
        "tipo": "number[]",
        "porDefecto": "[10, 25, 50, 100]",
        "requerida": false,
        "descripcion": "Opciones del selector de filas por página."
      },
      {
        "nombre": "searchPlaceholder",
        "tipo": "string",
        "porDefecto": "'Buscar'",
        "requerida": false,
        "descripcion": "Placeholder/aria del buscador."
      },
      {
        "nombre": "searchValue",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Valor actual del buscador (controlado por el padre)."
      },
      {
        "nombre": "selectAllChecked",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Estado del checkbox \"seleccionar todo\" (lo controla el padre)."
      },
      {
        "nombre": "selectAllIndeterminate",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Estado indeterminado del checkbox \"seleccionar todo\"."
      },
      {
        "nombre": "selectAllLabel",
        "tipo": "string",
        "porDefecto": "'Seleccionar filas'",
        "requerida": false,
        "descripcion": "Etiqueta del checkbox \"seleccionar todo\"."
      },
      {
        "nombre": "selectedIds",
        "tipo": "string[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": "Ids actualmente seleccionados (temporal — todavía no se aplicó)."
      },
      {
        "nombre": "showRowsPerPage",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Muestra el selector de filas por página en la barra inferior."
      },
      {
        "nombre": "showSelectAll",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Solo en `mode='multiple'`. Renderiza `siaf-table-controls` arriba de la tabla (en vez de la paginación superior) con un checkbox de \"seleccionar todo\", estado indeterminado y contador de seleccionados. La lógica de qué se considera \"todo seleccionado\" la decide el padre."
      },
      {
        "nombre": "showTopPagination",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Muestra también una barra de paginación arriba de la tabla."
      },
      {
        "nombre": "tableMinWidthClass",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Clase de ancho mínimo para la tabla (p.ej. `min-w-[1700px]`) para habilitar scroll horizontal."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Título mostrado en el header (también usado para aria-labels)."
      },
      {
        "nombre": "totalItems",
        "tipo": "number",
        "porDefecto": "0",
        "requerida": false,
        "descripcion": "Total de items (sin paginar)."
      },
      {
        "nombre": "totalPages",
        "tipo": "number",
        "porDefecto": "1",
        "requerida": false,
        "descripcion": "Total de páginas."
      }
    ],
    "eventos": [
      {
        "nombre": "accepted",
        "tipo": "string[]",
        "descripcion": "Click en Aceptar. Emite los ids seleccionados — el padre decide si cierra."
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": "Click en X / backdrop / Cancelar."
      },
      {
        "nombre": "nextPage",
        "tipo": "void",
        "descripcion": "Navegación de paginación: página siguiente."
      },
      {
        "nombre": "previousPage",
        "tipo": "void",
        "descripcion": "Navegación de paginación: página anterior."
      },
      {
        "nombre": "rowsPerPageChange",
        "tipo": "number",
        "descripcion": "Cambio de filas por página."
      },
      {
        "nombre": "searchChange",
        "tipo": "string",
        "descripcion": "El padre actualiza el `searchValue`."
      },
      {
        "nombre": "selectAllChange",
        "tipo": "boolean",
        "descripcion": "Toggle del checkbox \"seleccionar todo\" (true = marcar, false = desmarcar)."
      },
      {
        "nombre": "selectionChange",
        "tipo": "string[]",
        "descripcion": "Emite cada vez que cambia la selección temporal (radio o check)."
      }
    ],
    "usar": "- Para elegir uno (`single`) o varios (`multiple`) registros de un catálogo desde un formulario de solicitud: cuentas\n  contables, entidades, planes de cuentas, clases y detalles de ajuste, ámbitos, periodos o eventos.\n- Con `paginated` y `showSelectAll` cuando el catálogo es largo (cuentas del plan, cuentas del tipo de asiento): el\n  padre pagina y decide qué cuenta como «todo seleccionado».\n- Con `disabledIds` para mostrar registros que no se pueden elegir, como las clases de ajuste ya usadas por un tipo de\n  asiento (RN-012).\n- Con `customTable` cuando la tabla no es plana: periodos del asiento de ajuste y de la apertura contable, eventos\n  del catálogo de eventos contables.",
    "evitar": "- Para elegir entre pocas opciones fijas: usar `siaf-input` tipo select, `siaf-select-options` o `siaf-radio-group`.\n- Para adjuntar archivos: usar `siaf-upload-side-nav`; para mostrar u ocultar columnas, `siaf-column-visibility-panel`.\n- Maquetar otro panel de búsqueda con overlay, tabla y botones: este reemplazó los 15 que había en los formularios.\n- Para filtrar la grilla de la página: usar `siaf-custom-filter` o `siaf-filter-pill`.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X; recorre el buscador, la barra de la grilla, los controles de selección, la\n  paginación y Cancelar / Aceptar, y da la vuelta sin salir del panel. En `single` todo el grupo de radios es una sola\n  parada. Con `customTable`, la tabla proyectada trae su propio teclado.\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.\n- **Espacio**: en `multiple` marca o desmarca la casilla enfocada; en `single` elige el radio.\n- **Flechas**: en `single` pasan al radio anterior o siguiente y lo eligen (grupo nativo por `name`); saltan los\n  deshabilitados.\n- **Enter** en el buscador: aplica la búsqueda (sigue `siaf-form-table-search`).\n- **Enter / Espacio**: activan la X y Cancelar (emiten `closed`) y Aceptar (emite `accepted` con los ids).",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"dialog\"` con `aria-modal=\"true\"` y `aria-label` igual al `title`; la\n  X se llama «Cerrar» más el título, y las casillas y los radios nativos exponen marcado y deshabilitado.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al campo que lo\n  abrió; Tab no sale a la página de atrás.\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.\n- **1.3.1 Información y relaciones (A)**: título `h2` y tabla real con `thead` y un `th` por columna.\n- **Pendiente · 2.4.6 Encabezados y etiquetas (AA)**: todas las casillas y radios se llaman «Seleccionar fila» (su\n  columna lleva un `th` vacío), y el buscador siempre se rotula «Buscar»: `searchPlaceholder` llega al `ariaLabel` de\n  `siaf-form-table-search`, que no lo usa.\n- **1.4.1 Uso del color (A)**: la fila elegida lleva la casilla o el radio marcado además del fondo\n  `bg-states-light-selected`; la no elegible, el control deshabilitado además de la opacidad.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: «No se encontraron resultados.» aparece dentro de la tabla sin\n  `role=\"status\"`: el resultado de la búsqueda no se anuncia.\n- **2.4.7 Foco visible (AA)**: la X, las casillas y los radios muestran el anillo nativo del navegador (sin\n  `outline-none`); el buscador, la barra, la paginación y los botones del pie siguen su componente.",
    "figma": [],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "accent-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "py-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "mt-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "px-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-l-siaf-md",
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-l-siaf-sm",
          "rounded-r-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-form-table-search",
      "siaf-icon",
      "siaf-pagination",
      "siaf-table-controls"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-side-nav",
    "clase": "SideNavComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/side-nav/side-nav.component",
    "archivo": "src/app/shared/ui/side-nav/side-nav.component.ts",
    "descripcion": "Side nav del kit (Figma UI KIT, «Sidenav»): panel lateral de 420 px con el título en mayúsculas, la X, el contenido\nproyectado con su propio scroll y el pie Cancelar / Aceptar. Por defecto es un diálogo que entra desde la derecha,\nsobre la página y a la derecha del riel, con la animación de los paneles laterales (`SidePanelAnimacion`). Con\n`embedded` se pinta dentro de otro contenedor, sin fondo oscuro ni diálogo y sobre `surface-highest`: así lo usa\n`siaf-side-panel` para su panel de filtros.\n\nNo conoce el dominio: el padre controla `open`, pone el contenido y decide qué hacer con cada evento.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "cancelLabel",
        "tipo": "string",
        "porDefecto": "'Cancelar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "confirmDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "confirmLabel",
        "tipo": "string",
        "porDefecto": "'Aceptar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "embedded",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Se pinta dentro de otro contenedor, sin fondo oscuro, diálogo ni animación."
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Abierto o cerrado; con `embedded` no se usa: el panel se pinta siempre."
      },
      {
        "nombre": "showClose",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showFooter",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showReturn",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Flecha «Volver» antes del título."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "canceled",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": "La X, Escape, el fondo oscuro o Cancelar (este último, salvo con `embedded`)."
      },
      {
        "nombre": "confirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "returned",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para un panel lateral con contenido libre y, si hace falta, confirmación: un detalle breve, ayuda contextual o un\n  formulario corto que no tiene ya su panel propio.\n- `showFooter` en false para un panel de solo lectura; `confirmDisabled` mientras falte algo para aceptar.\n- `showReturn` cuando el panel es un segundo paso y la flecha vuelve al anterior (emite `returned`).\n- `embedded` para pintarlo dentro de otro contenedor, como el panel de filtros de `siaf-side-panel`.",
    "evitar": "- Para elegir registros de un catálogo: usar `siaf-selection-side-nav`; para adjuntar archivos, `siaf-upload-side-nav`;\n  para los parámetros de una consulta, `siaf-query-parameters-panel`.\n- Para el historial de un documento o registro: usar `siaf-document-history-panel`, `siaf-account-history-panel` o\n  `siaf-asiento-history-panel`.\n- Cuando el contenido necesita todo el ancho de la pantalla (una tabla, un documento): usar `siaf-side-panel`.\n- Para una confirmación corta: usar `siaf-modal`.",
    "teclado": "- **Tab / Shift + Tab**: al abrir, el foco entra en el primer control del encabezado (la flecha o la X); recorren el\n  contenido y Cancelar / Aceptar, y dan la vuelta sin salir del panel.\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.\n- **Enter / Espacio**: la flecha emite `returned`, la X emite `closed`, Cancelar emite `canceled` (y `closed` si no es\n  `embedded`) y Aceptar emite `confirmed`.\n- `embedded` no atrapa el foco ni cierra con Escape: sigue el orden de la página que lo contiene.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: el panel es `role=\"dialog\"` con `aria-modal=\"true\"` y `aria-labelledby` al\n  título; la X se llama «Cerrar» más el título y la flecha, «Volver». Con `embedded` es una sección nombrada por su\n  título, sin diálogo.\n- **1.3.1 Información y relaciones (A)**: el título es un `h2`; con `embedded`, un `h3`, porque va dentro de otro\n  panel con título propio.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco al encabezado y al cerrar lo devuelve al control\n  que lo abrió; Tab no sale a la página de atrás.\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.\n- **2.4.7 Foco visible (AA)**: la flecha y la X muestran el anillo `border-states-focus` de 2 px (5.35:1 claro /\n  10.15:1 oscuro); Cancelar y Aceptar siguen `siaf-button`.\n- **2.5.8 Tamaño del objetivo (AA)**: la flecha y la X miden 40 px.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` sobre la superficie (16.29:1 claro / 16.53:1 oscuro).",
    "figma": [
      {
        "nodo": "8856:7121",
        "nombre": "Sidenav"
      },
      {
        "nodo": "7839:20537",
        "nombre": "Assets/sidenav/header"
      },
      {
        "nodo": "7839:20542",
        "nombre": "Assets/sidenav/footer"
      }
    ],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "pb-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "pt-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-8",
        "via": [
          "shadow-siaf-elevation-8"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-side-panel",
    "clase": "SidePanelComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/side-panel/side-panel.component",
    "archivo": "src/app/shared/ui/side-panel/side-panel.component.ts",
    "descripcion": "Side panel del kit (Figma UI KIT, «Side Panel»): panel grande que entra desde la derecha y ocupa toda el área de\ncontenido, a la derecha del riel, con el título en mayúsculas, la X, el cuerpo con su propio scroll y el pie Cancelar\n/ Aceptar. Tiene la animación de los paneles laterales (`SidePanelAnimacion`), esquinas de 8 px y elevación 16.\n\nCon `showNav` suma a la derecha del cuerpo el panel de filtros de la variante del Figma: un `siaf-side-nav` con\n`embedded` de 420 px, con su título, su contenido (lo que se proyecta con el atributo `sidePanelNav`) y su pie\nCancelar / Aplicar. Ahí el pie principal desaparece y el cuerpo lleva una línea arriba y otra abajo, como en el Figma.\nEn pantallas angostas el panel de filtros baja debajo del contenido.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "cancelLabel",
        "tipo": "string",
        "porDefecto": "'Cancelar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "confirmDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "confirmLabel",
        "tipo": "string",
        "porDefecto": "'Aceptar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "navCancelLabel",
        "tipo": "string",
        "porDefecto": "'Cancelar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "navConfirmDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "navConfirmLabel",
        "tipo": "string",
        "porDefecto": "'Aplicar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "navTitle",
        "tipo": "string",
        "porDefecto": "'Filtros'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showClose",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showFooter",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Pie Cancelar / Aceptar; con `showNav` no se muestra, como en el Figma."
      },
      {
        "nombre": "showNav",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Panel de filtros a la derecha del cuerpo, con el contenido que lleva el atributo `sidePanelNav`."
      },
      {
        "nombre": "showReturn",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Flecha «Volver» antes del título."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "canceled",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": "La X, Escape, el fondo oscuro o Cancelar."
      },
      {
        "nombre": "confirmed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "navCanceled",
        "tipo": "void",
        "descripcion": "Cancelar del panel de filtros."
      },
      {
        "nombre": "navConfirmed",
        "tipo": "void",
        "descripcion": "Aplicar del panel de filtros."
      },
      {
        "nombre": "returned",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para trabajar sobre un contenido que necesita todo el ancho sin salir de la pantalla: una tabla grande, la vista\n  previa de un documento o un detalle con muchas columnas.\n- `showNav` con el contenido de los filtros en un elemento con el atributo `sidePanelNav`, cuando ese contenido se\n  filtra ahí mismo (emite `navConfirmed` y `navCanceled`).\n- `showFooter` en false para un panel de solo lectura; `confirmDisabled` mientras falte algo para aceptar.",
    "evitar": "- Para un formulario corto o un detalle breve: usar `siaf-side-nav`, de 420 px.\n- Para elegir registros, adjuntar archivos o los parámetros de una consulta: usar `siaf-selection-side-nav`,\n  `siaf-upload-side-nav` o `siaf-query-parameters-panel`.\n- Para una confirmación corta: usar `siaf-modal`.",
    "teclado": "- **Tab / Shift + Tab**: al abrir, el foco entra en el primer control del encabezado (la flecha o la X); recorren el\n  contenido, el panel de filtros y los botones del pie, y dan la vuelta sin salir del panel.\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.\n- **Enter / Espacio**: la flecha emite `returned`, la X emite `closed`, Cancelar emite `canceled` y `closed`, Aceptar\n  emite `confirmed`, y en el panel de filtros Cancelar y Aplicar emiten `navCanceled` y `navConfirmed`.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: el panel es `role=\"dialog\"` con `aria-modal=\"true\"` y `aria-labelledby` al\n  título; la X se llama «Cerrar» más el título y la flecha, «Volver».\n- **1.3.1 Información y relaciones (A)**: el título es un `h2` y el del panel de filtros, un `h3` dentro de una\n  sección nombrada por él.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco al encabezado y al cerrar lo devuelve al control\n  que lo abrió; Tab no sale a la página de atrás.\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.\n- **1.4.10 Reajuste del contenido (AA)**: en pantallas angostas ocupa todo el ancho y el panel de filtros baja\n  debajo del contenido, sin desplazamiento horizontal.\n- **2.4.7 Foco visible (AA)**: la flecha y la X muestran el anillo `border-states-focus` de 2 px (5.35:1 claro /\n  10.15:1 oscuro); los botones del pie siguen `siaf-button`.\n- **2.5.8 Tamaño del objetivo (AA)**: la flecha y la X miden 40 px.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` sobre la superficie (16.29:1 claro / 16.53:1 oscuro).",
    "figma": [
      {
        "nodo": "8842:12884",
        "nombre": "Side Panel"
      },
      {
        "nodo": "8856:7115",
        "nombre": "Side Panel con Sidenav"
      }
    ],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-16",
        "via": [
          "shadow-siaf-elevation-16"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-button",
      "siaf-icon",
      "siaf-side-nav"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-sidebar",
    "clase": "SidebarComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/sidebar/sidebar.component",
    "archivo": "src/app/layout/sidebar/sidebar.component.ts",
    "descripcion": "Barra lateral de navegación del shell autenticado, en dos variantes: `rail` (iconos) y `expanded` (lista).\n\nEl rail arma sus destinos desde la constante local `RAIL_ITEMS` (Panel, Bandeja, Procesos) y suma\nCrear, Ayuda y Ajustes; no navega por sí mismo: solo emite `created`, `help` y `navigationChanged`,\ny pinta como activo lo que el padre le pase en `navigation`. La variante `expanded` usa `items`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "buttonHelp",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "ctaAdd",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "items",
        "tipo": "SidebarItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "navigation",
        "tipo": "'Default' | 'Panel' | 'Bandeja' | 'Proceso' | 'Ajustes'",
        "porDefecto": "'Default'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "'SIAF RP'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'rail' | 'expanded'",
        "porDefecto": "'rail'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "created",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "help",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "navigationChanged",
        "tipo": "'Default' | 'Panel' | 'Bandeja' | 'Proceso' | 'Ajustes'",
        "descripcion": null
      }
    ],
    "usar": "- Variante `rail` como navegación fija de escritorio (desde `lg`): `siaf-app-shell` la pinta a la izquierda con\n  Crear, Panel, Bandeja, Procesos, Ayuda y Ajustes.\n- Con `ctaAdd` atado al permiso `document.create` (Crear se deshabilita si el rol no puede crear) y `buttonHelp`\n  para mostrar Ayuda.\n- Para indicar en qué área está el usuario: el armazón le pasa en `navigation` Panel, Procesos o Ajustes según la URL.",
    "evitar": "- En móvil: usar `siaf-mobile-navigation-menu`, que comparte `SidebarNavigation` y los mismos handlers.\n- Para navegar dentro de un módulo (Documentos / Registros, Detalle / Historial): usar `siaf-tabs` o\n  `siaf-records-tabs`.\n- La variante `expanded` en pantallas nuevas: no tiene uso en la app y sus enlaces usan `href` en vez del router;\n  para un menú de destinos, `siaf-process-menu-tree` con otro arreglo de nodos.",
    "teclado": "- **Tab**: recorre Crear, Panel, Bandeja, Procesos, Ayuda (con `buttonHelp`) y Ajustes; Crear deshabilitado\n  (`ctaAdd` en false) se salta.\n- **Enter / Espacio**: emiten `created`, `navigationChanged` o `help`; el componente no navega ni abre paneles.\n- **Enter** (variante `expanded`): sigue el enlace `<a href>` del ítem.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con un `<nav>` que solo agrupa Panel, Bandeja y\n  Procesos (Crear, Ayuda y Ajustes quedan fuera); ni el `aside` ni el `nav` tienen `aria-label` y los destinos no\n  van en lista `ul`/`li`.\n- **Pendiente · 1.4.1 Uso del color (A)**: en el rail, el destino activo solo cambia de color (capa `brand-primary`\n  detrás del ícono y el ícono en azul); el texto no cambia. En `expanded` el activo además va en `font-medium`.\n- **1.4.3 Contraste mínimo (AA)**: rail con `text-neutral-medium` sobre la superficie (14.53:1 / 12.87:1); en\n  `expanded`, título y activo en blanco sobre `bg-brand-secondary` (8.70:1 / 5.95:1).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el contorno de foco del rail es el azul del kit\n  (`border-states-focus`, 5.35:1 / 10.15:1), pero en oscuro el ícono activo, en `bg-brand-primary`, no llega a 3:1.\n- **2.4.7 Foco visible (AA)**: los botones del rail muestran un contorno azul de 2 px con `focus-visible`; los enlaces\n  de `expanded` quedan con el anillo del navegador.\n- **2.5.8 Tamaño del objetivo (AA)**: cada botón del rail ocupa el ancho de la barra (56 px) y más de 60 px de alto.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada destino es un `<button>` con su texto como nombre y Crear usa\n  `disabled`, pero el activo no publica `aria-current` (tampoco `item.active` en `expanded`). En el armazón, Bandeja,\n  Procesos y Ajustes abren un panel sin `aria-expanded`: el componente no recibe si está abierto.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-brand-secondary",
        "via": [
          "bg-brand-secondary"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-on-brand-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-on-brand-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-on-brand-subtle",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "px-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-snackbar",
    "clase": "SnackbarComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/snackbar/snackbar.component",
    "archivo": "src/app/shared/ui/snackbar/snackbar.component.ts",
    "descripcion": "Aviso flotante animado con textos predefinidos por `variant` (registro grabado, archivo subido, solicitud\nelaborada/verificada/aprobada…) o mensaje libre.\n\n`tone` sigue los tipos del Figma: `neutral` (sin ícono), `info`, `success` (por defecto), `warning` y\n`error`. Los íconos usan los colores del Figma también en modo oscuro, porque el fondo es oscuro en ambos\ntemas. `actionLabel` agrega un botón de texto antes de la X, que emite `action`. Mide como máximo 430 px:\nun mensaje largo pasa a dos líneas. `warning` y `error` se anuncian de inmediato (`role=\"alert\"`).\n\nÚsalo para confirmar una acción puntual del usuario. Los avisos de aprobación/rechazo de una\nsolicitud NO se arman a mano aquí: los emite `siaf-request-approval-modals` con `[requestType]`.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "actionLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Texto del botón de acción (ej. «Deshacer»). Sin texto no se muestra."
      },
      {
        "nombre": "bulkStatus",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "dismissible",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "fileName",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "message",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "requestAction",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "requestNumber",
        "tipo": "string",
        "porDefecto": "'0001'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "requestType",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "tone",
        "tipo": "'neutral' | 'info' | 'success' | 'warning' | 'error'",
        "porDefecto": "'success'",
        "requerida": false,
        "descripcion": "Tipo del aviso: define el ícono y su color. `neutral` no lleva ícono."
      },
      {
        "nombre": "variant",
        "tipo": "SnackbarVariant",
        "porDefecto": "'custom'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "action",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para confirmar una acción puntual que ya terminó: registro grabado, cambios guardados, archivo subido.\n- Para el resultado de la aprobación masiva en la bandeja (`siaf-documents-records-page`) y de la carga masiva\n  del Plan de Cuentas o del catálogo de eventos.\n- Con `tone=\"error\"` cuando la acción falló y hay que avisar enseguida, como al cambiar el estado de un usuario\n  en Admin.\n- Con `actionLabel` para ofrecer una salida rápida, como «Deshacer».",
    "evitar": "- Para los avisos de grabar, verificar, aprobar, observar o rechazar una solicitud: los emite\n  `siaf-request-approval-modals` con `[requestType]`.\n- Para mensajes que deben quedar fijos en la pantalla o explicar una restricción: usar `siaf-alert`.\n- Para pedir confirmación antes de actuar: usar `siaf-modal`.",
    "teclado": "- **Tab**: llega al botón de acción (con `actionLabel`) y a la × (con `dismissible`) según su lugar en el DOM;\n  el aviso no toma el foco al aparecer.\n- **Enter / Espacio**: el botón de acción emite `action` y la × emite `closed` (botones nativos).",
    "accesibilidad": "- **4.1.3 Mensajes de estado (AA)**: `warning` y `error` son `role=\"alert\"` y los demás `role=\"status\"`; ojo: la\n  región nace junto con el texto (bloque if) y un `status` que aparece ya lleno no siempre se anuncia.\n- **1.1.1 Contenido no textual (A)**: el ícono del tono es decorativo (`aria-hidden`) y `neutral` no lleva: el\n  texto tiene que decir si la acción salió bien o falló.\n- **1.4.3 Contraste mínimo (AA)**: texto blanco sobre el fondo casi negro del aviso en ambos temas\n  (`bg-on-surfaces-high` en claro, `bg-snackbar` en oscuro).\n- **4.1.2 Nombre, función y valor (A)**: la × es un `<button>` con `aria-label=\"Cerrar mensaje\"` y el botón de\n  acción se nombra con su texto visible.\n- **2.4.7 Foco visible (AA)**: los dos botones muestran un contorno blanco de 2 px.\n- **2.5.8 Tamaño del objetivo (AA)**: la × mide 32 × 32 px y el botón de acción, 32 px de alto.\n- **2.2.1 Tiempo ajustable (A)**: no tiene temporizador: queda visible hasta que el usuario lo cierra o el padre\n  cambia `open`.\n- **2.4.3 Orden del foco (A)**: al cerrarlo con la × el botón desaparece y el foco queda en el documento.",
    "figma": [],
    "aria": {
      "roles": [
        "alert",
        "error",
        "status",
        "warning"
      ],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-on-surfaces-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-snackbar",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-2",
        "via": [
          "shadow-siaf-elevation-2"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-solicitude-form-card",
    "clase": "SolicitudeFormCardComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/solicitude-form-card/solicitude-form-card.component",
    "archivo": "src/app/shared/components/solicitude-form-card/solicitude-form-card.component.ts",
    "descripcion": "Tarjeta de sección de las pantallas de solicitud y de los formularios de Admin: cabecera con el título en\nmayúsculas (`h2`), un ícono (i) opcional con `titleInfo` y las acciones proyectadas con el atributo `card-actions`,\ny debajo el cuerpo proyectado.\n\nCon `loading` la cabecera muestra una barra gris animada en lugar del título. Sin `title` ni `loading` no se pinta\nla cabecera, así que tampoco aparecen las `card-actions`.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "loading",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "titleInfo",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Tooltip del ícono (i) junto al título; si está vacío no se muestra el ícono."
      }
    ],
    "eventos": [],
    "usar": "- Para cada sección de una solicitud: «Tipo de modificación», «Lista de cuentas contables», «Registro de asiento de\n  ajuste», «Registros de eventos», «Justificación del sustento».\n- Para los bloques de los formularios de Admin: datos de la entidad, de la UE, del usuario o del correlativo.\n- Cuando la sección lleva acciones en la cabecera (buscar, Cancelar / Aceptar) con `card-actions`, o `loading`\n  mientras llega el detalle (carga masiva de cuentas contables).",
    "evitar": "- Para el N° y el estado del documento o para los datos generales de la solicitud: usar\n  `siaf-document-summary-card` o `siaf-solicitude-info-card`.\n- Para un contenedor genérico fuera de las solicitudes: usar `siaf-card`.\n- Sin `title` cuando hacen falta acciones: no se pinta la cabecera y las `card-actions` no aparecen.\n- Para secciones que el usuario pliega: usar `siaf-expansion-panel` dentro de la tarjeta.",
    "teclado": "- No recibe foco: es un contenedor. Las `card-actions` y el contenido siguen el teclado de su componente; el ícono\n  (i) de `titleInfo` no es enfocable.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: el título es un `h2` dentro de un `section`, así cada sección de la\n  solicitud aparece en la lista de encabezados.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` sobre la superficie, 16.29:1 (oscuro 16.53:1).\n- **Pendiente · 1.1.1 Contenido no textual (A)**: el ícono (i) de `titleInfo` recibe `label` pero sigue\n  `decorative` (`aria-hidden`), así que su texto no llega al lector de pantalla; hoy ningún consumidor lo usa.\n- **Pendiente · 2.1.1 Teclado (A)**: ese texto solo se ve en el atributo `title` al pasar el puntero; el ícono no\n  recibe foco.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: con `loading` la cabecera pinta una barra animada sin texto ni\n  `aria-busy`, así que la carga no se anuncia.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "pt-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-solicitude-header",
    "clase": "SolicitudeHeaderComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/solicitude-header/solicitude-header.component",
    "archivo": "src/app/shared/components/solicitude-header/solicitude-header.component.ts",
    "descripcion": "Encabezado de una pantalla de solicitud: Regresar, título (`heading`) con etiqueta («Nuevo», «Edición»), texto\nsecundario y la botonera del flujo (Cancelar, Grabar, Verificar, Editar, Eliminar, Aprobar, Observar, Rechazar).\nQué botones se ven sale de una matriz por `role` (creador o aprobador) y `state` del documento; sin esa combinación\nmandan los inputs sueltos, y `customActions` cambia la botonera por lo proyectado en `[actions]`.\nEn escritorio los botones van a la derecha. En móvil van en una barra fija inferior donde la última acción es la\nprincipal (con ícono y el resto del ancho) y las demás van solo con texto. `loading` pinta un esqueleto.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "approveLabel",
        "tipo": "string",
        "porDefecto": "'Aprobar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "customActions",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Reemplaza el grupo de botones estándar por contenido proyectado con el atributo `actions`: `<siaf-button actions ...>`. Para procesos con acciones fuera de la matriz rol/estado."
      },
      {
        "nombre": "deleteLabel",
        "tipo": "string",
        "porDefecto": "'Eliminar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "editLabel",
        "tipo": "string",
        "porDefecto": "'Editar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "heading",
        "tipo": "string",
        "porDefecto": "'Heading name'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "loading",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "observeLabel",
        "tipo": "string",
        "porDefecto": "'Observar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rejectLabel",
        "tipo": "string",
        "porDefecto": "'Rechazar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "role",
        "tipo": "'' | SolicitudeHeaderRole",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "saveDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "saveVariant",
        "tipo": "'accent' | 'primary' | 'secondary'",
        "porDefecto": "'secondary'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "secondaryText",
        "tipo": "string",
        "porDefecto": "'Creacion'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showButtonGroup",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showDelete",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showEdit",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showReturn",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showSecondaryText",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showTag",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showVerify",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "state",
        "tipo": "'' | SolicitudeHeaderState",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "tagLabel",
        "tipo": "string",
        "porDefecto": "'Nuevo'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "tagTone",
        "tipo": "'info' | 'accent'",
        "porDefecto": "'accent'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "type",
        "tipo": "'readonly' | 'actions'",
        "porDefecto": "'readonly'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "verifyDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "verifyLabel",
        "tipo": "string",
        "porDefecto": "'Verificar'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "approved",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "canceled",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "deleted",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "edited",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "observed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "rejected",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "returned",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "saved",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "verified",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Dentro de `siaf-solicitude-page-layout`, que lo pinta con `role` y `state`: así lo usan las request-pages de\n  Contabilidad y los formularios de Admin.\n- Con `customActions` y botones en `[actions]` cuando el proceso tiene acciones fuera de la matriz, como «Reprocesar»\n  en el detalle de contabilización.\n- Con `saveDisabled` para dejar Grabar deshabilitado mientras no hay cambios (patrón «Grabar solo con cambios»).",
    "evitar": "- Suelto con su propio breadcrumb y contenedor: usar `siaf-solicitude-page-layout`, que lo fija bajo el navbar y\n  reenvía los eventos (hoy solo la ruta `formulario` de asiento de ajuste lo arma a mano).\n- Para pantallas sin ciclo de documento (consultas, listados): usar `siaf-page-header`.\n- Para acciones de una tarjeta o sección: ponerlas en la tarjeta y apagar la botonera con `showButtonGroup` en false,\n  como el Gestor de Usuarios.\n- Para mostrar el estado del documento en el flujo: usar `siaf-flow-status-tag`; esta etiqueta solo marca «Nuevo» o\n  «Edición».",
    "teclado": "- **Tab**: recorre Regresar (si `showReturn`) y los botones visibles en su orden; en móvil, la barra fija inferior va\n  en el DOM justo después del encabezado. Los deshabilitados no reciben foco.\n- **Enter / Espacio**: activan cada botón y emiten su evento (`returned`, `canceled`, `saved`, `verified`, `edited`,\n  `deleted`, `approved`, `observed` o `rejected`). Los botones siguen `siaf-button`.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: `heading` es el `h1` de la página; la etiqueta y el texto secundario van\n  como texto junto a él.\n- **4.1.2 Nombre, función y valor (A)**: Regresar lleva `aria-label=\"Regresar\"`; en la barra móvil cada botón se\n  nombra con su texto visible (el ícono de la principal es decorativo), y los deshabilitados (Grabar sin cambios,\n  Eliminar en observado) exponen `disabled`.\n- **2.5.8 Tamaño del objetivo (AA)**: los botones de la barra móvil miden 48 px de alto; en escritorio, 40.\n- **2.4.3 Orden del foco (A)**: en escritorio los botones siguen al título; en móvil la barra fija inferior va en el\n  DOM después del encabezado, así que Tab llega a las acciones antes que al formulario.\n- **Pendiente · 2.4.11 Foco no oculto (AA)**: en móvil la barra de acciones es `fixed` abajo y no hay\n  `scroll-padding`: al avanzar con Tab, un campo puede quedar tapado por ella.\n- **1.4.11 Contraste no textual (AA)**: el anillo de foco de Regresar (2 px) es el azul del kit\n  (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro sobre `bg-surface`). Los demás botones siguen `siaf-button`.\n- **1.4.3 Contraste mínimo (AA)**: `h1` `text-text` (16.29:1 / 16.53:1), texto secundario `text-text-muted` (5.01:1 /\n  8.86:1) y la etiqueta en blanco sobre `bg-brand-accent` (4.89:1 / 5.65:1) o `bg-brand-primary` (8.79:1 / 6.67:1).\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: con `loading` el título y los botones se cambian por un esqueleto\n  sin `aria-busy` ni `role=\"status\"`: la carga no se anuncia.\n- **Pendiente · 2.1.1 Teclado (A)**: desde `sm` el `h1` se corta y el texto completo sale con `siafTooltip`, que se\n  abre con el mouse o con el foco; como el `h1` no es enfocable, con teclado no se puede ver.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "px-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-button",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-solicitude-info-card",
    "clase": "SolicitudeInfoCardComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/solicitude-info-card/solicitude-info-card.component",
    "archivo": "src/app/shared/components/solicitude-info-card/solicitude-info-card.component.ts",
    "descripcion": "Tarjeta de datos generales de una solicitud, de solo lectura: una fila por campo con la etiqueta en mayúsculas\n(columna de 140 px desde `md`) y el valor en negrita.\n\nCon `captureOpenDate`, un campo «Fecha» que llega vacío se completa una sola vez con la fecha y hora en que se\nabrió la tarjeta y queda fijo.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "captureOpenDate",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Cuando es true, un campo \"Fecha\" que llegue vacío se completa UNA sola vez con la fecha/hora en que se abrió el documento y queda CONGELADO: marca cuándo se inició la solicitud y no debe cambiar (antes usaba un reloj en vivo que se actualizaba cada segundo — incorrecto). Si el padre provee un valor explícito (p. ej. la fecha de creación persistida de un documento existente), se muestra ese valor."
      },
      {
        "nombre": "fields",
        "tipo": "SolicitudeInfoField[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- En la cabecera de las pantallas de solicitud con Fecha, Ente rector y Entidad, junto a\n  `siaf-document-summary-card`: plan de cuentas, catálogo de ajustes, catálogo de eventos, eventos contables y\n  asiento de ajuste.\n- Con `[captureOpenDate]=\"true\"` en una solicitud nueva, para que «Fecha» marque cuándo se inició y no cambie.\n- En detalles de solo lectura que ya traen la fecha: apertura contable (solicitud y asiento anual) y\n  Contabilización.",
    "evitar": "- Para el N° y el estado del documento: usar `siaf-document-summary-card`.\n- Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`.\n- Para campos editables: usar `siaf-input` dentro de `siaf-solicitude-form-card`.\n- Dos campos con la misma etiqueta: la etiqueta es la clave del `track` y no debe repetirse.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: cada etiqueta precede a su valor en el orden de lectura (`span` y\n  `strong`).\n- **1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1) y valores\n  `text-neutral-high` 16.29:1 (16.53:1) sobre la superficie.\n- **1.4.13 Contenido en hover o foco (AA)**: desde `sm` una etiqueta larga se trunca y se completa con `siafTooltip`,\n  que se cierra con Escape y se puede recorrer con el puntero.\n- **Pendiente · 2.1.1 Teclado (A)**: la etiqueta no recibe foco, así que con teclado el globo no aparece (el lector\n  de pantalla sí lee la etiqueta entera).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-solicitude-page-layout",
    "clase": "SolicitudePageLayoutComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/solicitude-page-layout/solicitude-page-layout.component",
    "archivo": "src/app/shared/components/solicitude-page-layout/solicitude-page-layout.component.ts",
    "descripcion": "Armazón de las pantallas de solicitud: breadcrumb y `siaf-solicitude-header` en una cabecera que queda fija bajo el\nnavbar en escritorio, y debajo el contenido proyectado (las tarjetas del formulario).\nReenvía al header `role`, `state`, los textos, `loading` y los deshabilitados de Grabar y Verificar, y re-emite sus\neventos (`saved`, `verified`, `approved`…); con `customActions`, lo proyectado en `[actions]` pasa al header.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "breadcrumbs",
        "tipo": "BreadcrumbItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "customActions",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Reemplaza los botones estándar del header por el slot proyectado `[actions]`."
      },
      {
        "nombre": "floatingPanelOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "heading",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "loading",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "role",
        "tipo": "'creator' | 'reviewer' | 'approver'",
        "porDefecto": "'creator'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "saveDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "secondaryText",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showButtonGroup",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Apaga el grupo de botones estándar del header (para páginas con botones a nivel de card)."
      },
      {
        "nombre": "showReturn",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showTag",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "state",
        "tipo": "SolicitudeHeaderState",
        "porDefecto": "'new'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "trayMenuOpen",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "verifyDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "approved",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "canceled",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "deleted",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "edited",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "observed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "rejected",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "returned",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "saved",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "verified",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- En toda request-page con ciclo de documento: plan de cuentas (solicitud y carga masiva), asiento de ajuste,\n  catálogo de ajuste (tipo y clase), catálogo de eventos (SCE y SCM), eventos contables y apertura contable.\n- En los formularios de Admin (usuarios, entidades, unidades ejecutoras, dependencias, perfiles, procedimientos,\n  sistemas funcionales, correlativos) con `role=\"creator\"` y `state` en `new` o `edit`.\n- Con `customActions` en detalles con acciones propias («Reprocesar» en contabilización) y con `showButtonGroup` en\n  false cuando los botones van en la tarjeta.",
    "evitar": "- Para consultas, reportes y listados sin ciclo de documento: usar `siaf-page-shell` con `siaf-page-header`.\n- Para la pantalla Documentos / Registros de un proceso: usar `siaf-documents-records-page`.\n- Rearmar a mano el breadcrumb y `siaf-solicitude-header` en la página: se pierden la cabecera fija y el reenvío de\n  eventos.\n- Repetir Grabar o Verificar dentro del contenido cuando la matriz de `role` y `state` ya los resuelve en el header.",
    "teclado": "- No agrega teclado propio: Tab recorre el breadcrumb, Regresar y los botones de `siaf-solicitude-header` y después\n  el contenido proyectado; cada control sigue su componente.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: breadcrumb (`nav` con `aria-label=\"Ruta de navegación\"`) y el `h1` del\n  header arriba; las tarjetas proyectadas siguen con `h2` (`siaf-solicitude-form-card`). No agrega landmarks: vive\n  dentro del `main` del shell.\n- **2.4.3 Orden del foco (A)**: el DOM sigue el orden visual: breadcrumb, Regresar, acciones del header y contenido.\n- **Pendiente · 2.4.11 Foco no oculto (AA)**: en escritorio la cabecera es `sticky` bajo el navbar y no hay\n  `scroll-padding`: al volver con Shift + Tab, un campo puede quedar tapado. En móvil, `pb-24` solo evita que la\n  barra fija del header tape el final del contenido.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: con `loading` el esqueleto del header no se anuncia (hereda de\n  `siaf-solicitude-header`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md",
          "pb-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-breadcrumb",
      "siaf-solicitude-header"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-status-tag",
    "clase": "StatusTagComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/status-tag/status-tag.component",
    "archivo": "src/app/shared/ui/status-tag/status-tag.component.ts",
    "descripcion": "Etiqueta de estado del kit (Figma UI KIT, sección «Semántica»): cinco tonos (`default`, `info`, `success`, `warning`\ny `danger`) en tres estilos, que son los de las familias de etiquetas del Figma: `solid` («flow tags», fondo oscuro y\ntexto blanco), `soft` («Period», «Expediente» y «Conciliación tags», fondo claro con borde) y `outline` («status items\ntags», solo borde y el ícono del tono). Texto de 12 px, esquinas de 4 px, 32 px de alto en `standard` y 24 px en\n`small`, y un ícono relleno de 20 px opcional antes del texto.\n\nEs la base de `siaf-flow-status-tag` y `siaf-record-status-tag`, que guardan el mapa de cada estado a su tono y su\nestilo. Usarla directo para un estado que no es del flujo de un documento ni de un registro.\n\nEl fondo de `solid` sale de `--sys-color-bg-status-solid-*`: en claro son los de feedback oscuro del Figma; en\noscuro, los tonos oscuros del flujo, porque en ese tema los de feedback oscuro pasan a tintes claros y el texto\nblanco no se leería.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "appearance",
        "tipo": "'outline' | 'solid' | 'soft'",
        "porDefecto": "'soft'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Ícono de Material Icons (relleno, 20 px) antes del texto."
      },
      {
        "nombre": "size",
        "tipo": "'standard' | 'small'",
        "porDefecto": "'standard'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "tone",
        "tipo": "'default' | 'info' | 'success' | 'warning' | 'danger'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para el estado de algo que no es un documento ni un registro, con los tonos del Figma: el de un expediente (Creado,\n  En trámite, Archivado) o una conciliación (No conciliado, Pendiente de conciliación, Conciliado), con `soft`.\n- `outline` con `icon` para estados de ítems que se leen en una lista (Enviado `send`, Completado `check_circle`,\n  Pendiente `pending`, Observado `warning`).\n- Para una marca informativa con color junto a un título, como las de cada ficha de `/ui-kit` («Requiere sesión»,\n  «Sin uso en la app»), con `soft` y un ícono si ayuda.\n- `small` (24 px) dentro de tablas y resúmenes; `standard` (32 px) sola, junto a un título.",
    "evitar": "- Para el estado del flujo de una solicitud: usar `siaf-flow-status-tag`, que ya sabe el tono de cada estado.\n- Para el estado de un registro (Activo, Abierto, Cerrado…): usar `siaf-record-status-tag`.\n- Para filtros aplicados, opciones que se eligen o valores que se pueden quitar: usar `siaf-tag`; para contadores,\n  `siaf-badge`.\n- Como única señal del estado: el tono es solo color, el estado tiene que ir escrito.",
    "teclado": "- No recibe foco: no es interactiva.",
    "accesibilidad": "- **1.4.1 Uso del color (A)**: el estado va escrito; el tono y el ícono solo lo refuerzan.\n- **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`siaf-icon` con `aria-hidden`); el estado se lee del\n  texto.\n- **1.3.1 Información y relaciones (A)**: es un `<span>`; el contexto lo da quien la contiene (la cabecera de la\n  columna o la etiqueta del dato).\n- **1.4.3 Contraste mínimo (AA)**: en claro, `solid` con texto blanco da 12.24:1 en `default`, 5.82:1 en `info`,\n  4.71:1 en `success` y 7.13:1 en `danger`; `soft`, 11.46:1, 5.81:1, 5.31:1 y 6.21:1 en esos tonos; y `outline`,\n  sobre la superficie, de 5.25:1 (`warning`) a 14.53:1 (`default`). En oscuro cumplen los 15: `solid` de 5.31:1\n  (`warning`) a 7.97:1 (`default`), `soft` de 8.24:1 a 11.45:1 y `outline` de 10.59:1 a 16.53:1.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: en claro, `warning` no llega a 4.5:1 con texto de 12 px ni en `solid`\n  (blanco sobre `bg-status-solid-warning`, 3.39:1) ni en `soft` (4.43:1); son los colores del Figma, a revisar con\n  diseño.\n- **4.1.3 Mensajes de estado (AA)**: no es región viva: un cambio de estado no se anuncia desde la etiqueta.",
    "figma": [
      {
        "nodo": "19358:721",
        "nombre": "Semántica"
      },
      {
        "nodo": "2576:10069",
        "nombre": "flow tags"
      },
      {
        "nodo": "6756:221",
        "nombre": "status items tags"
      },
      {
        "nodo": "19299:105",
        "nombre": "Period tags"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-feedback-light-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-status-solid-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-status-solid-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-status-solid-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-status-solid-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-status-solid-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-feedback-light-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-info",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "px-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-stepper-card",
    "clase": "StepperCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/stepper-card/stepper-card.component",
    "archivo": "src/app/shared/ui/stepper-card/stepper-card.component.ts",
    "descripcion": "Card seleccionable en forma de paso, con lista de campos etiqueta/valor e indicador lateral.\n\nSin elegir lleva borde y ninguna sombra; elegida (`selected`), sombra y una barra azul de 80 px arriba a la\nizquierda. Mide 200 px de ancho dentro de `siaf-steps` con `variant=\"cards\"`, que la pinta una por versión con su\npunto a la derecha. No es la card de \"ítem seleccionado\" — esa es `siaf-summary-card`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "fields",
        "tipo": "StepperCardField[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "selected",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "selectedChange",
        "tipo": "boolean",
        "descripcion": null
      }
    ],
    "usar": "- Para elegir una entre varias solicitudes o versiones de un mismo registro mostradas como tarjetas (N° de\n  documento, tipo de acción y fecha) y ver su detalle al lado.\n- Como columna de navegación de un historial, dentro de `siaf-steps` con `variant=\"cards\"`: la tarjeta elegida queda\n  marcada y el padre pinta su detalle. Así la usan `siaf-account-history-panel` y `siaf-asiento-history-panel`.",
    "evitar": "- Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`, que no es seleccionable.\n- Para pasos numerados de un flujo: usar `siaf-steps`; para los responsables de una solicitud,\n  `siaf-action-tracker`.\n- Con enlaces o botones adentro: toda la tarjeta ya es un `button` y no admite otros controles.\n- Para elegir entre opciones de un formulario: usar `siaf-radio-group` o `siaf-buttons-group`.",
    "teclado": "- **Tab**: enfoca la tarjeta completa (es un `button`).\n- **Enter / Espacio**: emiten `selectedChange` con el valor contrario a `selected`; el padre actualiza la selección.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: es un `button` nativo con `aria-pressed` según `selected`; su nombre es el\n  texto de todas sus etiquetas y valores.\n- **1.4.1 Uso del color (A)**: la elegida no depende del color: suma la barra lateral y la sombra.\n- **1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1) y valores\n  `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.\n- **2.4.7 Foco visible (AA)**: contorno de 2 px `border-states-focus` separado 2 px (5.35:1 claro / 10.15:1 oscuro).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro la barra de la elegida usa `bg-brand-primary`, 2.66:1\n  sobre la superficie, y el borde de las demás (`divider-strong`) no llega a 3:1 en ningún tema.\n- **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que\n  también aparece al enfocar la tarjeta, se cierra con Escape y se puede recorrer con el puntero. Si se cortan la\n  etiqueta y el valor, con el foco solo se ve el primero (el lector de pantalla lee los dos).\n- **2.5.8 Tamaño del objetivo (AA)**: toda la tarjeta es el objetivo, de al menos 180 px de ancho.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden",
        "aria-pressed"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "px-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-r-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      },
      {
        "token": "--sys-shadow-elevation-2",
        "via": [
          "shadow-siaf-elevation-2"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-steps",
    "clase": "StepsComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/steps/steps.component",
    "archivo": "src/app/shared/ui/steps/steps.component.ts",
    "descripcion": "Pasos numerados de un flujo con el paso activo resaltado (Figma UI KIT: «Step colum», nodo 1264:580,\ny «Steps Rows», nodo 2582:7222).\n\n- `horizontal` (por defecto): un círculo de 32 px con el número por paso, unidos por una línea, y el\n  nombre y la descripción debajo. Si no entra en el ancho, se desplaza en horizontal.\n- `vertical`: un paso por fila con el nombre a la derecha. `size=\"default\"` usa círculos de 40 px con\n  número; `size=\"small\"`, de 24 px sin número.\n- `variant=\"cards\"`: siempre vertical. Cada paso es un `siaf-stepper-card` con sus `fields` y, a la derecha, un\n  punto de 24 px; los puntos van unidos por una línea. La tarjeta activa lleva sombra y barra azul y su punto va\n  en azul; las demás, borde y punto gris. Al elegir otra tarjeta emite `activeStepChange`.\n\n`activeStep` cuenta desde 1. Con círculos, el activo y los anteriores van en el color de marca y los siguientes, en\ngris; con tarjetas, solo la activa va en azul. La variante `cards` es la columna de versiones de\n`siaf-account-history-panel` y `siaf-asiento-history-panel`; el stepper e historial de las solicitudes es\n`siaf-action-tracker`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "activeStep",
        "tipo": "number",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Paso activo, contando desde 1."
      },
      {
        "nombre": "orientation",
        "tipo": "'vertical' | 'horizontal'",
        "porDefecto": "'horizontal'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "size",
        "tipo": "'default' | 'small'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": "Solo en vertical con círculos: `default` (40 px con número) o `small` (24 px sin número)."
      },
      {
        "nombre": "steps",
        "tipo": "StepItem[]",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'default' | 'cards'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": "`cards`: vertical, con un `siaf-stepper-card` por paso (sus `fields`) y el punto a la derecha."
      }
    ],
    "eventos": [
      {
        "nombre": "activeStepChange",
        "tipo": "number",
        "descripcion": "Con `variant=\"cards\"`: el número (desde 1) de la tarjeta elegida. Admite `[(activeStep)]`."
      }
    ],
    "usar": "- Para mostrar en qué etapa va un flujo lineal corto (3 a 6 pasos), como un asistente por etapas de una carga\n  masiva: plantilla, archivo, validación y envío.\n- `vertical` en paneles laterales o columnas angostas; `size=\"small\"` cuando el número no aporta.\n- `variant=\"cards\"` para las versiones de un registro (creación y modificaciones, con su número, tipo de acción y\n  fecha): la tarjeta elegida queda marcada y el padre muestra su detalle al lado, como en los paneles de historial.",
    "evitar": "- Para el avance y los responsables de una solicitud (Elaborado, Verificado, Aprobado): usar `siaf-action-tracker`.\n- Para hitos con fecha y detalle: usar `siaf-timeline`.\n- Como navegación entre vistas: para cambiar de vista usar `siaf-tabs`.\n- Muchos pasos en `horizontal`: la fila se desplaza; pasar a `vertical`.\n- `variant=\"cards\"` con valores largos: la tarjeta mide 200 px y los corta (el texto completo sale en el tooltip).",
    "teclado": "- Con círculos no recibe foco: no es interactivo.\n- Con `variant=\"cards\"`, **Tab** recorre las tarjetas (cada una es un `button`) y **Enter / Espacio** elige la\n  enfocada: emite `activeStepChange`.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: los pasos son una lista ordenada (`ol` y `li`); círculos, puntos y líneas\n  van con `aria-hidden`.\n- **4.1.2 Nombre, función y valor (A)**: con círculos, el paso actual lleva `aria-current=\"step\"` y cada nombre suma\n  en texto oculto «paso N de M» y su estado (completado, paso actual o pendiente). Con tarjetas, cada una es un\n  `button` con `aria-pressed` (la activa en `true`) nombrado por sus etiquetas y valores.\n- **Pendiente · 1.4.1 Uso del color (A)**: con círculos, a la vista, completado o pendiente solo se distingue por el\n  relleno del círculo (azul o gris) y el actual se ve igual que los completados; el estado en texto solo llega al\n  lector de pantalla. Con tarjetas no depende del color: la activa suma la barra y la sombra.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: nombres `text-neutral-high` 16.29:1 (oscuro 16.53:1) y número blanco\n  sobre `bg-brand-primary` 8.79:1 (6.67:1) cumplen, pero el número de los pendientes (`text-neutral-low` sobre\n  `surface-high`) no llega a 4.5:1 en claro.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el círculo o punto azul da 2.66:1 sobre la superficie\n  (`bg-brand-primary`). El punto gris de las tarjetas usa `text-neutral-low` (5.01:1 claro / 8.86:1 oscuro).",
    "figma": [
      {
        "nodo": "1264:580",
        "nombre": null
      },
      {
        "nodo": "2582:7222",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-current",
        "aria-hidden"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "gap-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      }
    ],
    "usa": [
      "siaf-stepper-card"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-summary-card",
    "clase": "SummaryCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/summary-card/summary-card.component",
    "archivo": "src/app/shared/ui/summary-card/summary-card.component.ts",
    "descripcion": "Card resumen de campos etiqueta/valor, con indicador lateral, borde opcional y ✕ para limpiar.\n\nEs LA card canónica del \"ítem seleccionado\" que llega desde un side panel: usarla `bordered` con\nindicador, y la ✕ solo en edición. Regla del proyecto: 0 ítems → placeholder gris, 1 → esta card,\n2 o más → grilla estándar (`siaf-table-controls` + `siaf-pagination Bottom`).",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "bordered",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Estilo con borde (sin sombra) en vez del elevado por defecto."
      },
      {
        "nombre": "closeLabel",
        "tipo": "string",
        "porDefecto": "'Cerrar'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "fields",
        "tipo": "SummaryCardField[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showClose",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showIndicator",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para el único ítem elegido desde un panel lateral en una solicitud: plan de cuentas, cuenta contable anterior o\n  entidad del estado (plan de cuentas); ámbito, período, clase y detalle (catálogo de ajustes y asiento de ajuste);\n  evento (eventos contables).\n- `bordered` con indicador y la ✕ solo en edición (`[showClose]=\"!isReadOnly\"`), con un `closeLabel` que nombre el\n  ítem («Quitar plan contable»).\n- Para datos precargados de solo lectura con la misma forma, sin ✕: pliego, unidad ejecutora y período mensual en\n  apertura contable, o la cuenta en uso de una modificación.",
    "evitar": "- Para 2 o más ítems: usar la grilla estándar (`siaf-table-controls` + tabla + `siaf-pagination` Bottom); sin\n  ítems, el placeholder gris o `empty-section`.\n- Para el N° y el estado del documento abierto: usar `siaf-document-summary-card`.\n- Para ítems con detalle que se despliega: usar `siaf-collapsible-card`.\n- Para elegir entre tarjetas: usar `siaf-stepper-card`; esta no es seleccionable.",
    "teclado": "- **Tab**: enfoca la ✕ cuando `showClose` está activo; sin ella la tarjeta no recibe foco.\n- **Enter / Espacio** en la ✕: emiten `closed`; el foco no se mueve solo: al quitar el ítem, el padre debe\n  llevarlo, por ejemplo, al botón de búsqueda.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: la ✕ es un `button` con nombre desde `closeLabel` (por defecto «Cerrar»);\n  el padre debe nombrar el ítem, como «Quitar entidad del estado».\n- **1.1.1 Contenido no textual (A)**: la barra lateral y el ícono de la ✕ son decorativos (`aria-hidden`); el ícono\n  de un campo solo se anuncia si trae `iconLabel` y, si no, queda decorativo.\n- **1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1) y valores\n  `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.\n- **2.4.7 Foco visible (AA)**: la ✕ muestra un contorno de 2 px `border-states-focus` separado 2 px.\n- **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /\n  10.15:1 oscuro sobre la superficie).\n- **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que\n  se cierra con Escape y se puede recorrer con el puntero.\n- **Pendiente · 2.1.1 Teclado (A)**: ese texto no recibe foco, así que con teclado el globo no aparece (el lector de\n  pantalla sí lo lee entero).\n- **2.5.8 Tamaño del objetivo (AA)**: la ✕ mide 40 × 40 px.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md",
          "pl-siaf-md",
          "px-siaf-md",
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-2",
        "via": [
          "shadow-siaf-elevation-2"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-switch",
    "clase": "SwitchComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/switch/switch.component",
    "archivo": "src/app/shared/ui/switch/switch.component.ts",
    "descripcion": "Interruptor on/off con etiqueta al costado. Al pulsarlo el círculo se desliza y el riel cambia de\ncolor con una transición de 200 ms (sin animación si el sistema pide reducir movimiento).\n\nAdmite `[(checked)]` y formularios (`formControl`/`ngModel`). Se opera con el teclado como un\ncheckbox (Tab y Espacio) y se anuncia con `role=\"switch\"`.\n\nSin consumidores: ninguna pantalla usa switch. Las preguntas Sí/No se resuelven con\n`siaf-radio-group` y su `[inline]` para dejarlas en una sola línea.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre accesible cuando no hay `label` visible (ej. un switch dentro de un ítem de lista)."
      },
      {
        "nombre": "checked",
        "tipo": "boolean",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "label",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "checkedChange",
        "tipo": "boolean",
        "descripcion": null
      }
    ],
    "usar": "- Para activar o desactivar una opción con efecto inmediato, sin pasar por Grabar (por ejemplo, «Notificar por\n  correo» en una configuración).\n- Dentro de un ítem de `siaf-list`, al inicio o al final, que le pasa el título del ítem como `ariaLabel`.",
    "evitar": "- Para las preguntas Sí/No de una solicitud, que se graban con el documento: usar `siaf-radio-group` con `[inline]`.\n- Para seleccionar filas o varias opciones de una lista: checkbox nativo, como en `siaf-table-controls`.\n- Sin `label` visible ni `ariaLabel`: el interruptor queda sin nombre.",
    "teclado": "- **Tab**: enfoca el interruptor; el riel muestra un contorno de 2 px en `brand-primary`.\n- **Espacio**: lo enciende o lo apaga (checkbox nativo con `role=\"switch\"`; Enter no lo cambia).",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `<input type=\"checkbox\" role=\"switch\">` con `aria-checked` y `disabled`\n  nativo; se nombra con el `label` que lo envuelve o con `ariaLabel` (el padre debe dar uno de los dos).\n- **2.4.7 Foco visible (AA)**: el input está oculto con `sr-only` y el foco con teclado pinta en el riel un contorno\n  de 2 px separado 2 px (`peer-focus-visible`).\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: apagado, el riel es `bg-border` (`border-states-enabled`, 2.44:1\n  claro y 2.59:1 oscuro); en oscuro, el riel encendido y el contorno de foco (`brand-primary`) quedan en 2.66:1.\n- **1.4.1 Uso del color (A)**: además del color, el círculo cambia de lado.\n- **2.5.8 Tamaño del objetivo (AA)**: el riel mide 44 × 24 px y toda la `label` es clicable.\n- **1.4.3 Contraste mínimo (AA)**: la etiqueta va en `text-neutral-high` 16.29:1; deshabilitado baja al 50 % de\n  opacidad (exento).",
    "figma": [],
    "aria": {
      "roles": [
        "switch"
      ],
      "atributos": [
        "aria-checked",
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-switch-thumb",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "bg-border"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-shadow-sm",
        "via": [
          "shadow-siaf-sm"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-table",
    "clase": "TableComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/table/table.component",
    "archivo": "src/app/shared/ui/table/table.component.ts",
    "descripcion": "Envoltorio mínimo sobre `siaf-data-table`: tabla de columnas y filas, sin selección ni paginación.\n\nÚsalo para listados simples. Cuando la tabla necesita barra superior o paginado, va la grilla\nestándar: `siaf-table-controls` arriba (siempre, con `[showSelection]=false` si no hay selección)\ny `siaf-pagination Bottom` abajo.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "columns",
        "tipo": "DataTableColumn[]",
        "porDefecto": "[]",
        "requerida": true,
        "descripcion": null
      },
      {
        "nombre": "idKey",
        "tipo": "string",
        "porDefecto": "'id'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rows",
        "tipo": "DataTableRow[]",
        "porDefecto": "[]",
        "requerida": true,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para un listado corto de solo lectura con columnas de texto (número, documento, estado como texto) dentro de una\n  tarjeta o un panel.\n- Hoy ninguna pantalla la usa: es la opción del kit antes de escribir otra `<table>` a mano.",
    "evitar": "- Para enlace al documento, tags de estado, checkbox o historial por fila: `siaf-documents-records-table`.\n- Para paginar o seleccionar: no lo hace; va la grilla estándar alrededor (`siaf-table-controls` arriba y\n  `siaf-pagination` con `position=\"Bottom\"` y `rowPage` abajo).\n- Para ítems sin columnas (título, descripción, ícono): `siaf-list`.",
    "teclado": "- No recibe foco: no es interactiva. El scroll es el de `siaf-data-table`, sin `tabindex`.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: pinta `siaf-data-table`: `<table>` con `<thead>` y un `<th>` por columna.\n  No admite `<caption>` ni `ariaLabel` (el padre debe titularla con un encabezado cercano) y no ordena columnas,\n  así que no aplica `aria-sort`.\n- **1.4.3 Contraste mínimo (AA)**: celdas en `text-neutral-high` sobre la superficie (16.29:1 / 16.53:1).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [],
    "usa": [
      "siaf-data-table"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-table-controls",
    "clase": "TableControlsComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/table-controls/table-controls.component",
    "archivo": "src/app/shared/components/table-controls/table-controls.component.ts",
    "descripcion": "Barra superior estándar de las grillas: checkbox de seleccionar todo (con estado indeterminado), acciones sobre las\nfilas elegidas y, a la derecha, `siaf-pagination` en posición `Top`.\n\nLas acciones (editar, eliminar, exportar, más opciones y las que la página proyecta con el atributo `tableAction`)\nsolo aparecen con `selectedCount` mayor que 0, cada una encendida con `showEditAction`, `showDeleteAction`,\n`showExportAction` o `showMenuAction`. Con `[showSelection]=\"false\"` queda solo la paginación.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "checked",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "deleteDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "deleteLabel",
        "tipo": "string",
        "porDefecto": "'Eliminar filas seleccionadas'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "editDisabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "editLabel",
        "tipo": "string",
        "porDefecto": "'Editar fila seleccionada'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "exportLabel",
        "tipo": "string",
        "porDefecto": "'Exportar filas seleccionadas'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "hideTopPaginationOnMobile",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "indeterminate",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "menuLabel",
        "tipo": "string",
        "porDefecto": "'Mas opciones'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "page",
        "tipo": "number",
        "porDefecto": "1",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "pageSize",
        "tipo": "number",
        "porDefecto": "10",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "selectAllLabel",
        "tipo": "string",
        "porDefecto": "'Seleccionar filas'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "selectedCount",
        "tipo": "number",
        "porDefecto": "0",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showDeleteAction",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showEditAction",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showExportAction",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showMenuAction",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "showSelection",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "totalItems",
        "tipo": "number",
        "porDefecto": "0",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "totalPages",
        "tipo": "number",
        "porDefecto": "1",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "delete",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "edit",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "exported",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "menu",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "next",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "previous",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "selectionChange",
        "tipo": "boolean",
        "descripcion": null
      }
    ],
    "usar": "- Arriba de toda grilla, siempre: bandeja, pestañas Documentos / Registros, panel lateral de selección y tablas de\n  solicitudes, consultas, Admin y Apertura contable.\n- En edición, con `[showSelection]=\"!isReadOnly\"` y las acciones que correspondan (p. ej. `showEditAction` con\n  `editDisabled` si hay más de una fila elegida); en consulta, con `[showSelection]=\"false\"`.\n- Para una acción extra sobre la selección: proyectarla con `tableAction` (Libros contables proyecta un\n  `siaf-icon-dropdown-menu` «Descargar la selección»).",
    "evitar": "- Armar la barra a mano con un checkbox y `siaf-pagination` en `Top`: esa paginación solo vive dentro de este\n  componente.\n- Para la paginación de abajo: `siaf-pagination` con `position=\"Bottom\"` y `rowPage`.\n- Para acciones que no dependen de la selección (crear, exportar todo): van en la cabecera de la sección con\n  `siaf-button` o `siaf-icon-dropdown-menu`; aquí solo aparecen con filas elegidas.",
    "teclado": "- **Tab**: recorre el checkbox de seleccionar todo, las acciones visibles y las flechas de la paginación.\n- **Espacio**: marca o desmarca el checkbox (nativo) y emite `selectionChange`.\n- **Enter / Espacio**: ejecutan la acción enfocada. Las flechas siguen `siaf-pagination` y las acciones proyectadas,\n  su componente.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: checkbox nativo con `aria-label` (`selectAllLabel`, «Seleccionar filas» por\n  defecto) y estado mixto con `indeterminate`; las acciones son `<button>` con `aria-label` (`editLabel`,\n  `deleteLabel`, `exportLabel` y `menuLabel`, este «Mas opciones» sin tilde) y `editDisabled` usa `disabled`.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: el contador de la paginación superior no se anuncia al cambiar de\n  página o filtrar (lo hereda de `siaf-pagination`), y tampoco hay aviso de cuántas filas quedan elegidas.\n- **Pendiente · 2.4.3 Orden del foco (A)**: las acciones solo existen con filas elegidas: si una deja la selección\n  en 0 (p. ej. Eliminar), su botón enfocado desaparece y el foco no pasa a otro control.\n- **1.4.11 Contraste no textual (AA)**: borde del checkbox en `icon-states-enabled` (8.70:1 / 12.87:1; marcado, en\n  `icon-states-active`, 8.79:1 / 10.15:1) e íconos de acción en `text-neutral-low` (5.01:1 / 8.86:1).\n- **2.4.7 Foco visible (AA)**: sin estilo propio: el checkbox y los botones muestran el anillo nativo del navegador;\n  las flechas, el de `siaf-pagination`.\n- **2.5.8 Tamaño del objetivo (AA)**: el `<label>` del checkbox y cada acción miden 40 × 40 px.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "px-siaf-sm"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon",
      "siaf-pagination"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-table-skeleton",
    "clase": "TableSkeletonComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/table-skeleton/table-skeleton.component",
    "archivo": "src/app/shared/ui/table-skeleton/table-skeleton.component.ts",
    "descripcion": "Skeleton loader para tablas. Renderiza filas y columnas con animación de pulso\npara indicar al usuario que el contenido está cargando.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "'Cargando contenido de la tabla'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "columns",
        "tipo": "number",
        "porDefecto": "9",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "minWidthClass",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "rows",
        "tipo": "number",
        "porDefecto": "6",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Mientras cargan las filas de una grilla: `siaf-documents-records-page` la pinta en lugar de la tabla, con las\n  columnas visibles y las filas por página.\n- Al abrir una solicitud de carga masiva de cuentas contables, mientras llega el detalle, con un `ariaLabel` que\n  dice qué se carga.",
    "evitar": "- Para esperas que no son una tabla (procesar un archivo, grabar): `siaf-loader`, `siaf-loader-overlay` o\n  `siaf-loading-progress`.\n- Cuando la consulta ya respondió sin filas: `siaf-empty-state` o `empty-section`.\n- Con columnas o ancho distintos de la tabla real: pasar los mismos `columns` y `minWidthClass` para que la\n  pantalla no salte al terminar.",
    "teclado": "- No recibe foco: no es interactivo.",
    "accesibilidad": "- **4.1.3 Mensajes de estado (AA)**: el contenedor es `role=\"status\"` con `aria-live=\"polite\"` y repite `ariaLabel`\n  en un texto `sr-only` («Cargando contenido de la tabla» por defecto); el padre debe pasar uno que diga qué se\n  carga. El fin de la carga no se anuncia: le toca a la grilla.\n- **Pendiente · 1.3.1 Información y relaciones (A)**: la tabla de barras no lleva `aria-hidden`: dentro del mensaje\n  de carga el lector puede encontrar una tabla con cabeceras `<th>` vacías.",
    "figma": [],
    "aria": {
      "roles": [
        "status"
      ],
      "atributos": [
        "aria-label",
        "aria-live"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  },
  {
    "selector": "siaf-tabs",
    "clase": "TabsComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/tabs/tabs.component",
    "archivo": "src/app/shared/ui/tabs/tabs.component.ts",
    "descripcion": "Pestañas del design system (Figma UI KIT, nodo 2588:135 «Tabs content»).\n\nUna fila de pestañas sobre una línea gris de 2 px. Texto de 14 px en gris; la activa va en negrita azul.\n- `border` (por defecto `true`): la activa se dibuja como carpeta, con borde arriba y a los lados y el\n  fondo de la superficie, y corta la línea. Con `border=false` la activa lleva un subrayado azul de 2 px.\n- Al pasar el mouse, enfocar con teclado o presionar, una capa de estado del Figma cubre la pestaña.\n- `count` muestra un contador con `siaf-badge`; `fullWidth` reparte el ancho entre las pestañas.\n- Con muchas pestañas (Figma «6+») la fila se desplaza en horizontal sin barra visible.\n\nEl padre mantiene el `activeId` y decide qué contenido pinta: este componente solo dibuja la fila.\n`siaf-records-tabs`, la franja «Detalle | Historial» de `siaf-detail-history-tabs` y el login lo usan por dentro.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "activeId",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "ariaLabel",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre accesible de la fila de pestañas."
      },
      {
        "nombre": "border",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Figma «Border»: `true` dibuja la activa como carpeta; `false`, con subrayado azul."
      },
      {
        "nombre": "fullWidth",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Reparte el ancho disponible entre las pestañas."
      },
      {
        "nombre": "idBase",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Prefijo de los ids de las pestañas (`idBase-idDeLaPestaña`), para que el panel los cite en `aria-labelledby`."
      },
      {
        "nombre": "tabs",
        "tipo": "TabItem[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "activeIdChange",
        "tipo": "string",
        "descripcion": "Emite el `id` de la pestaña elegida (no se emite al pulsar la que ya está activa)."
      },
      {
        "nombre": "selected",
        "tipo": "TabItem",
        "descripcion": null
      }
    ],
    "usar": "- Para alternar entre vistas de una misma pantalla sin cambiar de ruta (Documentos / Registros, Detalle / Historial).\n- Entre 2 y 5 pestañas con nombres cortos; con más, la fila se desplaza en horizontal.\n- `border=false` bajo cabeceras y dentro de tarjetas; `border=true` cuando la pestaña activa se une a un panel blanco.",
    "evitar": "- Para acciones o para navegar a otra ruta: usar `siaf-button` o un enlace.\n- Para seguir un flujo por etapas: usar `siaf-steps` o `siaf-action-tracker`.\n- Pestañas anidadas dentro de otra pestaña.",
    "teclado": "- **Tab**: entra a la fila en la pestaña activa (o en la primera, si ninguna lo está) y el siguiente Tab sale de la\n  fila.\n- **Flecha izquierda / derecha**: pasan a la pestaña anterior o siguiente (dan la vuelta) y la activan.\n- **Inicio / Fin**: van a la primera o a la última pestaña y la activan.\n- **Enter / Espacio**: activan la pestaña enfocada (cada pestaña es un `<button>`).",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: la fila es `role=\"tablist\"` y cada pestaña un `<button>` con `role=\"tab\"` y\n  `aria-selected`. El padre debe dar `ariaLabel` a la fila (por defecto va vacío) y, en el contenido,\n  `role=\"tabpanel\"` con `aria-labelledby` apuntando al id de la pestaña (`idBase` + `-` + id de la pestaña); hoy solo\n  lo hace la ficha del `/ui-kit`.\n- **2.1.1 Teclado (A)**: flechas izquierda y derecha, Inicio y Fin; solo la activa (o la primera, si ninguna lo está)\n  entra en el orden de tabulación (roving tabindex).\n- **2.4.7 Foco visible (AA)**: `:focus-visible` pinta un contorno interior azul de 2 px (`border-states-focus`,\n  5.35:1 claro / 10.15:1 oscuro) sobre la capa `bg-states-light-focus`. Es un `outline`, no una sombra: en la\n  pestaña activa, que es la que recibe el foco, la sombra del subrayado o de la carpeta ya no lo tapa.\n- **1.4.3 Contraste mínimo (AA)**: activa `text-neutral-activated` (8.79:1 claro / 17.76:1 oscuro) e inactivas\n  `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie; con `border=false` el fondo es el del padre.\n- **1.4.1 Uso del color (A)**: la activa además va en negrita, así que el estado no depende del subrayado\n  (`border-states-active`, 2.02:1 en oscuro) ni del borde de carpeta.\n- **2.5.8 Tamaño del objetivo (AA)**: cada pestaña mide al menos 40 px de alto.",
    "figma": [
      {
        "nodo": "2588:135",
        "nombre": "Tabs content"
      }
    ],
    "aria": {
      "roles": [
        "tab",
        "tablist"
      ],
      "atributos": [
        "aria-label",
        "aria-selected"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "var()"
        ]
      }
    ],
    "usa": [
      "siaf-badge"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-tag",
    "clase": "TagComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/tag/tag.component",
    "archivo": "src/app/shared/ui/tag/tag.component.ts",
    "descripcion": "Tag del kit (Figma UI KIT, «Input tags», «Choice tags», «Filter tags» y «Action tags»): la misma forma (borde, esquinas\nde 8 px, íconos de 20 px y 32 o 24 px de alto) con cuatro usos, en `variant`. `input` es un texto con una × opcional\nque lo quita; `choice`, un botón que se elige o se deselecciona (`aria-pressed`); `filter`, el botón que abre las\nopciones de un filtro, con la flecha ▾ y el check al tener valor; y `action`, un botón de acción rápida.\n\nLos estados son los del Figma: sin elegir va con borde gris y texto `text-neutral-medium`; elegido (`selected`),\ncon fondo y borde azules; hover y foco pintan su capa y su borde; `disabled` apaga el texto y quita la × y la flecha;\ny `dragged` es el estado visual de arrastre (capa y sombra «Elevation 1»), sin lógica de arrastre.\n\nLa × es un botón aparte del botón principal, dentro del mismo borde: nunca un control dentro de otro.",
    "usaSesion": false,
    "proyectaContenido": true,
    "entradas": [
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "dragged",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Estado visual de arrastre del Figma (capa y sombra); no arrastra nada."
      },
      {
        "nombre": "expanded",
        "tipo": "boolean | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": "En `filter`: si el menú que abre está abierto; con valor, publica `aria-expanded` y gira la flecha."
      },
      {
        "nombre": "icon",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Ícono inicial de Material Icons. En `filter`, sin él, el check aparece al estar elegido."
      },
      {
        "nombre": "removable",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Muestra la × (en `input` y `filter`); se oculta con `disabled`."
      },
      {
        "nombre": "removeLabel",
        "tipo": "string",
        "porDefecto": "'Quitar'",
        "requerida": false,
        "descripcion": "Nombre de la × para el lector de pantalla: «Quitar filtro Estado»."
      },
      {
        "nombre": "selected",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": "Elegido: fondo y borde azules. No aplica a `action`."
      },
      {
        "nombre": "size",
        "tipo": "'standard' | 'small'",
        "porDefecto": "'standard'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'input' | 'choice' | 'filter' | 'action'",
        "porDefecto": "'input'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "clicked",
        "tipo": "MouseEvent",
        "descripcion": "Pulsación del botón (`choice`, `filter` y `action`)."
      },
      {
        "nombre": "removed",
        "tipo": "MouseEvent",
        "descripcion": "La × del tag."
      },
      {
        "nombre": "selectedChange",
        "tipo": "boolean",
        "descripcion": "`choice`: el nuevo estado al pulsarlo."
      }
    ],
    "usar": "- `input` con `selected` para mostrar valores aplicados, como los chips de «Filtros aplicados de búsqueda»\n  (`siaf-consultas-filtros-chips`); con `removable` cuando cada uno se quita por separado (emite `removed`).\n- `filter` para el disparador de un filtro con opciones: lo usa `siaf-filter-pill`, que pone el menú, el valor elegido\n  y la × para limpiarlo. `expanded` expone si el menú está abierto y gira la flecha.\n- `choice` para elegir entre opciones que se prenden y apagan (emite `selectedChange`), con un ícono si ayuda a\n  reconocerlas.\n- `action` para acciones rápidas y secundarias junto a un contenido (emite `clicked`).\n- `small` (24 px) en barras densas o dentro de tablas.",
    "evitar": "- Para el estado de un documento, un registro u otro estado con color: usar `siaf-flow-status-tag`,\n  `siaf-record-status-tag` o `siaf-status-tag`.\n- Para un filtro con menú hecho a mano: usar `siaf-filter-pill`, que ya dibuja con `filter`.\n- Para la acción principal de una pantalla o un formulario: usar `siaf-button`.\n- Para contadores o avisos de novedades: usar `siaf-badge`.",
    "teclado": "- **Tab**: enfoca el botón del tag (`choice`, `filter` y `action`) y, si tiene, su ×; `input` sin × no recibe foco.\n- **Enter / Espacio**: en `choice` elige o deselecciona; en `filter` y `action` emiten `clicked`; sobre la ×, emiten\n  `removed`.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `choice`, `filter` y `action` son `<button>` nombrados por su texto; `choice`\n  publica `aria-pressed` y `filter`, con `expanded`, `aria-haspopup=\"menu\"` y `aria-expanded`. La × es otro `<button>`\n  con `aria-label` (`removeLabel`), al lado del principal y no dentro.\n- **2.4.7 Foco visible (AA)**: con el foco en el botón o en la ×, el tag pinta la capa y el borde de foco del Figma y\n  el anillo del kit, 2 px `border-states-focus` separado 2 px (5.35:1 claro / 10.15:1 oscuro).\n- **1.4.1 Uso del color (A)**: `filter` elegido suma el check; `choice` elegido solo cambia de color en pantalla, y el\n  lector lo sabe por `aria-pressed`.\n- **1.4.3 Contraste mínimo (AA)**: sin elegir, `text-neutral-medium` sobre la superficie (14.53:1 claro / 12.87:1\n  oscuro); elegido, `text-neutral-activated` sobre la capa `bg-states-light-selected` (7.69:1 / 17.15:1).\n  Deshabilitado queda fuera del criterio.\n- **2.4.3 Orden del foco (A)**: al quitar un tag, la × desaparece con el foco adentro: quien lo quita lleva el foco a\n  otro control, como `siaf-filter-pill`, que lo deja en el botón de la píldora.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde sin elegir es `border-states-enabled` (2.44:1 claro /\n  2.59:1 oscuro) y el de elegido, `border-states-active`, baja a 2.02:1 en oscuro.\n- **Pendiente · 2.5.8 Tamaño del objetivo (AA)**: la × mide 20 × 20 px, pegada al botón principal.",
    "figma": [
      {
        "nodo": "12474:5170",
        "nombre": "Input tags"
      },
      {
        "nodo": "12482:857",
        "nombre": "Choice tags"
      },
      {
        "nodo": "12482:484",
        "nombre": "Filter tags"
      },
      {
        "nodo": "12500:328",
        "nombre": "Action tags"
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-expanded",
        "aria-haspopup",
        "aria-label",
        "aria-pressed"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-dragged",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "mx-siaf-xs",
          "pl-siaf-xs",
          "pr-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-timeline",
    "clase": "TimelineComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/timeline/timeline.component",
    "archivo": "src/app/shared/components/timeline/timeline.component.ts",
    "descripcion": "Seguimiento horizontal del avance de un proceso: título, «Ver detalle» y una barra con un punto por hito\n(Figma UI KIT, nodo 19149:1300 «TIMELINE»).\n\nLa barra se llena hasta el hito `current` (índice desde 0): los anteriores quedan cumplidos, ese va en\ncurso y los siguientes pendientes. `current = -1` es un proceso sin empezar y `current = items.length`,\nuno terminado. Cada punto muestra su nombre y fecha con `siafTooltip` al pasar el puntero o al llegar\ncon el teclado, y los lectores de pantalla lo anuncian con su posición y estado.\n\n«Ver detalle» abre `siaf-timeline-detail-panel` con el avance y la línea de tiempo vertical (fecha,\n`dateInfo` y `description` de cada hito) y además emite `detail`. Con `[openDetailPanel]=\"false\"` solo\nemite, para que el padre muestre su propio detalle.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "current",
        "tipo": "number",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Índice del hito en curso (desde 0). -1: sin empezar; `items.length`: terminado."
      },
      {
        "nombre": "detailLabel",
        "tipo": "string",
        "porDefecto": "'Ver detalle'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "itemLabel",
        "tipo": "string",
        "porDefecto": "'hito'",
        "requerida": false,
        "descripcion": "Cómo se llama un hito en el resumen del detalle: «9 procedimientos completados de 11»."
      },
      {
        "nombre": "items",
        "tipo": "TimelineItem[]",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "itemsLabel",
        "tipo": "string",
        "porDefecto": "'hitos'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "openDetailPanel",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": "Si «Ver detalle» abre el panel de detalle incluido. En `false` solo emite `detail`."
      },
      {
        "nombre": "processName",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre del proceso en la tarjeta del detalle; por defecto, el `title`."
      },
      {
        "nombre": "showDetail",
        "tipo": "boolean",
        "porDefecto": "true",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Qué proceso se sigue; va en mayúsculas y se corta con tooltip si no entra."
      }
    ],
    "eventos": [
      {
        "nombre": "detail",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para seguir el avance de un proceso largo por hitos con fecha dentro de una tarjeta de resumen, por ejemplo las\n  etapas del ejercicio contable (apertura, contabilización y cierre) en un tablero.\n- Cuando cada hito tiene fecha, `dateInfo` o `description` que conviene ver en el panel «Ver detalle», o el padre\n  muestra su propio detalle con `[openDetailPanel]=\"false\"`.\n- Hoy sin consumidores fuera del catálogo `/ui-kit`.",
    "evitar": "- Para el flujo de aprobación de una solicitud (Elaborado, Verificado, Aprobado): usar `siaf-action-tracker`.\n- Para pasos con el nombre siempre visible: usar `siaf-steps`; aquí el nombre de cada hito solo sale en el tooltip.\n- Con muchos hitos en poco ancho: cada hito mide al menos 16 px y los puntos se amontonan; usar `siaf-steps`\n  vertical.\n- Para un porcentaje sin hitos: usar `siaf-loading-progress` o `siaf-progress-circular`.",
    "teclado": "- **Tab**: pasa por «Ver detalle» y luego por cada punto de la barra; al enfocar un punto aparece su tooltip con\n  nombre y fecha.\n- **Enter / Espacio** en «Ver detalle»: abren `siaf-timeline-detail-panel` y emiten `detail` (sigue `siaf-button`).\n- El panel de detalle se cierra con su X o con Escape; el foco vuelve a «Ver detalle».",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: los hitos son una lista ordenada (`ol` y `li`) dentro de un `section`\n  con `aria-label` igual al título, que además es un `h3`.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada punto anuncia «Hito N de M: nombre · fecha, estado» y el\n  actual lleva `aria-current=\"step\"`, pero es un `span` con `tabindex=\"0\"` sin rol: ARIA no admite `aria-label` en\n  un elemento genérico y no todos los lectores de pantalla lo leen.\n- **1.4.1 Uso del color (A)**: el avance se ve por el largo de la barra llena, que llega hasta el hito en curso, no\n  solo por el tono de los puntos.\n- **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` 16.29:1 (oscuro 16.53:1) sobre la superficie.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro la barra llena y el contorno de foco de los puntos\n  (`bg-brand-primary`) dan 2.66:1 sobre la superficie; en los hitos cumplidos ese contorno además se funde con la\n  barra del mismo color.\n- **1.4.13 Contenido en hover o foco (AA)**: el tooltip de los puntos se cierra con Escape y se puede recorrer con el\n  puntero.\n- **Pendiente · 2.1.1 Teclado (A)**: el título truncado no recibe foco: su texto completo solo sale con el puntero\n  (el lector de pantalla sí lo lee entero).\n- **2.4.7 Foco visible (AA)**: cada punto muestra un contorno de 2 px `border-states-focus` (5.35:1 claro / 10.15:1\n  oscuro); «Ver detalle» sigue `siaf-button`.\n- **2.4.3 Orden del foco (A)**: el panel de «Ver detalle» (`siaf-timeline-detail-panel`, con `siafFoco`) lleva el\n  foco a su X al abrir, cierra con Escape y lo devuelve a «Ver detalle».",
    "figma": [
      {
        "nodo": "19149:1300",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-current",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-brand-white",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "pb-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-button",
      "siaf-timeline-detail-panel"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-timeline-detail-panel",
    "clase": "TimelineDetailPanelComponent",
    "tipo": "componente",
    "capa": "components",
    "importacion": "@siaf/shared/components/timeline/timeline-detail-panel.component",
    "archivo": "src/app/shared/components/timeline/timeline-detail-panel.component.ts",
    "descripcion": "Panel lateral «Detalle del seguimiento» de `siaf-timeline` (Figma Control de Inventarios, nodo 20182:155604):\nuna tarjeta con el avance (barra, «9/11» y «9 procedimientos completados de 11») y la línea de tiempo\nvertical con un hito por fila (Figma UI KIT, TL_GOAL_VERTICAL: cumplido, en curso y pendiente).\n\nUn hito cumplido muestra su fecha y `dateInfo` a la izquierda; el en curso y los pendientes muestran «-»\ncon «En proceso» o «No iniciado». Lo abre `siaf-timeline` con «Ver detalle», pero también se puede usar\nsuelto: el padre controla `open` y cierra con `closed`.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "current",
        "tipo": "number",
        "porDefecto": null,
        "requerida": false,
        "descripcion": "Índice del hito en curso (desde 0), igual que en `siaf-timeline`."
      },
      {
        "nombre": "itemLabel",
        "tipo": "string",
        "porDefecto": "'hito'",
        "requerida": false,
        "descripcion": "Cómo se llama un hito en el resumen, en singular y plural: «9 procedimientos completados de 11»."
      },
      {
        "nombre": "items",
        "tipo": "TimelineItem[]",
        "porDefecto": null,
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "itemsLabel",
        "tipo": "string",
        "porDefecto": "'hitos'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "processName",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Nombre del proceso en la tarjeta de avance (va en mayúsculas)."
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "'Detalle del seguimiento'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Lo abre `siaf-timeline` con «Ver detalle» para mostrar la fecha, el estado y la descripción de cada hito de un\n  proceso por etapas.\n- Suelto, cuando la pantalla muestra el avance a su manera (`siaf-timeline` con `[openDetailPanel]=\"false\"`) y solo\n  necesita este detalle.\n- Con `itemLabel` / `itemsLabel` para nombrar los hitos del proceso en el resumen («9 procedimientos completados\n  de 11»).",
    "evitar": "- Para el historial de acciones de una solicitud (quién verificó, aprobó u observó): usar\n  `siaf-document-history-panel` o `siaf-action-tracker`.\n- Para los pasos de un formulario o asistente: usar `siaf-steps`.\n- Para la barra de avance dentro de la página: usar `siaf-timeline`, que ya abre este panel.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X, el único control, y no sale del panel.\n- **Enter / Espacio**: la X cierra el panel (emite `closed`).\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve a «Ver detalle».",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"dialog\"` con `aria-modal=\"true\"` y `aria-labelledby` al título (id\n  propio por instancia); la barra es `role=\"progressbar\"` con `aria-valuenow`, `aria-valuemax` y el resumen como\n  nombre, y el hito en curso lleva `aria-current=\"step\"`.\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve a «Ver detalle».\n- **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.\n- **1.3.1 Información y relaciones (A)**: título `h2` y los hitos en una lista ordenada (`ol` / `li`) con\n  `aria-label`; el punto y la línea de cada hito son `aria-hidden`.\n- **1.4.1 Uso del color (A)**: el estado de cada hito va en texto, no solo en el color del punto: los cumplidos\n  muestran su fecha, el en curso «En proceso» y los pendientes «No iniciado».\n- **1.4.3 Contraste mínimo (AA)**: `text-neutral-high` (16.29:1 / 16.53:1), `text-neutral-medium` (14.53:1 /\n  12.87:1) y las descripciones `text-neutral-low` (5.01:1 / 8.86:1) sobre `bg-surface`.\n- **2.4.7 Foco visible (AA)**: la X no tiene estilo de foco propio ni `outline-none`: queda el anillo nativo del\n  navegador.\n- **2.5.8 Tamaño del objetivo (AA)**: la X mide 40 px.",
    "figma": [
      {
        "nodo": "20182:155604",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "dialog",
        "progressbar"
      ],
      "atributos": [
        "aria-current",
        "aria-hidden",
        "aria-label",
        "aria-labelledby",
        "aria-modal",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "pb-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "pb-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "px-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "pt-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-tray-documents-view",
    "clase": "TrayDocumentsViewComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/tray-documents-view/tray-documents-view.component",
    "archivo": "src/app/layout/tray-documents-view/tray-documents-view.component.ts",
    "descripcion": "Vista de la Bandeja de Documentos: la grilla de una sección (`title` = Recibidos, Enviados,\nBorradores o Papelera) con buscador, filtros de Estado y Tipo de acción, filtros personalizados y favoritos.\n\nLas filas salen del facade de solicitudes (carga la bandeja de creador o de aprobador según el rol) y se\nrecortan con `SECTION_STATES`, que define qué estados ve cada sección; sin filtro de estado explícito\nordena \"pendientes primero\". El buscador es `siaf-records-search-toolbar`, la misma barra de Documentos y registros,\ncon los menús Campos y Favorito y el botón Más opciones proyectados: solo aplica con Enter o la lupa.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "'Borradores'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Como contenido de la Bandeja de Documentos en `siaf-app-shell`: se pinta al elegir Recibidos, Enviados, Borradores\n  o Papelera en `siaf-tray-menu`, con esa sección en `title`.\n- Para revisar los documentos propios según el rol: el creador ve borradores, enviados, respuestas del aprobador y\n  eliminados; el aprobador, lo que recibe para aprobar y lo que ya respondió.",
    "evitar": "- Para los documentos de un proceso (plan de cuentas, asientos de ajuste, catálogo de eventos…): usar\n  `siaf-documents-records-page`, con pestañas Documentos / Registros e historial.\n- Para la sección Notificaciones de la bandeja: usar `siaf-tray-notifications-view`.\n- Como base de una grilla nueva: varios controles aún no hacen nada (casillas, Campos, Favorito, Más opciones,\n  Historial e Inicio); partir de `siaf-table-controls`, `siaf-documents-records-table` y `siaf-pagination`.",
    "teclado": "- **Enter** en el buscador: aplica la búsqueda, igual que la lupa; escribir no filtra por sí solo.\n- **Enter / Espacio** en la X de un filtro personalizado: lo quita; sobre el resto del chip, lo abre para editarlo.\n- **Tab**: al abrir el panel de filtros personalizados el foco entra en su primer campo, aunque se pinte después de\n  la paginación; se cierra con Aplicar, Cancelar o Escape.\n- Los demás controles siguen su componente: `siaf-records-search-toolbar`, `siaf-filter-pill`, `siaf-icon-dropdown-menu`,\n  `siaf-table-controls`, `siaf-pagination` y `siaf-custom-filter`.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: `h1`, `h2` y `<table>` con `<th>` están bien, pero la ruta de\n  navegación es un `nav` hecho a mano, sin `ol`/`li` ni `aria-current` (`siaf-breadcrumb` ya lo resuelve); las\n  columnas de casilla e Historial tienen `<th>` vacío y el encabezado «Fecha de re...» viene cortado en el texto.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: celdas en `text-neutral-medium` sobre la superficie (14.53:1 / 12.87:1),\n  pero la etiqueta Observado (`siaf-flow-status-tag`) queda en 3.39:1 en claro.\n- **2.4.3 Orden del foco (A)**: el panel de filtros personalizados (`siaf-custom-filter`) recibe el foco al abrirse,\n  cierra con Escape y lo devuelve al botón que lo abrió, aunque se pinte después de la grilla.\n- **2.4.7 Foco visible (AA)**: los botones propios (Inicio, Más opciones, chips de filtro personalizado, «Agregar\n  filtro personalizado» e Historial) y las casillas no tienen estilo de foco y quedan con el anillo del navegador;\n  los controles del kit traen el suyo.\n- **Pendiente · 2.5.8 Tamaño del objetivo (AA)**: la X para quitar un filtro personalizado mide 20 px (`size-5`) y está\n  dentro del chip, que es otro objetivo.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: las casillas de fila no tienen nombre; el chip de filtro\n  personalizado se llama siempre «Filtro personalizado aplicado» (tapa campo y valor) y su X es un `role=\"button\"`\n  dentro de otro `<button>`, que los lectores no anuncian bien; «Agregar filtro personalizado» no publica\n  `aria-expanded`.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: buscar, filtrar o paginar cambia la grilla y el contador «1-10 de N»\n  sin anunciarlo, y sin resultados la tabla queda vacía, sin mensaje.",
    "figma": [],
    "aria": {
      "roles": [
        "button"
      ],
      "atributos": [
        "aria-hidden",
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-lowest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-active",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-strong",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-icon-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg",
          "pb-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "inset-x-siaf-md",
          "p-siaf-md",
          "pt-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "px-siaf-sm",
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "px-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-l-siaf-sm",
          "rounded-r-siaf-sm",
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-custom-filter",
      "siaf-filter-pill",
      "siaf-flow-status-tag",
      "siaf-icon",
      "siaf-icon-dropdown-menu",
      "siaf-pagination",
      "siaf-records-search-toolbar",
      "siaf-table-controls"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-tray-menu",
    "clase": "TrayMenuComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/tray-menu/tray-menu.component",
    "archivo": "src/app/layout/tray-menu/tray-menu.component.ts",
    "descripcion": "Menú de la Bandeja de Documentos: lista Recibidos, Enviados, Borradores, Notificaciones y Papelera\ncon su contador, y emite en `selected` la sección elegida.\n\nLos contadores son un `computed` que depende del rol: `SolicitudesStateService` para las bandejas\n(el aprobador no tiene Borradores ni Papelera) y `NotificationsStateService.unreadCount()` —la misma\nfuente por socket que la campana del navbar— para Notificaciones. Se muestran a dos dígitos, tope '99+'.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "selectedItem",
        "tipo": "string",
        "porDefecto": "'Borradores'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "selected",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Como panel de la Bandeja en `siaf-app-shell`: se abre desde Bandeja del rail o del menú móvil, y la sección elegida\n  decide si se pinta `siaf-tray-documents-view` o `siaf-tray-notifications-view`.\n- Para ver de un vistazo cuántos documentos hay por sección según el rol y cuántas notificaciones sin leer, con la\n  misma cuenta que la campana de `siaf-navbar`.",
    "evitar": "- Para la navegación principal: usar `siaf-sidebar` o `siaf-mobile-navigation-menu`.\n- Para alternar secciones dentro de una pantalla (Documentos / Registros): usar `siaf-tabs` o `siaf-records-tabs`.\n- Para una lista de opciones con contador fuera del armazón: usar `siaf-list` con un badge al final.",
    "teclado": "- **Tab**: recorre las cinco secciones en orden.\n- **Enter / Espacio**: emiten `selected` con la sección (Recibidos, Enviados, Borradores, Notificaciones o Papelera).",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con `h2` y un `<nav>`, pero el `nav` no tiene\n  `aria-label` (en escritorio convive con el del rail) y las secciones son botones sueltos, sin lista `ul`/`li`.\n- **1.4.1 Uso del color (A)**: la sección elegida, además del fondo y el color, va en negrita.\n- **1.4.3 Contraste mínimo (AA)**: contadores de `siaf-badge` en blanco sobre `bg-brand-accent` (4.89:1 / 5.65:1) y,\n  en claro, secciones en `text-neutral-medium` sobre blanco (14.53:1); en oscuro el fondo es\n  `bg-surfaces-surface-highest` y falta medirlo.\n- **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro\n  / 10.15:1 oscuro sobre la superficie).\n- **Pendiente · 2.4.3 Orden del foco (A)**: no toma el foco al abrirse ni cierra con Escape; el armazón lo pinta\n  después del rail, así que desde Bandeja el Tab pasa antes por Procesos, Ayuda y Ajustes.\n- **2.4.7 Foco visible (AA)**: cada sección muestra un contorno azul de 2 px con `focus-visible`.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada sección es un `<button>` cuyo nombre incluye el contador\n  («Recibidos 03»), pero la elegida no publica `aria-current`.\n- **4.1.3 Mensajes de estado (AA)**: los contadores se leen dentro del botón al enfocarlo; no son región viva, así que\n  avisar de una notificación nueva le toca a la campana de `siaf-navbar`.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-selected",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-tipography-neutral-high",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      },
      {
        "token": "--sys-shadow-elevation-1",
        "via": [
          "shadow-siaf-elevation-1"
        ]
      }
    ],
    "usa": [
      "siaf-badge",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-tray-notifications-view",
    "clase": "TrayNotificationsViewComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/tray-notifications-view/tray-notifications-view.component",
    "archivo": "src/app/layout/tray-notifications-view/tray-notifications-view.component.ts",
    "descripcion": "Sección Notificaciones de la bandeja: historial paginado con filtro Todas / No leídas / Leídas\ny acción \"Marcar todas como leídas\".\n\nEl historial completo lo trae `NotificacionesApiService` (con skeletons mientras carga), mientras que\nel marcado masivo pasa por `NotificationsStateService` para que la campana del navbar quede en cero.\nAl hacer clic navega al documento resolviendo la ruta del proceso por el código del catálogo (SCMPC,\nSRAA, STAA, SCA, CAM…), con fallback a Plan de Cuentas.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [],
    "eventos": [],
    "usar": "- Como sección Notificaciones de la Bandeja en `siaf-app-shell`: se pinta cuando `siaf-tray-menu` emite\n  «Notificaciones».\n- Para revisar el historial completo, filtrar leídas o no leídas y abrir el documento de cada notificación (plan de\n  cuentas, asientos de ajuste, tipos y clases de ajuste, apertura contable).",
    "evitar": "- Para un vistazo rápido desde cualquier pantalla: usar la campana de `siaf-navbar`, que abre\n  `siaf-notifications-panel`.\n- Para las demás secciones de la bandeja (Recibidos, Enviados, Borradores, Papelera): usar `siaf-tray-documents-view`.\n- Para el historial de un documento o registro: usar `siaf-document-history-panel` o `siaf-action-tracker`.",
    "teclado": "- **Tab**: recorre el Inicio de la ruta (sin acción), «Marcar todas como leídas» si hay no leídas, las tres pestañas\n  de filtro (cada una es una parada), la paginación de arriba, las notificaciones y la de abajo.\n- **Enter / Espacio**: en una pestaña aplica el filtro y vuelve a la página 1; en una notificación abre su documento,\n  si lo tiene; en «Marcar todas como leídas», las marca.\n- La paginación sigue `siaf-table-controls` y `siaf-pagination`.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: `h1`, `h2` y notificaciones en lista `ul`/`li`, pero la ruta de\n  navegación es un `nav` hecho a mano, sin `ol`/`li` ni `aria-current` (`siaf-breadcrumb` ya lo resuelve), y leída o\n  no leída solo se ve por el punto azul, que es `aria-hidden`.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: título `text-text` 16.29:1 / 16.53:1, mensaje `text-neutral-medium`\n  14.53:1 / 12.87:1, fecha y pestañas inactivas `text-neutral-low` 5.01:1 / 8.86:1 y pestaña activa blanca sobre\n  `bg-brand-primary` 8.79:1 / 6.67:1; pero «Marcar todas como leídas» usa la clase `text-brand-primary` (azul de\n  fondo de marca) y en oscuro queda en 2.66:1.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro, el punto de no leída, el relleno de la pestaña activa y\n  el contorno de foco, todos en `brand-primary`, quedan en 2.66:1 sobre la superficie.\n- **Pendiente · 2.4.3 Orden del foco (A)**: al usar «Marcar todas como leídas» el botón desaparece y el foco se pierde.\n- **2.4.7 Foco visible (AA)**: las notificaciones y «Marcar todas como leídas» muestran un contorno azul de 2 px con\n  `focus-visible`; las pestañas y el Inicio de la ruta no tienen estilo propio y quedan con el anillo del navegador.\n- **Pendiente · 4.1.2 Nombre, función y valor (A)**: el filtro es `role=\"tablist\"` con `role=\"tab\"` y `aria-selected`,\n  pero sin `role=\"tabpanel\"` ni flechas, y cada pestaña es una parada de Tab; `siaf-tabs` ya lo resuelve.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: la carga solo marca `aria-busy`, y no se anuncian el resultado de\n  filtrar, el vacío «No hay notificaciones para mostrar.» ni el marcado de todas como leídas.",
    "figma": [],
    "aria": {
      "roles": [
        "tab",
        "tablist"
      ],
      "atributos": [
        "aria-busy",
        "aria-hidden",
        "aria-label",
        "aria-selected"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-accent",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-low",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-lowest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-divider-default",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "pb-siaf-lg",
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "p-siaf-md",
          "pt-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "px-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "py-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "gap-siaf-xxs",
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-icon",
      "siaf-pagination",
      "siaf-table-controls"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-tree-view",
    "clase": "TreeViewComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/tree-view/tree-view.component",
    "archivo": "src/app/shared/ui/tree-view/tree-view.component.ts",
    "descripcion": "Árbol genérico de solo lectura que pinta nodos anidados con ícono y estado `expanded` recursivo.\n\nHoy no tiene consumidores: el árbol real de la app es `siaf-process-menu-tree` (en `layout/`, con\nbúsqueda tipo paleta de comandos), que pinta tanto el menú de procesos como el de Ajustes\n(`ADMIN_MENU_TREE`); es una implementación propia que nunca se unificó con este genérico.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "nodes",
        "tipo": "TreeViewNode[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [],
    "usar": "- Para mostrar de solo lectura una jerarquía corta ya resuelta en los datos (p. ej. una entidad y sus unidades), con\n  cada nodo abierto o cerrado según `expanded`.\n- Como resumen estático de una rama (del plan de cuentas o de un clasificador) en un panel de detalle, donde no se\n  navega ni se elige. Hoy no tiene consumidores.",
    "evitar": "- Para el menú de Procesos o de Ajustes: `siaf-process-menu-tree`, el árbol real de la app, con búsqueda.\n- Si el usuario debe abrir o cerrar ramas o elegir un nodo: no tiene clic, teclado ni roles de árbol; para secciones\n  plegables, `siaf-accordion` o `siaf-expansion-panel`.\n- Para una lista plana de ítems: `siaf-list`.",
    "teclado": "- No recibe foco: no es interactivo. Los nodos no se abren ni se cierran: lo decide `expanded` en los datos.",
    "accesibilidad": "- **1.3.1 Información y relaciones (A)**: la jerarquía va en listas `<ul>` y `<li>` anidadas.\n- **Pendiente · 1.1.1 Contenido no textual (A)**: el chevron (`chevron_right` / `expand_more`) y el punto de hoja\n  dicen si el nodo tiene hijos y si está abierto, pero son `siaf-icon` decorativos (`aria-hidden`) y no hay\n  `aria-expanded`: un nodo cerrado no anuncia que tiene hijos ocultos.\n- **1.4.3 Contraste mínimo (AA)**: etiquetas en `text-neutral-high` (16.29:1 / 16.53:1) sobre la superficie; los\n  íconos, en `text-neutral-low` (5.01:1 / 8.86:1), superan el 3:1 no textual.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      }
    ],
    "usa": [
      "siaf-icon"
    ],
    "sinUso": true
  },
  {
    "selector": "siaf-upload-side-nav",
    "clase": "UploadSideNavComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/upload-side-nav/upload-side-nav.component",
    "archivo": "src/app/shared/ui/upload-side-nav/upload-side-nav.component.ts",
    "descripcion": "Panel lateral animado de carga de archivos: envuelve `siaf-uploader` y confirma con Aceptar/Cancelar.\n\nEs la puerta de entrada normal a la carga en las request-pages (adjuntar el sustento .pdf); la\nvariante `bulk-chart-accounts` agrega los selects y el enlace de plantilla de la carga masiva.\n\n«Aceptar» confirma el archivo que terminó de cargar y sigue en su tarjeta: si se quita con su × o el panel se vuelve\na abrir (el uploader aparece vacío), queda deshabilitado hasta cargar otro.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "accept",
        "tipo": "string",
        "porDefecto": "'.pdf'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "acceptedLabel",
        "tipo": "string",
        "porDefecto": "'Solo admite archivos .pdf'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "description",
        "tipo": "string",
        "porDefecto": "'Sube un archivo .PDF en el formato correcto.'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "hint",
        "tipo": "string",
        "porDefecto": "'Se permiten archivos de 10 MB como máximo'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "maxSizeMb",
        "tipo": "number",
        "porDefecto": "10",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "open",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "planTypeOptions",
        "tipo": "TextFieldOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "planTypeValue",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "replacementPlanOptions",
        "tipo": "TextFieldOption[]",
        "porDefecto": "[]",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "replacementPlanRequired",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "replacementPlanValue",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "templateDownloadName",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "templateHref",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "'Cargar Documento de Sustento'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'default' | 'bulk-chart-accounts'",
        "porDefecto": "'default'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "closed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "confirmed",
        "tipo": "File",
        "descripcion": null
      },
      {
        "nombre": "fileSelected",
        "tipo": "File",
        "descripcion": null
      },
      {
        "nombre": "planTypeValueChange",
        "tipo": "string",
        "descripcion": null
      },
      {
        "nombre": "replacementPlanValueChange",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Para adjuntar el documento de sustento (.pdf) desde la request-page: plan de cuentas, asiento de ajuste, catálogo de\n  ajuste (tipo y clase), catálogo de eventos, eventos contables y apertura contable.\n- Con `variant=\"bulk-chart-accounts\"` en la carga masiva del plan de cuentas: tipo de plan, plan a reemplazar y\n  enlace a la plantilla Excel (`templateHref`).\n- Con `accept`, `acceptedLabel`, `title` y `description` propios para subir un Excel, como el archivo de eventos de\n  la carga masiva (SCM).\n- `confirmed` para adjuntar el archivo a la solicitud: `fileSelected` avisa apenas termina de cargar, antes de que\n  el usuario acepte, y el archivo todavía se puede quitar o cancelar.",
    "evitar": "- Para una carga embebida en la página, sin panel: usar `siaf-uploader` directo.\n- Para mostrar un archivo ya adjunto: usar `siaf-uploaded-file-card`.\n- Para elegir registros de un catálogo: usar `siaf-selection-side-nav`.",
    "teclado": "- **Tab**: al abrir, el foco entra en la X; recorre, en carga masiva, los dos selects y el enlace de plantilla, el\n  «elige archivo» de `siaf-uploader` y Cancelar / Aceptar, y da la vuelta sin salir del panel. Los selects siguen\n  `siaf-input`.\n- **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón que lo abrió; con la lista de un select\n  abierta, Escape cierra solo la lista.\n- **Enter / Espacio** en «elige archivo»: abre el selector de archivos del sistema (input de archivo nativo);\n  arrastrar y soltar es solo con mouse.\n- **Enter** en el enlace de plantilla: la descarga.\n- **Enter / Espacio**: activan la X y Cancelar (emiten `closed`) y Aceptar (emite `confirmed` con el archivo;\n  habilitado cuando hay un archivo cargado en su tarjeta y, en carga masiva, los selects obligatorios tienen valor).",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: `role=\"dialog\"` con `aria-modal=\"true\"` y `aria-labelledby` al título; la X\n  se llama «Cerrar».\n- **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al botón que lo\n  abrió; Tab no sale a la página de atrás.\n- **2.1.1 Teclado (A)**: Escape cierra el panel como la X; arrastrar y soltar tiene alternativa: el input de archivo.\n- **2.4.7 Foco visible (AA)**: «elige archivo» de `siaf-uploader` (variante `extended`, la de este panel) y el enlace\n  de plantilla muestran un contorno azul de 2 px (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro) con el foco;\n  la X y Cancelar quedan con el anillo nativo.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: el enlace «descárgalo aquí» y el «elige archivo» del uploader usan la\n  clase `text-brand-primary`, que toma el fondo de marca: 8.79:1 en claro, pero 2.66:1 sobre la superficie en oscuro\n  (el token de texto `--sys-color-text-brand-primary` da 10.15:1).\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: el avance («Subiendo...») y el rechazo del archivo en\n  `siaf-uploader` no se anuncian (sin `role=\"status\"` ni `aria-live`).\n- **3.3.2 Etiquetas o instrucciones (A)**: en carga masiva los selects de `siaf-input` tienen etiqueta y marcan el\n  obligatorio; el tipo admitido y el tamaño máximo se dicen en texto (`acceptedLabel`, `hint`).\n- **2.5.8 Tamaño del objetivo (AA)**: la X y Cancelar miden 40 px.",
    "figma": [],
    "aria": {
      "roles": [
        "dialog"
      ],
      "atributos": [
        "aria-label",
        "aria-labelledby",
        "aria-modal"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "gap-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "py-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "via": [
          "px-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-shadow-lg",
        "via": [
          "shadow-siaf-lg"
        ]
      }
    ],
    "usa": [
      "[siafFoco]",
      "[siafTooltip]",
      "siaf-button",
      "siaf-icon",
      "siaf-input",
      "siaf-uploader"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-uploaded-file-card",
    "clase": "UploadedFileCardComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/uploaded-file-card/uploaded-file-card.component",
    "archivo": "src/app/shared/ui/uploaded-file-card/uploaded-file-card.component.ts",
    "descripcion": "Tarjeta de un archivo ya adjunto: ícono por formato, nombre truncado con tooltip, peso y\nacciones de reemplazar/quitar.\n\nUsarlo para mostrar el sustento PDF ya cargado de una solicitud; con `[readonly]` en modo consulta,\ndonde el adjunto se ve pero no se toca. Para elegir el archivo va `siaf-upload-side-nav`.\n\nCon `[error]` pasa al estado fallido del Figma (UI KIT, nodo 2612:9065): borde, ícono, nombre y\nacciones en el tono de error, y el mensaje en lugar del peso. Mismos tokens que la tarjeta fallida\nde `siaf-uploader`, para que la carga y el archivo adjunto se vean iguales cuando algo sale mal.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "error",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": "Mensaje de error del archivo (ej. «No se pudo cargar el archivo»). Si trae texto, la tarjeta se muestra fallida."
      },
      {
        "nombre": "file",
        "tipo": "UploadedFileInfo | null",
        "porDefecto": "null",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "readonly",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "removed",
        "tipo": "void",
        "descripcion": null
      },
      {
        "nombre": "replace",
        "tipo": "void",
        "descripcion": null
      }
    ],
    "usar": "- Para el documento de sustento ya adjunto en las solicitudes: cuenta contable, carga masiva, clase de ajuste, tipo\n  de asiento, asiento de ajuste, evento, evento contable y apertura contable.\n- Con `[readonly]` en modo consulta o en un detalle, donde el adjunto se ve pero no se reemplaza ni se quita.\n- Para el Excel ya cargado de la carga masiva de eventos, con `(replace)` que vuelve a abrir el panel de carga.\n- Con `[error]` cuando el archivo adjunto no se pudo cargar.",
    "evitar": "- Para elegir o arrastrar el archivo: usar `siaf-upload-side-nav` (o `siaf-uploader` embebido); esta tarjeta solo\n  muestra el que ya está adjunto.\n- Para el aviso «No se han adjuntado archivos»: usar `message-box` en vez del bloque gris que hoy repiten a mano las\n  solicitudes.\n- Para el avance de una subida en curso: usar las tarjetas de progreso de `siaf-uploader`.",
    "teclado": "- **Tab**: recorre «Reemplazar archivo» y «Quitar archivo»; con `readonly` la tarjeta no recibe foco.\n- **Enter / Espacio**: ejecutan la acción del botón enfocado.",
    "accesibilidad": "- **4.1.2 Nombre, función y valor (A)**: las acciones son `<button>` nativos con `aria-label` («Reemplazar archivo»,\n  «Quitar archivo»); los íconos son decorativos.\n- **4.1.3 Mensajes de estado (AA)**: el mensaje de error va con `role=\"alert\"` y se anuncia al aparecer.\n- **1.4.1 Uso del color (A)**: el estado fallido, además del rojo, muestra el mensaje en lugar del peso.\n- **Pendiente · 2.1.1 Teclado (A)**: un nombre largo se corta y el completo solo aparece con el mouse o una pulsación\n  larga: el `siafTooltip` está en un texto que no recibe foco.\n- **2.4.7 Foco visible (AA)**: los botones no definen estilo de foco; queda el anillo nativo del navegador.\n- **1.4.11 Contraste no textual (AA)**: los íconos de acción van en `text-neutral-low` 5.01:1 y, si falló, en\n  `text-feedback-danger` 9.84:1.\n- **1.4.3 Contraste mínimo (AA)**: nombre `text-neutral-high` 16.29:1, peso `text-neutral-low` 5.01:1 y error\n  `text-feedback-danger` 9.84:1.\n- **2.5.8 Tamaño del objetivo (AA)**: cada botón mide 24 × 24 px (`size-6`), justo el mínimo.",
    "figma": [
      {
        "nodo": "2612:9065",
        "nombre": null
      }
    ],
    "aria": {
      "roles": [
        "alert"
      ],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted"
        ]
      },
      {
        "token": "--sys-color-border-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-uploader",
    "clase": "UploaderComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/uploader/uploader.component",
    "archivo": "src/app/shared/ui/uploader/uploader.component.ts",
    "descripcion": "Zona de drag & drop con tarjetas de progreso, que valida cada archivo contra `accept` y `maxSizeMb`.\n\nDos variantes: `extended` (por defecto: ícono de nube, texto y `hint`) y `compact`, una sola fila\nde 48 px con el botón «Elegir archivo» y «o soltar archivo», para formularios con poco alto.\nAmbas aceptan soltar archivos y muestran las mismas tarjetas de progreso debajo.\n\nRara vez se usa suelto: vive dentro de `siaf-upload-side-nav`, que es el panel de carga que usan las\nrequest-pages y la puerta de entrada normal. Ir directo a él solo para una carga embebida en página.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "accept",
        "tipo": "string",
        "porDefecto": "'.pdf'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "hint",
        "tipo": "string",
        "porDefecto": "'Se permiten archivos de 10 MB como máximo'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "maxSizeMb",
        "tipo": "number",
        "porDefecto": "10",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "multiple",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "variant",
        "tipo": "'compact' | 'extended'",
        "porDefecto": "'extended'",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "allDone",
        "tipo": "File[]",
        "descripcion": null
      },
      {
        "nombre": "fileRemoved",
        "tipo": "File",
        "descripcion": "Archivo que se quitó con la × de su tarjeta: el padre deja de contar con él."
      },
      {
        "nombre": "fileSelected",
        "tipo": "File",
        "descripcion": null
      }
    ],
    "usar": "- Dentro de `siaf-upload-side-nav`, el panel que abren las solicitudes para adjuntar el sustento .pdf: es su uso\n  normal.\n- Suelto solo para una carga embebida en la página; `compact` (una fila de 48 px) cuando el formulario tiene poco alto,\n  como el sustento de `siaf-annulment-modal`.\n- `fileSelected` cuando un archivo termina de cargar y `fileRemoved` cuando se quita con su ×, para que el padre sepa\n  si todavía tiene archivo.\n- Con el `accept` y el `maxSizeMb` de cada caso (.pdf para el sustento, .xlsx para las cargas masivas): también\n  valida lo que se suelta.",
    "evitar": "- Para mostrar un archivo ya adjunto o guardado: usar `siaf-uploaded-file-card`.\n- Para el flujo de adjuntar en una solicitud: usar `siaf-upload-side-nav`, que ya trae título, Aceptar y Cancelar.\n- Para mostrar el avance real de una subida al servidor: el progreso es simulado con un temporizador.",
    "teclado": "- **Tab**: enfoca el selector de archivos (el `input type=\"file\"` oculto dentro de «elige archivo» o «Elegir\n  archivo») y después los botones de cada tarjeta (Pausar, Reintentar, Cancelar).\n- **Enter / Espacio**: en el selector abren el diálogo de archivos del sistema; en los botones, ejecutan la acción.",
    "accesibilidad": "- **2.1.1 Teclado (A)**: soltar archivos es opcional; el `input type=\"file\"` nativo permite elegirlos con teclado.\n- **2.4.7 Foco visible (AA)**: el `input type=\"file\"` va oculto con `sr-only`, así que «elige archivo» (`extended`)\n  y «Elegir archivo» (`compact`) pintan un contorno azul de 2 px (`border-states-focus`, 5.35:1 claro / 10.15:1\n  oscuro) cuando el selector recibe el foco con teclado. Los botones de las tarjetas conservan el anillo nativo.\n- **Pendiente · 4.1.3 Mensajes de estado (AA)**: ni el progreso, ni la carga terminada, ni el motivo de un rechazo se\n  anuncian: no hay `role=\"status\"`, `role=\"alert\"` ni `aria-live`, y la barra es un `div` sin `role=\"progressbar\"`.\n- **3.3.1 Identificación de errores (A)**: un archivo de tipo o tamaño inválido queda en una tarjeta roja con el\n  motivo en texto («Solo se admiten archivos .pdf»).\n- **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: la ayuda (`hint`) no se asocia al selector y `compact` no la\n  muestra.\n- **4.1.2 Nombre, función y valor (A)**: el selector se nombra con el texto de su `label`; los botones de cada\n  tarjeta tienen `aria-label` (Pausar, Reintentar, Cancelar) y los íconos son decorativos.\n- **Pendiente · 1.4.3 Contraste mínimo (AA)**: «elige archivo» usa la clase `text-brand-primary`, que pinta con\n  `bg-brand-primary`: 8.79:1 en claro, pero 2.66:1 en oscuro. El resto cumple: texto `text-neutral-high` 16.29:1,\n  ayuda y peso `text-neutral-low` 5.01:1 y error `text-feedback-danger` 9.84:1.\n- **2.5.8 Tamaño del objetivo (AA)**: los botones de las tarjetas miden 24 × 24 px (`size-6`).",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-label"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-brand-primary",
        "via": [
          "bg-brand-primary",
          "text-brand-primary"
        ]
      },
      {
        "token": "--sys-color-bg-states-dark-pressed",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-states-light-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-high",
        "via": [
          "bg-surface-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-highest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "border-border",
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "p-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "p-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm",
          "px-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "gap-siaf-xs",
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "py-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "[siafTooltip]",
      "siaf-icon"
    ],
    "sinUso": false
  },
  {
    "selector": "siaf-virtual-desk",
    "clase": "VirtualDeskComponent",
    "tipo": "componente",
    "capa": "layout",
    "importacion": "@siaf/layout/virtual-desk/virtual-desk.component",
    "archivo": "src/app/layout/virtual-desk/virtual-desk.component.ts",
    "descripcion": "Escritorio virtual: la home autenticada, con las tarjetas de resumen (Bandeja, Procesos, Recibidos,\nEnviados, Borradores, Notificaciones) y el aviso/modal de cambio de contraseña obligatorio.\nLas tarjetas son `siaf-desk-card` en sus tres variantes; solo Procesos es interactiva.\n\nLos contadores se calculan sobre `SolicitudesStateService` según el rol, salvo Notificaciones, que lee\n`NotificationsStateService.unreadCount()` — la misma fuente por socket que la campana del navbar, tras\nquitar una consulta REST duplicada. Ojo: su definición de \"Enviados\" incluye los ya procesados y no\ncoincide con la de `solicitudes-state` (solo VERIFICADO); es una inconsistencia conocida y anotada.",
    "usaSesion": true,
    "proyectaContenido": false,
    "entradas": [],
    "eventos": [],
    "usar": null,
    "evitar": null,
    "teclado": null,
    "accesibilidad": null,
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": []
    },
    "tokens": [
      {
        "token": "--sys-color-bg-feedback-light-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-feedback-light-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface-lowest",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-brand-secondary",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-warning",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "via": [
          "px-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "mb-siaf-md",
          "mt-siaf-md",
          "p-siaf-md",
          "px-siaf-md",
          "py-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [
      "siaf-button",
      "siaf-desk-card",
      "siaf-icon",
      "siaf-input",
      "siaf-modal"
    ],
    "sinUso": false
  },
  {
    "selector": "text-area-control",
    "clase": "TextAreaControlComponent",
    "tipo": "componente",
    "capa": "ui",
    "importacion": "@siaf/ui/text-area-control/text-area-control.component",
    "archivo": "src/app/shared/ui/text-area-control/text-area-control.component.ts",
    "descripcion": "Textarea del design system con etiqueta flotante, contador de caracteres y estados error/éxito.\n\nUsarlo para los textos largos de las solicitudes (glosa, justificación, motivo de observación),\ndonde `[minlength]` exige el mínimo de 3 caracteres y solo lo reclama tras salir del campo.",
    "usaSesion": false,
    "proyectaContenido": false,
    "entradas": [
      {
        "nombre": "disabled",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "error",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "maxlength",
        "tipo": "number",
        "porDefecto": "500",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "minlength",
        "tipo": "number",
        "porDefecto": "0",
        "requerida": false,
        "descripcion": "Mínimo de caracteres (sin contar espacios al inicio/fin). 0 = sin mínimo."
      },
      {
        "nombre": "placeholder",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "required",
        "tipo": "boolean",
        "porDefecto": "false",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "state",
        "tipo": "'success' | 'error' | 'enabled'",
        "porDefecto": "'enabled'",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "title",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      },
      {
        "nombre": "value",
        "tipo": "string",
        "porDefecto": "''",
        "requerida": false,
        "descripcion": null
      }
    ],
    "eventos": [
      {
        "nombre": "valueChange",
        "tipo": "string",
        "descripcion": null
      }
    ],
    "usar": "- Para la «Justificación del requerimiento solicitado» de las solicitudes (cuenta contable, carga masiva, clase de\n  ajuste, tipo de asiento, asiento de ajuste, evento, evento contable y apertura contable), con `maxlength` 500.\n- Para los textos largos de un registro: glosa del asiento de ajuste, descripción del evento o dinámica contable de\n  la cuenta (se debita por, se acredita por, objeto, saldos).\n- Para el motivo que pide `siaf-modal` con `requiresReason`.\n- Con `title` cuando el campo lleva un encabezado propio en mayúsculas encima (Glosa).",
    "evitar": "- Para textos de una línea (nombre, código, correo): usar `siaf-input`.\n- Para mostrar el texto ya grabado en modo lectura: usar `readonly-field`, como hacen las solicitudes.\n- Marcar el obligatorio con un `*` al final de `placeholder`: el componente lo quita; usar `[required]`.",
    "teclado": "- **Tab**: entra y sale del campo (en un `textarea` nativo, Tab no escribe tabulaciones).\n- **Enter**: agrega un salto de línea; al llegar a `maxlength` no deja escribir más.",
    "accesibilidad": "- **Pendiente · 1.3.1 Información y relaciones (A)**: el `<label>` envuelve el `textarea`, pero la etiqueta flotante\n  solo existe con foco o valor, y el error y el contador («0/500») están dentro del mismo `<label>`: se suman al\n  nombre en vez de ir por `aria-describedby`. Sin foco ni valor, un campo sin `title` ni `required` queda nombrado\n  por el contador y no por su `placeholder`.\n- **3.3.1 Identificación de errores (A)**: con error publica `aria-invalid=\"true\"`, borde rojo de 2 px y el texto (el\n  `error` del padre o «Mínimo N caracteres», que aparece al salir del campo). Con `state=\"error\"` y sin texto, el\n  aviso es solo el borde.\n- **3.3.2 Etiquetas o instrucciones (A)**: la etiqueta siempre se ve (dentro del campo o flotante), el obligatorio\n  lleva asterisco y `aria-required`, y el contador muestra el máximo.\n- **4.1.2 Nombre, función y valor (A)**: `textarea` nativo con `aria-required`, `aria-invalid`, `maxlength` y\n  `disabled`.\n- **2.4.7 Foco visible (AA)**: el `textarea` usa `outline-none` y el foco pinta el borde de 2 px\n  `border-states-focus` (5.35:1); con un `error` del padre el borde sigue rojo y solo queda el cursor de texto.\n- **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo vacío es `border-states-enabled` (2.44:1\n  claro, 2.59:1 oscuro).\n- **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` 14.53:1, etiqueta y contador `text-neutral-low`\n  5.01:1, título `text-neutral-high` 16.29:1 y error `text-feedback-danger` 9.84:1.",
    "figma": [],
    "aria": {
      "roles": [],
      "atributos": [
        "aria-invalid",
        "aria-required"
      ]
    },
    "tokens": [
      {
        "token": "--sys-color-bg-surfaces-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-bg-surfaces-surface",
        "via": [
          "bg-surface"
        ]
      },
      {
        "token": "--sys-color-border-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-feedback-success",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-enabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-focus",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-border-states-hover",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-feedback-danger",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-activated",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-disabled",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-high",
        "via": [
          "text-text"
        ]
      },
      {
        "token": "--sys-color-text-neutral-low",
        "via": [
          "text-text-muted",
          "var()"
        ]
      },
      {
        "token": "--sys-color-text-neutral-medium",
        "via": [
          "var()"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "via": [
          "gap-siaf-md",
          "left-siaf-md",
          "px-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "via": [
          "gap-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "via": [
          "py-siaf-xs",
          "top-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "via": [
          "px-siaf-xxs"
        ]
      },
      {
        "token": "--sys-radius-md",
        "via": [
          "rounded-siaf-md"
        ]
      },
      {
        "token": "--sys-radius-sm",
        "via": [
          "rounded-siaf-sm"
        ]
      }
    ],
    "usa": [],
    "sinUso": false
  }
];
