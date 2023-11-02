class ContentPane extends HTMLElement {
    shadow;

    constructor() {
        super();
        const template = document.getElementById('content-pane')!;
        // @ts-ignore
        const content = template.content;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.appendChild(content.cloneNode(true));
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', 'component/content-pane/content-pane.less');
        this.shadow.appendChild(linkElem);
        this.switchTab();
    }

    connectedCallback() {
    }

    private switchTab() {
        this.addEventListener('switch-tab', (e) => {
            console.log(e);
        })
    }

}

customElements.define('content-pane', ContentPane);