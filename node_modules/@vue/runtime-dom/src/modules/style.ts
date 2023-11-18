import { hasOwn } from './../../../shared/src/index';
export const patchStyle = (el, newVal: any = {}, oldVal: any = {}) => {
    for(const key in oldVal) {
        if(!newVal.hasOwn(key)){
            // 老的有，新的没有 => 老的被删除
            el.style[key] = ''
        }
    }
    for(const key in newVal) {
        // 直接新增或替换
        el.style[key] = newVal[key]
    }
}