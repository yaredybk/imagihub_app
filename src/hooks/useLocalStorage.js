import { useState } from "react";

/**
 *
 * @param {string} key localstorage key
 * @param {Object<{init:any}>} props initializer object
 * @returns {Array<[data1:any, setData2:Function]>}
 */
export default function useLocalStorage(key = "keyname", props = { init: {} }) {
    let d = localStorage.getItem(key);
    if (d !== null) {
        d = JSON.parse(d);
    } else {
        d = props.init || {};
    }
    const [data1, setdata1] = useState(d);
    function setData2(data) {
        setdata1(data);
        localStorage.setItem(key, JSON.stringify(data));
    }
    return [data1, setData2];
}
