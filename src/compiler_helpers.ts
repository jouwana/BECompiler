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
			const subSnippets = snippet.split("\n");
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