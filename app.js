const express = require('express');
const dbConnect =  require('./config/dbConnect');
const app = express();

const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 4000;

//Router
const authRouter = require('./route/authRoute');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const {} = require('./middleware/authMiddleware')


dbConnect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

//API
app.use('/api/user',authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`);
})