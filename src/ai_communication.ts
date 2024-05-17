import OpenAI from "openai";
import * as vscode from "vscode";
import { logMessage } from "./helpers";
import * as fs from 'fs';
import { log } from "console";

const AWANLLM_API_KEY = "b79fefdf-fd1e-48cb-b943-c560c240916b";

const explanationText =
	"i will send you a section of OCAML code, and a compilation error for it.\n" +
	"i want you to explain the error to me and suggest a solution.\n" +
	"you must follow this exact format of response:\n" +
	"a one line explanation of error type.\n" +
	"a short multi bullet point explanation of where the error originates from.\n" +
	"a short multi bullet point based data flow explanation of the error.\n" +
	"a short solution suggestion.\n"+
    "the solution suggestion is just text, and no need to write code\n\n" +
    "for type mismatch error, make sure to remember and consider the types of the variables involved.\n" +

    "you must also format the answer in a way that works inside a <pre> html tag.\n" +
    "such that it reamins readable and well formatted.\n\n" +
	"this is the provided code:\n" +
	"(* example 1 - tuple field types mismatch *)\n" +
	"let parse_version (s: string): string =\n" +
	"  (* Dummy implementation that just returns the input string *)\n" +
	"  s\n\n" +
	"let show_major (s: string): string =\n" +
	"  (* Dummy implementation that returns a string indicating major version *)\n" +
	'  "Major version: " ^ s\n\n' +
	'let appInfo = ("My Application", 1.5)\n\n' +
	"let process (name, vers) = name ^ show_major (parse_version vers)\n\n" +
	"let test = process appInfo\n\n" +
	"this is the compilation error:\n" +
	"val parse_version : string -> string =\n" +
	"val show_major : string -> string =\n" +
	'val appInfo : string * float = ("My Application", 1.5)\n' +
	"val process : string * string -> string =\n" +
	'File "d:/Desktop/ocaml_Test/test.ml", line 14, characters 19-26:\n' +
	"14 | let test = process appInfo\n" +
	"^^^^^^^\n" +
	"Error: This expression has type string * float but an expression was expected of type string * string Type float is not compatible with type string\n";


export async function sendOpenAIRequest(inputText: string, context: vscode.ExtensionContext): Promise<string> {
	try {
		let response = await fetch("https://api.awanllm.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${AWANLLM_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "Awanllm-Llama-3-8B-Dolfin",
				messages: [{ role: "user", content: explanationText}],
			}),
		}).then((response) => response.json());
        logMessage(context, "Sent request to OpenAI");
        logMessage(context, response.choices[0].message.content);
        return response.choices[0].message.content;
	} catch (error) {
		logMessage(context, "Error sending request to OpenAI");
        vscode.window.showErrorMessage("Error sending request to OpenAI");
		throw error;
	}
}

//function that turns objects to string
function stringify(obj: any): string {
    return JSON.stringify(obj, null, 2);
}