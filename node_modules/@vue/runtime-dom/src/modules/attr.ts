export const patchAttr = (el, key, value = '') => {
    if(!value) el.removeAttribute(key); 
    el.setAttribute(key, value);
}