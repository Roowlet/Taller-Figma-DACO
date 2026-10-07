import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { CatalogosApiService, TipoDocumentoResponse } from '../../../../../core/api/catalogos-api.service';
import { SolicitudResponse, SolicitudesApiService } from '../../../../../core/api/solicitudes-api.service';
import { SustentosApiService } from '../../../../../core/api/sustentos-api.service';
import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { PermissionService } from '../../../../../core/auth/permission.service';
import { ESTADO, MOTIVOS_RECHAZO } from '../../../../../core/models/documento.model';
import { SolicitudesFacadeService } from '../../../../../core/state/solicitudes-facade.service';
import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { DetailHistoryTabsComponent } from '../../../../../shared/components/detail-history-tabs/detail-history-tabs.component';
import { HistorialSource, buildCurrentComment, buildHistoryEntries } from '../../../../../shared/components/detail-history-tabs/detail-history-tabs.utils';
import { RequestApprovalModalsComponent } from '../../../../../shared/components/request-approval-modals/request-approval-modals.component';
import { SolicitudeFormCardComponent } from '../../../../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudeHeaderState } from '../../../../../shared/components/solicitude-header/solicitude-header.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { ActionTrackerComponent, ActionTrackerSummary } from '../../../../../shared/ui/action-tracker/action-tracker.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { DocumentSummaryCardComponent } from '../../../../../shared/ui/document-summary-card/document-summary-card.component';
import { FlowStatus } from '../../../../../shared/ui/flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { SnackbarVariant } from '../../../../../shared/ui/snackbar/snackbar.component';
import { TableControlsComponent } from '../../../../../shared/components/table-controls/table-controls.component';
import { TabItem, TabsComponent } from '../../../../../shared/ui/tabs/tabs.component';
import { TextAreaControlComponent } from '../../../../../shared/ui/text-area-control/text-area-control.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { UploadSideNavComponent } from '../../../../../shared/ui/upload-side-nav/upload-side-nav.component';
import { UploadedFileCardComponent, UploadedFileInfo } from '../../../../../shared/ui/uploaded-file-card/uploaded-file-card.component';
import { buildProcessBreadcrumbs } from '../../../../../shared/utils/breadcrumbs.util';
import { crearSnapshotFormulario, hayCambiosRespectoAlSnapshot, identidadArchivo } from '../../../../../shared/utils/form-snapshot.util';
import { MIN_CARACTERES_TEXTO_LIBRE, cumpleMinimoTextoLibre } from '../../../../../shared/utils/texto-libre.util';
import { ModificacionApmApiService } from '../../api/modificacion-apm-api.service';
import { PROCESS_ID, PROCESS_ROUTE, REQUEST_SEGMENT } from '../../config/modificacion-apm.rutas';
import { ANIOS_APM, CODIGO_DOCUMENTO, GASTOS_APM, GastoApm, NOMBRE_DOCUMENTO, formatearSoles } from '../../models/modificacion-apm.model';

/**
 * Solicitud de Modificación de la APM (SMAPM): pantalla de solicitud del proceso «Modificación de la APM».
 *
 * Grabar: crear la solicitud → guardar la modificación → subir el sustento → pasar a ELABORADO (genera el número).
 * El creador edita, verifica o elimina; el aprobador aprueba, observa o rechaza un documento VERIFICADO.
 * Reutiliza el backend de solicitudes y el mismo ciclo de estados que el proceso de cuentas bancarias.
 */
