
import { dbg } from '../../gyrus/src/services/logger'
import { c2s_ChannelMessage } from '../../gyrus/src/services/shared/messaging'
import { UserSession } from '../../gyrus/src/services/dispatcher'
import { SulcusMessageType, GeneticSearchAck, DeeplearnAck } from "./shared/messaging"
import { BaseServerEngine } from "../../gyrus/src/base/engine";

export class SulcusServerEngine extends BaseServerEngine { 

    dispatchWsCommand(cmd: c2s_ChannelMessage, user: UserSession): void {

        // TODO (1) : Sesam
        if (cmd.type === SulcusMessageType.Deeplearn) {
            dbg.log('Deeplearn')
            dbg.log(cmd)
            let ack: DeeplearnAck = { type: SulcusMessageType.Deeplearn }
            user.send(ack)
            // TODO () SESAM event
            setTimeout(this.startLearning, 1000)
        }
        else if (cmd.type === SulcusMessageType.GeneticSearch) {
            dbg.log('GeneticSearch')
            let ack: GeneticSearchAck = { type: SulcusMessageType.GeneticSearch }
            user.send(ack)
        }
        else {
            super.dispatchWsCommand(cmd, user)
        }
    }

    startLearning() {

        dbg.log('start learning')
    }
}

