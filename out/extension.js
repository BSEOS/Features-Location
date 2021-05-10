"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const vscode_1 = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let map = new Map();
        map.set("file", [new vscode_1.Range(new vscode_1.Position(2, 3), new vscode_1.Position(4, 6))]);
        console.log(map.get("file"));
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        console.log('Congratulations, your extension "features-location" is now active!');
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with registerCommand
        // The commandId parameter must match the command field in package.json
        let disposable = vscode.commands.registerCommand('features-location.helloWorld', (fileUri) => __awaiter(this, void 0, void 0, function* () {
            vscode.window.showInformationMessage("hello");
            let uri = vscode_1.Uri.file('/home/edwin/Desktop/vscode-feature-locator/Samples/document4.txt');
            let r = new vscode_1.Range(new vscode_1.Position(0, 2), new vscode_1.Position(0, 12));
            let success = yield vscode.commands.executeCommand('vscode.executeInlineHintProvider', uri, r);
            console.log(success);
        }));
        let disposable2 = vscode.commands.registerCommand('features-location.explore', (fileUri) => __awaiter(this, void 0, void 0, function* () {
            vscode.window.showInformationMessage(fileUri);
            console.log(fileUri);
        }));
        context.subscriptions.push(disposable);
        context.subscriptions.push(disposable2);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map