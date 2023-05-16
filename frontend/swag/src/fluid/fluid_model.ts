

interface FluidModel extends PhysicalModel3D {

    physicalEntities: PhysicalEntity[]

    initialise(modelSettings: PhysicalInitSettings): void
    physicalStep(stepOptions: PhysicalStepOptions): void

}

/*type ParticleConstructor = (
    position?: Vec3,  // inherited from THREE.Object3D as default Vec(0,0,0)
    public velocity = new Vec3(0, 0, 0),
    _vorticity = new Vec3(0,0,0): ParticleBase
)*/

abstract class ParticleBase extends THREE.Object3D {

    static DEFAULT_DRAW_RADIUS = 0.015 //0.01 //0.006
    static DEFAULT_PHYSICAL_RADIUS = 1
    static DEFAULT_PHYSICAL_VOLUME = 1
    static DEFAULT_PHYSICAL_MASS = 1

    // public position: Vec3 = new Vec3() // inherited from THREE.Object3D as default Vec(0,0,0)

    protected mesh: THREE.Mesh
    geometry: THREE.SphereGeometry
    material: THREE.MeshLambertMaterial

    public acceleration: Vec3 = new Vec3(0, 0, 0)
    public velocity: Vec3 = new Vec3(0, 0, 0)

    constructor(
         position?: Vec3,  
         velocity?: Vec3,
         angularVelocity = new Vec3(0, 0, 0),
         color = 0x4cb7a5
    ) {
        super()

        this.geometry = new THREE.SphereGeometry(ParticleBase.DEFAULT_DRAW_RADIUS, 8, 4)
        this.material = new THREE.MeshLambertMaterial({ color: color })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.add(this.mesh)

        if (position) {
            this.position.set(position.x, position.y, position.z)
        }

        if (velocity) {
            this.velocity.set(velocity.x, velocity.y, velocity.z)
        }

        /* if (velocity.length() > 0) {
            let velocityArrow = new THREE.ArrowHelper(velocity, this.position, length, 0xff0000)
            this.add(velocityArrow)
        } */

        let l = angularVelocity.length()
        if (l > 0) {

            console.log(angularVelocity)
            console.log(l)
    
            let vorticityArrow = new FIVE.ArrowHelper(
                angularVelocity.clone().normalize(),
                new Vec3(0,0,0), // this.position, // new Vec3(0,0,0), // this.position,
                l,
                0x00ffff)
            this.add(vorticityArrow)
        }
        // this.mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }
}

abstract class ParticleBase5D extends FIVE.Object5D implements PhysicalEntity {

    static DEFAULT_DRAW_RADIUS = 0.015 //0.01 //0.006
    static DEFAULT_PHYSICAL_RADIUS = 1
    static DEFAULT_PHYSICAL_VOLUME = 1
    static DEFAULT_PHYSICAL_MASS = 1

    // public position: Vec3 = new Vec3() // inherited from THREE.Object3D as default Vec(0,0,0)

    protected mesh: FIVE.Mesh
    geometry: FIVE.SphereBufferGeometry
    material: THREE.MeshLambertMaterial

    public acceleration: Vec3 = new Vec3(0, 0, 0)
    public velocity: Vec3 = new Vec3(0, 0, 0)

    constructor(
         position?: Vec3,  
         velocity?: Vec3,
         angularVelocity = new Vec3(0, 0, 0),
         color = 0x4cb7a5
    ) {
        super()

        this.geometry = new FIVE.SphereBufferGeometry(ParticleBase.DEFAULT_DRAW_RADIUS, 8, 4)
        this.material = new THREE.MeshLambertMaterial({ color: color })

        this.mesh = new FIVE.Mesh(this.geometry, this.material)
        this.add(this.mesh)

        if (position) {
            this.position.set(position.x, position.y, position.z)
        }

        if (velocity) {
            this.velocity.set(velocity.x, velocity.y, velocity.z)
        }

        /* if (velocity.length() > 0) {
            let velocityArrow = new THREE.ArrowHelper(velocity, this.position, length, 0xff0000)
            this.add(velocityArrow)
        } */

        let l = angularVelocity.length()
        if (l > 0) {

            console.log(angularVelocity)
            console.log(l)
    
            let vorticityArrow = new FIVE.ArrowHelper5D(
                angularVelocity.clone().normalize(),
                new Vec3(0,0,0), // this.position, // new Vec3(0,0,0), // this.position,
                l,
                0x00ffff)
            this.add(vorticityArrow)
        }
        // this.mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }

}



// TODO (1) : ParticleModel as interface ? 
/*

class ParticleSph2 extends THREE.Object3D implements PhysicalEntity {

    static PARTICLE_DRAW_RADIUS = 0.015 //0.01 //0.006
    // static showArrows = false
    // static isSurfaceVisible = false

    // position: Vec3 // // Position (in world units) of center of particle, inherited from THREE.Object3D

    density = 0

    protected mesh: THREE.Mesh
    protected particleGeometry: THREE.SphereGeometry
    protected particleMaterial: THREE.MeshLambertMaterial

    constructor(
        position?: Vec3,  // inherited from THREE.Object3D as default Vec(0,0,0)
        public velocity = new Vec3(0, 0, 0),
        public radius = ParticleSph2.PARTICLE_DRAW_RADIUS) {
        super()

        this.particleGeometry = new THREE.SphereGeometry(radius, 8, 4)
        this.particleMaterial = new THREE.MeshLambertMaterial({ color: 0x4cb7a5 })

        this.mesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial)
        this.add(this.mesh)

        if (position) {
            this.position.set(position.x, position.y, position.z)
        }
        // this.mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }



}
*/


class Vorton extends ParticleBase {

    // mPosition = new Vec3(0, 0, 0)	    
    // velocity = new Vec3(0, 0, 0)	        // Velocity (speed and direction) of particle
    // mOrientation = new Vec3(0, 0, 0)	    // Orientation of particle, in axis-angle form where angle=|orientation|
    // mAngularVelocity = new Vec3(0, 0, 0) // Angular velocity of particle.  Same as half the vorticity.
    // mMass: Float = 0                        // Either density or mass per particle, depending.  For fire simulations, this is the exhaust (smoke) density.
    // mSize: Float = 0		                // Diameter of the region of influence of a particle.
    // mBirthTime: Integer = 0                 // Birth time of particle, in "ticks"
    density: Float = 1

    constructor(
        position: Vec3, // inherited from THREE.Object3D as default Vec(0,0,0)
        velocity = new Vec3(0, 0, 0),
        public angularVelocity = new Vec3(0, 0, 0),
        public size = ParticleBase.DEFAULT_PHYSICAL_RADIUS * 2) {
        super(position, velocity, angularVelocity)
    }

    // Get radius from size.
    get radius(): Float {
        return this.size * 0.5
    }

    // Set size from radius.
    set radius(radius: Float) {
        this.size = 2 * radius
    }

    // Get vorticity from angular velocity.
    get vorticity(): Vec3 {
        return LA.multiplyScalar(this.angularVelocity, 2)
    }

    // Assign vorticity as angular velocity.
    set vorticity(vort: Vec3) {
        this.angularVelocity = LA.multiplyScalar(vort, 0.5)
    }

    get volume() {
        return (Math.PI / 6) * this.size * this.size * this.size
    }

    get mass() {
        let mass = this.density * this.volume
        console.assert(mass >= 0)
        return mass
    }
}







