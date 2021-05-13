import * as vscode from 'vscode';

import { FeaturesLocator } from './featuresView';



export async function activate(context: vscode.ExtensionContext) {


    new FeaturesLocator(context);

    let success = await vscode.commands.executeCommand(
        'features-location.searchFeature', "main");



    console.log('Congratulations, your extension "features-location" is now active!');


    let disposable = vscode.commands.registerCommand('features-location.helloWorld', async () => {
        vscode.window.showInformationMessage("hello");

    });


    context.subscriptions.push(disposable);
}

export function deactivate() { }
