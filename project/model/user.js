import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    firstname:{ type:String },
    lastname:{ type:String },
    active:{ type:String },
    customers:{ type:[String] },
    assignCustomerCount:{ type:Number }
});

const User = mongoose.model("tbl_darshmasters",userschema);

export default User;