

   // https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Flexible_Box_Layout/Aligner_des_%C3%A9l%C3%A9ments_dans_un_conteneur_flexible
 

interface ExperimentVerifyInitOptions extends ExperimentInitOptions {

    kind: Kind.VerifyExperiment
    title: string
    ambientColor: number
    // scenarioId: ExperimentScenarioId
}

interface VerifyContext {

    skip?: boolean
    verbose?: boolean

    log(arg: any): void
    info(arg: any, level?: number): void
    warn(arg: any): void

    signalTermination(): void
}

abstract class ExperimentVerifyContainerBase implements ExperimentContainerInterface {

    experimentIndexer: number | null = null
    protected laboratory: Laboratory

    // protected abstract experimentSettings: ExperimentContainerSettings

    private _domContainer: HTMLElement
    get domContainer() { return this._domContainer }
    protected _title = 'ExperimentVerify'
    get title() { return this._title }

    // protected abstract createExperiment(experimentOptions: ExperimentVerifyOptions): ExperimentInterface
    protected abstract createCustomExperiment(settings: ExperimentSettings, options: ExperimentInitOptions): ExperimentInterface
    protected experiment?: ExperimentInterface
    get active() { return this.experiment !== undefined }

    constructor(laboratory: Laboratory, options: ExperimentContainerOptions = {}) {

        this.laboratory = laboratory

        // TODO (1) : i18n
        if (options.title !== undefined) {
            this._title = options.title
        }

        console.log('ExperimentVerifyContainerBase > constructor > ' + this._title)

        this._domContainer = options.domContainer !== undefined ? options.domContainer : document.body
    }

    // abstract activate(initOptions?: ExperimentInitOptions): void

    activate(experimentOptions: ExperimentVerifyInitOptions): void {

        console.log('ExperimentVerifyContainerBase > Activate verify experiment ' + this.title)

        this.experiment = this.createCustomExperiment({ container: this }, experimentOptions)

        if (this.onKeyboard) {
            document.addEventListener('keydown', this.onKeyboard)
        }
        if (this.onMouseMove) {
            document.addEventListener('mousemove', this.onMouseMove)
        }

        // this.domContainer.addEventListener('resize', this.onDomResize)
        window.addEventListener('resize', this.onDomResize)
    }

    deactivate(): void {

        if (this.onKeyboard) {
            document.removeEventListener('keydown', this.onKeyboard)
        }
        if (this.onMouseMove) {
            document.removeEventListener('mousemove', this.onMouseMove)
        }

        // this.domContainer.removeEventListener('resize', this.onDomResize)
        window.removeEventListener('resize', this.onDomResize)

        if (this.experiment && this.experiment.destructor) {
            this.experiment.destructor()
        }

        this.experiment = undefined
    }

    onKeyboard: { (_event: KeyboardEvent): void } = (event: KeyboardEvent) => {

        switch (event.key) {

            case 't':
                console.log('test key t :)')
                break
            default:
                console.warn('No action defined for key ' + event.key)
        }

        // TODO (3) : if (this.expermient) { this.experiment.customOnKeyboard(event)}
    }

    onMouseMove?: { (_event: MouseEvent): void } = undefined

    private onDomResize = () => {

        if (this.experiment) {
            this.experiment.resize(this.domContainer.offsetWidth, this.domContainer.offsetHeight)
            //this.experiment.resize(window.innerWidth, window.innerHeight)
        }
    }

    animationStep(): void {
        throw new Error("Animation testing not implemented.")
    }
}

interface VerifierConstructor {
    new(ctx: VerifyContext): SesamVerifier
}

interface VerificationCollection {
    [index: number]: VerifierConstructor
    length: number
}

abstract class VerifyContext extends Sesam implements ScenarioInterface, VerifyContext {

    performances: number[] = []
    performanceIndex = 0

    physicalStepPerVisualStep = 1

    domContainer: HTMLElement

    testIndex = 0
    verifiers: VerificationCollection

    protected animationStepOptions: AnimationStepOptions = {
    }

    setAnimationStepOptions(visualStepOptions: AnimationStepOptions): void {
        this.animationStepOptions = visualStepOptions
    }

