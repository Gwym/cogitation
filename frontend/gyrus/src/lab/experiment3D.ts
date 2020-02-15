
enum FluidExperiment3DScenarioId { Test, Dam, Faucet, Cube, VortexRing, Wave }

interface ScenarioOptionsFluid3D {

    scenarioId: FluidExperiment3DScenarioId
}

interface Experiment3DInitOptions extends ExperimentInitOptions {

}

abstract class Experiment3DContainerBase extends ExperimentContainerBase {

}

abstract class Experiment3DBase extends ExperimentBase {

    protected camera: THREE.PerspectiveCamera
    protected controls: THREE.TrackballControls
    protected renderer3D: THREE.WebGLRenderer
    protected scene: FIVE.Scene // ThreeScene3D
    protected light: THREE.SpotLight
    protected ambient: THREE.AmbientLight

    // protected walls: VirtualWall[] = []
    // protected floor: THREE.Mesh

    protected abstract physicalModel: PhysicalModel3D

    protected perf = new PerformanceAccumulator()
    protected renderer2D: Canvas2DRenderer

    autoAnimationStart = true

    constructor(settings: ExperimentSettings, _options: Experiment3DInitOptions) {
        super()

        // 3D 

        // TODO (0) : Scenario => Scene

        this.scene = new FIVE.Scene() // ThreeScene3D()
        //let w = settings.container.domContainer.offsetWidth
        //let h = settings.container.domContainer.offsetHeight

        let w = window.innerWidth
        let h = window.innerHeight

        // this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
         this.camera = new THREE.PerspectiveCamera(this.scene.fov, w / h, this.scene.near, this.scene.far)
       //  this.camera.up.set(0, 1, 0)
       // this.camera.position.set( 0, 0, 5) // // options.lookFrom
       // this.camera.lookAt(new THREE.Vector3(0, 0, 0))
        this.scene.add(<any>this.camera)

        this.ambient = new THREE.AmbientLight(this.scene.ambientColor)
        this.scene.add(<any>this.ambient)

        this.light = new THREE.SpotLight(0xffffff)
        this.light.position.set(30, 30, 40)
        this.light.target.position.set(0, 0, 0)
        this.scene.add(<any>this.light)

        this.renderer3D = new THREE.WebGLRenderer({ clearColor: 0x000000, clearAlpha: 1, antialias: false })
        this.renderer3D.setSize(w, h)
        this.renderer3D.setPixelRatio( window.devicePixelRatio )
        this.renderer3D.domElement.id = 'canvas3D'
        settings.container.domContainer.appendChild(this.renderer3D.domElement)
        this.renderer3D.setClearColor(this.scene.ambientColor, 1)

       

        // this.addVisualEntitiesToScene()

        this.scene.sceneBaseLength = this.scene.children.length

         // 2D

         this.renderer2D = new Canvas2DRenderer({
            width: settings.container.domContainer.offsetWidth,
            height: settings.container.domContainer.offsetHeight
        })

        this.renderer2D.domElement.id = 'canvas2D'
        settings.container.domContainer.appendChild(this.renderer2D.domElement)

        // FIXME (0) : conflict controls 2D / 3D
        // this.controls = new Pointer2D(document, document.body)

         // this.controls = new THREE.TrackballControls(this.camera, this.renderer3D.domElement);
         this.controls = new THREE.TrackballControls(this.camera, this.renderer2D.domElement);
         this.controls.rotateSpeed = 1.0
         this.controls.zoomSpeed = 1.2
         this.controls.panSpeed = 0.2
         this.controls.noZoom = false
         this.controls.noPan = false
         this.controls.staticMoving = false
         this.controls.dynamicDampingFactor = 0.3
         let radius = 100
         this.controls.minDistance = 0.0
         this.controls.maxDistance = radius * 1000
         this.controls.screen.width = w
         this.controls.screen.height = h
    }

    addVisualEntitiesToScene() {

        // X axis => red. Y axis => green. Z axis => blue.
        var axesHelper = new FIVE.AxesHelper(1)
        this.scene.add(axesHelper)
    }

    // animation stuff, camera, control
    animationStep(timestamp: number) {

        if (this.animationStepOptions.renderVerbose) {
            console.log('Experiment3DBase > visualStep > '
                + ' timestamp:' + timestamp
                + ' showPerf:' + this.animationStepOptions.showPerf
                + ' physicalStepPerVisualStep ' + this.scene.physicalStepPerVisualStep
            )
        }

        if (this.animationStepOptions.runPhysicalStep) {

            if (this.animationStepOptions.runPhysicalStep !== Number.POSITIVE_INFINITY && this.animationStepOptions.runPhysicalStep > 0) {
                console.log('step: '+ this.animationStepOptions.runPhysicalStep)
                this.animationStepOptions.runPhysicalStep--
            }

            this.physicalStep()
        }
       /* for (let step = 0; step < this.scene.physicalStepPerVisualStep; step++) {
            this.physicalModel.physicalStep(this.visualStepOptions)
        } */

        this.controls.update()
        this.renderer3D.render(<any>this.scene, this.camera)

        if (this.perf.showPerf) {
            // TODO (0) : per step => only include start - stop time interval
            this.perf.drawFPS(this.renderer2D.context)
        }
    }

    protected physicalStep() {
        
        for (let step = 0; step < this.scene.physicalStepPerVisualStep; step++) {
            this.physicalModel.physicalStep(this.animationStepOptions)
        }
    }

    resize(w: number, h: number) {

        this.renderer3D.setSize(w, h)

        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()

        this.controls.screen.width = w
        this.controls.screen.height = h

        // this.camera.radius = ( w + h ) / 4
    }
}



