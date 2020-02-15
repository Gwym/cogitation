
interface AnimationStepOptions extends PhysicalStepOptions {

}

interface ExperimentSettings {

    // domContainer: HTMLElement
    container: ExperimentContainerInterface
}

interface ExperimentInitOptions {

    kind: Kind
    scenarioId: number
}

//interface ExperimentConstructor {
//    new(settings: ExperimentSettings, options: ExperimentInitOptions): IExperiment
//}

interface ExperimentInterface {

    animationStep(timestamp: number): void
    setAnimationStepOptions(stepOptions: AnimationStepOptions): void
    autoAnimationStart?: boolean
    // visualStep(timestamp: number): void
    // physicalStep(): void
    destructor?: () => void
    resize(w: number, h: number): void

    onServerAck?(m: ExperimentMessage): void
}

// type ExperimentConstructor = { new(experimentOptions: ExperimentInitOptions): IExperiment }

interface ExperimentContainerOptions {

    title?: string
    domContainer?: HTMLElement
    // ambientColor?: number

    // physicalModel?: PhysicalModelBase
    // scenarioOptions?: ScenarioOptions
    // physicalStepPerVisualStep?: number
}

/*interface ExperimentContainerSettings extends ExperimentContainerOptions {

    title: string
    // requestAnim: boolean
    // ambientColor: number
    // scenarioOptions: ScenarioOptions
    // physicalStepPerVisualStep: number
}*/

interface ExperimentContainerInterface {

    readonly title: string
    readonly active: boolean
    readonly domContainer: HTMLElement
    activate(initOptions: ExperimentInitOptions): void
    deactivate(): void
    animationStep(timestamp: number): void

    experimentIndexer: number | null // TODO (3) : onExperimentLoad(id: number) { this.experimentIndexer = id } onExperimentUnload ...
    onServerAck?(m: ExperimentMessage): void
}

interface ScenarioInterface {

    physicalStepPerVisualStep: number
    preparePhysicalStep?: (physicalModel: PhysicalModelBase, visualStepOptions: AnimationStepOptions) => void

    setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void
    //  abstract render(renderer: Canvas2DRenderer, physicalModel: PhysicalModelBase): void

}

class PerformanceAccumulator extends Array<number> {

    public showPerf = ShowPerf.PerSecond

    protected storingIndex = 0
    protected performanceAverage = 0

    constructor(arrayLength = 10) {
        super(arrayLength)
    }

    drawFPS(context: CanvasRenderingContext2D, offsetX = 10, offsetY = 10) {

        if (this.storingIndex < this.length) {
            this[this.storingIndex++] = performance.now()
        }
        else {
            let performanceAverage = 0
            for (let i = 0; i < this.length - 1; i++) {
                performanceAverage += this[i + 1] - this[i]
            }
            this.performanceAverage = performanceAverage / this.length - 1
            this.storingIndex = 0
        }

        // TODO (3) : save/restore ? transparent background ? 
        context.fillStyle = "#000000"
        context.fillRect(offsetX, offsetY, 150, 50)
        context.fillStyle = "#FFFFFF"
        context.font = '12px sans-serif'
        context.fillText('mspf:' + this.performanceAverage.toFixed(2) + ' fps: ' + Math.round(1000 / (this.performanceAverage)), offsetX + 10, offsetY + 20)
    }
}

abstract class ExperimentBase implements ExperimentInterface {

    protected animationStepOptions: AnimationStepOptions = {
        showPerf: ShowPerf.None
    }

    protected abstract scene: ScenarioInterface

    abstract animationStep(timestamp: number): void
    setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void {
        this.animationStepOptions = visualStepOptions
        this.scene.setAnimationStepOptions(visualStepOptions)
    }
    // abstract autoAnimationStart: boolean
    // abstract visualStep(timestamp: number): void
    // abstract physicalStep(): void
    abstract resize(w: number, h: number): void
}

abstract class ExperimentContainerBase implements ExperimentContainerInterface {

    experimentIndexer: number | null = null
    protected laboratory: Laboratory

