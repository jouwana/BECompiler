# BEC README

an extenstion that runs a better error compiler for Ocaml based on the article: Getting Into The Flow: Better Type Error Messages for Constraint-Based Type Inference 
This is the FrontEnd extension side.

**for the backend server that runs and creates the dataflow errors, go to this [repository](https://github.com/RazanDally/BECompiler/)**

### Includes:
- a built-into the extension Ocaml Interpreter with command and evaluation separator, error and warnings, and color coding. **for best use, separate blocks with ';;' at the end**.
- An interactive AST tree visualizer.
- Data Flow Type Error messages / information. (**Needs the Backend Server activated locally from [here](https://github.com/RazanDally/BECompiler/)**)
- LLM based solution and explanation to all the errors and warning in the code.

**IMPORTANT: The API key for the LLMs uses a free plan, it would be best for you to get your own free plan API key from gemini, so you dont get limited easily. you can change it in src/ai_communication.ts.
you can also use a paid plan key if you have one. you can change the LLM version used easily as well.**

## Contents:
- [Demos](https://github.com/jouwana/BECompiler?tab=readme-ov-file#demo)
- [Requirements](https://github.com/jouwana/BECompiler?tab=readme-ov-file#requirements)
- [How To Run](https://github.com/jouwana/BECompiler?tab=readme-ov-file#how-to-run)
   - [First Run](https://github.com/jouwana/BECompiler?tab=readme-ov-file#before-first-run)
   - [Run Extension](https://github.com/jouwana/BECompiler?tab=readme-ov-file#to-run-the-extension)
- [BackEnd Server](https://github.com/jouwana/BECompiler?tab=readme-ov-file#using-the-backend-server)
   - [Backend Server Repo](https://github.com/RazanDally/BECompiler/)
   - [Manually Run Backend Server](https://github.com/jouwana/BECompiler?tab=readme-ov-file#manual-server-run)
   - [Set Up Auto Run](https://github.com/jouwana/BECompiler/tree/main/server#this-is-a-placeholder-folder-for-the-server)
- [How To Use](https://github.com/jouwana/BECompiler?tab=readme-ov-file#how-to-use)
- [Feature Summary](https://github.com/jouwana/BECompiler?tab=readme-ov-file#feature-summary)


## Demos

### Test Showcase - How to Solve Errors Using BEC
Link to HD video on [youtube](https://youtu.be/7G8k5g0dTT8)

https://github.com/user-attachments/assets/08bd28be-d602-4021-bcd8-f25a90ad1213

<hr>

### General Capabilities Showcase + How to Run
Link to HD video on [youtube](https://youtu.be/g48E55Rzq2Y)

https://github.com/jouwana/BECompiler/assets/41836591/edf272a8-6902-4f59-ade5-4f537e69821d



## Requirements

- Install Ocaml by following https://fdopen.github.io/opam-repository-mingw/installation/
  * Ocaml version 4.14.0 preferable (ocaml-variants.4.14.0+mingw64c)
- Intall lsp-ocaml-server, dune and utop packages. 
  * Make sure dune is installed / written in installation line *prior* to lsp and utop, as both of them use it.
  * Utop version: 2.10.0
- Install Ocaml Platform Extenstion in VSCode.
- Clone the [BackEnd Repo](https://github.com/RazanDally/BECompiler/) and run it locally
  

## How To Run

### VSCode needs to be started from Cygwin Terminal, by writing 'code .'.

in VSCode, you can use Ocaml Platfrom to make sure your switch is set up correctly.

Clone the repository.

### Before First Run:
* open vscode terminal, use npm install
* use npm run compile and wait for it to finish

### To run the extension:
* make sure to have started vscode through cygwin terminal
* in Ocaml Platform, choose your preferred switch, that has utop and ocaml on it
* click on F5 to run in debug mode if you want to view console log for unexpected errors
* **run in non debug mode for normal uses**

After starting, a new VSCode window will open, the extension will be available for use in this new window only!

## Using the Backend Server:
Go To [BackEnd repo](https://github.com/RazanDally/BECompiler/)

follow the ReadMe there to download.

TL:DR; you need to have cursior / sbt downloaded
Java version between 11-19 to use with it

### Manual Server Run:
* use CMD, vscode terminal or intellij terminal (or other IDEs)
* Type sbt and enter
* when SBT opens, write run and enter

this will run the server on port 8080, make sure to close the server properly so you dont get issues next time you run it

### Auto Server Run:
read the 'ReadMe' in the [server folder](https://github.com/jouwana/BECompiler/tree/main/server) on this repo, and follow along.

## How To Use

**to use properly, make sure to have your vscode page has been fully loaded before using extension**

* create or open an ocaml file.
* end commands with ';;' for optimal results.
* make sure the ocaml file you want is the active editor.
* use the bottom bar 'BEC' button, 'ctrl+alt+b' or 'cmd+opt+b', or open the command pallete and search for BEC.

  BEC-Bar:
  
  ![image](https://github.com/jouwana/BECompiler/assets/41836591/fd7c32b9-af26-4a07-a740-92de3710c816)

  Command:
  ![image](https://github.com/jouwana/BECompiler/assets/41836591/9f796b68-a129-4ac1-982c-0569d8e46903)


## Feature Summary:

  ![image](https://github.com/jouwana/BECompiler/assets/41836591/59bce4f4-dc05-4f5b-9a60-22eeee1a9b89)
  

*the fullscreen button allows you to change freely between full tab size and side tab size*




1. 'recompile file': recompiles the ocaml file that was in active editor *when the extension was activated* and not
    the file currently in the active editor.

2. 'interpreter results': show the interpreter results for the entire file even if errors occur
   * groups each command with its evaluations, errors, warning and hints together
        * make sure to separate code blocks with ';;', so that they can be grouped separately   
   * uses colors to make it easier to view errors, warnings and hints.
   * in errors and warnings, the Line number corresponds to location relative to current command
  
   
    **If the page is stuck in loading, try to recompile**

     ![image](https://github.com/jouwana/BECompiler/assets/41836591/15bb1da4-9816-43f0-a062-7491a8c8b996)

3. 'data flow errors': shows the errors using *Data Flow Errors* based on the article:

   **Needs the backend server activated**
   
   [Getting Into The Flow: Better Type Error Messages for Constraint-Based Type Inference (Artifact)](https://dl.acm.org/doi/10.1145/3622812)

    to view article Github page, click [here](https://github.com/hkust-taco/hmloc/tree/main)

    * Shows the DataFlow of the Type Errors:
      ![image](https://github.com/user-attachments/assets/c315d1f7-11ea-4aea-b7dd-2cba1efc8aae)
    * Clicking on Line Buttons quick selects the problematic line in file:
      ![image](https://github.com/user-attachments/assets/245dd346-9f00-4ce4-8d2c-8d7684134425)
    * Shows a summary of the functions, types and number of errors at the bottom:
      ![image](https://github.com/user-attachments/assets/fde459c3-a348-4a9d-a1ef-7d2de5ff54e4)



5. 'AI error details': uses Gemini LLM to explain the errors, its origin, dataflow and suggest a solution to the error.
   This is done for all the errors and warning in the interepreter results.


   The results are showcases in section, and you can close each section by clicking on the button above it.
   A light blue means the section is open, while a gray means it is closed.
   
    ![image](https://github.com/jouwana/BECompiler/assets/41836591/3b884d3e-a368-4fa5-a55f-293a9ea68b48)

  as LLMs arent always consistent, you might see small changes in response design, or might not be satified with resutls
  if so, click the 'try again' button to rerun the request.

5. 'view AST results': opens a new tab and shows an interactive AST tree graph.

   **the graph preparation could take up to a minute, please be patient**

     ![image](https://github.com/jouwana/BECompiler/assets/41836591/ab126581-e591-48f8-9d37-55257086b4fd)

   * each block includes node value, type and params if applicable
   * if a node has children, and arrow and a number can be seen at the bottom of it.
     when clickd upon. it opens the view to show the direct children of this node.
     childrent can have children of their own.

    ![image](https://github.com/jouwana/BECompiler/assets/41836591/197210e1-69a8-444a-8f0b-6d2dde82118e)

   * can use 'highlight node' and 'highlight node to root' options with the Node ID text
    
    ![image](https://github.com/jouwana/BECompiler/assets/41836591/10f327b9-dd3b-4029-91ce-d41201ebe303)

   * a search function which highlights blocks with the name of the searched value:
    
    ![image](https://github.com/jouwana/BECompiler/assets/41836591/818f9e24-05d7-479d-a8e8-6c1563ed036f)







