# JPP Properties

Novo website da JPP Properties (AMI 9361), agência imobiliária no Algarve.

- **Site:** Astro (estático) + Tailwind CSS + TypeScript
- **CMS:** Sanity (Studio em `studio/`)
- **Alojamento:** Cloudflare Pages
- **Idiomas:** português (raiz), inglês (`/en/`) e francês (`/fr/`)

## Estado

Em desenvolvimento. Ver `CLAUDE.md` para convenções e regras de trabalho.

## Desenvolvimento

Requer Node 20+ e pnpm.

```bash
pnpm install
pnpm dev
```

## Segurança

Este repositório é público. Nunca fazer commit de chaves, tokens ou dados pessoais.
As variáveis de ambiente estão documentadas em `.env.example` (apenas nomes, sem valores).
