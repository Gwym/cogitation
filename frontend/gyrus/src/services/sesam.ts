// FIXME (0) : not shared, setImmediate only exists for node, not browser

// States EventS Actions Machines

type Events = number   // ~ enum Events { }
type States = number  // ~ enum States { Init }

interface SesamEvent {
    evt: Events
    data?: any
}

interface EventsTable {
    entry?: (arg?: SesamEvent) => States | void
    [index: number]: undefined | ((arg: SesamEvent) => States | void)
    exit?: (arg?: SesamEvent) => States | void
}

interface StatesTable {
    [index: number]: EventsTable
}

interface MachineInterface {
    event(event: SesamEvent, hasPriority?: boolean): void
    scheduleEvent(e: SesamEvent, delay: number): void
    clearScheduledEvent(e: SesamEvent): void
}


abstract class Sesam implements MachineInterface {

    protected eventQueue: SesamEvent[] = []
    protected timers: NodeJS.Timer[] = []

    protected _state: States = 0
    //  get state() { return this._state

    abstract description: string
    abstract eventToString(evtId: Events): string
    abstract stateToString(stateId: States): string

    protected init(initStateId: States) {

        let initState = this.stateTable[initStateId]
        if (initState === undefined) {
            // TODO (1) : dispatcher event ?
            throw ('Unknown Init State')
        }

        this._state = initStateId
        if (initState.entry) {
            initState.entry()
        }
    }

    private transition(newStateId: States, trigger: SesamEvent) {

        console.log(this.description + ' > transition from ' + this._state + ' to ' + newStateId)

        let newState = this.stateTable[newStateId]
        if (newState === undefined) {
            console.warn('UnknownState') //{ error: 'UnknownState', state: new_state }) // TODO (0) : object log
            // TODO (1) : dispatcher event ?
            return
        }

        if (this._state !== newStateId) {

            // console.log('set state ' + this._state + ' >> ' + new_state)
            let currentState = this.stateTable[this._state]
            if (currentState.exit) {
                currentState.exit(trigger)
            }

            this._state = newStateId
            if (newState.entry) {
                newState.entry(trigger)
            }
            // this.dispatcher({ target: this.id, messageType: MessageTypes.State, data: { state: new_state } })
        }
        else {
            console.log('skip same state')
        }
    }

    protected abstract stateTable: StatesTable  // = { stateInit: {} }

    // TODO (0) constructor() { initstate.entry() }

    event(event: SesamEvent, hasPriority = false): void {

        console.log(this.description + ' > queue event ' + this.eventToString(event.evt))

        if (hasPriority) {
            this.eventQueue.unshift(event)
        }
        else {
            this.eventQueue.push(event)

        }
        //setTimeout(() => { this.tick() }, 1) // setImmediate()
        setTimeout(() => {

            // FIXME (1) : setTimeout + multiple () => {} does not work ?
            this.tick()
            // this.tick.call(this)

        }, 1) // setImmediate()
    }

    protected tick() {

        let e = this.eventQueue.shift()
        if (e) {
            let currentState = this.stateTable[this._state]

            let happeningActionId = currentState[e.evt]

            if (happeningActionId === undefined) {
                console.warn({ error: 'Unhandled Event', event: this.eventToString(e.evt), state: this.stateToString(this._state) })
                console.error({ error: 'Unhandled Event', event: e, state: this._state })
                console.log(e)
            } else {
                let newState = happeningActionId(e)
                if (typeof newState === 'number') { // FIXME : (5) if (newState !== undefined && newState !== void) {
                    this.transition(newState, e)
                }
            }
        }
        else {
            console.warn('no event in queue')
        }
    }

    protected ignore(e: SesamEvent) {
        console.log('{ machine: ' + this.toString() + ' state: ' + this._state + ' event:' + e + ' action: ignore')
    }

    protected defer(e: SesamEvent) {
        console.log('{ machine: ' + this.toString() + ' state: ' + this._state + ' event:' + e + ' action: defer')
        // TODO (1) : deffered events queue, conservation condition and expiry date
    }

    scheduleEvent(e: SesamEvent, delayMs: number) {

        // TODO (3) : reset existing or duplicate ?
        if (this.timers[e.evt]) {
            console.error('scheduleEvent > Error : timer already set ' + e)
            throw new Error(' timer already set')
        }
        console.log(this.description + ' > scheduleEvent ' + this.eventToString(e.evt) + ' in ' + delayMs + ' ms ')
        this.timers[e.evt] = setTimeout(() => {
            console.log('scheduledEvent' + e.evt)
            delete this.timers[e.evt]
            this.event(e)
        }, delayMs)
    }

    clearScheduledEvent(e: SesamEvent) {

        if (this.timers[e.evt] !== undefined) {
            clearTimeout(this.timers[e.evt])
            delete this.timers[e.evt]
            console.log('clearScheduledEvent (' + this.eventToString(e.evt) + ')' + ' remain:' + this.timers.length)
        }
        else {
            console.error({ error: 'UNKNOWN_TIMER', event: e })
        }
    }
}
