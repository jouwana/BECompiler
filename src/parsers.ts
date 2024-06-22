import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";


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


export function _getHtmlForWebview(context: vscode.ExtensionContext, data: string) {

		//create webview panel
		const panel = vscode.window.createWebviewPanel(
			"webview",
			"Webview",
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.joinPath(context.extensionUri, "out/compiled"),
					vscode.Uri.joinPath(context.extensionUri, "media"),
					vscode.Uri.joinPath(context.extensionUri, "out"),
				],
			}
		);
		const webview = panel.webview;
		const extensionUri = context.extensionUri;
		
		let htmlContent = fs.readFileSync(
			path.resolve(context.extensionPath, "media//tree.html"),
			"utf8"
		);
		console.log("is html content null? ", htmlContent === null);

		//change the placeholder to use the jsonpath
		htmlContent = htmlContent.replace("'PLACEHOLDER_DATA'", data);
		
		webview.html = htmlContent;

		//show the panel
		panel.reveal();
		
	}
