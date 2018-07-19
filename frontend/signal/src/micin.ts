
// FIXME : chrome does not fire if no destination
// using fake destination doesn't work : https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination
var isChrome = function() {
    return Boolean((<any>window).chrome);
}
// FIXME : typescript missing def

/*interface MediaStreamAudioDestinationNode extends AudioNode {

}

interface AudioContext {
    createMediaStreamDestination: () => MediaStreamAudioDestinationNode;
} */


console.log('micin >');

// window.addEventListener('load', initContext );

function initContext() {
  
  var recButton = <HTMLElement>document.getElementById('rec_button');
  var playButton = <HTMLElement>document.getElementById('play_button');
  
  var contexts: CanvasRenderingContext2D[] = [], canvas = document.querySelectorAll('canvas');
  
  for (var i = 0 ; i < canvas.length ; i++) {
    contexts[i] = <CanvasRenderingContext2D>canvas[i].getContext("2d");
  }
  
  var audioCtx = new AudioContext();
 
   /* TODO
  affichage abs max signal sur range(pour  qq sec)  
  sauver dans signalBuffer
  changer affichage avec celui de collision> pour le signal détaillé
  playback
  fft dynamique gaussienne glissante */
  
  var microphone: MediaStreamAudioSourceNode;


 // var dest = audioCtx.createMediaStreamDestination();
 //  var mediaRecorder = new MediaRecorder(dest.stream);

  var audioProcessor = function (audioProcessingEvent: AudioProcessingEvent) {
    
      start_time_full = performance.now();
    
      if (frameCount++ > 0) {
        microphone.disconnect(scriptNode);
        scriptNode.disconnect(audioCtx.destination);
        recButton.removeAttribute("disabled");
        stop_time_rec = performance.now();
        console.log('stop rec (ms) :' + (stop_time_rec - start_time_rec));
        return;
      }
    
      console.log('frame:' + frameCount + ' s:' + audioProcessingEvent.inputBuffer.duration);
     
      inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      outputData = audioProcessingEvent.outputBuffer.getChannelData(0);
    
      for ( let sample = 0; sample < inputData.length; sample++) {
        outputData[sample] = inputData[sample];
        // outputData[sample] += ((Math.random() * 2) - 1) * 0.2;  
        // outputData[sample] += Math.sin(sample / 10);
      }
    
      signal = new Signal(inputData);
      signal.x0 = -signal.length / 2;
      
      for (let i = 0 ; i < contexts.length ; i++) {
        contexts[i].clearRect(0, 0, contexts[i].canvas.width, contexts[i].canvas.height);
      }
    
     var plot = new Plot(signal, contexts[0]);
    
    
    /* var deriv = derivative(signal);
    
     plot(signal, contexts[1], prepareDesign(signal, contexts[1])); */

    
   /*   start_time_fft = performance.now();
      fft(1, signal.length, signal.r, signal.i);
      stop_time_fft = performance.now();
      console.log('fft (ms): ' + (stop_time_fft - start_time_fft));

      plot(signal, contexts[1], prepareDesign(signal, contexts[1]));

    //  polarSignal = polar(signal);
    //  plot(polarSignal, contexts[2], prepareDesign(polarSignal, contexts[2])); */
    
      stop_time_full = performance.now();
      console.log('full (ms): ' + (stop_time_full - start_time_full));
  }

  // Create a ScriptProcessorNode with auto bufferSize  and a single input and output channel
  var scriptNode = audioCtx.createScriptProcessor(undefined, 1, 1);

  scriptNode.onaudioprocess = audioProcessor;
  
  // Create an empty two seconds mono buffer at the sample rate of the AudioContext
  // 44100 * n.0 multiple de 4096 ?
  var signalArrayBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2.0, audioCtx.sampleRate);

  
  var frameCount = 0;
  var inputData: Float32Array, outputData: Float32Array, signal: Signal;
  var stop_time_fft: number, start_time_fft: number, stop_time_rec: number, start_time_rec: number, start_time_full: number, stop_time_full: number;
  
// navigator.mediaDevices.getUserMedia

/*navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
   getUserMedia: function(c) {
     return new Promise(function(y, n) {
       (navigator.mozGetUserMedia ||
        navigator.webkitGetUserMedia).call(navigator, c, y, n);
     });
   }
} : null);

  navigator.getUserMedia = (navigator.getUserMedia || (<any>navigator).webkitGetUserMedia || (<any>navigator).mozGetUserMedia || (<any>navigator).msGetUserMedia);
  window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || (<any>window).mozCancelAnimationFrame;
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || (<any>window).mozRequestAnimationFrame; */
   
 navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      console.log(stream);
      microphone = audioCtx.createMediaStreamSource(stream);
      if (microphone) {
        recButton.removeAttribute("disabled");
       /* console.log(microphone);
        microphone.connect(scriptNode);
        scriptNode.connect(audioCtx.destination); */
      }
    })/*.catch(function(err) {
  console.error(err);
}); */

 /* navigator.getUserMedia({
      audio: true
    }, function (stream) {
      microphone = audioCtx.createMediaStreamSource(stream);
      if (microphone) {
        recButton.removeAttribute("disabled");
        console.log(microphone);
        microphone.connect(scriptNode);
        // scriptNode.connect(audioCtx.destination);
      }
    }, function (err) {
      console.error(err)
    }
  ) */
  
  recButton.onclick = function (e) {
    
    (<Element>e.target).setAttribute("disabled", "true");
    
    frameCount = 0;
    start_time_rec = performance.now();
    console.log('start rec: ' + start_time_rec); // startreck !!
    
    microphone.connect(scriptNode);
    if (isChrome)
      scriptNode.connect(audioCtx.destination);

    
  // bufferSource.connect(scriptNode);
  // scriptNode.connect(audioCtx.destination);
  // bufferSource.start();
  }
  
  
}