
// https://graphics.stanford.edu/~seander/bithacks.html#DetermineIfPowerOf2
function isPowerOfTwo(n: number) {

  // return n && (n & (n - 1)) === 0
  return n && !(n & (n - 1)) // 0 excluded
}

class SignalBase {

  // origin = 0
  // unit = 1
  // TODO (1) : accessor, check existance
  data: Float32Array[] = []

  get dimensionCount(): Integer { return this.data.length }
  get elementCount(): Integer { return this.data[0].length }

  constructor(settings: { elementCount: Integer, dimensionCount: Integer }) {

    if (settings.dimensionCount <= 0 || settings.dimensionCount > 10) {
      throw 'Allowed dimensionCount from 1 to 10, given: ' + settings.dimensionCount
    }

    if (settings.elementCount <= 1 || settings.elementCount > 2048 || (!isPowerOfTwo(settings.elementCount))) {
      throw 'Allowed elementCount power of two from 2 to 2048, given: ' + settings.elementCount
    }

    for (let d = 0; d < settings.dimensionCount; d++) {
      this.data[d] = new Float32Array(settings.elementCount)
    }
  }
}

class InitSignal {

  static ramp(mesh: Float32Array | Float64Array,
    options: { scaleX?: number, scaleY: number, offsetX?: number, offsetY: number }) {

    let l = mesh.length

    let incrementY = options.scaleY / l

    // TODO (1) : offsetX and scaleX

    for (let i = 0; i < l; i++) {
      mesh[i] = options.offsetY + (i * incrementY)
    }
  }

  static rampModulo(mesh: Float32Array | Float64Array,
    options: { increment: number, scaleX?: number, scaleY?: number, offsetX: number, offsetY: number, modulo: number }) {

    let l = mesh.length

    for (let i = 0; i < l; i++) {
      mesh[i] = options.offsetY + ((options.offsetX + i * options.increment)) % options.modulo
    }
  }

  static constant(mesh: Float32Array | Float64Array,
    options: { from?: number, upTo?: number, value: number }) {

    if (options.from === undefined) {
      options.from = 0
    }
    if (options.upTo === undefined) {
      options.upTo = mesh.length
    }

    console.log('linear ramp x_i:' + options.from + ' x_f:' + options.upTo + ' ' + options.value )

    for (let x = options.from; x < options.upTo; x++) {
      mesh[x] = options.value
    }
  }

  static linearRamp(mesh: Float32Array | Float64Array,
    options: { fromX?: number, upToX?: number, initialValue: number, finalValue: number }) {


    let x_i = options.fromX === undefined ? 0 : options.fromX
    let x_f = options.upToX === undefined ? mesh.length - 1 : options.upToX - 1

    console.log('linear ramp x_i:' + x_i + ' x_f:' + x_f + ' ' + options.initialValue + ' ' + options.finalValue)

    let extentX = x_f - x_i
    let extentY = options.finalValue - options.initialValue
    let slope = extentY / extentX
    // let divisor = (slope * options.fromX)
    let initialOrdinate: number = 0
   /* if (divisor === 0) {
      initialOrdinate = 0
    }
    else {
      initialOrdinate = options.initialValue / divisor
    } */
    if (extentX !== 0) {
      initialOrdinate = (options.initialValue * x_f - options.finalValue * x_i)/extentX
    }
    

    for (let x = x_i; x <= x_f ; x++) {
      mesh[x] = initialOrdinate + slope * x
    }
  }

}


class Signal {

  t_0 = 0
  t_delta = 1
  length = 0
  r: Float32Array   // real part (polar: false) or modulus (polar: true)
  i: Float32Array   // imaginary part (polar: false) or phase (polar: true)
  polar = false // phasor or vector (translator)

