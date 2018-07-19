

// TODO (2) : no auto load, convert to loadable Experiement
// window.addEventListener('load', startSignal)

function startSignal() {

  console.log('Signal > loading')

  let contexts: CanvasRenderingContext2D[] = [], canvas = document.querySelectorAll('canvas')

  if (canvas.length === 0) {
    throw ('no canavas element') // TODO (2) : auto-create
  }

  for (var i = 0; i < canvas.length; i++) {
    contexts[i] = <CanvasRenderingContext2D>canvas[i].getContext("2d");
  }

  console.log('sulcus - signal contexts: ' + contexts.length)

  let start_time_full = performance.now()

  for (let i = 0; i < contexts.length; i++) {
    // contexts[0].imageSmoothingEnabled =  true
    contexts[0].translate(0.5, 0.5)
    contexts[i].clearRect(0, 0, contexts[i].canvas.width, contexts[i].canvas.height)
    // contexts[i].fillStyle = 'black'
    // contexts[i].fillRect(0, 0, contexts[i].canvas.width, contexts[i].canvas.height)
  }

  let signal1 = new Signal(256)
  // signal1.exp_i(10.5, 1.5, 1)
  // signal1.sin_f(3, 1.2, 0)
  signal1.sin_f(3, 0, 0)

  new LinearPlot2D(signal1, contexts[0])

  /* let start_time, end_time
   
   start_time = performance.now()
   fft(signal1.r, signal1.i)
   end_time = performance.now()

   console.log('fft (ms): ' + (end_time - start_time))

   new LinearPlot2D(signal1, contexts[1])

   let bounds  = signal1.getBounds()
   console.log(bounds)

   // let signal2 = cleanLowAmplitude(signal1, bounds.r_max, bounds.r_min )
   let signal2 = signal1

   new LinearPlot2D(signal2, contexts[2])

   start_time = performance.now()
   fft(signal2.r, signal2.i, true)
   end_time = performance.now()

   console.log('rfft (ms): ' + (end_time - start_time))

   new LinearPlot2D(signal2, contexts[3]) */

 // new XYPlot2D(signal1, contexts[1])

 /* let polarSignal = polar(signal1)

  new LinearPlot2D(polarSignal, contexts[1]) */

  let signalCM = new Signal(256)

   for (let j = 1; j < 256; j++) {

    let windingFrequency = j / 512 
    let factor = Math.PI * windingFrequency // - : clockwise, to follow Fourier convention

    let tally_x_t = 0
      let tally_y_t = 0
      let t, x_t, y_t

      for (let i = 0; i < signal1.length; i++) {

        t = signal1.get_t(i) * factor
        x_t = Math.cos(t) * signal1.r[i]
        y_t = Math.sin(t) * signal1.r[i]

        tally_x_t += x_t
        tally_y_t += y_t
      }

      tally_x_t = tally_x_t / signal1.length
      tally_y_t = tally_y_t / signal1.length

      console.log('cm : ' + tally_x_t + ', ' + tally_y_t)
      signalCM.r[j] = tally_x_t
      signalCM.i[j] = tally_y_t

      // contexts[1].strokeStyle = this.strokeStyleCenterOfMass
      // contexts[1].strokeRect(this.x0 + tally_x_t - 1, this.y0 + tally_y_t - 1, 3, 3)
 
  } 

   new LinearPlot2D(signalCM, contexts[1])

/*
    new PolarPlot2D(signal1, contexts[2], 0.33, {
      
    }) */
 
  

  /* new PolarPlot2D(signal1, contexts[3], 1/20, {
    strokeStyleRe: false,
    strokeStyleReMarker: false
  }) */

  // var polarSignal = polar(signal);
  // plot(polarSignal, contexts[2], prepareDesign(polarSignal, contexts[2])); 

  // draw(contexts[2])

  /* var deriv = derivative(signal);
  
   plot(signal, contexts[1], prepareDesign(signal, contexts[1])); */


  /*   start_time_fft = performance.now();
     fft(1, signal.length, signal.r, signal.i);
     stop_time_fft = performance.now();
     console.log('fft (ms): ' + (stop_time_fft - start_time_fft));
 
     plot(signal, contexts[1], prepareDesign(signal, contexts[1]));
 
   //  polarSignal = polar(signal);
   //  plot(polarSignal, contexts[2], prepareDesign(polarSignal, contexts[2])); */

  let stop_time_full = performance.now();
  console.log('full (ms): ' + (stop_time_full - start_time_full));

}

