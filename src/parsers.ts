import * as vscode from "vscode";
import * as fs from "fs";


/**
 *
 * @param ocamlFile  The path to the OCaml file
 * @returns  The path to the temporary file with extra print statements that emulates the OCaml toplevel (problematic)
 */
export async function generateFileWithExtraPrints(ocamlFile: string) {
	// Read the content of the OCaml file
	const content = fs.readFileSync(ocamlFile, "utf-8");

	// Split the content into lines
	const lines = content.split("\n");

	// Create a temporary file to store the modified content
	const tempFilePath = `${ocamlFile}.tmp`;
	fs.writeFileSync(tempFilePath, "");

	let longLine = "";

	// Iterate over the lines, adding print statements and empty lines
	for (const line of lines) {
		if (line.trim() === "") {
			continue;
		}
		if (line.trim().endsWith(";;")) {
			longLine === "" ? (longLine = line) : (longLine += line);
			longLine = longLine.replaceAll("\r", "");

			let newline = longLine.trim();
			fs.appendFileSync(
				tempFilePath,
				`print_string "${newline.replaceAll('"', "'")}";;\n`
			);
			fs.appendFileSync(tempFilePath, `${newline}\n`);
			fs.appendFileSync(tempFilePath, `print_endline "";;\n`);
			longLine = "";
		} else {
			longLine += line;
		}
	}

	// Open the temporary file in a new editor tab
	const document = await vscode.workspace.openTextDocument(tempFilePath);
	return tempFilePath;
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
