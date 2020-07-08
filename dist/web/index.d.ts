export declare enum KeyValuesType {
    Comment = 0,
    EndOfLineComment = 1,
    KeyValue = 2,
    BaseStatement = 3
}
/**
 * When the key is "#base", it's a base statement. Example: #base "file path"
 */
export declare type KeyValues = {
    Type: KeyValuesType;
    Key: string;
    Value: string | KeyValues[];
};
export declare const emptyKeyValues: KeyValues;
export declare function NewKeyValues(Key: string, Value: string | KeyValues[]): KeyValues;
/**
 * Read from KeyValues format
 * @param content A string of KeyValues format
 */
export declare function loadFromString(content: string): KeyValues[];
/**
 * Format KeyValues object to string
 * @param kvList KeyValues list
 * @param tab spaces
 */
export declare function formatKeyValues(kvList: KeyValues[], tab?: string): string;
declare const _default: {
    loadFromString: typeof loadFromString;
    formatKeyValues: typeof formatKeyValues;
    KeyValuesType: typeof KeyValuesType;
};
export default _default;
