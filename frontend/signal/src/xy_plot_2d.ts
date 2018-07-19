
interface XYPlotDesign {
  strokeStyle?: string
  strokeStyleMarker?: string
  strokeStyleAxes?: string
  scaleX: number
  scaleY: number
  x0: number
  y0: number
}

class XYPlot2D implements XYPlotDesign {

  strokeStyle = 'rgb(0,172,0)'
  strokeStyleMarker?: string
  // strokeStyleMarker = 'rgba(0,172,0, 0.5)'
  strokeStyleAxes = 'rgb(128,128,128)'
  scaleX = 1
  scaleY = 1
  x0 = 0
  y0 = 0
  markers = true

  constructor(signal: Signal, context: CanvasRenderingContext2D/*, design: Design*/) {

    let bounds = signal.getBounds()

    // 90% of canvas half height  / highest absolute peak
    this.scaleX = context.canvas.height * 0.5 * 0.9 / Math.max(Math.abs(bounds.iMax), Math.abs(bounds.rMax), Math.abs(bounds.rMin), Math.abs(bounds.iMin))
    this.scaleY = this.scaleX

    this.x0 = Math.floor(context.canvas.width / 2)
    this.y0 = Math.floor(context.canvas.height / 2)

    if (this.strokeStyleAxes) {
      context.beginPath()
      context.strokeStyle = this.strokeStyleAxes
      context.moveTo(0, this.y0); context.lineTo(context.canvas.width, this.y0)
      context.moveTo(this.x0, 0); context.lineTo(this.x0, context.canvas.height)
      context.stroke()
    }

    if (this.strokeStyle) {

      context.strokeStyle = this.strokeStyle
      context.beginPath()

      context.moveTo(this.x0 + signal.r[0] * this.scaleX, this.y0 + signal.i[0] * this.scaleY)

      for (let i = 0; i < signal.length; i++) {
        context.lineTo(this.x0 + signal.r[i] * this.scaleX, this.y0 + signal.i[i] * this.scaleY)
      }
      context.stroke()
    }

    if (this.strokeStyleMarker) {

      context.strokeStyle = this.strokeStyleMarker

      for (let i = 0; i < signal.length; i++) {
        context.strokeRect(this.x0 + signal.r[i] * this.scaleX - 1, this.y0 + signal.i[i] * this.scaleY - 1, 3, 3)
      }
    }
  }
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

