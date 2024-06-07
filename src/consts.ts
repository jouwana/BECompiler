
export const REQUESTS_PER_MINUTE_LIMIT: number = 15; //15 for gemini, 10 for awanllm
export const REQUESTS_PER_DAY_LIMIT: number = 1500; // 1500 for gemini, 100 for awanllm
export const MINUTE_IN_MILLISECONDS: number = 60000;

export const ERRORS_NOT_SEPARATED_FROM_CODE = `the provided code compilation comes with the errors messages attached to it:\n\n
the line number indicated in the error messages related to the relative position inside the command
the error occured in, as it could be a multiline command at times.\n\n
the code could have multiple errors and or warnings, and you must follow the format for each of them.\n\n`;

export const PRMOPT_PRE_CODE = "this is the provided code:\n\n";

export const PRMOPT_PRE_ERROR = "this is the compilation error:\n\n";

export const PROMPT_HEADER = "You are a tutor for a programming course. You are tasked with helping students understand OCaml compilation errors.\n" +
"You will be given an ocaml interpreter result, that includes the ode and the errors as well as warnings.\n" +
"There could be multiple errors and multiple warnings\n" +
"Your task is to explain all the errors and warnings and suggest a solution for each of them to the student.\n" +
"You are Requested to provide these answers in a specified html based format.\n" +
"Please follow the format provided in the prompt.\n\n";

export const PROMPT_REQUEST_EXPLANATION = "You will be given the original OCAML code, and the compilatioin results" +
	"Your response must provide this infomration\n" +
	"for each error and warning:\n" +
	"you must look above or under the error/warning message to find the code that caused the error.\n" +
	"you must provide a title for the error or warning based on what caused error/warning type\n" +
	"then you need to provide:\n" +
	"a title for the error or warning\n" +
	"a explanation of the error type recieved, and what the error type means.\n" +
	"a short multi bullet point explanation of where the error originates from.\n" +
	"a short multi bullet point based data flow explanation of the error.\n" +
	"a solution suggestion.\n"+
    "the solution suggestion can be just text, and no need to write code\n" +
    "but when possible, provide a code snippet that would fix the error.\n" +
    "provide multiple suggestions if possible.\n\n" +
    "for type mismatch error, make sure to remember and consider the types of the variables involved.\n" +
    "for syntax errors, make sure to remember and consider the syntax rules of OCAML.\n" +
    "for other errors, make sure to remember and consider the rules of OCAML.\n\n";

export const PROMPT_RESPONSE_DESIGN =
	"Your response will be inserted inside of a <div> tag in the html file.\n" +
	"You must follow this exact format of response:\n" +
	'for each section, create a <div vlass="section"> tag.\n' +
	'To start each warning/error section, create a <button class="collapsible"> tag.\n' +
	'inside the <button class="collapsible"> tag, write the name of the warning/error\n' +
	'under the button tag, create a <div class="content"> tag.\n' +
	'inside the <div class="content"> tag, do the following:\n' +
	"for the title of each subsection, use the following format:\n" +
	"<h2> title </h2>\n\n" +
	"for the bullet points, use the following format:\n" +
	"<ul>\n" +
	"<li>bullet point </li>\n" +
	"</ul>\n" +
	"for the code snippets, use the following format:\n" +
	"<code>\n" +
	"code snippet\n" +
	"</code>\n" +
	"for the text, use the following format:\n" +
	"<span style with overflow wrap to next line> text </span>\n" +
	"for every variable name, use the following format:\n" +
	"random text <code>variable name</code> continue text\n" +
	"here are the titles for each subsection:\n" +
	"1. Error Type\n" +
	"2. Error Origin \n" +
	"3. Error Data Flow Explanation\n" +
	"4. Solution Suggestion\n" +
	"5. Useful Links\n\n" +
	"for the useful links section, follow these steps:\n" +
	"1. using the error message and these formatter generate a google search link:" +
	"Formatter:\n" +
	"replace all spaces with '+'\n" +
	"replace all single quotes with '%27'\n" +
	"replace all colons with '%3A'\n" +
	"replace all open parentheses with '%28'\n" +
	"replace all close parentheses with '%29'\n" +
	"replace all open brackets with '%5B'\n" +
	"replace all close brackets with '%5D'\n" +
	"replace all periods with '%2E'\n" +
	"replace all commas with '%2C'\n" +
	"replace all semicolons with '%3B'\n\n" +
	"2. <li> add <a href witht the generated link> Google Search</a> for:\n" +
	"3. start a new line, tab it, then write the error message (without the location of the error) inside <code><pre>" +
	" code snippet <pre><code>. and close it off with </li>\n" +
	'4. add <li><a href="https://ocaml.org/docs/common-errors">Common OCaml Errors</a></li>\n' +
	'5. add <li><a href="https://ocaml.org/manual/5.2/index.html">OCaml Manual</a></li>\n\n' +
	"6. close the unordered list and add a </br>\n\n";



export const PROMPT_ERROR_EXAMPLE =
	"val parse_version : string -> string =\n" +
	"val show_major : string -> string =\n" +
	'val appInfo : string * float = ("My Application", 1.5)\n' +
	"val process : string * string -> string =\n" +
	'File "d:/Desktop/ocaml_Test/test.ml", line 14, characters 19-26:\n' +
	"14 | let test = process appInfo\n" +
	"^^^^^^^\n" +
	"Error: This expression has type string * float but an expression was expected of type string * string Type float is not compatible with type string\n";

    

export const PROMPT_CODE_EXAMPLE =
	"(* example 1 - tuple field types mismatch *)\n" +
	"let parse_version (s: string): string =\n" +
	"  (* Dummy implementation that just returns the input string *)\n" +
	"  s\n\n" +
	"let show_major (s: string): string =\n" +
	"  (* Dummy implementation that returns a string indicating major version *)\n" +
	'  "Major version: " ^ s\n\n' +
	'let appInfo = ("My Application", 1.5)\n\n' +
	"let process (name, vers) = name ^ show_major (parse_version vers)\n\n" +
	"let test = process appInfo\n\n";