    constructor(settings: ExperimentSettings, verifiers: VerificationCollection) {
        super()

        console.log('MultislotSceneVerify > Init')

        this.verifiers = verifiers

        this.domContainer = settings.container.domContainer

        this.init(VerifyContext.States.Init)
    }

    eventToString(evtId: Events): string {
        return VerifyContext.Events[evtId]

    }
    stateToString(stateId: States): string {
        return VerifyContext.States[stateId]
    }

    log(arg: any) {

        console.log(arg)

        let e = document.createElement('p')
        e.textContent = arg
        this.domContainer.appendChild(e)
    }

    logSource(arg: any) {

        let e = document.createElement('textarea')
        e.textContent = arg
        this.domContainer.appendChild(e)

        e.style.height = e.scrollHeight + 'px'
    }

    info(arg: any, level = 3) {
        console.log(arg)

        let e = document.createElement('h' + level)
        e.textContent = arg
        this.domContainer.appendChild(e)
    }

    warn(arg: any) {
        console.warn(arg)

        let e = document.createElement('aside')
        e.setAttribute('role', 'alert')
        e.textContent = arg
        this.domContainer.appendChild(e)
    }

    signalTermination() {

        console.log(this.description + ' > signalTermination ' + this.description)
        this.event({ evt: VerifyContext.Events.NextVerifier })
    }


    // TODO (2) : rename as runTest ?
    // abstract render(verifyModel: VerifyModelBase): void

    render() {

        console.log(this.description + ' > render > run test collection ')

        this.event({ evt: VerifyContext.Events.RunTestCollection })
        /* for (let item of InertialGeometryTest.inertialGeometryVerify) {
 
                 let verifier = new item(this)
                 verifier.runTests()
         } */
    }

    protected stateTable: StatesTable = {

        [VerifyContext.States.Init]: {
            [VerifyContext.Events.RunTestCollection]: () => {

                this.info(this.description, 1)
                this.event({ evt: VerifyContext.Events.NextVerifier })
                return VerifyContext.States.Testing
            }
        },

        [VerifyContext.States.Testing]: {
            [VerifyContext.Events.NextVerifier]: () => {

                if (this.testIndex < this.verifiers.length) {

                    // this.scheduleEvent({ evt: SceneVerify.Events.Timeout }, 20000) // 20s

                    console.log(this.description + ' > TestCollection > nextTest > pre ' + this.testIndex + ' of ' + this.verifiers.length)

                    // todo empiler messages

                    let verifierConstructor: VerifierConstructor = this.verifiers[this.testIndex]
                    let verifier: SesamVerifier = new verifierConstructor(this)

                    verifier.signalRunTests()

                    console.log(this.description + ' > TestCollection > nextTest > post ' + this.testIndex + ' of ' + this.verifiers.length)
                    this.testIndex++

                    return VerifyContext.States.Testing
                }
                else {

                    console.log(this.description + ' > TestCollection > nextTest > done ' + this.testIndex + ' of ' + this.verifiers.length)

                    return VerifyContext.States.Done
                }
            },
            [VerifyContext.Events.Error]: () => {
                console.log('> runtest error ' + this.testIndex)
            },
            [VerifyContext.Events.Timeout]: () => {
                console.log('> runtest timeout ' + this.testIndex)
            }
        },

        [VerifyContext.States.Done]: {

        }
    }

    // convinience proxies for log

    testSuite(description: string) {

        this.info(description, 3)

        return this
    }

    test(description: string) {

        this.info(description, 3)

        return this
    }


