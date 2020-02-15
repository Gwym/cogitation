function sulcusTest() {

    let lab = new Laboratory()

    lab.loadExperiments([
        new SulcusEngineTest.SulcusExperimentVerifyContainer(lab)
        // new NeuralNetworkExperiment2DContainer(lab),
        // new NeuralNetworkExperiment3DContainerBase(lab)
    ])
}

namespace SulcusEngineTest {

    export const enum States { Init, Testing, Done }
    export const enum Events { RunTests, Error, Success, Timeout }


   /* export let SulcusEngineVerify = [
        // CollisionDistributionTest
        //,DistributionTest
    ] */
}