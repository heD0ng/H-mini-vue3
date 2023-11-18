import { isArray, isEqual, isObject } from "../../shared/src/index";
import { track, trigger } from "./effect";
import { TriggerOpTypes } from "./operations";
import { reactive } from "./reactive";


function toReactive(data) {
    if(isObject(data)) {
        return reactive(data);
    }
    return data;
}
class Ref {
    rawData: any;
    _value: any;
    constructor(data) {
        this.rawData = data;
        this._value = toReactive(data);
    }
    get value() {
        track(this,'value', 'get')
        return this._value;
    }
    set value(newVal) {
        if(!isEqual(this.rawData, newVal)){
            this._value = toReactive(newVal);
            trigger(this, 'value', TriggerOpTypes.SET, newVal, this.rawData)
            this.rawData = newVal;
        }
    }
}
export const ref = (data) => {
    return new Ref(data);
}

class RefImpl {
    constructor(public target, public key) {
        this.target = target;
        this.key = key;
    }
    get value() {
        // track(this.target[this.key], 'value')
        return this.target[this.key];
    }
    set value(newVal) {
        this.target[this.key] = newVal;
        // trigger(this.target[this.key], 'value', TriggerOpTypes.SET, newVal);
    }
}

export const toRef = (target, key) => {
    return new RefImpl(target, key)
}
export const toRefs = (target) => {
    let res: any = null;
    if(!target.__isProxy__) {
        console.warn('toRefs() need a reactive object');
    };
    res = isArray(target)? new Array(target.length) : {};
    for(const key in target) {
        res[key] = toRef(target, key);
    }
    return res;
}