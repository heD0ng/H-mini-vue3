// import { isObject } from '@vue/shared';
import { isObject } from '../../shared/src/index';
import { componentPublicInstance } from './componentPublicInstance';
import { ShapeFlags } from "../../shared/src/shapeFlags";
import { isFunction } from '../../shared/src/index';
import { effect } from '../../reactivity/src/effect';
export function mountComponent(vnode, container) {
    const instance = vnode.component = createComponentInstance(vnode);
    return instance;
}
// 创建组件实例
export function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: {},
        props: {},
        attrs: {},
        setupState: {},
        ctx: {},
        proxy: {},
        // 判断是否是第一次加载
        isMounted: false
    }
    instance.ctx = {_: instance};
    return instance;
}

// 解析数据到组件中
export function setupComponent(instance) {
    const {props, children, type} = instance.vnode;
    instance.type = type;
    instance.props = props;
    instance.children = children;
    let isStateFul = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
    if (isStateFul) {
        setupStateComponent(instance)
    }
}

function setupStateComponent(instance) {
    instance.proxy = new Proxy(instance.ctx, componentPublicInstance);
    const setup = instance?.type?.setup || null;
    let context = createContext(instance);
    if (setup) {
        const res = setup(instance.props, context);
        if(isObject(res)) {
            instance.setupState = res;
        } else if(isFunction(res)) {
            instance.render = res;
        } else {
            return console.warn('the return value of setup should be a function or object!');
        }
    }
    finishComponentSetup(instance);
    // instance.render(instance.proxy);
}
// 数据改变重新触发render函数
export function setupRenderEffect(instance) {
    effect(function() {
        // 判断是不是第一次加载
        if(!instance.isMounted) {
            instance.render.call(instance.proxy, instance.proxy);
        }
    })
}

export function createContext(instance) {
    return {
        props: instance.props,
        slots: instance.slots,
        emits: () => {},
        attrs: instance.attrs,
        expose: () => {}
    }
}

function finishComponentSetup(instance) {
    let Component = instance.vnode.component;
    console.log(Component, instance, 5555);
    if(!instance.render) {
        if(!Component.render && Component.template) {
            // 模板编译
            // Component.render = 
        }
        instance.render = Component.render;
    }
}