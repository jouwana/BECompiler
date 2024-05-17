import * as vscode from "vscode";
import * as child_process from "child_process";
import * as os from "os";
import { generateWebViewContent } from "./panels";
import { logMessage, highlightTextInEditor} from "./helpers";
import { generateFileWithExtraPrints } from "./parsers";


export function runChildExec(
	context: vscode.ExtensionContext,
	ocamlFile: string
): boolean {
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

		if (!errors) {
			return true;
		}
		// Create a webview panel
		const panel = vscode.window.createWebviewPanel(
			"ocamlCompiler", // Identifies the type of the webview. Used internally
			"OCaml Compiler Minimal", // Title of the panel displayed to the user
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

		// Highlight the error line in the editor
		for (const line of errors.split(os.EOL)) {
			//find the line number
			let lineNumber = line.indexOf("line ");
			if (lineNumber !== -1) {
				lineNumber = parseInt(
					line.substring(lineNumber + 5, line.indexOf(",", lineNumber))
				);
			}
			let startChar = line.indexOf("characters ");
			let endChar = -1;
			if (startChar !== -1) {
				startChar = parseInt(
					line.substring(startChar + 10, line.indexOf("-", startChar))
				);
				endChar = parseInt(
					line.substring(
						line.indexOf("-", startChar) + 1,
						line.indexOf(":", line.indexOf("-", startChar) + 1)
					)
				);
			}
			if (lineNumber !== -1 && startChar !== -1 && endChar !== -1) {
				highlightTextInEditor(lineNumber, startChar, lineNumber, endChar);
			}
		}
	});
	return false;
}

export async function runChildSpawn(
	context: vscode.ExtensionContext,
	ocamlFile: string
) {
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
		if (
			message.includes("Error") ||
			message.includes("Fatal error") ||
			message.includes("Exception") ||
			message.includes("Syntax error")
		) {
			output_errors += message;
		} else if (message.includes("Warning")) {
			output_warnings += message;
		} else {
			output += message;
		}
	});

	// Log the output when the process exits
	ocamlToplevel.on("close", (code) => {
		if (output_errors !== "") {
			return;
		}
		// Create a webview panel
		const panel2 = vscode.window.createWebviewPanel(
			"ocamlCompilerComp", // Identifies the type of the webview. Used internally
			"OCaml Compiler Full", // Title of the panel displayed to the user
			vscode.ViewColumn.Two, // Editor column to show the new webview panel in
			{ enableScripts: true }
		);

		// Set the HTML content of the webview panel
		panel2.webview.html = generateWebViewContent(
			context,
			output,
			output_errors,
			output_warnings,
			true
		);
	});
}

export async function runChildSpawnSimplified(
	context: vscode.ExtensionContext,
	ocamlFile: string
) {
	// Start the OCaml toplevel process
	const ocamlToplevel = child_process.spawn("ocaml", ["-noprompt"]);

	const ocamlFilePath = ocamlFile.replace(/\\/g, "/");

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
		if (
			message.includes("Error") ||
			message.includes("Fatal error") ||
			message.includes("Exception") ||
			message.includes("Syntax error")
		) {
			output_errors += message;
		} else if (message.includes("Warning")) {
			output_warnings += message;
		} else {
			output += message;
		}
	});

	// Log the output when the process exits
	ocamlToplevel.on("close", (code) => {
		// Create a webview panel
		const panel2 = vscode.window.createWebviewPanel(
			"ocamlCompilerSpawnSimpl", // Identifies the type of the webview. Used internally
			"OCaml Compiler Simplified", // Title of the panel displayed to the user
			vscode.ViewColumn.Two, // Editor column to show the new webview panel in
			{ enableScripts: true }
		);

		// Set the HTML content of the webview panel
		panel2.webview.html = generateWebViewContent(
			context,
			output,
			output_errors,
			output_warnings
		);
	});
}
