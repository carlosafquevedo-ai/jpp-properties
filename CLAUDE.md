# CLAUDE.md — JPP Properties

Website da JPP Properties (AMI 9361), agência imobiliária no Algarve. Esta é a fonte de verdade para convenções do projeto.

## Stack

- Astro (output estático), TypeScript estrito, Tailwind CSS
- Sanity (plano Free) como CMS; Studio em `studio/` (português)
- Cloudflare Pages (plano Free); formulários via Pages Functions + Turnstile + Resend
- Gestor de pacotes: **pnpm**

## Idiomas

- Português na raiz, inglês em `/en/`, francês em `/fr/`.
- Slugs traduzidos: tabela central em `src/i18n/routes.ts`. Seletor de idioma e `hreflang` usam-na.
- Textos fixos da interface em `src/i18n/ui/{pt,en,fr}.json`.
- Todo o texto visível existe nos 3 idiomas, ou fica marcado `TODO` de tradução.

## Convenções

- Código, nomes de variáveis, comentários e commits em **inglês**. Documentação e conteúdo do site em português/EN/FR.
- Commits pequenos e descritivos; uma branch por tarefa; PR com descrição do que mudou e como testar.
- Nunca fazer commit direto na `main` (exceto o commit base inicial).
- Antes de mudanças grandes (estrutura, schemas, dependências novas), propor o plano e esperar aprovação.
- Não adicionar serviços pagos nem dependências que exijam plano pago.
- Não inventar dados do cliente (preços, imóveis, testemunhos, equipa). Valores provisórios ficam marcados `TODO`.

## Repositório público — regras de segurança

- Nenhuma chave, token ou palavra-passe no código. Chaves (Resend, Turnstile secret, tokens Sanity) só em variáveis de ambiente da Cloudflare ou `.env` local.
- `.env*` está no `.gitignore`; `.env.example` só contém nomes.
- Podem ser públicos: `projectId` e dataset do Sanity, Turnstile site key.
- Nunca guardar dados pessoais (leads, contactos) no Sanity: o dataset é público.
- Relatórios de migração e backups ficam fora do Git (`migration-output/`, `backups/`).

## Design (provisório)

