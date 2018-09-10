# Mobile Web Specialist Certification Course

## Project Overview: Stage 3

To serve this app via your local web server, follow the below steps:
1) Open your command prompt or terminal.
2) Go to folder where you to save all the files.
3) execute git clone https://github.com/Senopratomo/resto-review-prj-3.git.
4) Go to newly created folder "resto-review-prj-3".

Setting up server side:
5) Go to folder "server".
6) Install Sails.js globally with "npm i sails -g".
 In addition, you might need to install sails locally in the back-end folder with "npm i sails".
7) Run the backend server with "node server"

Setting up the client side:
8) Open file "resto-review-prj-3/client/src/js/dbhelper.js"
9) Go to line 11 and change the port in the following variable to "1337"
Eg: "const port = 1337" // means you'll be pointing your client to communicate with server at port 1337
10) run the client side app by executing "gulp" in "resto-review-prj-3/client/" directory
11) Open your browser and type the following in your browser address bar : http://localhost:3000/
12) Enjoy and feedback is welcome!