import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		toJSON: false,
	},
	fname: {
		type: String,
		required: true,
	},
	lname: {
		type: String,
		required: true,
	},
    password:{
        type: String,
		required: true, 
    },
    password_salt:{
        type: String,
		required: true,   
    }
}, { timestamps: true });

// UserSchema.methods.isValidPass = async function (pass) {
// 	return await bcrypt.compare(pass, this.password);
// }; 
let UserTable; 

const init = () => {
	let myDB = mongoose.connection.useDb();
	UserTable = myDB.model('tbl_users', UserSchema);
    return UserTable;
};

 
 

const generatePassword = async (password) => {
	const salt = await bcrypt.genSalt(10);
	const hashed = await bcrypt.hash(password, salt);
	return { password: hashed, password_salt: salt, }
}

const isValidPass = async(password,dbpass)=>{
    return await bcrypt.compare(password, dbpass);
}
export {  init, generatePassword,isValidPass };