- Imobiliária premium, limpa e luminosa, mobile-first, fotografia em destaque.
- **O fundo base de todas as secções é branco** (`paper`). `paper-2` (névoa) só para apoio: filtros, etiquetas, campos.
- Paleta em `src/styles/global.css` (ver `/paleta/`): **carvão** (`forest`, `#1b1e1c`, o único escuro: cabeçalho, botões escuros, pesquisa, banda das zonas), marfim (`paper-2`), linha, tinta, cinza quente e o **verde da marca** (lima `#9EBC3A` e oliva): destaques e botões principais (hero, cabeçalho sobre a fotografia), etiquetas, pontos e barras; linhas finas em branco translúcido sobre o carvão (sem bege/champanhe). Evitar misturar novos tons: usar sempre estes tokens.
- **Globo "Somos daqui"** (`src/scripts/pt-globe.ts`): Portugal é **uma forma sólida** (contorno suavizado do desenho) na rampa "feto" só com verdes da escala, do oliva profundo no norte (`--g-800`) ao lima brilhante no Algarve, com um reflexo de vidro e a **costa num filete de luz**. Por cima, uma **rede de luz** discreta: nós pequenos espalhados (fixos, não são cidades reais) ligados por filetes, e o escritório como centro, com linhas mais claras. Desenha-se do Algarve para norte ao aparecer. Os pontos (matriz de bolinhas) e a tangerina foram testados e rejeitados.
- **Títulos com um só tamanho**: o título do hero, o de "Conheça a equipa" e o nome da zona no slider usam `--h-display` (`global.css`). Todos os títulos principais ficam com este tamanho, salvo indicação em contrário. Um subtítulo por cima de um título é uma linha leve, sem negrito (ex.: "Explore por zona").
- Lima só em fundos (botões, etiquetas) com texto escuro; nunca como texto sobre branco (contraste 2,2:1).
- **Cabeçalho** (bloco "Header: the zones night", no fim de `global.css`): a barra (e o menu do telemóvel) tem a atmosfera de "Explore por zona": oliva quase negro com brilhos verdes suaves, grão e o horizonte de luz lima no rebordo de baixo. Por cima da fotografia do hero, no topo da página, continua vidro transparente.
- **Superfície verde** (fim de `global.css`): os botões verdes e as etiquetas usam `--green-surface` (verde-lima escuro `#2e3f12` → `#4b6a1a` → lima, com faixa de luz lima-pálida e grão), sempre com texto branco. O oliva passou a `#4b6a1a`. Detalhes finos (linhas, pontos, barra do preço) ficam em lima simples. O botão "Contactar" do header é branco com texto carvão e o quadrado da seta na superfície verde (lima ao passar o rato).
- Uma única largura de página: `--page-w` e `--gutter` em `global.css`; usar sempre `.container-x`.
- **Ritmo da página** (bloco "Page rhythm", no fim de `global.css`):
  - **Identidade visual** (bloco "Visual identity", no fim de `global.css`): momentos fortes em **fotografia escura** (hero), em **colunas verdes** ("Faça carreira connosco": painel branco que passa, para a direita, a **vidro canelado**: canas largas e iguais com sombreado suave e juntas em filete, sobre oliva profundo iluminado por um brilho lima suave, com grão; sem riscas saturadas; painel baixo em duas colunas: título, frase e botão à esquerda no branco; à direita, sobre as colunas, uma folha de vidro com 3 razões (ícone lima + uma linha, separadas por filetes; texto provisório `TODO` a confirmar com o cliente); no telemóvel as colunas sobem de baixo) e em **verde atmosférico** (faixas "Explore por zona" e "Conheça a equipa": foto de Vilasol muito desfocada e tonalizada para os verdes da marca, com grão; texto branco e cartões a flutuar por cima). Superfícies calmas: branco, e **névoa verde-sálvia** (`--mist`, que é o `--band-bg`) nas faixas de apoio; nunca bege nem verde-lima. Rodapé em oliva profundo (`--g-900`).
  - **Efeitos de luz** (bloco "Light effects", no fim de `global.css`): uma só família, feita de verdes da escala e luz vertical fina, discreta e sem movimento contínuo. Hero: o vidro do cartão de imóveis é vidro verde transparente (não névoa cinzenta), com um rebordo de luz que brilha no canto superior esquerdo e uma luz lima suave a subir do fundo (`hero-deck-panel.ts`). Carreiras: vidro canelado sobre luz verde. "Explore por zona": horizonte de luz lima no fundo do painel (`.zx-beam`). "Conheça a equipa": fita de lâminas finas em onda atrás do título (`FlutedWave.astro`, só desktop). "Quer vender": linhas finas a subir como uma curva de valor por baixo dos passos (`.lead-rise`, só desktop; crescem uma vez ao aparecer). Os feixes diagonais e o meio-tom foram postos de parte (ruído, fora da paleta).
  - **Um só verde**: todos os verdes saem da escala `--g-950` … `--g-50` (bloco "One green", no fim de `global.css`), a mesma do cabeçalho e dos botões. Fotografias tingidas (atmosfera) recebem o tom com uma mistura "color" do oliva `--g-500`, nunca com filtros de matiz.
  - **Um só cartão**: folha branca com aresta fina (`--sheet-edge`) e sombra suave e longa (`--sheet-shadow`). Um só acento: lima só em pormenores (pontos, linhas, agulha, pílulas); os botões ficam na superfície verde. Etiquetas sobre fotos: pílula de vidro escuro com ponto lima.
  - Espaço entre secções: `--section-gap`. Espaço interior das faixas: `--band-pad`. Não usar margens avulsas.
  - Cantos: **retos** quando o bloco toca a borda do ecrã ou é uma foto em grelha (imóveis, equipa). Exceções: as faixas das zonas e as fotos dos vendidos são redondas, e a hero tem os cantos de baixo redondos (`--hero-r`, como na MeewVision). **Redondos** em tudo o que flutua dentro da página: `--r-panel` (24px), `--r-card` (12px), `--r-sm` (8px). Um raio interior é o exterior menos o recuo.
