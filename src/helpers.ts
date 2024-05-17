import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';

/**
 * 
 * @param document The active text document
 * @returns True if the active document is an OCaml file, false otherwise
 */
export function isOcamlFileType(document: vscode.TextDocument | undefined) {

	return document? document.languageId === 'ocaml' : false;
}

/**
 * 
 * @returns True if OCaml is installed, false otherwise
 */
export function checkOCamlInstallation(): boolean {
	const platform = os.platform();
	let command: string;
	if (platform === "win32") {
		command = "where ocamlc";
	} else {
		command = "which ocamlc";
	}

	try {
		child_process.execSync(command);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * 
 * @returns The installation instructions for OCaml based on the user's platform
 */
export function getInstallInstructions(): string {
	const platform = os.platform();
	switch (platform) {
		case "win32":
			return "Please download and install OCaml from https://ocaml.org/docs/install.html#windows";
		case "darwin":
			return "Please install OCaml via Homebrew: brew install ocaml";
		case "linux":
			return "Please install OCaml using your distribution's package manager (e.g., apt-get, yum, pacman).";
		default:
			return "Please visit the official OCaml website for installation instructions: https://ocaml.org/docs/install.html";
	}
}


/**
 * 
 * @param context  The extension context
 * @param message The message to log
 * @param file The file to log the message to, defaults to 'webview-log.txt'
 * Logs a message to a file in the extension directory
 */
export function logMessage(context: vscode.ExtensionContext, message: string, file: string = 'webview-log.txt') {
    const logFilePath = path.join(context.extensionPath, file);
    fs.appendFileSync(logFilePath, message + '\n');
}


/**
 * 
 * @param startLine  The start line of the range to be highlighted
 * @param startChar  The start character of the range to be highlighted
 * @param endLine  The end line of the range to be highlighted
 * @param endChar  The end character of the range to be highlighted
 * Highlights a range of text in the active editor
 */
export function highlightTextInEditor( startLine: number,startChar:number, endLine: number, endChar: number) {
	// the line numbers start from 0, so we need to subtract 1
	startLine--;
	endLine--;
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		// Define a range to be highlighted
		const startPosition = new vscode.Position(startLine, startChar); // Example start position
		const endPosition = new vscode.Position(endLine, endChar); // Example end position
		const range = new vscode.Range(startPosition, endPosition);

		// Apply a decoration to the range
		const decorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: "yellow",
			borderWidth: "1px",
			borderStyle: "solid",
			borderColor: "red",
			overviewRulerColor: "red",
			overviewRulerLane: vscode.OverviewRulerLane.Right,
		});
		editor.setDecorations(decorationType, [range]);
	} else {
		vscode.window.showInformationMessage("No active editor found.");
	}
}
