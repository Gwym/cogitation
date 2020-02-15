
namespace SulcusEngineTest {

    export class SulcusExperimentVerifyContainer extends ExperimentVerifyContainerBase {

        protected _title = 'SulcusExperimentVerify'

        protected createCustomExperiment(settings: ExperimentSettings, options: ExperimentVerifyInitOptions): ExperimentInterface {
            return new SulcusExperimentVerify(settings, options)
        }
    }   

    class SulcusExperimentVerify extends ExperimentVerifyBase {

        protected verificationCollection: VerificationCollection = [
        //    SulcusBaseTest
        ]
        protected scene: SulcusSceneVerify

        constructor(settings: ExperimentSettings, _options: ExperimentVerifyInitOptions) {
            super()

            this.scene = new SulcusSceneVerify(settings, this.verificationCollection)
            this.scene.render()
        }
    }

    class SulcusSceneVerify extends VerifyContext {

        description = 'SulcusSceneVerify'

        verbose = true // TODO (1) : settings
    }

}