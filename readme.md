npm init -y
npm i express mongoose jsonwebtoken bcryptjs dotenv cors cookie-parser cloudinary
npm i -D nodemon

platform for deploying render.com

configure render.com
"scripts": {
"dev": "nodemon backend/server.js",
"start": "node backend/server.js",
<-- add or modify
"dev": "NODE_ENV=development nodemon backend/server.js",
"start": "NODE_ENV=production node backend/server.js",
"build": "npm install && npm run install --prefix frontend && npm run build --prefix frontend",
->
},

go to server.js and add those lines

import path from 'path';

...
const app = express();
const PORT = process.env.PORT || 3000;
const \_\_dirname = path.resolve();
...
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

if (process.env.NODE_ENV === 'production') {
app.use(express.static(path.join(**dirname, 'frontend/dist')));
app.get('\*', (req, res) => {
res.sendFile(path.resolve(**dirname, 'frontend', 'dist', 'index.html'));
});
}
...

then in frontend termianl run npm run build and npm run start

localhost:5000

in render.com -> deploy webservice from github

build command -> npm run build
start command -> npm run start

add the env variables in render.com (minus NODE_ENV=development)

then create web service