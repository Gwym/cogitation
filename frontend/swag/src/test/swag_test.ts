function swagTest() {

  let lab = new Laboratory()

  lab.loadExperiments([
    // new CurveExperimentContainer(lab),
    // new GasExperimentContainer(lab),
    // new SphExperimentContainer(lab),
    // new VortonExperimentContainer(lab),
    // new DirectSphExperimentContainer(lab),
     new HyperFluidExperimentContainer(lab),
    // new DirectVortonExperimentContainer(lab),
    // new CollisionExperiment3DContainerBase(lab),
    // new SwagTest.SwagExperimentVerifyContainer(lab),
    // new BufoExperiment2DContainer(lab/*,  { magnitude: 900 } */),
    // new StochasticExperiment2DContainer(lab),
    // new QuantumExperiment2DContainer(lab),
    // new BlobExperimentContainer(lab),
    // new BoostExperimentContainer(lab),
    // new SolarSystemExperimentContainer(lab)
  ])
}