import { isArray, isIntegerKey } from './../../shared/src/index';
import {TriggerOpTypes} from './operations';
let activeEffect = null;
let effectList = []

/**
 * 
 * @param fn 
 * @param options : {lazy: true}-lazy为true，默认不执行
 * @returns 
 */
const createReactiveEffect = (fn, options) => {
    return new ReactiveEffect(fn, options);
}
export const effect = (fn, options:any = {}) => {
    const effect = createReactiveEffect(fn, options);
    if(!options.lazy){
        effect.run();
    }
    
    return effect;
}


class ReactiveEffect {
    fn: Function;
    options: any;
    deps: Array<any>;
    constructor(fn, options){
        this.fn = fn;
        this.deps = []
        this.options = options;
    }
    run() {
        // state.a++: 避免递归收集
        // 当前的实例effect
        if(!effectList.includes(this)) {
            try {
                // 入栈
                activeEffect = this;
                effectList.push(activeEffect);
                console.log(effectList);
                // cleanActiveEffectDeps(activeEffect);
                return this.fn()
            } finally  {
                // 出栈
                effectList.pop()
                activeEffect = effectList[effectList.length - 1] || null;
            }
        }
    }
}

function cleanActiveEffectDeps(activeEffect) {
    const {deps} = activeEffect;
    for(const dep of deps) {
        dep.delete(activeEffect)
    }

    activeEffect.deps.length = 0;
}

let targetMap = new WeakMap();
export function track(target, key, type?) {
    if(!activeEffect) return;

    let depsMap = targetMap.get(target);
    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap);
        
    }
    let effectSet = depsMap.get(key)
    if(!effectSet) {
        effectSet = new Set();
        depsMap.set(key, effectSet);
    }
    if(!effectSet.has(activeEffect)){
        effectSet.add(activeEffect);
    }
}
/**
 * 
 * @param target 
 * @param key 
 * @param type 
 * @param value 
 * @param oldVal 
 * @returns 
 * depsMap: {
 *  0: [e1, e2],
 *  length: [e2, e3]
 * }
 */
export const trigger = (target, key, type='get', value?, oldVal?) => {
    const depsMap = targetMap.get(target);
    if(!depsMap) return;
    const effectSet:any = depsMap.get(key);
    if(effectSet) {
        if(isArray(target) && key === 'length') {
            // state.list.length = 1; [1,2,3] => 1 => 2、3改变了，所以需要重新触发effect
            depsMap.forEach((val, mapKey) => {
                if(mapKey === 'length' || mapKey >= value) {
                    val.forEach(cur => {
                        if(cur !== activeEffect) {
                            console.log(cur);
                            cur.run();
                        }
                    })
                }
            })
        } else {
            // 深克隆
            const tmp: any= new Set(effectSet);
            switch(type) {
                case TriggerOpTypes.ADD:
                    // state.list[100] = 100;
                    // 索引变化 => 长度变化;
                    if(isArray(target) && isIntegerKey(key)) {
                        depsMap.get('length').forEach(cur => {
                            if(cur !== activeEffect) {
                                console.log(cur);
                                cur.run();
                            }
                        })
                    }
                    break;
                case TriggerOpTypes.SET:
                    // 修改值：state.list[4] = 4;
                    depsMap.get(key).forEach(cur => {
                        if(cur !== activeEffect) {
                            console.log(cur);
                            cur.run();
                        }
                    })
            }
        }
    }
    console.log(targetMap);
}