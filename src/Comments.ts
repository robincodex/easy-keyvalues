export class KeyValuesComments {
    constructor(
        protected comments: string[] = [],
        protected endOfLineComment: string = ''
    ) {}

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

export class KeyValues3Comments extends KeyValuesComments {}
