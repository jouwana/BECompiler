import * as vscode from "vscode";
import * as child_process from "child_process";
import * as fs from "fs";
import { generateCompilerWebViewContent } from "./panels";
import { generateFileWithExtraPrints, splitResultFromError } from "./parsers";
import { highlightFromError, logMessage } from "./helpers";
import { checkAndRunRequests } from "./ai_helpers";
import { log } from "console";

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

// export async function runChildSpawn(
// 	context: vscode.ExtensionContext,
// 	ocamlFile: string
// ) {
// 	let extraLinesFilePath = await generateFileWithExtraPrints(ocamlFile);

// 	// Start the OCaml toplevel process
// 	const ocamlToplevel = child_process.spawn("ocaml", ["-noprompt"]);

// 	const ocamlFilePath = extraLinesFilePath.replace(/\\/g, "/");

// 	// Define the OCaml code to evaluate
// 	const ocamlCode = `
// 				#use "${ocamlFilePath}";;\n
// 			`;

// 	// Send the OCaml code to evaluate to the toplevel process
// 	ocamlToplevel.stdin.write(ocamlCode);
// 	ocamlToplevel.stdin.end();

// 	// Capture output from the toplevel process
// 	let output = "";
// 	let output_errors = "";
// 	let output_warnings = "";

// 	ocamlToplevel.stdout.on("data", (data) => {
// 		const message = data.toString();
// 		// Check if the message contains any indication of an error or warning
// 		if (
// 			message.includes("Error") ||
// 			message.includes("Fatal error") ||
// 			message.includes("Exception") ||
// 			message.includes("Syntax error")
// 		) {
// 			output_errors += message;
// 		} else if (message.includes("Warning")) {
// 			output_warnings += message;
// 		} else {
// 			output += message;
// 		}
// 	});

// 	// Log the output when the process exits
// 	ocamlToplevel.on("close", (code) => {
// 		if (output_errors !== "") {
// 			return;
// 		}
// 		// Create a webview panel
// 		const panel2 = vscode.window.createWebviewPanel(
// 			"ocamlCompilerComp", // Identifies the type of the webview. Used internally
// 			"OCaml Compiler Full", // Title of the panel displayed to the user
// 			vscode.ViewColumn.Two, // Editor column to show the new webview panel in
// 			{ enableScripts: true }
// 		);

// 		// Set the HTML content of the webview panel
// 		panel2.webview.html = generateCompilerWebViewContent(
// 			context,
// 			output,
// 			output_errors,
// 			output_warnings,
// 			true
// 		);
// 	});

// }

export async function runTerminalUtopInterpreter(
	context: vscode.ExtensionContext,
	ocamlFile: string
) {
	const ocamlFilePath = ocamlFile.replace(/\\/g, "/");
	// open a terminal, and write the ocaml code to it for it to use the ocaml toplevel
	const terminal = vscode.window.createTerminal("Utop");
	terminal.show();
	const code = fs.readFileSync(ocamlFile, "utf8");
	terminal.sendText(`utop`);
	//wait for the terminal to open
	await new Promise((resolve) => setTimeout(resolve, 1000));
	terminal.sendText(code);
}

// export function runChildSpawnSimplified(
// 	context: vscode.ExtensionContext,
// 	ocamlFile: string
// ) {
// 	// Start the OCaml toplevel process
// 	const ocamlToplevel = child_process.spawn("ocaml", ["-noprompt"]);

// 	const ocamlFilePath = ocamlFile.replace(/\\/g, "/");

// 	// Define the OCaml code to evaluate
// 	const ocamlCode = `
// 				#use "${ocamlFilePath}";;\n
// 			`;

// 	// Send the OCaml code to evaluate to the toplevel process
// 	ocamlToplevel.stdin.write(ocamlCode);
// 	ocamlToplevel.stdin.end();

// 	// Capture output from the toplevel process
// 	let output = "";
// 	let output_errors = "";
// 	let output_warnings = "";

