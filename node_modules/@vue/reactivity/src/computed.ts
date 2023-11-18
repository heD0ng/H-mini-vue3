import { isFunction } from "../../shared/src/index";
import { effect, track, trigger } from "./effect";
import { TriggerOpTypes } from "./operations";

class ComputedImp {
    getter: Function;
    setter: Function;
    _dirty: Boolean;
    _value: any;
    effect: any
    constructor(getter, setter) {
        this.getter = getter;
        this.setter = setter;
        this._dirty = true;
        this._value = null;
        this.effect = effect(getter, {
            lazy: true,
            scheduler: () => {
                if(!this._dirty) {
                    this._dirty = true;
                    trigger(this, 'value', TriggerOpTypes.SET);
                }
            }
        })
    }

    get value() {
        track(this, 'value', 'get');
        if(this._dirty) {
            this._value = this.effect.run();
            this._dirty = false;
        }
        return this._value
    }
}

export const computed = (getterOrFn) => {
    let getter = null;
    let setter = null;
    if(isFunction(getterOrFn)) {
        getter = getterOrFn;
        setter = () => {
            console.log('setter');
        }
    } else {
        getter = getterOrFn.get;
        setter = getterOrFn.set;
    }
    return new ComputedImp(getter, setter);
}