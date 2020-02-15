
interface MessageHandler {
    (m: s2c_ChannelMessage): void
}

interface ChannelOptions {
    messageHandler: MessageHandler
    wsUri?: string
    protocol?: string
    socket?: WebSocket
    confirmRedirection?: boolean
}

// class Channel : client-server interactions 
class Channel {

    protected socket?: WebSocket
    protected decode?: MessageHandler

    constructor(options: ChannelOptions, protected ui: UiInterface) {

        if (window.location.protocol === "file:") {
            this.ui.addInfo(i18n.gyrus.detector.file_protocol, true, 10000);
            console.log('file:// => no socket');
            return;
        }

        if (options.socket) {
            this.socket = options.socket;
        } else {

            if (!options.wsUri) {
                options.wsUri = 'ws://localhost:8080/';
            }

            console.info('Channel > Connecting WebSocket to ' + options.wsUri);

            try {
                this.socket = new WebSocket(options.wsUri, options.protocol);
            }
            catch (e) {
                this.ui.addInfo(i18n.gyrus.detector.websocket, true, 10000);
                console.error(e);
                return;
            }
        }

        this.decode = options.messageHandler

        this.socket.onmessage = (event) => { this.onChannelMessage(event) }
        this.socket.onopen = (event) => { this.onChannelOpen(event) }
        this.socket.onclose = (event) => { this.onChannelClose(event) }
        // TODO (2) : onerror ?
    }

    protected onChannelOpen(_event: Event) {

        // ui.setConnectedState('websocket_connected');
        this.ui.addInfo(i18n.gyrus.websocket_connected);

        let sessionId = getUserSessionId();

        console.log('Channel.onOpen > sessionId ' + sessionId);

        if (sessionId && this.socket) {
            //let req: SessionCheckRequest = { type: MessageType.SessionCheck, sessionId: sessionId };
            this.socket.send(sessionId); // at first time do not send a message, just a string
        }
        else {
            let confirmRedirection = true; // TODO (2) : DRY configuration
            redirect('index.html', ToStringId.SessionError, confirmRedirection);  // switchToScene(ui.loginScene); 
            throw 'no session id';
        }
    }

    protected onChannelClose(event: CloseEvent) {

        // TODO (5) : manage fail
        // if close on init => timouted retries ?
        // if close on server's demand, ok (invalid session)

        //if (!gracefully) {
        console.warn('Engine.onChannelClose > Channel closed ungracefully ' + performance.navigation.type);
        console.warn('close code:' + event.code);
        this.ui.addInfo(i18n.gyrus.websocket_disconnected, true, 2000); // TODO (2) : ui.addCommand(<a href ... >, no timeout) or redirect + message ?
        /* if (window.performance && performance.navigation.type == 1) {
             console.log('==== page reloaded, skip logout ====' + performance.navigation.type);
         } */
        /*    else {
                setUserAuth(false);
                redirect('index.html', ToStringId.Disconnected, true);
            } */
        //}
    }

    protected onChannelMessage(event: MessageEvent) {

        this.ui.setConnectedState('message_received');

        // TODO (3) : binary message

        try {
            var o: s2c_ChannelMessage = JSON.parse(event.data);

            console.info('Channel.onSocketMessage > type:' + MessageType[o.type] + ' ' + event.data);

            if (o.type === MessageType.Error) {
                if ((<ErrorMessage>o).toStringId) {
                    console.info(i18n.gyrus.x_messages[(<ErrorMessage>o).toStringId]);
                    this.ui.addInfo(i18n.gyrus.x_messages[(<ErrorMessage>o).toStringId], true, 10000);
                }
                if (this.socket) {
                    this.socket.close()
                }
                return;
            }

            if (this.decode) {
                this.decode(o);
            }
        } catch (e) {
            console.error(e);
            alert(i18n.gyrus.x_messages[ToStringId.ServerError]);
        }
    }

