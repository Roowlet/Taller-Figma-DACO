// GENERADO por scripts/generar-ui-kit.mjs (scripts/ui-kit-fundamentos.mjs) — no editar a mano.
// Sale de los tokens de src/styles: regenerar con `npm run ui-kit:manifest` después de cambiar un token.
import type { FundamentosUiKit } from './ui-kit.model';

export const FUNDAMENTOS_UI_KIT: FundamentosUiKit = {
  "colores": [
    {
      "id": "bg-brand",
      "titulo": "Fondo · Marca",
      "tokens": [
        {
          "nombre": "--sys-color-bg-brand-accent",
          "claro": "#D13255",
          "oscuro": "#B93654",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "bg-brand-accent",
            "bg-accent"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-brand-primary",
          "claro": "#014899",
          "oscuro": "#0B5CAD",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "bg-brand-primary"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-brand-primary-hover",
          "claro": "#00366F",
          "oscuro": "#0E6ECF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "bg-brand-primary-hover"
          ],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-brand-secondary",
          "claro": "#4B4B4D",
          "oscuro": "#1D6F69",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "bg-brand-secondary"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-brand-white",
          "claro": "#FFFFFF",
          "oscuro": "#FFFFFF",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "bg-surfaces",
      "titulo": "Fondo · Superficies",
      "tokens": [
        {
          "nombre": "--sys-color-bg-surfaces-disabled",
          "claro": "#EDEDED",
          "oscuro": "#2E3440",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-surfaces-field",
          "claro": null,
          "oscuro": "#292D36",
          "sinOscuro": false,
          "soloOscuro": true,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-surfaces-floating",
          "claro": null,
          "oscuro": "#20232B",
          "sinOscuro": false,
          "soloOscuro": true,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-surfaces-highlight",
          "claro": "rgb(1 72 153 / 0.08)",
          "oscuro": "#143A5A",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-surfaces-surface",
          "claro": "#FFFFFF",
          "oscuro": "#16181D",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "bg-surface"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-surfaces-surface-high",
          "claro": "rgb(32 32 32 / 0.12)",
          "oscuro": "#20232B",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "bg-surface-high",
            "bg-surface-muted"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-surfaces-surface-highest",
          "claro": "#FFFFFF",
          "oscuro": "#292D36",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-surfaces-surface-low",
          "claro": "rgb(32 32 32 / 0.04)",
          "oscuro": "#1B1E25",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-surfaces-surface-lowest",
          "claro": "rgb(32 32 32 / 0.04)",
          "oscuro": "#101216",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-surfaces-surface-muted",
          "claro": "#EEEEEE",
          "oscuro": "#242832",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        }
      ]
    },
    {
      "id": "bg-on-surfaces",
      "titulo": "Fondo · Sobre superficies",
      "tokens": [
        {
          "nombre": "--sys-color-bg-on-surfaces-disabled",
          "claro": "rgb(32 32 32 / 0.4)",
          "oscuro": "rgb(32 32 32 / 0.4)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-on-surfaces-high",
          "claro": "rgb(32 32 32 / 0.92)",
          "oscuro": "rgb(32 32 32 / 0.92)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-on-surfaces-medium",
          "claro": "rgb(32 32 32 / 0.8)",
          "oscuro": "rgb(32 32 32 / 0.8)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "bg-states",
      "titulo": "Fondo · Capas de estado",
      "tokens": [
        {
          "nombre": "--sys-color-bg-states-dark-activated",
          "claro": "rgb(32 32 32 / 0.24)",
          "oscuro": "rgba(145, 201, 255, 0.24)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-dark-disabled",
          "claro": "rgb(32 32 32 / 0.08)",
          "oscuro": "rgba(255, 255, 255, 0.08)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-dark-dragged",
          "claro": "rgb(32 32 32 / 0.16)",
          "oscuro": "rgb(32 32 32 / 0.16)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-dark-enabled",
          "claro": "rgb(255 255 255 / 0)",
          "oscuro": "rgb(255 255 255 / 0)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-dark-focus",
          "claro": "rgb(32 32 32 / 0.24)",
          "oscuro": "rgba(145, 201, 255, 0.26)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-dark-hover",
          "claro": "rgb(32 32 32 / 0.16)",
          "oscuro": "rgba(255, 255, 255, 0.10)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-dark-pressed",
          "claro": "rgb(32 32 32 / 0.4)",
          "oscuro": "rgba(255, 255, 255, 0.16)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-dark-selected",
          "claro": "rgb(32 32 32 / 0.16)",
          "oscuro": "rgba(145, 201, 255, 0.18)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-activated",
          "claro": "rgb(1 72 153 / 0.12)",
          "oscuro": "rgb(1 72 153 / 0.12)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-disabled",
          "claro": "rgb(32 32 32 / 0.08)",
          "oscuro": "rgba(255, 255, 255, 0.08)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-dragged",
          "claro": "rgb(32 32 32 / 0.08)",
          "oscuro": "rgb(32 32 32 / 0.08)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-enabled",
          "claro": "rgb(255 255 255 / 0)",
          "oscuro": "rgba(255, 255, 255, 0.06)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-focus",
          "claro": "rgb(32 32 32 / 0.12)",
          "oscuro": "rgb(32 32 32 / 0.12)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-hover",
          "claro": "rgb(32 32 32 / 0.04)",
          "oscuro": "rgba(145, 201, 255, 0.18)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-pressed",
          "claro": "rgb(32 32 32 / 0.12)",
          "oscuro": "rgba(145, 201, 255, 0.28)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-light-selected",
          "claro": "rgb(1 72 153 / 0.08)",
          "oscuro": "rgb(1 72 153 / 0.08)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-states-on-brand-hover",
          "claro": "rgb(255 255 255 / 0.10)",
          "oscuro": "rgb(255 255 255 / 0.10)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-states-on-brand-selected",
          "claro": "rgb(255 255 255 / 0.10)",
          "oscuro": "rgb(255 255 255 / 0.10)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        }
      ]
    },
    {
      "id": "bg-feedback",
      "titulo": "Fondo · Feedback",
      "tokens": [
        {
          "nombre": "--sys-color-bg-feedback-danger",
          "claro": "#D13255",
          "oscuro": "#D13255",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [
            "bg-danger"
          ],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-feedback-dark-danger",
          "claro": "#A82427",
          "oscuro": "#FF8A98",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-dark-default",
          "claro": "#353537",
          "oscuro": "#D5DCE7",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-dark-info",
          "claro": "#0068B0",
          "oscuro": "#91C9FF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-dark-success",
          "claro": "#298079",
          "oscuro": "#8EDBD4",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-dark-warning",
          "claro": "#AE8532",
          "oscuro": "#F7D37A",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-info",
          "claro": "#004899",
          "oscuro": "#004899",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [
            "bg-info"
          ],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-feedback-light-danger",
          "claro": "#F9BFC1",
          "oscuro": "#4B1D27",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-light-default",
          "claro": "rgb(32 32 32 / 0.12)",
          "oscuro": "#2F3541",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-light-info",
          "claro": "#B0DEFD",
          "oscuro": "#143A5A",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-light-success",
          "claro": "#C2E8E5",
          "oscuro": "#173D3A",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-light-warning",
          "claro": "#FCEAC6",
          "oscuro": "#463716",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-feedback-success",
          "claro": "#20635E",
          "oscuro": "#20635E",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [
            "bg-success"
          ],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-feedback-warning",
          "claro": "#FFA500",
          "oscuro": "#FFA500",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [
            "bg-warning"
          ],
          "manual": true
        }
      ]
    },
    {
      "id": "bg-status",
      "titulo": "Fondo · Estado de documentos y registros",
      "tokens": [
        {
          "nombre": "--sys-color-bg-status-document-status-edicion",
          "claro": "#9F20E9",
          "oscuro": "#9F20E9",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-document-status-nuevo",
          "claro": "#ED3237",
          "oscuro": "#ED3237",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-aceptado",
          "claro": "#298079",
          "oscuro": "#1D6F69",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-anulado",
          "claro": "#A82427",
          "oscuro": "#8F2635",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-aprobado",
          "claro": "#298079",
          "oscuro": "#1D6F69",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-autorizado",
          "claro": "#298079",
          "oscuro": "#0B5CAD",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-elaborado",
          "claro": "#353537",
          "oscuro": "#4A515F",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-eliminado",
          "claro": "#A82427",
          "oscuro": "#9E2F44",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-firmado",
          "claro": "#298079",
          "oscuro": "#0B5CAD",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-observado",
          "claro": "#AE8532",
          "oscuro": "#8A6516",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-rechazado",
          "claro": "#A82427",
          "oscuro": "#9E2F44",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-revisado",
          "claro": "#0068B0",
          "oscuro": "#5E6675",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-validado",
          "claro": "#0068B0",
          "oscuro": "#4A515F",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-flow-status-verificado",
          "claro": "#0068B0",
          "oscuro": "#0B5CAD",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-record-status-activo",
          "claro": "#B0DEFD",
          "oscuro": "#B0DEFD",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-record-status-enviado",
          "claro": "#868688",
          "oscuro": "#868688",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-record-status-inactivo",
          "claro": "#ED3237",
          "oscuro": "#ED3237",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-bg-status-solid-danger",
          "claro": "#A82427",
          "oscuro": "#9E2F44",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-status-solid-default",
          "claro": "#353537",
          "oscuro": "#4A515F",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-status-solid-info",
          "claro": "#0068B0",
          "oscuro": "#0B5CAD",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-status-solid-success",
          "claro": "#298079",
          "oscuro": "#1D6F69",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-status-solid-warning",
          "claro": "#AE8532",
          "oscuro": "#8A6516",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        }
      ]
    },
    {
      "id": "text-neutral",
      "titulo": "Texto · Neutro",
      "tokens": [
        {
          "nombre": "--sys-color-text-neutral-activated",
          "claro": "#014899",
          "oscuro": "#FFFFFF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-neutral-disabled",
          "claro": "#868688",
          "oscuro": "#7E8796",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "text-text-disabled"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-neutral-high",
          "claro": "#202020",
          "oscuro": "#F4F7FB",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "text-text"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-neutral-low",
          "claro": "#6F6F71",
          "oscuro": "#AEB8C7",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "text-text-low",
            "text-text-muted"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-neutral-medium",
          "claro": "#29292A",
          "oscuro": "#D5DCE7",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "text-text-medium"
          ],
          "manual": false
        }
      ]
    },
    {
      "id": "text-brand",
      "titulo": "Texto · Marca",
      "tokens": [
        {
          "nombre": "--sys-color-text-brand-accent",
          "claro": "#E6375D",
          "oscuro": "#E6375D",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-brand-primary",
          "claro": "#014899",
          "oscuro": "#91C9FF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-brand-secondary",
          "claro": "#4B4B4D",
          "oscuro": "#D5DCE7",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-brand-white",
          "claro": "#FFFFFF",
          "oscuro": "#FFFFFF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "text-brand-contrast"
          ],
          "manual": false
        }
      ]
    },
    {
      "id": "text-feedback",
      "titulo": "Texto · Feedback",
      "tokens": [
        {
          "nombre": "--sys-color-text-feedback-danger",
          "claro": "#821C1E",
          "oscuro": "#FFB4BE",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-feedback-default",
          "claro": "#29292A",
          "oscuro": "#F4F7FB",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-feedback-info",
          "claro": "#005188",
          "oscuro": "#B7DCFF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-feedback-success",
          "claro": "#20635E",
          "oscuro": "#B3EEE8",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-text-feedback-warning",
          "claro": "#876727",
          "oscuro": "#FFE2A3",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "text-on-brand",
      "titulo": "Texto · Sobre marca",
      "tokens": [
        {
          "nombre": "--sys-color-text-on-brand-muted",
          "claro": "rgb(255 255 255 / 0.75)",
          "oscuro": "rgb(255 255 255 / 0.75)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        }
      ]
    },
    {
      "id": "icon-states",
      "titulo": "Ícono · Estados",
      "tokens": [
        {
          "nombre": "--sys-color-icon-states-active",
          "claro": "#014899",
          "oscuro": "#91C9FF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-states-disabled",
          "claro": "#ACACAD",
          "oscuro": "#7E8796",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-states-enabled",
          "claro": "#4B4B4D",
          "oscuro": "#D5DCE7",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "icon-brand",
      "titulo": "Ícono · Marca",
      "tokens": [
        {
          "nombre": "--sys-color-icon-brand-accent",
          "claro": "#E6375D",
          "oscuro": "#E6375D",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-brand-primary",
          "claro": "#014899",
          "oscuro": "#014899",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-brand-secondary",
          "claro": "#4B4B4D",
          "oscuro": "#4B4B4D",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-brand-white",
          "claro": "#FFFFFF",
          "oscuro": "#FFFFFF",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "icon-feedback",
      "titulo": "Ícono · Feedback",
      "tokens": [
        {
          "nombre": "--sys-color-icon-feedback-dark-danger",
          "claro": "#F37679",
          "oscuro": "#101216",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-dark-default",
          "claro": "#FFFFFF",
          "oscuro": "#101216",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-dark-info",
          "claro": "#54B7FA",
          "oscuro": "#101216",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-dark-success",
          "claro": "#7BCDC6",
          "oscuro": "#101216",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-dark-warning",
          "claro": "#F8D184",
          "oscuro": "#101216",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-light-danger",
          "claro": "#821C1E",
          "oscuro": "#FFB4BE",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-light-default",
          "claro": "#4B4B4D",
          "oscuro": "#D5DCE7",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-light-info",
          "claro": "#005188",
          "oscuro": "#B7DCFF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-light-success",
          "claro": "#20635E",
          "oscuro": "#B3EEE8",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-icon-feedback-light-warning",
          "claro": "#876727",
          "oscuro": "#FFE2A3",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "icon-snackbar",
      "titulo": "Ícono · Snackbar",
      "tokens": [
        {
          "nombre": "--sys-color-icon-snackbar-danger",
          "claro": "#F37679",
          "oscuro": "#F37679",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-icon-snackbar-info",
          "claro": "#54B7FA",
          "oscuro": "#54B7FA",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-icon-snackbar-success",
          "claro": "#7BCDC6",
          "oscuro": "#7BCDC6",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-icon-snackbar-warning",
          "claro": "#F8D184",
          "oscuro": "#F8D184",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        }
      ]
    },
    {
      "id": "border-states",
      "titulo": "Borde · Estados",
      "tokens": [
        {
          "nombre": "--sys-color-border-states-active",
          "claro": "#014899",
          "oscuro": "#014899",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-states-disabled",
          "claro": "rgb(32 32 32 / 0.12)",
          "oscuro": "rgba(213, 220, 231, 0.26)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-states-enabled",
          "claro": "rgb(32 32 32 / 0.4)",
          "oscuro": "rgba(213, 220, 231, 0.34)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "border-border"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-states-focus",
          "claro": "rgb(1 72 153 / 0.8)",
          "oscuro": "#91C9FF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-states-focused",
          "claro": "rgb(1 72 153 / 0.8)",
          "oscuro": "#91C9FF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "border-border-focus"
          ],
          "manual": true
        },
        {
          "nombre": "--sys-color-border-states-hover",
          "claro": "rgb(1 72 153 / 0.56)",
          "oscuro": "rgba(213, 220, 231, 0.54)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [
            "border-border-hover"
          ],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-states-white",
          "claro": "#FFFFFF",
          "oscuro": "rgba(255, 255, 255, 0.8)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "border-feedback",
      "titulo": "Borde · Feedback",
      "tokens": [
        {
          "nombre": "--sys-color-border-feedback-danger",
          "claro": "#821C1E",
          "oscuro": "#FF8A98",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-feedback-default",
          "claro": "rgb(32 32 32 / 0.4)",
          "oscuro": "#AEB8C7",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-feedback-info",
          "claro": "#002854",
          "oscuro": "#91C9FF",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-feedback-success",
          "claro": "#20635E",
          "oscuro": "#8EDBD4",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-border-feedback-warning",
          "claro": "#876727",
          "oscuro": "#F7D37A",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "border-on-brand",
      "titulo": "Borde · Sobre marca",
      "tokens": [
        {
          "nombre": "--sys-color-border-on-brand-subtle",
          "claro": "rgb(255 255 255 / 0.10)",
          "oscuro": "rgb(255 255 255 / 0.10)",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        }
      ]
    },
    {
      "id": "divider",
      "titulo": "Separadores",
      "tokens": [
        {
          "nombre": "--sys-color-divider-default",
          "claro": "rgb(32 32 32 / 0.12)",
          "oscuro": "rgba(213, 220, 231, 0.16)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-divider-strong",
          "claro": "rgb(32 32 32 / 0.24)",
          "oscuro": "rgba(213, 220, 231, 0.28)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        },
        {
          "nombre": "--sys-color-divider-subtle",
          "claro": "rgb(32 32 32 / 0.16)",
          "oscuro": "rgba(213, 220, 231, 0.10)",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": false
        }
      ]
    },
    {
      "id": "otros",
      "titulo": "Otros",
      "tokens": [
        {
          "nombre": "--sys-color-bg-snackbar",
          "claro": null,
          "oscuro": "#20232B",
          "sinOscuro": false,
          "soloOscuro": true,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-bg-switch-thumb",
          "claro": "#FFFFFF",
          "oscuro": "#FFFFFF",
          "sinOscuro": true,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        },
        {
          "nombre": "--sys-color-tipography-neutral-high",
          "claro": "#202020",
          "oscuro": "#F4F7FB",
          "sinOscuro": false,
          "soloOscuro": false,
          "utilidades": [],
          "manual": true
        }
      ]
    }
  ],
  "paleta": [
    {
      "familia": "aqua",
      "tonos": [
        {
          "tono": "50",
          "valor": "#E9F9F7",
          "variable": "--figma-color-palette-aqua-50"
        },
        {
          "tono": "100",
          "valor": "#BAEBE5",
          "variable": "--figma-color-palette-aqua-100"
        },
        {
          "tono": "200",
          "valor": "#99E2D9",
          "variable": "--figma-color-palette-aqua-200"
        },
        {
          "tono": "300",
          "valor": "#6BD4C7",
          "variable": "--figma-color-palette-aqua-300"
        },
        {
          "tono": "400",
          "valor": "#4ECCBD",
          "variable": "--figma-color-palette-aqua-400"
        },
        {
          "tono": "500",
          "valor": "#22BFAC",
          "variable": "--figma-color-palette-aqua-500"
        },
        {
          "tono": "600",
          "valor": "#1FAE9D",
          "variable": "--figma-color-palette-aqua-600"
        },
        {
          "tono": "700",
          "valor": "#18887A",
          "variable": "--figma-color-palette-aqua-700"
        },
        {
          "tono": "800",
          "valor": "#13695F",
          "variable": "--figma-color-palette-aqua-800"
        },
        {
          "tono": "900",
          "valor": "#0E5048",
          "variable": "--figma-color-palette-aqua-900"
        }
      ]
    },
    {
      "familia": "blue",
      "tonos": [
        {
          "tono": "50",
          "valor": "#E6EDF5",
          "variable": "--figma-color-palette-blue-50"
        },
        {
          "tono": "100",
          "valor": "#B0C6DF",
          "variable": "--figma-color-palette-blue-100"
        },
        {
          "tono": "200",
          "valor": "#8AABD0",
          "variable": "--figma-color-palette-blue-200"
        },
        {
          "tono": "300",
          "valor": "#5484BB",
          "variable": "--figma-color-palette-blue-300"
        },
        {
          "tono": "400",
          "valor": "#336DAD",
          "variable": "--figma-color-palette-blue-400"
        },
        {
          "tono": "500",
          "valor": "#014899",
          "variable": "--figma-color-palette-blue-500"
        },
        {
          "tono": "600",
          "valor": "#00428B",
          "variable": "--figma-color-palette-blue-600"
        },
        {
          "tono": "700",
          "valor": "#00336D",
          "variable": "--figma-color-palette-blue-700"
        },
        {
          "tono": "800",
          "valor": "#002854",
          "variable": "--figma-color-palette-blue-800"
        },
        {
          "tono": "900",
          "valor": "#001E40",
          "variable": "--figma-color-palette-blue-900"
        }
      ]
    },
    {
      "familia": "blue-alert",
      "tonos": [
        {
          "tono": "50",
          "valor": "#E7EFFF",
          "variable": "--figma-color-palette-blue-alert-50"
        },
        {
          "tono": "100",
          "valor": "#B3CCFF",
          "variable": "--figma-color-palette-blue-alert-100"
        },
        {
          "tono": "200",
          "valor": "#8EB4FF",
          "variable": "--figma-color-palette-blue-alert-200"
        },
        {
          "tono": "300",
          "valor": "#5B92FF",
          "variable": "--figma-color-palette-blue-alert-300"
        },
        {
          "tono": "400",
          "valor": "#3B7DFF",
          "variable": "--figma-color-palette-blue-alert-400"
        },
        {
          "tono": "500",
          "valor": "#0A5CFF",
          "variable": "--figma-color-palette-blue-alert-500"
        },
        {
          "tono": "600",
          "valor": "#0954E8",
          "variable": "--figma-color-palette-blue-alert-600"
        },
        {
          "tono": "700",
          "valor": "#0741B5",
          "variable": "--figma-color-palette-blue-alert-700"
        },
        {
          "tono": "800",
          "valor": "#06338C",
          "variable": "--figma-color-palette-blue-alert-800"
        },
        {
          "tono": "900",
          "valor": "#04276B",
          "variable": "--figma-color-palette-blue-alert-900"
        }
      ]
    },
    {
      "familia": "deep-blue",
      "tonos": [
        {
          "tono": "50",
          "valor": "#E6F1FC",
          "variable": "--figma-color-palette-deep-blue-50"
        },
        {
          "tono": "100",
          "valor": "#B0D3F7",
          "variable": "--figma-color-palette-deep-blue-100"
        },
        {
          "tono": "200",
          "valor": "#8ABDF3",
          "variable": "--figma-color-palette-deep-blue-200"
        },
        {
          "tono": "300",
          "valor": "#549FEE",
          "variable": "--figma-color-palette-deep-blue-300"
        },
        {
          "tono": "400",
          "valor": "#338DEA",
          "variable": "--figma-color-palette-deep-blue-400"
        },
        {
          "tono": "500",
          "valor": "#0070E5",
          "variable": "--figma-color-palette-deep-blue-500"
        },
        {
          "tono": "600",
          "valor": "#0066D0",
          "variable": "--figma-color-palette-deep-blue-600"
        },
        {
          "tono": "700",
          "valor": "#0050A3",
          "variable": "--figma-color-palette-deep-blue-700"
        },
        {
          "tono": "800",
          "valor": "#003E7E",
          "variable": "--figma-color-palette-deep-blue-800"
        },
        {
          "tono": "900",
          "valor": "#002F60",
          "variable": "--figma-color-palette-deep-blue-900"
        }
      ]
    },
    {
      "familia": "gray-stack",
      "tonos": [
        {
          "tono": "50",
          "valor": "#F7F7F8",
          "variable": "--figma-color-palette-gray-stack-50"
        },
        {
          "tono": "100",
          "valor": "#F1F1F2",
          "variable": "--figma-color-palette-gray-stack-100"
        },
        {
          "tono": "200",
          "valor": "#F4F4F4",
          "variable": "--figma-color-palette-gray-stack-200"
        },
        {
          "tono": "300",
          "valor": "#E9E9E9",
          "variable": "--figma-color-palette-gray-stack-300"
        },
        {
          "tono": "400",
          "valor": "#D7D9DC",
          "variable": "--figma-color-palette-gray-stack-400"
        },
        {
          "tono": "500",
          "valor": "#CBCBD0",
          "variable": "--figma-color-palette-gray-stack-500"
        },
        {
          "tono": "600",
          "valor": "#BBC2CB",
          "variable": "--figma-color-palette-gray-stack-600"
        },
        {
          "tono": "700",
          "valor": "#A5A5A5",
          "variable": "--figma-color-palette-gray-stack-700"
        },
        {
          "tono": "800",
          "valor": "#8E8E8E",
          "variable": "--figma-color-palette-gray-stack-800"
        },
        {
          "tono": "900",
          "valor": "#3C3C3C",
          "variable": "--figma-color-palette-gray-stack-900"
        },
        {
          "tono": "a50",
          "valor": "rgb(247 247 248 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a50"
        },
        {
          "tono": "a100",
          "valor": "rgb(241 241 242 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a100"
        },
        {
          "tono": "a200",
          "valor": "rgb(244 244 244 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a200"
        },
        {
          "tono": "a300",
          "valor": "rgb(233 233 233 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a300"
        },
        {
          "tono": "a400",
          "valor": "rgb(215 217 220 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a400"
        },
        {
          "tono": "a500",
          "valor": "rgb(203 203 208 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a500"
        },
        {
          "tono": "a600",
          "valor": "rgb(187 194 203 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a600"
        },
        {
          "tono": "a700",
          "valor": "rgb(165 165 165 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a700"
        },
        {
          "tono": "a800",
          "valor": "rgb(142 142 142 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a800"
        },
        {
          "tono": "a900",
          "valor": "rgb(60 60 60 / 0.5)",
          "variable": "--figma-color-palette-gray-stack-a900"
        }
      ]
    },
    {
      "familia": "green1",
      "tonos": [
        {
          "tono": "50",
          "valor": "#EBF8F7",
          "variable": "--figma-color-palette-green1-50"
        },
        {
          "tono": "100",
          "valor": "#C2E8E5",
          "variable": "--figma-color-palette-green1-100"
        },
        {
          "tono": "200",
          "valor": "#A5DDD8",
          "variable": "--figma-color-palette-green1-200"
        },
        {
          "tono": "300",
          "valor": "#7CCDC6",
          "variable": "--figma-color-palette-green1-300"
        },
        {
          "tono": "400",
          "valor": "#62C3BB",
          "variable": "--figma-color-palette-green1-400"
        },
        {
          "tono": "500",
          "valor": "#3BB4AA",
          "variable": "--figma-color-palette-green1-500"
        },
        {
          "tono": "600",
          "valor": "#36A49B",
          "variable": "--figma-color-palette-green1-600"
        },
        {
          "tono": "700",
          "valor": "#2A8079",
          "variable": "--figma-color-palette-green1-700"
        },
        {
          "tono": "800",
          "valor": "#20635E",
          "variable": "--figma-color-palette-green1-800"
        },
        {
          "tono": "900",
          "valor": "#194C47",
          "variable": "--figma-color-palette-green1-900"
        }
      ]
    },
    {
      "familia": "green2",
      "tonos": [
        {
          "tono": "50",
          "valor": "#F3F9EE",
          "variable": "--figma-color-palette-green2-green2-50"
        },
        {
          "tono": "100",
          "valor": "#D9EBCB",
          "variable": "--figma-color-palette-green2-green2-100"
        },
        {
          "tono": "200",
          "valor": "#C7E1B2",
          "variable": "--figma-color-palette-green2-green2-200"
        },
        {
          "tono": "300",
          "valor": "#ADD38E",
          "variable": "--figma-color-palette-green2-green2-300"
        },
        {
          "tono": "400",
          "valor": "#9DCB79",
          "variable": "--figma-color-palette-green2-green2-400"
        },
        {
          "tono": "500",
          "valor": "#85BE57",
          "variable": "--figma-color-palette-green2-green2-500"
        },
        {
          "tono": "600",
          "valor": "#79AD4F",
          "variable": "--figma-color-palette-green2-green2-600"
        },
        {
          "tono": "700",
          "valor": "#5E873E",
          "variable": "--figma-color-palette-green2-green2-700"
        },
        {
          "tono": "800",
          "valor": "#496930",
          "variable": "--figma-color-palette-green2-green2-800"
        },
        {
          "tono": "900",
          "valor": "#385025",
          "variable": "--figma-color-palette-green2-green2-900"
        }
      ]
    },
    {
      "familia": "grey",
      "tonos": [
        {
          "tono": "50",
          "valor": "#EDEDED",
          "variable": "--figma-color-palette-grey-50"
        },
        {
          "tono": "100",
          "valor": "#C7C7C8",
          "variable": "--figma-color-palette-grey-100"
        },
        {
          "tono": "200",
          "valor": "#ACACAD",
          "variable": "--figma-color-palette-grey-200"
        },
        {
          "tono": "300",
          "valor": "#868688",
          "variable": "--figma-color-palette-grey-300"
        },
        {
          "tono": "400",
          "valor": "#6F6F71",
          "variable": "--figma-color-palette-grey-400"
        },
        {
          "tono": "500",
          "valor": "#4B4B4D",
          "variable": "--figma-color-palette-grey-500"
        },
        {
          "tono": "600",
          "valor": "#444446",
          "variable": "--figma-color-palette-grey-600"
        },
        {
          "tono": "700",
          "valor": "#353537",
          "variable": "--figma-color-palette-grey-700"
        },
        {
          "tono": "800",
          "valor": "#29292A",
          "variable": "--figma-color-palette-grey-800"
        },
        {
          "tono": "900",
          "valor": "#202020",
          "variable": "--figma-color-palette-grey-900"
        }
      ]
    },
    {
      "familia": "gris",
      "tonos": [
        {
          "tono": "50",
          "valor": "#EDEDED",
          "variable": "--figma-color-palette-gris-50"
        },
        {
          "tono": "100",
          "valor": "#C7C7C8",
          "variable": "--figma-color-palette-gris-100"
        },
        {
          "tono": "200",
          "valor": "#ACACAD",
          "variable": "--figma-color-palette-gris-200"
        },
        {
          "tono": "300",
          "valor": "#868688",
          "variable": "--figma-color-palette-gris-300"
        },
        {
          "tono": "400",
          "valor": "#6F6F71",
          "variable": "--figma-color-palette-gris-400"
        },
        {
          "tono": "500",
          "valor": "#4B4B4D",
          "variable": "--figma-color-palette-gris-500"
        },
        {
          "tono": "600",
          "valor": "#444446",
          "variable": "--figma-color-palette-gris-600"
        },
        {
          "tono": "700",
          "valor": "#353537",
          "variable": "--figma-color-palette-gris-700"
        },
        {
          "tono": "800",
          "valor": "#29292A",
          "variable": "--figma-color-palette-gris-800"
        },
        {
          "tono": "900",
          "valor": "#202020",
          "variable": "--figma-color-palette-gris-900"
        }
      ]
    },
    {
      "familia": "mostaza",
      "tonos": [
        {
          "tono": "50",
          "valor": "#FEF8ED",
          "variable": "--figma-color-palette-mostaza-50"
        },
        {
          "tono": "100",
          "valor": "#FCEAC6",
          "variable": "--figma-color-palette-mostaza-100"
        },
        {
          "tono": "200",
          "valor": "#FAE0AA",
          "variable": "--figma-color-palette-mostaza-200"
        },
        {
          "tono": "300",
          "valor": "#F8D184",
          "variable": "--figma-color-palette-mostaza-300"
        },
        {
          "tono": "400",
          "valor": "#F7C96C",
          "variable": "--figma-color-palette-mostaza-400"
        },
        {
          "tono": "500",
          "valor": "#F5BB47",
          "variable": "--figma-color-palette-mostaza-500"
        },
        {
          "tono": "600",
          "valor": "#DFAA41",
          "variable": "--figma-color-palette-mostaza-600"
        },
        {
          "tono": "700",
          "valor": "#AE8532",
          "variable": "--figma-color-palette-mostaza-700"
        },
        {
          "tono": "800",
          "valor": "#876727",
          "variable": "--figma-color-palette-mostaza-800"
        },
        {
          "tono": "900",
          "valor": "#674F1E",
          "variable": "--figma-color-palette-mostaza-900"
        }
      ]
    },
    {
      "familia": "purple",
      "tonos": [
        {
          "tono": "50",
          "valor": "#F5E9FD",
          "variable": "--figma-color-palette-purple-50"
        },
        {
          "tono": "100",
          "valor": "#E1BAF8",
          "variable": "--figma-color-palette-purple-100"
        },
        {
          "tono": "200",
          "valor": "#D398F5",
          "variable": "--figma-color-palette-purple-200"
        },
        {
          "tono": "300",
          "valor": "#BF6AF0",
          "variable": "--figma-color-palette-purple-300"
        },
        {
          "tono": "400",
          "valor": "#B24DED",
          "variable": "--figma-color-palette-purple-400"
        },
        {
          "tono": "500",
          "valor": "#9F20E9",
          "variable": "--figma-color-palette-purple-500"
        },
        {
          "tono": "600",
          "valor": "#911DD4",
          "variable": "--figma-color-palette-purple-600"
        },
        {
          "tono": "700",
          "valor": "#7117A5",
          "variable": "--figma-color-palette-purple-700"
        },
        {
          "tono": "800",
          "valor": "#571280",
          "variable": "--figma-color-palette-purple-800"
        },
        {
          "tono": "900",
          "valor": "#430D62",
          "variable": "--figma-color-palette-purple-900"
        }
      ]
    },
    {
      "familia": "red",
      "tonos": [
        {
          "tono": "50",
          "valor": "#FDEBEB",
          "variable": "--figma-color-palette-red-50"
        },
        {
          "tono": "100",
          "valor": "#F9BFC1",
          "variable": "--figma-color-palette-red-100"
        },
        {
          "tono": "200",
          "valor": "#F7A1A3",
          "variable": "--figma-color-palette-red-200"
        },
        {
          "tono": "300",
          "valor": "#F37679",
          "variable": "--figma-color-palette-red-300"
        },
        {
          "tono": "400",
          "valor": "#F15B5F",
          "variable": "--figma-color-palette-red-400"
        },
        {
          "tono": "500",
          "valor": "#ED3237",
          "variable": "--figma-color-palette-red-500"
        },
        {
          "tono": "600",
          "valor": "#D82E32",
          "variable": "--figma-color-palette-red-600"
        },
        {
          "tono": "700",
          "valor": "#A82427",
          "variable": "--figma-color-palette-red-700"
        },
        {
          "tono": "800",
          "valor": "#821C1E",
          "variable": "--figma-color-palette-red-800"
        },
        {
          "tono": "900",
          "valor": "#641517",
          "variable": "--figma-color-palette-red-900"
        }
      ]
    },
    {
      "familia": "rojo",
      "tonos": [
        {
          "tono": "50",
          "valor": "#FDEBED",
          "variable": "--figma-color-palette-rojo-50"
        },
        {
          "tono": "100",
          "valor": "#F9BFC1",
          "variable": "--figma-color-palette-rojo-100"
        },
        {
          "tono": "200",
          "valor": "#F7A1A3",
          "variable": "--figma-color-palette-rojo-200"
        },
        {
          "tono": "300",
          "valor": "#F37679",
          "variable": "--figma-color-palette-rojo-300"
        },
        {
          "tono": "400",
          "valor": "#F15B5F",
          "variable": "--figma-color-palette-rojo-400"
        },
        {
          "tono": "500",
          "valor": "#ED3237",
          "variable": "--figma-color-palette-rojo-500"
        },
        {
          "tono": "600",
          "valor": "#D82E32",
          "variable": "--figma-color-palette-rojo-600"
        },
        {
          "tono": "700",
          "valor": "#A82427",
          "variable": "--figma-color-palette-rojo-700"
        },
        {
          "tono": "800",
          "valor": "#821C1E",
          "variable": "--figma-color-palette-rojo-800"
        },
        {
          "tono": "900",
          "valor": "#641517",
          "variable": "--figma-color-palette-rojo-900"
        }
      ]
    },
    {
      "familia": "salmon",
      "tonos": [
        {
          "tono": "50",
          "valor": "#FDEBEF",
          "variable": "--figma-color-palette-salmon-50"
        },
        {
          "tono": "100",
          "valor": "#F7C1CD",
          "variable": "--figma-color-palette-salmon-100"
        },
        {
          "tono": "200",
          "valor": "#F4A3B4",
          "variable": "--figma-color-palette-salmon-200"
        },
        {
          "tono": "300",
          "valor": "#EE7992",
          "variable": "--figma-color-palette-salmon-300"
        },
        {
          "tono": "400",
          "valor": "#EB5F7D",
          "variable": "--figma-color-palette-salmon-400"
        },
        {
          "tono": "500",
          "valor": "#E6375D",
          "variable": "--figma-color-palette-salmon-500"
        },
        {
          "tono": "600",
          "valor": "#D13255",
          "variable": "--figma-color-palette-salmon-600"
        },
        {
          "tono": "700",
          "valor": "#A32742",
          "variable": "--figma-color-palette-salmon-700"
        },
        {
          "tono": "800",
          "valor": "#7F1E33",
          "variable": "--figma-color-palette-salmon-800"
        },
        {
          "tono": "900",
          "valor": "#611727",
          "variable": "--figma-color-palette-salmon-900"
        }
      ]
    },
    {
      "familia": "sky-blue",
      "tonos": [
        {
          "tono": "50",
          "valor": "#F4FBFD",
          "variable": "--figma-color-palette-sky-blue-sky-blue-50"
        },
        {
          "tono": "100",
          "valor": "#DEF2F9",
          "variable": "--figma-color-palette-sky-blue-sky-blue-100"
        },
        {
          "tono": "200",
          "valor": "#CEEBF7",
          "variable": "--figma-color-palette-sky-blue-sky-blue-200"
        },
        {
          "tono": "300",
          "valor": "#B7E2F3",
          "variable": "--figma-color-palette-sky-blue-sky-blue-300"
        },
        {
          "tono": "400",
          "valor": "#A9DDF1",
          "variable": "--figma-color-palette-sky-blue-sky-blue-400"
        },
        {
          "tono": "500",
          "valor": "#94D4ED",
          "variable": "--figma-color-palette-sky-blue-sky-blue-500"
        },
        {
          "tono": "600",
          "valor": "#87C1D8",
          "variable": "--figma-color-palette-sky-blue-sky-blue-600"
        },
        {
          "tono": "700",
          "valor": "#6997A8",
          "variable": "--figma-color-palette-sky-blue-sky-blue-700"
        },
        {
          "tono": "800",
          "valor": "#517582",
          "variable": "--figma-color-palette-sky-blue-sky-blue-800"
        },
        {
          "tono": "900",
          "valor": "#3E5964",
          "variable": "--figma-color-palette-sky-blue-sky-blue-900"
        }
      ]
    },
    {
      "familia": "solar-orange",
      "tonos": [
        {
          "tono": "50",
          "valor": "#FFF3EA",
          "variable": "--figma-color-palette-solar-orange-50"
        },
        {
          "tono": "100",
          "valor": "#FFD9BD",
          "variable": "--figma-color-palette-solar-orange-100"
        },
        {
          "tono": "200",
          "valor": "#FFC69D",
          "variable": "--figma-color-palette-solar-orange-200"
        },
        {
          "tono": "300",
          "valor": "#FFAC71",
          "variable": "--figma-color-palette-solar-orange-300"
        },
        {
          "tono": "400",
          "valor": "#FF9C55",
          "variable": "--figma-color-palette-solar-orange-400"
        },
        {
          "tono": "500",
          "valor": "#FF832B",
          "variable": "--figma-color-palette-solar-orange-500"
        },
        {
          "tono": "600",
          "valor": "#E87727",
          "variable": "--figma-color-palette-solar-orange-600"
        },
        {
          "tono": "700",
          "valor": "#B55D1F",
          "variable": "--figma-color-palette-solar-orange-700"
        },
        {
          "tono": "800",
          "valor": "#8C4818",
          "variable": "--figma-color-palette-solar-orange-800"
        },
        {
          "tono": "900",
          "valor": "#6B3712",
          "variable": "--figma-color-palette-solar-orange-900"
        }
      ]
    },
    {
      "familia": "turquesa",
      "tonos": [
        {
          "tono": "50",
          "valor": "#E6F4FE",
          "variable": "--figma-color-palette-turquesa-50"
        },
        {
          "tono": "100",
          "valor": "#B0DEFD",
          "variable": "--figma-color-palette-turquesa-100"
        },
        {
          "tono": "200",
          "valor": "#8ACDFC",
          "variable": "--figma-color-palette-turquesa-200"
        },
        {
          "tono": "300",
          "valor": "#54B7FA",
          "variable": "--figma-color-palette-turquesa-300"
        },
        {
          "tono": "400",
          "valor": "#33A9F9",
          "variable": "--figma-color-palette-turquesa-400"
        },
        {
          "tono": "500",
          "valor": "#0093F8",
          "variable": "--figma-color-palette-turquesa-500"
        },
        {
          "tono": "600",
          "valor": "#0086E2",
          "variable": "--figma-color-palette-turquesa-600"
        },
        {
          "tono": "700",
          "valor": "#0068B0",
          "variable": "--figma-color-palette-turquesa-700"
        },
        {
          "tono": "800",
          "valor": "#005188",
          "variable": "--figma-color-palette-turquesa-800"
        },
        {
          "tono": "900",
          "valor": "#003E68",
          "variable": "--figma-color-palette-turquesa-900"
        }
      ]
    },
    {
      "familia": "turquoise2",
      "tonos": [
        {
          "tono": "50",
          "valor": "#E6F6FA",
          "variable": "--figma-color-palette-turquoise2-50"
        },
        {
          "tono": "100",
          "valor": "#B0E3EE",
          "variable": "--figma-color-palette-turquoise2-100"
        },
        {
          "tono": "200",
          "valor": "#8AD6E6",
          "variable": "--figma-color-palette-turquoise2-200"
        },
        {
          "tono": "300",
          "valor": "#54C3DA",
          "variable": "--figma-color-palette-turquoise2-300"
        },
        {
          "tono": "400",
          "valor": "#33B7D3",
          "variable": "--figma-color-palette-turquoise2-400"
        },
        {
          "tono": "500",
          "valor": "#00A5C8",
          "variable": "--figma-color-palette-turquoise2-500"
        },
        {
          "tono": "600",
          "valor": "#0096B6",
          "variable": "--figma-color-palette-turquoise2-600"
        },
        {
          "tono": "700",
          "valor": "#00758E",
          "variable": "--figma-color-palette-turquoise2-700"
        },
        {
          "tono": "800",
          "valor": "#005B6E",
          "variable": "--figma-color-palette-turquoise2-800"
        },
        {
          "tono": "900",
          "valor": "#004554",
          "variable": "--figma-color-palette-turquoise2-turquoise2-900"
        }
      ]
    },
    {
      "familia": "verde",
      "tonos": [
        {
          "tono": "50",
          "valor": "#EBF8F7",
          "variable": "--figma-color-palette-verde-50"
        },
        {
          "tono": "100",
          "valor": "#C2E8E5",
          "variable": "--figma-color-palette-verde-100"
        },
        {
          "tono": "200",
          "valor": "#A4DDD8",
          "variable": "--figma-color-palette-verde-200"
        },
        {
          "tono": "300",
          "valor": "#7BCDC6",
          "variable": "--figma-color-palette-verde-300"
        },
        {
          "tono": "400",
          "valor": "#61C3BB",
          "variable": "--figma-color-palette-verde-400"
        },
        {
          "tono": "500",
          "valor": "#3AB4AA",
          "variable": "--figma-color-palette-verde-500"
        },
        {
          "tono": "600",
          "valor": "#35A49B",
          "variable": "--figma-color-palette-verde-600"
        },
        {
          "tono": "700",
          "valor": "#298079",
          "variable": "--figma-color-palette-verde-700"
        },
        {
          "tono": "800",
          "valor": "#20635E",
          "variable": "--figma-color-palette-verde-800"
        },
        {
          "tono": "900",
          "valor": "#184C47",
          "variable": "--figma-color-palette-verde-900"
        }
      ]
    },
    {
      "familia": "violet",
      "tonos": [
        {
          "tono": "50",
          "valor": "#EFEEFC",
          "variable": "--figma-color-palette-violet-violet-50"
        },
        {
          "tono": "100",
          "valor": "#CCCAF5",
          "variable": "--figma-color-palette-violet-violet-100"
        },
        {
          "tono": "200",
          "valor": "#B3B0F1",
          "variable": "--figma-color-palette-violet-violet-200"
        },
        {
          "tono": "300",
          "valor": "#908CEA",
          "variable": "--figma-color-palette-violet-violet-300"
        },
        {
          "tono": "400",
          "valor": "#7B75E6",
          "variable": "--figma-color-palette-violet-violet-400"
        },
        {
          "tono": "500",
          "valor": "#5A53E0",
          "variable": "--figma-color-palette-violet-violet-500"
        },
        {
          "tono": "600",
          "valor": "#524CCC",
          "variable": "--figma-color-palette-violet-violet-600"
        },
        {
          "tono": "700",
          "valor": "#403B9F",
          "variable": "--figma-color-palette-violet-violet-700"
        },
        {
          "tono": "800",
          "valor": "#322E7B",
          "variable": "--figma-color-palette-violet-violet-800"
        },
        {
          "tono": "900",
          "valor": "#26235E",
          "variable": "--figma-color-palette-violet-violet-900"
        }
      ]
    },
    {
      "familia": "yellow",
      "tonos": [
        {
          "tono": "50",
          "valor": "#FEF8E6",
          "variable": "--figma-color-palette-yellow-yellow-50"
        },
        {
          "tono": "100",
          "valor": "#FCE9B0",
          "variable": "--figma-color-palette-yellow-yellow-100"
        },
        {
          "tono": "200",
          "valor": "#FADE8A",
          "variable": "--figma-color-palette-yellow-yellow-200"
        },
        {
          "tono": "300",
          "valor": "#F8CF55",
          "variable": "--figma-color-palette-yellow-yellow-300"
        },
        {
          "tono": "400",
          "valor": "#F6C534",
          "variable": "--figma-color-palette-yellow-yellow-400"
        },
        {
          "tono": "500",
          "valor": "#F4B701",
          "variable": "--figma-color-palette-yellow-yellow-500"
        },
        {
          "tono": "600",
          "valor": "#DEA701",
          "variable": "--figma-color-palette-yellow-yellow-600"
        },
        {
          "tono": "700",
          "valor": "#AD8201",
          "variable": "--figma-color-palette-yellow-yellow-700"
        },
        {
          "tono": "800",
          "valor": "#866501",
          "variable": "--figma-color-palette-yellow-yellow-800"
        },
        {
          "tono": "900",
          "valor": "#664D00",
          "variable": "--figma-color-palette-yellow-yellow-900"
        }
      ]
    }
  ],
  "tipografia": {
    "familia": "\"Inter\", ui-sans-serif, system-ui, sans-serif",
    "monospace": "'Courier New', monospace",
    "tamanos": [
      {
        "token": "--sys-typography-size-heading-1",
        "rol": "Heading 1",
        "escritorio": "54px",
        "tablet": "40px",
        "movil": "40px"
      },
      {
        "token": "--sys-typography-size-heading-2",
        "rol": "Heading 2",
        "escritorio": "44px",
        "tablet": "36px",
        "movil": "36px"
      },
      {
        "token": "--sys-typography-size-heading-3",
        "rol": "Heading 3",
        "escritorio": "30px",
        "tablet": "24px",
        "movil": "24px"
      },
      {
        "token": "--sys-typography-size-heading-4",
        "rol": "Heading 4",
        "escritorio": "22px",
        "tablet": "18px",
        "movil": "18px"
      },
      {
        "token": "--sys-typography-size-heading-5",
        "rol": "Heading 5",
        "escritorio": "18px",
        "tablet": "16px",
        "movil": "16px"
      },
      {
        "token": "--sys-typography-size-heading-6",
        "rol": "Heading 6",
        "escritorio": "16px",
        "tablet": "14px",
        "movil": "14px"
      },
      {
        "token": "--sys-typography-size-subtitle-1",
        "rol": "Subtitle 1",
        "escritorio": "16px",
        "tablet": "14px",
        "movil": "14px"
      },
      {
        "token": "--sys-typography-size-subtitle-2",
        "rol": "Subtitle 2",
        "escritorio": "14px",
        "tablet": "12px",
        "movil": "12px"
      },
      {
        "token": "--sys-typography-size-body-1",
        "rol": "Body 1",
        "escritorio": "16px",
        "tablet": "14px",
        "movil": "14px"
      },
      {
        "token": "--sys-typography-size-body-2",
        "rol": "Body 2",
        "escritorio": "14px",
        "tablet": "13px",
        "movil": "13px"
      },
      {
        "token": "--sys-typography-size-button-1",
        "rol": "Button 1",
        "escritorio": "14px",
        "tablet": "13px",
        "movil": "13px"
      },
      {
        "token": "--sys-typography-size-button-2",
        "rol": "Button 2",
        "escritorio": "12px",
        "tablet": "12px",
        "movil": "12px"
      },
      {
        "token": "--sys-typography-size-caption-1",
        "rol": "Caption 1",
        "escritorio": "12px",
        "tablet": "11px",
        "movil": "11px"
      },
      {
        "token": "--sys-typography-size-caption-2",
        "rol": "Caption 2",
        "escritorio": "10px",
        "tablet": "10px",
        "movil": "10px"
      },
      {
        "token": "--sys-typography-size-overline-1",
        "rol": "Overline 1",
        "escritorio": "11px",
        "tablet": "10px",
        "movil": "10px"
      }
    ],
    "pesos": [
      {
        "token": "--sys-typography-weight-light",
        "nombre": "Light",
        "valor": "300"
      },
      {
        "token": "--sys-typography-weight-regular",
        "nombre": "Regular",
        "valor": "400"
      },
      {
        "token": "--sys-typography-weight-medium",
        "nombre": "Medium",
        "valor": "500"
      },
      {
        "token": "--sys-typography-weight-semibold",
        "nombre": "Semibold",
        "valor": "600"
      },
      {
        "token": "--sys-typography-weight-bold",
        "nombre": "Bold",
        "valor": "700"
      }
    ],
    "interlineados": [
      {
        "token": "--sys-typography-line-height-tight",
        "nombre": "Tight",
        "valor": "1.2"
      },
      {
        "token": "--sys-typography-line-height-normal",
        "nombre": "Normal",
        "valor": "1.5"
      },
      {
        "token": "--sys-typography-line-height-relaxed",
        "nombre": "Relaxed",
        "valor": "1.8"
      }
    ]
  },
  "espaciado": {
    "gap": [
      {
        "token": "--sys-gap-base-none",
        "escala": "none",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": [
          "*-siaf-none"
        ]
      },
      {
        "token": "--sys-gap-base-xxs",
        "escala": "xxs",
        "escritorio": "4px",
        "tablet": "4px",
        "movil": "4px",
        "utilidades": [
          "*-siaf-xxs"
        ]
      },
      {
        "token": "--sys-gap-base-xs",
        "escala": "xs",
        "escritorio": "8px",
        "tablet": "8px",
        "movil": "8px",
        "utilidades": [
          "*-siaf-xs"
        ]
      },
      {
        "token": "--sys-gap-base-sm",
        "escala": "sm",
        "escritorio": "12px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": [
          "*-siaf-sm"
        ]
      },
      {
        "token": "--sys-gap-base-md",
        "escala": "md",
        "escritorio": "16px",
        "tablet": "16px",
        "movil": "16px",
        "utilidades": [
          "*-siaf-md"
        ]
      },
      {
        "token": "--sys-gap-base-lg",
        "escala": "lg",
        "escritorio": "24px",
        "tablet": "24px",
        "movil": "24px",
        "utilidades": [
          "*-siaf-lg"
        ]
      },
      {
        "token": "--sys-gap-base-xl",
        "escala": "xl",
        "escritorio": "32px",
        "tablet": "32px",
        "movil": "32px",
        "utilidades": [
          "*-siaf-xl"
        ]
      },
      {
        "token": "--sys-gap-base-xxl",
        "escala": "xxl",
        "escritorio": "40px",
        "tablet": "40px",
        "movil": "40px",
        "utilidades": [
          "*-siaf-xxl"
        ]
      }
    ],
    "padding": [
      {
        "token": "--sys-padding-base-none",
        "escala": "none",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--sys-padding-base-xxs",
        "escala": "xxs",
        "escritorio": "4px",
        "tablet": "4px",
        "movil": "4px",
        "utilidades": []
      },
      {
        "token": "--sys-padding-base-xs",
        "escala": "xs",
        "escritorio": "8px",
        "tablet": "8px",
        "movil": "8px",
        "utilidades": []
      },
      {
        "token": "--sys-padding-base-sm",
        "escala": "sm",
        "escritorio": "12px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--sys-padding-base-md",
        "escala": "md",
        "escritorio": "16px",
        "tablet": "16px",
        "movil": "16px",
        "utilidades": []
      },
      {
        "token": "--sys-padding-base-lg",
        "escala": "lg",
        "escritorio": "24px",
        "tablet": "24px",
        "movil": "24px",
        "utilidades": []
      },
      {
        "token": "--sys-padding-base-xl",
        "escala": "xl",
        "escritorio": "32px",
        "tablet": "32px",
        "movil": "32px",
        "utilidades": []
      },
      {
        "token": "--sys-padding-base-xxl",
        "escala": "xxl",
        "escritorio": "48px",
        "tablet": "48px",
        "movil": "48px",
        "utilidades": []
      }
    ],
    "contenedores": [
      {
        "token": "--figma-device-sys-gap-container-x",
        "escala": "gap-container-x",
        "escritorio": "12px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-container-y",
        "escala": "gap-container-y",
        "escritorio": "12px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-content-body-x",
        "escala": "gap-content-body-x",
        "escritorio": "24px",
        "tablet": "24px",
        "movil": "24px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-content-body-y",
        "escala": "gap-content-body-y",
        "escritorio": "24px",
        "tablet": "24px",
        "movil": "24px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-content-head-x",
        "escala": "gap-content-head-x",
        "escritorio": "16px",
        "tablet": "16px",
        "movil": "16px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-content-head-y",
        "escala": "gap-content-head-y",
        "escritorio": "16px",
        "tablet": "16px",
        "movil": "16px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-row-x",
        "escala": "gap-row-x",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-row-y",
        "escala": "gap-row-y",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-section-x",
        "escala": "gap-section-x",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-gap-section-y",
        "escala": "gap-section-y",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-container-x",
        "escala": "padding-container-x",
        "escritorio": "16px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-container-y",
        "escala": "padding-container-y",
        "escritorio": "16px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-content-body-x",
        "escala": "padding-content-body-x",
        "escritorio": "24px",
        "tablet": "16px",
        "movil": "16px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-content-body-y",
        "escala": "padding-content-body-y",
        "escritorio": "16px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-content-head-b",
        "escala": "padding-content-head-b",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-content-head-l",
        "escala": "padding-content-head-l",
        "escritorio": "24px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-content-head-r",
        "escala": "padding-content-head-r",
        "escritorio": "24px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-content-head-t",
        "escala": "padding-content-head-t",
        "escritorio": "16px",
        "tablet": "12px",
        "movil": "12px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-row-x",
        "escala": "padding-row-x",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-row-y",
        "escala": "padding-row-y",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-section-x",
        "escala": "padding-section-x",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      },
      {
        "token": "--figma-device-sys-padding-section-y",
        "escala": "padding-section-y",
        "escritorio": "0px",
        "tablet": "0px",
        "movil": "0px",
        "utilidades": []
      }
    ]
  },
  "radios": [
    {
      "token": "--sys-radius-sm",
      "escala": "sm",
      "escritorio": "4px",
      "tablet": "4px",
      "movil": "4px",
      "utilidades": [
        "rounded-siaf-sm"
      ]
    },
    {
      "token": "--sys-radius-md",
      "escala": "md",
      "escritorio": "8px",
      "tablet": "8px",
      "movil": "8px",
      "utilidades": [
        "rounded-siaf-md"
      ]
    },
    {
      "token": "--sys-radius-lg",
      "escala": "lg",
      "escritorio": "16px",
      "tablet": "16px",
      "movil": "16px",
      "utilidades": [
        "rounded-siaf-lg"
      ]
    },
    {
      "token": "--sys-radius-xl",
      "escala": "xl",
      "escritorio": "16px",
      "tablet": "16px",
      "movil": "16px",
      "utilidades": [
        "rounded-siaf-xl"
      ]
    },
    {
      "token": "--sys-radius-full",
      "escala": "full",
      "escritorio": "40px",
      "tablet": "40px",
      "movil": "40px",
      "utilidades": [
        "rounded-siaf-full"
      ]
    }
  ],
  "bordes": [
    {
      "token": "--figma-device-sys-border-linear-none",
      "escala": "none",
      "escritorio": "0px",
      "tablet": "0px",
      "movil": "0px",
      "utilidades": []
    },
    {
      "token": "--sys-border-linear-thin",
      "escala": "thin",
      "escritorio": "1px",
      "tablet": "1px",
      "movil": "1px",
      "utilidades": []
    },
    {
      "token": "--sys-border-linear-medium",
      "escala": "medium",
      "escritorio": "2px",
      "tablet": "2px",
      "movil": "2px",
      "utilidades": []
    },
    {
      "token": "--figma-device-sys-border-linear-thick",
      "escala": "thick",
      "escritorio": "4px",
      "tablet": "4px",
      "movil": "4px",
      "utilidades": []
    }
  ],
  "sombras": [
    {
      "token": "--sys-shadow-sm",
      "nombre": "sm",
      "claro": "0 1px 2px rgb(16 24 40 / 0.06)",
      "oscuro": "0 1px 2px rgb(0 0 0 / 0.45)",
      "utilidades": [
        "shadow-siaf-sm"
      ]
    },
    {
      "token": "--sys-shadow-md",
      "nombre": "md",
      "claro": "0 8px 24px rgb(16 24 40 / 0.08)",
      "oscuro": "0 12px 28px rgb(0 0 0 / 0.42)",
      "utilidades": [
        "shadow-siaf-md"
      ]
    },
    {
      "token": "--sys-shadow-lg",
      "nombre": "lg",
      "claro": "0 12px 32px rgb(16 24 40 / 0.12)",
      "oscuro": "0 18px 40px rgb(0 0 0 / 0.48)",
      "utilidades": [
        "shadow-siaf-lg"
      ]
    },
    {
      "token": "--sys-shadow-elevation-1",
      "nombre": "elevation-1",
      "claro": "0 1px 2px rgb(0 0 0 / 0.14), 0 2px 1px rgb(0 0 0 / 0.12), 0 1px 3px rgb(0 0 0 / 0.2)",
      "oscuro": "0 1px 2px rgb(0 0 0 / 0.45), 0 2px 1px rgb(0 0 0 / 0.34), 0 1px 3px rgb(0 0 0 / 0.5)",
      "utilidades": [
        "shadow-siaf-elevation-1"
      ]
    },
    {
      "token": "--sys-shadow-elevation-2",
      "nombre": "elevation-2",
      "claro": "0 2px 1px rgb(0 0 0 / 0.14), 0 3px 1px rgb(0 0 0 / 0.12), 0 1px 3px rgb(0 0 0 / 0.2)",
      "oscuro": "0 2px 1px rgb(0 0 0 / 0.45), 0 3px 1px rgb(0 0 0 / 0.34), 0 1px 3px rgb(0 0 0 / 0.5)",
      "utilidades": [
        "shadow-siaf-elevation-2"
      ]
    },
    {
      "token": "--sys-shadow-elevation-6",
      "nombre": "elevation-6",
      "claro": "0 6px 10px rgb(0 0 0 / 0.14), 0 1px 18px rgb(0 0 0 / 0.12), 0 3px 5px rgb(0 0 0 / 0.2)",
      "oscuro": null,
      "utilidades": [
        "shadow-siaf-elevation-6"
      ]
    },
    {
      "token": "--sys-shadow-elevation-8",
      "nombre": "elevation-8",
      "claro": "0 8px 10px rgb(0 0 0 / 0.14), 0 3px 14px rgb(0 0 0 / 0.12), 0 5px 5px rgb(0 0 0 / 0.2)",
      "oscuro": null,
      "utilidades": [
        "shadow-siaf-elevation-8"
      ]
    },
    {
      "token": "--sys-shadow-elevation-16",
      "nombre": "elevation-16",
      "claro": "0 16px 22px rgb(0 0 0 / 0.14), 0 6px 30px rgb(0 0 0 / 0.12), 0 8px 10px rgb(0 0 0 / 0.2)",
      "oscuro": null,
      "utilidades": [
        "shadow-siaf-elevation-16"
      ]
    }
  ],
  "superficie": {
    "claro": "#FFFFFF",
    "oscuro": "#16181D"
  },
  "sinDefinir": [],
  iconos: {
    tamanos: [{"token":"--figma-device-sys-sizes-icon-x-small","escala":"x-small","escritorio":"12px","tablet":"12px","movil":"12px","utilidades":[]},{"token":"--figma-device-sys-sizes-icon-small","escala":"small","escritorio":"16px","tablet":"16px","movil":"16px","utilidades":[]},{"token":"--figma-device-sys-sizes-icon-medium","escala":"medium","escritorio":"20px","tablet":"20px","movil":"20px","utilidades":[]},{"token":"--figma-device-sys-sizes-icon-large","escala":"large","escritorio":"24px","tablet":"24px","movil":"24px","utilidades":[]},{"token":"--figma-device-sys-sizes-icon-x-large","escala":"x-large","escritorio":"32px","tablet":"32px","movil":"32px","utilidades":[]}],
    nombres: ["abc","ac_unit","access_alarm","access_alarms","access_time","access_time_filled","accessibility","accessibility_new","accessible","accessible_forward","account_balance","account_balance_wallet","account_box","account_circle","account_tree","ad_units","adb","add","add_a_photo","add_alarm","add_alert","add_box","add_business","add_card","add_chart","add_circle","add_circle_outline","add_comment","add_home","add_home_work","add_ic_call","add_link","add_location","add_location_alt","add_moderator","add_photo_alternate","add_reaction","add_road","add_shopping_cart","add_task","add_to_drive","add_to_home_screen","add_to_photos","add_to_queue","addchart","adf_scanner","adjust","admin_panel_settings","ads_click","agriculture","air","airline_seat_flat","airline_seat_flat_angled","airline_seat_individual_suite","airline_seat_legroom_extra","airline_seat_legroom_normal","airline_seat_legroom_reduced","airline_seat_recline_extra","airline_seat_recline_normal","airline_stops","airlines","airplane_ticket","airplanemode_active","airplanemode_inactive","airplay","airport_shuttle","alarm","alarm_add","alarm_off","alarm_on","album","align_horizontal_center","align_horizontal_left","align_horizontal_right","align_vertical_bottom","align_vertical_center","align_vertical_top","all_inbox","all_inclusive","all_out","alt_route","alternate_email","analytics","anchor","android","animation","announcement","aod","apartment","api","app_blocking","app_registration","app_settings_alt","app_shortcut","approval","apps","apps_outage","architecture","archive","area_chart","arrow_back","arrow_back_ios","arrow_back_ios_new","arrow_circle_down","arrow_circle_left","arrow_circle_right","arrow_circle_up","arrow_downward","arrow_drop_down","arrow_drop_down_circle","arrow_drop_up","arrow_forward","arrow_forward_ios","arrow_left","arrow_outward","arrow_right","arrow_right_alt","arrow_upward","art_track","article","aspect_ratio","assessment","assignment","assignment_ind","assignment_late","assignment_return","assignment_returned","assignment_turned_in","assist_walker","assistant","assistant_direction","assistant_photo","assured_workload","atm","attach_email","attach_file","attach_money","attachment","attractions","attribution","audio_file","audiotrack","auto_awesome","auto_awesome_mosaic","auto_awesome_motion","auto_delete","auto_fix_high","auto_fix_normal","auto_fix_off","auto_graph","auto_mode","auto_stories","autofps_select","autorenew","av_timer","baby_changing_station","back_hand","backpack","backspace","backup","backup_table","badge","bakery_dining","balance","balcony","ballot","bar_chart","batch_prediction","bathroom","bathtub","battery_0_bar","battery_1_bar","battery_2_bar","battery_3_bar","battery_4_bar","battery_5_bar","battery_6_bar","battery_alert","battery_charging_full","battery_full","battery_saver","battery_std","battery_unknown","beach_access","bed","bedroom_baby","bedroom_child","bedroom_parent","bedtime","bedtime_off","beenhere","bento","bike_scooter","biotech","blender","blind","blinds","blinds_closed","block","bloodtype","bluetooth","bluetooth_audio","bluetooth_connected","bluetooth_disabled","bluetooth_drive","bluetooth_searching","blur_circular","blur_linear","blur_off","blur_on","bolt","book","book_online","bookmark","bookmark_add","bookmark_added","bookmark_border","bookmark_remove","bookmarks","border_all","border_bottom","border_clear","border_color","border_horizontal","border_inner","border_left","border_outer","border_right","border_style","border_top","border_vertical","boy","branding_watermark","breakfast_dining","brightness_1","brightness_2","brightness_3","brightness_4","brightness_5","brightness_6","brightness_7","brightness_auto","brightness_high","brightness_low","brightness_medium","broadcast_on_home","broadcast_on_personal","broken_image","browse_gallery","browser_not_supported","browser_updated","brunch_dining","brush","bubble_chart","bug_report","build","build_circle","bungalow","burst_mode","bus_alert","business","business_center","cabin","cable","cached","cake","calculate","calendar_month","calendar_today","calendar_view_day","calendar_view_month","calendar_view_week","call","call_end","call_made","call_merge","call_missed","call_missed_outgoing","call_received","call_split","call_to_action","camera","camera_alt","camera_enhance","camera_front","camera_indoor","camera_outdoor","camera_rear","camera_roll","cameraswitch","campaign","cancel","cancel_presentation","cancel_schedule_send","candlestick_chart","car_crash","car_rental","car_repair","card_giftcard","card_membership","card_travel","carpenter","cases","casino","cast","cast_connected","cast_for_education","castle","catching_pokemon","category","celebration","cell_tower","cell_wifi","center_focus_strong","center_focus_weak","chair","chair_alt","chalet","change_circle","change_history","charging_station","chat","chat_bubble","chat_bubble_outline","check","check_box","check_box_outline_blank","check_circle","check_circle_outline","checklist","checklist_rtl","checkroom","chevron_left","chevron_right","child_care","child_friendly","chrome_reader_mode","church","circle","circle_notifications","class","clean_hands","cleaning_services","clear","clear_all","close","close_fullscreen","closed_caption","closed_caption_disabled","closed_caption_off","cloud","cloud_circle","cloud_done","cloud_download","cloud_off","cloud_queue","cloud_sync","cloud_upload","co_present","co2","code","code_off","coffee","coffee_maker","collections","collections_bookmark","color_lens","colorize","comment","comment_bank","comments_disabled","commit","commute","compare","compare_arrows","compass_calibration","compost","compress","computer","confirmation_number","connect_without_contact","connected_tv","connecting_airports","construction","contact_emergency","contact_mail","contact_page","contact_phone","contact_support","contactless","contacts","content_copy","content_cut","content_paste","content_paste_go","content_paste_off","content_paste_search","contrast","control_camera","control_point","control_point_duplicate","cookie","copy_all","copyright","coronavirus","corporate_fare","cottage","countertops","create","create_new_folder","credit_card","credit_card_off","credit_score","crib","crisis_alert","crop","crop_16_9","crop_3_2","crop_5_4","crop_7_5","crop_din","crop_free","crop_landscape","crop_original","crop_portrait","crop_rotate","crop_square","cruelty_free","css","currency_bitcoin","currency_exchange","currency_franc","currency_lira","currency_pound","currency_ruble","currency_rupee","currency_yen","currency_yuan","curtains","curtains_closed","cyclone","dangerous","dark_mode","dashboard","dashboard_customize","data_array","data_exploration","data_object","data_saver_off","data_saver_on","data_thresholding","data_usage","dataset","dataset_linked","date_range","deblur","deck","dehaze","delete","delete_forever","delete_outline","delete_sweep","delivery_dining","density_large","density_medium","density_small","departure_board","description","deselect","design_services","desk","desktop_access_disabled","desktop_mac","desktop_windows","details","developer_board","developer_board_off","developer_mode","device_hub","device_thermostat","device_unknown","devices","devices_fold","devices_other","dialer_sip","dialpad","diamond","difference","dining","dinner_dining","directions","directions_bike","directions_boat","directions_boat_filled","directions_bus","directions_bus_filled","directions_car","directions_car_filled","directions_off","directions_railway","directions_railway_filled","directions_run","directions_subway","directions_subway_filled","directions_transit","directions_transit_filled","directions_walk","dirty_lens","disabled_by_default","disabled_visible","disc_full","discount","display_settings","diversity_1","diversity_2","diversity_3","dns","do_disturb","do_disturb_alt","do_disturb_off","do_disturb_on","do_not_disturb","do_not_disturb_alt","do_not_disturb_off","do_not_disturb_on","do_not_disturb_on_total_silence","do_not_step","do_not_touch","dock","document_scanner","domain","domain_add","domain_disabled","domain_verification","done","done_all","done_outline","donut_large","donut_small","door_back","door_front","door_sliding","doorbell","double_arrow","downhill_skiing","download","download_done","download_for_offline","downloading","drafts","drag_handle","drag_indicator","draw","drive_eta","drive_file_move","drive_file_move_rtl","drive_file_rename_outline","drive_folder_upload","dry","dry_cleaning","duo","dvr","dynamic_feed","dynamic_form","e_mobiledata","earbuds","earbuds_battery","east","edgesensor_high","edgesensor_low","edit","edit_attributes","edit_calendar","edit_location","edit_location_alt","edit_note","edit_notifications","edit_off","edit_road","egg","egg_alt","eject","elderly","elderly_woman","electric_bike","electric_bolt","electric_car","electric_meter","electric_moped","electric_rickshaw","electric_scooter","electrical_services","elevator","email","emergency","emergency_recording","emergency_share","emoji_emotions","emoji_events","emoji_food_beverage","emoji_nature","emoji_objects","emoji_people","emoji_symbols","emoji_transportation","energy_savings_leaf","engineering","enhanced_encryption","equalizer","error","error_outline","escalator","escalator_warning","euro","euro_symbol","ev_station","event","event_available","event_busy","event_note","event_repeat","event_seat","exit_to_app","expand","expand_circle_down","expand_less","expand_more","explicit","explore","explore_off","exposure","exposure_neg_1","exposure_neg_2","exposure_plus_1","exposure_plus_2","exposure_zero","extension","extension_off","face","face_2","face_3","face_4","face_5","face_6","face_retouching_natural","face_retouching_off","fact_check","factory","family_restroom","fast_forward","fast_rewind","fastfood","favorite","favorite_border","fax","featured_play_list","featured_video","feed","feedback","female","fence","festival","fiber_dvr","fiber_manual_record","fiber_new","fiber_pin","fiber_smart_record","file_copy","file_download","file_download_done","file_download_off","file_open","file_present","file_upload","filter","filter_1","filter_2","filter_3","filter_4","filter_5","filter_6","filter_7","filter_8","filter_9","filter_9_plus","filter_alt","filter_alt_off","filter_b_and_w","filter_center_focus","filter_drama","filter_frames","filter_hdr","filter_list","filter_list_off","filter_none","filter_tilt_shift","filter_vintage","find_in_page","find_replace","fingerprint","fire_extinguisher","fire_hydrant_alt","fire_truck","fireplace","first_page","fit_screen","fitbit","fitness_center","flag","flag_circle","flaky","flare","flash_auto","flash_off","flash_on","flashlight_off","flashlight_on","flatware","flight","flight_class","flight_land","flight_takeoff","flip","flip_camera_android","flip_camera_ios","flip_to_back","flip_to_front","flood","fluorescent","flutter_dash","fmd_bad","fmd_good","folder","folder_copy","folder_delete","folder_off","folder_open","folder_shared","folder_special","folder_zip","follow_the_signs","font_download","font_download_off","food_bank","forest","fork_left","fork_right","format_align_center","format_align_justify","format_align_left","format_align_right","format_bold","format_clear","format_color_fill","format_color_reset","format_color_text","format_indent_decrease","format_indent_increase","format_italic","format_line_spacing","format_list_bulleted","format_list_numbered","format_list_numbered_rtl","format_overline","format_paint","format_quote","format_shapes","format_size","format_strikethrough","format_textdirection_l_to_r","format_textdirection_r_to_l","format_underlined","fort","forum","forward","forward_10","forward_30","forward_5","forward_to_inbox","foundation","free_breakfast","free_cancellation","front_hand","fullscreen","fullscreen_exit","functions","g_mobiledata","g_translate","gamepad","games","garage","gas_meter","gavel","generating_tokens","gesture","get_app","gif","gif_box","girl","gite","golf_course","gpp_bad","gpp_good","gpp_maybe","gps_fixed","gps_not_fixed","gps_off","grade","gradient","grading","grain","graphic_eq","grass","grid_3x3","grid_4x4","grid_goldenratio","grid_off","grid_on","grid_view","group","group_add","group_off","group_remove","group_work","groups","groups_2","groups_3","h_mobiledata","h_plus_mobiledata","hail","handshake","handyman","hardware","hd","hdr_auto","hdr_auto_select","hdr_enhanced_select","hdr_off","hdr_off_select","hdr_on","hdr_on_select","hdr_plus","hdr_strong","hdr_weak","headphones","headphones_battery","headset","headset_mic","headset_off","healing","health_and_safety","hearing","hearing_disabled","heart_broken","heat_pump","height","help","help_center","help_outline","hevc","hexagon","hide_image","hide_source","high_quality","highlight","highlight_alt","highlight_off","hiking","history","history_edu","history_toggle_off","hive","hls","hls_off","holiday_village","home","home_max","home_mini","home_repair_service","home_work","horizontal_distribute","horizontal_rule","horizontal_split","hot_tub","hotel","hotel_class","hourglass_bottom","hourglass_disabled","hourglass_empty","hourglass_full","hourglass_top","house","house_siding","houseboat","how_to_reg","how_to_vote","html","http","https","hub","hvac","ice_skating","icecream","image","image_aspect_ratio","image_not_supported","image_search","imagesearch_roller","import_contacts","import_export","important_devices","inbox","incomplete_circle","indeterminate_check_box","info","input","insert_chart","insert_chart_outlined","insert_comment","insert_drive_file","insert_emoticon","insert_invitation","insert_link","insert_page_break","insert_photo","insights","install_desktop","install_mobile","integration_instructions","interests","interpreter_mode","inventory","inventory_2","invert_colors","invert_colors_off","ios_share","iron","iso","javascript","join_full","join_inner","join_left","join_right","kayaking","kebab_dining","key","key_off","keyboard","keyboard_alt","keyboard_arrow_down","keyboard_arrow_left","keyboard_arrow_right","keyboard_arrow_up","keyboard_backspace","keyboard_capslock","keyboard_command_key","keyboard_control_key","keyboard_double_arrow_down","keyboard_double_arrow_left","keyboard_double_arrow_right","keyboard_double_arrow_up","keyboard_hide","keyboard_option_key","keyboard_return","keyboard_tab","keyboard_voice","king_bed","kitchen","kitesurfing","label","label_important","label_off","lan","landscape","landslide","language","laptop","laptop_chromebook","laptop_mac","laptop_windows","last_page","launch","layers","layers_clear","leaderboard","leak_add","leak_remove","legend_toggle","lens","lens_blur","library_add","library_add_check","library_books","library_music","light","light_mode","lightbulb","lightbulb_circle","line_axis","line_style","line_weight","linear_scale","link","link_off","linked_camera","liquor","list","list_alt","live_help","live_tv","living","local_activity","local_airport","local_atm","local_bar","local_cafe","local_car_wash","local_convenience_store","local_dining","local_drink","local_fire_department","local_florist","local_gas_station","local_grocery_store","local_hospital","local_hotel","local_laundry_service","local_library","local_mall","local_movies","local_offer","local_parking","local_pharmacy","local_phone","local_pizza","local_play","local_police","local_post_office","local_printshop","local_see","local_shipping","local_taxi","location_city","location_disabled","location_off","location_on","location_searching","lock","lock_clock","lock_open","lock_person","lock_reset","login","logo_dev","logout","looks","looks_3","looks_4","looks_5","looks_6","looks_one","looks_two","loop","loupe","low_priority","loyalty","lte_mobiledata","lte_plus_mobiledata","luggage","lunch_dining","lyrics","macro_off","mail","mail_lock","mail_outline","male","man","man_2","man_3","man_4","manage_accounts","manage_history","manage_search","map","maps_home_work","maps_ugc","margin","mark_as_unread","mark_chat_read","mark_chat_unread","mark_email_read","mark_email_unread","mark_unread_chat_alt","markunread","markunread_mailbox","masks","maximize","media_bluetooth_off","media_bluetooth_on","mediation","medical_information","medical_services","medication","medication_liquid","meeting_room","memory","menu","menu_book","menu_open","merge","merge_type","message","mic","mic_external_off","mic_external_on","mic_none","mic_off","microwave","military_tech","minimize","minor_crash","miscellaneous_services","missed_video_call","mms","mobile_friendly","mobile_off","mobile_screen_share","mobiledata_off","mode","mode_comment","mode_edit","mode_edit_outline","mode_fan_off","mode_night","mode_of_travel","mode_standby","model_training","monetization_on","money","money_off","money_off_csred","monitor","monitor_heart","monitor_weight","monochrome_photos","mood","mood_bad","moped","more","more_horiz","more_time","more_vert","mosque","motion_photos_auto","motion_photos_off","motion_photos_on","motion_photos_pause","motion_photos_paused","mouse","move_down","move_to_inbox","move_up","movie","movie_creation","movie_filter","moving","mp","multiline_chart","multiple_stop","museum","music_note","music_off","music_video","my_location","nat","nature","nature_people","navigate_before","navigate_next","navigation","near_me","near_me_disabled","nearby_error","nearby_off","nest_cam_wired_stand","network_cell","network_check","network_locked","network_ping","network_wifi","network_wifi_1_bar","network_wifi_2_bar","network_wifi_3_bar","new_label","new_releases","newspaper","next_plan","next_week","nfc","night_shelter","nightlife","nightlight","nightlight_round","nights_stay","no_accounts","no_adult_content","no_backpack","no_cell","no_crash","no_drinks","no_encryption","no_encryption_gmailerrorred","no_flash","no_food","no_luggage","no_meals","no_meeting_room","no_photography","no_sim","no_stroller","no_transfer","noise_aware","noise_control_off","nordic_walking","north","north_east","north_west","not_accessible","not_interested","not_listed_location","not_started","note","note_add","note_alt","notes","notification_add","notification_important","notifications","notifications_active","notifications_none","notifications_off","notifications_paused","numbers","offline_bolt","offline_pin","offline_share","oil_barrel","on_device_training","ondemand_video","online_prediction","opacity","open_in_browser","open_in_full","open_in_new","open_in_new_off","open_with","other_houses","outbound","outbox","outdoor_grill","outlet","outlined_flag","output","padding","pages","pageview","paid","palette","pan_tool","pan_tool_alt","panorama","panorama_fish_eye","panorama_horizontal","panorama_horizontal_select","panorama_photosphere","panorama_photosphere_select","panorama_vertical","panorama_vertical_select","panorama_wide_angle","panorama_wide_angle_select","paragliding","park","party_mode","password","pattern","pause","pause_circle","pause_circle_filled","pause_circle_outline","pause_presentation","payment","payments","pedal_bike","pending","pending_actions","pentagon","people","people_alt","people_outline","percent","perm_camera_mic","perm_contact_calendar","perm_data_setting","perm_device_information","perm_identity","perm_media","perm_phone_msg","perm_scan_wifi","person","person_2","person_3","person_4","person_add","person_add_alt","person_add_alt_1","person_add_disabled","person_off","person_outline","person_pin","person_pin_circle","person_remove","person_remove_alt_1","person_search","personal_injury","personal_video","pest_control","pest_control_rodent","pets","phishing","phone","phone_android","phone_bluetooth_speaker","phone_callback","phone_disabled","phone_enabled","phone_forwarded","phone_iphone","phone_locked","phone_missed","phone_paused","phonelink","phonelink_erase","phonelink_lock","phonelink_off","phonelink_ring","phonelink_setup","photo","photo_album","photo_camera","photo_camera_back","photo_camera_front","photo_filter","photo_library","photo_size_select_actual","photo_size_select_large","photo_size_select_small","php","piano","piano_off","picture_as_pdf","picture_in_picture","picture_in_picture_alt","pie_chart","pie_chart_outline","pin","pin_drop","pin_end","pin_invoke","pinch","pivot_table_chart","pix","place","plagiarism","play_arrow","play_circle","play_circle_filled","play_circle_outline","play_disabled","play_for_work","play_lesson","playlist_add","playlist_add_check","playlist_add_check_circle","playlist_add_circle","playlist_play","playlist_remove","plumbing","plus_one","podcasts","point_of_sale","policy","poll","polyline","polymer","pool","portable_wifi_off","portrait","post_add","power","power_input","power_off","power_settings_new","precision_manufacturing","pregnant_woman","present_to_all","preview","price_change","price_check","print","print_disabled","priority_high","privacy_tip","private_connectivity","production_quantity_limits","propane","propane_tank","psychology","psychology_alt","public","public_off","publish","published_with_changes","punch_clock","push_pin","qr_code","qr_code_2","qr_code_scanner","query_builder","query_stats","question_answer","question_mark","queue","queue_music","queue_play_next","quickreply","quiz","r_mobiledata","radar","radio","radio_button_checked","radio_button_unchecked","railway_alert","ramen_dining","ramp_left","ramp_right","rate_review","raw_off","raw_on","read_more","real_estate_agent","receipt","receipt_long","recent_actors","recommend","record_voice_over","rectangle","recycling","redeem","redo","reduce_capacity","refresh","remember_me","remove","remove_circle","remove_circle_outline","remove_done","remove_from_queue","remove_moderator","remove_red_eye","remove_road","remove_shopping_cart","reorder","repartition","repeat","repeat_on","repeat_one","repeat_one_on","replay","replay_10","replay_30","replay_5","replay_circle_filled","reply","reply_all","report","report_gmailerrorred","report_off","report_problem","request_page","request_quote","reset_tv","restart_alt","restaurant","restaurant_menu","restore","restore_from_trash","restore_page","reviews","rice_bowl","ring_volume","rocket","rocket_launch","roller_shades","roller_shades_closed","roller_skating","roofing","room","room_preferences","room_service","rotate_90_degrees_ccw","rotate_90_degrees_cw","rotate_left","rotate_right","roundabout_left","roundabout_right","rounded_corner","route","router","rowing","rss_feed","rsvp","rtt","rule","rule_folder","run_circle","running_with_errors","rv_hookup","safety_check","safety_divider","sailing","sanitizer","satellite","satellite_alt","save","save_alt","save_as","saved_search","savings","scale","scanner","scatter_plot","schedule","schedule_send","schema","school","science","score","scoreboard","screen_lock_landscape","screen_lock_portrait","screen_lock_rotation","screen_rotation","screen_rotation_alt","screen_search_desktop","screen_share","screenshot","screenshot_monitor","scuba_diving","sd","sd_card","sd_card_alert","sd_storage","search","search_off","security","security_update","security_update_good","security_update_warning","segment","select_all","self_improvement","sell","send","send_and_archive","send_time_extension","send_to_mobile","sensor_door","sensor_occupied","sensor_window","sensors","sensors_off","sentiment_dissatisfied","sentiment_neutral","sentiment_satisfied","sentiment_satisfied_alt","sentiment_very_dissatisfied","sentiment_very_satisfied","set_meal","settings","settings_accessibility","settings_applications","settings_backup_restore","settings_bluetooth","settings_brightness","settings_cell","settings_ethernet","settings_input_antenna","settings_input_component","settings_input_composite","settings_input_hdmi","settings_input_svideo","settings_overscan","settings_phone","settings_power","settings_remote","settings_suggest","settings_system_daydream","settings_voice","severe_cold","shape_line","share","share_location","shield","shield_moon","shop","shop_2","shop_two","shopping_bag","shopping_basket","shopping_cart","shopping_cart_checkout","short_text","shortcut","show_chart","shower","shuffle","shuffle_on","shutter_speed","sick","sign_language","signal_cellular_0_bar","signal_cellular_4_bar","signal_cellular_alt","signal_cellular_alt_1_bar","signal_cellular_alt_2_bar","signal_cellular_connected_no_internet_0_bar","signal_cellular_connected_no_internet_4_bar","signal_cellular_no_sim","signal_cellular_nodata","signal_cellular_null","signal_cellular_off","signal_wifi_0_bar","signal_wifi_4_bar","signal_wifi_4_bar_lock","signal_wifi_bad","signal_wifi_connected_no_internet_4","signal_wifi_off","signal_wifi_statusbar_4_bar","signal_wifi_statusbar_connected_no_internet_4","signal_wifi_statusbar_null","signpost","sim_card","sim_card_alert","sim_card_download","single_bed","sip","skateboarding","skip_next","skip_previous","sledding","slideshow","slow_motion_video","smart_button","smart_display","smart_screen","smart_toy","smartphone","smoke_free","smoking_rooms","sms","sms_failed","snippet_folder","snooze","snowboarding","snowmobile","snowshoeing","soap","social_distance","solar_power","sort","sort_by_alpha","sos","soup_kitchen","source","south","south_america","south_east","south_west","spa","space_bar","space_dashboard","spatial_audio","spatial_audio_off","spatial_tracking","speaker","speaker_group","speaker_notes","speaker_notes_off","speaker_phone","speed","spellcheck","splitscreen","spoke","sports","sports_bar","sports_baseball","sports_basketball","sports_cricket","sports_esports","sports_football","sports_golf","sports_gymnastics","sports_handball","sports_hockey","sports_kabaddi","sports_martial_arts","sports_mma","sports_motorsports","sports_rugby","sports_score","sports_soccer","sports_tennis","sports_volleyball","square","square_foot","ssid_chart","stacked_bar_chart","stacked_line_chart","stadium","stairs","star","star_border","star_border_purple500","star_half","star_outline","star_purple500","star_rate","stars","start","stay_current_landscape","stay_current_portrait","stay_primary_landscape","stay_primary_portrait","sticky_note_2","stop","stop_circle","stop_screen_share","storage","store","store_mall_directory","storefront","storm","straight","straighten","stream","streetview","strikethrough_s","stroller","style","subdirectory_arrow_left","subdirectory_arrow_right","subject","subscript","subscriptions","subtitles","subtitles_off","subway","summarize","superscript","supervised_user_circle","supervisor_account","support","support_agent","surfing","surround_sound","swap_calls","swap_horiz","swap_horizontal_circle","swap_vert","swap_vertical_circle","swipe","swipe_down","swipe_down_alt","swipe_left","swipe_left_alt","swipe_right","swipe_right_alt","swipe_up","swipe_up_alt","swipe_vertical","switch_access_shortcut","switch_access_shortcut_add","switch_account","switch_camera","switch_left","switch_right","switch_video","synagogue","sync","sync_alt","sync_disabled","sync_lock","sync_problem","system_security_update","system_security_update_good","system_security_update_warning","system_update","system_update_alt","tab","tab_unselected","table_bar","table_chart","table_restaurant","table_rows","table_view","tablet","tablet_android","tablet_mac","tag","tag_faces","takeout_dining","tap_and_play","tapas","task","task_alt","taxi_alert","temple_buddhist","temple_hindu","terminal","terrain","text_decrease","text_fields","text_format","text_increase","text_rotate_up","text_rotate_vertical","text_rotation_angledown","text_rotation_angleup","text_rotation_down","text_rotation_none","text_snippet","textsms","texture","theater_comedy","theaters","thermostat","thermostat_auto","thumb_down","thumb_down_alt","thumb_down_off_alt","thumb_up","thumb_up_alt","thumb_up_off_alt","thumbs_up_down","thunderstorm","time_to_leave","timelapse","timeline","timer","timer_10","timer_10_select","timer_3","timer_3_select","timer_off","tips_and_updates","tire_repair","title","toc","today","toggle_off","toggle_on","token","toll","tonality","topic","tornado","touch_app","tour","toys","track_changes","traffic","train","tram","transcribe","transfer_within_a_station","transform","transgender","transit_enterexit","translate","travel_explore","trending_down","trending_flat","trending_up","trip_origin","troubleshoot","try","tsunami","tty","tune","tungsten","turn_left","turn_right","turn_sharp_left","turn_sharp_right","turn_slight_left","turn_slight_right","turned_in","turned_in_not","tv","tv_off","two_wheeler","type_specimen","u_turn_left","u_turn_right","umbrella","unarchive","undo","unfold_less","unfold_less_double","unfold_more","unfold_more_double","unpublished","unsubscribe","upcoming","update","update_disabled","upgrade","upload","upload_file","usb","usb_off","vaccines","vape_free","vaping_rooms","verified","verified_user","vertical_align_bottom","vertical_align_center","vertical_align_top","vertical_distribute","vertical_shades","vertical_shades_closed","vertical_split","vibration","video_call","video_camera_back","video_camera_front","video_chat","video_file","video_label","video_library","video_settings","video_stable","videocam","videocam_off","videogame_asset","videogame_asset_off","view_agenda","view_array","view_carousel","view_column","view_comfy","view_comfy_alt","view_compact","view_compact_alt","view_cozy","view_day","view_headline","view_in_ar","view_kanban","view_list","view_module","view_quilt","view_sidebar","view_stream","view_timeline","view_week","vignette","villa","visibility","visibility_off","voice_chat","voice_over_off","voicemail","volcano","volume_down","volume_mute","volume_off","volume_up","volunteer_activism","vpn_key","vpn_key_off","vpn_lock","vrpano","wallet","wallpaper","warehouse","warning","warning_amber","wash","watch","watch_later","watch_off","water","water_damage","water_drop","waterfall_chart","waves","waving_hand","wb_auto","wb_cloudy","wb_incandescent","wb_iridescent","wb_shade","wb_sunny","wb_twilight","wc","web","web_asset","web_asset_off","web_stories","webhook","weekend","west","whatshot","wheelchair_pickup","where_to_vote","widgets","width_full","width_normal","width_wide","wifi","wifi_1_bar","wifi_2_bar","wifi_calling","wifi_calling_3","wifi_channel","wifi_find","wifi_lock","wifi_off","wifi_password","wifi_protected_setup","wifi_tethering","wifi_tethering_error","wifi_tethering_off","wind_power","window","wine_bar","woman","woman_2","work","work_history","work_off","work_outline","workspace_premium","workspaces","wrap_text","wrong_location","wysiwyg","yard","youtube_searched_for","zoom_in","zoom_in_map","zoom_out","zoom_out_map","10k","10mp","11mp","123","12mp","13mp","14mp","15mp","16mp","17mp","18_up_rating","18mp","19mp","1k","1k_plus","1x_mobiledata","20mp","21mp","22mp","23mp","24mp","2k","2k_plus","2mp","30fps","30fps_select","360","3d_rotation","3g_mobiledata","3k","3k_plus","3mp","3p","4g_mobiledata","4g_plus_mobiledata","4k","4k_plus","4mp","5g","5k","5k_plus","5mp","6_ft_apart","60fps","60fps_select","6k","6k_plus","6mp","7k","7k_plus","7mp","8k","8k_plus","8mp","9k","9k_plus","9mp"],
  },
};
