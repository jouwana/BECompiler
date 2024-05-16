import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';


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



/**
 * 
 * @param output The output from the OCaml compiler
 * @returns The parsed output from the OCaml compiler, with some additional print statements and empty lines removed
 */
export function parseOCamlCompilerOutput(output : string) : string {
	const lines = output.trim().split("\n");
	let result = "";

	let nonEmptyLineCounter = 0;

	for (let line of lines) {
		line = line.trim();
		if (line === "") {
			continue;
		}
		if(line.startsWith("OCaml")) {
			result += line + "\n";
			continue;
		}
		nonEmptyLineCounter++;

		if (nonEmptyLineCounter %3 === 0) {
			//all third lines should be the 'type' of empty line print after the evaluation
			//we need to remove them
			continue;
		}

		let newLine;
		if(line.indexOf(";;") !== -1) {
			newLine = line.substring(0, line.indexOf(";;")+2);
		}
		else {
			newLine = line;
		}
		// result / evaluation line should now have #
		if (nonEmptyLineCounter % 3 === 2) {
			result += newLine + "\n";
		} else {
			// If not, assume its the line from the code
			result += "# " + newLine + "\n";
		}
	}

	return result;
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
 * @param ocamlFile  The path to the OCaml file
 * @returns  The path to the temporary file with extra print statements that emulates the OCaml toplevel (problematic)
 */
export async function generateFileWithExtraPrints(ocamlFile: string) {
	// Read the content of the OCaml file
    const content = fs.readFileSync(ocamlFile, 'utf-8');

    // Split the content into lines
    const lines = content.split('\n');

    // Create a temporary file to store the modified content
    const tempFilePath = `${ocamlFile}.tmp`;
    fs.writeFileSync(tempFilePath, '');

	let longLine= "";

    // Iterate over the lines, adding print statements and empty lines
    for (const line of lines) {
		if(line.trim() === "") {
			continue;
		}
		if(line.trim().endsWith(";;")) {
			longLine === "" ? longLine = line : longLine += line;
			longLine = longLine.replaceAll("\r", "");
			
			let newline = longLine.trim();
			fs.appendFileSync(tempFilePath, `print_string "${newline.replaceAll("\"", "\'")}";;\n`);
			fs.appendFileSync(tempFilePath, `${newline}\n`);
			fs.appendFileSync(tempFilePath, `print_endline "";;\n`);
			longLine = "";
		}
		else{
			longLine += line;
		}
	}

    // Open the temporary file in a new editor tab
    const document = await vscode.workspace.openTextDocument(tempFilePath);
	return tempFilePath;
}
