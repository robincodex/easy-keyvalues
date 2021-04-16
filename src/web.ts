import KeyValues from './KeyValues';

export { KeyValues };

export function LoadKeyValues(body: string) {
    return KeyValues.Parse(body);
}
