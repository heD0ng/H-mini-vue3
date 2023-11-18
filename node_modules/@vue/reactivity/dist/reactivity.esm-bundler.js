var isObject = function (data) {
    return data && typeof data === 'object';
};
var isEqual = function (val, oldVal) {
    return val === oldVal;
};
var isArray = function (val) {
    return Array.isArray(val);
};
// 判断数组的索引
var isIntegerKey = function (key) { return '' + parseInt(key) === key; };
var hasOwn = function (target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
};

// 操作符
var TrackOpTypes;
(function (TrackOpTypes) {
    TrackOpTypes["GET"] = "get";
    TrackOpTypes["HAS"] = "has";
    TrackOpTypes["ITERATE"] = "iterate";
})(TrackOpTypes || (TrackOpTypes = {}));
var TriggerOpTypes;
(function (TriggerOpTypes) {
    TriggerOpTypes["SET"] = "set";
    TriggerOpTypes["ADD"] = "add";
    TriggerOpTypes["DELETE"] = "delete";
    TriggerOpTypes["CLEAR"] = "clear";
})(TriggerOpTypes || (TriggerOpTypes = {}));

var activeEffect = null;
var effectList = [];
/**
 *
 * @param fn
 * @param options : {lazy: true}-lazy为true，默认不执行
 * @returns
 */
