# RS Running Landing

Landing page premium para apresentar o app beta da RS Running aos alunos convidados.

## Stack

- Next.js 15
- React
- TailwindCSS
- Framer Motion
- TypeScript

## Como rodar

```bash
npm install
npm run dev
```

Depois acesse `http://localhost:3000`.

## Build

```bash
npm run build
```

## Deploy na Vercel

Este projeto está pronto para deploy direto na Vercel.

### Pela interface

1. Suba este projeto para um repositório no GitHub.
2. Acesse a Vercel e clique em `Add New Project`.
3. Importe o repositório.
4. Mantenha as configurações padrão:
   - Framework: `Next.js`
   - Build command: `npm run build`
   - Output directory: `.next`
5. Clique em `Deploy`.

### Pela CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## Assets

As imagens principais ficam em `public/`:

- `rs-running-logo-beta.png`
- `rs-running-hero-mockup.png`

O botão principal aponta para:

`https://app-rsrunning.vercel.app/student`
