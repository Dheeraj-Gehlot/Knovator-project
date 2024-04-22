import express from 'express';
const router = express.Router();
import auth from '../controller/auth.js' 
import posts from '../controller/posts.js' 
import Verify from '../middleware/middleware.js'

router.get('/routes',(req,res)=>{
    res.send('In Routes')
})

router.post('/register', auth.registration);
router.post('/login',auth.login)
router.post('/create-post',Verify.AuthVerify,posts.create);
router.post('/edit-post',Verify.AuthVerify,posts.edit);
router.post('/delete-post',Verify.AuthVerify,posts.deletepost);
router.post('/list-post',Verify.AuthVerify,posts.list);
router.post('/statics',Verify.AuthVerify,posts.statics);

export default router;