    // protected abstract experimentSettings: ExperimentContainerSettings

    private _domContainer: HTMLElement
    get domContainer() { return this._domContainer }
    protected _title = 'Experiment'
    get title() { return this._title }

    protected experiment?: ExperimentInterface
    // protected abstract experimentConstructor: ExperimentConstructor
    // protected createExperiment(ctor: ExperimentConstructor, settings: ExperimentSettings, options: ExperimentInitOptions): IExperiment { return new ctor(settings, options) }
    protected abstract createCustomExperiment(settings: ExperimentSettings, options: ExperimentInitOptions): ExperimentInterface

    get active() { return this.experiment !== undefined }

    private animating = false
    private runPhysicalSimulation: false | number = false

    constructor(laboratory: Laboratory, options: ExperimentContainerOptions = {}) {

        this.laboratory = laboratory

        // TODO (1) : i18n
        if (options.title !== undefined) {
            this._title = options.title
        }

        console.log('ExperimentContainerBase > constructor > ' + this._title)

        this._domContainer = options.domContainer !== undefined ? options.domContainer : document.body
    }

    // abstract activate(initOptions?: ExperimentInitOptions): void

    activate(experimentOptions: ExperimentInitOptions): void {

        console.log('ExperimentContainerBase > Activate experiment ' + this.title)

        //this.experiment = this.createExperiment(this.experimentConstructor, { domContainer: this.domContainer }, experimentOptions)
        this.experiment = this.createCustomExperiment({ container: this }, experimentOptions)

        if (this.onKeyboard) {
            document.addEventListener('keypress', this.onKeyboard)
        }
        if (this.onMouseMove) {
            document.addEventListener('mousemove', this.onMouseMove)
        }

        // TODO (3) : experiment.onKeyboard OR experiment.customOnKeyboard ?
       /* if (this.experiment.onKeyboard) {
            document.addEventListener('keypress', this.experiment.onKeyboard)
        }
        if (this.onMouseMove) {
            document.addEventListener('mousemove', this.experiment.onMouseMove)
        } */

        // this._domContainer.addEventListener('resize', this.onDomResize)
        window.addEventListener('resize', this.onDomResize)

        if (this.experiment.autoAnimationStart) {
            setTimeout(function () {
                let e = new KeyboardEvent('keypress', { 'key': 'a' })
                document.dispatchEvent(e)
            }, 10)
        }
    }

    deactivate(): void {

        if (this.onKeyboard) {
            document.removeEventListener('keypress', this.onKeyboard)
        }
        if (this.onMouseMove) {
            document.removeEventListener('mousemove', this.onMouseMove)
        }

        // this._domContainer.removeEventListener('resize', this.onDomResize)
        window.removeEventListener('resize', this.onDomResize)

        if (this.experiment && this.experiment.destructor) {
            this.experiment.destructor()
        }

        this.experiment = undefined
    }

    private toggleRenderLoop() {

        this.animating = this.laboratory.updateAnimationRequests(!this.animating, this)
    }

    private suspendAnimating() {

        this.animating = this.laboratory.updateAnimationRequests(false, this)
    }

   /* private resumeAnimating() {

        this.animating = this.laboratory.updateAnimationRequests(true, this)
    } */

    private togglePhysicalLoop() {

        if (this.runPhysicalSimulation !== false) {
            this.runPhysicalSimulation = false
        }
        else {
            this.runPhysicalSimulation = Number.POSITIVE_INFINITY
        }
    }

    animationStep(timestamp: number) {
        if (this.experiment) {
            this.experiment.animationStep(timestamp)
        }
    }

    protected customKeyboardEvent?: (event: KeyboardEvent) => void

