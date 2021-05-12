import * as vscode from 'vscode';
import { Uri, Range, Position } from 'vscode';

import { LSA } from './lsa/algorithm';
import { FeaturesLocator } from './featuresView';

import { FileExplorer } from './fileExplorer';
import { DepNodeProvider, Dependency } from './nodeDependencies';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


export async function activate(context: vscode.ExtensionContext) {
    let docs = ['/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/models/Account.cs',
        '/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/models/Bank.cs',
        '/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/Controllers/AccountController.cs',
        '/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/models/Consortium.cs',
        '/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/models/Converter.cs',
        '/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/Program.cs',
        '/home/edwin/Desktop/Cours/S2/PSTL/BankWebWithVariability/backend/src/Startup.cs']
    let curPath = "";

    if (vscode.workspace.workspaceFolders) {
        curPath = vscode.workspace.workspaceFolders[0].uri.path;
    }

    // let lsa_obj = new LSA()
    // let req = "LIMIT"
    // let dir = curPath
    // let stop_file = "/home/edwin/Desktop/Cours/S2/PSTL/features-location/Samples/stopwords.json"
    // let res = await lsa_obj.lsa(req, dir, stop_file)
    // console.log("^^^^^^^^^^^^^^^^^^")
    // console.log(lsa_obj.documents_name)


    let map: Map<String, Range[]> = new Map<String, Range[]>();
    let r = new Range(new Position(0, 2), new Position(0, 12));
    docs.forEach(d => map.set(d, [r]));

    new FeaturesLocator(context, map);

    vscode.window.registerTreeDataProvider(
        'nodeDependencies',
        new DepNodeProvider(curPath)
    );


    console.log('Congratulations, your extension "features-location" is now active!');


    let disposable = vscode.commands.registerCommand('features-location.helloWorld', async () => {
        vscode.window.showInformationMessage("hello");
        // let uri = Uri.file('Samples/document4.txt');


        // let r = new Range(new Position(0, 2), new Position(0, 12));

        // let success = await vscode.commands.executeCommand(
        //     'vscode.executeInlineHintProvider', uri, r);

    });

    let disposable2 = vscode.commands.registerCommand('features-location.explore', async () => {
        vscode.window.showInformationMessage(curPath);
        console.log(curPath);
    });

    // context.subscriptions.push(disposableFeatures);
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);


}

// this method is called when your extension is deactivated
export function deactivate() { }