@Component({
  selector: 'siaf-modificacion-apm-request',
  standalone: true,
  imports: [
    ActionTrackerComponent,
    ButtonComponent,
    CheckboxComponent,
    DetailHistoryTabsComponent,
    DocumentSummaryCardComponent,
    IconComponent,
    RequestApprovalModalsComponent,
    SolicitudeFormCardComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TableControlsComponent,
    TabsComponent,
    TextAreaControlComponent,
    TextFieldComponent,
    UploadedFileCardComponent,
    UploadSideNavComponent,
  ],
  templateUrl: './modificacion-apm-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificacionApmRequestComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly currentUser = inject(CurrentUserService);
  private readonly permissions = inject(PermissionService);
  private readonly catalogosApi = inject(CatalogosApiService);
  private readonly solicitudesApi = inject(SolicitudesApiService);
  private readonly solicitudesFacade = inject(SolicitudesFacadeService);
  private readonly sustentosApi = inject(SustentosApiService);
  private readonly modificacionApi = inject(ModificacionApmApiService);

  readonly heading = NOMBRE_DOCUMENTO;
  readonly breadcrumbs: BreadcrumbItem[] = buildProcessBreadcrumbs(PROCESS_ID, PROCESS_ROUTE, NOMBRE_DOCUMENTO);
  readonly minCaracteresTexto = MIN_CARACTERES_TEXTO_LIBRE;

  // ── Pestañas de la sección «Modificación de la APM» ──
  readonly tabs: TabItem[] = [
    { id: 'gastos', label: 'Gastos' },
    { id: 'anexos', label: 'Anexos' },
    { id: 'pie', label: 'Pie de página' },
  ];
  readonly tabActiva = signal('gastos');

  private solicitudId: string | null = null;
  private tiposDocumento: TipoDocumentoResponse[] = [];

  // ── Estado del documento ──
  private readonly solicitud = signal<SolicitudResponse | null>(null);
  readonly estado = computed(() => (this.solicitud()?.estado ?? 'NUEVO').toUpperCase());
  readonly editando = signal(false);
  readonly cargando = signal(false);
  readonly saving = signal(false);

  readonly headerRole = computed<'creator' | 'approver'>(() => (this.permissions.currentRole() === 'approver' ? 'approver' : 'creator'));
  readonly elaborado = computed(() => this.estado() !== 'NUEVO');
  readonly soloLectura = computed(() => this.elaborado() && !this.editando());
  readonly puedeVerificar = computed(() => ['ELABORADO', 'OBSERVADO'].includes(this.estado()));
  readonly numeroDocumento = computed(() => this.solicitud()?.numero ?? '');

  readonly headerState = computed<SolicitudeHeaderState>(() => {
    if (this.editando()) return 'edit';
    switch (this.estado()) {
      case 'APROBADO': return 'approved';
      case 'OBSERVADO': return 'observed';
      case 'RECHAZADO': return 'rejected';
      case 'VERIFICADO': return 'verified';
      case 'ELIMINADO': return 'deleted';
      case 'ELABORADO': return 'elaborated';
      default: return 'new';
    }
  });

  readonly estadoDocumento = computed<FlowStatus>(() => {
    const etiquetas: Record<string, FlowStatus> = {
      APROBADO: ESTADO.APROBADO,
      OBSERVADO: ESTADO.OBSERVADO,
      RECHAZADO: ESTADO.RECHAZADO,
      VERIFICADO: ESTADO.VERIFICADO,
      ELIMINADO: ESTADO.ELIMINADO,
    };
    return etiquetas[this.estado()] ?? ESTADO.ELABORADO;
  });

  // ── Cabecera de la solicitud ──
  readonly camposEntidad = computed<SolicitudeInfoField[]>(() => {
    const usuario = this.currentUser.user();
    return [
      { label: 'Fecha', value: '' },
      { label: 'Ente rector', value: 'DIRECCIÓN GENERAL DE PRESUPUESTO PÚBLICO' },
      { label: 'Entidad / pliego', value: (usuario.entidadSiglas ?? usuario.office).toUpperCase() },
    ];
  });

  // ── Formulario ──
  readonly gastos = signal<GastoApm[]>(GASTOS_APM.map((g) => ({ ...g })));
  readonly detalle = signal('');
  readonly sustento = signal<UploadedFileInfo | null>(null);
  readonly panelSustentoAbierto = signal(false);

  /** Años de la asignación presupuestaria multianual (columnas de monto). */
  readonly anios = ANIOS_APM;
  readonly formatearSoles = formatearSoles;

  // ── Tabla de gastos: búsqueda, selección y edición ──
  readonly busquedaGastos = signal('');
  readonly seleccionGastos = signal<ReadonlySet<number>>(new Set<number>());
  /** Formulario de edición de un gasto visible (reemplaza la tabla). */
  readonly editandoGastos = signal(false);
  /** Índice del gasto en edición y su copia de trabajo. */
  readonly indiceEnEdicion = signal<number | null>(null);
  readonly gastoEditado = signal<GastoApm | null>(null);
  /** Texto en edición de cada monto por año (evita reformatear mientras se escribe). */
  readonly montosTexto = signal<string[]>([]);
  readonly edicionValida = computed(() => {
    const t = this.montosTexto();
    return t.length === this.anios.length && t.every((s) => this.parsearMonto(s) > 0);
  });

  private parsearMonto(valor: string): number {
    return Number(String(valor).replace(/[^0-9.]/g, '')) || 0;
  }

  readonly gastosFiltrados = computed<{ gasto: GastoApm; indice: number }[]>(() => {
    const q = this.busquedaGastos().trim().toLowerCase();
    return this.gastos()
      .map((gasto, indice) => ({ gasto, indice }))
      .filter(({ gasto }) =>
        !q || [gasto.fuenteFinanciamiento, gasto.categoriaGasto, gasto.generica].some((t) => t.toLowerCase().includes(q)),
      );
  });

  readonly cantidadSeleccionada = computed(() => this.seleccionGastos().size);
  readonly todosGastosSeleccionados = computed(() => {
    const visibles = this.gastosFiltrados();
    return visibles.length > 0 && visibles.every(({ indice }) => this.seleccionGastos().has(indice));
  });
  readonly seleccionGastosIndeterminada = computed(() => this.cantidadSeleccionada() > 0 && !this.todosGastosSeleccionados());

  estaSeleccionado(indice: number): boolean {
    return this.seleccionGastos().has(indice);
  }

  alternarSeleccionGasto(indice: number, marcado: boolean): void {
    this.seleccionGastos.update((set) => {
      const nuevo = new Set(set);
      if (marcado) nuevo.add(indice); else nuevo.delete(indice);
      return nuevo;
    });
  }

  alternarTodosGastos(marcado: boolean): void {
    this.seleccionGastos.set(marcado ? new Set(this.gastosFiltrados().map(({ indice }) => indice)) : new Set<number>());
    if (!marcado) this.cerrarEdicionGasto();
  }

  /** Abre el formulario de edición del único gasto seleccionado. */
  editarGastosSeleccionados(): void {
    const indices = [...this.seleccionGastos()];
    if (indices.length !== 1) return;
    const indice = indices[0];
    const gasto = this.gastos()[indice];
    if (!gasto) return;
    this.indiceEnEdicion.set(indice);
    this.gastoEditado.set({ ...gasto, montos: [...gasto.montos] });
    this.montosTexto.set(gasto.montos.map((m) => this.formatearSoles(m)));
    this.editandoGastos.set(true);
  }

  /** Guarda los montos editados en el gasto y vuelve a la tabla. */
  aceptarEdicionGasto(): void {
    const indice = this.indiceEnEdicion();
    const editado = this.gastoEditado();
    if (indice === null || !editado) return;
    const montos = this.montosTexto().map((s) => this.parsearMonto(s));
    this.gastos.update((lista) => lista.map((g, i) => (i === indice ? { ...editado, montos } : g)));
    this.cerrarEdicionGasto();
    this.seleccionGastos.set(new Set<number>());
  }

  /** Cierra el formulario de edición sin guardar. */
  cancelarEdicionGasto(): void {
    this.cerrarEdicionGasto();
  }

  private cerrarEdicionGasto(): void {
    this.editandoGastos.set(false);
    this.indiceEnEdicion.set(null);
    this.gastoEditado.set(null);
    this.montosTexto.set([]);
  }

  /** Guarda el texto escrito de un monto por año (sin reformatear hasta Aceptar). */
  actualizarMontoEditado(anioIndice: number, valor: string): void {
    this.montosTexto.update((arr) => arr.map((s, j) => (j === anioIndice ? valor : s)));
  }

  eliminarGastosSeleccionados(): void {
    const quitar = this.seleccionGastos();
    this.gastos.update((lista) => lista.filter((_, i) => !quitar.has(i)));
    this.seleccionGastos.set(new Set<number>());
    this.cerrarEdicionGasto();
  }

  // Grabar solo con cambios: foto al pulsar Editar; sin foto (documento nuevo) se asume que hay cambios.
  private readonly fotoEdicion = signal<string | null>(null);
  private readonly fotoActual = computed(() => crearSnapshotFormulario({
    gastos: this.gastos(),
    detalle: this.detalle().trim(),
    sustento: identidadArchivo(this.sustento() as { name: string; size?: number } | null),
  }));
  private readonly hayCambios = computed(() => hayCambiosRespectoAlSnapshot(this.fotoEdicion(), this.fotoActual()));

  readonly formValido = computed(() =>
    !this.soloLectura() && cumpleMinimoTextoLibre(this.detalle()) && !!this.sustento() && this.hayCambios(),
  );

  // ── Historial y trazabilidad ──
  private readonly fuentesHistorial = computed<HistorialSource[]>(() =>
    (this.solicitud()?.historialEstados ?? []).map((h) => ({
      estadoBackend: h.estadoNuevo,
      fechaISO: h.createdAt,
      comentario: h.comentario,
      usuario: h.creador ? `${h.creador.nombres} ${h.creador.apellidoPaterno} ${h.creador.apellidoMaterno}` : '',
      rol: h.perfil?.cfgPerfil?.rol?.nombre ?? '',
    })),
  );
  readonly historial = computed(() => buildHistoryEntries(this.fuentesHistorial()));
  readonly comentarioActual = computed(() => buildCurrentComment(this.estado(), this.fuentesHistorial()));

  readonly trazabilidad = computed<ActionTrackerSummary[]>(() => {
    const historial = this.solicitud()?.historialEstados ?? [];
    const ultimo = (estado: string) => [...historial].reverse().find((h) => h.estadoNuevo === estado);
    const quien = (estado: string, label: string): ActionTrackerSummary => {
      const h = ultimo(estado);
      const nombre = h?.creador ? `${h.creador.nombres} ${h.creador.apellidoPaterno} ${h.creador.apellidoMaterno}` : '';
      return { label, actionBy: nombre.toUpperCase(), date: h ? new Date(h.createdAt).toLocaleString('es-PE') : '' };
    };
    const tercero = this.estado() === 'OBSERVADO'
      ? quien('OBSERVADO', 'Observado por')
      : this.estado() === 'RECHAZADO' ? quien('RECHAZADO', 'Rechazado por') : quien('APROBADO', 'Aprobado por');
    return [quien('ELABORADO', 'Elaborado por'), quien('VERIFICADO', 'Verificado por'), tercero];
  });

  // ── Modales y avisos ──
  readonly modalGrabar = signal(false);
  readonly modalVerificar = signal(false);
  readonly modalEliminar = signal(false);
  readonly modalAprobar = signal(false);
  readonly modalObservar = signal(false);
  readonly modalRechazar = signal(false);
  readonly comentario = signal('');
  readonly motivoRechazo = signal('');
  readonly motivosRechazo = [...MOTIVOS_RECHAZO];
  readonly avisoAbierto = signal(false);
  readonly aviso = signal<SnackbarVariant>('creation-elaborated');

  ngOnInit(): void {
    this.catalogosApi.listarTiposDocumento().subscribe((tipos) => (this.tiposDocumento = tipos));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargar(id);

    const estadoNavegacion = history.state as { fromSave?: boolean } | null;
    if (estadoNavegacion?.fromSave) this.mostrarAviso('creation-elaborated');
  }

  onSustentoConfirmado(archivo: File): void {
    this.sustento.set(archivo);
    this.panelSustentoAbierto.set(false);
  }

  regresar(): void {
    if (this.editando()) {
      this.editando.set(false);
      this.restaurarFormulario(this.solicitud());
      return;
    }
    void this.router.navigate(['/panel']);
  }

  editar(): void {
    this.editando.set(true);
    this.avisoAbierto.set(false);
    this.fotoEdicion.set(this.fotoActual());
  }

  // ── Grabar ──
  onConfirmarGrabar(): void {
    this.modalGrabar.set(false);
    const datos = { gastos: this.gastos(), detalle: this.detalle().trim() };
    const archivo = this.sustento();
    const guardarYElaborar = (id: string): Observable<unknown> =>
      this.modificacionApi.guardarDetalle(id, datos).pipe(
        switchMap(() => (archivo instanceof File ? this.sustentosApi.subir(id, archivo, 'sustento') : of(null))),
        switchMap(() => this.solicitudesApi.cambiarEstado(id, { estadoNuevo: 'ELABORADO' })),
      );

    this.saving.set(true);

    if (this.solicitudId) {
      const id = this.solicitudId;
      this.solicitudesApi.actualizar(id, { justificacion: this.detalle(), organoLinea: this.organo() })
        .pipe(switchMap(() => guardarYElaborar(id)))
        .subscribe({
          next: () => { this.editando.set(false); this.mostrarAviso('creation-elaborated'); this.cargar(id); },
          error: () => this.cargar(id),
        });
      return;
    }

    const tipo = this.tiposDocumento.find((t) => t.codigo === CODIGO_DOCUMENTO);
    if (!tipo) { this.saving.set(false); return; }
    this.solicitudesFacade.crearSolicitud({
      tipoDocumentoId: tipo.id,
      tipoAccion: 'modificacion',
      fechaRequerimiento: new Date().toISOString(),
      organoLinea: this.organo(),
      justificacion: this.detalle(),
      cuentas: [],
    }).pipe(
      switchMap((creada) => { this.solicitudId = creada.id; return guardarYElaborar(creada.id).pipe(map(() => creada.id)); }),
    ).subscribe({
      next: (id) => { this.saving.set(false); void this.router.navigate([PROCESS_ROUTE, REQUEST_SEGMENT, id], { state: { fromSave: true } }); },
      error: () => {
        this.saving.set(false);
        if (this.solicitudId) void this.router.navigate([PROCESS_ROUTE, REQUEST_SEGMENT, this.solicitudId]);
      },
    });
  }

  // ── Acciones de estado ──
  onConfirmarVerificar(): void {
    this.modalVerificar.set(false);
    this.accion((id) => this.solicitudesApi.cambiarEstado(id, { estadoNuevo: 'VERIFICADO' }), 'creation-verified');
  }

  onConfirmarEliminar(): void {
    this.modalEliminar.set(false);
    this.accion((id) => this.solicitudesApi.cambiarEstado(id, { estadoNuevo: 'ELIMINADO' }), 'creation-deleted');
  }

  abrirAprobar(): void { this.comentario.set(''); this.modalAprobar.set(true); }
  abrirObservar(): void { this.comentario.set(''); this.modalObservar.set(true); }
  abrirRechazar(): void { this.comentario.set(''); this.motivoRechazo.set(''); this.modalRechazar.set(true); }

  cerrarModalesAprobador(): void {
    this.modalAprobar.set(false);
    this.modalObservar.set(false);
    this.modalRechazar.set(false);
  }

  onConfirmarAprobar(): void {
    this.modalAprobar.set(false);
    this.accion((id) => this.solicitudesFacade.aprobar(id), 'creation-approved');
  }

  onConfirmarObservar(): void {
    if (!this.comentario().trim()) return;
    this.modalObservar.set(false);
    this.accion((id) => this.solicitudesFacade.observar(id, this.comentario()), 'creation-observed');
  }

  onConfirmarRechazar(): void {
    if (!this.comentario().trim()) return;
    this.modalRechazar.set(false);
    this.accion((id) => this.solicitudesFacade.rechazar(id, this.comentario(), this.motivoRechazo() || undefined), 'creation-rejected');
  }

  private accion(llamada: (id: string) => Observable<unknown>, aviso: SnackbarVariant): void {
    const id = this.solicitudId;
    if (!id) return;
    this.saving.set(true);
    llamada(id).subscribe({
      next: () => { this.mostrarAviso(aviso); this.cargar(id); },
      error: () => this.saving.set(false),
    });
  }

  private mostrarAviso(variante: SnackbarVariant): void {
    this.aviso.set(variante);
    this.avisoAbierto.set(true);
  }

  private organo(): string {
    return 'DIRECCIÓN GENERAL DE PRESUPUESTO PÚBLICO';
  }

  // ── Carga ──
  private cargar(id: string): void {
    this.cargando.set(true);
    this.solicitudesApi.obtenerDetalle(id).subscribe({
      next: (s) => {
        this.solicitudId = s.id;
        this.solicitud.set(s);
        this.editando.set(false);
        this.fotoEdicion.set(null);
        this.restaurarFormulario(s);
        this.cargando.set(false);
        this.saving.set(false);
      },
      error: () => { this.cargando.set(false); this.saving.set(false); },
    });
  }

  private restaurarFormulario(s: SolicitudResponse | null): void {
    const d = s?.detalleModificacionApm;
    this.gastos.set(d?.gastos?.length ? d.gastos.map((g) => ({ ...g })) : GASTOS_APM.map((g) => ({ ...g })));
    this.detalle.set((d?.detalle ?? s?.asuntoMotivo ?? '').replace(/^\[[^\]]*\]\s*/, ''));
    const archivo = s?.sustentos?.find((x) => x.archivo?.nombreOriginal)?.archivo;
    this.sustento.set(archivo ? { name: archivo.nombreOriginal } : null);
  }
}
