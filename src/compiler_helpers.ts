import * as fs from "fs";
import * as vscode from "vscode";
import { logMessage } from "./helpers";

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
		output += "------------------------------------\n";
		logMessage(context, "code snippet: " + value);
	}
	else logMessage(context, "output: " + value);
	//add separator to separate the output of different code snippets
	output += value + "\n";
	return output;
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