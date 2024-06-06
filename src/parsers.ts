import * as vscode from "vscode";
import * as fs from "fs";


export function splitOcamlCodeIntoSnippets(ocamlCode: string) : string[] {
	// the code is not always separated by line breaks or ;;
	// we need to split the code into snippets
	// and we will do this manually by checking for ;;, for new 'let' 
	// and for other commands at the start of lines
	let codeSnippets = [];
	let lines = ocamlCode.split("\n");
	let snippet = "";
	let prev_ended_with_in = false;
	for (let line of lines) {
		line = line.trim();
		if (line === "") {
			continue;
		}
		if ((line.startsWith("let") && !prev_ended_with_in)) {
			codeSnippets.push(snippet);
			snippet = "";
		}
		if (line.endsWith(";;")) {
			snippet += line + "\n";
			codeSnippets.push(snippet);
			snippet = "";
		}
		if (line.endsWith("in")) {
			prev_ended_with_in = true;
		}
		snippet += line + "\n";
	}
	if (snippet !== "") {
		codeSnippets.push(snippet);
	}
	return codeSnippets;
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


export function splitResultFromError(output: string) : { error: string, result: string }{
	// the output here will always have an error message
	// it will have a line start with 'File' leading to say where the error is
	// or it will be an exception message
	// we need to split the output into the error message and the result
	let error = "";
	let result = "";
	let lines = output.split("\n");
	let errorLine = 0;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith("File ")) {
			errorLine = i;
			break;
		}
	}
	error = lines.slice(errorLine).join("\n");
	result = lines.slice(0, errorLine).join("\n");
	return { error, result };
}
