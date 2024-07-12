
export const REQUESTS_PER_MINUTE_LIMIT: number = 15; //15 for gemini, 10 for awanllm
export const REQUESTS_PER_DAY_LIMIT: number = 1500; // 1500 for gemini, 100 for awanllm
export const MINUTE_IN_MILLISECONDS: number = 60000;

export const ERROR_NO_RETURN_VALUE = `No output from the compiler. it is possible that:\n
<ul>
<li>Utop is not installed</li>
<li>OCaml is not installed</li>
<li>The switch is not active</li>
<li>Ran compiler before system finished loading</li>
</ul>\n
Please check that you have access to opam switch and that you opened vscode through cygwin\n
Please also make sure that Utop is installed on the current switch\n
If all is as it should be, please try again\n`;


export const ERRORS_NOT_SEPARATED_FROM_CODE = `the provided code compilation comes with the errors messages attached to it:\n\n
each command/code segment and its output are enclosed inside '---------------' lines, everyting inside that block is 
about that command/code segment\n
Most, if not all, errors and warnings start with the format 'Line x, characters z-y'. Use these to identify the EXACT
section of code that the error stems from, and the exact characters / variables causing it.\n\n
when looking at error you must also take the entire command into consideration, and not just the error/warning message or a section of the line.\n\n
`;

export const PRMOPT_PRE_CODE = "this is the provided code:\n\n";

export const PRMOPT_PRE_ERROR = "this is the compilation error:\n\n";

export const PROMPT_HEADER = "You are a tutor for a programming course. You are tasked with helping students understand OCaml compilation errors.\n" +
"You will be given an ocaml interpreter result, that includes the code and the errors as well as warnings.\n" +
"There could be multiple errors and multiple warnings\n" +
"Your task is to explain all the errors and warnings and suggest a solution for each of them to the student.\n" +
"You are Requested to provide these answers in a specified html based format.\n" +
"Please follow the format provided in the prompt.\n\n";

export const PROMPT_REQUEST_EXPLANATION = "You will be given the original OCAML code, and the interpreter results" +
	"Your response must provide this following infomration:\n" +
	"for each error and warning:\n" +
	"you must look above the error/warning message to find the code segment that caused the error.\n" +
	"you must provide a title for the error or warning based on what caused error/warning type\n" +
	"then you need to provide:\n" +
	"a title for the error or warning\n" +
	"a explanation of the error type recieved, and what the error type means.\n" +
	"a short multi bullet point explanation of where the error originates from, "+
	"and highlight the specific line and characters taken from the errpr/warning in the original code command\n" +
	"a short multi bullet point based data flow explanation of the error.\n" +
	"a solution suggestion.\n"+
    "the solution suggestion can be just text, and no need to write code\n" +
    "but when possible, provide a code snippet that would fix the error.\n" +
    "provide multiple suggestions if possible, if a hint is provided in compilation, use it.\n\n" +
    "for type mismatch error, make sure to remember and consider the types of the variables involved.\n" +
    "for syntax errors, make sure to remember and consider the syntax rules of OCAML.\n" +
    "for other errors, make sure to remember and consider the rules of OCAML.\n\n";

export const PROMPT_RESPONSE_DESIGN =
	"Your response will be inserted inside of a <div> tag in the html file.\n" +
	"You must follow this exact format of response:\n" +
	'for each section, create a <div vlass="section"> tag.\n' +
	'To start each warning/error section, create a <button class="collapsible"> tag.\n' +
	'inside the <button class="collapsible"> tag, write the line of code that caused the error/warning and NOT the error itself\n' +
	'under the button tag, create a <div class="content"> tag.\n' +
	'inside the <div class="content"> tag, do the following:\n' +
	"for the title of each subsection, use the following format\n" +
	"<h2> title </h2> <br>\n\n" +
	"for the bullet points, use the following format:\n" +
	"<ul>\n" +
	"<li>bullet point </li>\n" +
	"</ul>\n" +
	"for the code snippets, use the following format:\n" +
	'<code style="text-wrap: pretty">\n' +
	"code snippet\n" +
	"</code>\n" +
	"for the text, use the following format:\n" +
	'<span style="text-wrap: pretty"> text </span>\n' +
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
	'3. start a new line, tab it, then write the error/warning message (without the location of the error) inside <pre><code style="text-wrap: pretty"> ' +
	'code snippet </code></pre>. and close it off with </li>. make sure to not change anything about the message\n' +
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


export const PARSE_PROMPT_HEADER = `You are an OCAML AST parser, that takes and OCAML AST and converts
 it into a human readable format in JSON style\n
You will be given an OCAML AST that is given using the dumped compiler -dparsetree\n
The sent tree might include extra ERROR lines, you  MUST IGNORE THEM\n\n
`

export const PARSE_PROMPT_REQUEST_EXPLANATION = `we are interested in the following information:\n
1. The expression type of the node, for example, function, variable, constant, tuple, operator symbols.... \n
2. The expression value of the node, for example, the name of the variable, the value of the constant, the function name.... \n
3. if the type of the variables or argument is visible, we want them to be listed as well\n\n
each node in the provided ast starts with 'structure_item' then opens [] blocks\n
you must base your node information based on the inside of that block\n\n
for the 'value' section, you cannot simply put the type or pstr/ppat values, but the value in quotations\n\n
`

export const PARSE_PROMPT_RESPONSE_DESIGN = `your response needs to be in json format, and follow the following format:\n
0. create a root node with only id:0, empty parentId, type: 'root', and value: 'root'\n
1. for each node in the AST, create a new object\n
2. the object must have the following
	- a key called "id" with the value of the id of the node, generated by you, starting from 1 and incrementing by 1\n
	- a key called "parentId" which has the "id" value of the parent node\n
	- a key called "type" with the value of the type of the node. a type cannot be 'param' or 'type'\n
	- a key called "value" with the value of the value of the node\n
3. ONLY a function object should have these extra keys:\n
	- a key called "return_type" with the value of the return type of the function, which we can find\n
	in the value insider quotation after the 'ptyp_constr', in the line under core_type\n
4. for constants, you must use 'constant_int' or 'constant_string'... based on the constant value\n
	and not simply write 'constant' as the type\n
6. you must differentiate between a function definition or a function call, and set the type based on that\n
8. you must NEVER have any value or type set as 'structure_item' this is incorrect!\n
9. for function object with parameters, add a key called "parameters" the parameter objects inside\n
	and there should not have id or parentid. and dont forget to add the constraint for its data type\n
10. we do NOT want nested objects, even the direct children of an object should be their own separate object\n
   and not be inside the parent object\n\n
`;

export const PARSE_PRE_AST = `this is the AST that you need to parse:\n\n`
