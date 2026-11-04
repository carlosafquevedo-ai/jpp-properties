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
- **Globo "Somos daqui"** (`src/scripts/pt-globe.ts`): Portugal é **uma forma sólida** (contorno suavizado do desenho) na rampa "feto" só com verdes da escala, do oliva profundo no norte (`--g-800`) ao lima brilhante no Algarve, com um reflexo de vidro e a **costa num filete de luz**. Por cima, uma **rede de luz** discreta: nós pequenos espalhados (fixos, não são cidades reais) ligados por filetes, e o escritório como centro, com linhas mais claras. Desenha-se do Algarve para norte ao aparecer. No telemóvel e no tablet a secção "Somos daqui" começa pelo globo (título, globo com o cartão do escritório, texto, botões e email; bloco "Somos daqui on phones and tablets" no fim de `global.css`); no desktop texto e globo ficam lado a lado. Os pontos (matriz de bolinhas) e a tangerina foram testados e rejeitados.
- **Títulos com um só tamanho**: o título do hero, o de "Conheça a equipa" e o nome da zona no slider usam `--h-display` (`global.css`). Todos os títulos principais ficam com este tamanho, salvo indicação em contrário. Um subtítulo por cima de um título é uma linha leve, sem negrito (ex.: "Explore por zona").
- Lima só em fundos (botões, etiquetas) com texto escuro; nunca como texto sobre branco (contraste 2,2:1).
- **Cabeçalho** (bloco "Header: the zones night", no fim de `global.css`): a barra (e o menu do telemóvel) tem a atmosfera de "Explore por zona": oliva quase negro com brilhos verdes suaves, grão e o horizonte de luz lima no rebordo de baixo. Na página inicial fica em **vidro transparente enquanto estiver por cima do hero** e só passa ao verde depois de o hero passar por baixo da barra (`data-past-hero`, `SiteHeader.astro`); o menu do telemóvel e do tablet abre no mesmo vidro enquanto estiver sobre o hero. Nas outras páginas é sempre verde.
- **Superfície verde** (fim de `global.css`): os botões verdes e as etiquetas usam `--green-surface` (verde-lima escuro `#2e3f12` → `#4b6a1a` → lima, com faixa de luz lima-pálida e grão), sempre com texto branco. O oliva passou a `#4b6a1a`. Detalhes finos (linhas, pontos, barra do preço) ficam em lima simples. O botão "Contactar" do header é branco com texto carvão e o quadrado da seta na superfície verde (lima ao passar o rato).
- Uma única largura de página: `--page-w` e `--gutter` em `global.css`; usar sempre `.container-x`.
- **Ritmo da página** (bloco "Page rhythm", no fim de `global.css`):
  - **Identidade visual** (bloco "Visual identity", no fim de `global.css`): momentos fortes em **fotografia escura** (hero), em **colunas verdes** ("Faça carreira connosco": painel branco que passa, para a direita, a **vidro canelado**: canas largas e iguais com sombreado suave e juntas em filete, sobre oliva profundo iluminado por um brilho lima suave, com grão; sem riscas saturadas; painel baixo em duas colunas: título, frase e botão à esquerda no branco; à direita, sobre as colunas, uma folha de vidro com 3 razões (ícone lima + uma linha, separadas por filetes; texto provisório `TODO` a confirmar com o cliente); no telemóvel as colunas sobem de baixo) e em **verde atmosférico** (faixa "Conheça a equipa": foto de Vilasol muito desfocada e tonalizada para os verdes da marca, com grão; texto branco e cartões a flutuar por cima). Superfícies calmas: branco, e **névoa verde-sálvia** (`--mist`, que é o `--band-bg`) nas faixas de apoio; nunca bege nem verde-lima. Rodapé em oliva profundo (`--g-900`).
  - **Efeitos de luz** (bloco "Light effects", no fim de `global.css`): uma só família, feita de verdes da escala e luz vertical fina, discreta e sem movimento contínuo. Hero: o vidro do cartão de imóveis é vidro branco transparente (não névoa cinzenta nem verde), com um rebordo de luz branca que brilha no canto superior esquerdo e uma luz branca suave a subir do fundo (`hero-deck-panel.ts`). Carreiras: vidro canelado sobre luz verde. "Conheça a equipa": fita de lâminas finas em onda atrás do título (`FlutedWave.astro`, só desktop). No telemóvel e no tablet, "Conheça a equipa" segue a ordem de "Explore por zona": título, retratos (o seguinte a espreitar), texto e setas. A fita é o primeiro elemento da faixa: as regras usam `#equipa > div.rise:first-of-type` para o bloco do título. "Quer vender": linhas finas a subir como uma curva de valor por baixo dos passos (`.lead-rise`, só desktop; crescem uma vez ao aparecer). Os feixes diagonais e o meio-tom foram postos de parte (ruído, fora da paleta).
  - **Um só verde**: todos os verdes saem da escala `--g-950` … `--g-50` (bloco "One green", no fim de `global.css`), a mesma do cabeçalho e dos botões. Fotografias tingidas (atmosfera) recebem o tom com uma mistura "color" do oliva `--g-500`, nunca com filtros de matiz.
  - **Ícones**: todos os quadrados de ícone do site (bloco "glass-ic" em `global.css`: cabeçalho, pilares, passos, setas, redes do rodapé, cartões das zonas) usam um só aspeto: verde escuro suave (`--g-600` → `--g-800`), ícone lima-pálido, aresta clara muito fina e quase sem sombra; ao passar o rato, a aresta acende em lima.
  - **Um só cartão**: folha branca com aresta fina (`--sheet-edge`) e sombra suave e longa (`--sheet-shadow`). Um só acento: lima só em pormenores (pontos, linhas, agulha, pílulas); os botões ficam na superfície verde. Etiquetas sobre fotos: pílula de vidro escuro com ponto lima.
  - Espaço entre secções: `--section-gap`. Espaço interior das faixas: `--band-pad`. Não usar margens avulsas.
  - **Revisão (out. 2026)**: a distância visível entre o separador de pesquisa do hero e "Imóveis em destaque" é a mesma `--section-gap` (`.feat-section`); títulos das secções da página do imóvel em semibold (`.detail-title`); em ecrãs táteis as ligações de texto pequenas têm área de toque de 44 px; no telemóvel "Como trabalhamos" é uma só folha com os 6 passos em linhas (número à esquerda), em vez de 6 cartões.
  - Cantos: **retos** quando o bloco toca a borda do ecrã ou é uma foto em grelha (imóveis, equipa). Exceções: as faixas das zonas e as fotos dos vendidos são redondas, e a hero tem os cantos de baixo redondos (`--hero-r`, como na MeewVision). **Redondos** em tudo o que flutua dentro da página: `--r-panel` (24px), `--r-card` (12px), `--r-sm` (8px). Um raio interior é o exterior menos o recuo.