    // BaseAlgebra
/*
    show(_arg: any) {

        throw 'TODO (0)'

    }

    view(element: DynamicSpace.DynamicElementItem) {

        let itemContainer = document.createElement('div')
        itemContainer.className = 'element_cage'

        if (element instanceof DynamicSpace.GIDynMultislot || element instanceof DynamicSpace.GIDynLeafSlot) {
            let htmlItem = this.baseElementToHtml(element)
            itemContainer.appendChild(htmlItem)
        }
        else if (element instanceof DynamicSpace.ElementCollectionBase || element instanceof DynamicSpace.LeafItemBase) {

            let htmlItem = this.baseElementToHtml(element)
            itemContainer.appendChild(htmlItem)
        }
        else {
            throw new Error('unknown class:' + element)
        }

        this.domContainer.appendChild(itemContainer)
    }

    private baseElementToHtml(element: DynamicSpace.DynamicElementItem, _rowId?: number): HTMLElement {

        let span: HTMLSpanElement

        let collectionContainer = document.createElement('span')

        let outerAlias: undefined | string

        if (element.outerAlias !== undefined) {

            outerAlias = element.outerAlias
        }

        if (outerAlias) {
            let outerSymbolSpan = document.createElement('span')
            outerSymbolSpan.textContent = outerAlias + ': '
            collectionContainer.appendChild(outerSymbolSpan)
        }

        let fact = element.factsHistory
        if (fact.length) {
            collectionContainer.title = fact.join("\n")
        }
        else {
            collectionContainer.title = 'No history'
        }

     //   if (element instanceof DynamicSpace.LeafBasisItem) {

        //    return this.dynamicLeafItemToHtlml(element)
        //}
        // else
         if (element.isLeafItem) {

            return this.dynamicLeafItemToHtlml(element)
        }
        else if (element instanceof DynamicSpace.GIDynLeafSlot) {

            this.dynamicLeafSlotToHtlml(element, collectionContainer)
        }
        else if (element instanceof DynamicSpace.GIDynMultislot) {

            this.dynamicSlotGistToHtlml(element, collectionContainer)
        } 
        else if (element instanceof DynamicSpace.ElementCollectionBase) {

            this.baseElementCollectionGistToHtlml(element, collectionContainer)
        }
        else {
            console.warn('unknown ' + (<any>element).constructor.name)
            collectionContainer.className = 'symbolic_unknown_item'

            span = document.createElement('span')
            span.textContent = 'ù: ' + (<any>element).constructor.name
            collectionContainer.appendChild(span)
        }

        return collectionContainer

    }


    private baseElementCollectionGistToHtlml(collection: DynamicSpace.ElementCollectionBase, itemContainer: HTMLElement) {

        if (collection.operator === DynamicSpace.Operators['+']) {
            itemContainer.className = 'symbolic_sum_item'
        }
        else if (collection.operator === DynamicSpace.Operators['*']) {
            itemContainer.className = 'symbolic_product_item'
        }
        else if (collection.operator === DynamicSpace.Operators['?']) {
            itemContainer.className = 'symbolic_unknown_item'
        }
        else {
            throw 'unknown operator'
        }

        let span: HTMLSpanElement

        if (collection.length) {

            for (let [idx, subitem] of collection.entries()) {

                itemContainer.appendChild(this.baseElementToHtml(subitem, idx))

                span = document.createElement('span')
                span.textContent = idx !== collection.length - 1 ? ' ' + DynamicSpace.Operators[collection.operator] + ' ' : ''
                itemContainer.appendChild(span)

                //if (subitem instanceof DynamicSpace.GIDynMultislot) {
                //    itemContainer.appendChild(this.dynamicSlotToHtml(subitem, idx))
                //    span = document.createElement('span')
                //    span.textContent = idx !== collection.length - 1 ? ' ' + DynamicSpace.Operators[collection.operator] + ' ' : ''
                //    itemContainer.appendChild(span)
                // }
                // else if (subitem instanceof DynamicSpace.GIDynLeafSlot) {
                    
                // }
                // else {
                //     console.warn(subitem)
                //} 
            }
        }
        else {
            span = document.createElement('span')
            span.textContent = '[]'
            itemContainer.appendChild(span)
        }
    }

    private dynamicSlotGistToHtlml(collection: DynamicSpace.GIDynMultislot, itemContainer: HTMLElement) {

        if (collection.operator === DynamicSpace.Operators['+']) {
            itemContainer.className = 'symbolic_sum_item'
        }
        else if (collection.operator === DynamicSpace.Operators['*']) {
            itemContainer.className = 'symbolic_product_item'
        }
        else if (collection.operator === DynamicSpace.Operators['?']) {
            itemContainer.className = 'symbolic_unknown_item'
        }
        else {
            throw 'unknown operator'
        }

        let span: HTMLSpanElement

        if (collection.length) {

            for (let [idx, subitem] of collection.entries()) {

                itemContainer.appendChild(this.baseElementToHtml(subitem, idx))

                span = document.createElement('span')
                span.textContent = idx !== collection.length - 1 ? ' ' + DynamicSpace.Operators[collection.operator] + ' ' : ''
                itemContainer.appendChild(span)

                // if (subitem instanceof DynamicSpace.GIDynMultislot) {
                //    itemContainer.appendChild(this.dynamicSlotToHtml(subitem, idx))
                //    span = document.createElement('span')
                //    span.textContent = idx !== collection.length - 1 ? ' ' + DynamicSpace.Operators[collection.operator] + ' ' : ''
                //    itemContainer.appendChild(span)
                // }
                // else if (subitem instanceof DynamicSpace.GIDynLeafSlot) {
                    
                // }
                // else {
                //    console.warn(subitem)
                // } 
            }
        }
        else {
            span = document.createElement('span')
            span.textContent = '[]'
            itemContainer.appendChild(span)
        }
    }

    private dynamicLeafSlotToHtlml(leafslot: DynamicSpace.GIDynLeafSlot, itemContainer: HTMLElement) {

        itemContainer.className = 'dynamic_leaf_slot'

        let span: HTMLSpanElement

        if (leafslot.length) {

            for (let [idx, leafitem] of leafslot.entries()) {

                itemContainer.appendChild(this.dynamicLeafItemToHtlml(leafitem, idx))
                span = document.createElement('span')
                span.textContent = idx !== leafslot.length - 1 ? DynamicSpace.Operators[leafslot.operator] : ''
                itemContainer.appendChild(span)
            }
        }
        else {
            span = document.createElement('span')
            span.textContent = '[]'
            itemContainer.appendChild(span)
        }
    }

    private dynamicLeafItemToHtlml(item: DynamicSpace.LeafItemBase, _rowId?: number) {

        let itemSpan = document.createElement('span')

        if (item instanceof DynamicSpace.LeafOrientationItem) {

            itemSpan.className = 'leaf_item_orientation'
            // itemSpan.textContent = (item.orientation === 1 ? '+' : (item.orientation === -1 ? '-' : '0'))
            itemSpan.textContent = (item.orientation === 1 ? '+1' : (item.orientation === -1 ? '-1' : '0'))
        }
        else if (item instanceof DynamicSpace.LeafValueItem) {

            itemSpan.className = 'leaf_item_value'
            itemSpan.textContent = item.scalarItem.toString()
        }
        else if (item instanceof DynamicSpace.LeafBasisItem) {

            itemSpan.className = 'leaf_item_basis'
            itemSpan.textContent = item.basisItem.toString()
        }
        else {
            console.warn('Unknown ' + item.constructor.name)
        }

        return itemSpan
    }
*/

}

