import * as vscode from "vscode";
import { getNonce } from "./nonce";
import { sequentialUtopSpawn } from "./compilers";
import { checkAndRunRequests, updateAndRequestAST } from "./ai_helpers";
import { PROMPT_CODE_EXAMPLE, PROMPT_ERROR_EXAMPLE } from "./consts";
import { WebviewState } from "./helpers";
import * as ChildProcess from "child_process";

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

	private static _webviewState: WebviewState = new WebviewState();

	public static getWebview(): vscode.WebviewPanel {
		return ResultPanel.currentPanel!._panel;
	}

	public static createOrShow(context: vscode.ExtensionContext, fullscreen?: boolean) {
		let extensionUri = context.extensionUri;

		const column = fullscreen? vscode.ViewColumn.One : vscode.ViewColumn.Two;

		// uf we are creating a new webview instead of wanting to change view type
		// then set up the new context and paths
		if(fullscreen === undefined) {
			ResultPanel.extensionContext = context;

			ResultPanel.currentFilePath =
				vscode.window.activeTextEditor?.document.uri.fsPath;
		}
		


		// If we already have a panel, delete it
		if (ResultPanel.currentPanel) {
			ResultPanel.currentPanel.dispose();
		}

		//if we dont have a state, or its a new view, create a new one
		if (!ResultPanel._webviewState || fullscreen === undefined) {
			ResultPanel._webviewState = new WebviewState();
		}
		
		// create a new panel.
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
				case "recompile": {
					//check if saved filepath still exists
					if (!ResultPanel.currentFilePath) {
						vscode.window.showErrorMessage("no saved file path");
						return;
					}
					//reset webviewState
					ResultPanel._webviewState = new WebviewState();

					//sent to compiler
					sequentialUtopSpawn(
						ResultPanel.extensionContext!,
						ResultPanel.currentFilePath,
						this._panel
					);
					break;
				}
				case "runLLM": {
					//check if saved filepath still exists
					if (!ResultPanel.currentFilePath) {
						vscode.window.showErrorMessage("no saved file path");
						return;
					}

					if (!data.value) {
						vscode.window.showErrorMessage(
							"no compilation resutls found, please recompile first"
						);
						return;
					}

					let compilation_results = data.value;

					checkAndRunRequests(
						ResultPanel.extensionContext!,
						compilation_results,
						"",
						this._panel
					);
					break;
				}
				case "toggleFullscreen": {
					//create the webview state from data
					const new_state = {
						...data.value,
						ast_results:
							ResultPanel._webviewState.getWebviewState().ast_results,
					};
					ResultPanel._webviewState.setWebviewState(new_state);
					console.log("new state fullscreen: ", new_state.fullscreen);
					ResultPanel.createOrShow(ResultPanel.extensionContext!, new_state.fullscreen);
					break;
				}
				case 'ast':{

					//check if saved filepath still exists
					if (!ResultPanel.currentFilePath) {
						vscode.window.showErrorMessage("no saved file path");
						return;
					}
					let parsedTreeOutput = "";
					//use sync spawn child process to execute ocamlc with flad -dparsetree
					//and take the stderr output from it
					if(ResultPanel._webviewState.getWebviewState().ast_results === "") {
						const parsedTree = ChildProcess.spawnSync("ocamlc", ["-dparsetree", ResultPanel.currentFilePath]);
						parsedTreeOutput = parsedTree.stderr.toString();
					}

					updateAndRequestAST(ResultPanel.extensionContext!, parsedTreeOutput, ResultPanel._webviewState, this._panel);
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
		const stylesResultsUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "results.css")
		);

		// join path with xyflow in node modules
		const xyflowUri = webview.asWebviewUri(
		 vscode.Uri.joinPath(this._extensionUri, "node_modules", "x@yflow", "svelte", "dist", "lib", "index.js")
		)


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
				<link href="${stylesResultsUri}" rel="stylesheet">
        <script nonce="${nonce}">
		const tsvscode = acquireVsCodeApi();
		webviewState = ${JSON.stringify(ResultPanel._webviewState)};
        </script>
		<script nonce="${nonce}" type="module">
		import  {SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type NodeTypes,
		type Node,
		type Edge} from '${xyflowUri}';
		</script>
		</head>
		<body>
		</body>
		<script nonce="${nonce}" src="${scriptUri}"></script>
		</html>`;
	}
}
