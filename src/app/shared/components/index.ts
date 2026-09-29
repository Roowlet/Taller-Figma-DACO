/**
 * Componentes Transversales
 * Componentes reutilizables que combinan múltiples componentes base
 * Usables en diferentes features sin lógica específica de negocio
 */

export { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
export type { BreadcrumbItem } from './breadcrumb/breadcrumb.component';
export { PageHeaderComponent } from './page-header/page-header.component';
export { PageShellComponent } from './page-shell/page-shell.component';
export { CustomFilterComponent } from './custom-filter/custom-filter.component';
export type { FilterRow, CustomFilterApplyEvent } from './custom-filter/custom-filter.component';
export { FilterPillComponent } from './filter-pill/filter-pill.component';
export type { FilterPillOption } from './filter-pill/filter-pill.component';
export { RecordsTabsComponent } from './records-tabs/records-tabs.component';
export type { RecordsTabItem } from './records-tabs/records-tabs.component';
export { RecordsSearchToolbarComponent } from './records-search-toolbar/records-search-toolbar.component';
export { RequestApprovalModalsComponent } from './request-approval-modals/request-approval-modals.component';
export { SelectionSideNavComponent } from './selection-side-nav/selection-side-nav.component';
export type { SelectionColumn, SelectionMode } from './selection-side-nav/selection-side-nav.component';
export { FormTableSearchComponent } from './form-table-search/form-table-search.component';
export { SolicitudeHeaderComponent } from './solicitude-header/solicitude-header.component';
export type { SolicitudeHeaderRole, SolicitudeHeaderState, SolicitudeHeaderType } from './solicitude-header/solicitude-header.component';
export { SolicitudeFormCardComponent } from './solicitude-form-card/solicitude-form-card.component';
export { SolicitudePageLayoutComponent } from './solicitude-page-layout/solicitude-page-layout.component';
export { SolicitudeInfoCardComponent } from './solicitude-info-card/solicitude-info-card.component';
export type { SolicitudeInfoField } from './solicitude-info-card/solicitude-info-card.component';
export { PaginationComponent } from './pagination/pagination.component';
export type { PaginationNavigation, PaginationPosition } from './pagination/pagination.component';
export { DataTableComponent } from './data-table/data-table.component';
export type { DataTableColumn, DataTableRow } from './data-table/data-table.component';
export { TimelineComponent } from './timeline/timeline.component';
export { TimelineDetailPanelComponent } from './timeline/timeline-detail-panel.component';
export type { TimelineItem, TimelineItemState } from './timeline/timeline.model';
export { DocumentsRecordsPageComponent } from './documents-records-page/documents-records-page.component';
export { AccountHistoryPanelComponent } from './account-history-panel/account-history-panel.component';
export { AsientoHistoryPanelComponent } from './asiento-history-panel/asiento-history-panel.component';
export { DocumentHistoryPanelComponent } from './document-history-panel/document-history-panel.component';
export type { DocumentHistorySummary } from './document-history-panel/document-history-panel.component';
export { CreateDocumentComponent } from './create-document/create-document.component';
export type { CreateDocumentAccepted, CreateDocumentVariant } from './create-document/create-document.component';
