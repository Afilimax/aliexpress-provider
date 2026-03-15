import { describe, it, expect } from "vitest"
import { AliExpressProvider } from "../src/index"
import fs from "node:fs"
import path from "node:path"

// O arquivo auth.json deve estar na pasta __tests__
const AUTH_PATH = path.join(__dirname, "auth.json")

let AUTH_DATA = {
    appKey: "",
    appSecret: "",
    trackingId: ""
}

if (fs.existsSync(AUTH_PATH)) {
    try {
        AUTH_DATA = JSON.parse(fs.readFileSync(AUTH_PATH, "utf-8"))
    } catch (error: any) {
        console.error("❌ Erro ao ler auth.json:", error.message)
    }
}

describe("AliExpressProvider Practical Test", () => {
    it("should create a real affiliate URL (integration)", async () => {
        if (!AUTH_DATA.appKey || !AUTH_DATA.appSecret || !AUTH_DATA.trackingId) {
            console.warn(`⚠️ Pulando teste prático: Arquivo auth.json não encontrado ou incompleto em: ${AUTH_PATH}`)
            return
        }

        const provider = new AliExpressProvider(AUTH_DATA)

        const testUrl = "https://pt.aliexpress.com/item/1005003430339815.html"

        try {
            console.log(`Gerando link para: ${testUrl}`)
            const affiliateUrl = await provider.createAffiliateUrl(testUrl)

            expect(affiliateUrl).toMatch(/https:\/\/s\.click\.aliexpress\.com\/.*/)
            
            console.log("✅ Sucesso!")
            console.log(`🔗 Link gerado: ${affiliateUrl}`)
        } catch (error: any) {
            console.error("❌ Falha no teste prático:")
            console.error(error.message)
            throw error
        }
    })
})
