import { describe, it, expect, vi, beforeEach } from "vitest"
import { AliExpressProvider } from "../src/index"
import { Marketplace } from "@afilimax/core"

const mockOptions = {
    appKey: "test-app-key",
    appSecret: "test-app-secret",
    trackingId: "test-tracking-id",
}

const makeAliProduct = (overrides: Record<string, unknown> = {}) => ({
    product_id: 1005003430339815,
    product_title: "Fone de Ouvido Bluetooth TWS",
    product_detail_url: "https://www.aliexpress.com/item/1005003430339815.html",
    product_main_image_url: "https://ae01.alicdn.com/kf/example.jpg",
    target_sale_price: "89.90",
    target_original_price: "149.90",
    target_sale_price_currency: "BRL",
    evaluate_rate: "95.60%",
    lastest_volume: 3400,
    ...overrides,
})

const makeApiResponse = (products: unknown[]) => ({
    aliexpress_affiliate_product_query_response: {
        resp_result: {
            result: {
                current_record_count: products.length,
                products: {
                    product: products,
                },
            },
            resp_code: 200,
            resp_msg: "OK",
        },
        request_id: "abc123",
    },
})

describe("AliExpressProvider – searchProducts", () => {
    let provider: AliExpressProvider

    beforeEach(() => {
        provider = new AliExpressProvider(mockOptions)
        vi.restoreAllMocks()
    })

    it("deve retornar um array de ScrapedProductPreview", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBe(1)
    })

    it("deve preencher o marketplace como AliExpress", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(results[0].marketplace).toBe(Marketplace.AliExpress)
    })

    it("deve preencher externalId, title e url corretamente", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })
        const item = results[0]

        expect(item.externalId).toBe("1005003430339815")
        expect(item.title).toBe("Fone de Ouvido Bluetooth TWS")
        expect(item.url).toBe("https://www.aliexpress.com/item/1005003430339815.html")
    })

    it("deve preencher o thumbnail", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(results[0].thumbnail).toBe("https://ae01.alicdn.com/kf/example.jpg")
    })

    it("deve retornar thumbnail como null quando ausente", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct({ product_main_image_url: null })]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(results[0].thumbnail).toBeNull()
    })

    it("deve converter o preço de string para número", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })
        const { price } = results[0]

        expect(price.value).toBe(89.9)
        expect(price.originalValue).toBe(149.9)
        expect(price.currency).toBe("BRL")
    })

    it("deve retornar price.value como null quando target_sale_price é null", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () =>
                makeApiResponse([makeAliProduct({ target_sale_price: null })]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(results[0].price.value).toBeNull()
    })

    it("deve converter evaluate_rate (%) para fração decimal no rating.average", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })
        const rating = results[0].rating

        expect(rating).not.toBeNull()
        expect(rating!.average).toBeCloseTo(0.956)
    })

    it("deve preencher rating.totalReviews com lastest_volume", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(results[0].rating!.totalReviews).toBe(3400)
    })

    it("deve retornar rating.average como null quando evaluate_rate é null", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () =>
                makeApiResponse([makeAliProduct({ evaluate_rate: null })]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(results[0].rating!.average).toBeNull()
    })

    it("deve retornar brand como null (API de busca não fornece brand)", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(results[0].brand).toBeNull()
    })

    it("deve preencher scrapedAt como string ISO válida", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([makeAliProduct()]),
        })

        const results = await provider.searchProducts({ query: "fone bluetooth" })

        expect(typeof results[0].scrapedAt).toBe("string")
        expect(() => new Date(results[0].scrapedAt)).not.toThrow()
    })

    it("deve retornar array vazio quando não há produtos", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                aliexpress_affiliate_product_query_response: {
                    resp_result: {
                        result: { current_record_count: 0, products: { product: [] } },
                        resp_code: 200,
                        resp_msg: "OK",
                    },
                    request_id: "empty",
                },
            }),
        })

        const results = await provider.searchProducts({ query: "xyzabc" })

        expect(results).toEqual([])
    })

    it("deve enviar os parâmetros pageNo, pageSize, targetCurrency, targetLanguage e shipToCountry", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([]),
        })
        global.fetch = fetchMock

        await provider.searchProducts({
            query: "notebook",
            pageNo: 2,
            pageSize: 50,
            targetCurrency: "USD",
            targetLanguage: "EN",
            shipToCountry: "US",
        })

        const calledUrl: string = fetchMock.mock.calls[0][0]
        expect(calledUrl).toContain("keywords=notebook")
        expect(calledUrl).toContain("page_no=2")
        expect(calledUrl).toContain("page_size=50")
        expect(calledUrl).toContain("target_currency=USD")
        expect(calledUrl).toContain("target_language=EN")
        expect(calledUrl).toContain("ship_to_country=US")
    })

    it("deve lançar erro quando o HTTP status não for ok", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 503,
        })

        await expect(provider.searchProducts({ query: "fone" })).rejects.toThrow(
            "AliExpress search API request failed with status 503"
        )
    })

    it("deve lançar erro quando a API retorna resp_code diferente de 200", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                aliexpress_affiliate_product_query_response: {
                    resp_result: {
                        result: null,
                        resp_code: 40001,
                        resp_msg: "Invalid app_key",
                    },
                    request_id: "err",
                },
            }),
        })

        await expect(provider.searchProducts({ query: "fone" })).rejects.toThrow(
            "AliExpress API Error: 40001 - Invalid app_key"
        )
    })

    it("deve incluir uma assinatura (sign) na requisição", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => makeApiResponse([]),
        })
        global.fetch = fetchMock

        await provider.searchProducts({ query: "tablet" })

        const calledUrl: string = fetchMock.mock.calls[0][0]
        expect(calledUrl).toContain("sign=")
        // Assinatura deve ser uma string hexadecimal maiúscula
        const signMatch = calledUrl.match(/sign=([A-F0-9]+)/)
        expect(signMatch).not.toBeNull()
    })
})
