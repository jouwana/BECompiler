import * as vscode from 'vscode';
import * as child_process from "child_process";
import * as os from "os";
import { generateWebViewContent } from './panels';
import { logMessage, isUtopInstalled, checkOCamlInstallation,
	 getInstallInstructions, highlightTextInEditor
 } from './helpers';



export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "BEC" is now active!');
	logMessage(context, 'Congratulations, your extension "BEC" is now active!');

     let utopInstalled = isUtopInstalled();


	if (!checkOCamlInstallation()) {
		vscode.window.showErrorMessage(
			"OCaml is not installed. " + getInstallInstructions()
		);
		logMessage(context, "OCaml is not installed. " + getInstallInstructions());
		return;
	}

	let ocamlCompilerDisposable = vscode.commands.registerCommand(
		"BEC.compileOCaml",
		() => {
			const ocamlFile = vscode.window.activeTextEditor?.document.uri.fsPath;
			if (!ocamlFile) {
				vscode.window.showErrorMessage("No OCaml file opened");
				return;
			}

			let runScript = isUtopInstalled() ? "utop <" : "ocaml";
			// Compile the OCaml code using ocamlc compiler
			child_process.exec(`${runScript} ${ocamlFile}`, (error, stdout, stderr) => {
				let compiledCode = "";
				let errors = null;
				let warnings = null;

				if (error) {
					errors = error.message;
				} else {
					compiledCode = stdout;
					if (stderr) {
						warnings = stderr;
					}
				}

				// Create a webview panel
				const panel = vscode.window.createWebviewPanel(
					"ocamlCompiler", // Identifies the type of the webview. Used internally
					"OCaml Compiler", // Title of the panel displayed to the user
					vscode.ViewColumn.Two, // Editor column to show the new webview panel in
					{ enableScripts: true }
				);

				// Set the HTML content of the webview panel
				panel.webview.html = generateWebViewContent(
					context,
					compiledCode,
					errors,
					warnings
				);

				highlightTextInEditor();
			});
		}
	);

	context.subscriptions.push(ocamlCompilerDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

