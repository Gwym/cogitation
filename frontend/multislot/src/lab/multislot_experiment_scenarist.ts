
namespace InertialGeometryScenarist {

    export class MultislotExperimentScenarioContainer extends ExperimentScenarioContainerBase {

        protected _title = 'MultislotExperimentScenario'

        protected createCustomExperiment(settings: ExperimentScenaristSettings, options: ExperimentScenarioInitOptions): ExperimentInterface {
            return new MultislotExperimentScenario(settings, options)
        }

        onServerAck?(m: ExperimentMessage): void {

            console.log('onServerAck')
            console.log(m)
            if (this.experiment && this.experiment.onServerAck) {
                this.experiment.onServerAck(m)
            }
            else {
                console.error('Container > onServerAck > no handler')
            }
        }
    }

    class MultislotExperimentScenario extends ExperimentScenaristBase {

        protected scenarioCollection: ScenaristCollection = [
            StillImageScenarist
        ]
        protected scene: MultislotSceneScenario

        constructor(settings: ExperimentScenaristSettings, _options: ExperimentScenarioInitOptions) {
            super()

            this.scene = new MultislotSceneScenario(settings, this.scenarioCollection)

            // this.scene.render(this.scenarioCollection)
        }

        onServerAck?(m: ExperimentMessage): void {
            console.log('Experiment > onServerAck')
            console.log(m)

            // TODO (3) : typed interface for messages

            this.scene.onConfigurationAck(m)
        }
    }

    class MultislotSceneScenario extends SceneScenarist {

        description = 'MultislotSceneScenario'

        verbose = true // TODO (1) : options/UI
        debugDesign = true // TODO (1): options/UI

        // protected renderer2D: Canvas2DRenderer

        outputDirectory: HTMLInputElement
        outputDirectoryValidationButton: HTMLInputElement
        rollCutButton: HTMLInputElement

        constructor(settings: ExperimentScenaristSettings, scenarios: ScenaristCollection) {
            super(settings, scenarios)

            let uiContainer = document.createElement('div')
            uiContainer.className = 'ui_container'

            // FIXME (2) : Cannot select empty directory ; Non-standard browser feature 
            /*this.outputDirectory = document.createElement('input')
            this.outputDirectory.type = 'file'
            this.outputDirectory.webkitdirectory = true
            //this.outputDirectory.directory = true
            this.outputDirectory.multiple = true
            this.outputDirectory.placeholder = 'Output directory' // TODO (1) : i18n.
            this.outputDirectory.title = 'Output directory' // TODO (1) : i18n.rolling_output_folder
            this.outputDirectory.addEventListener('change', (event) => {
                
                if (this.outputDirectory.files) {
                    console.log(this.outputDirectory.files.item(0).webkitRelativePath)
                }
            }, false);
            uiContainer.appendChild(this.outputDirectory)*/

            this.outputDirectory = document.createElement('input')
            this.outputDirectory.placeholder = 'Output directory' // TODO (1) : i18n.sulcus.rolling_output_folder
            this.outputDirectory.title = 'Output directory' // TODO (1) : i18n.sulcus.rolling_output_folder
            this.outputDirectory.addEventListener('focus', () => {
                this.outputDirectoryValidationButton.disabled = false
            })
            uiContainer.appendChild(this.outputDirectory)

            this.outputDirectoryValidationButton = document.createElement('input')
            this.outputDirectoryValidationButton.type = 'button'
            this.outputDirectoryValidationButton.value = i18n.gyrus.submit
            this.outputDirectoryValidationButton.disabled = true
            this.outputDirectoryValidationButton.addEventListener('click', () => {
                this.outputDirectoryValidationButton.disabled = true
                this.sendSetDirectory(this.outputDirectory.value)
            }, false);
            uiContainer.appendChild(this.outputDirectoryValidationButton)
            this.sendRequestDirectory()

            this.rollCutButton = document.createElement('input')
            this.rollCutButton.type = 'button'
            this.rollCutButton.value = 'Ça tourne !' // TODO (1) :i18n.sulcus.rolling
            this.rollCutButton.disabled = true
            this.rollCutButton.addEventListener('click', this.rollCutEventHandler)
            uiContainer.appendChild(this.rollCutButton)

            settings.container.domContainer.appendChild(uiContainer)
        }

