import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import http from 'http'
import routes from './Routes/apiRoutes.js'
mongoose.Promise = global.Promise

const app = express();

app.set('trust proxy', true);
dotenv.config()

let port = process.env.PORT;
let dbConfig = process.env.MONGODB_CONNECTION_STRING;

mongoose.set("strictQuery", false);
mongoose.connect(dbConfig, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));


app.use(cors());

app.get('/', function (req, res) {
    res.json({
        status: true,
        message: 'Welcome to World Of GIS'
    });
});
app.use((err, req, res, next) => {

    res.status(err.status || 500);
    res.json({
        code: 500,
        message: "Server Issue, Please Try Again Later"
    });
});


app.use(routes)

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
});
