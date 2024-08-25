import * as fs from "fs";
import * as vscode from "vscode";
import { logMessage, replaceGTsymbols, replaceLTsymbols } from "./helpers";

let outputSeparator = "------------------------------------\n";

export let getCodeSnippet = (ocamlFile: string): string[] => {
	//read the ocaml file using fs
	let ocamlCode = fs.readFileSync(ocamlFile, "utf8");
	//split the ocaml code into snippets
	const codeSnippets = ocamlCode
		.split(";;")
		.map((snippet) => {
			const changeAnonymousFunction = handleCodeWithAnonymousFunctions(snippet);
			const subSnippets = changeAnonymousFunction.split("\n");
			const filteredSnippet =
				subSnippets
					.filter((subSnippet) => {
						return subSnippet.trim() !== "";
					})
					.join("\n") + ";;\n";
			return filteredSnippet;
		})
		.filter((snippet) => {
			return !snippet.trim().startsWith(";;");
		});
	return codeSnippets;
}

export let logAndGetOutput = (context: vscode.ExtensionContext, value: string, isSnippet:boolean = false) :string => {
	let output = "";
	if (isSnippet) {
		output += outputSeparator;
		logMessage(context, "code snippet: " + value);
	} else logMessage(context, "output: " + value);
	//add separator to separate the output of different code snippets
	output += value + "\n";
	//replace all < and > with html symbols for them
	output = replaceLTsymbols(output);
	output = replaceGTsymbols(output);
	return output;
}

export let colorErrors = (context: vscode.ExtensionContext, output:string): string => {
	//separate colorErrors by outputSeparator
	//then color each section using colorErrorSection

	let sections = output.split(outputSeparator);
	let result = "";
	for (let section of sections) {
		let newSection = colorErrorSection(section) + outputSeparator;
		logMessage(context, "new section: " + newSection);
		result += newSection

	}
	return result;
}

let colorErrorSection = (output: string): string => {
	// Errors come in the form of "Error: line x, characters y-z: error message"
	// We want to underline the line x, characters y-z part in red
	const errorRegex = /Line (\d+), characters (\d+)-(\d+):/g;

	let match;
	let result = "";
	match = errorRegex.exec(output);
	if (match === null) return output;

	const line = parseInt(match[1]);
	let start = parseInt(match[2]);
	let end = parseInt(match[3]);


	// split the output into lines
	let lines = output.split("\n");

	let lineToChange = lines[line - 1];

	// get first part of the output
	result += lineToChange.substring(0, start);

	//if result includes &gt or &lt add 3 to the start and end
	if (result.includes("&gt") || result.includes("&lt")) {
		// add 3 characters to result
		result += lineToChange.substring(start, start+3);

		start += 3;
		end += 3;
	}

	// underline the error
	result += `<span style="text-decoration: wavy underline; text-decoration-color: red;">`;
	result += lineToChange.substring(start, end);
	result += `</span>`;
	// get the rest of the output
	result += lineToChange.substring(end);

	lines[line - 1] = result;

	return lines.join("\n");
}

let handleCodeWithAnonymousFunctions = (codeSnippet: string): string => {

	//trim all spaces from snippet into a temporary variable
	let temp_snippet = codeSnippet.replace(/\s/g, "");
	//check if the snipper starts with 'let () =' and does not have 'in' or ';' in it
	//it can still end with ';;'
	if (temp_snippet.startsWith("let()=") && !codeSnippet.includes(" in") && !temp_snippet.includes(";")) {

		//find position of '='
		let index = codeSnippet.indexOf("=");
		let code = "let _ = " + codeSnippet.substring(index + 1);
		return code;
	}
	return codeSnippet;
}