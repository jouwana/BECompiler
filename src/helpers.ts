import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';

export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
	};
}


/**
 * 
 * @param ocamlIsInstalled True if OCaml is installed, false otherwise
 * @returns The path of the OCaml file if it exists, null otherwise
 */
export function checkOcamlInstallationAndFile(ocamlIsInstalled: boolean) {
	if (!ocamlIsInstalled) {
		vscode.window.showErrorMessage(
			"OCaml is not installed. " + getInstallInstructions()
		);
		return null;
	}

	const ocamlFile = vscode.window.activeTextEditor?.document.uri.fsPath;
	if (!ocamlFile || !isOcamlFileType(vscode.window.activeTextEditor?.document)) {
		vscode.window.showErrorMessage("No OCaml file opened");
		return null;
	}
	return ocamlFile;
}

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



//helper class for the state of the webview
export class WebviewState {
	private state: string = "loading";
	private compilation_results: string = "";
	private flow_results: string = "";
	private ai_results: string = "";
	private fullscreen: boolean = false;

	public getWebviewState(): any {
		return {
			state: this.state,
			compilation_result: this.compilation_results,
			flow_results: this.flow_results,
			ai_results: this.ai_results,
			fullscreen: this.fullscreen,
		};
	}

	public setWebviewState(new_state: {
		state?: string;
		compilation_results?: string;
		flow_results?: string;
		ai_results?: string;
		fullscreen?: boolean;
	}) {
		this.state = new_state.state ? new_state.state : this.state;
		this.compilation_results = new_state.compilation_results
			? new_state.compilation_results
			: this.compilation_results;
		this.flow_results = new_state.flow_results
			? new_state.flow_results
			: this.flow_results;
		this.ai_results = new_state.ai_results
			? new_state.ai_results
			: this.ai_results;
		this.fullscreen = new_state.fullscreen !== undefined
			? new_state.fullscreen
			: this.fullscreen;
	}
}