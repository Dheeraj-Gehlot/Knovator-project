 
import { badRequest  } from "@hapi/boom";
import ValidationSchema from "./validation.js";
import { init,generatePassword,isValidPass } from "../model/authModel.js";
import Joi from "joi";
    
import middleware from '../middleware/middleware.js'
const registration = async(req,res,next)=>{
    const request = req.body;  
	const { error } = ValidationSchema.validate(request);
    const UserTable = init();
	if (error) {
		return next(badRequest(error.details[0].message.replace(/['"`]/g, ''))); // Updated usage
	}

    try {
        
        let newPasswordANdHash = await generatePassword(request?.password)
        request.password = newPasswordANdHash?.password;
        request.password_salt = newPasswordANdHash?.password_salt; 
        
        const user = new UserTable(request); 
			const data = await user.save();
			const userData = data.toObject();
			delete userData.password;
			delete userData.password_salt;
            let token = await middleware.createSecretToken(userData?._id?.toString())
            return res.json({
                code:200,
                token:token
            })
    } catch (error) {
        next(error);
    }
}
const LoginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
});

const login = async(req,res,next)=>{ 
        const request = req.body; 
        const User = init();
        const { error } = LoginSchema.validate(request);
        if (error) {
            console.log(error,"error");
            return next(badRequest(error.details[0].message.replace(/['"`]/g, ''))); // Updated usage// Updated usage
    
        }
        try {
            let accessToken = "";
            let message = "login successfully"; 
            const user = await User.findOne({ email: request.email, password: { $exists: true } });
            if (!user) { throw notFound("The email address was not found."); }
            const isMatched = await isValidPass(request.password,user?.password); 
            if (!isMatched) { throw unauthorized("email or password not correct"); } 
                   let token = await middleware.createSecretToken(user?._id?.toString()) 
            res.json({
                statusCode: 200,
                accessToken :token, 
            });
        } catch (e) {
            console.log(e,"e");
            next(e)
        }   
}
export default {
    registration,
    login
}