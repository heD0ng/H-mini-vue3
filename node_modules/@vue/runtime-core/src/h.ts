import { isObject } from "../../shared/src/index";
import { createVNode, isVnode } from "./createVNode";

export function h(type, propsOrChildren, children=null) {
    const l = arguments.length;
    if(l == 2) {
        // h('div', {class:a}) || h('div', h('span', {class:b})) || 
        if(isObject(propsOrChildren)) {
            if(isVnode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren])
            }
            // props without children
            return createVNode(type, propsOrChildren);
        } else {
            return createVNode(type, null, propsOrChildren)
        }
    } else {
        if(l > 3) {
            children = Array.prototype.slice.call(arguments, 2)
        } else if( l === 3 && isVnode(children)) {
            children = [children]
        }
        return createVNode(type, propsOrChildren, children);
    }
}