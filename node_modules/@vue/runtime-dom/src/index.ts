import { patchProp } from './patchProps';
import { nodeOps } from './nodeOps';
import { createRender } from '../../runtime-core/src/render';
const renderOptionDom = Object.assign({}, {patchProp}, nodeOps);

export const createApp = (rootComponent, rootProps) => {
    const app = createRender(renderOptionDom).createApp(rootComponent, rootProps)
    const {mount} = app;
    app.mount = (container) => {
        // 先清空、后挂载
        const el = renderOptionDom.querySelector(container);
        el.innerHTML = '';
        mount(container);
    }
    return app;
}
