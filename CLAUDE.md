# Taller IA · SIAF-RP — Frontend con datos simulados (Angular 20)

Arquetipo para **clases demostrativas**: pantallas del SIAF-RP armadas con los componentes del diseño de Figma y un
backend simulado. Corre solo en local; no hay backend, despliegue ni datos reales. Ver [README.md](README.md) para los
usuarios de demostración, el recorrido de la clase y cómo sumar un proceso.

## Reglas de trabajo

- Comunicación, UI, comentarios y commits **en español**.
- **Confirmar entendimiento antes de implementar** un cambio pedido.
- Commitear, hacer push o PR **solo cuando el usuario lo pida**. Commits `tipo(scope): descripción`.
- Antes de commitear, todo en verde:
  - `npx ng build --configuration=development`
  - `npx ng test --watch=false --browsers=ChromeHeadless`
  - `npm run ui-kit:check` y `npm run icons:check`
- Los diseños llegan como URLs de Figma con `node-id`: leerlos con el MCP de Figma (`get_design_context`) y adaptarlos
  a los componentes del kit, nunca pegar el código generado.

## Mapa

- `src/app/mock/`: **backend simulado**. `mock-backend.interceptor.ts` responde `/api/v1` (tabla `RUTAS`: método,
  patrón y manejador) con las reglas del flujo de la solicitud; `mock-db.ts` guarda los datos en `localStorage`
  (clave `taller-siaf-rp:datos`, con `VERSION`: al cambiar la forma de los datos, subirla); `usuarios-demo.ts`, los
  usuarios (contraseña común `Taller2026*`). Su spec documenta las reglas: si se cambia una, actualizarlo.
- `src/app/modules/tesoreria/cuentas-bancarias/`: **proceso de ejemplo** «Registro de cuentas bancarias» (documento
  SRCB). Es el modelo para un proceso nuevo: `api/`, `config/`, `models/`, `pages/{documents,solicitud,consultas}` y
  `utils/`.
- `src/app/core/`: API (`core/api`, mismo contrato que el backend real), sesión, permisos por rol
  (`ROLE_PERMISSIONS`: creador y aprobador), interceptores, estado de solicitudes y notificaciones. El socket de
  notificaciones está apagado (`notifications-socket.service.ts` no hace nada).
- `src/app/layout/`: armazón, barra superior (menú de usuario con cambio de perfil), menú de procesos, bandeja y
  escritorio virtual.
- `src/app/shared/utils/process-tree.util.ts`: árbol del menú de procesos y base de las migas de pan
  (`buildProcessBreadcrumbs`). Un proceso nuevo es una hoja más, no otro componente.
- `/ui-kit` (`features/ui-kit/`): catálogo de componentes, generado desde el código.

### Un proceso nuevo, paso a paso

1. Modelo y API en `modules/<área>/<proceso>/`.
2. Rutas del backend simulado en `RUTAS` y datos iniciales en `mock-db.ts`.
3. Pantallas con las plantillas: `siaf-documents-records-page` (configuración + filas), `siaf-solicitude-page-layout`
   y `siaf-query-report-page` (configuración + `(queried)` + `(exported)`: el archivo lo genera la pantalla).
4. Rutas en `modules/<área>/<área>.routes.ts` y en `app.routes.ts`.
5. Hojas en `DEFAULT_PROCESS_TREE`.
6. Tipo de documento en `/tipos-documento` (simulado), `ROUTE_BY_PROCESO` en `layout/shell/app-shell.component.ts` y
   `resolveRoute` en `layout/notifications-panel` y `layout/tray-notifications-view`.

## Componentes y diseño

- **Antes de escribir markup, buscar el componente en `/ui-kit`**. Un componente compuesto usa los del kit por dentro
  (menús con `siaf-menu`, pestañas con `siaf-tabs`, etiquetas con `siaf-status-tag`…).
- **Capas**: `shared/ui` es el design system agnóstico: no importa `core/api`, `core/state` ni `layout/`. Lo que
  necesita HTTP o dominio va en `shared/components/`.
- **Componentes**: standalone, `ChangeDetectionStrategy.OnPush`, `inject()`, estado en `signal()`/`computed()`,
  `@if`/`@for`. Un `computed()` que depende de un `@Input()` necesita `@Input() set` a una signal. En specs OnPush,
  `fixture.componentRef.setInput(...)`.
- **Colores: nunca hex crudo**. `var(--sys-color-*)` (`src/styles/tokens/figma.css`) o clases Tailwind conectadas a
  tokens; buscar el color en `/ui-kit#color`. Espaciado con `siaf-xs/sm/md/lg/xl` (8/12/16/24/32 px).
- **Íconos: solo Material Icons con `siaf-icon`**. Un nombre inexistente no falla al compilar: `npm run icons:check`.
- **Botones** (`siaf-button`): `filled` / `outline` / `text`, tamaños `md` y `sm`. No hay `danger`: lo destructivo es
  `filled` con modal de confirmación.
- **Estados**: `siaf-flow-status-tag` (documento) y `siaf-record-status-tag` (registro).
- **Formularios de solicitud**: «Grabar» solo con cambios (foto del formulario con `shared/utils/form-snapshot.util.ts`
  al entrar a editar); el sustento se toma en `(confirmed)` de `siaf-upload-side-nav`; las acciones de aprobar,
  observar y rechazar van con `siaf-request-approval-modals`.
- **Modales, paneles y desplegables**: foco con la directiva `siafFoco`, no a mano.
- **Gráficos** (Chart.js): los arma `siaf-query-report-page` desde `charts` de su configuración.
- **Al crear o cambiar un componente**: JSDoc sobre la clase (es su ficha), `npm run ui-kit:manifest`, su categoría en
  `ui-kit.catalogo.ts` y su ejemplo en `features/ui-kit/ejemplos/`.

## Windows

- `EPERM rmdir` sobre `.angular`: un proceso de node viejo tiene el lock; cerrarlo, borrar la carpeta y reiniciar.
