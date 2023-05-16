// ~ THREE.js => ts

namespace FIVE {

    enum TrianglesDrawModes {
        TrianglesDrawMode = 0,
        TriangleStripDrawMode = 1,
        TriangleFanDrawMode = 2
    }

    interface MetaInterface {
        geometries: any,
        materials: any,
        textures: any,
        images: any,
        shapes: any
    }

    export interface SphereBufferGeometryOptions {
        radius: number
        widthSegments: number
        heightSegments: number
        phiStart: number
        phiLength: number
        thetaStart: number
        thetaLength: number
    }


    export class Float32BufferAttribute extends THREE.Float32BufferAttribute {

    }

    export class Color extends THREE.Color {
        
    }

    export class BufferGeometry5D extends THREE.BufferGeometry {

        parameters: { [index: string]: string | number } = {}
    }

    /* export class Geometry extends THREE.Geometry {

        parameters: { [index: string]: string | number } = {}
    }*/

    export class Material extends THREE.Material {

    }

    export class SphereBufferGeometry extends BufferGeometry5D {

        /* parameters: {
             radius: number
             widthSegments: number
             heightSegments: number
             phiStart: number
             phiLength: number
             thetaStart: number
             thetaLength: number
         } */

        constructor(radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {

            super()

            this.type = 'SphereBufferGeometry';

            this.parameters = {
                radius: radius,
                widthSegments: widthSegments,
                heightSegments: heightSegments,
                phiStart: phiStart,
                phiLength: phiLength,
                thetaStart: thetaStart,
                thetaLength: thetaLength
            }

            widthSegments = Math.max(3, widthSegments)
            heightSegments = Math.max(2, heightSegments)

            let thetaEnd = thetaStart + thetaLength

            let ix, iy

            let index = 0
            let grid = []

            let vertex = new Vector3()
            let normal = new Vector3()

            // buffers

            let indices = []
            let vertices = []
            let normals = []
            let uvs = []

            // generate vertices, normals and uvs

            for (iy = 0; iy <= heightSegments; iy++) {

                let verticesRow = []

                let v = iy / heightSegments

                // special case for the poles

                let uOffset = (iy == 0) ? 0.5 / widthSegments : ((iy == heightSegments) ? - 0.5 / widthSegments : 0)

                for (ix = 0; ix <= widthSegments; ix++) {

                    let u = ix / widthSegments

                    // vertex

                    vertex.x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength)
                    vertex.y = radius * Math.cos(thetaStart + v * thetaLength)
                    vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength)

                    vertices.push(vertex.x, vertex.y, vertex.z)

                    // normal

                    normal.copy(vertex).normalize()
                    normals.push(normal.x, normal.y, normal.z)

                    // uv

                    uvs.push(u + uOffset, 1 - v)

                    verticesRow.push(index++)

                }

                grid.push(verticesRow)

            }

            // indices

            for (iy = 0; iy < heightSegments; iy++) {

                for (ix = 0; ix < widthSegments; ix++) {

                    let a = grid[iy][ix + 1]
                    let b = grid[iy][ix]
                    let c = grid[iy + 1][ix]
                    let d = grid[iy + 1][ix + 1]

                    if (iy !== 0 || thetaStart > 0) {
                        indices.push(a, b, d)
                    }

                    if (iy !== heightSegments - 1 || thetaEnd < Math.PI) {
                        indices.push(b, c, d)
                    }
                }
            }

            // build geometry