- `TODO`: confirmar cores com o cliente quando chegarem os logótipos.

## Pesquisa e painel Sanity: requisitos a não esquecer

A pesquisa (hero e listagem) é dirigida por dados. Ao construir o Sanity (fase 3), cumprir:

- **Zona e Tipo de imóvel**: documentos próprios (`zone`, `propertyType`) editáveis pela equipa, com nome em PT/EN/FR e ordem. Nos imóveis escolhem-se por **referência** (lista), nunca por texto livre. Um item novo aparece em todas as listas na publicação seguinte.
- **Zona sem imóveis**: campo "Mostrar na pesquisa" para a equipa decidir se aparece.
- **Apagar zona/tipo em uso**: bloqueado enquanto houver imóveis associados.
- **Quartos**: opções geradas a partir do máximo de quartos dos imóveis publicados (`getSearchOptions`).
- **Preço máximo (barra)**: os extremos são **exatamente** o imóvel publicado mais barato e o mais caro (`getPriceRange`): nunca fica abaixo nem acima. Abre sempre no **ponto médio** entre os dois. Ignorar imóveis "preço sob consulta" e os vendidos/arrendados. O campo `price` leva texto de ajuda a dizer que o preço mais alto e o mais baixo definem os limites da barra, e um aviso de validação para valores muito altos (erro de zeros).
- Cada campo do Studio com uma frase de ajuda em português; menu: Imóveis, Zonas, Tipos de imóvel, Páginas, Testemunhos, Equipa, Definições do site.

## Definições do site (Sanity): contactos do header

O header (e a faixa "Visite-nos", o menu do telemóvel e a página de contactos) lê tudo de `siteSettings`; nada fica escrito à mão no código. O painel tem de pedir, como **obrigatórios**:

- **Escritórios**: nome, morada e **telefones** (número + tipo "rede móvel" ou "rede fixa", para a nota legal "(Chamada para rede ... nacional)"). O botão de pontos (grelha 3×3) do header abre o painel "Fale connosco": morada, email, telefones, horário e redes. `TODO`: horário de abertura (`openingHours` em `src/lib/site.ts`), a pedir ao cliente; no Sanity, campo próprio em `siteSettings`.
- **WhatsApp** (número, formato internacional) e **Instagram** (endereço do perfil). O Instagram aparece no header se estiver preenchido; o WhatsApp está no widget flutuante e no menu móvel (não no header).
- Validação do formato dos números e dos endereços, com frase de ajuda em português em cada campo.
- `TODO` no protótipo: o WhatsApp é provisório (telemóvel principal) e o Instagram aponta para a página inicial do Instagram até haver o perfil real.

## Página inicial: destaques e imagens do topo (decisão: lista ordenada)

Decidido com o cliente: a equipa escolhe os imóveis numa **lista ordenada na Página inicial** (Sanity: Páginas → Página inicial), e não com um visto em cada imóvel.

- **Imóveis em destaque**: lista de referências a imóveis, pesquisável por nome ou referência, **arrastar para ordenar**, máximo 8 (duas linhas completas de 4 cartões). A ordem da lista é a ordem no site.
- **Imagens do topo** (hero): lista igual, máximo 3 imóveis; cada imagem do hero é sempre um imóvel com o seu cartão (não há imagem solta). A foto genérica só aparece se nenhum imóvel da lista estiver disponível.
- Regras de segurança (já no código, `src/lib/catalog.ts`): imóvel **vendido** sai sozinho das listas; referência inexistente é ignorada; se não sobrar nenhum, mostram-se os **mais recentes** (a secção nunca fica vazia).
- Studio: frase de ajuda em cada lista ("Escolha até 8 imóveis. Arraste para mudar a ordem."), validação do máximo, e bloquear/avisar ao apagar um imóvel que esteja numa lista.
- Os dados de protótipo estão em `src/data/home.ts`, com a mesma forma do documento Sanity.