    // filter messages from server, unwinding arrays to objects and objects to entity instances
    /*   decode(m: s2c_ChannelMessage): void {
   
           if (m.type === MessageType.Zone) {
               G_engine.onZoneGist((<ZoneAck>m).zoneGist);
           }
           else if (m.type === MessageType.ReqPilot) {
   
               console.log('ui.pendingScene 0 > ' + ui.pendingScene);
               let pilotMsg = <PilotAck>m;
               if (pilotMsg.piloted) {
                   G_engine.onPilotedPool(pilotMsg.piloted);
               }
               if (pilotMsg.pilotable !== undefined) {		
                   ui.beingsScene.refreshPilotable(pilotMsg.pilotable);
               }
               console.log('ui.pendingScene 1 > ' + ui.pendingScene);
           }
           else if (m.type === MessageType.User) {
               ui.setUser(<UserSessionAck>m);
           }
           else if (m.type === MessageType.Admin) {
               dispatchAdminAck(m);
           } 
           else {
               console.error('Unknown message type ' + m.type);
           }
       } */

    send(m: c2s_ChannelMessage) {
        // TODO (1) : block sending or allow multiple messages ?
        if (this.socket) {
            console.log('Channel > send : ' + JSON.stringify(m));
            this.ui.setConnectedState('request_pending');
            this.socket.send(JSON.stringify(m));
        }
        else {
            console.log('Channel > send failed no socket')
        }
    }
}

function report(msg: string) {
    // TODO (3): G_engine.send report...
    console.error(msg);
}


// TODO (0) : replace Channel
class ChannelNoUI {

    protected socket?: WebSocket
    protected decode?: MessageHandler

    constructor(options: ChannelOptions) {

        if (window.location.protocol === "file:") {
            // this.ui.addInfo(i18n.gyrus.detector.file_protocol, true, 10000);
            // console.log('file:// => no socket');
            // return;
            throw (i18n.gyrus.detector.file_protocol)
        }

        if (options.socket) {
            this.socket = options.socket;
        } else {

            if (!options.wsUri) {
                options.wsUri = 'ws://localhost:8080/';
            }

            console.info('Channel > Connecting WebSocket to ' + options.wsUri);

            try {
                this.socket = new WebSocket(options.wsUri, options.protocol);
            }
            catch (e) {
                // this.ui.addInfo(i18n.gyrus.detector.websocket, true, 10000);
                console.error(e);
                return;
            }
        }

        this.decode = options.messageHandler

        this.socket.onmessage = (event) => { this.onChannelMessage(event) }
        this.socket.onopen = (event) => { this.onChannelOpen(event) }
        this.socket.onclose = (event) => { this.onChannelClose(event) }
        // TODO (2) : onerror ?
    }

    protected onChannelOpen(_event: Event) {

        // ui.setConnectedState('websocket_connected');
        // this.ui.addInfo(i18n.gyrus.websocket_connected);

        let sessionId = getUserSessionId();

        console.log('Channel.onOpen > sessionId ' + sessionId);

        if (sessionId && this.socket) {
            // let req: SessionCheckRequest = { type: MessageType.SessionCheck, sessionId: sessionId };
            this.socket.send(sessionId); // at first time do not send a message interface, just a string with sessionID
        }
        else {
            let confirmRedirection = true; // TODO (2) : DRY configuration
            redirect('index.html', ToStringId.SessionError, confirmRedirection);  // switchToScene(ui.loginScene); 
            throw 'no session id';
        }
    }

    protected onChannelClose(event: CloseEvent) {

        // TODO (5) : manage fail
        // if close on init => timouted retries ?
        // if close on server's demand, ok (invalid session)

        //if (!gracefully) {
        console.warn('Engine.onChannelClose > Channel closed ungracefully ' + performance.navigation.type);
        console.warn('close code:' + event.code);
        // this.ui.addInfo(i18n.gyrus.websocket_disconnected, true, 2000); // TODO (2) : ui.addCommand(<a href ... >, no timeout) or redirect + message ?
        /* if (window.performance && performance.navigation.type == 1) {
             console.log('==== page reloaded, skip logout ====' + performance.navigation.type);
         } */
        /*    else {
                setUserAuth(false);
                redirect('index.html', ToStringId.Disconnected, true);
            } */
        //}
    }

