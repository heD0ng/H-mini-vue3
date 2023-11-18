import { hasOwn } from "../../shared/src/index";

export const componentPublicInstance: any = {
    get(target, key) {
        const instance = target._;
        const {props, setupState, data} = instance;
        if(hasOwn(setupState, key)) {
            return setupState[key];
        } else if (hasOwn(props, key)) {
            return props[key];
        } else if(hasOwn(data, key)) {
            return data[key];
        }
    },
    set(target, key, value) {

    }
}