            this.setIndex(indices)
            this.setAttribute('position', new Float32BufferAttribute(vertices, 3))
            this.setAttribute('normal', new Float32BufferAttribute(normals, 3))
            this.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
        }
    }

    export class TorusBufferGeometry extends BufferGeometry5D {

        parameters: {
            radius: number
            tube: number
            radialSegments: number
            tubularSegments: number
            arc: number
        };

        constructor(radius = 1, tube = 0.4, radialSegments = 8, tubularSegments = 6, arc = Math.PI * 2) {

            super()

            this.type = 'TorusBufferGeometry'

            this.parameters = {
                radius: radius,
                tube: tube,
                radialSegments: radialSegments,
                tubularSegments: tubularSegments,
                arc: arc
            }

            // buffers

            let indices = []
            let vertices = []
            let normals = []
            let uvs = []

            // helper variables

            let center = new Vector3()
            let vertex = new Vector3()
            let normal = new Vector3()

            let j, i

            // generate vertices, normals and uvs

            for (j = 0; j <= radialSegments; j++) {

                for (i = 0; i <= tubularSegments; i++) {

                    let u = i / tubularSegments * arc
                    let v = j / radialSegments * Math.PI * 2

                    // vertex

                    vertex.x = (radius + tube * Math.cos(v)) * Math.cos(u)
                    vertex.y = (radius + tube * Math.cos(v)) * Math.sin(u)
                    vertex.z = tube * Math.sin(v)

                    vertices.push(vertex.x, vertex.y, vertex.z)

                    // normal

                    center.x = radius * Math.cos(u)
                    center.y = radius * Math.sin(u)
                    normal.subVectors(vertex, center).normalize()

                    normals.push(normal.x, normal.y, normal.z)

                    // uv

                    uvs.push(i / tubularSegments)
                    uvs.push(j / radialSegments)

                }

            }

            // generate indices

            for (j = 1; j <= radialSegments; j++) {

                for (i = 1; i <= tubularSegments; i++) {

                    // indices

                    let a = (tubularSegments + 1) * j + i - 1
                    let b = (tubularSegments + 1) * (j - 1) + i - 1
                    let c = (tubularSegments + 1) * (j - 1) + i
                    let d = (tubularSegments + 1) * j + i

                    // faces

                    indices.push(a, b, d)
                    indices.push(b, c, d)

                }
            }

            // build geometry

            this.setIndex(indices);
            this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
            this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
            this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        }
    }

    export class Vector3 extends THREE.Vector3 {

        // copy(v:  Vector3 | MultiCoordinateSystem.OutputCoordinateValues) {
        copy(v:  Vector3) {
            
            this.x = v.x
            this.y = v.y
            this.z = v.z

            return this
        }

    }

    export class Euler extends THREE.Euler {

    }

    export class Quaternion extends THREE.Quaternion {

    }

    export class Matrix4 extends THREE.Matrix4 {

    }

    export class Matrix3 extends THREE.Matrix3 {

    }

    export class Layers extends THREE.Layers {

    }


    // export abstract class Object5D extends THREE.Object3D {
    export abstract class Object5D extends THREE.EventDispatcher { // THREE.Object3D { 

        // Used to check whether this or derived classes are Object3Ds. Default is true.
        // You should not change this, as it is used internally for optimisation.
        isObject3D: boolean = true
        isCamera?: boolean
        isLight?: boolean
        isMesh?: Boolean
        isLine?: boolean
        isPoints?: boolean
        drawMode?: TrianglesDrawModes

        static object5DId = 0
        static DefaultUp = new Vector3(0, 1, 0)
        static DefaultMatrixAutoUpdate = true

        id: number = Object5D.object5DId++
        //uuid: string = THREE.Math.generateUUID()
        name: string = ''
        type: string = 'Object5D'

        parent: Object5D | null = null
        children: Object5D[] = []

        up = Object5D.DefaultUp.clone()

        position = new Vector3()
        rotation = new Euler()
        quaternion = new Quaternion()
        scale = new Vector3(1, 1, 1)

        modelViewMatrix = new Matrix4()

        normalMatrix = new Matrix3()

        // Local transform.
        matrix = new Matrix4()

        // The global transform of the object. If the Object3d has no parent, then it's identical to the local transform.
        matrixWorld = new Matrix4()

        // When this is set, it calculates the matrix of position, (rotation or quaternion) and scale every frame and also recalculates the matrixWorld property.
        matrixAutoUpdate = Object5D.DefaultMatrixAutoUpdate

        // When this is set, it calculates the matrixWorld in that frame and resets this property to false.
        matrixWorldNeedsUpdate = false

        layers = new Layers()

        visible: boolean = true
        castShadow: boolean = false
        receiveShadow: boolean = false

        // When this is set, it checks every frame if the object is in the frustum of the camera. Otherwise the object gets drawn every frame even if it isn't visible.
        frustumCulled: boolean = true

        renderOrder: number = 0

        // !! not cloned
        userData: { [key: string]: any } = {}

        // abstract geometry: Geometry | BufferGeometry
        abstract geometry: BufferGeometry5D
        abstract material: Material

        onBeforeRender = (_renderer: THREE.WebGLRenderer, _scene: Scene, _camera: THREE.Camera, _geometry: BufferGeometry5D,
            _material: Material, _group: THREE.Group): void => { }


        onAfterRender = (_renderer: THREE.WebGLRenderer, _scene: Scene, _camera: THREE.Camera, _geometry: BufferGeometry5D,
            _material: Material, _group: THREE.Group): void => { }

        constructor() {
            super()

           //this.rotation._onChange(this.onRotationChange)
           //this.quaternion._onChange(this.onQuaternionChange)
        }

        // This updates the position, rotation and scale with the matrix.

        applyMatrix(matrix: Matrix4) {

            if (this.matrixAutoUpdate) {
                this.updateMatrix()
            }

            this.matrix.premultiply(matrix)
            this.matrix.decompose(this.position, this.quaternion, this.scale)
        }

        applyQuaternion(quaternion: Quaternion) {

            this.quaternion.premultiply(quaternion)
            return this
        }

        setRotationFromAxisAngle(normalizedAxis: Vector3, angle: number) {

            this.quaternion.setFromAxisAngle(normalizedAxis, angle)
        }

        setRotationFromEuler(euler: Euler) {

            this.quaternion.setFromEuler(euler)
        }

        setRotationFromMatrix(m: Matrix4) {

            // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

            this.quaternion.setFromRotationMatrix(m)
        }

        setRotationFromQuaternion(q: Quaternion) {

            // assumes q is normalized

            this.quaternion.copy(q)
        }

        /**
         * Rotate an object along an axis in object space. The axis is assumed to be normalized.
         * @param axis  A normalized vector in object space.
         * @param angle  The angle in radians.
         */
        rotateOnAxis(axis: Vector3, angle: number) {

            let q1 = new Quaternion()

            q1.setFromAxisAngle(axis, angle)
            this.quaternion.multiply(q1)

            return this
        }

        /**
         * Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
         * @param axis  A normalized vector in object space.
         * @param angle  The angle in radians.
         */
        rotateOnWorldAxis(axis: Vector3, angle: number) {

            let q1 = new Quaternion()

            q1.setFromAxisAngle(axis, angle)
            this.quaternion.premultiply(q1)

            return this
        }

        rotateX(angle: number) {

            let v1 = new Vector3(1, 0, 0)

            return this.rotateOnAxis(v1, angle)
        }

        rotateY(angle: number) {

            let v1 = new Vector3(0, 1, 0)

            return this.rotateOnAxis(v1, angle)
        }

        rotateZ(angle: number) {

            let v1 = new Vector3(0, 0, 1)
            return this.rotateOnAxis(v1, angle)
        }


        // translate object by distance along axis in object space
        // axis is assumed to be normalized
        translateOnAxis(axis: Vector3, distance: number) {

            let v1 = new Vector3()

            v1.copy(axis).applyQuaternion(this.quaternion)
            this.position.add(v1.multiplyScalar(distance))

            return this
        }

        translateX(distance: number) {

            let v1 = new Vector3(1, 0, 0)

            return this.translateOnAxis(v1, distance)
        }

        translateY(distance: number) {

            let v1 = new Vector3(0, 1, 0)
            return this.translateOnAxis(v1, distance);
        }

        translateZ(distance: number) {

            let v1 = new Vector3(0, 0, 1)
            return this.translateOnAxis(v1, distance);

        }

        /**
         * Updates the vector from local space to world space.
         * @param vector A local vector.
         */
        localToWorld(vector: Vector3) {

            return vector.applyMatrix4(this.matrixWorld)
        }

        /**
         * Updates the vector from world space to local space.
         * @param vector A world vector.
         */
        worldToLocal(vector: Vector3) {

            let m1 = new Matrix4()
            return vector.applyMatrix4(m1.invert(/* this.matrixWorld*/))
        }

        /**
         * Rotates object to face point in space.
         * @param vector A world vector to look at.
         */
        lookAt(x: Vector3 | number, y?: number, z?: number) {

            let q1 = new Quaternion();
            let m1 = new Matrix4();
            let target = new Vector3();
            let position = new Vector3();

            if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {

                target.set(x, y, z)

            } else if (x instanceof Vector3) {

                target.copy(x)

            }

            let parent = this.parent;

            this.updateWorldMatrix(true, false);

            position.setFromMatrixPosition(this.matrixWorld);

            if (this.isCamera || this.isLight) {

                m1.lookAt(position, target, this.up);

            } else {

                m1.lookAt(target, position, this.up);

            }

            this.quaternion.setFromRotationMatrix(m1);

            if (parent) {

                m1.extractRotation(parent.matrixWorld);
                q1.setFromRotationMatrix(m1);
                this.quaternion.premultiply(q1.invert());

            }

        }

        // add(...object: Object5D[]) {
        add(object: Object5D) {

            if (arguments.length > 1) {

                for (let i = 0; i < arguments.length; i++) {

                    this.add(arguments[i])

                }

                return this

            }

            if (object === this) {

                console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
                return this;

            }

            if ((object && object.isObject3D)) {

                if (object.parent !== null) {

                    object.parent.remove(object);

                }

                object.parent = this;
                object.dispatchEvent({ type: 'added' });

                this.children.push(object);

            } else {

                console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object);

            }

            return this;

        }

        // remove(...object: Object3D[]){
        remove(object: Object5D) {

            if (arguments.length > 1) {

                for (let i = 0; i < arguments.length; i++) {

                    this.remove(arguments[i]);

                }

                return this
            }

            let index = this.children.indexOf(object)

            if (index !== - 1) {

                object.parent = null;

                object.dispatchEvent({ type: 'removed' });

                this.children.splice(index, 1);

            }

            return this;
        }

        /**
         * Searches through the object's children and returns the first with a matching id.
         * @param id  Unique number of the object instance
         */
        getObjectById(id: number): Object5D | undefined {

            return this.getObjectByProperty('id', id);

        }

        /**
         * Searches through the object's children and returns the first with a matching name.
         * @param name  String to match to the children's Object3d.name property.
         */
        getObjectByName(name: string): Object5D | undefined {

            return this.getObjectByProperty('name', name)

        }

        getObjectByProperty(name: string, value: string | number): Object5D | undefined {

            if ((<any>this)[name] === value) return this;

            for (let i = 0, l = this.children.length; i < l; i++) {

                let child = this.children[i];
                let object = child.getObjectByProperty(name, value);

                if (object !== undefined) {

                    return object;

                }

            }

            return undefined;

        }

        getWorldPosition(target: Vector3): Vector3 {

            if (target === undefined) {

                console.warn('THREE.Object3D: .getWorldPosition() target is now required');
                target = new Vector3();

            }

            this.updateMatrixWorld(true);

            return target.setFromMatrixPosition(this.matrixWorld);

        }
        getWorldQuaternion(target: Quaternion): Quaternion {

            let position = new Vector3();
            let scale = new Vector3();

            if (target === undefined) {

                console.warn('THREE.Object3D: .getWorldQuaternion() target is now required');
                target = new Quaternion();

            }

            this.updateMatrixWorld(true);

            this.matrixWorld.decompose(position, target, scale);

            return target;

        }

        getWorldScale(target: Vector3): Vector3 {

            let position = new Vector3();
            let quaternion = new Quaternion();

            if (target === undefined) {

                console.warn('THREE.Object3D: .getWorldScale() target is now required');
                target = new Vector3();

            }

            this.updateMatrixWorld(true);

            this.matrixWorld.decompose(position, quaternion, target);

            return target;

        }

        getWorldDirection(target: Vector3): Vector3 {

            if (target === undefined) {

                console.warn('THREE.Object3D: .getWorldDirection() target is now required');
                target = new Vector3();

            }

            this.updateMatrixWorld(true);

            let e = this.matrixWorld.elements;

            return target.set(e[8], e[9], e[10]).normalize();

        }

        raycast(_raycaster: THREE.Raycaster, _intersects: THREE.Intersection[]) {

        }

        traverse(callback: (object: Object5D) => any): void {

            callback(this);

            let children = this.children;

            for (let i = 0, l = children.length; i < l; i++) {

                children[i].traverse(callback);

            }

        }

        traverseVisible(callback: (object: Object5D) => any): void {

            if (this.visible === false) return;

            callback(this);

            let children = this.children;

            for (let i = 0, l = children.length; i < l; i++) {

                children[i].traverseVisible(callback);

            }

        }

        traverseAncestors(callback: (object: Object5D) => any): void {

            let parent = this.parent;

            if (parent !== null) {

                callback(parent);

                parent.traverseAncestors(callback);

            }

        }

        /**
         * Updates local transform.
         */
        updateMatrix(): void {

            this.matrix.compose(this.position, this.quaternion, this.scale);

            this.matrixWorldNeedsUpdate = true;

        }

        /**
         * Updates global transform of the object and its children.
         */
        updateMatrixWorld(force: boolean): void {

            if (this.matrixAutoUpdate) this.updateMatrix();

            if (this.matrixWorldNeedsUpdate || force) {

                if (this.parent === null) {

                    this.matrixWorld.copy(this.matrix);

                } else {

                    this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);

                }

                this.matrixWorldNeedsUpdate = false;

                force = true;

            }

            // update children

            let children = this.children;

            for (let i = 0, l = children.length; i < l; i++) {

                children[i].updateMatrixWorld(force);

            }

        }

        updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void {

            let parent = this.parent;

            if (updateParents === true && parent !== null) {

                parent.updateWorldMatrix(true, false);

            }

            if (this.matrixAutoUpdate) this.updateMatrix();

            if (this.parent === null) {

                this.matrixWorld.copy(this.matrix);

            } else {

                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);

            }

            // update children

            if (updateChildren === true) {

                let children = this.children;

                for (let i = 0, l = children.length; i < l; i++) {

                    children[i].updateWorldMatrix(false, true);

                }

            }

        }

        toJSON(metaArg?: string | MetaInterface) {

            let meta: MetaInterface
            let isRootObject: boolean
            // meta is a string when called from JSON.stringify


            let output: any = {};

            // meta is a hash used to collect geometries, materials.
            // not providing it implies that this is the root object
            // being serialized.
            if ((metaArg === undefined || typeof metaArg === 'string')) {

                isRootObject = true

                // initialize meta obj
                meta = {
                    geometries: {},
                    materials: {},
                    textures: {},
                    images: {},
                    shapes: {}
                };

                output.metadata = {
                    version: 4.5,
                    type: 'Object',
                    generator: 'Object3D.toJSON'
                };

            }
            else {
                isRootObject = false
                meta = metaArg
            }

            // standard Object3D serialization

            let object: any = {};

            // object.uuid = this.uuid;
            object.type = this.type;

            if (this.name !== '') object.name = this.name;
            if (this.castShadow === true) object.castShadow = true;
            if (this.receiveShadow === true) object.receiveShadow = true;
            if (this.visible === false) object.visible = false;
            if (this.frustumCulled === false) object.frustumCulled = false;
            if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
            if (JSON.stringify(this.userData) !== '{}') object.userData = this.userData;

            object.layers = this.layers.mask;
            object.matrix = this.matrix.toArray();

            if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

            // object specific properties

            if (this.isMesh && this.drawMode !== TrianglesDrawModes.TrianglesDrawMode) object.drawMode = this.drawMode;

            //

            function serialize(library: any, element: any) {

                if (library[element.uuid] === undefined) {

                    library[element.uuid] = element.toJSON(meta);

                }

                return element.uuid;

            }

            if (this.isMesh || this.isLine || this.isPoints) {

                object.geometry = serialize(meta.geometries, this.geometry);

                let parameters = this.geometry.parameters;

                if (parameters !== undefined && parameters.shapes !== undefined) {

                    let shapes = parameters.shapes;

                    if (Array.isArray(shapes)) {

                        for (let i = 0, l = shapes.length; i < l; i++) {

                            let shape = shapes[i];

                            serialize(meta.shapes, shape);

                        }

                    } else {

                        serialize(meta.shapes, shapes);

                    }

                }

            }

            if (this.material !== undefined) {

                if (Array.isArray(this.material)) {

                    let uuids = [];

                    for (let i = 0, l = this.material.length; i < l; i++) {

                        uuids.push(serialize(meta.materials, this.material[i]));

                    }

                    object.material = uuids;

                } else {

                    object.material = serialize(meta.materials, this.material);

                }

            }

            //

            if (this.children.length > 0) {

                object.children = [];

                for (let i = 0; i < this.children.length; i++) {

                    object.children.push(this.children[i].toJSON(meta).object)
                }
            }

            if (isRootObject) {

                let geometries = extractFromCache(meta.geometries);
                let materials = extractFromCache(meta.materials);
                let textures = extractFromCache(meta.textures);
                let images = extractFromCache(meta.images);
                let shapes = extractFromCache(meta.shapes);

                if (geometries.length > 0) output.geometries = geometries;
                if (materials.length > 0) output.materials = materials;
                if (textures.length > 0) output.textures = textures;
                if (images.length > 0) output.images = images;
                if (shapes.length > 0) output.shapes = shapes;

            }

            output.object = object;

            return output;

            // extract data from the cache hash
            // remove metadata on each item
            // and return as array
            function extractFromCache(cache: any) {

                let values = [];
                for (let key in cache) {

                    let data = cache[key];
                    delete data.metadata;
                    values.push(data);

                }
                return values;

            }

        }

        clone(_recursive?: boolean): Object5D {

            throw 'TODO clone'
            //return new this.constructor().copy( this, recursive )

        }

        /**
         *
         * @param object
         * @param recursive
         */
        copy(source: Object5D, recursive?: boolean) {

            if (recursive === undefined) recursive = true;

            this.name = source.name;

            this.up.copy(source.up);

            this.position.copy(source.position);
            this.quaternion.copy(source.quaternion);
            this.scale.copy(source.scale);

            this.matrix.copy(source.matrix);
            this.matrixWorld.copy(source.matrixWorld);

            this.matrixAutoUpdate = source.matrixAutoUpdate;
            this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

            this.layers.mask = source.layers.mask;
            this.visible = source.visible;

            this.castShadow = source.castShadow;
            this.receiveShadow = source.receiveShadow;

            this.frustumCulled = source.frustumCulled;
            this.renderOrder = source.renderOrder;

            this.userData = JSON.parse(JSON.stringify(source.userData));

            if (recursive === true) {

                for (let i = 0; i < source.children.length; i++) {

                    let child = source.children[i];
                    this.add(child.clone());

                }

            }

            return this;

        }

        onRotationChange = () => {

            this.quaternion.setFromEuler(this.rotation)
        }

        onQuaternionChange = () => {

            this.rotation.setFromQuaternion(this.quaternion, undefined)
        }
    }

    // FIXME (1) : THREE dependant, scene belongs to scenario.ts, not to model, extract scene from 3d models

    export class Scene extends THREE.Scene implements ScenarioInterface {

        protected animationStepOptions: AnimationStepOptions = {
        }

        sceneBaseLength: number = 0
        physicalStepPerVisualStep = 1
        fov = 24
        near = 1
        far = 2000
        ambientColor = 0x222222

        defaultInitScenarioId = 0 // FIXME : constructor options => default scenario ?

        setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void {
            this.animationStepOptions = visualStepOptions
        }

    }

    /* export class Scene extends Object5D implements ScenarioInterface {

        protected animationStepOptions: AnimationStepOptions = {
        }

        sceneBaseLength: number = 0
        physicalStepPerVisualStep = 1
        fov = 24
        near = 1
        far = 2000
        ambientColor = 0x222222

        defaultInitScenarioId = 0 // FIXME : constructor options => default scenario ?

        setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void {
            this.animationStepOptions = visualStepOptions
        }

        // THREE

        geometry!: BufferGeometry
        material!: Material

        isScene = true
        type: string = 'Scene'

        constructor() {

            super()

            this.background = null;
            this.fog = null;
            this.overrideMaterial = null;

            this.autoUpdate = true; // checked by the renderer
        }

        //  A fog instance defining the type of fog that affects everything rendered in the scene. Default is null.
        fog: THREE.Fog | null

        // If not null, it will force everything in the scene to be rendered with that material. Default is null.

        overrideMaterial: Material | null;
        autoUpdate: boolean;
        background: null | THREE.Color | THREE.Texture;

        copy(source: this, recursive?: boolean) {

            Object5D.prototype.copy.call(this, source, recursive);

            if (source.background !== null) this.background = source.background.clone();
            if (source.fog !== null) this.fog = source.fog.clone();
            if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();

            this.autoUpdate = source.autoUpdate;
            this.matrixAutoUpdate = source.matrixAutoUpdate;

            return this
        }

        toJSON(meta?: any) {

            var data = super.toJSON.call(this, meta);

            if (this.background !== null) {
                data.object.background = (<any>this.background).toJSON(meta)
            }
            if (this.fog !== null) {
                data.object.fog = this.fog.toJSON()
            }

            return data;

        }

        dispose() {

            this.dispatchEvent({ type: 'dispose' })
        }
    } */


    export class Mesh extends Object5D {

        drawMode = TrianglesDrawModes.TrianglesDrawMode
        morphTargetInfluences?: number[];
        morphTargetDictionary?: { [key: string]: number; };
        isMesh = true
        type = 'Mesh'

        geometry: BufferGeometry5D
        material: Material


        constructor(
            geometry: BufferGeometry5D = new BufferGeometry5D(),
            material: Material /*| Material[]*/ = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
        ) {
            super()
            this.geometry = geometry
            this.material = material

            this.updateMorphTargets()
        }


        setDrawMode(drawMode: TrianglesDrawModes) {

            this.drawMode = drawMode

        }

        updateMorphTargets() {

            var geometry = this.geometry;
            var m, ml, name;

            // if ( geometry.isBufferGeometry ) {
            if (geometry instanceof BufferGeometry5D) {

                var morphAttributes = geometry.morphAttributes;
                var keys = Object.keys(morphAttributes);

                if (keys.length > 0) {

                    var morphAttribute = morphAttributes[keys[0]];

                    if (morphAttribute !== undefined) {

                        this.morphTargetInfluences = [];
                        this.morphTargetDictionary = {};

                        for (m = 0, ml = morphAttribute.length; m < ml; m++) {

                            name = morphAttribute[m].name || String(m);

                            this.morphTargetInfluences.push(0);
                            this.morphTargetDictionary[name] = m;

                        }

                    }

                }

            } else {

               /* var morphTargets = geometry.morphTargets;

                if (morphTargets !== undefined && morphTargets.length > 0) {

                    console.error('THREE.Mesh.updateMorphTargets() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.');

                } */
                console.error('THREE no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.')

            }

        }

        copy(source: this, _recursive?: boolean) {

            Object5D.prototype.copy.call(this, source);

            this.drawMode = source.drawMode;

            if (source.morphTargetInfluences !== undefined) {

                this.morphTargetInfluences = source.morphTargetInfluences.slice();

            }

            if (source.morphTargetDictionary !== undefined) {

                this.morphTargetDictionary = Object.assign({}, source.morphTargetDictionary);

            }

            return this;

        }

        // raycast(raycaster: Raycaster, intersects: Intersection[]): void {}

    }

    export class Points extends Object5D {

        geometry: BufferGeometry5D
        material: Material //| Material[]

        type = "Points"
        isPoints = true
        
        constructor(
            geometry?: BufferGeometry5D,
            material?: Material // | Material[]
        ) {
            super()

            this.geometry = geometry !== undefined ? geometry : new BufferGeometry5D();
            this.material = material !== undefined ? material : new THREE.PointsMaterial( { color: Math.random() * 0xffffff } );
        }
    

    
        
    
        // raycast(raycaster: Raycaster, intersects: Intersection[]): void;
    }


    export class Line extends Object5D {

        isLine = true

        geometry: BufferGeometry5D
        material: Material

        protected start = new Vector3()
        protected end = new Vector3()

        constructor(geometry?: BufferGeometry5D, material?: Material) {
            super()

            this.type = 'Line'

            this.geometry = geometry !== undefined ? geometry : new BufferGeometry5D()
            this.material = material !== undefined ? material : new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff })

        }

        computeLineDistances() {

            let geometry = this.geometry;

            // if ( geometry.isBufferGeometry ) {

            if (geometry instanceof BufferGeometry5D) {

                // we assume non-indexed geometry

                if (geometry.index === null) {

                    let positionAttribute = <THREE.BufferAttribute>geometry.attributes.position
                    let lineDistances: number[] = []

                    for (let i = 0, l = positionAttribute.count; i < l; i += 2) {

                        this.start.fromBufferAttribute(positionAttribute, i)
                        this.end.fromBufferAttribute(positionAttribute, i + 1)

                        lineDistances[i] = (i === 0) ? 0 : lineDistances[i - 1]
                        lineDistances[i + 1] = lineDistances[i] + this.start.distanceTo(this.end)
                    }

                    geometry.setAttribute('lineDistance', new Float32BufferAttribute(lineDistances, 1))

                } else {

                    console.warn('THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.');
                }

                // } else if ( geometry.isGeometry ) {
            } /*else if (geometry instanceof BufferGeometry) {

                let vertices = geometry.vertices
                let lineDistances = geometry.lineDistances

                for (let i = 0, l = vertices.length; i < l; i += 2) {

                    this.start.copy(vertices[i])
                    this.end.copy(vertices[i + 1])

                    lineDistances[i] = (i === 0) ? 0 : lineDistances[i - 1]
                    lineDistances[i + 1] = lineDistances[i] + this.start.distanceTo(this.end)
                }
            }*/

            return this
        }

        /*  clone(): Line {
  
              return new Line(this.geometry, this.material).copy(this)
          } */
    }

    class LineSegments extends Line {

        type: string

        isLineSegments = true

        constructor(geometry: BufferGeometry5D, material: Material) {

            super(geometry, material);

            this.type = 'LineSegments'
        }
    }

    export class AxesHelper extends THREE.AxesHelper {

        
    }

    // X axis is red, Y axis is green, Z axis is blue.
    export class AxesHelper5D extends LineSegments {

        static xColor = 0xFF7F00
        static yColor = 0x007F00
        static zColor = 0x007FFF
        static VertexColors = true //2

        constructor(size = 1) {

            let vertices = [
                0, 0, 0, size, 0, 0,
                0, 0, 0, 0, size, 0,
                0, 0, 0, 0, 0, size
            ]

            let colors = [
                1, 0, 0, 1, 0.6, 0,
                0, 1, 0, 0.6, 1, 0,
                0, 0, 1, 0, 0.6, 1
            ]

            let geometry = new BufferGeometry5D()
            geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
            geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

            let material = new THREE.LineBasicMaterial({ vertexColors: AxesHelper5D.VertexColors })

            super(geometry, material)
        }
    }


    export class ArrowHelper extends THREE.ArrowHelper {
    }


    // let lineGeometry, coneGeometry;

    export class ArrowHelper5D extends Object5D {

        // FIXME (4) : geometry, material array
        geometry: BufferGeometry5D = new BufferGeometry5D()
        material: Material = new Material()

        line: Line
        lineGeometry: BufferGeometry5D
        cone: THREE.Mesh
        coneGeometry: THREE.CylinderGeometry

        axis = new THREE.Vector3()
        // radians: number

        constructor(dir?: THREE.Vector3, origin?: THREE.Vector3, length?: number, color?: number, headLength?: number, headWidth?: number) {

            // dir is assumed to be normalized

            super()

            console.log('ARROW HELPER')

            if (dir === undefined) dir = new THREE.Vector3(0, 0, 1);
            if (origin === undefined) origin = new THREE.Vector3(0, 0, 0);
            if (length === undefined) length = 1;
            if (color === undefined) color = 0xffff00;
            if (headLength === undefined) headLength = 0.2 * length;
            if (headWidth === undefined) headWidth = 0.2 * headLength;


            this.lineGeometry = new BufferGeometry5D();
            this.lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));

            this.coneGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 5, 1);
            this.coneGeometry.translate(0, - 0.5, 0);

            this.position.copy(origin);

            this.line = new Line(this.lineGeometry, new THREE.LineBasicMaterial({ color: color }));
            this.line.matrixAutoUpdate = false;
            this.add(<Object5D><any>this.line);

            this.cone = new THREE.Mesh(this.coneGeometry, new THREE.MeshBasicMaterial({ color: color }));
            this.cone.matrixAutoUpdate = false;
            this.add(<Object5D><any>this.cone);

            this.setDirection(dir);
            this.setLength(length, headLength, headWidth);

        }

        setDirection(dir: THREE.Vector3) {

            // dir is assumed to be normalized

            if (dir.y > 0.99999) {

                this.quaternion.set(0, 0, 0, 1);

            } else if (dir.y < - 0.99999) {

                this.quaternion.set(1, 0, 0, 0);

            } else {

                this.axis.set(dir.z, 0, - dir.x).normalize();

                let radians = Math.acos(dir.y);

                this.quaternion.setFromAxisAngle(this.axis, radians);

            }

        }

        setLength(length: number, headLength: number, headWidth: number) {

            if (headLength === undefined) {
                headLength = 0.2 * length
            }
            if (headWidth === undefined) {
                headWidth = 0.2 * headLength
            }

            this.line.scale.set(1, Math.max(0, length - headLength), 1)
            this.line.updateMatrix()

            this.cone.scale.set(headWidth, headLength, headWidth)
            this.cone.position.y = length
            this.cone.updateMatrix()
        }

        setColor(color: THREE.Color) {

            (<THREE.LineBasicMaterial>this.line.material).color.copy(color);
            (<THREE.MeshBasicMaterial>this.cone.material).color.copy(color);

        }

        /*  copy(source: ArrowHelper) {
  
              super.copy.call(this, source, false)
  
              this.line.copy(source.line);
              this.cone.copy(source.cone);
  
              return this;
  
          }
  
          clone(_recursive?: boolean): THREE.Object3D {
  
              return new ArrowHelper().copy(this)
  
          } */
    }
}