function draw(ctx: CanvasRenderingContext2D) {

  // left rectangles, rotate from canvas origin
  ctx.save();
  // blue rect
  ctx.fillStyle = '#0095DD';
  ctx.fillRect(30, 30, 100, 100);
  ctx.rotate((Math.PI / 180) * 25);
  // grey rect
  ctx.fillStyle = '#4D4E53';
  ctx.fillRect(30, 30, 100, 100);
  ctx.restore();

  // right rectangles, rotate from rectangle center
  // draw blue rect
  ctx.fillStyle = '#0095DD';
  ctx.fillRect(150, 30, 100, 100);

  ctx.translate(200, 80); // translate to rectangle center 
  // x = x + 0.5 * width
  // y = y + 0.5 * height
  ctx.rotate((Math.PI / 180) * 25); // rotate
  ctx.translate(-200, -80); // translate back

  // draw grey rect
  ctx.fillStyle = '#4D4E53';
  ctx.fillRect(150, 30, 100, 100);
}


// plot : signal = { r[], i[], offset_x, scale_x }

// TODO : dérivée de forme, en passant le sigal sur un cercle et avec inertie par rapport à la période précédente ?
// periode n - periode n+1

// window.addEventListener('load', initPlot );
/*
function initPlot() {
  
  var contexts: CanvasRenderingContext2D[] = [], canvas = document.querySelectorAll('canvas');
  for (var i = 0 ; i < canvas.length ; i++) {
    contexts[i] = <CanvasRenderingContext2D>canvas[i].getContext("2d");
  }
  
  var changeSignal = function() {
    
    for (var i = 0 ; i < contexts.length ; i++) {
      contexts[i].clearRect(0, 0, contexts[i].canvas.width, contexts[i].canvas.height);
    }
    
    var len = parseInt(samples.options[samples.selectedIndex].value);
    var signal = new Signal(len);

    initSignal[oscillator.options[oscillator.selectedIndex].value](signal);
    plot(signal, contexts[0], prepareDesign(signal, contexts[0]));
   
    let start_time, end_time;
    
     
    start_time = performance.now();
    console.log(start_time);
    var ft = naiveDFT(signal);

    end_time = performance.now();
    console.log('ft (ms): ' + (end_time - start_time));

    plot(ft, contexts[1], prepareDesign(ft, contexts[1]));
    

    start_time = performance.now();
    fft(1, signal.length, signal.r, signal.i);
    end_time = performance.now();
    console.log('fft (ms): ' + (end_time - start_time));

    plot(signal, contexts[1], prepareDesign(signal, contexts[1]));

    var polarSignal = polar(signal);
    plot(polarSignal, contexts[2], prepareDesign(polarSignal, contexts[2]));
  }
  
  var samples = document.getElementById('samples');
  samples.addEventListener('change', changeSignal );
  
  var oscillator = document.getElementById('oscillator');
  oscillator.addEventListener('change', changeSignal );
  for (let i in initSignal) {
    var e = document.createElement("option");
    e.setAttribute("value", i);
    e.appendChild(document.createTextNode(i));
    oscillator.appendChild(e);
  }
    
  // initSignal.dirac(signal);
  // initSignal.sin(signal); // sin
  // initSignal.sin(signal, Math.PI/2); // cos
  // initSignal.exp_i(signal);
  // initSignal.gaussian(signal);
  // initSignal.gaussianPulse(signal, Math.PI/2);
  // initSignal.noise(signal);
  // initSignal.dualTone(signal);
}
*/

