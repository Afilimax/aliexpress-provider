import { AffiliateProvider } from "@afilimax/core"
import crypto from "node:crypto"

export interface AliexpressAffiliateLinkGenerateResponse {
    aliexpress_affiliate_link_generate_response: {
        resp_result: {
            result: {
                promotion_links: {
                    promotion_link: Array<{ promotion_link: string }>
                }
                tracking_id: string
            }
            resp_code: number
            resp_msg: string
        }
        request_id: string
    }
}

export type AliExpressProviderOptions = {
    appKey: string
    appSecret: string
    trackingId: string
}

export class AliExpressProvider extends AffiliateProvider<AliExpressProviderOptions> {
    readonly name = "AliExpress"

    readonly domains = ["aliexpress.com"]

    private generateSignature(params: Record<string, string>): string {
        const sorted = Object.keys(params).sort()
        const base = sorted.map((k) => k + params[k]).join("")

        const hash = crypto.createHmac("sha256", this.options.appSecret).update(base).digest("hex")

        return hash.toUpperCase()
    }

    private getTimestamp(): string {
        const date = new Date()
        const Y = date.getFullYear()
        const M = String(date.getMonth() + 1).padStart(2, "0")
        const D = String(date.getDate()).padStart(2, "0")
        const h = String(date.getHours()).padStart(2, "0")
        const m = String(date.getMinutes()).padStart(2, "0")
        const s = String(date.getSeconds()).padStart(2, "0")
        return `${Y}-${M}-${D} ${h}:${m}:${s}`
    }

    async createAffiliateUrl(url: string): Promise<string> {
        const method = "aliexpress.affiliate.link.generate"
        const timestamp = this.getTimestamp()

        const params: Record<string, string> = {
            app_key: this.options.appKey,
            method: method,
            timestamp: timestamp,
            sign_method: "sha256",
            v: "2.0",
            format: "json",
            tracking_id: this.options.trackingId,
            promotion_link_type: "0",
            source_values: url,
        }

        const sign = this.generateSignature(params)

        const queryParams = new URLSearchParams({ ...params, sign }).toString()

        const response = await fetch(`https://api-sg.aliexpress.com/sync?${queryParams}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
        })

        if (!response.ok) {
            throw new Error(`AliExpress API request failed with status ${response.status}`)
        }

        const data = (await response.json()) as AliexpressAffiliateLinkGenerateResponse
        const respResult = data.aliexpress_affiliate_link_generate_response.resp_result

        if (respResult.resp_code !== 200) {
            throw new Error(`AliExpress API Error: ${respResult.resp_code} - ${respResult.resp_msg}`)
        }

        const promotionLink = respResult.result.promotion_links.promotion_link[0]?.promotion_link

        if (!promotionLink) {
            throw new Error(`AliExpress API response missing promotion link: ${JSON.stringify(data)}`)
        }

        return promotionLink
    }
}
