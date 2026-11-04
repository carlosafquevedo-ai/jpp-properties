# Checklist: dados a pedir à JPP Properties

O design e a estrutura da página inicial estão fechados. Antes do lançamento, tudo o que está abaixo tem de vir do cliente: hoje o site mostra textos provisórios ou **dados de exemplo** (marcados `TODO` no código). Nada disto pode ser inventado.

Legenda: **Obrigatório** = sem isto o site não pode ir para o ar. **Recomendado** = o site funciona, mas fica incompleto.

## 1. Dados de exemplo a substituir (obrigatório)

| O quê | Onde aparece | Hoje | Pedir ao cliente |
|---|---|---|---|
| Números de "Resultados" | Página inicial, secção Resultados | Números de exemplo (`resultStats`, `src/data/home.ts`) | Até 4 números reais com legenda (ex.: % do valor pedido alcançado, dias médios até vender, imóveis vendidos). Têm de ser verdadeiros e verificáveis. |
| "Vendidos recentemente" | Página inicial, por baixo dos Resultados | Imóveis à venda mostrados como vendidos (`demoSoldSlugs`) | Nada a pedir: a equipa marca os imóveis como vendidos no Sanity. Remover o modo de exemplo antes de lançar. |
| Avaliações Google | Página inicial, "O que dizem de nós" | 5 avaliações de exemplo | Acesso ao perfil Google da empresa (para obter o `place_id`) e uma conta Google Cloud com faturação ativa (o uso cabe na quota gratuita). |
| Equipa | Página inicial, "Conheça a equipa JPP" | Fotografia e nome de exemplo (`src/data/team.ts`) | Por cada consultor: nome, cargo, fotografia (retrato vertical, fundo neutro, alta resolução), telefone, WhatsApp e email profissionais, e autorização para publicar. |

## 2. Contactos e definições do site (obrigatório)

- [ ] **Horário de abertura** do escritório de Vilamoura (dias e horas). Hoje não aparece.
- [ ] **WhatsApp**: confirmar o número (hoje é o telemóvel principal, provisório).
- [ ] **Instagram**: endereço do perfil (hoje aponta para a página inicial do Instagram).
- [ ] Outras redes sociais a mostrar (Facebook, LinkedIn…), se existirem.
- [ ] Confirmar os 3 telefones e o tipo de cada um (rede móvel ou fixa), para a nota legal "(Chamada para rede … nacional)".
- [ ] Confirmar o email geral para contactos e o email que recebe os pedidos do formulário.
- [ ] **Domínio final** do site (hoje assumido `jppproperties.com`).

## 3. Textos a rever (recomendado)

Todos escritos por nós como proposta; o cliente tem de os aprovar ou corrigir:

- [ ] "Somos daqui": os dois parágrafos de apresentação.
- [ ] "Conheça a equipa": frase de apresentação.
- [ ] "Como trabalhamos": os passos descrevem um processo típico de agência, não factos confirmados da JPP.
- [ ] "Faça carreira connosco": frase e as 3 razões (formação, imóveis, escritório local).
- [ ] Formulário vender/comprar: títulos, textos e mensagens de envio.
- [ ] Títulos e descrições dos imóveis (traduções provisórias).
- [ ] Classe energética de cada imóvel (obrigatória por lei nos anúncios).

## 4. Traduções (obrigatório para EN e FR)

- [ ] Versões em **inglês** e **francês** de todos os textos acima, ou autorização para as prepararmos e o cliente rever.
- [ ] Confirmar os endereços (slugs) das páginas em EN e FR.

## 5. Fotografias e licenças (obrigatório)

- [ ] Licença ou crédito das 6 fotografias das zonas (Vilamoura, Quarteira, Vilasol, Vale do Lobo, Quinta do Lago, Loulé). Se não houver, o cliente envia fotografias próprias.
- [ ] Logótipos em ficheiro vetorial (SVG ou PDF), para confirmar as cores da marca.
- [ ] Uma fotografia da equipa ou do escritório para a secção de carreiras (opcional, hoje não tem foto).
- [ ] Página de carreiras, "Onde vai trabalhar": 3 fotografias dos escritórios em boa resolução (mínimo 1400 px de largura). Hoje há 2 pequenas e 1 provisória da marina.

## 6. Páginas legais (obrigatório)

- [ ] **Política de Privacidade** (o consentimento do formulário aponta para ela).
- [ ] Entidade de **Resolução Alternativa de Litígios** a indicar.
- [ ] Ligação ao **Livro de Reclamações** eletrónico.
- [ ] Dados da empresa para o rodapé: nome legal, NIF e licença AMI 9361 (confirmar).

## 7. Decisões pendentes

- [ ] "Destaques" (empreendimentos/campanhas): voltam noutro sítio ou ficam de fora?
- [ ] Com mais de um escritório, o painel "Fale connosco" e "Somos daqui" mostram o principal ou todos?
- [ ] Página de carreiras: há vagas abertas reais a mostrar? Se sim, quais (função, regime, local); hoje a página não lista vagas.
- [ ] Página de carreiras (`/carreiras/`): confirmar os textos (vantagens, perfil, "Bom saber", os 3 passos da candidatura e as respostas das perguntas frequentes, sobretudo **licença** e **remuneração**), o email que recebe as candidaturas, um testemunho real de um consultor (com autorização) e, se houver, fotos da equipa ou do escritório por dentro.
