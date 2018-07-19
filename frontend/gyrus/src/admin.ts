


// class Engine : World representation
class AdminEngine {

    
    private pointer: PointerInterface

    constructor(eventTarget: EventTarget, protected ui: UiInterface) {




        this.pointer = new BasePointer(eventTarget, this);



        window.addEventListener('resize', () => { this.onWindowResize(); });

        this.pointer.connectEventHandlers();
    }

    messageHandler(m: s2c_ChannelMessage): void {

        if (m.type === MessageType.User) {
            this.ui.setUser(<UserSessionAck>m);
        }
        else if (m.type === MessageType.Admin) {
            dispatchAdminAck(m);
        }
        else {
            console.error('Unknown message type ' + m.type);
        }
    }

    onWindowResize() {

        console.log('onWindowResize ' + window.innerWidth + ' ' + window.innerHeight);
        // this.camera.aspect = window.innerWidth / window.innerHeight; // perspective only

        this.ui.setSize(window.innerWidth, window.innerHeight);
    }
}



class AdminUI extends BaseHtmlUI {

    // protected channel: Channel

    constructor(container: HTMLElement, protected channel: Channel) {
        super(container);

        let panel = document.createElement('div');
        panel.className = 'admin_panel';
        this.addAction(panel, AdminActId.Information);
        this.addAction(panel, AdminActId.CreateUser);
        this.addAction(panel, AdminActId.DeleteUsers);
        this.addAction(panel, AdminActId.ResetWorld);
        this.addAction(panel, AdminActId.UnitTests);
        this.addAction(panel, AdminActId.IntegrationTests);
        container.appendChild(panel);

        panel = document.createElement('div');
        panel.className = 'result_panel';
        container.appendChild(panel);
    }

    addAction(container: HTMLDivElement, actId: AdminActId) {

        let requestButton = document.createElement('input');
        requestButton.type = 'button';
        requestButton.value = AdminActId[actId];
        requestButton.onclick = () => {
            let act = new AdminAction(actId);
            act.triggerAction(this.channel);
        }
        container.appendChild(requestButton);

    }
}

class AdminAction {

    constructor(public actId = AdminActId.Information) {

    }

    triggerAction(channel: Channel) {

        console.log('triggerAction ' + this.actId);

        let message: AdminRequest = {
            type: MessageType.Admin,
            adminActId: this.actId,
        }
        channel.send(message);
    }
}

function dispatchAdminAck(m: s2c_ChannelMessage) {
    console.log('admin message');
    console.log(m);

}

function adminMode() {
    

    /*    let channel = createChannel(adminEngine.messageHandler);
        let ui = new AdminUI(document.body, channel);
        let adminEngine = new AdminEngine(document, ui) 
    
    
    
    
    
        // let eventTarget: EventTarget = document;
    
        ui.setSize(window.innerWidth, window.innerHeight); */
    
    
    
        /*
        
        // G_regionRenderer = new RegionRenderer();
            G_store = new Store();
        
            let canvasWebGl = <HTMLCanvasElement>document.getElementById('canvasWebGl');
            G_engine = new ClientEngine(canvasWebGl, eventTarget); */
    
    }