- `TODO`: confirmar cores com o cliente quando chegarem os logótipos.

## Pesquisa e painel Sanity: requisitos a não esquecer

A pesquisa (hero e listagem) é dirigida por dados. Ao construir o Sanity (fase 3), cumprir:

- **Zona e Tipo de imóvel**: documentos próprios (`zone`, `propertyType`) editáveis pela equipa, com nome em PT/EN/FR e ordem. Nos imóveis escolhem-se por **referência** (lista), nunca por texto livre. Um item novo aparece em todas as listas na publicação seguinte.
- **Zona sem imóveis**: campo "Mostrar na pesquisa" para a equipa decidir se aparece.
- **Apagar zona/tipo em uso**: bloqueado enquanto houver imóveis associados.
- **Quartos**: opções geradas a partir do máximo de quartos dos imóveis publicados (`getSearchOptions`).
- **Preço máximo (barra)**: os extremos são **exatamente** o imóvel publicado mais barato e o mais caro (`getPriceRange`): nunca fica abaixo nem acima. Abre sempre no **ponto médio** entre os dois. Ignorar imóveis "preço sob consulta" e os vendidos/arrendados. O campo `price` leva texto de ajuda a dizer que o preço mais alto e o mais baixo definem os limites da barra, e um aviso de validação para valores muito altos (erro de zeros).
- **Localização do imóvel (mapa)**: campo "Link do Google Maps" no imóvel (opcional), onde a equipa cola o link da casa no Google Maps (links curtos `maps.app.goo.gl` servem). Frase de ajuda: "Abra a casa no Google Maps, carregue em Partilhar e cole aqui o link." Validação: só aceita endereços do Google Maps. No build (`src/lib/maps.ts`) o link é lido para obter as coordenadas e a página do imóvel mostra um mapa calmo (`src/components/PropertyMap.astro`: mosaicos OpenStreetMap em tons neutros, sem iframe, sem cookies nem chave) com um pino verde na casa; clicar abre o link no Google Maps. Sem link, o mapa mostra a zona (área lima à volta do centro da localidade, `zoneCentres`; `TODO`: no Sanity cada zona tem o seu ponto). Atribuição "© OpenStreetMap" obrigatória no canto.
- **Filtros da listagem** (`src/pages/imoveis/index.astro`): pesquisa por referência ou nome; Negócio (Todos/Comprar/Arrendar); Zona e Tipo em **lista** (uma linha cada: caixa de seleção, nome e número de imóveis à direita; escolha múltipla; as vazias ficam esbatidas); Preço mínimo/máximo em degraus redondos dentro do intervalo dos imóveis publicados (um preço vindo da barra da página inicial entra como opção); Quartos "1+ 2+ 3+"; em "Mais filtros": casas de banho, área útil mínima, estado e "com garagem". Por cima dos resultados: contagem, ordenar (recentes, preço, maior área) e uma etiqueta removível por filtro ativo. Tudo fica no endereço (`?zona=a,b&imovel=…`), por isso os links da página inicial e as pesquisas partilhadas funcionam. No telemóvel e tablet os filtros abrem numa folha de ecrã inteiro com o botão "Ver N imóveis". **Para o Sanity**: casas de banho, área e garagem vêm dos campos numéricos do imóvel; para filtrar por características (piscina, vista mar, jardim, elevador…) é preciso uma lista fixa de características escolhidas por referência, não o texto livre de hoje.
- **Página do imóvel** (`src/pages/imoveis/[slug].astro`): etiquetas (Venda/Arrendamento, tipo + tipologia T0–T9, Novo), preço com "Partilhar" (partilha nativa ou copiar link); cartão de contacto com o **consultor responsável** (Sanity: referência a um membro da Equipa; até lá o primeiro), "Ligar"/"WhatsApp" do consultor e formulário com "Quando prefere visitar?" (opcional); descrição longa dobra em "Ler mais"; imóveis semelhantes a uma secção de distância, com "Ver todos em {zona}" e fila deslizante no telemóvel. No telemóvel e tablet, barra fixa em baixo (preço, ligar, WhatsApp, "Pedir visita"), escondida quando o cartão de contacto está no ecrã. Partilha e SEO: imagem de partilha (`og:image` = primeira foto) e dados estruturados `RealEstateListing` (preço, quartos, área, localidade). **Campos opcionais no Sanity** (só aparecem quando preenchidos): área bruta, área do terreno, plantas (imagens, abrem na galeria), vídeo/visita virtual (link) e proximidades (local + distância, escritos pela equipa). `TODO` (cliente): classe energética de todos os imóveis (obrigatória).
- Cada campo do Studio com uma frase de ajuda em português; menu: Imóveis, Zonas, Tipos de imóvel, Páginas, Testemunhos, Equipa, Definições do site.

