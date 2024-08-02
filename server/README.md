# This is a placeholder folder for the server

adding the server files to here will enable the extension to auto run the backend server on activation

**BUT it will not install or check correct installations, unexpected errors may not be shown**

## setup:
1. clone and run [backend server](https://github.com/RazanDally/BECompiler) the first time
and making sure that it runs okay / everything needed is installed.
2. copy the entirety of the contents of the repository into the this folder
3. now when running the code, the extenstion will auto run the server

** The Server will give prompt and erros about running it, and its state, please wait until it tells you dataflow server is running, to start using it**


## Possible Issues:
1. the server is open in the background already
   * in this case, the extension will say 'port 8080 used' but you can continue to use the server normally
2. another server / application is suing port 8080
   * the extension will say 'port 8080 used', and you need to either:
      1. close the application/server using port 8080 - you can use netstat and sigkill in cmd
      2. navigate to DFRunner in server code, and change the port that it uses
3. 'no server files' - you did not mode server folders / all the files to the folder, and so it cannot run it
4. unexpected errors / random information could be given if your PC cannot use sbt. this is why you should **test** the server before trying automode.
