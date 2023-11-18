export const isObject = (data) => {
    return data && typeof data === 'object';
}

export const isEqual = (val, oldVal) => {
    return val === oldVal;
}

export const isArray = (val) => {
    return Array.isArray(val)
}

export const isFunction = (val) => {
    return typeof val === 'function';
}
export const isNumber = (val) => {
    return typeof val === 'number';
}
export const isString = (val) => {
    return typeof val === 'string';
}
// 判断数组的索引
export const isIntegerKey = (key) => '' + parseInt(key) === key;

export const hasOwn = (target, key) => {
    return Object.prototype.hasOwnProperty.call(target, key);
}

export * from './shapeFlags';