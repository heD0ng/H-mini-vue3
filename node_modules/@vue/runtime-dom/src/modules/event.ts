export const patchEvent = (el, key, fn) => {
    // vei = vue event invoker
    if(!el._vei) {
        el._vei = {};
    }
    const invokers = el._vei || {};
    if(!fn) {
        if(invokers[key]) {
            const name = key.slice(2).toLowerCase();
            el.removeEventListener(name, invokers[key]);
            delete invokers[key];
        }
    } else {
        if(!invokers[key]) {
            const name = key.slice(2).toLowerCase();
            let invoke = invokers[key] = createInvoker(fn);
            el.addEventListener(name, invoke)
        } else {
            // value保存的是上一次的函数;
            invokers[key].value = fn;
        }
    }
}

function createInvoker(fn) {
    const tmp = (e) => {
        tmp.value(e);
        // fn.call(e);
    }
    tmp.value = fn;
    return tmp;
}