        rollCutEventHandler = (event: MouseEvent) => { // TODO (1) Touchevent

            console.log(event)

            // TODO (0) : put server in buffer rx mode, set size, set image counter

            this.context2D.canvas.width = 1920
            this.context2D.canvas.height = 1080

            this.signalRolling()
        }

        protected sendSetDirectory(directory: string) {
            console.log('sendSetDirectory message')
            let setDirectoryMessage: ScenaristConfigurationMessage = {
                kind: ExperimentMessageKind.ScenaristConfiguration,
                experimentId: this.channelExperimentIndexer,
                sandboxPath: directory
            }
            let requestSetSandBoxDirectory: ExperimentRequest = {
                type: MessageType.ExperimentMessage,
                message: setDirectoryMessage
            }
            this.channel.send(requestSetSandBoxDirectory)
        }

        protected sendRequestDirectory() {
            console.log('sendRequestDirectory message')
            let getDirectoryMessage: ScenaristConfigurationMessage = {
                kind: ExperimentMessageKind.ScenaristConfiguration,
                experimentId: this.channelExperimentIndexer,
                sandboxPath: null
            }
            let requestSandboxDirectory: ExperimentRequest = {
                type: MessageType.ExperimentMessage,
                message: getDirectoryMessage
            }
            this.channel.send(requestSandboxDirectory)
        }

        onConfigurationAck(m: ScenaristConfigurationMessage) {

            console.log('onConfigurationAck ')
            console.log(m)

            if (m.sandboxPath !== undefined) {
                if (m.sandboxPath !== null) {
                    console.log('ack sandboxPath ' + m.sandboxPath)
                    this.rollCutButton.disabled = false
                    this.outputDirectory.value = m.sandboxPath
                    // FIXME (3) : input width auto-adaptation is CSS dependent
                    this.outputDirectory.style.width = ((m.sandboxPath.length + 1) * 8) + 'px'
                }
                else {
                    this.rollCutButton.disabled = true
                    console.warn('failed to set sandboxPath to ' + this.outputDirectory.value)
                }
            }

            if (m.startFrame !== undefined) {
                console.log('ack startframe ' + m.startFrame)
            }

        }
    }


    interface StillImageScenaristSettings {

        imageSource: string
        startFrame: number
        durationInFrame: number
        easeDurationInFrame: number

    }

    class StillImageScenarist extends Sesam {

        description = 'StillImageScenarist'
        protected rollContext: RollingContext

        protected imageSource: string
        protected image: HTMLImageElement

        // TODO (2) : from constructor to chain in case of variable Scene durations
        protected startFrame: number
        protected currentFrame: number

        protected alphaCurve: Signal

        constructor(rollContext: RollingContext) {
            super()


            // TODO (1) : work in frames or in seconds ?
            // 24 fps => 2s
            let settings: StillImageScenaristSettings = {
                imageSource: 'res/logo_doc.svg',
                startFrame: 0,
                durationInFrame: 90,
                easeDurationInFrame: 15
            }

            this.startFrame = settings.startFrame
            this.currentFrame = this.startFrame

            this.rollContext = rollContext

            this.image = new Image()
            this.imageSource = settings.imageSource

            let alphaMin = 0.0
            let alphaMax = 1.0
            this.alphaCurve = new Signal(settings.durationInFrame)
            InitSignal.constant(this.alphaCurve.r, { value: alphaMax })
            InitSignal.linearRamp(this.alphaCurve.r, { fromX: 0, upToX: settings.easeDurationInFrame, initialValue: alphaMin, finalValue: alphaMax })
            InitSignal.linearRamp(this.alphaCurve.r, {
                fromX: 60 ,
                upToX: 60 + settings.easeDurationInFrame + 1,
                initialValue: alphaMax,
                finalValue: alphaMin
            })
            InitSignal.constant(this.alphaCurve.r, {
                value: alphaMin,
                from: 60 + settings.easeDurationInFrame + 1,
                upTo: settings.durationInFrame
            })

            this.init(StillImageScenarist.States.Init)
        }