namespace VerifyContext {
    export enum States { Init, Testing, Done }
    export enum Events { RunTestCollection, Error, NextVerifier, Timeout }
}

abstract class ExperimentVerifyBase implements ExperimentInterface {

    setAnimationStepOptions(_stepOptions: AnimationStepOptions): void {
        throw new Error("Animation testing not implemented.")
    }

    animationStep(_timestamp: number): void {
        throw new Error("Animation testing not implemented.")
    }

    resize(_w: number, _h: number): void {
        throw new Error("Animation testing not implemented.")
    }
}


/*
class ClasseSimple {
    constructor(data) {
      this.index = 0;
      this.data = data;
    }
  
    [Symbol.iterator]() {
      return {
        next: () => {
          if (this.index < this.data.length) {
            return {value: this.data[this.index++], done: false};
          } else {
            this.index = 0; 
            // En réinitialisant l'index, on peut 
            // "reprendre" l'itérateure sans avoir
            // à gérer de mise à jour manuelle
            return {done: true};
          }
        }
      }
    };
  }
  
  const simple = new ClasseSimple([1,2,3,4,5]);
  
  for (const val of simple) {
    console.log(val);  //'0' '1' '2' '3' '4' '5' 
  }
*/


/*class SesamVerifier1
{
    constructor()
    {
        this.state = SesamVerifier.State.Idle;
    }

    state: SesamVerifier.State;
}*/

interface TestFunctionInterface {
    // (ctx: SesamVerifier): void
    (ctx: VerifyContext): void
}

abstract class SesamVerifier extends Sesam { // implements Iterable<TestFunctionInterface>

