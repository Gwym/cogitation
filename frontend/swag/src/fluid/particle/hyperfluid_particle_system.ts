
class HyperFluidParticleSystem extends ParticleSystemBase {

    private particles: HyperVorton[] = []


    private timeStep = .1

    private xCellCount = 4
    private yCellCount = 4



    constructor() {
        super()

        console.log('HyperFluidParticleSystem > constructor')
    }

    initialise(modelSettings: PhysicalModel3DInitSettings) {

        let scene = modelSettings.scene

        console.log('initialise > removing ' + (scene.children.length - scene.sceneBaseLength) + ' entities')

        for (let idx = scene.children.length - 1; idx >= scene.sceneBaseLength; idx--) {
            scene.remove(scene.children[idx])
        }

        this.particles = []

        const magnitude = 1

        const direction = new Vec3(1, 0, 0)

        this.particles = new PlaneDistribution(
            magnitude,// magnitude: Float,
            this.xCellCount,
            this.yCellCount,
            direction).particles

        for (let entity of this.particles) {
            // TODO (1) : uncouple visuals form physics => this.scene.add(createVisual(entity))
            scene.add(entity)
        }

        console.log('PARTICLES: ' + this.particles.length)

    }

  

    step(verbose?: boolean) {

        let stepLogger: string[] | undefined

        if (verbose) {
            console.log('HyperFluidParticleSystem > timestep ' + this.timeStep)
            stepLogger = []
        }

        this.doStep(this.timeStep, stepLogger)

        if (stepLogger) {
            console.log('=== STEP LOG ===')
            console.log(stepLogger)
        }

    }


    private doStep(dt: number, _stepLogger?: string[]) {

        for (let particle of this.particles) {
            particle.rotateX(0.01)
            particle.position.addScalar(dt)

            // particle.updateVelocity()

            // particle.geometry.verticesNeedUpdate = true
        }
    }
}

class PlaneDistribution {

    center: Vec3

    // readonly methodId = DistributionMethodId.Box
    particles: HyperVorton[] = []

    xCellCount: number
    yCellCount: number
    direction: Vec3

    constructor(
        magnitude: Float,
        xCellCount: number,
        yCellCount: number,
        direction: Vec3,
        center = new Vec3(0, 0, 0)
    ) {

        this.center = center

        this.xCellCount = xCellCount
        this.yCellCount = yCellCount
        this.direction = direction

        this.generateDistribution(magnitude)
    }

    protected generateDistribution(
        magnitude: Float) {

        console.log('DistributionBase > particles: ' + this.xCellCount + '*' + this.yCellCount + ' magnitude: ' + magnitude)

        let pushCount = 0
        let skipCount = 0


        let positionLocal = new Vec3(0, 0, 0);
        let index = new Vec3()
        const offset = 0.5

        for (index.y = 0; index.y < this.yCellCount; ++index.y) {
            positionLocal.y = (index.y + offset)
            for (index.x = 0; index.x < this.xCellCount; ++index.x) {
                positionLocal.x = (index.x + offset)

                // TODO direction

                let particle = this.createParticle(
                    LA.sum(positionLocal, this.center),
                    magnitude
                )

                if (particle) {
                    this.particles.push(particle)
                    pushCount++
                }
                else {
                    skipCount++
                }
            }
        }


        console.log('Created: ' + pushCount + ' skipped: ' + skipCount)
        const COUNTLOG = 16
        for (let i = 0 ; i < (COUNTLOG < this.particles.length? COUNTLOG: this.particles.length) ; i++) {
            console.log(
                "vorton #"+ i + " r:" + Vec3.toStr(this.particles[i].position) + " v: " + this.particles[i].velocity.toString()
                // + " #" + ((this.particles.length) - 1) + " r:" + Vec3.toStr(this.particles[this.particles.length - 1].position)
                // + " v: " + this.particles[this.particles.length - 1].velocity.toString()
            )
        }
    }

    protected getDomainSize(): Vec3 {

        let boxSideLength = 2 * (this.xCellCount + this.yCellCount)
        return new Vec3(boxSideLength, boxSideLength, boxSideLength)
    }


