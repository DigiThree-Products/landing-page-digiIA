'use client'

import { useEffect, useRef } from 'react'

/**
 * O RETRATO QUE OLHA PARA O CURSOR.
 *
 * UMA ESCADA SÓ, TIRADA DE UMA TOMADA SÓ. Esta é a decisão que governa o
 * arquivo inteiro, e ela veio de medição, não de gosto.
 *
 * O vídeo de origem (video-digiia.mp4, 1280×720, 24fps, 480 quadros) foi lido
 * inteiro, quadro a quadro. Para cada um estimou-se a pose por geometria — o
 * deslocamento horizontal entre o centro do cabelo e o centro da pele dá o
 * giro; a altura do centro da pele, limpa do termo em |giro|, mais a altura da
 * coroa, dá a inclinação. O mapa resultante das 480 poses não é um disco: é
 * uma CRUZ. Existe um braço horizontal cheio (406 quadros) e um braço vertical
 * curto no meio; as diagonais — girar E levantar ao mesmo tempo — estão
 * praticamente vazias.
 *
 * Pior: o braço vertical é inutilizável. Nas poses de olhar para baixo ela
 * está de OLHOS FECHADOS (a contagem de pixels de pupila cai de ~600 para ~0
 * entre os quadros 55 e 85) e nas de olhar para cima está semicerrando
 * (~270 contra ~650 no frontal). O material vertical não existe de fato.
 *
 * E as tomadas não se somam. Medida a distância visual entre quadros de
 * tomadas DIFERENTES no MESMO ângulo de giro: 4,2. Entre quadros vizinhos da
 * MESMA tomada: 0,8. Cinco vezes maior. Tentou-se normalizar — o peito muda 8%
 * de largura entre tomadas, então há mesmo uma diferença de escala — e um
 * registro imagem contra imagem, buscando escala e deslocamento, baixou o
 * resíduo de 6,4 para 4,6 e parou aí. O que sobra é pose e expressão, e isso
 * não se conserta com transformação. Emendar tomadas ERA a causa do movimento
 * picotado: cada emenda é um salto de 4 a 5 onde o passo normal é 0,8.
 *
 * Daí o desenho atual:
 *
 *   HORIZONTAL vem do sprite — 55 poses de uma virada contínua, quadros 84 a
 *   159 do vídeo, do frontal ao perfil fechado. Salto médio entre passos
 *   vizinhos 0,79, máximo 1,54, nenhuma fronteira. A versão anterior tinha 138
 *   quadros de cinco tomadas: salto 4,14 dentro das escadas e 25,26 nas
 *   emendas. Menos imagens, movimento dezesseis vezes mais liso no pior caso —
 *   porque fluidez vem de continuidade, não de quantidade.
 *
 *   VERTICAL vem do CSS. Não há pose de olhar para cima ou para baixo que
 *   preste, e mesmo que houvesse ela só serviria no eixo puro: um sprite não
 *   SOMA direções, e misturar "virada" com "erguida" dá dupla exposição, não
 *   uma terceira pose. Então a inclinação é contínua, com o ponto de giro
 *   embaixo do queixo para ler como aceno de cabeça e não como foto girando.
 *   Ver .olhar em styles/institutional.css.
 *
 * O QUE FARIA ISTO MELHORAR de verdade não é mais quadro na varredura que já
 * existe: é filmagem nova, uma volta completa do olhar cobrindo os ângulos
 * intermediários, e de olhos abertos.
 */

/** Grade do atlas — casada com o arquivo public/assets/digi-ia-olhar.webp. */
const COLUNAS = 10
const LINHAS = 5
const N_POSES = 50

/**
 * ELA SÓ VIRA PARA UM LADO no material: a varredura inteira gira para a
 * esquerda da imagem. O lado direito é a mesma escada espelhada.
 *
 * A TROCA DE ESPELHO É UM CORTE SECO, e isso foi decidido medindo.
 *
 * A primeira versão dissolvia entre os dois espelhos numa faixa em volta do
 * centro, pela mesma lógica que funciona entre degraus vizinhos. Deu fantasma
 * visível: no meio da tela apareciam dois rostos sobrepostos. A causa não era
 * a assimetria do rosto — era ENQUADRAMENTO. A cabeça estava 18px fora do eixo
 * do recorte, então o espelho a jogava 36px para o outro lado e a mistura
 * somava duas cabeças deslocadas. O recorte do atlas foi corrigido — buscando
 * o deslocamento que minimiza a distância do quadro frontal ao próprio
 * espelho, 18px, que baixou essa distância de 8,1 para 5,8 — e a dissolução
 * saiu.
 *
 * Com a cabeça centrada, o corte troca só detalhe fino — a mecha do cabelo
 * muda de lado —, e acontece exatamente onde a pose está mais frontal, que é
 * onde os dois lados mais se parecem. Uma dissolução ali seria pior: fantasma
 * permanente em vez de um pisca de um quadro.
 */