    ctx: VerifyContext

    // abstract tests: TestFunctionInterface[]
    // abstract getNextVerification(ctx: VerifyContext): TestFunctionInterface | undefined
    testIndex = 0
    testSuccess = true

    abstract tests: TestFunctionInterface[] // = []
    //  testIterator: Iterator<TestFunctionInterface | undefined>

    constructor(ctx: VerifyContext) {
        super()

        this.ctx = ctx
        // super(States.Init)


        // this.testIterator = this[Symbol.iterator]()

        this.init(SesamVerifier.States.Init)
    }

    /* [Symbol.iterator](): Iterator<TestFunctionInterface | undefined> {  
         return {
             next: () => {
                 if (this.testIndex < this.tests.length) {
                     return { value: this.tests[this.testIndex++], done: false }
                 } else {
                     this.testIndex = 0
                     return { value: undefined, done: true }
                 }
             }
         }
     } */

    eventToString(evtId: Events): string {
        return SesamVerifier.Events[evtId]

    }
    stateToString(stateId: States): string {
        return SesamVerifier.States[stateId]
    }

    // TODO (3) : message handler
    // handler(_message: any) {  }


    signalRunTests() {
        console.log(this.description + ' > signalRunTest')
        this.event({ evt: SesamVerifier.Events.RunTests })
    }

    // TODO (2) : promise, args, log etc
    // FIXME (1) : halt on error or do all tests ?
    protected ventilate() {

        this.clearScheduledEvent({ evt: SesamVerifier.Events.Timeout })

        if (this.testSuccess === true) {
            console.log(this.description + ' > ventilate > generate nextTest')
            this.event({ evt: SesamVerifier.Events.NextTest })
        }
        else {
            console.warn(this.description + ' > ventilate > generate error')
            this.event({ evt: SesamVerifier.Events.Error })
        }
    }

    protected stateTable: StatesTable = {

        [SesamVerifier.States.Init]: {
            [SesamVerifier.Events.RunTests]: () => {

                this.ctx.info(this.description, 1)
                this.event({ evt: SesamVerifier.Events.NextTest })

                return SesamVerifier.States.Testing
            }
        },

        [SesamVerifier.States.Testing]: {
            [SesamVerifier.Events.NextTest]: () => {



                /*  let nextTest = this.testIterator.next()
  
                  if (nextTest.done !== true && nextTest.value) {
                      nextTest.value(this.ctx)
  
                      this.ventilate()
    
                      console.log(this.description + ' > Testing > nextTest > post ' + this.testIndex)
                      this.testIndex++
  
                      return SesamVerifier.States.Testing
                  }
                  else {
                      console.log(this.description + ' > Testing > nextTest > done ' + this.testIndex)
    
                        this.ctx.signalTermination()
    
                        return SesamVerifier.States.Done
                  } */




                if (this.testIndex < this.tests.length) {

                    this.scheduleEvent({ evt: SesamVerifier.Events.Timeout }, 20000) // 20s

                    console.log(this.description + ' > Testing > nextTest > pre ' + this.testIndex)

                    // TODO (3) : pile up messages

                    // FIXME (1) : setTimeout + multiple () => {} does not work ?
                    // this.tests[this.testIndex](this.ctx)
                    this.tests[this.testIndex].call(this, this.ctx)

                    this.ventilate()

                    console.log(this.description + ' > Testing > nextTest > post ' + this.testIndex)
                    this.testIndex++

                    return SesamVerifier.States.Testing
                }
                else {

                    console.log(this.description + ' > Testing > nextTest > done ' + this.testIndex)

                    this.ctx.signalTermination()

                    return SesamVerifier.States.Done
                }
            },
            [SesamVerifier.Events.Error]: () => {
                console.log('> runtest error ' + this.testIndex)
            },
            [SesamVerifier.Events.Timeout]: () => {
                console.log('> runtest timeout ' + this.testIndex)
            }
        },

        [SesamVerifier.States.Done]: {
            /*[Events.Success]: () => {

                console.log('> success')

                this.clearScheduledEvent({ evt: Events.Timeout })

                // return States.Operating;
            }*/
        }

    }


    // FIXME (0) : remove from here and put in VerifyContext

