
interface LinearPlotDesign {
  strokeStyleRe?: string | false
  strokeStyleIm?: string | false
  strokeStyleAxes?: string | false
  strokeStyleReMarker?: string | false
  strokeStyleImMarker?: string | false
  scaleX?: number
  scaleY?: number
  x0?: number
  y0?: number
}

class LinearPlot2D implements LinearPlotDesign {

  strokeStyleRe: string | false = 'rgb(0,172,0)'
  strokeStyleIm: string | false = 'rgb(255,127,127)'
  strokeStyleReMarker: string | false = 'rgba(0,172,0, 0.5)'
  strokeStyleImMarker: string | false = 'rgba(255,127,127, 0.5)'
  strokeStyleAxes: string | false = 'rgb(128,128,128)'
  scaleX: number
  scaleY: number
  x0: number
  y0: number

  constructor(signal: Signal, context: CanvasRenderingContext2D, design: LinearPlotDesign = {}) {

    let bounds = signal.getBounds()

    console.log(bounds)

    this.scaleX = design.scaleX !== undefined ? design.scaleX :
      (context.canvas.width  * 0.95) / Math.abs(bounds.tMax - bounds.tMin) // * 0.5
    // TODO (1) : separate scale Re and scale Im ?
    let maxY = Math.max(bounds.rMax, bounds.iMax)
    let minY = Math.min(bounds.rMin, bounds.iMin)
    this.scaleY = design.scaleY !== undefined ? design.scaleY :
      context.canvas.height * 0.5 * 0.95 / Math.abs(maxY - minY)

    this.x0 = design.x0 !== undefined ? design.x0 : signal.get_t(signal.length / 2) // + signal.t_delta // Math.floor(context.canvas.width / 2) // TODO (0) 
    this.y0 = design.y0 !== undefined ? design.y0 : Math.floor(context.canvas.height / 2)
    this.strokeStyleRe = design.strokeStyleRe === undefined ? this.strokeStyleRe : design.strokeStyleRe
    this.strokeStyleReMarker = design.strokeStyleReMarker === undefined ? this.strokeStyleReMarker : design.strokeStyleReMarker
    this.strokeStyleIm = design.strokeStyleIm === undefined ? this.strokeStyleIm : design.strokeStyleIm
    this.strokeStyleImMarker = design.strokeStyleImMarker === undefined ? this.strokeStyleImMarker : design.strokeStyleImMarker
    this.strokeStyleAxes = design.strokeStyleAxes === undefined ? this.strokeStyleAxes : design.strokeStyleAxes

    if (this.strokeStyleAxes) {
      context.beginPath()
      context.strokeStyle = this.strokeStyleAxes
      context.moveTo(0, this.y0); context.lineTo(context.canvas.width, this.y0)
      context.moveTo(this.x0, 0); context.lineTo(this.x0, context.canvas.height)
      context.stroke()
    }

    if (this.strokeStyleRe) {

      context.strokeStyle = this.strokeStyleRe
      context.beginPath()
      context.moveTo(this.x0 + signal.get_t(0) * this.scaleX, this.y0 - signal.r[0] * this.scaleY)

      for (let i = 0; i < signal.length; i++) {
        context.lineTo(+ this.x0 + signal.get_t(i) * this.scaleX, this.y0 - signal.r[i] * this.scaleY)
      }
      context.stroke()
    }

    if (this.strokeStyleIm) {

      context.strokeStyle = this.strokeStyleIm
      context.beginPath()
      context.moveTo(this.x0 + signal.get_t(0) * this.scaleX, this.y0 - signal.i[0] * this.scaleY)
      for (let i = 0; i < signal.length; i++) {
        context.lineTo( this.x0 + signal.get_t(i) * this.scaleX, this.y0 - signal.i[i] * this.scaleY)
      }

      context.stroke()
    }

    if (this.strokeStyleReMarker) {

      context.strokeStyle = this.strokeStyleReMarker

      for (let i = 0; i < signal.length; i++) {
        context.strokeRect(signal.get_t(i) * this.scaleX + this.x0 - 1, this.y0 - signal.r[i] * this.scaleY - 1, 3, 3)
      }
    }

    if (this.strokeStyleImMarker) {

      context.strokeStyle = this.strokeStyleImMarker

      for (let i = 0; i < signal.length; i++) {
        context.strokeRect(signal.get_t(i) * this.scaleX + this.x0 - 1, this.y0 - signal.i[i] * this.scaleY - 1, 3, 3)
      }
    }
  }
}
