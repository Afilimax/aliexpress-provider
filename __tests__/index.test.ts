import { expect, test } from "vitest"
import { AliExpressProvider } from "../src/index"

test("AliExpressProvider should be instantiable", () => {
    const provider = new AliExpressProvider({
        appKey: "test",
        appSecret: "test",
        trackingId: "test",
    })
    expect(provider).toBeInstanceOf(AliExpressProvider)
    expect(provider.name).toBe("AliExpress")
})

test("AliExpressProvider should support aliexpress.com", () => {
    const provider = new AliExpressProvider({
        appKey: "test",
        appSecret: "test",
        trackingId: "test",
    })
    expect(provider.supportsUrl("https://www.aliexpress.com/item/123.html")).toBe(true)
})
