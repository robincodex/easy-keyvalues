export interface KeyValuesAdapter {
    readFile(path: string, encoding?: string): Promise<string>;
    writeFile(path: string, data: string, encoding?: string): Promise<void>;
    resolvePath(filename: string, basePath: string): string;
    createKeyValuesID(): string;
}

let defaultAdapter: KeyValuesAdapter = {
    async readFile() {
        return '';
    },
    async writeFile() {},
    resolvePath(filename: string, basePath: string) {
        return filename + basePath;
    },
    createKeyValuesID() {
        return '';
    },
};

export function setKeyValuesAdapter(adapter: KeyValuesAdapter): void {
    defaultAdapter = adapter;
}

export function getKeyValuesAdapter(): KeyValuesAdapter {
    return defaultAdapter;
}