## Definições do site (Sanity): contactos do header

O header (o painel "Fale connosco", o menu do telemóvel e os contactos de "Somos daqui") lê tudo de `siteSettings`; nada fica escrito à mão no código. O painel tem de pedir, como **obrigatórios**:

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

Secção `src/components/ZoneExplorer.astro` + `src/scripts/zone-explorer.ts`: painel com a mesma superfície do cartão aberto de "O seu perfil" (quase branco, aresta fina que acende em lima, uma sombra suave e um brilho muito leve em baixo; bloco "Explore por zona, light" no fim de `global.css`), com nome em oliva, frase, "Ver imóveis" e os controlos (setas, progresso, contador) à esquerda; subtítulo "— Explore por zona". À direita, **todas as zonas em cartões iguais**, que saem pela borda e deslizam de lado; **o cartão da zona escolhida passa sempre para primeiro** e as zonas seguintes vêm atrás, em círculo: foto com véu oliva, ícone de pino em vidro no canto, nome e número de imóveis em baixo; o cartão da zona ativa fica a cores, com aresta lima e a seta verde. Clicar num cartão mostra essa zona; clicar no cartão ativo (tem uma seta lima) abre os imóveis da zona. Também mudam a zona as setas, as teclas ← → e deslizar o dedo no painel; nenhum cartão sai da fila. Temporizador de 7 s visível na linha de progresso por segmentos (em pausa com o rato/foco dentro ou fora do ecrã); para de vez quando o visitante escolhe uma zona. Quando a fila não cabe, desliza de lado com as pontas esbatidas. Sem JS mostra a primeira zona e os cartões são ligações. **Telemóvel e tablet** (bloco "Explore por zona on phones and tablets", no fim de `global.css`): a fotografia lidera: "— Explore por zona", depois os cartões grandes (o ativo primeiro, o seguinte a espreitar na borda direita), depois a frase da zona com "Ver imóveis" e por fim os controlos; o nome e o número de imóveis ficam só no cartão (o nome continua para leitores de ecrã). Aqui os cartões mantêm a ordem e a fila desliza cartão a cartão: **o cartão onde o deslizar para fica automaticamente a zona selecionada** (fundo, texto e contador mudam); as setas e o temporizador fazem a fila deslizar até à zona escolhida. Desktop sem alterações (a zona escolhida passa para primeiro).

