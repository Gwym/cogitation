


class SulcusUi extends BaseHtmlUI {

    protected channel?: Channel

    constructor(container: HTMLElement) {
        super(container)
    }

    init(channel: Channel) {
        this.channel = channel

        let bootstrapButton = document.getElementById('button_bootstrap')
        if (bootstrapButton) {
            bootstrapButton.addEventListener('click', () => {
                console.log('click bootstrap ' + this.channel)
                if (this.channel) {
                    let bootstrapReq: BootstrapRequest = { type: SulcusMessageType.Bootstrap }
                    this.channel.send(bootstrapReq)
                }
            })
        }
        else {
            throw 'HtmlElement id: button_bootstrap not found'
        }
    }

    private recursionRequest = () => {
        console.log('click mise en abyme ' + this.channel)
        if (this.channel) {
            let recursionReq: RecursionRequest = { type: SulcusMessageType.Recursion }
            this.channel.send(recursionReq)
        }
    }

    bootstrapRunning(_m: BootstrapAck) {
        let bootstrapButton = document.getElementById('button_bootstrap')
        if (bootstrapButton) {
            bootstrapButton.style.visibility = 'hidden'
        }
        let sulcusPanel = document.getElementById('sulcus_panel')
        if (sulcusPanel) {
            sulcusPanel.style.visibility = 'visible'
        }
        let miseEnAbymeButton = document.getElementById('button_mise_en_abyme')
        if (miseEnAbymeButton) {
            miseEnAbymeButton.addEventListener('click', this.recursionRequest)
        }
    }

    recursionCheck(_m: RecursionAck) {

        let miseEnAbymeButton = document.getElementById('button_mise_en_abyme')
        if (miseEnAbymeButton) {
            miseEnAbymeButton.removeEventListener('click', this.recursionRequest)
            miseEnAbymeButton.style.visibility = 'hidden'
            // TODO (0) : inform user 
        }

    }

}