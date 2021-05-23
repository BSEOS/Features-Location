import * as vscode from 'vscode';

import { FeaturesLocator } from './featuresView';
import { Range, Position } from 'vscode'


export async function activate(context: vscode.ExtensionContext) {


    let l: [String, Map<String, Range[]>][] = [];

    l.push(["feature1", new Map<String, Range[]>()]);
    l.push(["feature2", new Map<String, Range[]>()]);
    l[0][1].set("/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/Program.cs", [new Range(new Position(2, 3), new Position(4, 5))]);
    l[1][1].set("/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/Controllers/AccountController.cs", [new Range(new Position(2, 3), new Position(4, 5)), new Range(new Position(1, 1), new Position(7, 7))]);
    l[1][1].set("/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/frontend/dist/scripts/data.js", [new Range(new Position(10, 10), new Position(11, 11)), new Range(new Position(1, 1), new Position(7, 7))]);




    new FeaturesLocator(context, undefined, l);

    // let success = vscode.commands.executeCommand(
    //     'features-location.searchFeature', "main");



    console.log('Feature-Location is now active!');

    let disposable = vscode.commands.registerCommand('features-location.helloWorld', async () => {
        vscode.window.showInformationMessage("hello");

    });


    context.subscriptions.push(disposable);
}

export function deactivate() { }
