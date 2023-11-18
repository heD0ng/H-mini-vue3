export const nodeOps = {
    createElement: (tagName:string) => {
        return document.createElement(tagName);
    },
    insert: (child, parent, anchor=null) => {
        parent.insertBefore(child, anchor);
    },
    remove: (node) => {
        const parentNode = node.parentNode;
        if (parentNode) {
            parentNode.removeChild(node);
        }
    },
    createTextNode: (text) => {
        return document.createTextNode(text);
    },
    querySelector: (selector) => {
        return document.querySelector(selector);
    },
    setElementText: (el, text) => {
        el.nodeValue = text;
    },
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    setText: (el, text) => {
        el.textContent = text;
    },
} 