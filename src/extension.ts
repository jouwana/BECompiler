import * as vscode from 'vscode';
import * as child_process from "child_process";
import * as os from "os";
import { generateWebViewContent } from './panels';
import { logMessage, checkOCamlInstallation,
	 getInstallInstructions, highlightTextInEditor, generateFileWithExtraPrints
 } from './helpers';
import { log } from 'console';



export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "BEC" is now active!');
	logMessage(context, 'Congratulations, your extension "BEC" is now active!');


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
			if (!ocamlFile) {
				vscode.window.showErrorMessage("No OCaml file opened");
				return;
			}

			// Compile the OCaml code using ocamlc compiler
			child_process.exec(`ocaml ${ocamlFile}`, (error, stdout, stderr) => {
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

				if(!errors){
					return;
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

			let extraLinesFilePath = await generateFileWithExtraPrints(ocamlFile);

			// Start the OCaml toplevel process
			const ocamlToplevel = child_process.spawn("ocaml", ["-noprompt"]);

			const ocamlFilePath = extraLinesFilePath.replace(/\\/g, "/");

			// Define the OCaml code to evaluate
			const ocamlCode = `
            #use "${ocamlFilePath}";;\n
        `;

			// Send the OCaml code to evaluate to the toplevel process
			ocamlToplevel.stdin.write(ocamlCode);
			ocamlToplevel.stdin.end();

			// Capture output from the toplevel process
			let output = "";
			let output_errors = "";
			let output_warnings = "";

			ocamlToplevel.stdout.on("data", (data) => {
				const message = data.toString();
				// Check if the message contains any indication of an error or warning
				if (message.includes("Error") || message.includes("Fatal error")) {
					output_errors += message;
				} else if (message.includes("Warning")) {
					output_warnings += message;
				} else {
					output += message;
				}
			});

			// Log the output when the process exits
			ocamlToplevel.on("close", (code) => {
				if(output_errors !== ""){
					return;
				}
				// Create a webview panel
				const panel2 = vscode.window.createWebviewPanel(
					"ocamlCompiler2", // Identifies the type of the webview. Used internally
					"OCaml Compiler2", // Title of the panel displayed to the user
					vscode.ViewColumn.Two, // Editor column to show the new webview panel in
					{ enableScripts: true }
				);
				logMessage(context, "output_errors: " + output_errors);
				logMessage(context, "output_warnings: " + output_warnings);

				// Set the HTML content of the webview panel
				panel2.webview.html = generateWebViewContent(
					context,
					output,
					output_errors,
					output_warnings
				);
			});
		}
	);

	context.subscriptions.push(ocamlCompilerDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

