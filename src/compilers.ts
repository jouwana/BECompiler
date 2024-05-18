import * as vscode from "vscode";
import * as child_process from "child_process";
import * as fs from "fs";
import { generateCompilerWebViewContent } from "./panels";
import { generateFileWithExtraPrints, splitResultFromError } from "./parsers";
import { highlightFromError, logMessage } from "./helpers";
import { checkAndRunRequests } from "./ai_helpers";

export function runChildProcess(context: vscode.ExtensionContext, ocamlFile: string) {

/**this is the easiest way to get all the warnings and errors separated from the output
 * but it is not the best way to do it as it is blocking the main thread
 * and when its async, we cannot send the output to other compilers
 **/

	// try{
	// let buffer = child_process.execSync(`ocaml ${ocamlFile}`);
	// let output = buffer.toString();
	// let warnings = output.match(/Warning:.*\n/g);
	// let compiledCode = output.replace(/Error:.*\n/g, "").replace(/Warning:.*\n/g, "");
	// logMessage(context, "output: " + output);
	// logMessage(context, "warnings: " + warnings);
	// logMessage(context, "compiledCode: " + compiledCode);
	// }
	// catch(e){
	// 	logMessage(context, "error: " + e);
	// }

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
	});
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
		panel2.webview.html = generateCompilerWebViewContent(
			context,
			output,
			output_errors,
			output_warnings,
			true
		);
	});

}

export function runChildSpawnSimplified(
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
			logMessage(context, "output message: " + message);
			const splitResult = splitResultFromError(message);
			output_errors += splitResult.error;
			output += splitResult.result;
			logMessage(context, "output errors: " + output_errors);
			logMessage(context, "output result: " + output);
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

		if (output_errors !== "") {
			//read the ocaml file using fs
			let ocamlCode = fs.readFileSync(ocamlFile, "utf8");
			//call the ai to generate the error explanation and solution
			checkAndRunRequests(context, ocamlCode, output_errors);
			highlightFromError(output_errors);
		}

		// Set the HTML content of the webview panel
		panel2.webview.html = generateCompilerWebViewContent(
			context,
			output,
			output_errors,
			output_warnings
		);
	});
}