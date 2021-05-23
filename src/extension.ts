import * as vscode from 'vscode';

import { FeaturesLocator } from './featuresView';
import { Range, Position } from 'vscode'


export async function activate(context: vscode.ExtensionContext) {

    new FeaturesLocator(context);

    console.log('Feature-Location is now active!');

    let disposable = vscode.commands.registerCommand('features-location.helloWorld', async () => {
        vscode.window.showInformationMessage("hello");

    });


    context.subscriptions.push(disposable);
}

export function deactivate() { }
