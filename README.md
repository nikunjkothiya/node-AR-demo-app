Install Node JS and MySQL , Before run this app.

Go to Project directory and opem cmd and follow this steps :

Step: 1 => Run in cmd -> npm install
Step: 2 => CREATE DATABASE name as node-app
Step: 3 => Import node-app.sql file into MySql Database and set database credential into dbConnection.js file
Step: 4 => Now run in cmd-> npm start (to start node server)
Step: 5 => Test the Api's in Postman ( Import Node Api.postman_collection.json into Postman)

POST => http://localhost:3000/api/register ( For register which required three parameter [1=>email,2=>password,3=>name])
POST => http://localhost:3000/api/login ( For login which required two parameter [1=>email,2=>password])
GET => http://localhost:3000/api/get-user ( For get details of Authenticated user (self))
POST => http://localhost:3000/api/upload-image ( For upload file(single) by authenticate user which required two parameter [1=>title,2=>image])
GET => http://localhost:3000/api/get-post ( For Authentication User's all uploaded posts list )
GET => http://localhost:3000/api/get-nearby-posts ( For All Nearby Available Posts of User's current location )
