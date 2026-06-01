# Aurum Briefing

Formulário de briefing de eventos para a **Aurum Serviços Gastronômicos**. Multi-step wizard mobile-first com envio por WhatsApp.

## Instalação

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Deploy na Vercel

```bash
npx vercel --prod
```

Ou conecte este repositório em [vercel.com](https://vercel.com) e o deploy é automático a cada push.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de destino do WhatsApp (sem + ou espaços) |
| `NEXT_PUBLIC_BUSINESS_NAME` | Nome exibido no cabeçalho |
