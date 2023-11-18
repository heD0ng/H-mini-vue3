import { isArray, isObject } from './../../shared/src/index';
import { ShapeFlags } from "../../shared/src/shapeFlags";
import { isString } from "../../shared/src/index";
export function createVNode(type, props, children = null) {
    let shapeFlag = 0;
	// div\p
	if(isString(type)) {
		shapeFlag = ShapeFlags.ELEMENT;
	} else if(isObject(type)) {
		shapeFlag = ShapeFlags.STATEFUL_COMPONENT;
	} else {
        shapeFlag = 0;
    }

    const vnode = {
        type,
        props,
        children,
        key: props?.key,
        shapeFlag,
        _isVnode: true
    }
    normalizeChildren(vnode, children);
    return vnode;
}

function normalizeChildren (vnode, children) {
    let type = 0;
    if(children) {
        if(isArray(children)) {
            type = ShapeFlags.ARRAY_CHILDREN;
        } else if(isString(children)) {
            type = ShapeFlags.TEXT_CHILDREN;
        } else {
            console.log(children);
        }
    }
    vnode.shapeFlag = vnode.shapeFlag | type;

}


export function isVnode(node) {
    return !!node._isVnode;
}