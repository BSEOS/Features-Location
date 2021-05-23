import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import { Range, Position } from 'vscode';
import { LSA } from './lsa/algorithm';


//#region Utilities

namespace _ {

    function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
        if (error) {
            reject(massageError(error));
        } else {
            resolve(result);
        }
    }

    function massageError(error: Error & { code?: string }): Error {
        if (error.code === 'ENOENT') {
            return vscode.FileSystemError.FileNotFound();
        }

        if (error.code === 'EISDIR') {
            return vscode.FileSystemError.FileIsADirectory();
        }

        if (error.code === 'EEXIST') {
            return vscode.FileSystemError.FileExists();
        }

        if (error.code === 'EPERM' || error.code === 'EACCESS') {
            return vscode.FileSystemError.NoPermissions();
        }

        return error;
    }

    export function checkCancellation(token: vscode.CancellationToken): void {
        if (token.isCancellationRequested) {
            throw new Error('Operation cancelled');
        }
    }

    export function normalizeNFC(items: string): string;
    export function normalizeNFC(items: string[]): string[];
    export function normalizeNFC(items: string | string[]): string | string[] {
        if (process.platform !== 'darwin') {
            return items;
        }

        if (Array.isArray(items)) {
            return items.map(item => item.normalize('NFC'));
        }

        return items.normalize('NFC');
    }

    export function readdir(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(path, (error, children) => handleResult(resolve, reject, error, normalizeNFC(children)));
        });
    }

    export function stat(path: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
        });
    }

    export function readfile(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
        });
    }

    export function writefile(path: string, content: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(path, content, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path, exists => handleResult(resolve, reject, null, exists));
        });
    }

    export function rmrf(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            rimraf(path, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function mkdir(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            mkdirp(path, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function rename(oldPath: string, newPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.rename(oldPath, newPath, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function unlink(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.unlink(path, error => handleResult(resolve, reject, error, void 0));
        });
    }
}

export class FileStat implements vscode.FileStat {

    constructor(private fsStat: fs.Stats) { }

    get type(): vscode.FileType {
        return this.fsStat.isFile() ? vscode.FileType.File : this.fsStat.isDirectory() ? vscode.FileType.Directory : this.fsStat.isSymbolicLink() ? vscode.FileType.SymbolicLink : vscode.FileType.Unknown;
    }

    get isFile(): boolean | undefined {
        return this.fsStat.isFile();
    }

    get isDirectory(): boolean | undefined {
        return this.fsStat.isDirectory();
    }

    get isSymbolicLink(): boolean | undefined {
        return this.fsStat.isSymbolicLink();
    }

    get size(): number {
        return this.fsStat.size;
    }

    get ctime(): number {
        return this.fsStat.ctime.getTime();
    }

    get mtime(): number {
        return this.fsStat.mtime.getTime();
    }
}

interface Entry {
    uri: vscode.Uri;
    type: vscode.FileType | undefined;
    isRange: boolean;
    range: Range | undefined; //defined iff isRange
    isFeature: boolean;
    feature: String | undefined //defined iff isFeature
    rangeMap: Map<String, Range[]> | undefined //defined iff isFeature
}

//#endregion

export class FileSystemProvider implements vscode.TreeDataProvider<Entry>, vscode.FileSystemProvider {
    private featureLocator: LSA;
    private _onDidChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]>;

    private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | null | void> = new vscode.EventEmitter<Entry | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Entry | undefined | null | void> = this._onDidChangeTreeData.event;


    docRanges: Map<String, Range[]> = new Map<String, Range[]>();
    featuresMap: [String, Map<String, Range[]>][] = [];


    constructor(docRanges?: Map<String, Range[]>, featuresMap?: [String, Map<String, Range[]>][]) {

        this._onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
        this.featureLocator = new LSA();
        if (docRanges)
            this.docRanges = docRanges;

        if (featuresMap)
            this.featuresMap = featuresMap;

        // this.initLSA();
    }

    async initLSA() {
        let curPath = "";
        if (vscode.workspace.workspaceFolders) {
            curPath = vscode.workspace.workspaceFolders[0].uri.path;
        }
        let dir = curPath
        let stopWordsPath = path.join(__filename, '..', "..", 'config', 'stopwords.json');
        let res = await this.featureLocator.lsa("", "", dir, stopWordsPath)
    }

    async refresh(): Promise<void> {
        console.log("REFRESHED");
        await this.initLSA();
        let testRefresh = path.join(__filename, '..', "..", 'samples', 'testRefresh.txt');
        this.docRanges.set(testRefresh, []);
        this._onDidChangeTreeData.fire();
    }

    async clearView(): Promise<void> {
        this.docRanges = new Map<String, Range[]>();
        this._onDidChangeTreeData.fire();
    }

    async searchFeature(query: string): Promise<void> {
        if (query.trim() === "")
            return;

        this.docRanges = await this.featureLocator.search(query);
        console.log("SEARCH FEATURE");
        this._onDidChangeTreeData.fire();
    }


    get onDidChangeFile(): vscode.Event<vscode.FileChangeEvent[]> {
        return this._onDidChangeFile.event;
    }

    watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
        const watcher = fs.watch(uri.fsPath, { recursive: options.recursive }, async (event: string, filename: string | Buffer) => {
            const filepath = path.join(uri.fsPath, _.normalizeNFC(filename.toString()));

            // TODO support excludes (using minimatch library?)

            this._onDidChangeFile.fire([{
                type: event === 'change' ? vscode.FileChangeType.Changed : await _.exists(filepath) ? vscode.FileChangeType.Created : vscode.FileChangeType.Deleted,
                uri: uri.with({ path: filepath })
            } as vscode.FileChangeEvent]);
        });

        return { dispose: () => watcher.close() };
    }

    stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
        return this._stat(uri.fsPath);
    }

    async _stat(path: string): Promise<vscode.FileStat> {
        return new FileStat(await _.stat(path));
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        return this._readDirectory(uri);
    }

    async _readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        const children = await _.readdir(uri.fsPath);

        const result: [string, vscode.FileType][] = [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const stat = await this._stat(path.join(uri.fsPath, child));
            result.push([child, stat.type]);
        }

        return Promise.resolve(result);
    }

    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        return _.mkdir(uri.fsPath);
    }

    readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
        return _.readfile(uri.fsPath);
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
        return this._writeFile(uri, content, options);
    }

    async _writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): Promise<void> {
        const exists = await _.exists(uri.fsPath);
        if (!exists) {
            if (!options.create) {
                throw vscode.FileSystemError.FileNotFound();
            }

            await _.mkdir(path.dirname(uri.fsPath));
        } else {
            if (!options.overwrite) {
                throw vscode.FileSystemError.FileExists();
            }
        }

        return _.writefile(uri.fsPath, content as Buffer);
    }

    delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
        if (options.recursive) {
            return _.rmrf(uri.fsPath);
        }

        return _.unlink(uri.fsPath);
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
        return this._rename(oldUri, newUri, options);
    }

    async _rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): Promise<void> {
        const exists = await _.exists(newUri.fsPath);
        if (exists) {
            if (!options.overwrite) {
                throw vscode.FileSystemError.FileExists();
            } else {
                await _.rmrf(newUri.fsPath);
            }
        }

        const parentExists = await _.exists(path.dirname(newUri.fsPath));
        if (!parentExists) {
            await _.mkdir(path.dirname(newUri.fsPath));
        }

        return _.rename(oldUri.fsPath, newUri.fsPath);
    }

    // tree data provider

    filterChildren(children: [string, vscode.FileType][], fsPath: string): Entry[] {
        let res: Entry[] = [];
        for (let c of children) {
            let name: string = c[0];
            let tp: vscode.FileType = c[1];
            for (let file of this.docRanges.keys()) {
                if (file.includes(name)) {
                    res.push({ uri: vscode.Uri.file(path.join(fsPath, name)), type: tp, isRange: false, range: undefined, isFeature: false, feature: undefined, rangeMap: this.docRanges })
                    break;
                }
            }
        }
        return res;
    }

    filterChildrenByFeature(children: [string, vscode.FileType][], fsPath: string, featureName: String | undefined): Entry[] {
        let map: Map<String, Range[]> = new Map<String, Range[]>();
        for (let x of this.featuresMap) {
            if (x[0] == featureName) {
                map = x[1];
                break;
            }
        }

        let res: Entry[] = [];
        for (let c of children) {
            let name: string = c[0];
            let tp: vscode.FileType = c[1];
            for (let file of map.keys()) {
                if (file.includes(name)) {
                    res.push({ uri: vscode.Uri.file(path.join(fsPath, name)), type: tp, isRange: false, range: undefined, isFeature: false, feature: featureName, rangeMap: map })
                    break;
                }
            }
        }
        return res;
    }

    async getChildren(element?: Entry): Promise<Entry[]> {

        if (element) {
            if (element.isFeature) {
                const workspaceFolder = vscode.workspace.workspaceFolders?.filter(folder => folder.uri.scheme === 'file')[0];
                if (workspaceFolder) {
                    const children = await this.readDirectory(workspaceFolder.uri);
                    children.sort((a, b) => {
                        if (a[1] === b[1]) {
                            return a[0].localeCompare(b[0]);
                        }
                        return a[1] === vscode.FileType.Directory ? -1 : 1;
                    });

                    let res = this.filterChildrenByFeature(children, workspaceFolder.uri.fsPath, element?.feature);

                    return res;
                }
            }

            else if (element.type == vscode.FileType.File) {
                let r: Range[] | undefined = element.rangeMap?.get(element.uri.path);
                let res: Entry[] = r ? r.map(rang => (
                    { uri: element.uri, type: undefined, isRange: true, range: rang, isFeature: false, feature: element.feature, rangeMap: element.rangeMap })) : []

                return res;
            }
            else {

                const children = await this.readDirectory(element.uri);
                return this.filterChildrenByFeature(children, element.uri.fsPath, element.feature);
            }
        }
        else {
            let res: Entry[] = [];
            for (let fm of this.featuresMap) {
                res.push({ uri: vscode.Uri.file(""), type: undefined, isRange: false, range: undefined, isFeature: true, feature: fm[0], rangeMap: undefined })
            }

            return res;
        }


        return [];

    }

    rangeToString(range: Range | undefined): string {
        if (!range)
            return "[]"
        let start = range.start;
        let end = range.end;
        return ("[" + start.line + ":" + start.character + " - " + end.line + ":" + end.character + "]");
    }

    getTreeItem(element: Entry): vscode.TreeItem {
        if (element.isFeature) {
            const treeItem = new vscode.TreeItem(element.feature ? element.feature.toString() : "", vscode.TreeItemCollapsibleState.Collapsed);
            treeItem.description = "Feature";

            treeItem.iconPath = new vscode.ThemeIcon("telescope");

            return treeItem;
        }
        else if (element.isRange) {

            let treeItem = new vscode.TreeItem(this.rangeToString(element.range));
            treeItem.description = "Range";
            treeItem.command = { command: 'fileExplorer.openFileRange', title: "Open File Range", arguments: [element.uri, element.range] };

            treeItem.iconPath = new vscode.ThemeIcon("location");
            return treeItem;
        }
        else {
            const treeItem = new vscode.TreeItem(element.uri, element.type === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Collapsed);
            if (element.type === vscode.FileType.File) {
                treeItem.contextValue = 'file';
                treeItem.command = { command: 'fileExplorer.openFile', title: "Open File", arguments: [element.uri] };

                // treeItem.description = "File";
                treeItem.iconPath = new vscode.ThemeIcon("file-code");
            } else {
                // treeItem.description = "Folder";
                treeItem.iconPath = new vscode.ThemeIcon("folder-opened");
            }
            return treeItem;
        }
    }
}

