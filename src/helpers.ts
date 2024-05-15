import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';



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

// Function to highlight text in the editor
export function highlightTextInEditor() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		// Define a range to be highlighted
		const startPosition = new vscode.Position(1, 0); // Example start position
		const endPosition = new vscode.Position(1, 10); // Example end position
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

// Function to check if utop is installed
export function isUtopInstalled() {
    try {
        // Run utop with --version option to check if it's installed
        child_process.execSync('utop --version');
        return true;
    } catch (error) {
        return false;
    }
}


// Function to parse OCaml compiler output and format it
export function parseOCamlOutput(output : string) : string {
	const lines = output.trim().split("\n");
	let result = "";

	for (let line of lines) {
		line = line.trim();

		// Check if the line starts with '#' (indicating an OCaml directive or output)
		if (line.startsWith("#")) {
			result += line + "\n";
		} else {
			// If not, assume it's a result of OCaml expression evaluation
			result += "# " + line + "\n";
		}
	}

	return result;
}

// Function to log messages to a file
export function logMessage(context: vscode.ExtensionContext, message: string) {
    const logFilePath = path.join(context.extensionPath, 'webview-log.txt');
    fs.appendFileSync(logFilePath, message + '\n');
}