import { Message, MessageEmbedOptions, PermissionString } from "discord.js"
import { TextCommandOptions } from "../../typings/index.d"
import BetterClient from "../extensions/BlobbyClient"

export default class TextCommand {
    /**
     * The name for our text command.
     */
    public readonly name: string

    /**
     * The description for our text command.
     */
    public readonly description: string

    /**
     * The aliases for this text command.
     */
    public readonly aliases: string[]

    /**
     * The permissions a user would require to execute this text command.
     */
    public readonly permissions: PermissionString[]

    /**
     * The permissions the client requires to execute this text command.
     */
    private readonly clientPermissions: PermissionString[]

    /**
     * Whether this text command is only for developers.
     */
    private readonly devOnly: boolean

    /**
     * Whether this text command is only to be used in guilds.
     */
    private readonly guildOnly: boolean

    /**
     * Whether this slash command is only to be used by guild owners.
     */
    private readonly ownerOnly: boolean

    /**
     * The cooldown for this slash command.
     */
    public readonly cooldown: number

    /**
     * Our client.
     */
    public readonly client: BetterClient

    /**
     * Create our text command,
     * @param name - The name of our text command.
     * @param client - Our client.
     * @param options - The options for our text command.
     */
    constructor(name: string, client: BetterClient, options: TextCommandOptions) {
        this.name = name
        this.description = ""
        this.aliases = options.aliases || []

        this.permissions = options.permissions || []
        this.clientPermissions = client.config.requiredPermissions.concat(options.clientPermissions || [])

        this.devOnly = options.devOnly || false

        this.guildOnly = options.guildOnly || false
        this.ownerOnly = options.ownerOnly || false

        this.cooldown = options.cooldown || 0

        this.client = client
    }

    /**
     * Validate this interaction to make sure this text command can be executed.
     * @param message The interaction that was created.
     * @returns Options for the embed to send or null if the text command is valid.
     */
    public async validate(message: Message): Promise<{ title: string; description: string } | null> {
        if (this.guildOnly && !message.inGuild()) {
            return {
                title: "Missing Permissions",
                description: "This command can only be used in guilds.",
            }
        }
        if (this.ownerOnly && message.guild?.ownerId !== message.author.id) {
            return {
                title: "Missing Permissions",
                description: "This command can only be ran by the owner of this guild!",
            }
        }
        if (this.devOnly && !(await this.client.functions.isAdmin(message.author.id))) {
            return {
                title: "Missing Permissions",
                description: "This command can only be used by my developers!",
            }
        }
        if (message.guild && this.permissions.length && !message.member?.permissions.has(this.permissions)) {
            return {
                title: "Missing Permissions",
                description: `You need the ${this.permissions
                    .map((permission) => `**${this.client.functions.getPermissionName(permission)}**`)
                    .join(", ")} permission${this.permissions.length > 1 ? "s" : ""} to run this command.`,
            }
        }
        if (message.guild && this.clientPermissions.length && !message.guild?.me?.permissions.has(this.clientPermissions)) {
            return {
                title: "Missing Permissions",
                description: `I need the ${this.clientPermissions
                    .map((permission) => `**${this.client.functions.getPermissionName(permission)}**`)
                    .join(", ")} permission${this.clientPermissions.length > 1 ? "s" : ""} to run this command.`,
            }
        }

        return null
    }

    /**
     * This function must be evaluated to true or else this text command will not be executed.
     * @param _message The message that was created.
     */
    public async preCheck(_message: Message): Promise<[boolean, MessageEmbedOptions?]> {
        return [true]
    }

    /**
     * Run this text command.
     * @param _message The message that was created.
     * @param _args
     */
    public async run(_message: Message, _args: string[]): Promise<any> {}
}
