import express from 'express'
import router from './route.js';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(router);

mongoose.connect('mongodb://localhost:27017/roundrobindb').then(()=>{
    console.log("connected ....");
    app.listen(8000,()=>{
        console.log("server running port 8000 ");
    })

}).catch((error)=>{
    console.log(error);  
})
