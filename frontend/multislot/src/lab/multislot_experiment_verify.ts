
namespace InertialGeometryTest {

    export class MultislotExperimentVerifyContainer extends ExperimentVerifyContainerBase {

        protected _title = 'MultislotExperimentVerify'

        protected createCustomExperiment(settings: ExperimentSettings, options: ExperimentVerifyInitOptions): ExperimentInterface {
            return new MultislotExperimentVerify(settings, options)
        }
    }

    class MultislotExperimentVerify extends ExperimentVerifyBase {

        protected verificationCollection: VerificationCollection = [
            //AlgorithmTest,
            //AlgebraBaseTest,
            //MatrixBaseTest,
            //SymbolicRecursiveMatrixBaseTest,
            //GA4DBaseTest,
            //MultislotBaseTest
        ]
        protected scene: MultislotSceneVerify

        constructor(settings: ExperimentSettings, _options: ExperimentVerifyInitOptions) {
            super()

            this.scene = new MultislotSceneVerify(settings, this.verificationCollection)
            this.scene.render()
        }
    }

    class MultislotSceneVerify extends VerifyContext {

        description = 'MultislotSceneVerify'

        verbose = true // TODO (1) : settings
    }

}