## "Destaques" (removidos da página inicial)

Decidido com o cliente: o painel de destaques (imagem + texto + ligação para empreendimentos/campanhas) **saiu da página inicial**. Os dados de protótipo continuam em `src/data/home.ts` (`sideHighlights`), sem uso. `TODO`: decidir se volta noutro sítio; se não, não criar a lista "Destaques laterais" no Sanity e apagar `sideHighlights`.

## Resultados (página inicial)

Secção `src/components/Results.astro` (entre as avaliações Google e "Como trabalhamos"): até 4 números grandes com uma legenda curta (ex.: "98%" / "Média do valor pedido alcançado"), numa linha sem cartões; os números contam de 0 até ao valor uma vez, quando aparecem (com um segmento lima a desenhar-se na linha de cima; ao passar o rato o segmento ocupa a coluna toda; leitores de ecrã leem só o valor final; sem JS ou com movimento reduzido aparecem logo), e por baixo **"Vendidos recentemente"**: os 4 imóveis de venda mais recentes com estado "vendido" (foto, selo "Vendido", nome e zona, sem preço). Atualiza-se sozinha quando a equipa marca um imóvel como vendido; sem vendidos, essa linha desaparece.

- `TODO` obrigatório: enquanto não houver vendidos, o protótipo mostra imóveis à venda como exemplo (`demoSoldSlugs` em `src/data/home.ts`); remover antes do lançamento.

- Sanity (Página inicial): lista "Resultados", máximo 4, arrastar para ordenar. Cada item: **valor** (ex.: "98", "4,2"), **unidade** opcional (ex.: "%", "M€", "dias") e **legenda**, com frase de ajuda em português. Lista vazia: a secção desaparece.
- `TODO` obrigatório: os números atuais em `src/data/home.ts` (`resultStats`) são **de exemplo**, não são dados da JPP. Pedir os valores reais ao cliente antes do lançamento; versões EN/FR.

## Contactos no site (sem faixa "Visite-nos")

A faixa "Visite-nos" antes do rodapé foi **removida de todo o site** (decisão do cliente: informação redundante). Os contactos ficam em:

- **Painel "Fale connosco"** do header (botão de pontos): morada, email, telefones com a nota legal, horário e redes. A ligação "Contactos" do rodapé abre este painel (sem JS leva aos contactos da página inicial, `/#sobre`).
- **Página inicial, "Somos daqui"**: o botão "Ligar" (telefone principal) e, por baixo dos botões, o email numa linha discreta "Prefere escrever?" (`.about-mail`, como o "Prefere falar já?" do formulário); a morada está no cartão do globo.
- **WhatsApp**: widget flutuante e menu do telemóvel.
- O rodapé não repete morada, telefones e email: fica com marca, navegação, links legais (Política de Privacidade, Resolução de Litígios, Livro de Reclamações), redes sociais e AMI.
- Tudo lido de `siteSettings` (hoje `src/lib/site.ts`). Sem mapa embutido: um iframe do Google Maps criaria cookies antes do consentimento.