    protected onChannelMessage(event: MessageEvent) {

        //this.ui.setConnectedState('message_received');

        // TODO (3) : binary message

        try {
            var o: s2c_ChannelMessage = JSON.parse(event.data);

            console.info('Channel.onSocketMessage > type:' + MessageType[o.type] + ' ' + event.data);

            if (o.type === MessageType.Error) {
                if ((<ErrorMessage>o).toStringId) {
                    console.info(i18n.gyrus.x_messages[(<ErrorMessage>o).toStringId]);
                    // this.ui.addInfo(i18n.gyrus.x_messages[(<ErrorMessage>o).toStringId], true, 10000);
                }
                if (this.socket) {
                    this.socket.close()
                }
                return;
            }

            if (this.decode) {
                this.decode(o);
            }
        } catch (e) {
            console.error(e);
            alert(i18n.gyrus.x_messages[ToStringId.ServerError]);
        }
    }

    // filter messages from server, unwinding arrays to objects and objects to entity instances
    /*   decode(m: s2c_ChannelMessage): void {
   
           if (m.type === MessageType.Zone) {
               G_engine.onZoneGist((<ZoneAck>m).zoneGist);
           }
           else if (m.type === MessageType.ReqPilot) {
   
               console.log('ui.pendingScene 0 > ' + ui.pendingScene);
               let pilotMsg = <PilotAck>m;
               if (pilotMsg.piloted) {
                   G_engine.onPilotedPool(pilotMsg.piloted);
               }
               if (pilotMsg.pilotable !== undefined) {		
                   ui.beingsScene.refreshPilotable(pilotMsg.pilotable);
               }
               console.log('ui.pendingScene 1 > ' + ui.pendingScene);
           }
           else if (m.type === MessageType.User) {
               ui.setUser(<UserSessionAck>m);
           }
           else if (m.type === MessageType.Admin) {
               dispatchAdminAck(m);
           } 
           else {
               console.error('Unknown message type ' + m.type);
           }
       } */

    send(m: c2s_ChannelMessage) {
        // TODO (1) : block sending or allow multiple messages ?
        if (this.socket) {
            console.log('Channel > send : ' + JSON.stringify(m));
            // this.ui.setConnectedState('request_pending');
            this.socket.send(JSON.stringify(m));
        }
        else {
            console.log('Channel > send failed no socket')
        }
    }

    sendBinary(context: CanvasRenderingContext2D) {

        if (this.socket) {
            let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            this.socket.send(imageData.data)
        }
        else {
            console.log('Channel > send failed no socket')
        }
    }

    /*onBinary(event: MessageEvent) {

        if (event.data instanceof ArrayBuffer) {

            var bytearray = new Uint8Array(event.data);

            let imageheight = context.canvas.height
            let imagewidth = context.canvas.width

            var tempcanvas = document.createElement('canvas');
            tempcanvas.height = imageheight;
            tempcanvas.width = imagewidth;
            var tempcontext = tempcanvas.getContext('2d');

            var imgdata = tempcontext.getImageData(0, 0, imagewidth, imageheight);

            var imgdatalen = imgdata.data.length;

            for (var i = 8; i < imgdatalen; i++) {
                imgdata.data[i] = bytearray[i];
            }

            tempcontext.putImageData(imgdata, 0, 0);


            var img = document.createElement('img');
            img.height = imageheight;
            img.width = imagewidth;
            img.src = tempcanvas.toDataURL();
            chatdiv.appendChild(img);
            chatdiv.innerHTML = chatdiv.innerHTML + "<br />";
        }
    }*/
}