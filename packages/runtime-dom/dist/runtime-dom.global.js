var VueRuntimeDom = (function (exports) {
    'use strict';

    var patchClass = function (el, value) {
        if (!value)
            value = '';
        el.className = value;
    };

    var patchEvent = function (el, key, fn) {
        // vei = vue event invoker
        if (!el._vei) {
            el._vei = {};
        }
        var invokers = el._vei || {};
        if (!fn) {
            if (invokers[key]) {
                var name_1 = key.slice(2).toLowerCase();
                el.removeEventListener(name_1, invokers[key]);
                delete invokers[key];
            }
        }
        else {
            if (!invokers[key]) {
                var name_2 = key.slice(2).toLowerCase();
                var invoke = invokers[key] = createInvoker(fn);
                el.addEventListener(name_2, invoke);
            }
            else {
                // value保存的是上一次的函数;
                invokers[key].value = fn;
            }
        }
    };
    function createInvoker(fn) {
        var tmp = function (e) {
            tmp.value(e);
            // fn.call(e);
        };
        tmp.value = fn;
        return tmp;
    }

    var patchAttr = function (el, key, value) {
        if (value === void 0) { value = ''; }
        if (!value)
            el.removeAttribute(key);
        el.setAttribute(key, value);
    };

    var patchProp = function (el, key, newVal, oldVal) {
        switch (key) {
            case 'class': {
                patchClass(el, newVal);
                break;
            }
            case 'style': {
                break;
            }
            default: {
                if (/^on[A-Z]/.test(key)) {
                    patchEvent(el, key, newVal);
                }
                else {
                    patchAttr(el, key, newVal);
                }
                break;
            }
        }
    };

    var nodeOps = {
        createElement: function (tagName) {
            return document.createElement(tagName);
        },
        insert: function (child, parent, anchor) {
            if (anchor === void 0) { anchor = null; }
            parent.insertBefore(child, anchor);
        },
        remove: function (node) {
            var parentNode = node.parentNode;
            if (parentNode) {
                parentNode.removeChild(node);
            }
        },
        createTextNode: function (text) {
            return document.createTextNode(text);
        },
        querySelector: function (selector) {
            return document.querySelector(selector);
        },
        setElementText: function (el, text) {
            el.nodeValue = text;
        },
        parentNode: function (node) { return node.parentNode; },
        nextSibling: function (node) { return node.nextSibling; },
        setText: function (el, text) {
            el.textContent = text;
        },
    };

    var isObject = function (data) {
        return data && typeof data === 'object';
    };
    var isArray = function (val) {
        return Array.isArray(val);
    };
    var isFunction = function (val) {
        return typeof val === 'function';
    };
    var isString = function (val) {
        return typeof val === 'string';
    };
    var hasOwn = function (target, key) {
        return Object.prototype.hasOwnProperty.call(target, key);
    };

    function createVNode(type, props, children) {
        if (children === void 0) { children = null; }
        var shapeFlag = 0;
        // div\p
        if (isString(type)) {
            shapeFlag = 1 /* ShapeFlags.ELEMENT */;
        }
        else if (isObject(type)) {
            shapeFlag = 4 /* ShapeFlags.STATEFUL_COMPONENT */;
        }
        else {
            shapeFlag = 0;
        }
        var vnode = {
            type: type,
            props: props,
            children: children,
            key: props === null || props === void 0 ? void 0 : props.key,
            shapeFlag: shapeFlag
        };
        normalizeChildren(vnode, children);
        return vnode;
    }
    function normalizeChildren(vnode, children) {
        var type = 0;
        if (children) {
            if (isArray(children)) {
                type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
            }
            else if (isString(children)) {
                type = 8 /* ShapeFlags.TEXT_CHILDREN */;
            }
            else {
                console.log(children);
            }
        }
        vnode.shapeFlag = vnode.shapeFlag | type;
    }

    function apiCreateApp(render) {
        return function createApp(rootComponent, rootProps) {
            var app = {
                mount: function (container) {
                    var vnode = createVNode(rootComponent, rootProps);
                    render(vnode, container);
                    vnode._container = container;
                }
            };
            return app;
        };
    }

    var componentPublicInstance = {
        get: function (target, key) {
            var instance = target._;
            var props = instance.props, setupState = instance.setupState, data = instance.data;
            if (hasOwn(setupState, key)) {
                return setupState[key];
            }
            else if (hasOwn(props, key)) {
                return props[key];
            }
            else if (hasOwn(data, key)) {
                return data[key];
            }
        },
        set: function (target, key, value) {
        }
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

    // import { isObject } from '@vue/shared';
    function mountComponent(vnode, container) {
        var instance = vnode.component = createComponentInstance(vnode);
        return instance;
    }
    // 创建组件实例
    function createComponentInstance(vnode) {
        var instance = {
            vnode: vnode,
            type: {},
            props: {},
            attrs: {},
            setupState: {},
            ctx: {},
            proxy: {},
            // 判断是否是第一次加载
            isMounted: false
        };
        instance.ctx = { _: instance };
        return instance;
    }
    // 解析数据到组件中
    function setupComponent(instance) {
        var _a = instance.vnode, props = _a.props, children = _a.children, type = _a.type;
        instance.type = type;
        instance.props = props;
        instance.children = children;
        var isStateFul = instance.vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */;
        if (isStateFul) {
            setupStateComponent(instance);
        }
    }
    function setupStateComponent(instance) {
        var _a;
        instance.proxy = new Proxy(instance.ctx, componentPublicInstance);
        var setup = ((_a = instance === null || instance === void 0 ? void 0 : instance.type) === null || _a === void 0 ? void 0 : _a.setup) || null;
        var context = createContext(instance);
        if (setup) {
            var res = setup(instance.props, context);
            if (isObject(res)) {
                instance.setupState = res;
            }
            else if (isFunction(res)) {
                instance.render = res;
            }
            else {
                return console.warn('the return value of setup should be a function or object!');
            }
        }
        finishComponentSetup(instance);
        // instance.render(instance.proxy);
    }
    // 数据改变重新触发render函数
    function setupRenderEffect(instance) {
        effect(function () {
            // 判断是不是第一次加载
            if (!instance.isMounted) {
                instance.render.call(instance.proxy, instance.proxy);
            }
        });
    }
    function createContext(instance) {
        return {
            props: instance.props,
            slots: instance.slots,
            emits: function () { },
            attrs: instance.attrs,
            expose: function () { }
        };
    }
    function finishComponentSetup(instance) {
        var Component = instance.vnode.component;
        console.log(Component, instance, 5555);
        if (!instance.render) {
            if (!Component.render && Component.template) ;
            instance.render = Component.render;
        }
    }

    function createRender(renderOptionDom) {
        var render = function (vnode, container) {
            patch(null, vnode);
        };
        return {
            createApp: apiCreateApp(render)
        };
    }
    function patch(n1, n2, container) {
        if (!n1) {
            var instance = mountComponent(n2);
            setupComponent(instance);
            setupRenderEffect(instance);
        }
    }

    var renderOptionDom = Object.assign({}, { patchProp: patchProp }, nodeOps);
    var createApp = function (rootComponent, rootProps) {
        var app = createRender().createApp(rootComponent, rootProps);
        var mount = app.mount;
        app.mount = function (container) {
            // 先清空、后挂载
            var el = renderOptionDom.querySelector(container);
            el.innerHTML = '';
            mount(container);
        };
        return app;
    };

    exports.createApp = createApp;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=runtime-dom.global.js.map
