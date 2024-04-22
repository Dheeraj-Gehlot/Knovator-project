    import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { init } from '../model/authModel.js';
dotenv.config(); 

const createSecretToken = async(id) =>{
  return jwt.sign({ id }, process.env.TOKEN_KEY, {
    expiresIn: 3 * 24 * 60 * 60,
  });
}

const AuthVerify = async (req, res, next) => {
    try { 
        let UserTable = init();
      const tokenHalf = req.headers.authorization; 
    
      const decodedToken = jwt.verify(tokenHalf, process.env.TOKEN_KEY); 
      const user = await UserTable.findById(decodedToken.id);  
      global.USERID = user._id?.toString(); 
      next();
    } catch (error) { 
        console.log(error,"ehrh");
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

  export default {
    createSecretToken,
    AuthVerify
  }