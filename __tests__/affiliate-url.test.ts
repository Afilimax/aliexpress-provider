import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AliExpressProvider } from "../src/index"

const options = { appKey: "key", appSecret: "secret", trackingId: "track" }

const linkResponse = (resp_code: number, links: Array<{ promotion_link: string }>) => ({
    aliexpress_affiliate_link_generate_response: {
        resp_result: {
            result: { promotion_links: { promotion_link: links }, tracking_id: "track" },
            resp_code,
            resp_msg: resp_code === 200 ? "OK" : "FAIL",
        },
        request_id: "req",
    },
})

const queryResponse = (result: unknown, resp_code = 200) => ({
    aliexpress_affiliate_product_query_response: {
        resp_result: { result, resp_code, resp_msg: "msg" },
        request_id: "req",
    },
})

function mockFetch(body: unknown, ok = true, status = 200) {
    const fetchMock = vi.fn().mockResolvedValue({ ok, status, json: async () => body })
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

describe("AliExpressProvider.createAffiliateUrl", () => {
    const provider = new AliExpressProvider(options)

    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 0, 2, 3, 4, 5))
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
    })

    it("returns the first promotion link and sends a signed request", async () => {
        const fetchMock = mockFetch(linkResponse(200, [{ promotion_link: "https://s.click.aliexpress.com/e/abc" }]))

        await expect(provider.createAffiliateUrl("https://www.aliexpress.com/item/1.html")).resolves.toBe(
            "https://s.click.aliexpress.com/e/abc",
        )

        const [calledUrl, init] = fetchMock.mock.calls[0]
        const query = new URL(calledUrl).searchParams

        expect(init.method).toBe("GET")
        expect(query.get("method")).toBe("aliexpress.affiliate.link.generate")
        expect(query.get("app_key")).toBe("key")
        expect(query.get("tracking_id")).toBe("track")
        expect(query.get("source_values")).toBe("https://www.aliexpress.com/item/1.html")
        expect(query.get("timestamp")).toBe("2026-01-02 03:04:05")
        expect(query.get("sign")).toMatch(/^[A-F0-9]{64}$/)
    })

    it("throws when the http request fails", async () => {
        mockFetch({}, false, 500)

        await expect(provider.createAffiliateUrl("https://www.aliexpress.com/item/1.html")).rejects.toThrow(
            "AliExpress API request failed with status 500",
        )
    })

    it("throws when the api returns an error code", async () => {
        mockFetch(linkResponse(400, []))

        await expect(provider.createAffiliateUrl("https://www.aliexpress.com/item/1.html")).rejects.toThrow(
            "AliExpress API Error: 400 - FAIL",
        )
    })

    it("throws when the promotion link is missing", async () => {
        mockFetch(linkResponse(200, []))

        await expect(provider.createAffiliateUrl("https://www.aliexpress.com/item/1.html")).rejects.toThrow(
            "AliExpress API response missing promotion link",
        )
    })
})

describe("AliExpressProvider.searchProducts edge cases", () => {
    const provider = new AliExpressProvider(options)

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it("returns an empty list when the response has no result", async () => {
        mockFetch(queryResponse(undefined))

        await expect(provider.searchProducts({ query: "x" })).resolves.toEqual([])
    })

    it("returns an empty list when the result has no products", async () => {
        mockFetch(queryResponse({ current_record_count: 0 }))

        await expect(provider.searchProducts({ query: "x" })).resolves.toEqual([])
    })

    it("turns missing or unparsable values into null", async () => {
        mockFetch(
            queryResponse({
                current_record_count: 1,
                products: {
                    product: [
                        {
                            product_id: 1,
                            product_title: "Produto",
                            product_detail_url: "https://www.aliexpress.com/item/1.html",
                            product_main_image_url: null,
                            target_sale_price: "abc",
                            target_original_price: "abc",
                            target_sale_price_currency: "BRL",
                            evaluate_rate: "abc%",
                            lastest_volume: null,
                        },
                        {
                            product_id: 2,
                            product_title: "Outro",
                            product_detail_url: "https://www.aliexpress.com/item/2.html",
                            product_main_image_url: null,
                            target_sale_price: null,
                            target_original_price: null,
                            target_sale_price_currency: "BRL",
                            evaluate_rate: null,
                            lastest_volume: null,
                        },
                    ],
                },
            }),
        )

        const items = await provider.searchProducts({ query: "x" })

        for (const item of items) {
            expect(item.price).toEqual({ value: null, originalValue: null, currency: "BRL" })
            expect(item.rating).toEqual({ average: null, totalReviews: null })
        }
    })
})
