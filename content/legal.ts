import { PUBLIC_ENV } from '@/config/env'

/** Dados legais centralizados; o build bloqueia marcadores não preenchidos. */
export const LEGAL = {
  updatedAt: '2026-08-04',
  updatedLabel: '4 de agosto de 2026',
  privacyPolicyVersion: '2026-08-04',
  controller: {
    legalName: PUBLIC_ENV.legalName || '[RAZÃO SOCIAL]',
    cnpj: PUBLIC_ENV.legalCnpj || '[CNPJ]',
    email: PUBLIC_ENV.legalEmail || '[E-MAIL DE CONTATO]',
    cityState: PUBLIC_ENV.legalCityState || '[CIDADE/UF]',
  },
} as const
