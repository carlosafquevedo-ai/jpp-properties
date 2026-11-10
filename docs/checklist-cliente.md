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
- [ ] Fotografia de Carvoeiro (zona nova; hoje mostra a fachada do Primelife) e confirmar a frase da zona: "Aldeia à beira-mar no concelho de Lagoa, entre falésias e praias."
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

## 8. Imóveis importados: dados em falta (obrigatório antes do lançamento)

Os 23 imóveis vieram do site atual. O site novo esconde o que falta (nunca mostra 0), mas a ficha fica incompleta. Para cada imóvel, o que pedir:

- [ ] **T2 Marina** (625 000 €): classe energética, área útil, quartos, casas de banho, ano de construção.
- [ ] **Apartamento T2 em Vilamoura vista golfe** (1 050 000 €): classe energética, área útil.
- [ ] **Moradia 3 Quartos** (900 000 €): área útil, ano de construção.
- [ ] **Excelente moradia V4** (2 100 000 €): classe energética, ano de construção.
- [ ] **Terreno Rústico com 6.000 m² | Vista Panorâmica Desafogada | Franqueada  São Sebastião  Loulé** (60 000 €): classe energética, área útil.
- [ ] **Apartamento T1 Novo com Estacionamento  a minutos da Praia** (325 000 €): área útil.
- [ ] **Apartamento T2 Novo com Vista Mar  Piscina e Garagem | Forte Novo  Quarteira** (1 255 000 €): classe energética.
- [ ] **Luxo  Conforto e Qualidade em Vilamoura** (760 000 €): classe energética, área útil.
- [ ] **Apartamento T2 no Primelife  Carvoeiro** (575 000 €): classe energética, área útil.
- [ ] **Apartamento T3 no Primelife  Carvoeiro** (665 000 €): classe energética, área útil.
- [ ] **Apartamento T2 no Primelife  Carvoeiro** (525 000 €): classe energética, área útil.
- [ ] **Apartamento T2 nas Casuarinas  Vilamoura** (815 000 €): classe energética, área útil.
- [ ] **Moradia em banda nas Casuarinas  Vilamoura** (1 400 000 €): classe energética, área útil.
- [ ] **Apartamento no The Court  Carvoeiro** (385 000 €): classe energética, área útil, quartos.
- [ ] **Apartamento no The Court  Carvoeiro** (285 000 €): classe energética, área útil, quartos.
- [ ] **Apartamento T2 no The Court  Carvoeiro** (595 000 €): classe energética, área útil.
- [ ] **Moradia isolada em Querença** (1 150 000 €): classe energética.
- [ ] **Apartamento T2 à venda na Marina** (560 000 €): ano de construção.
- [ ] **Moradia em banda V3** (1 275 000 €): classe energética, ano de construção.
- [ ] **Moradia em Vilamoura** (1 100 000 €): classe energética, área útil.
- [ ] **Moradias para Recuperar com Projeto de Turismo Rural** (360 000 €): classe energética, área útil, ano de construção.

- [ ] Os dois "Apartamento T2 no Primelife, Carvoeiro" e os dois "Apartamento no The Court, Carvoeiro" têm o mesmo título: o que os distingue (piso, vista, fração)? E a tipologia dos dois do The Court.
- [ ] Confirmar os títulos novos dos empreendimentos (no site antigo eram iguais entre unidades): Casuarinas, Primelife e The Court.
