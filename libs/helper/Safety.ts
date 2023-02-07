

export function CheckContent(target: HTMLElement) {
    var baseText = target.getAttribute('baseText');
    if (!baseText) {
        target.setAttribute("baseText", target.textContent);
        baseText = target.textContent;
    }
    target.textContent = baseText;
}
export class Safety {

    static get cfg() { return "____________"; }

    static check(): boolean { return true; }
}