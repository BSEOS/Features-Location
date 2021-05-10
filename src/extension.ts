// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Uri, Range, Position } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed



export async function activate(context: vscode.ExtensionContext) {
    let map: Map<String, Range[]> = new Map<String, Range[]>();
    map.set("file", [new Range(new Position(2, 3), new Position(4, 6))]);
    console.log(map.get("file"))

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "features-location" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('features-location.helloWorld', async (fileUri) => {
        vscode.window.showInformationMessage("hello");
        let uri = Uri.file('/home/edwin/Desktop/vscode-feature-locator/Samples/document4.txt');


        let r = new Range(new Position(0, 2), new Position(0, 12))


        let success = await vscode.commands.executeCommand(
            'vscode.executeInlineHintProvider', uri, r);
        console.log(success)
    });

    let disposable2 = vscode.commands.registerCommand('features-location.explore', async (fileUri) => {
        vscode.window.showInformationMessage(fileUri);
        console.log(fileUri);
    })


    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() { }
