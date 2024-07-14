import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';


//helper class for the state of the webview
export class WebviewState {
	private state: string = "loading";
	private compilation_results: string = "";
	private flow_results: string = "";
	private ai_results: string = "";
	private fullscreen: boolean = false;
	private ast_results: string = "";

	public getWebviewState(): any {
		return {
			state: this.state,
			compilation_result: this.compilation_results,
			flow_results: this.flow_results,
			ai_results: this.ai_results,
			fullscreen: this.fullscreen,
			ast_results: this.ast_results
		};
	}

	public setWebviewState(new_state: {
		state?: string;
		compilation_results?: string;
		flow_results?: string;
		ai_results?: string;
		fullscreen?: boolean;
		ast_results?: string;
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
		this.fullscreen =
			new_state.fullscreen !== undefined
				? new_state.fullscreen
				: this.fullscreen;
		this.ast_results = new_state.ast_results
				? new_state.ast_results 
				: this.ast_results;
	}
}


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
 * @returns True if Utop is installed, false otherwise
 */
export function checkUtopInstallation(): boolean {
	const platform = os.platform();
	let command: string;
	if (platform === "win32") {
		command = "where utop";
	} else {
		command = "which utop";
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
 *  Reveal a line in the active text editor
 * @param editor The active text editor
 * @param lineNumber  The line number to reveal in the editor
 */
export function revealLineInEditor(editor: vscode.TextEditor, lineNumber: number) {
	const position = new vscode.Position(lineNumber, 0);
	const range = new vscode.Range(position, position);
	editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
	editor.selection = new vscode.Selection(position, position);
}

export function highlightUnknownTypes(inputString: String): String {
	// Regex to match (?letters) where letters can be any sequence of alphabets
	const regex = /\(\?([a-zA-Z]+[)]?(\s)?(->)?)/g;

	// Replace matches with <abbr> tags
	const result = inputString.replace(regex, (match, unknownType) => {
		// Create abbr element with title attribute
		const title = "an unknown type, function type or block type found during unification process.\n"+
		"If seen multiple times with the same identifier, those appearances share the same type.";
		let hasArrow = unknownType.includes("->");
		if(hasArrow) {
			unknownType = unknownType.replace("->", "");
		}
		return `<abbr style="color:lightYellow" title="${title}">(?${unknownType}</abbr> ${hasArrow ? "->" : ""}`;
	});

	return result;
}


export function fixSomeTooManyTabs(inputString: string): string {
	const regex = /(\t{4,}|\s{15,})[^\^]+\n/g;

	return inputString.replace(regex, (match) => {
		return match.replace(/\t{4,}|\s{15,}/g, "	");
	});
}

export function replaceLTsymbols(inputString: string): string {
		return inputString.replace(/</g, "&lt;");
}

export function replaceGTsymbols(inputString: string): string {
	return inputString.replace(/>/g, "&gt;");
}