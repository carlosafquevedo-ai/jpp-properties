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
- Paleta em `src/styles/global.css` (ver `/paleta/`): branco, névoa, linha, tinta, musgo, floresta, oliva e lima (verde da marca `#9EBC3A`).
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
- **WhatsApp** (número, formato internacional) e **Instagram** (endereço do perfil). Os ícones do header só aparecem se estiverem preenchidos.
- Validação do formato dos números e dos endereços, com frase de ajuda em português em cada campo.
- `TODO` no protótipo: o WhatsApp é provisório (telemóvel principal) e o Instagram aponta para a página inicial do Instagram até haver o perfil real.

## Fases

1. Setup · 2. Protótipo de design (aprovação do cliente) · 3. Sanity · 4. Integração · 5. Formulários · 6. Migração · 7. SEO · 8. Segurança e QA · 9. Lançamento · 10. Entrega.
