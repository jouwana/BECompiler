import * as vscode from 'vscode';
import { logMessage, checkOCamlInstallation, 
	 getInstallInstructions,
	 isOcamlFileType,
	 checkOcamlInstallationAndFile,
	 checkUtopInstallation, 
 } from './helpers';
import { sequentialUtopSpawn } from './compilers';
import { ResultPanel } from './panelProvider';
import { runServer } from './dataFlow_communication';

let utopStatusBar: vscode.StatusBarItem;


export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "BEC" is now active!');
	logMessage(context, 'Congratulations, your extension "BEC" is now active!');

	setupUtopStatusBar(context);

	let OcamlInstalled = true;

	if (!checkOCamlInstallation() && !checkUtopInstallation()) {
		vscode.window.showErrorMessage(
			"OCaml is not installed. " + getInstallInstructions()
		);
		logMessage(context, "OCaml is not installed. " + getInstallInstructions());
		OcamlInstalled = true;
		return;
	}

	//run the backend server
	runServer(context);

	//currently both commands are the same
	let ocamlUtopDisposable = vscode.commands.registerCommand(
		"BEC.runBEC",
		async () => {
			let ocamlFile = checkOcamlInstallationAndFile(OcamlInstalled);
			if (!ocamlFile) {
				return;
			}

			ResultPanel.createOrShow(context);
			//set 0.3 second delay to allow the webview to load
			setTimeout(() => {
				sequentialUtopSpawn(context, ocamlFile!, ResultPanel.getWebview());
			}, 300);
		}
	);

	context.subscriptions.push(ocamlUtopDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
		utopStatusBar.dispose();
}


function updateUtopStatusBarVisibility() {
	if (
		vscode.window.activeTextEditor &&
		isOcamlFileType(vscode.window.activeTextEditor.document)
	) {
		utopStatusBar.show();
	} else {
		utopStatusBar.hide();
	}
}


function setupUtopStatusBar(context: vscode.ExtensionContext) {
	utopStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
	utopStatusBar.command = "BEC.runBEC";
	utopStatusBar.text = "$(debug-console) BEC";
	utopStatusBar.tooltip = "Better Errors Compiler Using Utop";
	utopStatusBar.backgroundColor = "green";

	// Register event listeners
	vscode.window.onDidChangeActiveTextEditor(updateUtopStatusBarVisibility, null, context.subscriptions);
	vscode.workspace.onDidOpenTextDocument(updateUtopStatusBarVisibility, null, context.subscriptions);
	vscode.workspace.onDidCloseTextDocument(updateUtopStatusBarVisibility, null, context.subscriptions);

	// Initial update of the status bar visibility
	updateUtopStatusBarVisibility();

	context.subscriptions.push(utopStatusBar);
}
