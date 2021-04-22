import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';
import axios, { AxiosRequestConfig } from 'axios';

export { KeyValues, KeyValues3 };

export async function LoadKeyValues(url: string, config?: AxiosRequestConfig) {
    const res = await axios.get<string>(url, config);
    return KeyValues.Parse(res.data);
}

export async function LoadKeyValues3(url: string, config?: AxiosRequestConfig) {
    const res = await axios.get<string>(url, config);
    return KeyValues3.Parse(res.data);
}