export class FeaturesLocator {
    constructor(context: vscode.ExtensionContext, docRanges?: Map<String, Range[]>, featuresMap?: [String, Map<String, Range[]>][]) {
        const treeDataProvider = new FileSystemProvider(docRanges, featuresMap);

        context.subscriptions.push(vscode.window.createTreeView('featuresView', { treeDataProvider }));
        let disp1 = vscode.commands.registerCommand('fileExplorer.openFile', (resource) =>
            this.openResource(resource));
        let disp2 = vscode.commands.registerCommand('fileExplorer.openFileRange', (resource, range) =>
            this.openFileRange(resource, range));


        let dispRefresh = vscode.commands.registerCommand('features-location.refreshEntry', async () =>
            await treeDataProvider.refresh()
        );

        let dispSearchFeatureArg = vscode.commands.registerCommand('features-location.searchFeatureArg', (query: string) =>
            treeDataProvider.searchFeature(query)
        );


        let dispSearchFeature = vscode.commands.registerCommand('features-location.searchFeature', async () => {
            let query = await vscode.window.showInputBox();
            treeDataProvider.searchFeature(query ? query : "");
        });

        let dispClear = vscode.commands.registerCommand('features-location.clearView', async () =>
            await treeDataProvider.clearView()
        );


        context.subscriptions.push(disp1);
        context.subscriptions.push(disp2);
        context.subscriptions.push(dispRefresh);
        context.subscriptions.push(dispSearchFeatureArg);
        context.subscriptions.push(dispSearchFeature);


    }



    private openFileRange(resource: vscode.Uri, range: Range): void {
        const opts: vscode.TextDocumentShowOptions = {
            selection: range
        };
        vscode.window.showTextDocument(resource, opts);
    }

    private openResource(resource: vscode.Uri): void {

        vscode.window.showTextDocument(resource);
    }
}