var createReactiveEffect = function (fn, options) {
    return new ReactiveEffect(fn, options);
};
var effect = function (fn, options) {
    if (options === void 0) { options = {}; }
    var effect = createReactiveEffect(fn, options);
    if (!options.lazy) {
        effect.run();
    }
    return effect;
};
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, options) {
        this.fn = fn;
        this.deps = [];
        this.options = options;
    }
    ReactiveEffect.prototype.run = function () {
        // state.a++: 避免递归收集
        // 当前的实例effect
        if (!effectList.includes(this)) {
            try {
                // 入栈
                activeEffect = this;
                effectList.push(activeEffect);
                console.log(effectList);
                // cleanActiveEffectDeps(activeEffect);
                return this.fn();
            }
            finally {
                // 出栈
                effectList.pop();
                activeEffect = effectList[effectList.length - 1] || null;
            }
        }
    };
    return ReactiveEffect;
}());
var targetMap = new WeakMap();
function track(target, key, type) {
    if (!activeEffect)
        return;
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    var effectSet = depsMap.get(key);
    if (!effectSet) {
        effectSet = new Set();
        depsMap.set(key, effectSet);
    }
    if (!effectSet.has(activeEffect)) {
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
var trigger = function (target, key, type, value, oldVal) {
    if (type === void 0) { type = 'get'; }
    var depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    var effectSet = depsMap.get(key);
    if (effectSet) {
        if (isArray(target) && key === 'length') {
            // state.list.length = 1; [1,2,3] => 1 => 2、3改变了，所以需要重新触发effect
            depsMap.forEach(function (val, mapKey) {
                if (mapKey === 'length' || mapKey >= value) {
                    val.forEach(function (cur) {
                        if (cur !== activeEffect) {
                            console.log(cur);
                            cur.run();
                        }
                    });
                }
            });
        }
        else {
            switch (type) {
                case TriggerOpTypes.ADD:
                    // state.list[100] = 100;
                    // 索引变化 => 长度变化;
                    if (isArray(target) && isIntegerKey(key)) {
                        depsMap.get('length').forEach(function (cur) {
                            if (cur !== activeEffect) {
                                console.log(cur);
                                cur.run();
                            }
                        });
                    }
                    break;
                case TriggerOpTypes.SET:
                    // 修改值：state.list[4] = 4;
                    depsMap.get(key).forEach(function (cur) {
                        if (cur !== activeEffect) {
                            console.log(cur);
                            cur.run();
                        }
                    });
            }
        }
    }
    console.log(targetMap);
};

/**
 * 示例代码：const state = reactive({list: [1,2,3], {name: {a: 1}}})
 */
var reactiveHandler = {
    get: function (target, key, receiver) {
        if (key === "__isProxy__")
            return true;
        var res = Reflect.get(target, key, receiver);
        // 收集依赖
        track(target, key, TrackOpTypes.GET);
        if (isObject(res))
            return reactive(res);
        return res;
    },
    set: function (target, key, value, newValue) {
        var oldVal = target[key];
        var res = Reflect.set(target, key, value, newValue);
        // 触发回调
        // 前者：修改；后者：新增
        var hasKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
        if (!hasKey) {
            // 新增/删减
            trigger(target, key, TriggerOpTypes.ADD);
        }
        else {
            // 修改
            if (!isEqual(res, oldVal)) {
                trigger(target, key, TriggerOpTypes.SET);
            }
        }
        if (isObject(res))
            reactive(res);
    }
};
var shallowReactiveHandler = {};
var readonlyHandler = {
    get: function (target, key, receiver) {
        var res = Reflect.get(target, key, receiver);
        if (isObject(res))
            return readonly(res);
        return res;
    },
    set: function () {
        console.error('readonly can not be set');
    }
};
var shallowReadonlyHandler = {};

// import { isObject } from "@vue/shared";
var reactive = function (target) {
    return createReactiveObj(target, false, reactiveHandler);
};
var shallowReactive = function (target) {
    return createReactiveObj(target, false, shallowReactiveHandler);
};
var readonly = function (target) {
    return createReactiveObj(target, true, readonlyHandler);
};
var shallowReadonly = function (target) {
    return createReactiveObj(target, true, shallowReadonlyHandler);
};
/**
 *
 * @param target: 代理的数据
 * @param isReadonly：是否只读
 * @param baseHandler：Proxy对应的handler对象
 */
var reactiveMap = new WeakMap();
var readonlyMap = new WeakMap();
function createReactiveObj(target, isReadonly, baseHandler) {
    // 利用get属性也可以处理递归;
    // if(target.__isProxy__) return target;
    if (!isObject(target)) {
        return target;
    }
    var proxyMap = isReadonly ? readonlyMap : reactiveMap;
    if (proxyMap.get(target)) {
        return proxyMap.get(target);
    }
    var proxy = new Proxy(target, baseHandler);
    proxyMap.set(target, proxy);
    return proxy;
}

function toReactive(data) {
    if (isObject(data)) {
        return reactive(data);
    }
    return data;
}
var Ref = /** @class */ (function () {
    function Ref(data) {
        this.rawData = data;
        this._value = toReactive(data);
    }
    Object.defineProperty(Ref.prototype, "value", {
        get: function () {
            track(this, 'value');
            return this._value;
        },
        set: function (newVal) {
            if (!isEqual(this.rawData, newVal)) {
                this._value = toReactive(newVal);
                trigger(this, 'value', TriggerOpTypes.SET, newVal, this.rawData);
                this.rawData = newVal;
            }
        },
        enumerable: false,
        configurable: true
    });
    return Ref;
}());
var ref = function (data) {
    return new Ref(data);
};
var RefImpl = /** @class */ (function () {
    function RefImpl(target, key) {
        this.target = target;
        this.key = key;
        this.target = target;
        this.key = key;
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            // track(this.target[this.key], 'value')
            return this.target[this.key];
        },
        set: function (newVal) {
            this.target[this.key] = newVal;
            // trigger(this.target[this.key], 'value', TriggerOpTypes.SET, newVal);
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());
var toRef = function (target, key) {
    return new RefImpl(target, key);
};
var toRefs = function (target) {
    var res = null;
    if (!target.__isProxy__) {
        console.warn('toRefs() need a reactive object');
    }
    res = isArray(target) ? new Array(target.length) : {};
    for (var key in target) {
        res[key] = toRef(target, key);
    }
    return res;
};

export { effect, reactive, readonly, ref, shallowReactive, shallowReadonly, toRef, toRefs };
//# sourceMappingURL=reactivity.esm-bundler.js.map
