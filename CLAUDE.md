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
- Cor de acento: verde-oliva da marca atual (`TODO`: valor exato a extrair do logótipo).

## Fases

1. Setup · 2. Protótipo de design (aprovação do cliente) · 3. Sanity · 4. Integração · 5. Formulários · 6. Migração · 7. SEO · 8. Segurança e QA · 9. Lançamento · 10. Entrega.
