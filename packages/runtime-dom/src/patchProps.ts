import {patchAttr,patchClass, patchEvent, patchStyle} from './modules/index';
export const patchProp = (el, key, newVal, oldVal) => {
    switch (key) {
        case 'class':{
            patchClass(el, newVal)
            break;
        }
        case 'style': {
            break;
        }
        default:{
            if (/^on[A-Z]/.test(key)) {
                patchEvent(el, key, newVal);
            } else {
                patchAttr(el, key, newVal);
            }
            break;
        }
            
    }
}