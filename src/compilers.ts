import * as vscode from "vscode";
import * as child_process from "child_process";
import * as fs from "fs";
import { generateCompilerWebViewContent, mainHTML } from "./panels";
import { splitOcamlCodeIntoSnippets, splitResultFromError } from "./parsers";
import { highlightFromError, logMessage } from "./helpers";
import { checkAndRunRequests } from "./ai_helpers";
import { log } from "console";
import path from "path";

export function runChildProcess(context: vscode.ExtensionContext, ocamlFile: string) {

/**this is the easiest way to get all the warnings and errors separated from the output
 * but it is not the best way to do it as it is blocking the main thread
 * and when its async, we cannot send the output to other compilers
 **/

	logMessage(context, "----SYNC OCAML COMPILER----");
	try{
	ocamlFile = ocamlFile.replace(/\\/g, "/");
	let buffer = child_process.execSync(`echo #use "${ocamlFile}";; | utop`);
	let output = buffer.toString();
	let warnings = output.match(/Warning:.*\n/g);
	let compiledCode = output.replace(/Error:.*\n/g, "").replace(/Warning:.*\n/g, "");
	logMessage(context, "output: " + output);
	logMessage(context, "warnings: " + warnings);
	logMessage(context, "compiledCode: " + compiledCode);
	}
	catch(e){
		logMessage(context, "error: " + e);
	}

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


export function sequentialUtopSpawn(context: vscode.ExtensionContext, ocamlFile: string) {
	//read the ocaml file using fs
	let ocamlCode = fs.readFileSync(ocamlFile, "utf8");
	//split the ocaml code into snippets
	const codeSnippets = ocamlCode.split(";;")
		.map((snippet) => {
			const subSnippets = snippet.split("\n");
			const filteredSnippet = subSnippets.filter((subSnippet) => {
				return subSnippet.trim() !== "";
			}).join("\n") + ";;\n";
			return filteredSnippet;
	});

	let code_index = 1;
	let output = "";
	let first_read = true;
	let printing_index = 0;

	let spawnedInterpreter = child_process.spawn("utop");

	spawnedInterpreter.stdout.on("data", async (data) => {
		if (first_read) {
			logMessage(context, "data read at start: " + data.toString());
			output += data.toString();
			if (data.toString().includes("help")) {
				first_read = false;
				spawnedInterpreter.stdin.write(codeSnippets[0]);
				return;
			}
			spawnedInterpreter.stdin.write("");
		}
		if (
			data.toString().trim() !== "#" &&
			data.toString().trim() !== "" &&
			!first_read &&
			printing_index < codeSnippets.length
		) {
			output += codeSnippets[printing_index] + "\n";
			logMessage(context, "code snippet: " + codeSnippets[code_index]);
			printing_index++;
			logMessage(context, "output: " + data.toString());
			output += data.toString() + "\n";
		}

		if (code_index < codeSnippets.length) {
			spawnedInterpreter.stdin.write(codeSnippets[code_index]);
			code_index++;
		} else {
			spawnedInterpreter.stdin.end();
		}
	});

	spawnedInterpreter.on("close", async (code) => {
		//make a webview panel
		const panel = vscode.window.createWebviewPanel(
			`utopCompilerSequential`,
			`Utop Compiler Sequential`,
			vscode.ViewColumn.Two,
			{ enableScripts: true,
			localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
			 }
		);

		// Set the HTML content of the webview panel
		panel.webview.html = generateCompilerWebViewContent(
			context,
			output,
			null,
			null
		);

		panel.webview.onDidReceiveMessage(message=>{
			logMessage(context, "message received: " + message.command);
			switch(message.command){
				case 'runAI':
					checkAndRunRequests(context, output, "");
					return;
			}
		});
	});
}