## Entrada do site (cortina)

`src/components/SiteIntro.astro` (no `SiteLayout`): quando alguém **abre** o site (endereço escrito, favorito, link partilhado, pesquisa), uma cortina oliva profundo com o grão do cabeçalho mostra "JPP Properties" no tipo do rodapé (as letras sobem e um feixe lima deixa-as brancas) e saudações por baixo (Olá, Hello, Bonjour, "Imóveis no Algarve"); depois sobe e revela a página (~3,3 s; clique ou tecla salta). **Não aparece** ao mudar de página dentro do site, ao recarregar nem com retroceder/avançar. Também não aparece na página 404 (`intro={false}` no `SiteLayout`). Sem JS não há cortina; com movimento reduzido, só um fade curto. `TODO`: versões EN/FR da última frase.

## Formulário de pedido (vender / comprar)

- Componente `src/components/LeadForm.astro` (secção `#vender` da página inicial): dois separadores, **vender** (à vista só o essencial: concelho, código postal, morada, nº da porta, tipo e área útil; o resto, quartos, casas de banho, terreno, ano, estado, características e preço, fica dobrado em "Acrescentar detalhes", opcional) e **comprar** (zonas, tipos, quartos mínimos, orçamento, financiamento).
- Envio para o email da equipa: Pages Function `functions/api/lead.ts` (Resend). Nada é guardado (nem no Sanity nem no Git).
- Variáveis de ambiente (só nomes em `.env.example`): `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` (domínio verificado no Resend), `TURNSTILE_SECRET_KEY` e `PUBLIC_TURNSTILE_SITE_KEY`.
- `TODO`: textos provisórios em PT; versões EN/FR; página de Política de Privacidade (o consentimento aponta para `/politica-de-privacidade/`).

## Avaliações Google (página inicial)

- Secção `src/components/GoogleReviews.astro` (entre a equipa e o formulário de venda). No telemóvel e no tablet: título com a nota compacta, depois os cartões das avaliações (até à borda do ecrã, o seguinte a espreitar) e uma linha final com as setas à esquerda e "Ver todas no Google" à direita; no desktop a coluna de introdução fica ao lado. Nada é inventado: nota, total e avaliações vêm de `/api/reviews`.
- Pages Function `functions/api/reviews.ts` (Google Places API, "New"): devolve nota, total e até 5 avaliações (limite da API). Cache de 1 hora na Cloudflare (os termos do Google limitam o tempo de cache); mostrar sempre o nome do autor com ligação.
- Variáveis de ambiente (só nomes em `.env.example`): `GOOGLE_PLACES_API_KEY` (chave restrita à Places API) e `GOOGLE_PLACE_ID`. Enquanto não houver chave, a secção mostra 5 avaliações DE EXEMPLO (`demoReviews` no componente, sem aviso no ecrã; `TODO` obrigatório: remover antes do lançamento) para pré-visualização com o cliente. Se a API falhar com a chave já definida, o mesmo acontece; antes de lançar, tirar o modo de exemplo para mostrar só o título e o botão "Ver todas no Google" (`googleProfileUrl` em `src/lib/site.ts`).
- `TODO`: criar a chave no Google Cloud (faturação ativa; uso pequeno cabe na quota gratuita), obter o `place_id` do perfil e definir as duas variáveis na Cloudflare Pages.

## Páginas legais e 404

