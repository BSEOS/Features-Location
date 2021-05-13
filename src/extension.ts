import * as vscode from 'vscode';

import { FeaturesLocator } from './featuresView';



export async function activate(context: vscode.ExtensionContext) {


    new FeaturesLocator(context);

    // let success = vscode.commands.executeCommand(
    //     'features-location.searchFeature', "main");



    console.log('Feature-Location is now active!');

    let disposable = vscode.commands.registerCommand('features-location.helloWorld', async () => {
        vscode.window.showInformationMessage("hello");

    });


    context.subscriptions.push(disposable);
}

export function deactivate() { }
