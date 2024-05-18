import { logMessage } from "./helpers";
import * as vscode from "vscode";
import {parseOCamlCompilerOutput} from "./parsers";
import { error } from "console";


export function generateLoadingWebViewContent(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Better Errors OCaml Compiler</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 90vh;
                    width: 90vw;
                }
                .loader {
                    border: 16px solid #f3f3f3; /* Light grey */
                    border-top: 16px solid #3498db; /* Blue */
                    border-radius: 50%;
                    width: 120px;
                    height: 120px;
                    animation: spin 2s linear infinite;
                    }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <h1>Loading...</h1>
            <div class="loader"></div>
        </body>
        </html>
    `;
}

export function genereateAIResultsWebViewContent(
    context: vscode.ExtensionContext,
    response: string,
    errors: string | null,
): string {
    let content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Results</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    height: 90vh;
                    width: 90vw;
                    display: flex;
                    flex-direction: column;
                    
                }
                .resp {
                    display: flex;
                    flex-direction: column;
                    oveflow-wrap: break-word;
                }
            </style>
        </head>
        <body>
            <h1>AI Generated Results</h1>
            <div class="resp">${response}</div>
            </ br>
        </body>
        </html>
        `;
    return content;
}

export function generateCompilerWebViewContent(
    context: vscode.ExtensionContext,
	compiledCode: string,
	errors: string | null,
	warnings: string | null,
    parse: boolean = false
): string {

    let parsedCompiledCode = parseOCamlCompilerOutput(compiledCode);

	let content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Better Erroros Ocaml Compiler</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    width: 90vw;
                }
                .error-panel, .warning-panel {
                    display: none;
                }
            </style>
            <script>
                function togglePanel(panelClass) {
                    ${logMessage(context, "toggle panel clicked in webview")};
                    const panels = document.querySelectorAll('.' + panelClass);
                    panels.forEach(panel => {
                        const isVisible = panel.style.display === 'block';
                        panel.style.display = isVisible ? 'none' : 'block';
                        document.querySelector('#' + panelClass + '-button').textContent = isVisible ? 'Show ' + panelClass.split('-')[0].charAt(0).toUpperCase() + panelClass.split('-')[0].slice(1) : 'Hide ' + panelClass.split('-')[0].charAt(0).toUpperCase() + panelClass.split('-')[0].slice(1);
                    });
                }
                document.addEventListener('DOMContentLoaded', function() {
                    const errorPanel = document.querySelector('.error-panel');
                    const warningPanel = document.querySelector('.warning-panel');
                    
                    if (!errorPanel) {
                        document.getElementById('error-panel-button').style.display = 'none';
                    }
                    if (!warningPanel) {
                        document.getElementById('warning-panel-button').style.display = 'none';
                    }
                    ${
											errors
												? "document.querySelector('.error-panel').style.display = 'block';"
												: ""
										}
                    ${
											warnings
												? "document.querySelector('.warning-panel').style.display = 'block';"
												: ""
										}
                });
            </script>
        </head>
        <body>
    `;

    if (parse && parsedCompiledCode) {
        content += `
            <h1>Parsed OCaml Compiler Result</h1>
            <pre>${parsedCompiledCode}</pre>
        `;
    }

    if(!parse){
        content += `
            <h1>OCaml Compiler Result</h1>
            <pre>${compiledCode}</pre>
        `;
    }

	if (errors) {
		content += `
            <div class="error-panel">
                <h2>Errors</h2>
                <pre>${errors}</pre>
            </div>
        `;
	}

	if (warnings) {
		content += `
            <div class="warning-panel">
                <h2>Warnings</h2>
                <pre>${warnings}</pre>
            </div>
        `;
	}

	content += `
        <button id="error-panel-button" onclick="togglePanel('error-panel')">Hide Errors</button>
        <button id="warning-panel-button" onclick="togglePanel('warning-panel')">Hide Warnings</button>
        </ br>
        </body>
        </html>
    `;

	return content;
}
