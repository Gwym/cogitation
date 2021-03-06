import { c2s_ChannelMessage, s2c_ChannelMessage, ExperimentMessage } from "../../../gyrus/src/services/shared/messaging";


// FIXME (0) : REF EXTEND_ENUM
// cannot define  enum SulcusMessageType { Deeplearn = MessageType._last + 1 }
export enum SulcusMessageType { Deeplearn = 8, GeneticSearch, Bootstrap, Recursion, _last }

export interface DeeplearnRequest extends c2s_ChannelMessage {
    type: SulcusMessageType.Deeplearn
}

export interface DeeplearnAck extends s2c_ChannelMessage {
    type: SulcusMessageType.Deeplearn
}

export interface GeneticSearchRequest extends c2s_ChannelMessage {
    type: SulcusMessageType.GeneticSearch
}

export interface GeneticSearchAck extends s2c_ChannelMessage {
    type: SulcusMessageType.GeneticSearch
}

export interface BootstrapRequest extends c2s_ChannelMessage {
    type: SulcusMessageType.Bootstrap
}

export interface BootstrapAck extends s2c_ChannelMessage {
    type: SulcusMessageType.Bootstrap
}

export interface RecursionRequest extends c2s_ChannelMessage {
    type: SulcusMessageType.Recursion
}

export interface RecursionAck extends s2c_ChannelMessage {
    type: SulcusMessageType.Recursion
}

export enum ExperimentMessageKind { ScenaristConfiguration }

// undefined => ignore ; null => request value ; value => set
export interface ScenaristConfigurationMessage extends ExperimentMessage   {
    kind: ExperimentMessageKind.ScenaristConfiguration
    startFrame?: number | null 
    resolutionX?: number | null
    resolutionY?: number | null
    sandboxPath?: string | null
}
  