## "Explore por zona" (slider)

Secção `src/components/ZoneExplorer.astro` + `src/scripts/zone-explorer.ts`: a foto da zona ativa ocupa o painel **muito desfocada e tonalizada para o oliva** (atmosfera, não uma segunda foto), com nome, frase, "Ver imóveis" e os controlos (setas, progresso, contador) à esquerda. Estilo inspirado na secção de serviços do portfólio do Carlos: fundo oliva quase negro com brilhos verdes suaves (a foto da zona muito desfocada por baixo), subtítulo "— Explore por zona". À direita, **todas as zonas em cartões iguais**, que saem pela borda e deslizam de lado; **o cartão da zona escolhida passa sempre para primeiro** e as zonas seguintes vêm atrás, em círculo: foto com véu oliva, ícone de pino em vidro no canto, nome e número de imóveis em baixo; o cartão da zona ativa fica a cores, com aresta lima e a seta verde. Clicar num cartão mostra essa zona; clicar no cartão ativo (tem uma seta lima) abre os imóveis da zona. Também mudam a zona as setas, as teclas ← → e deslizar o dedo no painel; nenhum cartão sai da fila. Temporizador de 7 s visível na linha de progresso por segmentos (em pausa com o rato/foco dentro ou fora do ecrã); para de vez quando o visitante escolhe uma zona. Quando a fila não cabe, desliza de lado com as pontas esbatidas. Sem JS mostra a primeira zona e os cartões são ligações.

## "Destaques" (removidos da página inicial)

Decidido com o cliente: o painel de destaques (imagem + texto + ligação para empreendimentos/campanhas) **saiu da página inicial**. Os dados de protótipo continuam em `src/data/home.ts` (`sideHighlights`), sem uso. `TODO`: decidir se volta noutro sítio; se não, não criar a lista "Destaques laterais" no Sanity e apagar `sideHighlights`.

## Resultados (página inicial)

Secção `src/components/Results.astro` (entre as avaliações Google e "Como trabalhamos"): até 4 números grandes com uma legenda curta (ex.: "98%" / "Média do valor pedido alcançado"), numa linha sem cartões, e por baixo **"Vendidos recentemente"**: os 4 imóveis de venda mais recentes com estado "vendido" (foto, selo "Vendido", nome e zona, sem preço). Atualiza-se sozinha quando a equipa marca um imóvel como vendido; sem vendidos, essa linha desaparece.

- `TODO` obrigatório: enquanto não houver vendidos, o protótipo mostra imóveis à venda como exemplo (`demoSoldSlugs` em `src/data/home.ts`); remover antes do lançamento.

- Sanity (Página inicial): lista "Resultados", máximo 4, arrastar para ordenar. Cada item: **valor** (ex.: "98", "4,2"), **unidade** opcional (ex.: "%", "M€", "dias") e **legenda**, com frase de ajuda em português. Lista vazia: a secção desaparece.
- `TODO` obrigatório: os números atuais em `src/data/home.ts` (`resultStats`) são **de exemplo**, não são dados da JPP. Pedir os valores reais ao cliente antes do lançamento; versões EN/FR.

## Faixa "Visite-nos" (antes do rodapé)

Secção `src/components/ContactBand.astro`, mostrada em **todas as páginas exceto a inicial** pelo `SiteLayout`, logo antes do rodapé (desligar com `contactBand={false}`). Na página inicial seria redundante: o telefone principal (com a nota legal) e o email estão em "Somos daqui", por baixo dos botões "Ligar" / "Ver no mapa" (lista `.about-contacts`, lida de `siteSettings`), e a morada no cartão do globo, sem painel nem fotografia: título com os botões "Ligar agora" e "WhatsApp" ao lado, e por baixo morada (com "Como chegar", que abre o Google Maps), telefones (com a nota legal), email e horário numa linha separada por filetes.

