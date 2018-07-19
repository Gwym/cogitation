
// main.ts

// var ui: BaseHtmlUI;
// var G_channel: Channel;
// var G_engine: ClientEngine;

/* window.addEventListener("beforeunload", function (e) {

    console.log('beforeunload' + performance.navigation.type);

  var confirmationMessage = "\o/";

  e.returnValue = confirmationMessage;     // Gecko, Chrome 34+
  return confirmationMessage;              // Gecko, WebKit, Chrome <34
}); */

// called in yenah.html@onload
function createSulcusEngine() {

    let allowGuestSession = true; // TODO (0) : configuration

    if (allowGuestSession) {
        console.log('sulcus > Setting guest session')
        setUserSession('guest')
    }
    else {

        let sessionId = getUserSessionId();

        if (!sessionId) {
            console.log('createChannel > No sessionId ' + sessionId);
            let confirmRedirection = true; // TODO (2) : DRY configuration
            redirect('index.html', ToStringId.SessionError, confirmRedirection);  // switchToScene(ui.loginScene); 
            throw 'no session id';
        }
    }

    console.log('sulcus > Protocol version: ' + websocketProtocolVersion);

    let loc = window.location;

    // if (loc.protocol === "https:") { ws_uri = "wss:"; } else { ws_uri = "ws:"; } ws_uri += "//" + loc.host + "/";

    let wsUri: string;
    if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
        wsUri = "ws://" + loc.host + "/";
    } else {
        wsUri = "ws://" + loc.hostname + ":8080/";
    }

    let ui = new SulcusUi(document.body);
    let engine = new SulcusClientEngine(document, ui);
    let channel = new Channel({ wsUri: wsUri, protocol: websocketProtocolVersion, messageHandler: engine.messageHandler }, ui);
    ui.init(channel)
    ui.setSize(window.innerWidth, window.innerHeight);
}