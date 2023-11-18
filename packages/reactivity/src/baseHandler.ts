/**
 * 示例代码：const state = reactive({list: [1,2,3], {name: {a: 1}}})
 */
import { isObject, isEqual, isArray, isIntegerKey, hasOwn } from './../../shared/src/index';
import { reactive, readonly } from './reactive';
import { TrackOpTypes, TriggerOpTypes } from './operations';
import {track, trigger} from './effect'
export const reactiveHandler = {
    get(target, key, receiver) {
        if(key === "__isProxy__") return true;
        const res = Reflect.get(target, key, receiver)
        // 收集依赖
        track(target, key, TrackOpTypes.GET);
        if(isObject(res)) return reactive(res);
        return res;
    },
    set(target, key, value, newValue) {
        const oldVal = target[key]
        const res = Reflect.set(target, key, value, newValue);
        // 触发回调
        // 前者：修改；后者：新增
        const hasKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
        if(!hasKey) {
            // 新增/删减
            trigger(target, key, TriggerOpTypes.ADD)
        } else {
            // 修改
            if(!isEqual(res, oldVal)) {
                trigger(target, key, TriggerOpTypes.SET)
            }
            
        }
        if(isObject(res)) reactive(res);
    }
};
export const shallowReactiveHandler = {};
export const readonlyHandler = {
    get(target, key, receiver){
        const res = Reflect.get(target, key, receiver);
        if(isObject(res)) return readonly(res);
        return res;
    },
    set() {
        console.error('readonly can not be set')
    }
};
export const shallowReadonlyHandler = {};