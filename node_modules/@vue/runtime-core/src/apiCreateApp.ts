import { createVNode } from "./createVNode";

export function apiCreateApp(render) {
    return function createApp (rootComponent, rootProps) {
        let app = {
            mount (container) {
                let vnode: any = createVNode(rootComponent, rootProps);
                render(vnode, container);
                vnode._container = container;
            }
        }
        return app;
    }
}