        eventToString(evtId: Events): string {
            return StillImageScenarist.Events[evtId]
        }

        stateToString(stateId: States): string {
            return StillImageScenarist.States[stateId]
        }

        signalRollScenario() {
            console.log('signalRollScenario ' + this.description)
            this.event({ evt: StillImageScenarist.Events.RollScenario })
        }

        protected stateTable: StatesTable = {

            [StillImageScenarist.States.Init]: {
                [StillImageScenarist.Events.RollScenario]: () => {

                    console.info('Roll ' + this.description)

                    this.rollContext.sendSetStartFrame(this.startFrame)

                    this.loadImage()

                    return StillImageScenarist.States.Loading
                }
            },

            [StillImageScenarist.States.Loading]: {
                [StillImageScenarist.Events.LoadResources]: () => {

                    console.info('Loaded ' + this.description)

                    this.event({ evt: StillImageScenarist.Events.RollScenario })

                    return StillImageScenarist.States.Rolling
                }
            },

            [StillImageScenarist.States.Rolling]: {
                [StillImageScenarist.Events.RollScenario]: () => {

                    console.info('Roll ' + this.description + ' frame:' + this.currentFrame)

                    if (this.currentFrame < this.alphaCurve.length) {
                        this.drawImage()
                        this.currentFrame++
                        this.event({ evt: StillImageScenarist.Events.RollScenario })
                    }
                    else {
                        this.event({ evt: StillImageScenarist.Events.CutScenario })
                    }
                },
                [StillImageScenarist.Events.CutScenario]: () => {
                    console.info('Cut ' + this.description)

                    this.rollContext.signalTermination()

                    return StillImageScenarist.States.Done
                }
            },

            [StillImageScenarist.States.Done]: {

            }

        }

        wish() {
            //let logo = this.text('yenah')
            // this.ctx.context2D.put(logo).atCenter(logo)
        }

        protected loadImage() {

            this.image.onload = () => {
                this.event({ evt: StillImageScenarist.Events.LoadResources })
            }
            this.image.src = this.imageSource
        }

        protected drawImage() {


            // FIXME (0) : i18n
            let ctx = this.rollContext.context2D

            ctx.fillStyle = "#030303"
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

            // ctx.clear()

            ctx.fillStyle = "#000000"
            ctx.fillRect(50, 50, 200, 50)
            ctx.fillStyle = "#FFFFFF"
            ctx.font = '12px sans-serif'
            ctx.fillText('Hello world of inertial geometry', 70, 80)

            ctx.save()
            ctx.globalAlpha = this.alphaCurve.r[this.currentFrame]
            ctx.drawImage(this.image, 0, 0)
            ctx.restore()

            if (this.rollContext.debugDesign) {
                new LinearPlot2D(this.alphaCurve, ctx, {
                    strokeStyleIm: false,
                    strokeStyleImMarker: false
                },
                    this.currentFrame)
            }

            /* console.warn('TODO rollCut message')
        let requestRollCut: ExperimentRequest = {
            type: MessageType.ExperimentMessage,
            experimentId: this.channelExperimentIndexer,
            message: 'rollcut'
        }
        this.channel.send(requestRollCut)  */

            this.rollContext.channel.sendBinary(ctx)

            console.log('sent Logo')
        }
    }

    namespace StillImageScenarist {
        export enum States { Init, Loading, Rolling, Done }
        export enum Events { LoadResources, RollScenario, CutScenario }
    }
}