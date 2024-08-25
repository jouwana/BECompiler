import * as vscode from "vscode";
import * as child_process from "child_process";
import { logMessage } from "./helpers";
import { colorErrors, getCodeSnippet, logAndGetOutput } from "./compiler_helpers";
import { ERROR_NO_RETURN_VALUE } from "./consts";


export function sequentialUtopSpawn(context: vscode.ExtensionContext, ocamlFile: string, webviewPanel: vscode.WebviewPanel) {
	let codeSnippets = getCodeSnippet(ocamlFile);
	
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
				output += logAndGetOutput(context, codeSnippets[0], true);
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
			let span_color = data.toString().includes("Error")
				? "red"
				: data.toString().includes("Warning")
				? "yellow"
				: data.toString().includes("Hint")
				? "dodgerblue"
				: "";
			if(span_color !== "") {
				output += `<span style="color: ${span_color};">`;
			}
			output += logAndGetOutput(context, data.toString());
			if (span_color !== "") {
				output += `</span>`;
			}
			if((data.toString().includes("Warning") || data.toString().includes("Hint"))
			&& !data.toString().includes("Error")){
				// warning or hints are printer WITH another output, so we do not add 
				// them to the printing index
				return;
			}
			printing_index++;
			if(printing_index >= codeSnippets.length){
				//end the process when we finish printing everything
				spawnedInterpreter.stdin.end();
			}
		}

		if (code_index < codeSnippets.length) {
			// add the timer wait in the sense that 'hints' 
			// will be printed after the error message, so 
			// we will give it time
			setTimeout(() => {
				if (printing_index < code_index)
					// if the output has not been printed yet, return;
					return;
				spawnedInterpreter.stdin.write(codeSnippets[code_index]);
				output += logAndGetOutput(context, codeSnippets[code_index], true);
				code_index++;
			}, 200);
		}
	});
	
	spawnedInterpreter.on("close", async (code) => {
		if( output === "") {
			output = ERROR_NO_RETURN_VALUE;
		}
		else {
			// color errors
			output = colorErrors(context, output);
		}
		//sent the message to the webviewPanel
		webviewPanel.webview.postMessage({
			command: "compilation_results",
			value: output,
		});
	});
}