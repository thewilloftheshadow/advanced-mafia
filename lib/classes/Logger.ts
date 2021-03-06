/* eslint-disable no-console */
import {
    bgGreenBright, bgMagentaBright, bgRedBright, bgYellowBright, blackBright, bold
} from "colorette"
import { format } from "util"
import { WebhookClient, WebhookMessageOptions } from "discord.js"
import init from "../utilities/sentry"
import { GenerateTimestampOptions } from "../../typings/index.d"

export class Logger {
    /**
     * Our Sentry logger.
     */
    public readonly sentry

    /**
     * The list of webhooks our Logger can use.
     */
    private readonly webhooks: Record<string, WebhookClient>

    constructor() {
        this.sentry = init()
        this.webhooks = {}
    }

    /**
     * Get the current timestamp.
     * @returns The current timestamp in the format of [DD/MM/YYYY \@ HH:mm:SS].
     */
    private static get timestamp(): string {
        const now = new Date()
        const [year, month, day] = now.toISOString().substr(0, 10).split("-")
        return `${year}/${month}/${day} ${now.toISOString().substr(11, 8)}`
    }

    /**
     * Log out a debug statement.
     * @param args - The arguments to log out.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public debug(...args: string | any): void {
        console.log(bold(bgMagentaBright(`[${Logger.timestamp}]`)), bold(format(...args)))
    }

    /**
     * Log out a debug statement.
     * @param args - The arguments to log out.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public info(...args: string | any): void {
        console.log(bold(bgGreenBright(blackBright(`[${Logger.timestamp}]`))), bold(format(...args)))
    }

    /**
     * Log out a debug statement.
     * @param args - The arguments to log out.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public warn(...args: string | any): void {
        console.log(bold(bgYellowBright(blackBright(`[${Logger.timestamp}]`))), bold(format(...args)))
    }

    /**
     * Log out an error statement.
     * @param error - The error to log out.
     * @param args - TBe arguments to log out.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public error(error: any | null, ...args: string | any): void {
        if (error) console.log(bold(bgRedBright(`[${Logger.timestamp}]`)), error, bold(format(...args)))
        else console.log(bold(bgRedBright(`[${Logger.timestamp}]`)), bold(format(...args)))
    }

    /**
     * Log a message to Discord through a webhook.
     * @param type - The type to log out, make sure that the webhook is provided in your .env file in the format as \{TYPE\}_HOOK=...
     * @param options - The options for the webhook you want to send.
     */
    public async webhookLog(type: string, options: WebhookMessageOptions) {
        if (!type) throw new Error("No webhook type provided!")
        else if (!this.webhooks[type.toLowerCase()]) {
            const webhookURL = process.env[`${type.toUpperCase()}_HOOK`]
            if (!webhookURL) throw new Error(`Invalid webhook type provided!`)
            this.webhooks[type.toLowerCase()] = new WebhookClient({
                url: webhookURL,
            })
        }
        return this.webhooks[type.toLowerCase()].send(options)
    }

    public async gameLog(msg: string) {
        return this.webhookLog("game", {
            content: `${this.generateTimestamp()}: ${msg}`,
        })
    }

    /**
     * Generate a unix timestamp for Discord to be rendered locally per user.
     * @param options - The options to use for the timestamp.
     * @returns The generated timestamp.
     */
    private generateTimestamp(options?: GenerateTimestampOptions): string {
        let timestamp = options?.timestamp || new Date()
        const type = options?.type || "f"
        if (timestamp instanceof Date) timestamp = timestamp.getTime()
        return `<t:${Math.floor(timestamp / 1000)}:${type}>`
    }
}

export default new Logger()
