// FIXME (0) : not shared, setImmediate only exists for node, not browser

// States EventS Actions Machines

import { dbg } from "../logger" // FIXME (0) : dbg => console in shared gen

type Events = number   // ~ enum Events { }
type States = number  // ~ enum States { Init }

export interface SesamEvent {
    evt: Events
    data?: any
}

export interface EventsTable {
    entry?: (arg?: SesamEvent) => States | void
    [index: number]: undefined | ((arg: SesamEvent) => States | void)
    exit?: (arg?: SesamEvent) => States | void
}

export interface StatesTable {
    [index: number]: EventsTable
}

export interface MachineInterface {
    event(event: SesamEvent, hasPriority?: boolean): void
    scheduleEvent(e: SesamEvent, delay: number): void
    clearScheduledEvent(e: SesamEvent): void
}

export abstract class Sesam implements MachineInterface {

    protected eventQueue: SesamEvent[] = []
    protected timers: NodeJS.Timer[] = []

    protected _state: States = 0
    //  get state() { return this._state

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

    transition(newStateId: States, trigger: SesamEvent) {

        dbg.log('transition from ' + this._state + ' to ' + newStateId)

        let newState = this.stateTable[newStateId]
        if (newState === undefined) {
            dbg.warn('UnknownState') //{ error: 'UnknownState', state: new_state }) // TODO (0) : object log
            // TODO (1) : dispatcher event ?
            return
        }

        if (this._state !== newStateId) {

            // dbg.log('set state ' + this._state + ' >> ' + new_state)
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
            dbg.log('skip same state')
        }
    }

    protected abstract stateTable: StatesTable  // = { stateInit: {} }

    // TODO (0) constructor() { initstate.entry() }

    event(event: SesamEvent, hasPriority = false): void {

        if (hasPriority) {
            this.eventQueue.unshift(event)
        }
        else {
            this.eventQueue.push(event)

        }
        setImmediate(() => { this.tick() })
    }

    protected tick() {

        let e = this.eventQueue.shift()
        if (e) {
            let currentState = this.stateTable[this._state]

            let happeningActionId = currentState[e.evt]

            if (happeningActionId === undefined) {
                dbg.error({ error: 'Unkonwn Event', event: e, state: this._state })
            } else {
                let newState = happeningActionId(e)
                if (typeof newState === 'number') { // FIXME : (5) if (newState !== undefined && newState !== void) {
                    this.transition(newState, e)
                }
            }
        }
        else {
            dbg.warn('no event in queue')
        }
    }

    protected ignore(e: SesamEvent) {
        dbg.log('{ machine: ' + this.toString() + ' state: ' + this._state + ' event:' + e + ' action: ignore')
    }

    protected defer(e: SesamEvent) {
        dbg.log('{ machine: ' + this.toString() + ' state: ' + this._state + ' event:' + e + ' action: defer')
        // TODO (1) : deffered events queue, conservation condition and expiry date
    }

    scheduleEvent(e: SesamEvent, delayMs: number) {
        // TODO (3) : reset existing or duplicate ?
        if (this.timers[e.evt]) {
            dbg.error('scheduleEvent > Error : timer already set ' + e)
            throw new Error(' timer already set')
        }
        dbg.log('scheduleEvent ' + e.evt + ' in ' + delayMs + ' ms ')
        this.timers[e.evt] = setTimeout(() => {
            dbg.log('scheduledEvent' + e.evt)
            delete this.timers[e.evt]
            this.event(e)
        }, delayMs)
    }

    clearScheduledEvent(e: SesamEvent) {

        if (this.timers[e.evt] !== undefined) {
            clearTimeout(this.timers[e.evt])
            delete this.timers[e.evt]
            dbg.log('clearScheduledEvent (' + e + ')' + ' ' + this.timers)
        }
        else {
            dbg.error({ error: 'UNKNOWN_TIMER', event: e })
        }
    }

    // TODO (0) : error events management with process.nextTick and not with setImmediate
    // highpriority real time event ?
    // https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
}
