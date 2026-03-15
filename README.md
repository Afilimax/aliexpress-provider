# @afilimax/aliexpress-provider

Provedor de links de afiliados para o AliExpress, integrado ao ecossistema Afilimax. Este pacote permite converter URLs de produtos do AliExpress em links de afiliados utilizando a API oficial Open Platform do AliExpress.

## Instalação

```bash
npm install @afilimax/aliexpress-provider
```

> [!IMPORTANT]
> Este pacote requer `@afilimax/core` como dependência de par (peer dependency).

## Como usar

O `AliExpressProvider` utiliza autenticação baseada em `appKey`, `appSecret` e `trackingId` fornecidos pelo portal de desenvolvedores do AliExpress.

```typescript
import { AliExpressProvider } from "@afilimax/aliexpress-provider";

const provider = new AliExpressProvider({
    appKey: "seu_app_key",
    appSecret: "seu_app_secret",
    trackingId: "seu_tracking_id"
});

async function run() {
    const originalUrl = "https://pt.aliexpress.com/item/1005003430339815.html";
    
    try {
        const affiliateUrl = await provider.createAffiliateUrl(originalUrl);
        console.log("Link de Afiliado:", affiliateUrl); // Retorna o link s.click.aliexpress.com
    } catch (error) {
        console.error("Erro ao gerar link:", error.message);
    }
}

run();
```

## Configurações

A interface `AliExpressProviderOptions` aceita as seguintes propriedades:

| Propriedade | Tipo | Descrição |
| :--- | :--- | :--- |
| `appKey` | `string` | Sua App Key obtida no portal AliExpress Open Platform. |
| `appSecret` | `string` | Sua App Secret correspondente para assinatura de requisições (HMAC-SHA256). |
| `trackingId` | `string` | Seu Tracking ID para rastreamento de vendas no portal de afiliados. |

## Domínios Suportados

O provedor identifica automaticamente URLs dos seguintes domínios:
- `aliexpress.com` (e subdomínios como `pt.aliexpress.com`)

## Desenvolvimento

### Scripts Disponíveis

- `npm run build`: Compila o projeto para o diretório `dist`.
- `npm run test`: Executa os testes unitários e o teste prático (integração) com Vitest.
- `npm run lint`: Verifica e corrige problemas de estilo de código.
- `npm run format`: Formata o código fonte usando Prettier.

### Testes Práticos

Para rodar o teste prático de integração, crie um arquivo `__tests__/auth.json` com suas credenciais reais:

```json
{
    "appKey": "SUA_KEY",
    "appSecret": "SEU_SECRET",
    "trackingId": "SEU_TRACKING_ID"
}
```

---

Produzido com ❤️ pela equipe **Afilimax**.