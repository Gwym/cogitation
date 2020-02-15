

// TODO (3) : 
// FIXME (2) : Vec3 independant from THREE if three is not used and extends three if used

class Vec3 extends THREE.Vector3 {

    toString() {
        return this.x + ',' + this.y + ',' + this.z
    }

    static toStr(v: THREE.Vector3) {
        return v.x + ',' + v.y + ',' + v.z
    }

    static isInteger(v: Vec3) {

        return (Number.isInteger(v.x) 
        && Number.isInteger(v.y)
        && Number.isInteger(v.z))
    }

    static isNonZero(v: Vec3) {
        return (v.x != 0
        && v.y != 0
        && v.z != 0)
    }
}

class Laboratory {

    static GravityAcceleration = -9.80665
    static GravityVector = new Vec3(0.0, Laboratory.GravityAcceleration, 0.0) // FIXME (0) : gravity for vorton is Z

    protected mainUI: HTMLDivElement
    protected animationId?: number
    protected experimentIndexer = 0
    protected experimentMap: Map<number, ExperimentContainerInterface> = new Map()
    protected somnolentExperiments: Set<ExperimentContainerInterface> = new Set()
    protected animatedExperiments: Set<ExperimentContainerInterface> = new Set()

    constructor(experiment?: ExperimentContainerInterface) {

        console.log('Laboratory > constructor > ')

        this.mainUI = document.createElement('div')
        this.mainUI.className = 'deck'

        // TODO (0) : domContainer
        document.body.appendChild(this.mainUI)

        if (experiment) {
            this.loadExperiment(experiment)
        }
        else {
            let title = document.createElement('h1')
            title.textContent = 'No experiments'
            this.mainUI.appendChild(title)
        }
    }

    loadExperiment(experiment: ExperimentContainerInterface, updateUI = true) {

        experiment.experimentIndexer = this.experimentIndexer
        this.experimentMap.set(this.experimentIndexer++, experiment)
        this.somnolentExperiments.add(experiment)
        if (updateUI) {
            this.updateMainUI()
        }
    }

    loadExperiments(experiments: ExperimentContainerInterface[]) {

        for (let experiment of experiments) {
            //this.experimentMap.set(this.experimentIndexer++, experiment)
            // this.somnolentExperiments.add(experiment)
            this.loadExperiment(experiment, false)
        }
        this.updateMainUI()
    }

    activateExperiment(experiment: ExperimentContainerInterface) {

        console.log('Laboratory > activateExperiment ' + experiment.title)

        this.mainUI.style.visibility = 'hidden'
        // TODO (0) : display closeExperiment
        experiment.activate({ kind: Kind.Experiment, scenarioId: 0 })

        // TODO (5) : this.activeExperiment.pushOrReplace() : multiple experiment managment 
        // this.activeExperiment = experiment
    }

    updateMainUI(): void {

        while (this.mainUI.firstChild) {
            this.mainUI.removeChild(this.mainUI.firstChild)
        }

        for (let experiment of this.animatedExperiments) {
            this.addExperimentCard(experiment)
        }

        for (let experiment of this.somnolentExperiments) {
            this.addExperimentCard(experiment)
        }
    }

    addExperimentCard(experiment: ExperimentContainerInterface) {

        console.log('Create experiment card ' + experiment.title)

        let card = document.createElement('div')
        let button = document.createElement('button')

        button.textContent = experiment.title
        button.addEventListener('click', () => {
            
            console.log('Activate experiment card ' + experiment.title)
            this.activateExperiment(experiment)
        })

        card.appendChild(button)
        this.mainUI.appendChild(card)
    }

    public updateAnimationRequests(requestAnimation: boolean, experiment: ExperimentContainerInterface): boolean {

        if (requestAnimation) {
            if (this.somnolentExperiments.delete(experiment)) {
                this.animatedExperiments.add(experiment)
                this.runAnimation()
                return true
            }
            else {
                console.warn('experiment ' + experiment.title + ' requested animation but was not somnolent')
                return false
            }
        }
        else {
            if (this.animatedExperiments.delete(experiment)) {
                this.somnolentExperiments.add(experiment)
                this.stopAnimation()
                return false
            }
            else {
                console.warn('experiment ' + experiment.title + ' requested somnolence but was not animated')
                return true
            }
        }
    }

    protected runAnimation() {

        if (this.animationId === undefined) {

            this.animationId = requestAnimationFrame(this.animationLoop)
            console.log('runAnimation > Start new loop ' + this.animationId)
        }
        else {
            console.log('runAnimation > Loop running : ' + this.animationId)
        }
    }

    protected animationLoop = (timestamp: number) => {

        if (this.animationId !== undefined) {

            for (let experiment of this.animatedExperiments) {
                experiment.animationStep(timestamp)
            }

            requestAnimationFrame(this.animationLoop)
        }
    }

    protected stopAnimation() {

        if (this.animationId !== undefined && this.animatedExperiments.size < 1) {

            cancelAnimationFrame(this.animationId)
            this.animationId = undefined

            console.log('stopAnimation > Cancel loop ' + this.animationId + ' remaining:' + this.animatedExperiments.size)
        }
        else {
            console.log('stopAnimation > Keep loop ' + this.animationId + ' remaining:' + this.animatedExperiments.size)
        }
    }
}


// TODO (1) : merge Laboratory and Engine as unique animation controller and remove all physics

class ScenaristLaboratory extends Laboratory {

    channel: ChannelNoUI

    constructor(experiment?: ExperimentContainerInterface) {
        super(experiment)

        let allowGuestSession = true; // TODO (0) : configuration

        if (allowGuestSession) {
            console.log('ScenaristLaboratory > Setting guest session')
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

        console.log('ScenaristLaboratory > Protocol version: ' + websocketProtocolVersion);

        let loc = window.location;

        // if (loc.protocol === "https:") { ws_uri = "wss:"; } else { ws_uri = "ws:"; } ws_uri += "//" + loc.host + "/";

        let wsUri: string;
        if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
            wsUri = "ws://" + loc.host + "/";
        } else {
            wsUri = "ws://" + loc.hostname + ":8080/";
        }

        this.channel = new ChannelNoUI({ wsUri: wsUri, protocol: websocketProtocolVersion, messageHandler: this.messageHandler })
    }

    protected messageHandler = (m: s2c_ChannelMessage): void => {

        console.log('ScenaristLaboratory > messageHandler ' + m)

        // FIXME (3) : direct messaging w/o adressing for perfomance ?
        if (m.type === MessageType.ExperimentMessage) {
            this.dispatchExperimentMessage(<ExperimentAck>m)
        }
        else if (m.type === MessageType.User) {
            // this.ui.setUser(<UserSessionAck>m);
        }
        else if (m.type === MessageType.Admin) {
            dispatchAdminAck(m);
        }
        else {
            console.error('Unknown message type ' + m.type);
        }
    }

    protected dispatchExperimentMessage(m: ExperimentAck) {

        console.log('dispatchExperimentMessage ' + m.message + ' to ' + m.message.experimentId)

        let addressee = this.experimentMap.get(m.message.experimentId)
        if (addressee && addressee.onServerAck) {
            addressee.onServerAck(m.message)
        }
        else {
            console.error('no experiment ' + m.message.experimentId + ' or no handler ')
        }

    }
}