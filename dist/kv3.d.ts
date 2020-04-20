export declare enum KeyValues3Type {
    Comment = 0,
    EndOfLineComment = 1,
    MultiLineComment = 2,
    KeyValue_Boolean = 3,
    KeyValue_Int = 4,
    KeyValue_Double = 5,
    KeyValue_String = 6,
    KeyValue_MultiLineString = 7,
    KeyValue_Resource = 8,
    KeyValue_Deferred_Resource = 9,
    KeyValue_Array = 10,
    KeyValue_Object = 11,
    Header = 12
}
export declare type KeyValues3 = {
    Type: KeyValues3Type;
    Key: string;
    Value: string | KeyValues3[];
};
/**
 * Read from KeyValues file
 * @param path A file path of KeyValues
 * @param encoding Default utf8
 */
export declare function readFromFile(path: string, encoding?: string): Promise<KeyValues3[]>;
/**
 * Read from KeyValues format
 * @param content A string of KeyValues format
 */
export declare function readFromString(content: string): Promise<KeyValues3[]>;
declare const _default: {
    readFromFile: typeof readFromFile;
    readFromString: typeof readFromString;
    KeyValues3Type: typeof KeyValues3Type;
};
export default _default;
