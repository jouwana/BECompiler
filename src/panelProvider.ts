import * as vscode from "vscode";
import { getNonce } from "./nonce";
import { sequentialUtopSpawn } from "./compilers";
import { checkAndRunRequests } from "./ai_helpers";
import { PROMPT_CODE_EXAMPLE, PROMPT_ERROR_EXAMPLE } from "./consts";

export class ResultPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: ResultPanel | undefined;

	public static readonly viewType = "result-panel";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static currentFilePath: string | undefined;
	public static extensionContext: vscode.ExtensionContext | undefined;

	public static createOrShow(context: vscode.ExtensionContext) {
		let extensionUri = context.extensionUri;
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		ResultPanel.extensionContext = context;
		console.log("current file path: ", vscode.window.activeTextEditor?.document.uri.fsPath);
		console.log("context is null? ", ResultPanel.extensionContext === undefined);
			ResultPanel.currentFilePath =
				vscode.window.activeTextEditor?.document.uri.fsPath;
		


		// If we already have a panel, show it.
		if (ResultPanel.currentPanel) {
			ResultPanel.currentPanel._panel.reveal(column);
			ResultPanel.currentPanel._update();
			return;
		}


		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			ResultPanel.viewType,
			"BEC",
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [
					vscode.Uri.joinPath(extensionUri, "media"),
					vscode.Uri.joinPath(extensionUri, "out/compiled"),
				],
			}
		);

		ResultPanel.currentPanel = new ResultPanel(panel, context);
	}

	public static kill() {
		ResultPanel.currentPanel?.dispose();
		ResultPanel.currentPanel = undefined;
	}

	public static revive(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
		ResultPanel.currentPanel = new ResultPanel(panel, context);
	}

	private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
		this._panel = panel;
		this._extensionUri = context.extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// // Handle messages from the webview
		// this._panel.webview.onDidReceiveMessage(
		//   (message) => {
		//     switch (message.command) {
		//       case "alert":
		//         vscode.window.showErrorMessage(message.text);
		//         return;
		//     }
		//   },
		//   null,
		//   this._disposables
		// );
	}

	public dispose() {
		ResultPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private async _update() {
		const webview = this._panel.webview;

		this._panel.webview.html = this._getHtmlForWebview(webview);
		webview.onDidReceiveMessage(async (data) => {
			switch (data.command) {
				case "onInfo": {
					if (!data.value) {
						return;
					}
					vscode.window.showInformationMessage(data.value);
					break;
				}
				case "onError": {
					if (!data.value) {
						return;
					}
					vscode.window.showErrorMessage(data.value);
					break;
				}
				case "recompile":{
					//check if saved filepath still exists
					if(!ResultPanel.currentFilePath){
						vscode.window.showErrorMessage("no saved file path");
						return;
					}

					//sent to compiler
					sequentialUtopSpawn(ResultPanel.extensionContext!, ResultPanel.currentFilePath);
					break;
				}
				case "runLLM":{
					//check if saved filepath still exists
					if(!ResultPanel.currentFilePath){
						vscode.window.showErrorMessage("no saved file path");
						return;
					}

					checkAndRunRequests(ResultPanel.extensionContext!, PROMPT_CODE_EXAMPLE, PROMPT_ERROR_EXAMPLE);
					break;
				}
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// // And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "out/compiled", "compilation_results.js")
		);
		const cssUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "out/compiled", "compilation_results.css")
		);
		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
		);
		const stylesMainUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
		);
		// const cssUri = webview.asWebviewUri(
		// 	vscode.Uri.joinPath(this._extensionUri, "out", "compiled/swiper.css")
		// );

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
			webview.cspSource
		}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<link href="${cssUri}" rel="stylesheet">
        <script nonce="${nonce}">
		const tsvscode = acquireVsCodeApi();
        </script>
		</head>
		<body>
		</body>
		<script nonce="${nonce}" src="${scriptUri}"></script>
		</html>`;
	}
}