    protected createParticle(particlePosition: Vec3, fMagnitude: Float): HyperVorton | undefined {

        let velocity = new Vec3(0, 0, fMagnitude)
        let vorticity = new Vec3(0, 0, 0)
        let vorton = new HyperVorton(particlePosition, velocity, vorticity) // FIXME (0) : angularVelocity !!
        // vorton.density  = 1 // default
        return vorton
    }
}


class HyperVorton extends THREE.Object3D {

    static DEFAULT_DRAW_RADIUS = 0.1 // 0.015 //0.01 //0.006
    static DEFAULT_PHYSICAL_RADIUS = 10
    static DEFAULT_PHYSICAL_VOLUME = 1
    static DEFAULT_PHYSICAL_MASS = 1

    protected mesh: THREE.Mesh
    geometry: FIVE.SphereBufferGeometry
    material: THREE.MeshLambertMaterial

    public size: number // design mesh size
    public acceleration: Vec3 = new Vec3(0, 0, 0)
    public velocity: Vec3 = new Vec3(0, 0, 0)
    private velocityHelper?: FIVE.ArrowHelper

    constructor(
        position?: Vec3,  // inherited from THREE.Object3D as default Vec(0,0,0)
        velocity?: Vec3,
        angularVelocity = new Vec3(0, 0, 0),
        color = 0x4cb7a5
    ) {
        super()

        this.size = HyperVorton.DEFAULT_PHYSICAL_RADIUS * 2
        this.geometry = new FIVE.SphereBufferGeometry(HyperVorton.DEFAULT_DRAW_RADIUS, 8, 4)
        this.material = new THREE.MeshLambertMaterial({ color: color })

        this.mesh = new THREE.Mesh(this.geometry, this.material) // new FIVE.Mesh(this.geometry, this.material)
        this.add(this.mesh)

        if (position) {
            this.position.set(position.x, position.y, position.z)
        }

        if (velocity) {
            this.velocity.set(velocity.x, velocity.y, velocity.z)
        }

        let l = angularVelocity.length()
        if (l > 0) {

            console.log(angularVelocity)
            console.log(l)

            let vorticityArrow = new FIVE.ArrowHelper(
                angularVelocity.clone().normalize(),
                new Vec3(0, 0, 0), // this.position, // new Vec3(0,0,0), // this.position,
                l,
                0x00ff00)
            this.add(vorticityArrow)
        }



        let origin = new Vec3(0, 0, 0)

        let length = this.velocity.length()
        if (length > 0.1) {
            this.velocityHelper = new FIVE.ArrowHelper(this.velocity.clone().normalize(), origin, length, color)
            // semiMajorAxisArrow.rotateX(1)
            this.add(this.velocityHelper)
        }

    }

    updateVelocity() {

        // FIXME (0) : create compulsory or create/delete on length change ?

        /*   this.remove(this.velocityHelper)
   
           let length = this.velocity.length()
           if (length > 0.1) {
               this.velocityHelper = new FIVE.ArrowHelper(this.velocity.clone().normalize(), origin, length, color)
               // semiMajorAxisArrow.rotateX(1)
               this.add(this.velocityHelper)
           }  */

    }


    density: Float = 1


    // Get radius from size.
    get radius(): Float {
        return this.size * 0.5
    }

    // Set size from radius.
    set radius(radius: Float) {
        this.size = 2 * radius
    }

    /*    // Get vorticity from angular velocity.
        get vorticity(): Vec3 {
            return LA.multiplyScalar(this.angularVelocity, 2)
        }
    
        // Assign vorticity as angular velocity.
        set vorticity(vort: Vec3) {
            this.angularVelocity = LA.multiplyScalar(vort, 0.5)
        } */

    get volume() {
        return (Math.PI / 6) * this.size * this.size * this.size
    }

    get mass() {
        let mass = this.density * this.volume
        console.assert(mass >= 0)
        return mass
    }

}

class HyperVorton5D extends FIVE.Object5D implements PhysicalEntity {

    static DEFAULT_DRAW_RADIUS = 0.1 // 0.015 //0.01 //0.006
    static DEFAULT_PHYSICAL_RADIUS = 10
    static DEFAULT_PHYSICAL_VOLUME = 1
    static DEFAULT_PHYSICAL_MASS = 1

    protected mesh: FIVE.Mesh
    geometry: FIVE.SphereBufferGeometry
    material: THREE.MeshLambertMaterial

