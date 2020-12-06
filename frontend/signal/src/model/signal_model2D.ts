


  enum SignalShape { None, Square, Dirac, Sinus, SinusF, Gaussian, GaussianPulse, Noise, ExpI, DualTone }

/*interface SignalModelSettings {
    bufLenOrData: Float32Array | number
    signalOptions: SignalOptions
  } */
  
  
  interface SignalOptions extends PhysicalInitSettings {

    bufLenOrData: Float32Array | number

    signalShape: SignalShape
    offset?: number // square, dirac
    period?: number // sin
    average?: number // sin, sinf
    phase?: number // sin, sinf, gaussianPulse
    frequency?: number // sinf
    ratio?: number
  }
  
  let defaultSignalOptions = {
    period: 1,
    average: 0,
    phase: 0,
    frequency: 1,
    ratio: 3
  }
  
  class SignalModel implements PhysicalModel2D {
  
    t_0 = 0
    t_delta = 1
    length = 0
    r: Float32Array   // real part (polar: false) or modulus (polar: true)
    i: Float32Array   // imaginary part (polar: false) or phase (polar: true)
    polar = false
  
    //constructor(len: number);
    //constructor(data: Float32Array);
    //constructor(arg0: Float32Array | number) {
      constructor(scenarioSettings: SignalOptions) {
  
      if (typeof scenarioSettings.bufLenOrData === 'number') {
        this.length = scenarioSettings.bufLenOrData
        this.r = new Float32Array(this.length)
        this.i = new Float32Array(this.length)
      }
      else if (scenarioSettings.bufLenOrData.length) { // if (arg0 instanceof Array || arg0 instanceof Float32Array) {
        this.length = scenarioSettings.bufLenOrData.length
        this.r = scenarioSettings.bufLenOrData
        this.i = new Float32Array(scenarioSettings.bufLenOrData.length)
      }
      else {
        throw new Error('invalid parameter ' + scenarioSettings.bufLenOrData)
      }

      this.initialiseSignal(scenarioSettings)
    }
  
    protected initialiseSignal(signalOptions: SignalOptions) {
  
      console.log('init signal ' + signalOptions)
  
      switch (signalOptions.signalShape) {
        case SignalShape.Square:
          this.square(signalOptions)
          break
        case SignalShape.Dirac:
          this.dirac(signalOptions)
          break
        case SignalShape.Sinus:
          this.sin(signalOptions)
          break
        case SignalShape.SinusF:
          this.sin_f(signalOptions)
          break
        case SignalShape.Gaussian:
          this.gaussian(signalOptions)
          break
        case SignalShape.GaussianPulse:
          this.gaussianPulse(signalOptions)
          break
        case SignalShape.ExpI:
          this.exp_i(signalOptions)
          break
        case SignalShape.Noise:
          this.exp_i(signalOptions)
          break
        case SignalShape.DualTone:
          this.dualTone(signalOptions)
          break
        default:
          // SignalShape.None or undefined
      }
    }
  
    physicalStep(_options: PhysicalStepOptions) {
      console.log('TODO physical step')
    }
  
    get_t(index: number) {
      return this.t_0 + this.t_delta * index
    }
  
    reset() {
      for (let i = 0; i < this.length; i++) {
        this.r[i] = 0
        this.i[i] = 0
      }
    }
  
    protected square(options: SignalOptions) {
  
      this.t_0 = -this.length / 2
  
      let offset = options.offset === undefined ? this.length / 2 : options.offset
      for (let i = -5; i < 6; i++) {
        this.r[offset + i] = Math.sign(i)
        //signal.i[offset] = 0
      }
    }
  
    protected dirac(options: SignalOptions) {
  
      this.t_0 = -this.length / 2
  
      let offset = options.offset === undefined ? this.length / 2 : options.offset
      this.r[offset] = 1;
      //signal.i[offset] = -1;
    }
  
    protected sin(options: SignalOptions) {
  
      let period = options.period === undefined ? defaultSignalOptions.period : options.period
      let average = options.average === undefined ? defaultSignalOptions.average : options.average
      let phase = options.phase === undefined ? defaultSignalOptions.phase : options.phase
  
      this.t_0 = - period * Math.PI
      this.t_delta = 2 * period * Math.PI / this.length
  
      for (let i = 0; i < this.length; i++) {
        this.r[i] = Math.sin(this.get_t(i) + phase) + average
      }
    }
  
    protected sin_f(options: SignalOptions) {
  
      let frequency = options.frequency === undefined ? defaultSignalOptions.frequency : options.frequency
      let average = options.average === undefined ? defaultSignalOptions.average : options.average
      let phase = options.phase === undefined ? defaultSignalOptions.phase : options.phase
  
      let bufferDuration = 4.5 // seconds
      let periodPerBuffer = frequency * bufferDuration
  
      // this.x0 = - periodPerBuffer * Math.PI // * 2 PI / 2
      this.t_0 = 0
      this.t_delta = periodPerBuffer * 2 * Math.PI / this.length
  
      for (let i = 0; i < this.length; i++) {
        this.r[i] = Math.sin(this.get_t(i) + phase) + average
      }
    }
  
    protected gaussian(_options: SignalOptions) {
  
      let scale = 5;
      let shift = 2;
      this.t_0 = -scale;
      this.t_delta = 2 * scale / this.length;
  
      let x: number;
      for (let i = 0; i < this.length; i++) {
        x = this.get_t(i) + shift;
        this.r[i] = Math.exp(-x * x);
        this.i[i] = 0; // -Math.exp(-x*x);
      }
    }
  
    protected gaussianPulse(options: SignalOptions) {
  
      let phase = options.phase === undefined ? defaultSignalOptions.phase : options.phase
  
      let scale = 5;
      let shift = 3;
      // signal.x0 = - Math.PI; // -scale;
      // signal.x_delta = 2 * Math.PI / signal.length; 
  
      this.t_0 = -scale; // -scale;
      this.t_delta = 2 * scale / this.length;
  
  
      let x: number;
      for (let i = 0; i < this.length; i++) {
        x = this.get_t(i) + shift;
        this.r[i] = Math.sin(x * 10 + phase) * Math.exp(-x * x);
        this.i[i] = 0; // -Math.exp(-x*x);
      }
    }
  
    protected noise(_options: SignalOptions) {
  
      this.t_0 = -this.length / 2
  
      for (let i = 0; i < this.length; i++) {
        this.r[i] = Math.random() * 2.0 - 1.0
      }
    }
    protected exp_i(options: SignalOptions) {
  
      let period = options.period === undefined ? defaultSignalOptions.period : options.period
      let average = options.average === undefined ? defaultSignalOptions.average : options.average
      let phase = options.phase === undefined ? defaultSignalOptions.phase : options.phase
  
      this.t_0 = - period * Math.PI
      this.t_delta = 2 * period * Math.PI / this.length
  
      for (let i = 0; i < this.length; i++) {
        this.r[i] = Math.cos(this.get_t(i) + phase) + average
        this.i[i] = Math.sin(this.get_t(i) + phase) + average
      }
    }
  
    protected dualTone(options: SignalOptions) {
  
      let ratio = options.ratio === undefined ? defaultSignalOptions.ratio : options.ratio
  
      this.t_0 = - 20 * Math.PI
      this.t_delta = 40 * Math.PI / this.length
  
      for (let i = 0; i < this.length; i++) {
        this.r[i] = Math.sin(this.get_t(i)) + Math.sin(this.get_t(i) / ratio) + (Math.random() - 0.5)
      }
    }
  
  
  
    getBounds() {
  
      // TODO : generic dimensions
      //let range = {}; for (let variable in signal) range[variable] = [min, max];
  
      let rMin = Infinity, rMax = -Infinity,
        iMin = Infinity, iMax = -Infinity
      //,  x_min = Infinity, x_max = -Infinity
  
  
      for (let n = 0; n < this.length; n++) {
        if (this.r[n] > rMax)
          rMax = this.r[n];
        if (this.r[n] < rMin)
          rMin = this.r[n];
        if (this.i[n] > iMax)
          iMax = this.i[n];
        if (this.i[n] < iMin)
          iMin = this.i[n];
      }
  
      return {
        rMax: rMax,
        rMin: rMin,
        iMax: iMax,
        iMin: iMin,
        tMin: this.get_t(0),
        tMax: this.get_t(this.length - 1)
      }
    }
  }