# Contributing

Este repositório tem regras mínimas para manter consistência e garantir que a aplicação funcione corretamente em desenvolvimento e em produção (GitHub Pages).

## Regras importantes

- Sempre mantenha o Vite configurado com o `base` correto para GitHub Pages ao publicar em subpasta. Exemplo (já presente):

```ts
// vite.config.ts
export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : "/siteIAPlov/",
  // ...
}));
```

- Favicons e assets públicos requeridos em produção devem existir em `docs/` (para GitHub Pages que usa a pasta `docs`):
  - Coloque `favicon.png` e `favicon.ico` em `docs/` raiz antes de publicar.
  - Copie `src/assets/logo-iap.jpg` para `docs/assets/logo-iap.jpg` se precisar de um logo estático usado por `noscript` ou por páginas estáticas.

- Não use caminhos absolutos iniciados por `/` que dependam do host root (ex: `/lovable-uploads/...`). Prefira:
  - Importar imagens em componentes React via `import logo from "@/assets/logo-iap.jpg";` (Vite resolve e inclui no build);
  - Ou usar caminhos relativos em `docs/index.html` como `./assets/...` ou `./favicon.png`.

- Evite dependência de recursos externos (ex.: `lovable-uploads/...`) para elementos essenciais (favicon, logo). Prefira assets locais no repositório.

## Deploy para GitHub Pages (pasta `docs`)

1. Garanta os arquivos estáticos em `docs/`:
   - `docs/favicon.png`, `docs/favicon.ico`
   - Se precisar de fallback `docs/assets/logo-iap.jpg` (opcional)

2. Build e publicar
   - `npm run build` (gera `dist/`)
   - Copie o conteúdo de `dist/` para `docs/` (ou use um script para isso). Exemplos:
     - `cp -r dist/* docs/`
     - Em Windows (PowerShell): `Copy-Item -Path dist/* -Destination docs/ -Recurse`
   - Commit e push para `main`. O GitHub Pages servirá `docs/`.

## Como escrever código para assets

- Em componentes React, importe assets assim:

```ts
import logo from "@/assets/logo-iap.jpg";
// <img src={logo} alt="..." />
```

- Não escreva `src="/siteIAPlov/…"` nem `src="/lovable-uploads/..."` em componentes; isso quebra quando o site é servido em subpastas ou quando o arquivo não existe.

## Boas práticas

- Respeite `.editorconfig` (indentação de 4 espaços, LF, UTF-8).
- Arquivos gerados pelo build não devem ser editados manualmente sem necessidade. Atualize a origem (src) e reconstrua.

## Por que estas regras

- Asseguram que o site funcione tanto no servidor de desenvolvimento (`npm run dev`) quanto em produção no GitHub Pages, evitando 404 em assets essenciais (favicon, logos) e dependências externas não confiáveis.