    public size: number // design mesh size
    public acceleration: Vec3 = new Vec3(0, 0, 0)
    public velocity: Vec3 = new Vec3(0, 0, 0)
    private velocityHelper?: FIVE.ArrowHelper5D

    constructor(
        position?: Vec3,  // inherited from THREE.Object3D as default Vec(0,0,0)
        velocity?: Vec3,
        angularVelocity = new Vec3(0, 0, 0),
        color = 0x4cb7a5
    ) {
        super()

        this.size = HyperVorton5D.DEFAULT_PHYSICAL_RADIUS * 2
        this.geometry = new FIVE.SphereBufferGeometry(HyperVorton5D.DEFAULT_DRAW_RADIUS, 8, 4)
        this.material = new THREE.MeshLambertMaterial({ color: color })

        this.mesh = new FIVE.Mesh(this.geometry, this.material)
        this.add(this.mesh)

        if (position) {
            this.position.set(position.x, position.y, position.z)
        }

        if (velocity) {
            this.velocity.set(velocity.x, velocity.y, velocity.z)
        }

        let l = angularVelocity.length()
        if (l > 0) {

            console.log(angularVelocity)
            console.log(l)

            let vorticityArrow = new FIVE.ArrowHelper5D(
                angularVelocity.clone().normalize(),
                new Vec3(0, 0, 0), // this.position, // new Vec3(0,0,0), // this.position,
                l,
                0x00ff00)
            this.add(vorticityArrow)
        }



        let origin = new Vec3(0, 0, 0)

        let length = this.velocity.length()
        if (length > 0.1) {
            this.velocityHelper = new FIVE.ArrowHelper5D(this.velocity.clone().normalize(), origin, length, color)
            // semiMajorAxisArrow.rotateX(1)
            this.add(this.velocityHelper)
        }

    }

    updateVelocity() {

        // FIXME (0) : create compulsory or create/delete on length change ?

        /*   this.remove(this.velocityHelper)
   
           let length = this.velocity.length()
           if (length > 0.1) {
               this.velocityHelper = new FIVE.ArrowHelper(this.velocity.clone().normalize(), origin, length, color)
               // semiMajorAxisArrow.rotateX(1)
               this.add(this.velocityHelper)
           }  */

    }


    density: Float = 1


    // Get radius from size.
    get radius(): Float {
        return this.size * 0.5
    }

    // Set size from radius.
    set radius(radius: Float) {
        this.size = 2 * radius
    }

    /*    // Get vorticity from angular velocity.
        get vorticity(): Vec3 {
            return LA.multiplyScalar(this.angularVelocity, 2)
        }
    
        // Assign vorticity as angular velocity.
        set vorticity(vort: Vec3) {
            this.angularVelocity = LA.multiplyScalar(vort, 0.5)
        } */

    get volume() {
        return (Math.PI / 6) * this.size * this.size * this.size
    }

    get mass() {
        let mass = this.density * this.volume
        console.assert(mass >= 0)
        return mass
    }
}

 type Ingrédients  = number

// class Ingrédients {}

class IngrédientCruPur {

}

class IngrédientCuitPur {

}

class IngrédientsCrusMélangés {

}

class IngrédientsCuitsMélangés {

}

class IngrédientsMélangés {

}


class CuissonMélange {

    // ingrédients: Ingrédients = 0

    cuire(ingrédients: Ingrédients){
        return ingrédients
    }

    mélanger(ingrédients: Ingrédients) {
        return ingrédients
    }

    cuirePuisMélanger(ingrédients: Ingrédients): Ingrédients {
        return this.mélanger(this.cuire(ingrédients))
    }

    mélangerPuisCuire(ingrédients: Ingrédients): Ingrédients {
        return this.cuire(this.mélanger(ingrédients))
    }

    commutateur(ingrédients: Ingrédients): Ingrédients {
        return this.cuirePuisMélanger(ingrédients) - this.mélangerPuisCuire(ingrédients)
    }
}

class Mammifère {

}

class Carnivore {

}

class Chat implements Mammifère, Carnivore {

    longeurDuMuseau: number = 1
    longeurDesOreilles: number = 1
}

class Chien implements Mammifère, Carnivore {

    longeurDuMuseau: number = 2
    longeurDesOreilles: number = 2
}
