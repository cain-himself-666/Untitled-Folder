README

Team : Untitled Folder
Authors : Raja Siddharth Raju, Mukund Kumar, Jwngfu Brahma

Requirements
1. PostgreSQL
2. Node
3. Ethereum SDK

Installation
1. In the PostgreSQL portal, create a  database with 'scs' as name
2. Update the database credentials inside the server.js with the credentials of your db
3. Open your terminal and cd to the Project Folder
4. From the terminal run "npm install", this should install all the dependencies of project
5. Run the Ethereum private network
6. Run the command "node server.js" to start the project

Development Platform
OS : Ubuntu, Windows 10
Language : JS, Solidity 

Deployment Architecture
(low level to top level)
- OS
- V8 Engine - Ethereum Network
- NODE - Ethereum SDK
- Application

Technology Stack
- NODE
- Express
- PostgreSQL
- Ethereum Blockchain Network

Instruction / Manual

Usage
Using the app is pretty straight forward and easy to use by itself. Users don't require any extra installation. The users should be able to access the app using any modern web browser.

Signup
Users must signup before they can login and start contributing to the supply chain, in the future versions this will be done by an Admin (registered by a system admin/developer).
Users can opt 1 of the 3 available roles (Seed Production Agency, Seed Testing Lab or Seed Certification Agency).

Login
Users are required to login with the credentials they have entered in the signup step.

Dashboard
After the login users are be taken to different versions of the dashboard based on the roles opted in the Signup step.

Input Submissions
In the dashboard, form fields are available for the users to update the seed assets, the form available are different for different user types/roles.