
interface ExperimentScenaristSettings extends ExperimentSettings {

   channel: ChannelNoUI
   channelExperimentIndexer: number
}

interface ExperimentScenarioInitOptions extends ExperimentInitOptions {

    kind: Kind.ScenaristExperiment
    title: string
    ambientColor: number
    // scenarioId: ExperimentScenarioId
}

interface RollingContext {

    // skip?: boolean
    // verbose?: boolean

    debugDesign: boolean

    // createPElement(arg: any): void
    // createHElement(arg: any, level?: number): HTMLHeadingElement
    // createAsideElement(arg: any): void

    channel: ChannelNoUI
    context2D: CanvasRenderingContext2D

    signalTermination(): void
    sendSetStartFrame(startFrame: number): void
}

abstract class ExperimentScenarioContainerBase implements ExperimentContainerInterface {

    experimentIndexer: number | null = null
    protected laboratory: ScenaristLaboratory

    // protected abstract experimentSettings: ExperimentContainerSettings

    private _domContainer: HTMLElement
    get domContainer() { return this._domContainer }
    protected _title = 'ExperimentScenario'
    get title() { return this._title }

    // protected abstract createExperiment(experimentOptions: ExperimentScenarioOptions): ExperimentInterface
    protected abstract createCustomExperiment(settings: ExperimentScenaristSettings, options: ExperimentInitOptions): ExperimentInterface
    protected experiment?: ExperimentInterface
    get active() { return this.experiment !== undefined }

    constructor(laboratory: ScenaristLaboratory, options: ExperimentContainerOptions = {}) {

        this.laboratory = laboratory

        // TODO (1) : i18n
        if (options.title !== undefined) {
            this._title = options.title
        }

        console.log('ExperimentScenarioContainerBase > constructor > ' + this._title)

        this._domContainer = options.domContainer !== undefined ? options.domContainer : document.body
    }

    // abstract activate(initOptions?: ExperimentInitOptions): void

    activate(experimentOptions: ExperimentScenarioInitOptions): void {

        console.log('ExperimentScenarioContainerBase > Activate verify experiment ' + this.title)

        if (this.experimentIndexer === null) {
            throw 'no experimentIndexer'
        }

        this.experiment = this.createCustomExperiment({
             container: this,
             channel: this.laboratory.channel,
             channelExperimentIndexer: this.experimentIndexer 
             }, experimentOptions)

        if (this.onKeyboard) {
            document.addEventListener('keydown', this.onKeyboard)
        }
        if (this.onMouseMove) {
            document.addEventListener('mousemove', this.onMouseMove)
        }

        this.domContainer.addEventListener('resize', this.onDomResize)
    }

    deactivate(): void {

        if (this.onKeyboard) {
            document.removeEventListener('keydown', this.onKeyboard)
        }
        if (this.onMouseMove) {
            document.removeEventListener('mousemove', this.onMouseMove)
        }

        this.domContainer.removeEventListener('resize', this.onDomResize)

        if (this.experiment && this.experiment.destructor) {
            this.experiment.destructor()
        }

        this.experiment = undefined
    }

    onKeyboard: { (_event: KeyboardEvent): void } = (event: KeyboardEvent) => {

        switch (event.key) {

            case 't':
                console.log('test key t :)')
                break
            default:
                console.warn('No action defined for key ' + event.key)
        }

        // TODO (3) : if (this.experiment) { this.experiment.customOnKeyboard(event)}
    }

    onMouseMove?: { (_event: MouseEvent): void } = undefined

    private onDomResize = () => {

        if (this.experiment) {
            this.experiment.resize(this.domContainer.offsetWidth, this.domContainer.offsetHeight)
        }
    }

    animationStep(): void {
        throw new Error("Animation not implemented.")
    }
}

abstract class SesamScenarist extends Sesam {
    
    abstract signalRollScenario(): void
}

interface ScenaristConstructor {
    new(ctx: RollingContext): SesamScenarist
}

interface ScenaristCollection {
    [index: number]: ScenaristConstructor
    length: number
}

abstract class SceneScenarist extends Sesam implements ScenarioInterface, RollingContext {

    debugDesign  = false

    performances: number[] = []
    performanceIndex = 0

    physicalStepPerVisualStep = 1

    protected domContainer: HTMLElement

    protected scenaristIndex = 0
    protected scenaristPool: ScenaristCollection

    protected channelExperimentIndexer: number
    channel: ChannelNoUI

    context2D: CanvasRenderingContext2D


    protected animationStepOptions: AnimationStepOptions = {
    }

    setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void {
        this.animationStepOptions = visualStepOptions
    }

    constructor(settings: ExperimentScenaristSettings, scenarios: ScenaristCollection) {
        super()

        console.log('SceneScenarist > Init')


            // FIXME (0) : scene must know it's experiment container id 
            this.channelExperimentIndexer = settings.channelExperimentIndexer
            this.channel = settings.channel

        this.scenaristPool = scenarios

        this.domContainer = settings.container.domContainer

        let canvas2D = document.createElement('canvas')
        // FIXME (0) : ugly anti-aliasing (compared to HTML render)
       // this.context2D = <CanvasRenderingContext2D>canvas2D.getContext("2d", {alpha: false})
       this.context2D = <CanvasRenderingContext2D>canvas2D.getContext("2d", )

        console.warn('local UI ' + canvas2D.width + ' ' + canvas2D.height)

        let localUI = true // TODO (1) : options
        if (localUI) {
            settings.container.domContainer.appendChild(canvas2D)
        }
    
        this.init(SceneScenarist.States.Init)
    }

    eventToString(evtId: Events): string {
        return SceneScenarist.Events[evtId]

    }
    stateToString(stateId: States): string {
        return SceneScenarist.States[stateId]
    }

  /*  createPElement(arg: any) {
        console.log(arg)

        let e = document.createElement('p')
        e.textContent = arg
        this.domContainer.appendChild(e)
    }

    createHElement(arg: any, level = 3): HTMLHeadingElement {

        let e: HTMLHeadingElement = <HTMLHeadingElement>document.createElement('h' + level)
        e.textContent = arg
        this.domContainer.appendChild(e)

        return e
    }

    createAsideElement(arg: any) {
        console.warn(arg)

        let e = document.createElement('aside')
        e.setAttribute('role', 'alert')
        e.textContent = arg
        this.domContainer.appendChild(e)
    } */

    signalRolling() {

        console.log('signalRolling ' + this.description)
        this.event({ evt: SceneScenarist.Events.RunScenarioCollection })
    }

    signalTermination() {

        console.log('signalTermination ' + this.description)
        this.event({ evt: SceneScenarist.Events.NextScenarist })
    }

    sendSetStartFrame(startFrame: number) {

        console.log('sendSetStartFrame')
        let setStartFrame: ScenaristConfigurationMessage = {
            kind: ExperimentMessageKind.ScenaristConfiguration,
            experimentId: this.channelExperimentIndexer,
            startFrame: startFrame
        }
        let requestSetSandBoxDirectory: ExperimentRequest = {
            type: MessageType.ExperimentMessage,
            message: setStartFrame
        }
        this.channel.send(requestSetSandBoxDirectory)
    }

  /*  render(_scenaristModel: ScenaristCollection) {

        console.log('SceneScenario > render ')

        console.log('run scenario collection ' + this.description)
        this.event({ evt: SceneScenarist.Events.RunScenarioCollection })

    } */

    protected stateTable: StatesTable = {

        [SceneScenarist.States.Init]: {
            [SceneScenarist.Events.RunScenarioCollection]: () => {

                console.info(this.description, 1)
                this.event({ evt: SceneScenarist.Events.NextScenarist })
                return SceneScenarist.States.Rolling
            }
        },

        [SceneScenarist.States.Rolling]: {
            [SceneScenarist.Events.NextScenarist]: () => {

                if (this.scenaristIndex < this.scenaristPool.length) {

                    console.log('SceneScenarist > NextScenarist > pre ' + this.scenaristIndex + ' of ' + this.scenaristPool.length)

                    let scenaristConstructor: ScenaristConstructor = this.scenaristPool[this.scenaristIndex]
                    let scenarist: SesamScenarist = new scenaristConstructor(this)

                    scenarist.signalRollScenario()

                    console.log('TestCollection > nextTest > post ' + this.scenaristIndex + ' of ' + this.scenaristPool.length)
                    this.scenaristIndex++

                    return SceneScenarist.States.Rolling
                }
                else {

                    console.log('TestCollection > nextTest > done ' + this.scenaristIndex + ' of ' + this.scenaristPool.length)

                    return SceneScenarist.States.Done
                }
            },
            [SceneScenarist.Events.Error]: () => {
                console.log('> runtest error ' + this.scenaristIndex)
            },
            [SceneScenarist.Events.Timeout]: () => {
                console.log('> runtest timeout ' + this.scenaristIndex)
            }
        },

        [SceneScenarist.States.Done]: {

        }
    }
}

namespace SceneScenarist {
    export enum States { Init, Rolling, Done }
    export enum Events { RunScenarioCollection, Error, NextScenarist, Timeout }
}

abstract class ExperimentScenaristBase implements ExperimentInterface {

    setAnimationStepOptions(_stepOptions: AnimationStepOptions): void {
        throw new Error("Local scenarist UI not implemented.")
    }

    animationStep(_timestamp: number): void {
        throw new Error("Local scenarist UI not implemented.")
    }

    resize(_w: number, _h: number): void {
        throw new Error("Local scenarist UI not implemented.")
    }
}


/*
interface ScenarioFunctionInterface {
    // (ctx: SesamScenarist): void
    // (ctx: ScenarioContext): void
    (): void
}

abstract class SesamScenarist extends Sesam {

    ctx: ScenarioContext

    abstract scenarioPool: ScenarioFunctionInterface[]
    scenarioIndex = 0
    scenarioSuccess = true

    constructor(ctx: ScenarioContext) {
        super()

        this.ctx = ctx
        // super(States.Init)

        this.init(SesamScenarist.States.Init)
    }

    eventToString(evtId: Events): string {
        return SesamScenarist.Events[evtId]

    }

    stateToString(stateId: States): string {
        return SesamScenarist.States[stateId]
    }

    signalRollScenario() {
        console.log('run scenario ' + this.description)
        this.event({ evt: SesamScenarist.Events.RollScenario })
    }

    // TODO (2) : promise
    protected ventilate() {

        this.clearScheduledEvent({ evt: SesamScenarist.Events.Timeout })

        if (this.scenarioSuccess === true) {
            console.log('ventilate > generate nextTest')
            this.event({ evt: SesamScenarist.Events.NextScenario })
        }
        else {
            console.warn('ventilate > generate error')
            this.event({ evt: SesamScenarist.Events.Error })
        }
    }

    protected stateTable: StatesTable = {

        [SesamScenarist.States.Init]: {
            [SesamScenarist.Events.RollScenario]: () => {

                this.ctx.info(this.description, 1)
                this.event({ evt: SesamScenarist.Events.NextScenario })

                return SesamScenarist.States.Testing
            }
        },

        [SesamScenarist.States.Testing]: {
            [SesamScenarist.Events.NextScenario]: () => {

                if (this.scenarioIndex < this.scenarioPool.length) {

                    this.scheduleEvent({ evt: SesamScenarist.Events.Timeout }, 20000) // 20s

                    console.log('Testing > nextTest > pre ' + this.scenarioIndex)

                    // todo empiler messages

                    this.scenarioPool[this.scenarioIndex]()
                    this.ventilate()

                    console.log('Testing > nextTest > post ' + this.scenarioIndex)
                    this.scenarioIndex++

                    return SesamScenarist.States.Testing
                }
                else {

                    console.log('Testing > nextTest > done ' + this.scenarioIndex)

                    this.ctx.signalTermination()

                    return SesamScenarist.States.Done
                }
            },
            [SesamScenarist.Events.Error]: () => {
                console.log('> runtest error ' + this.scenarioIndex)
            },
            [SesamScenarist.Events.Timeout]: () => {
                console.log('> runtest timeout ' + this.scenarioIndex)
            }
        },

        [SesamScenarist.States.Done]: {
            [Events.Success]: () => {

                console.log('> success')

                this.clearScheduledEvent({ evt: Events.Timeout })

                // return States.Operating;
            }
        }

    }
}

namespace SesamScenarist {
    export enum States { Init, Testing, Done }
    export enum Events { RollScenario, Error, NextScenario, Timeout }
}

*/