const ESPELHA_QUANDO_POSITIVO = true

/**
 * Zona morta em torno do centro, para o espelho não tremer.
 *
 * Sem ela, um cursor parado bem no meio com um tremor de um pixel viraria a
 * imagem do avesso várias vezes por segundo. Aqui o espelho só muda quando o
 * cursor passa do centro POR ESTA MARGEM, e mantém o lado anterior enquanto
 * não passar.
 */
const HISTERESE = 0.02

/** Intervalo mínimo entre duas leituras do cursor. */
const PASSO_MS = 16

/** Quantas poses convivem na pilha: os dois degraus vizinhos. */
const N_CAMADAS = 2

/** Posição do quadro dentro da grade, em porcentagem de background. */
function posicao(indice: number): string {
  const coluna = indice % COLUNAS
  const linha = Math.floor(indice / COLUNAS)
  return `${(coluna / (COLUNAS - 1)) * 100}% ${(linha / (LINHAS - 1)) * 100}%`
}

type Camada = { indice: number; espelha: boolean; opacidade: number }

/**
 * A POSE DEPENDE SÓ DO EIXO HORIZONTAL, e é isso que garante continuidade.
 *
 * A versão anterior escolhia por SETOR e RAIO: o ângulo do cursor decidia qual
 * das cinco escadas usar, a distância decidia o degrau. Com cinco escadas e
 * oito setores havia oito fronteiras onde a pose trocava de escada, e era
 * exatamente nelas que o movimento quebrava. Aqui não há fronteira nenhuma: o
 * cursor anda de um lado ao outro e o índice anda junto, monotônico.
 *
 * O expoente 0,85 adianta um pouco a virada — com resposta linear o rosto só
 * chegava ao perfil na borda da tela, e a maior parte do movimento útil ficava
 * espremida no fim do percurso.
 */
function camadas(hx: number, paraPositivo: boolean): Camada[] {
  const mag = Math.min(1, Math.abs(hx))
  const passo = Math.pow(mag, 0.85) * (N_POSES - 1)
  const chao = Math.floor(passo)
  const fr = passo - chao
  const espelha = paraPositivo === ESPELHA_QUANDO_POSITIVO

  const cantos: Camada[] = [{ indice: chao, espelha, opacidade: 1 - fr }]
  if (fr > 0.001) {
    cantos.push({ indice: Math.min(N_POSES - 1, chao + 1), espelha, opacidade: fr })
  }
  return cantos
}

/**
 * Converte PESOS em OPACIDADES EMPILHADAS.
 *
 * Camadas sobrepostas não somam: pintar cada uma com a opacidade do seu peso
 * daria uma mistura errada, com a de cima dominando. Para a pilha resultar na
 * média ponderada, cada camada recebe a sua fatia do que já foi acumulado
 * abaixo dela — a primeira é opaca e as seguintes valem
 * peso / (acumulado + peso).
 */
function empilha(cantos: Camada[]): Camada[] {
  let acumulado = 0
  return cantos.map((c, i) => {
    acumulado += c.opacidade
    return { ...c, opacidade: i === 0 ? 1 : c.opacidade / acumulado }
  })
}

/**
 * NÃO HÁ ESTADO DE REACT AQUI: o efeito escreve direto nos elementos. Manter
 * estado provocaria uma re-renderização por movimento do mouse, e mousemove é
 * o evento mais frequente que existe numa página.
 *
 * QUATRO CAMADAS, sempre montadas, nunca criadas nem destruídas. As sobrando
 * ficam com opacidade zero. Criar e remover nós a cada movimento seria muito
 * mais caro que manter quatro elementos parados.
 *
 * O CENTRO DO ELEMENTO É MEDIDO FORA DO mousemove. getBoundingClientRect()
 * força cálculo de layout, e chamá-lo a cada movimento faz o navegador
 * remontar a página dezenas de vezes por segundo. A medida sai uma vez e é
 * refeita só quando pode ter mudado — rolagem e redimensionamento. Precisa da
 * rolagem porque esta seção é uma estação presa: o Estacoes.tsx escala e
 * translada o palco enquanto ela chega, então o retrato anda na tela mesmo com
 * a página parada.
 *
 * SEM CURSOR NÃO HÁ EFEITO: em tela de toque e com prefers-reduced-motion ele
 * fica na pose frontal, parado, sem ouvinte nenhum pendurado.
 */
