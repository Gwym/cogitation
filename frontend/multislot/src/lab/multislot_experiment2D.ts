
 interface MultislotExperiment2DOptions extends Experiment2DInitOptions {

    

}

interface MultislotExperiment2DSettings extends ExperimentSettings {

    renderer: Canvas2DRenderer

}




class MultislotExperiment2DContainer extends Experiment2DContainerBase {

    protected _title = 'MultislotExperiment2D'

    protected createCustomExperiment(settings: ExperimentSettings, options: MultislotExperiment2DOptions): ExperimentInterface {
        return new MultislotExperiment2D(settings, options)
    }
}

class MultislotExperiment2D extends Experiment2DBase {

    protected physicalModel: MultislotModel
    protected scene: MultislotScene2D

    constructor(settings: ExperimentSettings, options: MultislotExperiment2DOptions) {

        super(settings, options)

        console.log('MultislotExperiment2D > constructor > scenarioId: ' + options.scenarioId)
        // TODO (3) : multiple scenarios

        this.physicalModel = new MultislotModel(options)
        this.scene = new MultislotScene2D({
            container: settings.container,
            renderer: this.renderer
        })

        // this.scene.render(this.renderer, this.physicalModel)
    }
}


class MultislotModel implements PhysicalModel2D {

    step = 1

    constructor(_options: Experiment2DInitOptions) {

    }

    physicalStep(_options: { showPerf: number, verbose?: boolean }): void {

    }
}

class MultislotScene2D extends Scene2D {

    strokeStyleAxes: string | false = 'rgb(128,128,128)'

    x0: number = 10
    y0: number = 10

    renderer: Canvas2DRenderer

    constructor(settings: MultislotExperiment2DSettings) {
        super()

        this. renderer = settings.renderer

        let uiContainer = document.createElement('div')
        uiContainer.className = 'ui_container'

        let alphaCurveButton = document.createElement('input')
        alphaCurveButton.type = 'button'
        alphaCurveButton.value = 'Courbe alpha' // TODO (1) :i18n.multislot.curve.alpha
        alphaCurveButton.addEventListener('click', () => { 
            console.log('mode ALPHA')
            this.renderAlphaCurve(this.renderer) })
        uiContainer.appendChild(alphaCurveButton)

        let powerCurveButton = document.createElement('input')
        powerCurveButton.type = 'button'
        powerCurveButton.value = 'Courbe puissance' // TODO (1) :i18n.multislot.curve.power
        powerCurveButton.addEventListener('click', () => { 
            console.log('mode POWER')
            this.renderPowerCurve(this.renderer) })
        uiContainer.appendChild(powerCurveButton)


        

        settings.container.domContainer.appendChild(uiContainer)
    }

    render(_renderer: Canvas2DRenderer, _physicalModel: PhysicalModel2D): void {
        // TODO (3) : render and model not need in specific experiments => remove 
    }

    renderPowerCurve(renderer: Canvas2DRenderer) {

        let context = renderer.context

        // console.log('ExponentialTransformationScene2D > render' + physicalModel.step)

        if (this.strokeStyleAxes) {
            context.strokeStyle = this.strokeStyleAxes
            context.beginPath()
            context.moveTo(this.x0, this.y0)
            context.lineTo(context.canvas.width, this.y0)
            context.moveTo(this.x0, this.y0)
            context.lineTo(this.x0, context.canvas.height)
            context.stroke()
        }

        let xMin = 0
        // let xMax = 2.0

        let scaleX = 400
        let scaleY = 400

        interface configPlot {
            e: number
            s: string
        }

        let exponents: configPlot[] = [
            { e: 1 / 1.5, s: 'rgb(127,0,0)' },
            { e: 1 / 2, s: 'rgb(0,255,0)' },
            { e: 1.5, s: 'rgb(127,0,0)' },
            { e: 1 / 3, s: 'rgb(255,255,0)' },
            { e: 1 / 4, s: 'rgb(255,255,255)' },
            { e: 1, s: 'rgb(255,0,0)' },
            { e: 2, s: 'rgb(0,255,0)' },
            { e: 3, s: 'rgb(255,255,0)' },
            { e: 4, s: 'rgb(255,255,255)' }
        ]

        for (let cfg of exponents) {

            context.strokeStyle = cfg.s
            context.beginPath()
            context.moveTo(this.x0 + xMin, this.y0 + xMin ** cfg.e)
            for (let y, x = xMin; x < context.canvas.width; x++) {

                y = ((x / scaleX) ** cfg.e) * scaleY
                if (y > context.canvas.height) {
                    break
                }

                context.lineTo(this.x0 + x, this.y0 + y)

            }
            context.stroke()
        }

        /*for (let cfg of exponents) {

            context.strokeStyle = cfg.s
            context.beginPath()
            context.moveTo(this.x0 + xMin, this.y0 + xMin ** cfg.e)
            for (let y, x = xMin; x < context.canvas.width; x++) {

                y = ((x / context.canvas.width * xMax) ** cfg.e) * scaleY
                if (y > context.canvas.height) {
                    break
                }

                context.lineTo(this.x0 + x, this.y0 + y)

            }
            context.stroke()
        }*/


        this.perf.drawFPS(context)
    }

    renderAlphaCurve(renderer: Canvas2DRenderer) {

        // let stillImage = new StillImageScenarist()

      /*  let settings = {
            startFrame: 0,
            durationInFrame: 48,
            easeDurationInFrame: 12
        }

        let alphaMin = 0.0
        let alphaMax = 1.0
        let alphaCurve = new Signal(settings.durationInFrame)
        InitSignal.constant(alphaCurve.r, { value: alphaMax })
        InitSignal.linearRamp(alphaCurve.r, { fromX: 0, upToX: settings.easeDurationInFrame, initialValue: alphaMin, finalValue: alphaMax })
        InitSignal.linearRamp(alphaCurve.r, {
            fromX: settings.durationInFrame - settings.easeDurationInFrame,
            upToX: settings.durationInFrame,
            initialValue: alphaMax,
            finalValue: alphaMin
        })

        let frameMarker = 47

        new LinearPlot2D(alphaCurve, renderer.context, {
            strokeStyleIm: false,
            strokeStyleImMarker: false
        },
        frameMarker) */

        let settings = {
            startFrame: 0,
            durationInFrame: 90,
            easeDurationInFrame: 15
        }

        let alphaMin = 0.0
        let alphaMax = 1.0
        let alphaCurve = new Signal(settings.durationInFrame)
        InitSignal.constant(alphaCurve.r, { value: alphaMax })
        InitSignal.linearRamp(alphaCurve.r, { fromX: 0, upToX: settings.easeDurationInFrame, initialValue: alphaMin, finalValue: alphaMax })
        InitSignal.linearRamp(alphaCurve.r, {
            fromX: 60,
            upToX: 60 + settings.easeDurationInFrame + 1,
            initialValue: alphaMax,
            finalValue: alphaMin
        })
        InitSignal.constant(alphaCurve.r, {
            value: alphaMin,
            from: 60 + settings.easeDurationInFrame + 1,
            upTo: settings.durationInFrame
        })

        let frameMarker = 60

        new LinearPlot2D(alphaCurve, renderer.context, {
            strokeStyleIm: false,
            strokeStyleImMarker: false
        },
        frameMarker) 
        
    }
}