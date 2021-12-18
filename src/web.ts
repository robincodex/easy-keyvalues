import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';
import axios, { AxiosRequestConfig } from 'axios';
import { KeyValuesComments, KeyValues3Comments } from './Comments';

export { KeyValues, KeyValues3, KeyValuesComments, KeyValues3Comments };

export async function LoadKeyValues(url: string, config?: AxiosRequestConfig) {
    if (!config) {
        config = {};
    }
    config.responseType = 'text';
    if (typeof config.proxy === 'undefined') {
        config.proxy = false;
    }
    const res = await axios.get<string>(url, config);
    return KeyValues.Parse(res.data);
}

export async function LoadKeyValues3(url: string, config?: AxiosRequestConfig) {
    if (!config) {
        config = {};
    }
    config.responseType = 'text';
    if (typeof config.proxy === 'undefined') {
        config.proxy = false;
    }
    const res = await axios.get<string>(url, config);
    return KeyValues3.Parse(res.data);
}
