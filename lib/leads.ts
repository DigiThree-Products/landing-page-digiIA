import { PRODUCT_CONFIG, cadastroConfigurado } from '@/config/product'
import { LEGAL } from '@/content/legal'

export type Lead = {
  email: string
  nome: string | null
  whatsapp: string | null
  tipo_negocio: string | null
  origem: string
  consentimento_em: string
  politica_privacidade_versao: string
}

export function montarLead(dados: Record<string, string>, origem: string): Lead {
  return {
    email: dados.email.trim(),
    nome: dados.nome?.trim() || null,
    whatsapp: dados.whatsapp?.trim() || null,
    tipo_negocio: dados.tipo_negocio?.trim() || null,
    origem,
    consentimento_em: new Date().toISOString(),
    politica_privacidade_versao: LEGAL.privacyPolicyVersion,
  }
}

export async function enviarLead(lead: Lead): Promise<void> {
  if (!cadastroConfigurado()) throw new Error('cadastro_nao_configurado')

  const { url, anonKey } = PRODUCT_CONFIG.supabase
  const resposta = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(lead),
  })

  if (!resposta.ok && resposta.status !== 409) {
    throw new Error(`resposta ${resposta.status}`)
  }
}
