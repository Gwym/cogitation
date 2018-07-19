import { dbg } from '../services/logger'
import { UserOptions, MessageType, c2s_ChannelMessage, ErrMsg, AdminRequest } from '../services/shared/messaging'
import { Dispatcher, UserSession } from '../services/dispatcher'
import { AdminDispatcher } from './admin'

export class BaseServerEngine extends Dispatcher {

    // protected db: AsyncPersistor
    // TODO (1) : admin only on conditional compiling ? option ?
    protected adminDispatcher: AdminDispatcher = new AdminDispatcher(this)

    createSession(userOptions: UserOptions): UserSession {

        let wsu: UserSession | undefined

        do {
            wsu = new UserSession(userOptions)
            dbg.log('create session : ' + wsu.sessionId)

            if (this.userSessions[wsu.sessionId]) {
                wsu = undefined
            }
        }
        while (wsu === undefined)

        this.userSessions[wsu.sessionId] = wsu

        return wsu
    }

    dispatchWsCommand(cmd: c2s_ChannelMessage, user: UserSession): void {

       /* if (cmd.type === MessageType. ...) {

            ...
        } else */
        if (cmd.type === MessageType.Admin) {
            // TODO (0) : if (user.isAdministrator) ... // access management : user or global ? 
            this.adminDispatcher.dispatchWsAdminCommand(<AdminRequest>cmd, user)
        }
        else {
            console.error('dispatchWsCommand > Unknown type ' + cmd.type)
            user.send(ErrMsg.UnkownCommand)
        }
    }
}
