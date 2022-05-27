import EventHandler from "../../../lib/classes/EventHandler"

export default class ShardReconnecting extends EventHandler {
    override async run(shardId: number) {
        this.client.logger.info(`Shard ${shardId} is reconnecting to the gateway!`)
    }
}
