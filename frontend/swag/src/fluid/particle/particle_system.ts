
/* interface ParticleSystemSettings {

    distribution: DistributionBase<ParticleSph>
    vorticity?: VorticityMethod
    viscosity?: ViscosityMethod
    drag?: DragMethod
    surfaceTension?: SurfaceTensionMethod
} */

abstract class ParticleSystemBase implements FluidModel {

    physicalEntities: PhysicalEntity[] = []
    protected busy = false
    protected loopCount = 0
    protected performanceNow: number = 0

    abstract initialise(modelSettings: PhysicalInitSettings): void
    protected abstract step(verbose?: boolean): void

    // physicalStep(options: { showPerf: number, physicalVerbose: boolean }) {
    physicalStep(options: PhysicalStepOptions ) {

        if (this.busy) {
            console.error('overload') // TODO (1) : fps, ui, log...
            return
        }
        this.busy = true
        this.loopCount++

        if (options.showPerf && options.showPerf > 0) {
            if (this.loopCount % options.showPerf === 0) {
                this.performanceNow = performance.now()
            }
            else {
                options.showPerf = 0
            }
        }

        this.step(options.physicalVerbose)

        if (options.showPerf && options.showPerf > 0) {
            this.perf('iteration ' + this.loopCount + ' : ')
        }

        this.busy = false
    }

    perf(stage = '') {

        console.log(stage + (performance.now() - this.performanceNow))
    }
}


