

enum Kind { Laboratory, Experiment, VerifyExperiment, ScenaristExperiment, Scenario, VerifyScenario, PhysicalModel, VerifyModel }

interface Concept {

}

interface PhysicalInitSettings {

    kind: Kind.PhysicalModel

}

enum ShowPerf { None = 0, PerStep = 1, HalfSecond = 25, PerSecond = 50 }

interface PhysicalStepOptions {
    showPerf?: ShowPerf
    renderVerbose?: boolean
    runPhysicalStep?: false | number
    physicalVerbose?: boolean
    timestamp?: number
}

// FIXME (1) : THREE dependant
// interface PhysicalEntity extends THREE.Object3D {

// }

interface PhysicalEntity extends FIVE.Object5D {

}

// PhysicalMethod : A way to transform a PhysicalEntity within a PhysicalModel
interface PhysicalMethod {

    methodId: number
}

interface PhysicalModelBase {

    physicalStep(stepOptions: PhysicalStepOptions): void
}

// TODO (0) : move to swag/core ? to gyrus/phys ? to signal ? to multislot ?
interface PhysicalModel2D extends PhysicalModelBase {

}

// FIXME (1) : THREE dependant, scene belongs to scenario.ts, not to model, extract scene from 3d models
/*class ThreeScene3D extends THREE.Scene implements ScenarioInterface {

    protected animationStepOptions: AnimationStepOptions = {
    }
    
    sceneBaseLength: number = 0
    physicalStepPerVisualStep = 1
    fov = 24
    near = 1
    far = 2000
    ambientColor = 0x222222

    defaultInitScenarioId = 0 // FIXME : constructor options => default scenario ?

    setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void {
        this.animationStepOptions = visualStepOptions
     } 

} */

interface PhysicalModel3DInitSettings extends PhysicalInitSettings {

    scene: FIVE.Scene // ThreeScene3D
    scenarioId: number
    
}

interface PhysicalModel3D extends PhysicalModelBase {

    physicalEntities: PhysicalEntity[]
    conceptualEntities?: Concept[]

   // initialise(modelSettings: PhysicalModel3DInitSettings): void
}

interface VerifyModelInitSettings {
 
    kind: Kind.VerifyModel
}

interface VerifyModelBase {

  //  initialise(modelSettings: VerifyModelInitSettings): void

}

