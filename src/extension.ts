import * as vscode from 'vscode';
import { logMessage, checkOCamlInstallation, 
	 getInstallInstructions,
	 isOcamlFileType,
	 checkOcamlInstallationAndFile, 
 } from './helpers';
import {runChildProcess, runTerminalUtopInterpreter, runTerminalOcamlInterpreter, sequentialUtopSpawn } from './compilers';

let ocamlStatusBar: vscode.StatusBarItem;
let utopStatusBar: vscode.StatusBarItem;


export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "BEC" is now active!');
	logMessage(context, 'Congratulations, your extension "BEC" is now active!');

	setupOcamlStatusBar(context);
	setupUtopStatusBar(context);

	let OcamlInstalled = true;

	if (!checkOCamlInstallation()) {
		vscode.window.showErrorMessage(
			"OCaml is not installed. " + getInstallInstructions()
		);
		logMessage(context, "OCaml is not installed. " + getInstallInstructions());
		OcamlInstalled = true;
		return;
	}

	let ocamlUtopDisposable = vscode.commands.registerCommand(
		"BEC.compileWithUtop",
		async () => {
			let ocamlFile = checkOcamlInstallationAndFile(OcamlInstalled);
			if (!ocamlFile) {
				return;
			}
			//runTerminalUtopInterpreter(context, ocamlFile);
			sequentialUtopSpawn(context, ocamlFile);
		}
	);

	let ocamlCompilerDisposable = vscode.commands.registerCommand(
		"BEC.compileWithOCaml",
		async () => {
			let ocamlFile = checkOcamlInstallationAndFile(OcamlInstalled);
			if (!ocamlFile) {
				return;
			}

			runTerminalOcamlInterpreter(context, ocamlFile);
		}
	);

	context.subscriptions.push(ocamlCompilerDisposable);
	context.subscriptions.push(ocamlUtopDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
		ocamlStatusBar.dispose();
		utopStatusBar.dispose();
}

function updateOcamlStatusBarVisibility() {
	if (vscode.window.activeTextEditor && isOcamlFileType(vscode.window.activeTextEditor.document)) {
		ocamlStatusBar.show();
	} else {
		ocamlStatusBar.hide();
	}
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

function setupOcamlStatusBar(context: vscode.ExtensionContext) {
	ocamlStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	ocamlStatusBar.command = "BEC.compileWithOCaml";
	ocamlStatusBar.text = "$(debug-console) BEC-O";
	ocamlStatusBar.tooltip = "Better Errors Compiler Using OCaml";
	ocamlStatusBar.backgroundColor = "orange";

	// Register event listeners
	vscode.window.onDidChangeActiveTextEditor(updateOcamlStatusBarVisibility, null, context.subscriptions);
	vscode.workspace.onDidOpenTextDocument(updateOcamlStatusBarVisibility, null, context.subscriptions);
	vscode.workspace.onDidCloseTextDocument(updateOcamlStatusBarVisibility, null, context.subscriptions);

	// Initial update of the status bar visibility
	updateOcamlStatusBarVisibility();

	context.subscriptions.push(ocamlStatusBar);
}

function setupUtopStatusBar(context: vscode.ExtensionContext) {
	utopStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
	utopStatusBar.command = "BEC.compileWithUtop";
	utopStatusBar.text = "$(debug-console) BEC-U";
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
