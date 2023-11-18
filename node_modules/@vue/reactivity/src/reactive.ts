// import { isObject } from "@vue/shared";
import { isObject } from "../../shared/src/index";
import {reactiveHandler, shallowReactiveHandler, readonlyHandler, shallowReadonlyHandler} from './baseHandler'

export const reactive = (target: any) => {
    return createReactiveObj(target, false, reactiveHandler)
}
export const shallowReactive = (target: any) => {
    return createReactiveObj(target, false, shallowReactiveHandler)
}

export const readonly = (target) => {
    return createReactiveObj(target, true, readonlyHandler)
}
export const shallowReadonly = (target: any) => {
    return createReactiveObj(target, true, shallowReadonlyHandler)
}

/**
 * 
 * @param target: 代理的数据
 * @param isReadonly：是否只读 
 * @param baseHandler：Proxy对应的handler对象
 */
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap()
function createReactiveObj(target, isReadonly, baseHandler) {
    // 利用get属性也可以处理递归;
    // if(target.__isProxy__) return target;
    if(!isObject(target)) {
        return target;
    }
    const proxyMap = isReadonly ? readonlyMap : reactiveMap;
    if(proxyMap.get(target)) {
        return proxyMap.get(target);
    }
    const proxy = new Proxy(target, baseHandler);
    proxyMap.set(target, proxy);
    return proxy;
}