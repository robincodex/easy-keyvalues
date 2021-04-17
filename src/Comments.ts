export class KeyValuesComments {
    constructor(protected comments: string[] = [], protected endOfLineComment: string = '') {}

    public GetComments(): string[] {
        return this.comments;
    }

    public HasComments() {
        return this.comments.length > 0;
    }

    public SetComments(list: string[]) {
        for (const v of list) {
            if (v.includes('\n')) {
                throw Error('The comment only allowed one line');
            }
        }
        this.comments = list;
        return this;
    }

    public AppendComment(text: string) {
        if (text.includes('\n')) {
            throw Error('The comment only allowed one line');
        }
        this.comments.push(text);
        return this;
    }

    public SetEndOfLineComment(text: string) {
        if (text.includes('\n')) {
            throw Error('The comment only allowed one line');
        }
        this.endOfLineComment = text;
        return this;
    }

    public GetEndOfLineComment() {
        return this.endOfLineComment;
    }

    public HasEndOfLineComment() {
        return this.endOfLineComment.length > 0;
    }
}

export class KeyValues3Comments {
    constructor(protected comments: string[] = [], protected endOfLineComment: string = '') {}

    public GetComments(): string[] {
        return this.comments;
    }

    public HasComments() {
        return this.comments.length > 0;
    }

    public SetComments(list: string[]) {
        this.comments = list;
        return this;
    }

    public AppendComment(text: string) {
        this.comments.push(text);
        return this;
    }

    public SetEndOfLineComment(text: string) {
        if (text.includes('\n')) {
            throw Error('The end of line comment only allowed one line');
        }
        this.endOfLineComment = text;
        return this;
    }

    public GetEndOfLineComment() {
        return this.endOfLineComment;
    }

    public HasEndOfLineComment() {
        return this.endOfLineComment.length > 0;
    }

    public Format(tab: string = ''): string {
        let text = '';
        for (const comment of this.comments) {
            if (comment.includes('\n')) {
                const lines = comment.split('\n').map((v) => v.trimStart());
                text += `${tab}/*\n`;
                if (lines.some((v) => v.startsWith('*'))) {
                    text += lines
                        .map((v) => {
                            if (v.startsWith('*')) {
                                v = '* ' + v.slice(1).trimStart();
                            } else {
                                v = '* ' + v.trimStart();
                            }
                            return `${tab} ` + v + '\n';
                        })
                        .join('');
                    text += `${tab} */\n`;
                } else {
                    text += lines.map((v) => `${tab}` + v + '\n').join('');
                    text += `${tab}*/\n`;
                }
            } else {
                text += `${tab}// ${comment.trimStart()}\n`;
            }
        }
        return text;
    }
}
