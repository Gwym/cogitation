
interface Experiment2DInitOptions extends ExperimentInitOptions {

    useImageData?: boolean
}

abstract class Experiment2DContainerBase extends ExperimentContainerBase {

}

abstract class Scene2D implements ScenarioInterface {

    protected animationStepOptions: AnimationStepOptions = {
    }
    physicalStepPerVisualStep = 1

    protected perf = new PerformanceAccumulator()

    // TODO (1) : a virer
    preparePhysicalStep?: (physicalModel: PhysicalModel2D, visualStepOptions: AnimationStepOptions) => void

    abstract render(renderer: Canvas2DRenderer, physicalModel: PhysicalModel2D): void
    // abstract setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void

    setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void {
        this.animationStepOptions = visualStepOptions
    }
}

abstract class Experiment2DBase extends ExperimentBase {

    protected controls: Pointer2D
    protected renderer: Canvas2DRenderer
    protected abstract physicalModel: PhysicalModel2D
    protected abstract scene: Scene2D

    // TODO (0) : finalise() destructor() or deactivate() => removeEventListener ... 

    constructor(settings: ExperimentSettings, options: Experiment2DInitOptions) {
        super()

        console.log('Experiment2DBase > constructor > options.scenarioId: ' + options.scenarioId)

        this.renderer = new Canvas2DRenderer({
            width: settings.container.domContainer.offsetWidth,
            height: settings.container.domContainer.offsetHeight
            //,useImageData: options.useImageData
        })

        settings.container.domContainer.appendChild(this.renderer.domElement)

        this.controls = new Pointer2D(document, document.body)
    }

    animationStep(timestamp: number) {

        if (this.animationStepOptions.renderVerbose) {
            console.log('Experiment2DBase > visualStep > '
                + ' timestamp:' + timestamp
                + ' showPerf:' + this.animationStepOptions.showPerf
            )
        }

        /* if (this.scene.preparePhysicalStep) {
             this.scene.preparePhysicalStep(this.physicalModel, this.visualStepOptions)
         }
 
         for (let step = 0; step < this.scene.physicalStepPerVisualStep; step++) {
             this.visualStepOptions.step = step
             this.physicalModel.physicalStep(this.visualStepOptions)
         } */

        if (this.animationStepOptions.runPhysicalStep) {
            this.physicalStep()
        }

        this.controls.update()
        this.scene.render(this.renderer, this.physicalModel)
    }

    visualStep(timestamp: number) {

        if (this.animationStepOptions.renderVerbose) {
            console.log('Experiment2DBase > visualStep > '
                + ' timestamp:' + timestamp
                + ' showPerf:' + this.animationStepOptions.showPerf
            )
        }

        /* if (this.scene.preparePhysicalStep) {
             this.scene.preparePhysicalStep(this.physicalModel, this.visualStepOptions)
         }
 
         for (let step = 0; step < this.scene.physicalStepPerVisualStep; step++) {
             this.visualStepOptions.step = step
             this.physicalModel.physicalStep(this.visualStepOptions)
         } */

        if (this.animationStepOptions.runPhysicalStep) {
            this.physicalStep()
        }

        this.controls.update()
        this.scene.render(this.renderer, this.physicalModel)
    }

    physicalStep(): void {

        if (this.animationStepOptions.renderVerbose) {
            console.log('Experiment2DBase > physicalStep > '
                + ' showPerf:' + this.animationStepOptions.showPerf
            )
        }

        if (this.scene.preparePhysicalStep) {
            this.scene.preparePhysicalStep(this.physicalModel, this.animationStepOptions)
        }

        for (let step = 0; step < this.scene.physicalStepPerVisualStep; step++) {
            // this.visualStepOptions.step = step
            this.physicalModel.physicalStep(this.animationStepOptions)
        }

        this.controls.update()
        this.scene.render(this.renderer, this.physicalModel)
    }

    resize(w: number, h: number) {

        this.renderer.setSize(w, h)

        this.controls.screen.width = w
        this.controls.screen.height = h

        // this.camera.radius = ( w + h ) / 4
    }
}