- `src/pages/politica-de-privacidade.astro`: o texto do cliente **palavra a palavra**, igual ao do site atual (lido em outubro de 2026; só mudou a apresentação). `TODO` (cliente): rever antes do lançamento, porque o texto menciona outra empresa ("Colinas Inforcyber Lda."), uma página de contactos que não existe no site novo, o Internet Explorer 11 e diz que os formulários recolhem só dados de empresas. Versões EN/FR.
- `src/pages/404.astro`: ecrã escuro e centrado na "noite" de "Explore por zona" (oliva profundo, brilhos verdes, grão), com um "404" grande iluminado de cima e a desvanecer, o horizonte de luz por baixo, "Página não encontrada", uma frase e os botões "Página inicial" (branco) e "Ver imóveis" (vidro). Interação: uma luz lima segue o rato e os algarismos inclinam-se para ele; ao abrir, os algarismos sobem um a um. Header em vidro por cima; sem cortina de entrada; com movimento reduzido fica parado.
- `src/pages/resolucao-de-litigios.astro`: o texto do site atual palavra a palavra (cada entidade num bloco). `TODO` (cliente): a segunda entidade é o centro de Lisboa (no Algarve é o CIMAAL), o PDF aponta para o site da agência web (webcolinas.pt) e "jurídico@" tem acento, por isso não é um email válido.
- `src/pages/carreiras.astro`: página de recrutamento, com a identidade do site. Topo numa faixa escura com a atmosfera de "Explore por zona" (oliva quase negro, brilhos verdes, grão; corre por trás do cabeçalho): à esquerda o título da página, "Construímos juntos o seu percurso." (`.cp-wall`: duas linhas em maiúsculas, Outfit semibold, uma só cor com gradiente suave de branco para verde-claro, com o topo alinhado ao do formulário; exceção pedida à regra do tamanho único; `TODO` a confirmar com o cliente), por baixo a estrutura da casa em **SVG desenhado à mão** (`public/careers/casa-estrutura.svg`, sem imagem raster), inteira, com a largura da coluna do título, em tons de pedra-sálvia e marfim (sem lilás), e logo a seguir a frase; à direita o formulário de candidatura (`#candidatura`) na folha do cartão de contacto (nome, telefone, email, experiência, LinkedIn opcional e CV opcional até 5 MB). As duas colunas partilham a linha de cima e a de baixo; fundo calmo, com uma só luz atrás da casa e sem grão. No telemóvel e tablet fica tudo empilhado, com o formulário no fim. Depois: "Vantagens" (título, frase e 3 linhas com ícone, lado a lado no desktop); "O seu perfil" (estrutura de "Com quem trabalhamos" da MeewVision: título à esquerda, frase "bom saber" à direita e 5 painéis que abrem de lado, um sempre aberto, em `<details>`; sem fotografias, em cartões quase brancos e calmos (sem vidro, grão nem manchas): aresta fina que apanha a luz, uma sombra suave, ícones e títulos em oliva, filete de luz lima na vertical nos fechados, aresta lima e brilho muito leve no aberto, pílulas só com contorno e ponto lima; o aberto ocupa cerca de 2/5 da fila; os fechados têm número e ícone em cima e o título na vertical; no telemóvel e tablet são linhas empilhadas); "Onde vai trabalhar" (fundo da galeria de casamentos da MeewVision: faixa em névoa verde-sálvia `--mist` com uma tira branca e 3 fotos iguais de cantos retos numa só linha, sem etiquetas; no telemóvel a linha desliza, com a seguinte a espreitar; `TODO` (cliente): fotos reais dos escritórios, hoje há 2 pequenas e 1 provisória da marina); testemunho (só aparece com um testemunho real, `testimonial` = `null` até lá); "Como funciona a candidatura" (3 passos, com os cartões de "Como trabalhamos"); "Perguntas frequentes" (centradas; experiência, licença, remuneração); e a fechar um painel verde escuro com "Candidatar-me", que volta ao formulário. A página não repete contactos: ficam no painel "Fale connosco" do header e no widget. Sem lista de vagas: `TODO` (cliente), se houver vagas reais. Envio simulado no protótipo; na fase 5 vai por email (Resend, CV em anexo), sem guardar nada. Ligação no rodapé e no botão "Quero ser consultor" da página inicial. `TODO` (cliente): todos os textos são provisórios, em especial as respostas sobre licença e remuneração; testemunho de um consultor; fotos da equipa ou do escritório por dentro; EN/FR.

## Dados a pedir ao cliente

Lista completa do que falta (dados de exemplo, contactos, textos, traduções, fotografias, páginas legais) em `docs/checklist-cliente.md`.

## Fases

1. Setup · 2. Protótipo de design (aprovação do cliente) · 3. Sanity · 4. Integração · 5. Formulários · 6. Migração · 7. SEO · 8. Segurança e QA · 9. Lançamento · 10. Entrega.
