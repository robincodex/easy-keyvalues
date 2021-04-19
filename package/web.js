(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.web = global.web || {}, global.web.js = {})));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    var KeyValuesComments = /** @class */ (function () {
        function KeyValuesComments(comments, endOfLineComment) {
            if (comments === void 0) { comments = []; }
            if (endOfLineComment === void 0) { endOfLineComment = ''; }
            this.comments = comments;
            this.endOfLineComment = endOfLineComment;
        }
        KeyValuesComments.prototype.GetComments = function () {
            return this.comments;
        };
        KeyValuesComments.prototype.HasComments = function () {
            return this.comments.length > 0;
        };
        KeyValuesComments.prototype.SetComments = function (list) {
            var e_1, _a;
            try {
                for (var list_1 = __values(list), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                    var v = list_1_1.value;
                    if (v.includes('\n')) {
                        throw Error('The comment only allowed one line');
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (list_1_1 && !list_1_1.done && (_a = list_1.return)) _a.call(list_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.comments = list;
            return this;
        };
        KeyValuesComments.prototype.AppendComment = function (text) {
            if (text.includes('\n')) {
                throw Error('The comment only allowed one line');
            }
            this.comments.push(text);
            return this;
        };
        KeyValuesComments.prototype.SetEndOfLineComment = function (text) {
            if (text.includes('\n')) {
                throw Error('The comment only allowed one line');
            }
            this.endOfLineComment = text;
            return this;
        };
        KeyValuesComments.prototype.GetEndOfLineComment = function () {
            return this.endOfLineComment;
        };
        KeyValuesComments.prototype.HasEndOfLineComment = function () {
            return this.endOfLineComment.length > 0;
        };
        return KeyValuesComments;
    }());
    var KeyValues3Comments = /** @class */ (function () {
        function KeyValues3Comments(comments, endOfLineComment) {
            if (comments === void 0) { comments = []; }
            if (endOfLineComment === void 0) { endOfLineComment = ''; }
            this.comments = comments;
            this.endOfLineComment = endOfLineComment;
        }
        KeyValues3Comments.prototype.GetComments = function () {
            return this.comments;
        };
        KeyValues3Comments.prototype.HasComments = function () {
            return this.comments.length > 0;
        };
        KeyValues3Comments.prototype.SetComments = function (list) {
            this.comments = list;
            return this;
        };
        KeyValues3Comments.prototype.AppendComment = function (text) {
            this.comments.push(text);
            return this;
        };
        KeyValues3Comments.prototype.SetEndOfLineComment = function (text) {
            if (text.includes('\n')) {
                throw Error('The end of line comment only allowed one line');
            }
            this.endOfLineComment = text;
            return this;
        };
        KeyValues3Comments.prototype.GetEndOfLineComment = function () {
            return this.endOfLineComment;
        };
        KeyValues3Comments.prototype.HasEndOfLineComment = function () {
            return this.endOfLineComment.length > 0;
        };
        KeyValues3Comments.prototype.Format = function (tab) {
            var e_2, _a;
            if (tab === void 0) { tab = ''; }
            var text = '';
            try {
                for (var _b = __values(this.comments), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var comment = _c.value;
                    if (comment.includes('\n')) {
                        var lines = comment.split('\n').map(function (v) { return v.trimStart(); });
                        text += tab + "/*\n";
                        if (lines.some(function (v) { return v.startsWith('*'); })) {
                            text += lines
                                .map(function (v) {
                                if (v.startsWith('*')) {
                                    v = v.trimStart();
                                }
                                else {
                                    v = '* ' + v.trimStart();
                                }
                                return tab + " " + v + '\n';
                            })
                                .join('');
                            text += tab + " */\n";
                        }
                        else {
                            text += lines.map(function (v) { return "" + tab + v + '\n'; }).join('');
                            text += tab + "*/\n";
                        }
                    }
                    else {
                        text += tab + "// " + comment.trimStart() + "\n";
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return text;
        };
        return KeyValues3Comments;
    }());

    var KeyValuesRootKey = '__KeyValues_Root__';
    var KeyValues = /** @class */ (function () {
        function KeyValues(Key, defaultValue) {
            this.Key = Key;
            /**
             * Comment
             */
            this.Comments = new KeyValuesComments();
            this.SetValue(defaultValue || '');
        }
        /**
         * The parent of this KeyValues
         */
        KeyValues.prototype.GetParent = function () {
            return this.parent;
        };
        /**
         * Return true that the KeyValues is root.
         */
        KeyValues.prototype.IsRoot = function () {
            return this.Key === KeyValuesRootKey;
        };
        /**
         * The key is #base?
         */
        KeyValues.prototype.IsBase = function () {
            return this.Key === '#base';
        };
        /**
         * The children of this KeyValues,
         * if no children then return empty array.
         */
        KeyValues.prototype.GetChildren = function () {
            return this.children || [];
        };
        KeyValues.prototype.GetChildCount = function () {
            return this.GetChildren().length;
        };
        KeyValues.prototype.GetFirstChild = function () {
            return this.GetChildren()[0];
        };
        KeyValues.prototype.GetLastChild = function () {
            return this.GetChildren()[this.GetChildCount() - 1];
        };
        /**
         * Create a KeyValues to children and return it.
         */
        KeyValues.prototype.CreateChild = function (key, value) {
            var kv = new KeyValues(key, value);
            this.Append(kv);
            return kv;
        };
        /**
         * The value of this KeyValues,
         * if no value then return empty string.
         */
        KeyValues.prototype.GetValue = function () {
            return this.value || '';
        };
        /**
         * Return true that the KeyValues exists children and no value.
         */
        KeyValues.prototype.HasChildren = function () {
            return !!this.children;
        };
        /**
         * Set value or children.
         */
        KeyValues.prototype.SetValue = function (v) {
            var e_1, _a;
            if (Array.isArray(v)) {
                this.children = v.map(function (c) { return c.Free(); });
                delete this.value;
                try {
                    for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var kv = _c.value;
                        if (kv === this) {
                            throw new Error("SetValue(): The value can not includes self");
                        }
                        kv.parent = this;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            else {
                if (this.IsRoot()) {
                    throw new Error('The value of the root node kv must be an array');
                }
                this.value = v;
                delete this.children;
            }
            return this;
        };
        /**
         * Append a KeyValues to children,
         * if no children then throw error.
         */
        KeyValues.prototype.Append = function (child) {
            if (this.children) {
                if (child === this) {
                    throw new Error("Append(): Can not append self");
                }
                this.children.push(child.Free());
                child.parent = this;
            }
            else {
                throw new Error("The KeyValues [Key = " + this.Key + "] does not have children");
            }
            return this;
        };
        /**
         * Insert a KeyValues to children,
         * if no children then throw error.
         */
        KeyValues.prototype.Insert = function (child, index) {
            if (this.children) {
                if (child === this) {
                    throw new Error("Insert(): Can not insert self");
                }
                this.children.splice(index, 0, child.Free());
                child.parent = this;
            }
            else {
                throw new Error("The KeyValues [Key = " + this.Key + "] does not have children");
            }
            return this;
        };
        /**
         * Find a KeyValues from children
         */
        KeyValues.prototype.Find = function (callback) {
            var e_2, _a;
            if (!this.children) {
                return;
            }
            try {
                for (var _b = __values(this.children.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), i = _d[0], kv = _d[1];
                    if (callback(kv, i, this) === true) {
                        return kv;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        /**
         * Find all KeyValues from children
         */
        KeyValues.prototype.FindAll = function (callback) {
            var e_3, _a;
            if (!this.children) {
                return [];
            }
            var result = [];
            try {
                for (var _b = __values(this.children.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), i = _d[0], kv = _d[1];
                    if (callback(kv, i, this) === true) {
                        result.push(kv);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return result;
        };
        /**
         * Find a KeyValues
         */
        KeyValues.prototype.FindKey = function (key) {
            return this.Find(function (kv) { return kv.Key === key; });
        };
        /**
         * Find all KeyValues
         */
        KeyValues.prototype.FindAllKeys = function () {
            var keys = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keys[_i] = arguments[_i];
            }
            return this.FindAll(function (kv) { return keys.includes(kv.Key); });
        };
        /**
         * Find a KeyValues from children and children's children...
         */
        KeyValues.prototype.FindRecursive = function (callback) {
            if (!this.children) {
                return;
            }
            return KeyValues.FindRecursive(this, callback);
        };
        /**
         * Find a KeyValues from children and children's children...
         */
        KeyValues.FindRecursive = function (root, callback) {
            var e_4, _a;
            if (root.HasChildren()) {
                try {
                    for (var _b = __values(root.GetChildren().entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var _d = __read(_c.value, 2), i = _d[0], kv = _d[1];
                        if (callback(kv, i, root) === true) {
                            return kv;
                        }
                        var result = KeyValues.FindRecursive(kv, callback);
                        if (result) {
                            return result;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        };
        /**
         * Delete a KeyValues from children
         */
        KeyValues.prototype.Delete = function (child) {
            if (!this.children) {
                return;
            }
            var kv;
            if (typeof child === 'string') {
                kv = this.children.find(function (v) { return v.Key === child; });
            }
            else {
                kv = this.children.find(function (v) { return v === child; });
            }
            if (kv) {
                this.children = this.children.filter(function (v) { return v !== kv; });
                kv.Free();
            }
            return kv;
        };
        /**
         * Delete this KeyValues from parent
         */
        KeyValues.prototype.Free = function () {
            if (this.parent) {
                this.parent.Delete(this);
                delete this.parent;
            }
            return this;
        };
        /**
         * Format KeyValues to file text
         */
        KeyValues.prototype.Format = function (tab, maxLength) {
            var e_5, _a;
            if (tab === void 0) { tab = ''; }
            if (maxLength === void 0) { maxLength = -1; }
            if (this.IsRoot()) {
                if (!this.children) {
                    throw new Error('The value of the root node kv must be an array');
                }
                return this.children.map(function (v) { return v.Format(); }).join('\n');
            }
            var text = '';
            if (this.Comments.HasComments()) {
                text += this.Comments.GetComments()
                    .map(function (v) { return tab + "// " + v.trimStart() + "\n"; })
                    .join('');
            }
            if (this.children) {
                var maxLength_1 = Math.max.apply(Math, __spreadArray([], __read(this.children.map(function (v) { return v.Key.length; }))));
                text += tab + "\"" + this.Key + "\"";
                if (this.Comments.HasEndOfLineComment()) {
                    text += " // " + this.Comments.GetEndOfLineComment();
                }
                text += "\n" + tab + "{";
                try {
                    for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var kv = _c.value;
                        text += '\n' + kv.Format(tab + '    ', maxLength_1);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                text += "\n" + tab + "}";
            }
            else {
                if (this.IsBase()) {
                    text += "" + tab + this.Key + "    \"" + this.value + "\"";
                    if (this.Comments.HasEndOfLineComment()) {
                        text += " // " + this.Comments.GetEndOfLineComment();
                    }
                }
                else {
                    text += tab + "\"" + this.Key + "\"" + ' '.repeat(Math.max(0, maxLength - this.Key.length));
                    text += "    \"" + this.value + "\"";
                    if (this.Comments.HasEndOfLineComment()) {
                        text += " // " + this.Comments.GetEndOfLineComment();
                    }
                }
            }
            return text;
        };
        KeyValues.prototype.toString = function () {
            return this.Format();
        };
        /**
         * Create root node
         */
        KeyValues.CreateRoot = function () {
            return new KeyValues(KeyValuesRootKey, []);
        };
        /**
         * Parse string
         */
        KeyValues.Parse = function (body) {
            var root = this.CreateRoot();
            this._parse({ body: body, pos: 0, line: 1 }, root);
            return root;
        };
        KeyValues._parse = function (data, parent) {
            var kv = new KeyValues('');
            var key = false;
            var leftMark = false;
            var inQoute = false;
            var str = '';
            var isEndOfLineComment = false;
            for (; data.pos < data.body.length; data.pos++) {
                var c = data.body[data.pos];
                var isNewLine = c === '\n';
                var isSpace = isNewLine || c === ' ' || c === '\t' || c === '\r';
                if (isNewLine) {
                    data.line += 1;
                    isEndOfLineComment = false;
                }
                // If leftMark is true then merge char to str
                if (leftMark) {
                    if (!inQoute) {
                        if (c === '{' || c === '"' || c === '[' || c === ']') {
                            throw Error("Not readable in line " + data.line);
                        }
                        if (isSpace || c === '}') {
                            if (key) {
                                kv.Key = str;
                            }
                            else {
                                kv.SetValue(str);
                                parent.Append(kv);
                                kv = new KeyValues('');
                            }
                            leftMark = false;
                            inQoute = false;
                            str = '';
                            if (c === '}') {
                                data.pos--;
                            }
                            continue;
                        }
                        str += c;
                        continue;
                    }
                    if (c === '\\') {
                        data.pos++;
                        str += c + data.body[data.pos];
                        continue;
                    }
                    if (c === '"') {
                        if (key) {
                            kv.Key = str;
                        }
                        else {
                            kv.SetValue(str);
                            parent.Append(kv);
                            kv = new KeyValues('');
                        }
                        leftMark = false;
                        inQoute = false;
                        str = '';
                        continue;
                    }
                    str += c;
                    continue;
                }
                // if comment
                if (c === '/') {
                    if (data.body[data.pos + 1] === '*') {
                        throw Error("Line " + data.line + ": not support multi-line comment");
                    }
                    if (data.body[data.pos + 1] === '/') {
                        var endIndex = data.body.indexOf('\n', data.pos + 1);
                        var comment = data.body.slice(data.pos + 2, endIndex).trim();
                        if (comment) {
                            if (isEndOfLineComment) {
                                if (key) {
                                    kv.Comments.SetEndOfLineComment(comment);
                                }
                                else {
                                    var lastChild = parent.GetLastChild();
                                    lastChild === null || lastChild === void 0 ? void 0 : lastChild.Comments.SetEndOfLineComment(comment);
                                }
                            }
                            else {
                                kv.Comments.AppendComment(comment);
                            }
                        }
                        isEndOfLineComment = false;
                        data.pos = endIndex;
                        continue;
                    }
                }
                // If open breace
                if (c === '{') {
                    data.pos++;
                    kv.SetValue([]);
                    parent.Append(kv);
                    this._parse(data, kv);
                    kv = new KeyValues('');
                    key = false;
                    continue;
                }
                // If close breace
                if (c === '}') {
                    data.pos++;
                    break;
                }
                // If space
                if (isSpace) {
                    continue;
                }
                // start merge char
                key = !key;
                leftMark = true;
                inQoute = c === '"';
                str = inQoute ? '' : c;
                isEndOfLineComment = true;
            }
        };
        return KeyValues;
    }());

    var KV3BaseValue = /** @class */ (function () {
        function KV3BaseValue(owner) {
            this.Comments = new KeyValues3Comments();
            this.owner = owner;
        }
        KV3BaseValue.prototype.GetValue = function () {
            return this.value;
        };
        KV3BaseValue.prototype.GetOwner = function () {
            return this.owner;
        };
        KV3BaseValue.prototype.SetOwner = function (owner) {
            this.owner = owner;
        };
        KV3BaseValue.prototype.IsBoolean = function () {
            return this instanceof ValueBoolean;
        };
        KV3BaseValue.prototype.IsInt = function () {
            return this instanceof ValueInt;
        };
        KV3BaseValue.prototype.IsDouble = function () {
            return this instanceof ValueDouble;
        };
        KV3BaseValue.prototype.IsString = function () {
            return this instanceof ValueString;
        };
        KV3BaseValue.prototype.IsResource = function () {
            return this instanceof ValueResource;
        };
        KV3BaseValue.prototype.IsDeferredResource = function () {
            return this instanceof ValueDeferredResource;
        };
        KV3BaseValue.prototype.IsArray = function () {
            return this instanceof ValueArray;
        };
        KV3BaseValue.prototype.IsObject = function () {
            return this instanceof ValueObject;
        };
        KV3BaseValue.prototype.Format = function () {
            return String(this.value);
        };
        return KV3BaseValue;
    }());
    /**
     * String
     */
    var ValueString = /** @class */ (function (_super) {
        __extends(ValueString, _super);
        function ValueString(initValue) {
            var _this = _super.call(this) || this;
            _this.value = '';
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueString.prototype.GetValue = function () {
            return this.value;
        };
        ValueString.prototype.SetValue = function (v) {
            this.value = String(v);
            return this;
        };
        ValueString.prototype.Format = function () {
            if (this.value.includes('\n')) {
                return "\"\"\"" + this.value + "\"\"\"";
            }
            return "\"" + this.value + "\"";
        };
        return ValueString;
    }(KV3BaseValue));
    /**
     * Boolean
     */
    var ValueBoolean = /** @class */ (function (_super) {
        __extends(ValueBoolean, _super);
        function ValueBoolean(initValue) {
            var _this = _super.call(this) || this;
            _this.value = false;
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueBoolean.prototype.GetValue = function () {
            return this.value;
        };
        ValueBoolean.prototype.SetValue = function (v) {
            this.value = v === true;
            return this;
        };
        return ValueBoolean;
    }(KV3BaseValue));
    /**
     * Int
     */
    var ValueInt = /** @class */ (function (_super) {
        __extends(ValueInt, _super);
        function ValueInt(initValue) {
            var _this = _super.call(this) || this;
            _this.value = 0;
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueInt.prototype.GetValue = function () {
            return this.value;
        };
        ValueInt.prototype.SetValue = function (v) {
            this.value = Math.floor(v);
            return this;
        };
        return ValueInt;
    }(KV3BaseValue));
    /**
     * Double
     */
    var ValueDouble = /** @class */ (function (_super) {
        __extends(ValueDouble, _super);
        function ValueDouble(initValue) {
            var _this = _super.call(this) || this;
            _this.value = 0;
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueDouble.prototype.GetValue = function () {
            return this.value;
        };
        ValueDouble.prototype.SetValue = function (v) {
            this.value = v;
            return this;
        };
        ValueDouble.prototype.Format = function () {
            return this.value.toFixed(6);
        };
        return ValueDouble;
    }(KV3BaseValue));
    /**
     * resource:""
     */
    var ValueResource = /** @class */ (function (_super) {
        __extends(ValueResource, _super);
        function ValueResource(initValue) {
            var _this = _super.call(this) || this;
            _this.value = '';
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueResource.prototype.GetValue = function () {
            return this.value;
        };
        ValueResource.prototype.SetValue = function (v) {
            this.value = v;
            return this;
        };
        ValueResource.prototype.Format = function () {
            return "resource:\"" + this.value + "\"";
        };
        return ValueResource;
    }(KV3BaseValue));
    /**
     * deferred_resource:""
     */
    var ValueDeferredResource = /** @class */ (function (_super) {
        __extends(ValueDeferredResource, _super);
        function ValueDeferredResource(initValue) {
            var _this = _super.call(this) || this;
            _this.value = '';
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueDeferredResource.prototype.GetValue = function () {
            return this.value;
        };
        ValueDeferredResource.prototype.SetValue = function (v) {
            this.value = v;
            return this;
        };
        ValueDeferredResource.prototype.Format = function () {
            return "deferred_resource:\"" + this.value + "\"";
        };
        return ValueDeferredResource;
    }(KV3BaseValue));
    /**
     * Array
     */
    var ValueArray = /** @class */ (function (_super) {
        __extends(ValueArray, _super);
        function ValueArray(initValue) {
            var _this = _super.call(this) || this;
            _this.value = [];
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueArray.prototype.GetValue = function () {
            return this.value;
        };
        ValueArray.prototype.SetValue = function (list) {
            this.value = list.map(function (v) { return v; });
            return this;
        };
        ValueArray.prototype.Append = function (v) {
            this.value.push(v);
            return this;
        };
        ValueArray.prototype.Insert = function (v, index) {
            this.value.splice(index, 0, v);
            return this;
        };
        ValueArray.prototype.Delete = function (v) {
            var i = this.value.indexOf(v);
            if (i >= 0) {
                this.value.splice(i, 1);
            }
            return this;
        };
        ValueArray.prototype.Format = function (tab) {
            if (tab === void 0) { tab = ''; }
            var text = '';
            var oneLine = true;
            if (this.value.some(function (v) {
                return v.IsArray() ||
                    v.IsObject() ||
                    v.Comments.HasComments() ||
                    v.Comments.HasEndOfLineComment();
            })) {
                oneLine = false;
            }
            else {
                var max = this.value.reduce(function (pv, v) { return pv + v.Format().length; }, 0);
                if (max > 64) {
                    oneLine = false;
                }
            }
            if (oneLine) {
                text = " [ ";
                text += this.value
                    .map(function (v) {
                    return v.Format();
                })
                    .join(', ');
                text += " ]";
            }
            else {
                text = "\n" + tab + "[";
                text += this.value
                    .map(function (v) {
                    var comment = '';
                    var endComment = '';
                    if (v.Comments.HasComments()) {
                        comment = '\n' + v.Comments.Format(tab + '    ').trimEnd();
                    }
                    if (v.Comments.HasEndOfLineComment()) {
                        endComment = " // " + v.Comments.GetEndOfLineComment();
                    }
                    if (v.IsArray()) {
                        var str = v.Format(tab + '    ');
                        if (!str.startsWith('\n')) {
                            str = '\n' + tab + '   ' + str;
                        }
                        return comment + str + ',' + endComment;
                    }
                    else if (v.IsObject()) {
                        return comment + v.Format(tab + '    ') + ',' + endComment;
                    }
                    return comment + '\n' + tab + '    ' + v.Format() + ',' + endComment;
                })
                    .join('');
                text += "\n" + tab + "]";
            }
            return text;
        };
        return ValueArray;
    }(KV3BaseValue));
    /**
     * Object
     */
    var ValueObject = /** @class */ (function (_super) {
        __extends(ValueObject, _super);
        function ValueObject(initValue) {
            var _this = _super.call(this) || this;
            _this.value = [];
            if (initValue) {
                _this.SetValue(initValue);
            }
            return _this;
        }
        ValueObject.prototype.GetValue = function () {
            return this.value;
        };
        ValueObject.prototype.SetValue = function (list) {
            this.value = __spreadArray([], __read(list));
            return this;
        };
        ValueObject.prototype.Create = function (key, value) {
            var kv = new KeyValues3(key, value);
            this.Append(kv);
            return kv;
        };
        ValueObject.prototype.Append = function (v) {
            this.value.push(v);
            return this;
        };
        ValueObject.prototype.Insert = function (v, index) {
            this.value.splice(index, 0, v);
            return this;
        };
        ValueObject.prototype.Delete = function (v) {
            var kv;
            if (typeof v === 'string') {
                kv = this.value.find(function (c) { return c.Key === v; });
            }
            else {
                kv = this.value.find(function (c) { return c === v; });
            }
            if (kv) {
                this.value.splice(this.value.indexOf(kv), 1);
            }
            return kv;
        };
        /**
         * Find a KeyValues3
         */
        ValueObject.prototype.Find = function (callback) {
            var e_1, _a;
            try {
                for (var _b = __values(this.value.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), i = _d[0], kv = _d[1];
                    if (callback(kv, i, this) === true) {
                        return kv;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Find a KeyValues3
         */
        ValueObject.prototype.FindKey = function (key) {
            return this.Find(function (kv) { return kv.Key === key; });
        };
        /**
         * Find a KeyValues3
         */
        ValueObject.prototype.FindAll = function (callback) {
            var e_2, _a;
            var result = [];
            try {
                for (var _b = __values(this.value.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), i = _d[0], kv = _d[1];
                    if (callback(kv, i, this) === true) {
                        result.push(kv);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        };
        /**
         * Find a KeyValues3
         */
        ValueObject.prototype.FindAllKeys = function () {
            var keys = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keys[_i] = arguments[_i];
            }
            return this.FindAll(function (kv) { return keys.includes(kv.Key); });
        };
        ValueObject.prototype.Format = function (tab) {
            if (tab === void 0) { tab = ''; }
            var text = "\n" + tab + "{";
            text += this.value.map(function (v) { return '\n' + v.Format(tab + '    '); }).join('');
            text += "\n" + tab + "}";
            return text;
        };
        return ValueObject;
    }(KV3BaseValue));
    var MatchKeyNoQuote = /^[\w\d_\.]+$/;
    var MatchInt = /^-?\d+$/;
    var MatchDouble = /^-?\d+.\d+$/;
    var MatchDouble2 = /^-?.\d+$/;
    var MatchDouble3 = /^-?\d+.$/;
    var MatchStrangeNumber = /^[\d\+-\.]+$/;
    var MatchBoolean = /^(true|false)$/;
    var MatchResource = /^resource:"(.*)"$/;
    var MatchDeferredResource = /^deferred_resource:"(.*)"$/;
    /**
     * https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/KeyValues3
     */
    var KeyValues3 = /** @class */ (function () {
        function KeyValues3(Key, defaultValue) {
            this.Key = Key;
            this.value = defaultValue;
            this.value.SetOwner(this);
        }
        KeyValues3.prototype.IsRoot = function () {
            return !!this.header;
        };
        KeyValues3.prototype.GetHeader = function () {
            return this.header;
        };
        KeyValues3.CreateRoot = function () {
            var kv = new KeyValues3('', new ValueObject());
            kv.header = this.CommonHeader;
            return kv;
        };
        KeyValues3.prototype.GetValue = function () {
            return this.value;
        };
        KeyValues3.prototype.SetValue = function (v) {
            if (this.IsRoot() && !v.IsObject()) {
                throw Error('The root node of KeyValues3 must be an object');
            }
            this.value = v;
        };
        KeyValues3.prototype.CreateObjectValue = function (key, value) {
            if (!this.value.IsObject()) {
                throw Error('The KeyValues3 is not an object');
            }
            return this.value.Create(key, value);
        };
        KeyValues3.prototype.AppendValue = function (value) {
            if (!this.value.IsArray()) {
                throw Error('The KeyValues3 is not an array');
            }
            return this.value.Append(value);
        };
        KeyValues3.prototype.Find = function (callback) {
            if (!this.value.IsObject()) {
                throw Error('The KeyValues3 is not an object');
            }
            return this.value.Find(callback);
        };
        KeyValues3.prototype.FindKey = function (key) {
            return this.Find(function (kv) { return kv.Key === key; });
        };
        KeyValues3.prototype.FindAll = function (callback) {
            if (!this.value.IsObject()) {
                throw Error('The KeyValues3 is not an object');
            }
            return this.value.FindAll(callback);
        };
        KeyValues3.prototype.FindAllKeys = function () {
            var keys = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keys[_i] = arguments[_i];
            }
            return this.FindAll(function (kv) { return keys.includes(kv.Key); });
        };
        KeyValues3.prototype.Format = function (tab) {
            if (tab === void 0) { tab = ''; }
            var text = '';
            var prefix = '';
            var root = this.IsRoot();
            if (MatchKeyNoQuote.test(this.Key)) {
                prefix = "" + tab + this.Key + " =";
            }
            else {
                prefix = tab + "\"" + this.Key + "\" =";
            }
            if (root) {
                text += this.header;
            }
            if (this.value.Comments.HasComments()) {
                text += this.value.Comments.Format(tab);
            }
            if (this.value.IsArray()) {
                text += prefix;
                text += this.value.Format(tab);
            }
            else if (this.value.IsObject()) {
                if (root) {
                    text += this.value.Format(tab);
                }
                else {
                    text += prefix;
                    text += this.value.Format(tab);
                }
            }
            else {
                text += prefix + (" " + this.value.Format());
            }
            if (this.value.Comments.HasEndOfLineComment()) {
                text += " // " + this.value.Comments.GetEndOfLineComment();
            }
            return text;
        };
        KeyValues3.prototype.toString = function () {
            return this.Format();
        };
        KeyValues3.Parse = function (body) {
            var root = this.CreateRoot();
            var firstLineIndex = body.indexOf('\n');
            var header = body.slice(0, firstLineIndex).trim();
            if (!header.startsWith('<!--') || !header.endsWith('-->')) {
                throw Error('Invalid header');
            }
            this._parse(root, {
                body: body,
                line: 2,
                pos: body.indexOf('{', firstLineIndex) + 1,
                tokenCounter: 1,
            });
            return root;
        };
        KeyValues3._parse = function (parent, data) {
            var _a, _b;
            if (parent.value.IsObject()) {
                var isKey = true;
                var startMark = false;
                var inQoute = false;
                var key = '';
                var str = '';
                var isEndOfLineComment = false;
                var commentCache = [];
                var lastKV = void 0;
                for (; data.pos < data.body.length; data.pos++) {
                    var c = data.body[data.pos];
                    var isNewLine = c === '\n';
                    var isSpace = isNewLine || c === ' ' || c === '\t' || c === '\r';
                    if (isNewLine) {
                        data.line += 1;
                        isEndOfLineComment = false;
                    }
                    if (startMark) {
                        if (isKey) {
                            // isKey
                            if (inQoute) {
                                if (c === '\\') {
                                    str += c + data.body[data.pos + 1];
                                    data.pos += 1;
                                    continue;
                                }
                                if (c === '"') {
                                    key = str;
                                    str = '';
                                    startMark = false;
                                    continue;
                                }
                                else {
                                    str += c;
                                    continue;
                                }
                            }
                            else {
                                if (isSpace || c === '=') {
                                    key = str;
                                    str = '';
                                    startMark = false;
                                    if (c === '=') {
                                        data.pos -= 1;
                                    }
                                    continue;
                                }
                                str += c;
                                continue;
                            }
                            // isKey
                        }
                        else {
                            // not isKey
                            if (inQoute) {
                                if (c === '\\') {
                                    str += c + data.body[data.pos + 1];
                                    data.pos += 1;
                                    continue;
                                }
                                if (c === '"') {
                                    if (str.length <= 0) {
                                        // check start on multi-line
                                        if (data.body[data.pos + 1] === '"') {
                                            if (data.body[data.pos + 2] !== '\n' &&
                                                data.body[data.pos + 2] !== '\r') {
                                                throw new Error(this._parse_error(data.line, "multi-line start identifier \"\"\" must be followed by newline"));
                                            }
                                            data.pos += 1;
                                            continue;
                                        }
                                    }
                                    else {
                                        // check end on multi-line
                                        if (data.body[data.pos + 1] === '"') {
                                            if (data.body[data.pos + 2] === '"') {
                                                if (data.body[data.pos - 1] !== '\n') {
                                                    throw new Error(this._parse_error(data.line, "multi-line end identifier \"\"\" must be at the beginning of line"));
                                                }
                                                data.pos += 2;
                                            }
                                            else {
                                                throw new Error(this._parse_error(data.line, "multi-line string must be end with \"\"\""));
                                            }
                                        }
                                    }
                                    lastKV = parent.CreateObjectValue(key, new ValueString(str));
                                    lastKV.value.Comments.SetComments(commentCache);
                                    commentCache = [];
                                    key = '';
                                    str = '';
                                    isKey = true;
                                    inQoute = false;
                                    startMark = false;
                                    continue;
                                }
                                else {
                                    str += c;
                                    continue;
                                }
                            }
                            else {
                                if (isSpace || c === ']' || c === '}') {
                                    if (MatchBoolean.test(str)) {
                                        lastKV = parent.CreateObjectValue(key, new ValueBoolean(str === 'true'));
                                    }
                                    else if (MatchInt.test(str)) {
                                        lastKV = parent.CreateObjectValue(key, new ValueInt(parseInt(str)));
                                    }
                                    else if (MatchDouble.test(str) ||
                                        MatchDouble2.test(str) ||
                                        MatchDouble3.test(str)) {
                                        lastKV = parent.CreateObjectValue(key, new ValueDouble(Number(str)));
                                    }
                                    else if (MatchResource.test(str)) {
                                        var m = MatchResource.exec(str);
                                        var v = m ? m[1] : '';
                                        lastKV = parent.CreateObjectValue(key, new ValueResource(v));
                                    }
                                    else if (MatchDeferredResource.test(str)) {
                                        var m = MatchDeferredResource.exec(str);
                                        var v = m ? m[1] : '';
                                        lastKV = parent.CreateObjectValue(key, new ValueDeferredResource(v));
                                    }
                                    else if (MatchStrangeNumber.test(str)) {
                                        lastKV = parent.CreateObjectValue(key, new ValueString(str));
                                    }
                                    else {
                                        throw new Error(this._parse_error(data.line, "Invalid value '" + str + "'"));
                                    }
                                    lastKV.value.Comments.SetComments(commentCache);
                                    commentCache = [];
                                    key = '';
                                    str = '';
                                    isKey = true;
                                    inQoute = false;
                                    startMark = false;
                                    if (c === ']' || c === '}') {
                                        data.pos -= 1;
                                    }
                                    continue;
                                }
                                str += c;
                                continue;
                            }
                            // not isKey
                        }
                    }
                    if (c === '/') {
                        if (data.body[data.pos + 1] === '/') {
                            var nextIndex = data.body.indexOf('\n', data.pos + 2);
                            if (isEndOfLineComment && lastKV) {
                                lastKV.value.Comments.SetEndOfLineComment(data.body.slice(data.pos + 2, nextIndex).trimStart());
                                isEndOfLineComment = false;
                            }
                            else {
                                commentCache.push(data.body.slice(data.pos + 2, nextIndex).trimStart());
                            }
                            data.pos = nextIndex;
                            data.line += 1;
                            continue;
                        }
                        else if (data.body[data.pos + 1] === '*') {
                            var nextIndex = data.body.indexOf('*/', data.pos + 2);
                            commentCache.push(data.body.slice(data.pos + 2, nextIndex).trim());
                            data.pos = nextIndex + 1;
                            data.line += ((_a = data.body.slice(data.pos, nextIndex).match(/\n/g)) === null || _a === void 0 ? void 0 : _a.length) || 1;
                            continue;
                        }
                    }
                    if (c === '{') {
                        if (isKey) {
                            throw new Error(this._parse_error(data.line, "Invalid char '{'"));
                        }
                        var child = parent.CreateObjectValue(key, new ValueObject());
                        data.pos += 1;
                        data.tokenCounter += 1;
                        this._parse(child, data);
                        key = '';
                        str = '';
                        isKey = true;
                        inQoute = false;
                        startMark = false;
                        continue;
                    }
                    if (c === '[') {
                        if (isKey) {
                            throw new Error(this._parse_error(data.line, "Invalid char '['"));
                        }
                        var child = parent.CreateObjectValue(key, new ValueArray());
                        data.pos += 1;
                        data.tokenCounter += 1;
                        this._parse(child, data);
                        key = '';
                        str = '';
                        isKey = true;
                        inQoute = false;
                        startMark = false;
                        continue;
                    }
                    if (c === '}' || c === ']') {
                        data.tokenCounter += 1;
                        return;
                    }
                    if (isSpace) {
                        continue;
                    }
                    if (c === '=') {
                        if (key === '' && !inQoute) {
                            throw new Error(this._parse_error(data.line, "Invalid member name '='"));
                        }
                        if (!inQoute && !MatchKeyNoQuote.test(key)) {
                            throw new Error(this._parse_error(data.line, "Invalid member name '" + key + "'"));
                        }
                        isKey = false;
                        inQoute = false;
                        continue;
                    }
                    startMark = true;
                    inQoute = c === '"';
                    str = inQoute ? '' : c;
                    isEndOfLineComment = true;
                }
            }
            else if (parent.value.IsArray()) {
                var startMark = false;
                var inQoute = false;
                var str = '';
                var expectedEnd = false;
                var isEndOfLineComment = false;
                var commentCache = [];
                var lastValue = void 0;
                for (; data.pos < data.body.length; data.pos++) {
                    var c = data.body[data.pos];
                    var isNewLine = c === '\n';
                    var isSpace = isNewLine || c === ' ' || c === '\t' || c === '\r';
                    if (isNewLine) {
                        data.line += 1;
                        isEndOfLineComment = false;
                    }
                    if (startMark) {
                        if (inQoute) {
                            if (c === '\\') {
                                str += c + data.body[data.pos + 1];
                                data.pos += 1;
                                continue;
                            }
                            if (c === '"') {
                                if (str.length <= 0) {
                                    // check start on multi-line
                                    if (data.body[data.pos + 1] === '"') {
                                        if (data.body[data.pos + 2] !== '\n' &&
                                            data.body[data.pos + 2] !== '\r') {
                                            throw new Error(this._parse_error(data.line, "multi-line start identifier \"\"\" must be followed by newline"));
                                        }
                                        data.pos += 1;
                                        continue;
                                    }
                                }
                                else {
                                    // check end on multi-line
                                    if (data.body[data.pos + 1] === '"') {
                                        if (data.body[data.pos + 2] === '"') {
                                            if (data.body[data.pos - 1] !== '\n') {
                                                throw new Error(this._parse_error(data.line, "multi-line end identifier \"\"\" must be at the beginning of line"));
                                            }
                                            data.pos += 2;
                                        }
                                        else {
                                            throw new Error(this._parse_error(data.line, "multi-line string must be end with \"\"\""));
                                        }
                                    }
                                }
                                lastValue = new ValueString(str);
                                parent.AppendValue(lastValue);
                                lastValue.Comments.SetComments(commentCache);
                                commentCache = [];
                                str = '';
                                inQoute = false;
                                startMark = false;
                                expectedEnd = true;
                                continue;
                            }
                            else {
                                str += c;
                                continue;
                            }
                        }
                        else {
                            if (isSpace || c === ',' || c === ']') {
                                if (MatchBoolean.test(str)) {
                                    lastValue = new ValueBoolean(str === 'true');
                                    parent.AppendValue(lastValue);
                                }
                                else if (MatchInt.test(str)) {
                                    lastValue = new ValueInt(parseInt(str));
                                    parent.AppendValue(lastValue);
                                }
                                else if (MatchDouble.test(str) ||
                                    MatchDouble2.test(str) ||
                                    MatchDouble3.test(str)) {
                                    lastValue = new ValueDouble(Number(str));
                                    parent.AppendValue(lastValue);
                                }
                                else if (MatchResource.test(str)) {
                                    var m = MatchResource.exec(str);
                                    var v = m ? m[1] : '';
                                    lastValue = new ValueResource(v);
                                    parent.AppendValue(lastValue);
                                }
                                else if (MatchDeferredResource.test(str)) {
                                    var m = MatchDeferredResource.exec(str);
                                    var v = m ? m[1] : '';
                                    lastValue = new ValueDeferredResource(v);
                                    parent.AppendValue(lastValue);
                                }
                                else if (MatchStrangeNumber.test(str)) {
                                    lastValue = new ValueString(str);
                                    parent.AppendValue(lastValue);
                                }
                                else {
                                    throw new Error(this._parse_error(data.line, "Invalid value '" + str + "'"));
                                }
                                lastValue.Comments.SetComments(commentCache);
                                commentCache = [];
                                str = '';
                                inQoute = false;
                                startMark = false;
                                expectedEnd = c !== ',' && c !== ']';
                                if (c === ']') {
                                    data.pos -= 1;
                                }
                                continue;
                            }
                            str += c;
                            continue;
                        }
                    }
                    if (c === '/') {
                        if (data.body[data.pos + 1] === '/') {
                            var nextIndex = data.body.indexOf('\n', data.pos + 2);
                            if (isEndOfLineComment && lastValue) {
                                lastValue.Comments.SetEndOfLineComment(data.body.slice(data.pos + 2, nextIndex).trimStart());
                                isEndOfLineComment = false;
                            }
                            else {
                                commentCache.push(data.body.slice(data.pos + 2, nextIndex).trimStart());
                            }
                            data.pos = nextIndex;
                            data.line += 1;
                            continue;
                        }
                        else if (data.body[data.pos + 1] === '*') {
                            var nextIndex = data.body.indexOf('*/', data.pos + 2);
                            commentCache.push(data.body.slice(data.pos + 2, nextIndex).trim());
                            data.pos = nextIndex + 1;
                            data.line += ((_b = data.body.slice(data.pos, nextIndex).match(/\n/g)) === null || _b === void 0 ? void 0 : _b.length) || 1;
                            continue;
                        }
                    }
                    if (expectedEnd) {
                        if (isSpace) {
                            continue;
                        }
                        if (c !== ',' && c !== ']') {
                            throw new Error(this._parse_error(data.line, "Expected ',' or ']'"));
                        }
                        expectedEnd = false;
                    }
                    if (c === ',') {
                        continue;
                    }
                    if (c === '{') {
                        var child = new KeyValues3('', new ValueObject());
                        data.pos += 1;
                        data.tokenCounter += 1;
                        this._parse(child, data);
                        child.value.SetOwner(parent);
                        parent.value.Append(child.value);
                        str = '';
                        inQoute = false;
                        startMark = false;
                        continue;
                    }
                    if (c === '[') {
                        var child = new KeyValues3('', new ValueArray());
                        data.pos += 1;
                        data.tokenCounter += 1;
                        this._parse(child, data);
                        child.value.SetOwner(parent);
                        parent.value.Append(child.value);
                        str = '';
                        inQoute = false;
                        startMark = false;
                        continue;
                    }
                    if (c === '}' || c === ']') {
                        data.tokenCounter += 1;
                        return;
                    }
                    if (isSpace) {
                        continue;
                    }
                    startMark = true;
                    inQoute = c === '"';
                    str = inQoute ? '' : c;
                    isEndOfLineComment = true;
                }
            }
            else {
                throw Error("Parent's value must be an object or array");
            }
        };
        KeyValues3._parse_error = function (line, msg) {
            return "not readable as KeyValues3 text: Line " + line + ": " + msg;
        };
        KeyValues3.String = ValueString;
        KeyValues3.Boolean = ValueBoolean;
        KeyValues3.Int = ValueInt;
        KeyValues3.Double = ValueDouble;
        KeyValues3.Resource = ValueResource;
        KeyValues3.DeferredResource = ValueDeferredResource;
        KeyValues3.Array = ValueArray;
        KeyValues3.Object = ValueObject;
        KeyValues3.CommonHeader = '<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->';
        return KeyValues3;
    }());

    function LoadKeyValues(body) {
        return KeyValues.Parse(body);
    }
    function LoadKeyValues3(body) {
        return KeyValues3.Parse(body);
    }

    exports.KeyValues = KeyValues;
    exports.KeyValues3 = KeyValues3;
    exports.LoadKeyValues = LoadKeyValues;
    exports.LoadKeyValues3 = LoadKeyValues3;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=web.js.map
