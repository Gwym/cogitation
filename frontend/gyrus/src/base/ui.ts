

interface UiInterface {
    setSize(width: number, height: number): void
    setUser(user: UserSessionAck) : void
    addInfo(info: string, isError?: boolean, timeoutMs?: number): void
    setConnectedState(state: string): void
}

class BaseHtmlUI implements UiInterface {

    protected infoBox: HTMLElement
    protected container: HTMLElement

    constructor(container: HTMLElement) {

        this.container = container;

        this.infoBox = <HTMLElement>document.getElementById('info_box');
        if (!this.infoBox) {
            throw 'HtmlElement id: info_box not found'
        }
    }


    static empty(he: HTMLElement) {
        while (he.firstChild) {
            he.removeChild(he.firstChild);
        }
    }

    setSize(width: number, height: number) {

        this.container.style.width = width.toString();
        this.container.style.height = height.toString();
    }

    addInfo(info: string, isError = false, timeoutMs = 1000) {

        let infoLine: HTMLParagraphElement | undefined = document.createElement('p');
        infoLine.textContent = info;
        if (isError) {
            infoLine.className = 'error_message';
        }

        infoLine.onclick = () => {
            if (infoLine) {
                console.log('remove click ' + infoLine.textContent);
                this.infoBox.removeChild(infoLine);
                infoLine = undefined;
            }
        };

        setTimeout(() => {
            if (infoLine) {
                // console.log('remove timeout ' + infoLine.textContent);
                this.infoBox.removeChild(infoLine);
                infoLine = undefined;
            }
        }, /*this.infoBox.children.length * 1000 +*/ timeoutMs);

        this.infoBox.appendChild(infoLine);
    }

    setUser(m: UserSessionAck) {
        this.setConnectedState('user_connected');
        if (window.performance && performance.navigation.type === performance.navigation.TYPE_RELOAD) { //  
            this.addInfo(i18n.gyrus.welcome_name(m.userOptions.name), false, 2000); // TODO (5) : welcome_again 
        }
        else {
            this.addInfo(i18n.gyrus.welcome_name(m.userOptions.name), false, 5000);
        }
    }

    setConnectedState(_state: string) {


        //  console.log('TODO Set ConnectedState ' + state);

        /* if (this.animationId !== undefined) {
             window.cancelAnimationFrame(this.animationId);
             this.animationId = undefined;
         } */
        //   this.userCard.visible = true;
        //   this.redraw(); // TODO (1) : staticRedraw or requestAnim ? => needRedraw
    }
}



// class HtmlCard extends HTMLDivElement implements Card { }
/*
class HtmlActionButton {

    button: HTMLButtonElement
    actView: ActionViewer

    constructor(container: HTMLElement, action: ActionViewer) {
        this.button = document.createElement('button');
        this.actView = action;
        this.button.addEventListener('click', () => {
            console.log('trigger action ' + action.caption);
            action.triggerAction();
        })
        container.appendChild(this.button);
    }


    update(now: number) {

        let costs = { qt: 0, energy: 0 };
        let actCtx = this.actView.action.check(new ActionReport(true, [], costs));

        let help = i18n.acts_costs(costs.qt, costs.energy);

        if (actCtx.fails.length) {
            this.button.disabled = true;
            // this.title = act.checkFails.join(';');
            console.log('createActionButton > action ' + ActId[this.actView.action.actId] + ' (' + this.actView.caption + ') will fail : ' + actCtx.fails.join(' ; '));
            for (let id of actCtx.fails) {
                if (id !== FailId.Energy && id !== FailId.Qt) {
                    help += ' ' + i18n.acts_fails[id];
                }
            }
        } else {
            this.button.disabled = false;
            console.log('createActionButton > action set ' + this.actView.caption);
        }

        this.button.textContent = this.actView.caption;
        this.button.title = help;
    }
}
*/
/*
class HtmlActionViewer {

    private buttons: HtmlActionButton[] = []
    //  private tile: Tile | null = null
    //   private cell: Cell | null = null
    //   private entity: Furniture | null = null
    private container: HTMLElement
    private target: Target | undefined

    constructor(parent: HTMLElement) {
        this.container = document.createElement('div');
        parent.appendChild(this.container);
    }

    update(now: number) {

        for (let actButton of this.buttons) {
            actButton.update(now);
        }
    }

    setTarget(zone: RelZone, target: Target) {

        this.target = target;
        HtmlUI.empty(this.container);
        this.buttons = [];

        console.log('setTarget action ' + target);

        let now = Date.now();
        let action: ActionViewer;
        let button: HtmlActionButton;

        for (let actionConstructorId of zone.actor.actions) {
            if (target.reactions.indexOf(actionConstructorId) !== -1) {
                action = WorldUI.ActionViewerFactory(actionConstructorId, zone, target);
                button = new HtmlActionButton(this.container, action);
                this.container.appendChild(button.button);
                this.buttons.push(button);
                button.update(now);
            }
            else {
                // console.log(actionConstructorId + ' is not in' + target.reactions + ' ' + target);
            }
        }

    }

    unsetTarget() {

        console.log('unsetTarget ');

        this.target = undefined;
        HtmlUI.empty(this.container);
        this.buttons = [];
    }
}

// TODO (5) : document.registerElement
class HtmlCard {

    container: HTMLDivElement
    protected actionsViewer: HtmlActionViewer

    appendText(): HTMLParagraphElement {
        let p = document.createElement('p');
        this.container.appendChild(p);
        return p;
    }

    update(now: number) {
        this.actionsViewer.update(now);
    }
}
*/