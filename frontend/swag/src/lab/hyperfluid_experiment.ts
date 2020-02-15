
class HyperFluidExperimentContainer extends Experiment3DContainerBase {


    protected _title = 'HyperFluidExperiment'

    protected createCustomExperiment(settings: ExperimentSettings, options: Experiment3DInitOptions) {
        return new HyperFluidExperiment(settings, options)
    }
}

class HyperFluidExperiment extends Experiment3DBase {

    mFrame: number = 0
    mTimeNow: number = 0

    protected physicalModel: HyperFluidParticleSystem

    constructor(settings: ExperimentSettings, options: Experiment3DInitOptions) {

        super(settings, options)

        let modelSettings: PhysicalModel3DInitSettings = {
            kind: Kind.PhysicalModel,
            scene: this.scene,
            scenarioId: 0
        }

        this.physicalModel = new HyperFluidParticleSystem()
        this.physicalModel.initialise(modelSettings)

        // this.renderer3D.setClearColor(0x111111)
        this.camera.position.set(0, 0, 25)

        this.addVisualEntitiesToScene()
    }
}