    /*
verify(value: undefined): UndefinedVerifierProxy
    verify(value: undefined | number): NumberVerifierProxy
    verify(value: undefined | string): StringVerifierProxy
    verify(value: undefined | SerialisableMultislot.SymbolicNumericItem): SymbolicNumericItemVerifierProxy
    verify(value: undefined | SerialisableMultislot.SymbolicItemCollection): SymbolicItemCollectionVerifierProxy
    verify(value: undefined | SymbolicMatrix): SymbolicMatrixVerifierProxy
    verify(value: undefined | SymbolicRecursiveMatrix): SymbolicRecursiveMatrixVerifierProxy 
    verify(value: undefined | number | string 
        | SymbolicMatrix | SymbolicRecursiveMatrix  
        | SerialisableMultislot.SymbolicValuedItem
        | SerialisableMultislot.SymbolicRulerStick): VerifierProxy {

        if (value === undefined) {
            return new UndefinedVerifierProxy(this)
        }
        
           else if (typeof value === 'number') {
            return new NumberVerifierProxy(this, value)
        }
        else if (typeof value === 'string') {
            return new StringVerifierProxy(this, value)
        }
        else if (value instanceof SerialisableMultislot.SymbolicNumericItem) {
            return new SymbolicNumericItemVerifierProxy(this, value)
        }
        else if (value instanceof SerialisableMultislot.SymbolicItemCollection) {
            return new SymbolicItemCollectionVerifierProxy(this, value)
        }
        else if (value instanceof SymbolicMatrix) {
            return new SymbolicMatrixVerifierProxy(this, value)
        }
        else if (value instanceof SymbolicRecursiveMatrix) {
            return new SymbolicRecursiveMatrixVerifierProxy(this, value)
        }
        else {
            // TODO (0) : SymbolicRulerStickVerifierProxy
            throw new Error('unknown type ' + value + ' ' + (typeof value))
        }

        // return this
    }
    */

    // verify(): UndefinedVerifierProxy
    verify(value: null): NullVerifierProxy
    verify(value: boolean): BooleanVerifierProxy
    verify(value: number): NumberVerifierProxy
    verify(value: string): StringVerifierProxy
    // verify(value: SerialisableMultislot.SymbolicNumericItem): SymbolicNumericItemVerifierProxy
    // verify(value: SerialisableMultislot.SymbolicItemCollection): SymbolicItemCollectionVerifierProxy
    // verify(value: SerialisableMultislot.SymbolicRulerStick | null): SymbolicRulerStickVerifierProxy | NullVerifierProxy
    // verify(value?: SerialisableMultislot.SymbolicRulerStick | null): SymbolicRulerStickVerifierProxy | UndefinedVerifierProxy
    //verify(value: SymbolicMatrix): SymbolicMatrixVerifierProxy
    //verify(value: SymbolicRecursiveMatrix): SymbolicRecursiveMatrixVerifierProxy
    verify(value: null | boolean | number | string) {

        if (value === undefined) {
            return new UndefinedVerifierProxy(this)
        }
        else if (value === null) {
            return new NullVerifierProxy(this)
        }
        else if (typeof value === 'boolean') {
            return new BooleanVerifierProxy(this, value)
        }
        /*   else if (value === NaN) { // => NumberVerifierProxy
               return new NaNVerifierProxy(this)
           } */
        else if (typeof value === 'number') {
            return new NumberVerifierProxy(this, value)
        }
        else if (typeof value === 'string') {
            return new StringVerifierProxy(this, value)
        }
       /* else if (value instanceof SerialisableMultislot.SymbolicNumericItem) {
            return new SymbolicNumericItemVerifierProxy(this, value)
        }
        else if (value instanceof SerialisableMultislot.SymbolicItemCollection) {
            return new SymbolicItemCollectionVerifierProxy(this, value)
        }
        else if (SerialisableMultislot.isSymbolicRulerStick(value)) {
            return new SymbolicRulerStickVerifierProxy(this, value)
        }
        else if (value instanceof SymbolicMatrix) {
            return new SymbolicMatrixVerifierProxy(this, value)
        }
        else if (value instanceof SymbolicRecursiveMatrix) {
            return new SymbolicRecursiveMatrixVerifierProxy(this, value)
        } */
        else {
            // TODO (0) : 
            throw new Error('unknown type ' + value + ' ' + (typeof value))
        }

        // return this
    }

