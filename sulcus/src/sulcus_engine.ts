
import { dbg } from '../../gyrus/src/services/logger'
import { c2s_ChannelMessage, MessageType, ExperimentRequest, ExperimentAck, ExperimentMessage } from '../../gyrus/src/services/shared/messaging'
import { UserSession, UserSessionInterface } from '../../gyrus/src/services/dispatcher'
import { SulcusMessageType, GeneticSearchAck, DeeplearnAck, ExperimentMessageKind, ScenaristConfigurationMessage } from "./shared/messaging"
import { BaseServerEngine } from "../../gyrus/src/base/engine"
import { SystemOperator } from './system_operator'
import { AsyncPersistor } from '../../gyrus/src/services/persistor'
import { SulcusConfigurationInterface } from '../../configuration'

export class SulcusServerEngine extends BaseServerEngine {

    protected sysOp: SystemOperator

    protected frameIndex = 0

    constructor(config: SulcusConfigurationInterface, protected db: AsyncPersistor) {
        super(config, db)

        this.sysOp = new SystemOperator(config)
    }

    dispatchWsCommand(cmd: c2s_ChannelMessage, user: UserSession): void {

        // TODO (1) : Sesam
        if (cmd.type === MessageType.ExperimentMessage) {
            this.dispatchExperimentRequest(<ExperimentMessage>(<ExperimentRequest>cmd).message, user)
        }
        else if (cmd.type === SulcusMessageType.Deeplearn) {
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
            console.warn('dispatchWsCommand > Unhandled type ' + cmd.type + ' ' + SulcusMessageType[cmd.type])
            super.dispatchWsCommand(cmd, user)
        }
    }

    protected dispatchExperimentRequest(m: ExperimentMessage | undefined, user: UserSession) {

        console.log('dispatchExperimentRequest > user: ' + user)
        console.log(m)

        if (m && m.kind === ExperimentMessageKind.ScenaristConfiguration ) {

           this.dispatchScenaristRequest(m, user)
/*
            this.sysOp.checkDirectory(m.message, (directoryName: string) => {
                user.send(<ExperimentAck>{
                    type: MessageType.ExperimentMessage,
                    message: 'out/'
                })
            }) */

        }
        else {
            console.error('protocol error : no message in ExperimentRequest')
        }
    }

    protected dispatchScenaristRequest(m: ScenaristConfigurationMessage | undefined, user: UserSession) {

        console.log('dispatchExperimentRequest > user: ' + user)
        console.log(m)

        if (m && m.kind === ExperimentMessageKind.ScenaristConfiguration ) {

            console.log(m)
 
            let ackGist: ScenaristConfigurationMessage = {
                experimentId: m.experimentId,
                kind: ExperimentMessageKind.ScenaristConfiguration
            }

            if (m.sandboxPath !== undefined) {

                if (m.sandboxPath !== null) {
                    // FIXME/TODO (2) : async, check directory first
                    console.error('FIXME async or TODO Sync')
                    //this.sysOp.sandboxPath = ackGist.sandboxPath
                }

                ackGist.sandboxPath = this.sysOp.sandboxPath
            }
            if (m.startFrame !== undefined) {

                
                if (m.startFrame !== null) { 

                    console.warn('SET startFrame ' +  m.startFrame)
                    // FIXME (1) : if frameIndex is modified sync, risk that pilling write requests use wrong frameIndex ?
                    this.frameIndex = m.startFrame  
                }

                ackGist.startFrame = this.frameIndex
            }
            // TODO (4) : resolution

            let ack: ExperimentAck = {
                type: MessageType.ExperimentMessage,
                message: ackGist
            }

            user.send(ack)

/*
            this.sysOp.checkDirectory(m.message, (directoryName: string) => {
                user.send(<ExperimentAck>{
                    type: MessageType.ExperimentMessage,
                    message: 'out/'
                })
            }) */

        }
        else {
            console.error('protocol error : no message in ExperimentRequest')
        }
    }


    protected startLearning() {

        dbg.log('start learning')
    }

    dispatchBinary(buffer: Buffer, _user: UserSessionInterface): void {
        // console.log('SulcusServerEngine > dispatchBinary') 
        // console.log(buffer)
        
        this.sysOp.saveToPNG((this.frameIndex++).toString().padStart(6,'0'), buffer, 1920, 1080 )
    }
   



   /* public void handle(Buffer event) {
        if (event.length() > 100) {
            byte[] bytes = event.getBytes(0, event.length());

            String frame = new String(bytes);
            int frameNr = Integer.parseInt(frame.substring(0, frame.indexOf("data:")));
            String frameData = frame.substring(frame.indexOf("base64,") + 7);
            BASE64Decoder decoder = new BASE64Decoder();
            try {
                byte[] imageByte = decoder.decodeBuffer(frameData);
                File f = new File("pngout/" + String.format("%08d", frameNr) + "-frame.png");
                FileOutputStream fOut = new FileOutputStream(f);
                fOut.write(imageByte);
                fOut.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

        }
    } */


   
}