// 	ocamlToplevel.stdout.on("data", (data) => {
// 		const message = data.toString();
// 		// Check if the message contains any indication of an error or warning
// 		if (
// 			message.includes("Error") ||
// 			message.includes("Fatal error") ||
// 			message.includes("Exception") ||
// 			message.includes("Syntax error")
// 		) {
// 			logMessage(context, "output message: " + message);
// 			const splitResult = splitResultFromError(message);
// 			output_errors += splitResult.error;
// 			output += splitResult.result;
// 			logMessage(context, "output errors: " + output_errors);
// 			logMessage(context, "output result: " + output);
// 		} else if (message.includes("Warning")) {
// 			output_warnings += message;
// 		} else {
// 			output += message;
// 		}
// 	});

// 	// Log the output when the process exits
// 	ocamlToplevel.on("close", (code) => {

// 		// Create a webview panel
// 		const panel2 = vscode.window.createWebviewPanel(
// 			"ocamlCompilerSpawnSimpl", // Identifies the type of the webview. Used internally
// 			"OCaml Compiler Simplified", // Title of the panel displayed to the user
// 			vscode.ViewColumn.Two, // Editor column to show the new webview panel in
// 			{ enableScripts: true }
// 		);

// 		if (output_errors !== "") {
// 			//read the ocaml file using fs
// 			let ocamlCode = fs.readFileSync(ocamlFile, "utf8");
// 			//call the ai to generate the error explanation and solution
// 			checkAndRunRequests(context, ocamlCode, output_errors);
// 			highlightFromError(output_errors);
// 		}

// 		// Set the HTML content of the webview panel
// 		panel2.webview.html = generateCompilerWebViewContent(
// 			context,
// 			output,
// 			output_errors,
// 			output_warnings
// 		);
// 	});
// }


export async function runTerminalOcamlInterpreter(
	context: vscode.ExtensionContext,
	ocamlFile: string
) {
	const ocamlFilePath = ocamlFile.replace(/\\/g, "/");
	// open a terminal, and write the ocaml code to it for it to use the ocaml toplevel
	const terminal = vscode.window.createTerminal("ocaml");
	terminal.show();
	const code = fs.readFileSync(ocamlFile, "utf8");
	terminal.sendText(`ocaml`);
	//wait for the terminal to open
	await new Promise((resolve) => setTimeout(resolve, 1000));
	terminal.sendText(code);
}

export function sequentialUtopSpawn(context: vscode.ExtensionContext, ocamlFile: string) {
	//read the ocaml file using fs
	let ocamlCode = fs.readFileSync(ocamlFile, "utf8");
	//split the ocaml code into snippets
	const codeSnippets = ocamlCode.split(";;");
	let code_index = 1;
	let output = "";
	let first_read = true;
	let printing_index = 0;

	let utop = child_process.spawn("utop");

	utop.stdout.on("data", async (data) => {
		if(first_read){
			logMessage(context, "data read at start: " + data.toString());
			output += data.toString();
			if(data.toString().includes("help")){
				first_read = false;
				utop.stdin.write(codeSnippets[0] + ";;\n");
				return;
			}
			utop.stdin.write("");
		}
		if(data.toString().trim() !== "#" && data.toString().trim() !== "" && !first_read 
			&& printing_index < codeSnippets.length){
			output += codeSnippets[printing_index] + "\n";
			logMessage(context, "code snippet: " + codeSnippets[code_index]);
			printing_index++;
			logMessage(context, "output: " + data.toString());
			output += data.toString();
		}
		
		if (code_index < codeSnippets.length) {
			utop.stdin.write(codeSnippets[code_index] + ";;\n");
			code_index++;
		}
		else {
			utop.stdin.end();
		}

	});

	utop.on("close", (code) => {
		//make a webview panel
		const panel = vscode.window.createWebviewPanel(
			"ocamlCompilerSequential",
			"OCaml Compiler Sequential",
			vscode.ViewColumn.Two,
			{ enableScripts: true }
		);

		// Set the HTML content of the webview panel
		panel.webview.html = generateCompilerWebViewContent(
			context,
			output,
			null,
			null
		);
	});
}


