export declare class KeyValuesComments {
    protected comments: string[];
    protected endOfLineComment: string;
    constructor(comments?: string[], endOfLineComment?: string);
    GetComments(): string[];
    HasComments(): boolean;
    SetComments(list: string[]): this;
    AppendComment(text: string): this;
    SetEndOfLineComment(text: string): this;
    GetEndOfLineComment(): string;
    HasEndOfLineComment(): boolean;
}
export declare class KeyValues3Comments {
    protected comments: string[];
    protected endOfLineComment: string;
    constructor(comments?: string[], endOfLineComment?: string);
    GetComments(): string[];
    HasComments(): boolean;
    SetComments(list: string[]): this;
    AppendComment(text: string): this;
    SetEndOfLineComment(text: string): this;
    GetEndOfLineComment(): string;
    HasEndOfLineComment(): boolean;
    Format(tab?: string): string;
}
