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
export declare const emptyKeyValues: {
    Type: KeyValuesType;
    Key: string;
    Value: string;
};
export declare function NewKeyValues(Key: string, Value: string | KeyValues[]): {
    Type: KeyValuesType;
    Key: string;
    Value: string | KeyValues[];
};
/**
 * Read from KeyValues file
 * @param path A file path of KeyValues
 * @param encoding Default utf8
 */
export declare function readFromFile(path: string, encoding?: string): Promise<KeyValues[]>;
/**
 * Read from KeyValues format
 * @param content A string of KeyValues format
 */
export declare function readFromString(content: string): Promise<KeyValues[]>;
/**
 * Format KeyValues object to string
 * @param kvList KeyValues list
 * @param tab spaces
 */
export declare function formatKeyValues(kvList: KeyValues[], tab?: string): string;
declare const _default: {
    readFromFile: typeof readFromFile;
    readFromString: typeof readFromString;
    formatKeyValues: typeof formatKeyValues;
    KeyValuesType: typeof KeyValuesType;
};
export default _default;
