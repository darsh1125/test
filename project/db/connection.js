import mongoose from "mongoose";

const dbconnection = async() => {
    try {

       const connection = await mongoose.connect('mongodb://localhost:27017/    ');
       console.log("database connected successsfuly !!!!!!");
        
    } catch (error) {
       console.log(error);        
    }
}

export default dbconnection;