export function RetratoQueOlha() {
  const caixa = useRef<HTMLDivElement>(null)
  const camadasRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const el = caixa.current
    const nos = camadasRef.current.filter(Boolean) as HTMLSpanElement[]
    if (!el || nos.length !== N_CAMADAS) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let centroX = 0
    let centroY = 0
    /* MEDE O PAI, NUNCA O PRÓPRIO ELEMENTO, e isto conserta um laço de
       realimentação que deixava tudo errado.

       O elemento carrega a inclinação em perspectiva. Um retângulo com
       rotateX/rotateY tem bounding rect DIFERENTE do sem — então medir o
       próprio elemento é medir uma caixa que a inclinação acabou de mexer, e a
       inclinação vem da medida. Medido com o Playwright: com o cursor na
       altura EXATA do centro, onde a inclinação vertical deveria ser 0, o
       componente lia -0,106 — o centro estava uns 51px fora, e o erro variava
       junto com a inclinação.

       O pai (a célula .cf-anim) não tem inclinação própria, mas herda o
       transform da estação — que é justamente o que deve entrar na conta,
       porque ele move o retrato na tela de verdade. */
    const referencia = el.parentElement ?? el
    let ultimaMedida = 0
    const medir = () => {
      const r = referencia.getBoundingClientRect()
      centroX = r.left + r.width / 2
      centroY = r.top + r.height / 2
    }
    medir()

    let ultimoMs = 0
    /* De que lado o espelho está agora. Guardado entre um movimento e outro
       porque a troca tem histerese — ver HISTERESE lá em cima. */
    let paraPositivo = false

    const aoMover = (e: MouseEvent) => {
      if (e.timeStamp - ultimoMs < PASSO_MS) return
      ultimoMs = e.timeStamp

      /* Remede de vez em quando: fonte que carrega, imagem que chega, estação
         que se move sem rolagem. Uma leitura de layout a cada 250ms é
         desprezível; uma a cada movimento do mouse não seria. */
      if (e.timeStamp - ultimaMedida > 250) {
        ultimaMedida = e.timeStamp
        medir()
      }

      const vx = e.clientX - centroX
      const vy = e.clientY - centroY

      /* CADA EIXO É NORMALIZADO PELA SUA PRÓPRIA BORDA, e aqui isso é a conta
         certa — não o remendo que era antes.

         Na versão de setores havia um raio único, medido ao longo do raio até
         a borda, porque ângulo e distância eram duas grandezas do mesmo vetor.
         Aqui os dois eixos são INDEPENDENTES: o horizontal escolhe a pose, o
         vertical inclina. Um não interfere no outro, e cada um deve responder
         à borda que lhe diz respeito. */
      const hx = Math.max(
        -1,
        Math.min(1, vx / (vx < 0 ? centroX || 1 : window.innerWidth - centroX || 1)),
      )
      const hy = Math.max(
        -1,
        Math.min(1, vy / (vy < 0 ? centroY || 1 : window.innerHeight - centroY || 1)),
      )

      el.style.setProperty('--olha-x', hx.toFixed(3))
      el.style.setProperty('--olha-y', hy.toFixed(3))

      if (hx > HISTERESE) paraPositivo = true
      else if (hx < -HISTERESE) paraPositivo = false

      const pilha = empilha(camadas(hx, paraPositivo))
      for (let i = 0; i < N_CAMADAS; i++) {
        const no = nos[i]
        const c = pilha[i]
        if (!c) {
          no.style.opacity = '0'
          continue
        }
        no.style.opacity = c.opacidade.toFixed(3)
        no.style.backgroundPosition = posicao(c.indice)
        no.style.transform = c.espelha ? 'scaleX(-1)' : 'none'
      }
    }

    window.addEventListener('mousemove', aoMover, { passive: true })
    window.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('mousemove', aoMover)
      window.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
    }
  }, [])

  return (
    <div
      ref={caixa}
      className="olhar"
      role="img"
      aria-label="Rosto da Digi.IA acompanhando o cursor"
    >
      {Array.from({ length: N_CAMADAS }, (_, i) => (
        <span
          key={i}
          ref={(no) => {
            camadasRef.current[i] = no
          }}
          className="olhar__quadro"
          style={{ opacity: i === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
