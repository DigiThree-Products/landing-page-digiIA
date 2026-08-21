import { LANDING } from '@/content/landing'

const S = LANDING.features.cria.saida

/**
 * A anatomia da peça pronta.
 *
 * Substituiu o post fictício que vivia aqui. O card precisa de uma superfície
 * de saída — a tela é o argumento —, e a saída honesta de um produto que ainda
 * não tem cliente autorizado na página não é uma marca inventada: é a forma do
 * que ele entrega.
 *
 * PERDEU UMA INTERAÇÃO no caminho, e isso foi decidido, não esquecido. Os chips
 * trocavam a legenda do post e eram controle de verdade. Sem exemplo não há
 * legenda para trocar, e chip que não muda nada é pior que chip nenhum — era
 * justamente esse o defeito que a versão anterior tinha corrigido. A única
 * interação da seção passa a ser o controle de ROI do card CALCULA.
 *
 * <dl> e não <ul>: cada campo é um par rótulo/valor, que é o que uma lista de
 * definição descreve. Leitor de tela anuncia os dois juntos; numa lista comum
 * anunciaria seis frases soltas.
 */
export function PecaPronta() {
  return (
    <div className="peca">
      <dl className="peca__campos">
        {S.campos.map((campo) => (
          <div key={campo.rotulo}>
            <dt>{campo.rotulo}</dt>
            <dd>{campo.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
