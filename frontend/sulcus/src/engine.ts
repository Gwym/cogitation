
// class Engine : World representation
class SulcusClientEngine {

   //  protected ui: UiInterface
    private requestAnimationId: number | undefined
    private pointer: PointerInterface

    /*  static ActionFactory(actId: ActId, zone: Zone): ActionViewer {
   
           let actionConstructor = World.actionContructor[actId];
   
           let act = new actionConstructor(actId);
   
           let actionViewer = new ActionViewer(act);
   
           return actionViewer; // TODO (1) : mixin
       }
   
       static EntityFactory(entityGist: EntityGist): RelEntity {
   
           // TODO : (3) Entity (indeterminate) = f(actor visibility)
   
           let entityConstructor = World.entityConstructor[entityGist.entId];
   
           if (!entityConstructor) {
               entityConstructor = RelEntity;
           }
   
           return new entityConstructor(entityGist);
       } */

    constructor(eventTarget: EventTarget, protected ui: SulcusUi) {

        this.pointer = new BasePointer(eventTarget, this);

        window.addEventListener('resize', () => { this.onWindowResize(); });

        this.pointer.connectEventHandlers();

        // this.startAnimation(); // TODO : render in onmove, etc or anim ?
        // this.renderOnce();
    }

    messageHandler = (m: s2c_ChannelMessage): void => {

        console.log('message ' + m)

        if (m.type === SulcusMessageType.Bootstrap) {
            this.bootstrapRunning(<BootstrapAck>m)
        }
        else if (m.type === SulcusMessageType.Recursion) {
            this.recursionCheck(<RecursionAck>m)
        }
        else if (m.type === MessageType.User) {
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

        this.renderOnce();
    }

    startAnimation() {
        if (this.requestAnimationId) {
            console.error('Engine.startAnimation > Animation pending');
        } else {
            this.animate();
        }
    }

    stopAnimation() {
        if (this.requestAnimationId) {
            window.cancelAnimationFrame(this.requestAnimationId);
            delete this.requestAnimationId;
        } else {
            console.warn('Engine.stopAnimation > No animation');
        }
    }

    private animate() {

        this.requestAnimationId = requestAnimationFrame(() => { this.animate() });


    }

    renderOnce() {

    }

    bootstrapRunning(m: BootstrapAck) {
        this.ui.bootstrapRunning(m)
    }

    recursionCheck(m: RecursionAck) {
        this.ui.recursionCheck(m)

    }
}

