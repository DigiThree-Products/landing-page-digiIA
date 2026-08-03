<#
    injetar-cerebro.ps1

    Copia as tres camadas do objeto do hero — fundo, mao e cerebro — de um
    arquivo HTML de origem para dentro do index.html.

    Existe porque as imagens sao WebP embutidos em base64 (~190 KB somados) e
    nao da para digita-los a mao com seguranca. O index.html nasce com um SVG
    vazio de 1600x1195 em cada camada, que so reserva a proporcao da caixa;
    este script troca os tres pelo que vale.

    Rodar de novo e seguro: ele sempre substitui o src atual, seja o
    placeholder, seja uma versao anterior das imagens.

    Uso:
      powershell -ExecutionPolicy Bypass -File tools\injetar-cerebro.ps1
      powershell -ExecutionPolicy Bypass -File tools\injetar-cerebro.ps1 -Origem "caminho\outro.html"
#>

param(
  [string]$Origem  = "$PSScriptRoot\..\material\cerebro.html",
  [string]$Destino = "$PSScriptRoot\..\index.html"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Origem))  { throw "Origem nao encontrada: $Origem" }
if (-not (Test-Path $Destino)) { throw "index.html nao encontrado: $Destino" }

# UTF-8 sem BOM, que e como o index.html esta gravado.
$enc  = New-Object System.Text.UTF8Encoding($false)
$src  = [System.IO.File]::ReadAllText((Resolve-Path $Origem),  $enc)
$alvo = [System.IO.File]::ReadAllText((Resolve-Path $Destino), $enc)

$q = [char]34   # aspas duplas, para o padrao nao virar sopa de escape

# Cada camada: como ela se chama na origem (classe CSS) e no destino
# (atributo data-camada).
$camadas = @(
  @{ nome = 'fundo';   marca = 'ci__camada--fundo'   },
  @{ nome = 'mao';     marca = 'ci__camada--mao'     },
  @{ nome = 'cerebro'; marca = 'ci__camada--cerebro' }
)

$total = 0

foreach ($c in $camadas) {

  # 1. Acha a imagem na origem: a tag <img> que carrega a classe da camada e,
  #    dentro dela, o src com o data URI.
  $padraoOrigem = '<img[^>]*' + $c.marca + '[^>]*?src=' + $q +
                  '(data:image/[a-z]+;base64,[^' + $q + ']+)' + $q
  $achado = [regex]::Match($src, $padraoOrigem)
  if (-not $achado.Success) {
    throw "Nao achei a camada '$($c.nome)' (classe $($c.marca)) em $Origem"
  }
  $dataUri = $achado.Groups[1].Value

  # 2. Acha o src correspondente no destino. O atributo data-camada vem antes
  #    do src, com uma quebra de linha no meio.
  $padraoDestino = '(data-camada=' + $q + $c.nome + $q + '[\s\S]{0,300}?src=' + $q +
                   ')([^' + $q + ']*)(' + $q + ')'
  $lugar = [regex]::Match($alvo, $padraoDestino)
  if (-not $lugar.Success) {
    throw "Nao achei data-camada=${q}$($c.nome)${q} em $Destino"
  }

  # 3. Troca so o miolo do src, por indice — nada de Replace, para o base64
  #    nunca ser lido como padrao de substituicao.
  $g = $lugar.Groups[2]
  $alvo = $alvo.Substring(0, $g.Index) + $dataUri + $alvo.Substring($g.Index + $g.Length)

  $kb = [math]::Round($dataUri.Length / 1kb, 1)
  $total += $kb
  Write-Host ("  {0,-8} {1,7} KB" -f $c.nome, $kb)
}

[System.IO.File]::WriteAllText((Resolve-Path $Destino), $alvo, $enc)

$final = [math]::Round((Get-Item $Destino).Length / 1kb)
Write-Host ""
Write-Host "Tres camadas injetadas ($total KB de base64)."
Write-Host "index.html agora tem $final KB."
