
function signalTest() {

  console.log('signal test')

  let lab = new Laboratory()

  lab.loadExperiments([
   /* new SignalExperiment2D(lab, {
      signalShape: SignalShape.Sinus,
      bufLenOrData: 256
    }),
    new ZetaExperiment2D(lab, {}),
    new ExponentialExperiment2D(lab, {}) */
  ])

}