<a href="https://afilimax.net"><img src="https://raw.githubusercontent.com/Afilimax/.github/main/assets/npm-banner.svg" alt="Afilimax — Encontre a oferta. Gere o link. Divulgue sozinho." width="100%" /></a>

[![npm version](https://img.shields.io/npm/v/%40afilimax%2Faliexpress-provider?logo=npm)](https://www.npmjs.com/package/@afilimax/aliexpress-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40afilimax%2Faliexpress-provider?logo=npm)](https://www.npmjs.com/package/@afilimax/aliexpress-provider)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Afilimax/aliexpress-provider/blob/HEAD/LICENSE)
[![Website](https://img.shields.io/badge/website-afilimax.net-7857FF)](https://afilimax.net)

# @afilimax/aliexpress-provider

Provedor oficial de afiliados do AliExpress para o ecossistema Afilimax. O pacote gera links de divulgação e pesquisa produtos pela Open Platform, convertendo as respostas da API para os tipos compartilhados do `@afilimax/core`.

## Recursos

- Geração de links de afiliado pelo método `aliexpress.affiliate.link.generate`.
- Pesquisa de produtos pela API `aliexpress.affiliate.product.query`.
- Assinatura das requisições com HMAC-SHA256.
- Pesquisa paginada com moeda, idioma e país de entrega configuráveis.
- Resultados de busca no formato `ScrapedProductPreview`.
- Compatibilidade com `AffiliateProvider` e `AffiliateManager`.

## Instalação

```bash
npm install @afilimax/aliexpress-provider @afilimax/core
```

O `@afilimax/core` é uma dependência de par obrigatória, na versão `^0.5.0`.

## Como usar

Crie uma instância com as credenciais da Open Platform e informe a URL do produto:

```typescript
import { AliExpressProvider } from "@afilimax/aliexpress-provider"

const provider = new AliExpressProvider({
    appKey: process.env.ALIEXPRESS_APP_KEY!,
    appSecret: process.env.ALIEXPRESS_APP_SECRET!,
    trackingId: process.env.ALIEXPRESS_TRACKING_ID!,
})

async function main() {
    const productUrl = "https://pt.aliexpress.com/item/1005003430339815.html"

    try {
        const affiliateUrl = await provider.createAffiliateUrl(productUrl)
        console.log("Affiliate URL:", affiliateUrl)
    } catch (error) {
        console.error("Failed to create affiliate URL:", error)
    }
}

main()
```

Para pesquisar produtos sem informar uma URL específica:

```typescript
const products = await provider.searchProducts({
    query: "wireless headphones",
    pageNo: 1,
    pageSize: 10,
    targetCurrency: "BRL",
    targetLanguage: "PT",
    shipToCountry: "BR",
})

console.log("Products found:", products.length)
```

### Uso com AffiliateManager

```typescript
import { AffiliateManager } from "@afilimax/core"
import { AliExpressProvider } from "@afilimax/aliexpress-provider"

const manager = new AffiliateManager([
    new AliExpressProvider({
        appKey: process.env.ALIEXPRESS_APP_KEY!,
        appSecret: process.env.ALIEXPRESS_APP_SECRET!,
        trackingId: process.env.ALIEXPRESS_TRACKING_ID!,
    }),
])

const affiliateUrl = await manager.createAffiliateUrl(
    "https://pt.aliexpress.com/item/1005003430339815.html",
)

console.log(affiliateUrl)
```

O gerenciador seleciona o primeiro provedor compatível com o domínio e retorna `null` quando nenhum provedor aceita a URL.

## Configuração

A interface `AliExpressProviderOptions` possui três campos obrigatórios:

| Opção | Tipo | Descrição |
| :--- | :--- | :--- |
| `appKey` | `string` | App Key obtida no AliExpress Open Platform. |
| `appSecret` | `string` | Segredo usado para assinar as requisições com HMAC-SHA256. |
| `trackingId` | `string` | Identificador de rastreamento das conversões. |

As credenciais devem ser mantidas em variáveis de ambiente ou em outro armazenamento seguro, fora do controle de versão.

## Referência da API

### `new AliExpressProvider(options)`

Cria um provedor com as opções descritas em `AliExpressProviderOptions`.

### `createAffiliateUrl(url: string): Promise<string>`

Gera um link de divulgação para a URL informada. O método lança um erro quando a requisição HTTP falha, quando a API retorna um código diferente de `200` ou quando a resposta não contém um link de promoção.

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `url` | `string` | URL do produto ou página aceita pela API de afiliados. |

### `searchProducts(options): Promise<ScrapedProductPreview[]>`

Pesquisa produtos e normaliza título, URL, imagem, preços, avaliação e identificador externo.

| Opção | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `query` | `string` | Obrigatório | Termo de pesquisa. |
| `pageNo` | `number` | `1` | Página da consulta. |
| `pageSize` | `number` | `20` | Quantidade de itens por página. |
| `targetCurrency` | `string` | `"BRL"` | Moeda dos preços retornados. |
| `targetLanguage` | `string` | `"PT"` | Idioma da resposta. |
| `shipToCountry` | `string` | `"BR"` | País de entrega. |

### Domínios suportados

- `aliexpress.com`, incluindo subdomínios como `pt.aliexpress.com`.

A verificação pode ser feita diretamente com `provider.supportsUrl(url)`.

## Desenvolvimento

Instale as dependências com `npm install`. Os scripts disponíveis são:

| Comando | Finalidade |
| :--- | :--- |
| `npm run dev` | Executa `src/index.ts` com `ts-node`. |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm test` | Executa os testes com Vitest. |
| `npm run test:watch` | Executa os testes em modo de observação. |
| `npm run test:cov` | Executa os testes com cobertura. |
| `npm run lint` | Executa o ESLint com correção automática. |
| `npm run format` | Formata os arquivos de `src/` com Prettier. |

O teste prático de geração de link usa `__tests__/auth.json`. Sem esse arquivo, ou sem todas as credenciais, o teste é ignorado:

```json
{
    "appKey": "your-app-key",
    "appSecret": "your-app-secret",
    "trackingId": "your-tracking-id"
}
```

Não versione esse arquivo nem credenciais reais.

## Licença

Distribuído sob a licença [MIT](./LICENSE).

---

## Automatize sua operação de afiliados

> Use este pacote para automatizar sua operação de afiliados. Conheça a plataforma Afilimax e transforme ofertas em links e divulgação automática.

[Conheça a Afilimax](https://afilimax.net) · [Pacote no npm](https://www.npmjs.com/package/@afilimax/aliexpress-provider) · [Repositório no GitHub](https://github.com/Afilimax/aliexpress-provider)
