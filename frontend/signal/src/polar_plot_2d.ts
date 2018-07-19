
// styles : undefined => defaut style ; false => don't display ; string => custom style
interface PolarPlotDesign {
  strokeStyleRe?: string | false
  strokeStyleIm?: string | false
  strokeStyleReMarker?: string | false
  strokeStyleImMarker?: string | false
  strokeStyleCenterOfMass?: string | false
  strokeStyleAxes?: string | false
  x0?: number
  y0?: number
}

class PolarPlot2D implements PolarPlotDesign {

  strokeStyleRe: string | false = 'rgb(0,172,0)'
  strokeStyleIm: string | false = 'rgb(255,127,127)'
  strokeStyleReMarker: string | false = 'rgba(0,172,0, 0.5)'
  strokeStyleImMarker: string | false = 'rgba(255,127,127, 0.5)'
  strokeStyleCenterOfMass?: string | false = 'rgb(255,0,0)'
  strokeStyleAxes: string | false = 'rgb(128,128,128)'
  scaleRe: number
  scaleY: number
  x0: number
  y0: number

  constructor(signal: Signal, context: CanvasRenderingContext2D, windingFrequency = 1, design: PolarPlotDesign = {}) {

    let factor = Math.PI * windingFrequency // - : clockwise, to follow Fourier convention

    // 90% of canvas half height  / highest absolute peak
    let bounds = signal.getBounds()
    this.scaleRe = (context.canvas.width * 0.5 * 0.9) / Math.max(Math.abs(bounds.rMax), Math.abs(bounds.rMin))
    this.scaleY = context.canvas.height * 0.5 * 0.9 / Math.max(Math.abs(bounds.iMax), Math.abs(bounds.rMax), Math.abs(bounds.rMin), Math.abs(bounds.iMin))

    this.x0 = design.x0 !== undefined ? design.x0 : Math.floor(context.canvas.width / 2)
    this.y0 = design.y0 !== undefined ? design.y0 : Math.floor(context.canvas.height / 2)
    this.strokeStyleRe = design.strokeStyleRe === undefined ? this.strokeStyleRe : design.strokeStyleRe
    this.strokeStyleReMarker = design.strokeStyleReMarker === undefined ? this.strokeStyleReMarker : design.strokeStyleReMarker
    this.strokeStyleIm = design.strokeStyleIm === undefined ? this.strokeStyleIm : design.strokeStyleIm
    this.strokeStyleImMarker = design.strokeStyleImMarker === undefined ? this.strokeStyleImMarker : design.strokeStyleImMarker
    this.strokeStyleCenterOfMass = design.strokeStyleCenterOfMass === undefined ? this.strokeStyleCenterOfMass : design.strokeStyleCenterOfMass
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

      // exp( t * i ) =  cos(t) + sin(t) * i

      let t = signal.get_t(0) * factor
      let x_t = Math.cos(t) * signal.r[0]
      let y_t = Math.sin(t) * signal.r[0]


      context.moveTo(this.x0 + x_t * this.scaleRe, this.y0 + y_t * this.scaleRe)

      for (let i = 0; i < signal.length; i++) {

        t = signal.get_t(i) * factor

        x_t = Math.cos(t) * signal.r[i]
        y_t = Math.sin(t) * signal.r[i]

        context.lineTo(this.x0 + x_t * this.scaleRe, this.y0 + y_t * this.scaleRe)
      }

      context.stroke()

      context.strokeStyle = 'rgb(255,0,0)'
    }


    /*   if (this.strokeStyleIm) {
   
         context.strokeStyle = this.strokeStyleIm
         context.beginPath()
         context.moveTo(signal.getX(0) * this.scaleX + this.x0, this.y0 - signal.i[0] * this.scaleY)
         for (let i = 0; i < signal.length; i++) {
           context.lineTo(signal.getX(i) * this.scaleX + this.x0, this.y0 - signal.i[i] * this.scaleY)
         }
   
         context.stroke()
       } */

    if (this.strokeStyleReMarker) {

      context.strokeStyle = this.strokeStyleReMarker

      let t, x_t, y_t

      for (let i = 0; i < signal.length; i++) {

        t = signal.get_t(i) * factor
        x_t = Math.cos(t) * signal.r[i] * this.scaleRe
        y_t = Math.sin(t) * signal.r[i] * this.scaleRe

        context.strokeRect(this.x0 + x_t - 1, this.y0 + y_t - 1, 3, 3)
      }

    }

    /*  if (this.strokeStyleImMarker) {
  
        context.strokeStyle = this.strokeStyleImMarker
  
        for (let i = 0; i < signal.length; i++) {
          context.strokeRect(signal.getX(i) * this.scaleX + this.x0 - 1, this.y0 - signal.i[i] * this.scaleY - 1, 3, 3)
        }
      } */

    if (this.strokeStyleCenterOfMass) {

      let tally_x_t = 0
      let tally_y_t = 0
      let t, x_t, y_t

      for (let i = 0; i < signal.length; i++) {

        t = signal.get_t(i) * factor
        x_t = Math.cos(t) * signal.r[i]
        y_t = Math.sin(t) * signal.r[i]

        tally_x_t += x_t
        tally_y_t += y_t
      }

      tally_x_t = tally_x_t / signal.length * this.scaleRe
      tally_y_t = tally_y_t / signal.length * this.scaleRe

      console.log('cm : ' + tally_x_t + ', ' + tally_y_t)

      context.strokeStyle = this.strokeStyleCenterOfMass
      context.strokeRect(this.x0 + tally_x_t - 1, this.y0 + tally_y_t - 1, 3, 3)
    }

  }
}
