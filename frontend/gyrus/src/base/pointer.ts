
// MouseEvent.buttons value (down, move)
const MouseLeftButtons = 1;
const MouseRightButtons = 2;
const MouseMiddelButtons = 4;

// MouseEvent.button value (up)
const MouseLeftButton = 0;
const MouseRightButton = 1;
const MouseMiddelButton = 2;

interface EventHandler {

}

interface PointerInterface {

    // TODO (3) : https://stackoverflow.com/questions/13407036/how-does-typescript-interfaces-with-construct-signatures-work
    // constructor(eventTarget: EventTarget, eventhandler: EventHandler)
    connectEventHandlers(): void
}

class BasePointer implements PointerInterface {

    constructor(_eventTarget: EventTarget, _eventhandler: EventHandler) {

    }
    connectEventHandlers() {

    }

}
