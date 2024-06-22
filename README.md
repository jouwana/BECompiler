# BEC README

an extenstion that runs a better error compiler for Ocaml based on the article: Getting Into The Flow: Better Type Error Messages for Constraint-Based Type Inference 

### Includes:
- In extension Ocaml Interpreter with command and evaluation separator, error and warnings, and color coding.
- An interactive AST tree visualizer.
- Data Flow Type Error messages / information.
- LLM based solution and explanation to all the errors and warning in the code.


## Requirements

- Install Ocaml by following https://fdopen.github.io/opam-repository-mingw/installation/
- Intall utop. lsp-ocaml-server and dune packages.
- Install Ocaml Platform Extenstion in VSCode.
  

## How To Run

**VSCode needs to be started from cygwin terminal, by writing 'code .'.**

in VSCode, you can use Ocaml Platfrom to make sure your switch is set up correctly.

Clone the repository.

### Before First Run:
* use npm install
* use npm run compile and wait for it to finish

To run the extension, click on F5 to run in debug mode.

After starting, a new VSCode window will open, the extension will be available for use in this new window only!

## How To Use

**to use properly, make sure to have your vscode page has been fully loaded before using extension**

* create or open an ocaml file.
* end commands with ';;' for optimal results.
* make sure the ocaml file you want is the active editor.
* use the bottom bar 'BEC-U' button, 'ctrl+alt u' or 'ctrl+alt s', or open the command pallete and search for BEC.

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
   * groups each command with its evaluations, errors, warning and hints together.
   * uses colors to make it easier to view errors, warnings and hints.
   * in errors and warnings, the Line number corresponds to location relative to current command
   
    **If the page is stuck in loading, try to recompile**

     ![image](https://github.com/jouwana/BECompiler/assets/41836591/15bb1da4-9816-43f0-a062-7491a8c8b996)

3. 'data flow errors': shows the errors using *Data Flow Errors* based on the article:

   **Needs the backend server activated**
   
   [Getting Into The Flow: Better Type Error Messages for Constraint-Based Type Inference (Artifact)](https://dl.acm.org/doi/10.1145/3622812)

    to view article Github page, click [here](https://github.com/hkust-taco/hmloc/tree/main)

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


## Server:





