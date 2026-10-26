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
- Lima só em fundos (botões, etiquetas) com texto escuro; nunca como texto sobre branco (contraste 2,2:1).
- Uma única largura de página: `--page-w` e `--gutter` em `global.css`; usar sempre `.container-x`.
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

O header (e o rodapé, a barra de contacto móvel e a página de contactos) lê tudo de `siteSettings`; nada fica escrito à mão no código. O painel tem de pedir, como **obrigatórios**:

- **Escritórios**: nome, morada e **telefones** (número + tipo "rede móvel" ou "rede fixa", para a nota legal "(Chamada para rede ... nacional)"). O ícone de telefone do header abre a lista destes números, agrupados por escritório.
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

## "Novos empreendimentos" (destaques na secção das zonas)

Não são imóveis: são campos livres com **imagem + texto + ligação**, para destacar um novo empreendimento, uma campanha ou um serviço.

- Sanity (Página inicial): lista "Destaques laterais", máximo 3, arrastar para ordenar; aparecem numa fila de cartões por baixo do explorador de zonas, o primeiro um pouco mais largo. Cada item: **etiqueta** (ex.: "Empreendimento"), **título**, **texto curto** (máx. ~140 caracteres, com contador), **imagem** (com texto alternativo obrigatório) e **ligação** (página interna ou endereço externo).
- Se a lista estiver vazia, a fila desaparece (já tratado em `src/pages/index.astro`).
- Dados de protótipo em `src/data/home.ts` (`sideHighlights`), com a mesma forma do documento Sanity.

## Formulário de pedido (vender / comprar)

- Componente `src/components/LeadForm.astro` (secção `#vender` da página inicial): dois separadores, **vender** (concelho, morada, nº da porta, tipo, quartos, casas de banho, áreas, ano, estado, características, preço) e **comprar** (zonas, tipos, quartos mínimos, orçamento, financiamento).
- Envio para o email da equipa: Pages Function `functions/api/lead.ts` (Resend). Nada é guardado (nem no Sanity nem no Git).
- Variáveis de ambiente (só nomes em `.env.example`): `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` (domínio verificado no Resend), `TURNSTILE_SECRET_KEY` e `PUBLIC_TURNSTILE_SITE_KEY`.
- `TODO`: textos provisórios em PT; versões EN/FR; página de Política de Privacidade (o consentimento aponta para `/politica-de-privacidade/`).

## Avaliações Google (página inicial)

- Secção `src/components/GoogleReviews.astro` (entre a equipa e o formulário de venda). Nada é inventado: nota, total e avaliações vêm de `/api/reviews`.
- Pages Function `functions/api/reviews.ts` (Google Places API, "New"): devolve nota, total e até 5 avaliações (limite da API). Cache de 1 hora na Cloudflare (os termos do Google limitam o tempo de cache); mostrar sempre o nome do autor com ligação.
- Variáveis de ambiente (só nomes em `.env.example`): `GOOGLE_PLACES_API_KEY` (chave restrita à Places API) e `GOOGLE_PLACE_ID`. Enquanto não houver chave, a secção mostra 5 avaliações DE EXEMPLO (`demoReviews` no componente, sem aviso no ecrã; `TODO` obrigatório: remover antes do lançamento) para pré-visualização com o cliente. Se a API falhar com a chave já definida, o mesmo acontece; antes de lançar, tirar o modo de exemplo para mostrar só o título e o botão "Ver todas no Google" (`googleProfileUrl` em `src/lib/site.ts`).
- `TODO`: criar a chave no Google Cloud (faturação ativa; uso pequeno cabe na quota gratuita), obter o `place_id` do perfil e definir as duas variáveis na Cloudflare Pages.

## Fases

1. Setup · 2. Protótipo de design (aprovação do cliente) · 3. Sanity · 4. Integração · 5. Formulários · 6. Migração · 7. SEO · 8. Segurança e QA · 9. Lançamento · 10. Entrega.
