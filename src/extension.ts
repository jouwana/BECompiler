import * as vscode from 'vscode';
import { logMessage, checkOCamlInstallation, 
	 getInstallInstructions,
	 isOcamlFileType, 
 } from './helpers';
import { runChildExec, runChildSpawn, runChildSpawnSimplified } from './compilers';

let statusBar: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "BEC" is now active!');
	logMessage(context, 'Congratulations, your extension "BEC" is now active!');

	setupStatusBarButton(context);


	if (!checkOCamlInstallation()) {
		vscode.window.showErrorMessage(
			"OCaml is not installed. " + getInstallInstructions()
		);
		logMessage(context, "OCaml is not installed. " + getInstallInstructions());
		return;
	}

	let ocamlCompilerDisposable = vscode.commands.registerCommand(
		"BEC.compileOCaml",
		async () => {
			const ocamlFile = vscode.window.activeTextEditor?.document.uri.fsPath;
			if (
				!ocamlFile ||
				!isOcamlFileType(vscode.window.activeTextEditor?.document)
			) {
				vscode.window.showErrorMessage("No OCaml file opened");
				return;
			}

			// easy to show error messages in, but shows just the number values if evaluation
			// and does not show what it evaluated, and there is no space between different evaluations
			let withoutErrors = runChildExec(context, ocamlFile);

			if (withoutErrors) {
				// to show manual complex evaluation in, but error messages are about the wrong lines
				// as i had to manually add in the extra lines and print statements
				runChildSpawn(context, ocamlFile);
			}

			// shows the 'val' evaluations, but no space after let evaluations
			// better than the first one, but checks stdout for errors using text search
			runChildSpawnSimplified(context, ocamlFile);
		}
	);

	context.subscriptions.push(ocamlCompilerDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
		statusBar.dispose();
}

function updateStatusBarVisibility() {
	if (vscode.window.activeTextEditor && isOcamlFileType(vscode.window.activeTextEditor.document)) {
		statusBar.show();
	} else {
		statusBar.hide();
	}
}

function setupStatusBarButton(context: vscode.ExtensionContext) {
	statusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		1
	);
	statusBar.command = "BEC.compileOCaml";
	statusBar.text = "$(debug-console) BEC";
	statusBar.tooltip = "Compile OCaml code with Better Errors";
	statusBar.backgroundColor = new vscode.ThemeColor(
		"statusBarItem.errorBackground"
	);

	// Register event listeners
	vscode.window.onDidChangeActiveTextEditor(
		updateStatusBarVisibility,
		null,
		context.subscriptions
	);
	vscode.workspace.onDidOpenTextDocument(
		updateStatusBarVisibility,
		null,
		context.subscriptions
	);
	vscode.workspace.onDidCloseTextDocument(
		updateStatusBarVisibility,
		null,
		context.subscriptions
	);

	// Initial update of the status bar visibility
	updateStatusBarVisibility();

	context.subscriptions.push(statusBar);
}