  constructor(len: number);
  constructor(data: Float32Array);
  constructor(arg0: Float32Array | number) {

    if (typeof arg0 === "number") {
      this.length = arg0;
      this.r = new Float32Array(arg0);
      this.i = new Float32Array(arg0);
    }
    else if (arg0.length) { // if (arg0 instanceof Array || arg0 instanceof Float32Array) {
      this.length = arg0.length;
      this.r = arg0;
      this.i = new Float32Array(arg0.length);
    }
    else {
      throw new Error('invalid parameter ' + arg0);
    }
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

  ramp(offset: number) {

    this.t_0 = -this.length / 2

    offset = offset === undefined ? this.length / 2 : offset
    for (let i = -5; i < 6; i++) {
      this.r[offset + i] = Math.sign(i)
      //signal.i[offset] = 0
    }
  }

  square(offset: number) {

    this.t_0 = -this.length / 2

    offset = offset === undefined ? this.length / 2 : offset
    for (let i = -5; i < 6; i++) {
      this.r[offset + i] = Math.sign(i)
      //signal.i[offset] = 0
    }
  }

  dirac(offset: number) {

    this.t_0 = -this.length / 2

    offset = offset === undefined ? this.length / 2 : offset
    this.r[offset] = 1;
    //signal.i[offset] = -1;
  }

  sin(period = 1, average = 0, phase = 0) {

    this.t_0 = - period * Math.PI
    this.t_delta = 2 * period * Math.PI / this.length

    for (let i = 0; i < this.length; i++) {
      this.r[i] = Math.sin(this.get_t(i) + phase) + average
    }
  }

  sin_f(frequency = 1, average = 0, phase = 0) {

    let bufferDuration = 4.5 // seconds
    let periodPerBuffer = frequency * bufferDuration

    // this.x0 = - periodPerBuffer * Math.PI // * 2 PI / 2
    this.t_0 = 0
    this.t_delta = periodPerBuffer * 2 * Math.PI / this.length

    for (let i = 0; i < this.length; i++) {
      this.r[i] = Math.sin(this.get_t(i) + phase) + average
    }
  }

  gaussian() {

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

  gaussianPulse(phase: number) {

    phase = phase === undefined ? 0 : phase;

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

  noise() {

    this.t_0 = -this.length / 2

    for (let i = 0; i < this.length; i++) {
      this.r[i] = Math.random() * 2.0 - 1.0
    }
  }

  exp_i(period = 1, average = 0, phase = 0) {

    this.t_0 = - period * Math.PI
    this.t_delta = 2 * period * Math.PI / this.length

    for (let i = 0; i < this.length; i++) {
      this.r[i] = Math.cos(this.get_t(i) + phase) + average
      this.i[i] = Math.sin(this.get_t(i) + phase) + average
    }
  }

  dualTone(ratio = 3) {

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



function naiveDFT(signal: Signal) {

  let k, n, real, imag, sin, cos, len = signal.length
  let M_2_PI = -2 * Math.PI / len

  let output = new Signal(len)
  output.t_0 = signal.t_0
  output.t_delta = signal.t_delta

  for (n = 0; n < len; n++) {

    real = 0
    imag = 0

    for (k = 0; k < len; k++) {

      cos = Math.cos(n * k * M_2_PI)
      sin = Math.sin(n * k * M_2_PI)

      // (a+i b) r(cos(t)+i sin(t)) = (a+i b) r(e^(i t))  =  a r(cos(t) + i sin(t)) + i b r(cos(t) + i sin(t))
      // (a+i b) (cos(t)+i sin(t)) = a cos(t) - b sin(t) + i ( a sin(t) + b cos(t))

      real += signal.r[k] * cos - signal.i[k] * sin
      imag += signal.r[k] * sin + signal.i[k] * cos
    }

    output.r[n] = real
    output.i[n] = imag
  }

  return output;
}

/*=========================================
     * Calculate the floating point complex FFT
     * Ind = +1 => FORWARD FFT
     * Ind = -l => INVERSE FFT
     * Data is passed in Npair Complex pairs
     * where Npair is power of 2 (2^N)
     * data is indexed from 0 to Npair-1
     * Real data in Ar
     * Imag data in Ai.
     *
     * Output data is returned in the same arrays,
     * DC in bin 0, +ve freqs in bins 1..Npair/2
     * -ve freqs in Npair/2+1 .. Npair-1.
     *
     * ref: Rabiner & Gold
     * "THEORY AND APPLICATION OF DIGITAL
     *  SIGNAL PROCESSING" p367
     *
     * Translated to JavaScript by A.R.Collins
     * <http://www.arc.id.au>
     *========================================*/

let fft = function (re: Float32Array, im: Float32Array, inverse = false) {

  let len = re.length
  let Pi = Math.PI,
    i, j, k, L, m, Le, Le1,
    Tr, Ti, Ur, Ui, Xr, Xi, Wr, Wi, Ip;

  function isPwrOf2(n: number) {
    let p = -1
    for (p = 2; p < 13; p++) {
      if (Math.pow(2, p) === n) {
        return p
      }
    }
    return -1
  }

  m = isPwrOf2(len)
  if (m < 0) {
    console.error("Npair must be power of 2 from 4 to 4096");
    return
  }

  let lenM1 = len - 1
  let lenOver2 = len / 2
  // if IFT conjugate prior to transforming:
  if (inverse) {
    for (i = 0; i < len; i++) {
      im[i] *= -1
    }
  }

  j = 0    // In place bit reversal of input data
  for (i = 0; i < lenM1; i++) {
    if (i < j) {

      /* Tr = Ar[j]
       Ti = Ai[j]
       Ar[j] = Ar[i]
       Ai[j] = Ai[i]
       Ar[i] = Tr
       Ai[i] = Ti */
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]]
    }
    k = lenOver2
    while (k < j + 1) {
      j = j - k
      k = k / 2
    }
    j = j + k
  }

  Le = 1
  for (L = 1; L <= m; L++) {

    Le1 = Le
    Le += Le
    Ur = 1
    Ui = 0
    Wr = Math.cos(Pi / Le1)
    Wi = -Math.sin(Pi / Le1)
    for (j = 1; j <= Le1; j++) {
      for (i = j - 1; i <= lenM1; i += Le) {

        Ip = i + Le1
        Tr = re[Ip] * Ur - im[Ip] * Ui
        Ti = re[Ip] * Ui + im[Ip] * Ur
        re[Ip] = re[i] - Tr
        im[Ip] = im[i] - Ti
        re[i] = re[i] + Tr
        im[i] = im[i] + Ti
      }
      Xr = Ur * Wr - Ui * Wi
      Xi = Ur * Wi + Ui * Wr
      Ur = Xr
      Ui = Xi
    }
  }
  // conjugate and normalise
  if (inverse) {
    for (i = 0; i < len; i++) {
      im[i] *= -1
    }
  }
  else {
    for (i = 0; i < len; i++) {
      re[i] /= len
      im[i] /= len
    }
  }
}


let derivative = function (signal: Signal) {

  let n, slope, len = signal.length
  let output = new Signal(len)
  output.t_0 = signal.t_0
  output.t_delta = signal.t_delta
  output.polar = signal.polar

  for (n = 0; n < len - 1; n++) {

    slope = signal.r[n] - signal.r[n + 1]
    output.r[n] = slope
    slope = signal.i[n] - signal.i[n + 1]
    output.i[n] = slope
  }

  return output
}

let polar = function (signal: Signal) {

  let n, norm, phase, len = signal.length
  let output = new Signal(len)
  output.t_0 = signal.t_0
  output.t_delta = signal.t_delta
  output.polar = true

  for (n = 0; n < len; n++) {

    norm = Math.sqrt(signal.r[n] * signal.r[n] + signal.i[n] * signal.i[n])
    phase = Math.atan2(signal.i[n], signal.r[n])

    output.r[n] = norm
    output.i[n] = phase
  }

  return output
}


let cleanLowAmplitude = function (signal: Signal, thresholdMax: number, thresholdMin = -thresholdMax) {

  let len = signal.length
  let output = new Signal(len)
  output.t_0 = signal.t_0
  output.t_delta = signal.t_delta
  output.polar = true

  for (let n = 0; n < len; n++) {

    output.r[n] = signal.r[n] <= thresholdMax && signal.r[n] >= thresholdMin ? 0 : signal.r[n]
    output.i[n] = signal.i[n] <= thresholdMax && signal.i[n] >= thresholdMin ? 0 : signal.i[n]
  }

  return output
}



/*
let Complex = function(r, i) {
  this.r = r || 0;
  this.i = i || 0;
}

Complex.prototype = {
  // TODO getter ?
  square: function() {
    return this.r * this.r + this.i * this.i;
  },
  norm: function() {
    return Math.sqrt(this.r * this.r + this.i * this.i);
  },
  slope: function() {
    return this.i / this.r;
  },
  argument: function() {
    return Math.atan2(this.i, this.r);
  },
  add: function(cplx) {
    this.r += cplx.r;
    this.i += cplx.i;
    return this;
  },
  substract: function(cplx) {
    this.r -= cplx.r;
    this.i -= cplx.i;    
  },
  // (x=a+ib) * (y=c+id)  xy	=	(a+ib)(c+id) = (ac-bd)+i(ad+bc)
  multiply: function(cplx) {
    let r = this.r * cplx.r - this.i * cplx.i;
    this.i = this.i * cplx.r + this.r * cplx.i;
    this.r = r;
  },
  // (a+ib)/(c+id)	=	((ac+bd)+i(bc-ad))/(c^2+d^2)
  divide: function(cplx) {
    let d = cplx.r * cplx.r + cplx.i * cplx.i;
    let r = (this.r * cplx.r + this.i * cplx.i)/d;
    this.i = (this.i * cplx.r - this.r * cplx.i)/d;
    this.r = r;

  },
  normalize: function() {
    let norm = this.norm();
    this.r /= norm;
    this.i /= norm;
    
    // TODO precision correction
    if (this.norm() !== 1) {
      console.warn('precision error norm != 1 : ' + this.norm() );
    }
    
  },
  toString: function() {
    return '('+ this.r + ' + i*' + this.i + ')';
  }
}
*/



