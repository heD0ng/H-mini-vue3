var isObject = function (data) {
    return data && typeof data === 'object';
};
var isEqual = function (val, oldVal) {
    return val === oldVal;
};
var isArray = function (val) {
    return Array.isArray(val);
};
var isFunction = function (val) {
    return typeof val === 'function';
};
var isNumber = function (val) {
    return typeof val === 'number';
};
var isString = function (val) {
    return typeof val === 'string';
};
// 判断数组的索引
var isIntegerKey = function (key) { return '' + parseInt(key) === key; };
var hasOwn = function (target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
};

export { hasOwn, isArray, isEqual, isFunction, isIntegerKey, isNumber, isObject, isString };
//# sourceMappingURL=shared.esm-bundler.js.map
