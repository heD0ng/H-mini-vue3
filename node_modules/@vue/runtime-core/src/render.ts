import { apiCreateApp } from "./apiCreateApp";
import { mountComponent, setupComponent, setupRenderEffect } from "./component";

export function createRender(renderOptionDom) {
    let render = (vnode, container) => {
        patch(null, vnode, container)
    }
    return {
        createApp: apiCreateApp(render)
    }
}

function patch(n1, n2, container) {
    if(!n1) {
        const instance = mountComponent(n2, container);
        setupComponent(instance);
        setupRenderEffect(instance);
    } else {

    }
}