    onKeyboard: { (_event: KeyboardEvent): void } = (event: KeyboardEvent) => {

        console.log('onKeybord: ' + event.key)

        switch (event.key) {

            case 'a':
                if (this.experiment) {
                    this.experiment.setAnimationStepOptions({
                        showPerf: ShowPerf.HalfSecond
                    })
                }

                this.toggleRenderLoop()
                console.log('ExperimentBase > onKeyboard > animate: ' + this.animating)
                break
            case ' ':
            case 's':
                console.log('ExperimentBase > onKeyboard > physical step (s)')

                if (this.experiment) {
                    this.experiment.setAnimationStepOptions({
                        showPerf: ShowPerf.PerStep,
                        physicalVerbose: true,
                        runPhysicalStep: 1 // TODO (1) : allow user to give number, or option ?
                    })
                }
                break
            case 'r':
                console.log('ExperimentBase > onKeyboard > run physical loop (r)')

                this.togglePhysicalLoop()

                if (this.experiment) {
                    this.experiment.setAnimationStepOptions({
                        showPerf: ShowPerf.HalfSecond,
                        physicalVerbose: false,
                        runPhysicalStep: this.runPhysicalSimulation
                    })
                }
                break

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                console.log('ExperimentBase > onKeyboard > scenarioId: ' + parseInt(event.key))

                this.suspendAnimating()
                this.deactivate()
                this.activate({ kind: Kind.Experiment, scenarioId: parseInt(event.key) })
                
               /* let wasAnimated = this.animating
                this.suspendAnimating()
                this.deactivate()

                this.activate({ kind: Kind.Experiment, scenarioId: parseInt(event.key) })
                if (wasAnimated) {
                    if (this.experiment) {
                        this.experiment.setAnimationStepOptions({
                            showPerf: ShowPerf.HalfSecond,
                            physicalVerbose: false
                        })
                    }
                    this.resumeAnimating()
                }
                else {
                    if (this.experiment) {
                        this.experiment.setAnimationStepOptions({
                            showPerf: ShowPerf.PerStep,
                            physicalVerbose: true
                        })
                    }
                } */
                break
            default:
                if (this.customKeyboardEvent) {
                    this.customKeyboardEvent(event)
                }
        }

        // TODO (3) : experiment.onKeyboard OR experiment.customOnKeyboard ?
        // if (this.experiment) { this.experiment.customOnKeyboard(event)}
    }

    onMouseMove?: { (_event: MouseEvent): void } = undefined // (_event: MouseEvent) => { }

    private onDomResize = () => {

        if (this.experiment) {
            this.experiment.resize(this._domContainer.offsetWidth, this._domContainer.offsetHeight)
            // this.experiment.resize(window.innerWidth, window.innerHeight)
        }

        // FIMXE (3) : use event target or this.domContainer ?
        /* let [, w, h] = this.getDomContainer()
 
         console.log('onResize ' + {width: w, height:h} )
 
         this.renderer.setOptions({width: w, height:h})
 
         this.controls.screen.width = w
         this.controls.screen.height = h */
    }

    toString() {

        return this.title
    }

}

interface Canvas2DRendererSettings {
    width: number
    height: number
    clearColor?: string // undefined === 'rgba(0,0,0,0)'  (transparent black)
}

// TODO (3): own .ts
class Canvas2DRenderer {

    context: CanvasRenderingContext2D
    domElement: HTMLCanvasElement
    clearColor?: string = undefined

    constructor(options: Canvas2DRendererSettings) {

        console.log('Canvas2DRenderer > constructor w:' + options.width + ' h:' + options.height)
        this.domElement = document.createElement('canvas')
        this.context = <CanvasRenderingContext2D>this.domElement.getContext("2d")
        this.domElement.width = options.width
        this.domElement.height = options.height
        if (options.clearColor) {
            this.clearColor = options.clearColor
        }
    }

    setSize(w: number, h: number): void {

        this.domElement.width = w
        this.domElement.height = h

        throw new Error("Method not implemented. TODO render") // TODO (0) : render
    }

    clear() {

        if (this.clearColor) {
            console.log(this.context.fillStyle)
            this.context.fillStyle = this.clearColor
            this.context.fillRect(0, 0, this.domElement.width, this.domElement.height)
        }
        else {
            this.context.clearRect(0, 0, this.domElement.width, this.domElement.height)
        }
    }
}
