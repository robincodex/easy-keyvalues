/// <reference types="@types/node" />
import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';
export { KeyValues, KeyValues3 };
export declare function LoadKeyValues(file: string, encoding?: BufferEncoding): Promise<KeyValues>;
export declare function LoadKeyValuesSync(file: string, encoding?: BufferEncoding): KeyValues;
export declare function SaveKeyValues(file: string, kv: KeyValues, encoding?: BufferEncoding): Promise<void>;
export declare function SaveKeyValuesSync(file: string, kv: KeyValues, encoding?: BufferEncoding): Promise<void>;
export declare function LoadKeyValues3(file: string, encoding?: BufferEncoding): Promise<KeyValues3>;
export declare function LoadKeyValues3Sync(file: string, encoding?: BufferEncoding): KeyValues3;
export declare function SaveKeyValues3(file: string, kv: KeyValues3, encoding?: BufferEncoding): Promise<void>;
export declare function SaveKeyValues3Sync(file: string, kv: KeyValues3, encoding?: BufferEncoding): Promise<void>;