    // FIXME (4) : cannot infer type from multiple or undefined
    verifyU(value?: any): VerifierProxy {

        return this.verify(value)

    }
}

namespace SesamVerifier {
    export enum States { Init, Testing, Done }
    export enum Events { RunTests, Error, NextTest, Timeout }
}

abstract class VerifierProxy {

    abstract isEqualTo(value: any): void

    isNaN() {
        // Note : NaN == NaN : false (js specifications) => ~ unknown value !== unknown value
        throw ('missing isNaN implementation in nonnumeric subclass')
        // return this.isEqualTo(NaN) 
    }
}

class NullVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier) { super() }

    isEqualTo(value: any) {

        if (value === null) {
            this.verifier.ctx.log(this.verifier.description + ' >  ?: null === ' + value + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: null === ' + value + ' => false (expected: true)')
        }

        return this
    }
}

class UndefinedVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier) { super() }

    isEqualTo(value: any) {

        if (value === undefined) {
            this.verifier.ctx.log(this.verifier.description + ' >  ?: undefined === ' + value + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: undefined === ' + value + ' => false (expected: true)')
        }

        return this
    }
}

class BooleanVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected value: boolean) { super() }

    isEqualTo(value: boolean) {

        if (this.value && value) {
            this.verifier.ctx.log(this.verifier.description + ' >  ?: ' + this.value + ' === ' + value + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: ' + this.value + ' === ' + value + ' => false (expected: true)')
        }

        return this
    }
}


class NumberVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected value: number) { super() }

    isEqualTo(value: number) {

        if (this.value === value) {
            this.verifier.ctx.log(this.verifier.description + ' >  ?: ' + this.value + ' === ' + value + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: ' + this.value + ' === ' + value + ' => false (expected: true)')
        }

        return this
    }

    isNaN() {
        if (isNaN(this.value)) {
            this.verifier.ctx.log(this.verifier.description + ' >  ?: isNaN(' + this.value + ') === true => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: isNaN(' + this.value + ') === true => false (expected: true)')
        }

        return this
    }
}

class StringVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected value: string) { super() }

    isEqualTo(value?: string) {

        if (value === undefined && this.value === undefined) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: ' + this.value + ' === ' + value + ' => true')
        }
        else if (value !== undefined && 0 === this.value.localeCompare(value)) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: ' + this.value + ' === ' + value + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: ' + this.value + ' === ' + value + ' => false (expected: true)')
        }

        return this
    }
}
/*
class SymbolicNumericItemVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected compared: SerialisableMultislot.SymbolicNumericItem) { super() }

    isEqualTo(comparator: any) {

        if (typeof (comparator) === 'number' && comparator === this.compared.value) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: ('
                + this.compared.constructor.name
                + ') value: ' + this.compared.value + ' == (number) ' + comparator + ' => ~true')
        }
        else if (comparator instanceof SerialisableMultislot.SymbolicNumericItem && comparator.value === this.compared.value) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: (Numeric) ' + this.compared + ' === ' + comparator + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: ' + this.compared + ' === ' + comparator + ' => false (expected: true)')
        }

        return this
    }

    isNaN() {
        if (isNaN(this.compared.value)) {
            this.verifier.ctx.log(this.verifier.description + ' >  ?: isNaN(' + this.compared + ') === true => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: isNaN(' + this.compared + ') === true => false (expected: true)')
        }

        return this
    }
}

class SymbolicItemCollectionVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected compared: SerialisableMultislot.SymbolicItemCollection) { super() }

    isEqualTo(comparator: any) {

        if (typeof (comparator) === 'number' && comparator === this.compared.value) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: ('
                + this.compared.constructor.name
                + ') value: ' + this.compared.value + ' == (number) ' + comparator + ' => ~true')
        }
        else if (comparator instanceof SerialisableMultislot.SymbolicItemCollection && comparator.value === this.compared.value) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: ' + this.compared + ' === ' + comparator + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: ' + this.compared + ' === ' + comparator + ' => false (expected: true)')
        }

        return this
    }
}

class SymbolicRulerStickVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected compared: SerialisableMultislot.SymbolicRulerStick) { super() }

    isEqualTo(comparator: any) {

        if (typeof (comparator) === 'string' && comparator === this.compared.outerSymbol) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: ('
                + this.compared.constructor.name
                + ') ' + this.compared.outerSymbol + ' == (string) ' + comparator + ' => ~true')
        }
        else if (SerialisableMultislot.isSymbolicRulerStick(comparator) && comparator.outerSymbol === this.compared.outerSymbol) {
            this.verifier.ctx.log(this.verifier.description + ' > ?: ('
                + this.compared.constructor.name + ') ' + this.compared.outerSymbol + ' === ('
                + comparator.constructor.name + ') ' + comparator.outerSymbol + ' => true')
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > ?: ' + this.compared + ' === ' + comparator + ' => false (expected: true)')
        }

        return this
    }
}


class SymbolicMatrixVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected mat: SymbolicMatrix) { super() }

    isEqualTo(values: any) {

        if (values.length) {

            return this.valuesAreStrictlyEqualTo(values)

        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > number[][] expected ')
        }

        return this
    }

    protected valuesAreStrictlyEqualTo(values: number[][]) {

        let success = true

        if (values.length !== this.mat.rowCount) {
            success = false
            this.verifier.ctx.warn(`${this.verifier.description}
                    > ?: values.rows :${values.length} mat.rows:${this.mat.rowCount}`)
        }

        for (let rowIdx = 0; rowIdx < values.length; rowIdx++) {

            let row = values[rowIdx]

            if (row.length !== this.mat.colCount) {
                success = false
                this.verifier.ctx.warn(`${this.verifier.description}
                        > ?: values.cols :${row.length} mat.cols:${this.mat.rowCount}`)
            }

            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                if (values[rowIdx][colIdx] !== this.mat.getValue(rowIdx, colIdx)) {
                    success = false
                    this.verifier.ctx.warn(`${this.verifier.description}
                    > ?: [${rowIdx}][${colIdx}]: ${values[rowIdx][colIdx]} 
                     === ${this.mat.getValue(rowIdx, colIdx)} => false (expected: true)`)
                }
            }
        }

        if (success) {
            this.verifier.ctx.log(`${this.verifier.description}
        > ?: ${this.mat} === ${values} => true (expected: true)`)
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(`${this.verifier.description}
            > ?: ${this.mat} === ${values} => false (expected: true)`)
        }

        return this
    }
}


class SymbolicRecursiveMatrixVerifierProxy extends VerifierProxy {

    constructor(protected verifier: SesamVerifier, protected mat: SymbolicRecursiveMatrix) { super() }

    isEqualTo(values: any) {

        if (values.length) {
            return this.serializationsAreStrictlyEqualTo(values)
        } else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(this.verifier.description + ' > serialization string[][] expected ')
        }

        return this
    }

    protected serializationsAreStrictlyEqualTo(values: string[][]) {

        let success = true

        if (values.length !== this.mat.rowCount) {
            success = false
            this.verifier.ctx.warn(`${this.verifier.description}
                    > ?: values.rows :${values.length} mat.rows:${this.mat.rowCount}`)
        }

        for (let rowIdx = 0; rowIdx < values.length; rowIdx++) {

            let row = values[rowIdx]

            if (row.length !== this.mat.colCount) {
                success = false
                this.verifier.ctx.warn(`${this.verifier.description}
                        > ?: values.cols :${row.length} mat.cols:${this.mat.rowCount}`)
            }

            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                if (values[rowIdx][colIdx] !== this.mat.getSerialization(rowIdx, colIdx)) {
                    success = false
                    this.verifier.ctx.warn(`${this.verifier.description}
                    > ?: [${rowIdx}][${colIdx}]: ${values[rowIdx][colIdx]} 
                     === ${this.mat.getSerialization(rowIdx, colIdx)} => false (expected: true)`)
                }
            }
        }

        if (success) {
            this.verifier.ctx.log(`${this.verifier.description}
        > ?: ${this.mat} === ${values} => true (expected: true)`)
        }
        else {
            this.verifier.testSuccess = false
            this.verifier.ctx.warn(`${this.verifier.description}
            > ?: ${this.mat} === ${values} => false (expected: true)`)
        }

        return this
    }
    
}
*/
