import { logMessage } from "./helpers";
import * as vscode from "vscode";
import { parseOCamlOutput } from "./helpers";

export function generateWebViewContent(
    context: vscode.ExtensionContext,
	compiledCode: string,
	errors: string | null,
	warnings: string | null
): string {

    let parsedCompiledCode = parseOCamlOutput(compiledCode);

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
            <h1>JavaScript Compiler Result</h1>
            <pre>${compiledCode}</pre>
    `;

    if (parsedCompiledCode) {
        content += `
            <h1>Parsed OCaml Compiler Result</h1>
            <pre>${parsedCompiledCode}</pre>
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
        
        </body>
        </html>
    `;

	return content;
}
