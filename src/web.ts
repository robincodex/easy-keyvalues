import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';

export { KeyValues, KeyValues3 };

export function LoadKeyValues(body: string) {
    return KeyValues.Parse(body);
}

export function LoadKeyValues3(body: string) {
    return KeyValues3.Parse(body);
}