- Lê tudo de `siteSettings` (hoje `src/lib/site.ts`): nada escrito à mão. O horário só aparece quando estiver preenchido (`TODO` acima).
- O rodapé já não repete morada, telefones e email: fica com marca, navegação, links legais (Política de Privacidade, Resolução de Litígios, Livro de Reclamações), redes sociais e AMI.
- Sem mapa embutido: um iframe do Google Maps criaria cookies antes do consentimento.
- `TODO`: textos provisórios em PT; versões EN/FR. Com mais de um escritório, decidir se a faixa mostra o principal ou todos.

## Entrada do site (cortina)

`src/components/SiteIntro.astro` (no `SiteLayout`): quando alguém **abre** o site (endereço escrito, favorito, link partilhado, pesquisa), uma cortina oliva profundo com o grão do cabeçalho mostra "JPP Properties" no tipo do rodapé (as letras sobem e um feixe lima deixa-as brancas) e saudações por baixo (Olá, Hello, Bonjour, "Imóveis no Algarve"); depois sobe e revela a página (~3,3 s; clique ou tecla salta). **Não aparece** ao mudar de página dentro do site, ao recarregar nem com retroceder/avançar. Sem JS não há cortina; com movimento reduzido, só um fade curto. `TODO`: versões EN/FR da última frase.

## Formulário de pedido (vender / comprar)

- Componente `src/components/LeadForm.astro` (secção `#vender` da página inicial): dois separadores, **vender** (à vista só o essencial: concelho, código postal, morada, nº da porta, tipo e área útil; o resto, quartos, casas de banho, terreno, ano, estado, características e preço, fica dobrado em "Acrescentar detalhes", opcional) e **comprar** (zonas, tipos, quartos mínimos, orçamento, financiamento).
- Envio para o email da equipa: Pages Function `functions/api/lead.ts` (Resend). Nada é guardado (nem no Sanity nem no Git).
- Variáveis de ambiente (só nomes em `.env.example`): `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` (domínio verificado no Resend), `TURNSTILE_SECRET_KEY` e `PUBLIC_TURNSTILE_SITE_KEY`.
- `TODO`: textos provisórios em PT; versões EN/FR; página de Política de Privacidade (o consentimento aponta para `/politica-de-privacidade/`).

## Avaliações Google (página inicial)

- Secção `src/components/GoogleReviews.astro` (entre a equipa e o formulário de venda). Nada é inventado: nota, total e avaliações vêm de `/api/reviews`.
- Pages Function `functions/api/reviews.ts` (Google Places API, "New"): devolve nota, total e até 5 avaliações (limite da API). Cache de 1 hora na Cloudflare (os termos do Google limitam o tempo de cache); mostrar sempre o nome do autor com ligação.
- Variáveis de ambiente (só nomes em `.env.example`): `GOOGLE_PLACES_API_KEY` (chave restrita à Places API) e `GOOGLE_PLACE_ID`. Enquanto não houver chave, a secção mostra 5 avaliações DE EXEMPLO (`demoReviews` no componente, sem aviso no ecrã; `TODO` obrigatório: remover antes do lançamento) para pré-visualização com o cliente. Se a API falhar com a chave já definida, o mesmo acontece; antes de lançar, tirar o modo de exemplo para mostrar só o título e o botão "Ver todas no Google" (`googleProfileUrl` em `src/lib/site.ts`).
- `TODO`: criar a chave no Google Cloud (faturação ativa; uso pequeno cabe na quota gratuita), obter o `place_id` do perfil e definir as duas variáveis na Cloudflare Pages.

## Dados a pedir ao cliente

Lista completa do que falta (dados de exemplo, contactos, textos, traduções, fotografias, páginas legais) em `docs/checklist-cliente.md`.

## Fases

1. Setup · 2. Protótipo de design (aprovação do cliente) · 3. Sanity · 4. Integração · 5. Formulários · 6. Migração · 7. SEO · 8. Segurança e QA · 9. Lançamento · 10. Entrega.
