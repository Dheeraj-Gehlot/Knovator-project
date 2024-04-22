 
import { postDb } from '../model/postsModel.js'; 
import { init } from '../model/authModel.js';
import { badRequest  } from "@hapi/boom";
import Joi from 'joi';  
import _ from 'underscore';
 
const createPost = Joi.object({
	title: Joi.string().required(),
	Body: Joi.string().required(),
    status : Joi.bool().required()
});

const editPost = Joi.object({
	title: Joi.string().required(),
	Body: Joi.string().required(),
    status : Joi.bool().required(),
    id : Joi.required()
});

const create = async(req,res,next)=>{
    const { title, Body, status,latitude,longitude} = req.body;
	const { error } = createPost.validate( { title, Body, status  });
    const Postable = postDb();
	if (error) {
		return next(badRequest(error.details[0].message.replace(/['"`]/g, ''))); // Updated usage
	} 
    try { 
        const post = {
            title,
            Body, 
            status: status || true,
            location: {
                latitude:latitude,
                longitude: longitude
            }
        }; 
       let result =  await Postable.create(post);
        return res.json({
            code:200, 
            data :result
        })
    } catch (error) {
        console.log("error",error);
    }
}

const edit = async(req,res,next)=>{
    const { title, Body, status,id} = req.body;
    const { error } = editPost.validate( { title, Body, status ,id });
    const Postable = postDb();
	if (error) {
		return next(badRequest(error.details[0].message.replace(/['"`]/g, ''))); // Updated usage
	}

try {
    let result =  await Postable.findOne({_id:id});
    console.log(result,"result",id);
    if(result){
        let update = {
            title,
            Body,
            status
        }
        await Postable.updateOne({_id:id},{"$set":update})
        return res.json({
            code:200, 
            message :"post updated"
        })
    }else{
        return res.json({
            code:400, 
            message :"Something Went Wrong"
        })
    }
} catch (error) {
    console.log(error);
    return res.json({
        code:400, 
        message :"Something Went Wrong"
    })
}
}

const deletepost = async(req,res,next)=>{
    const {id} = req.body; 
    const Postable = postDb(); 
try {
    let result =  await Postable.deleteOne({_id:id}); 
    if(result){ 
        return res.json({
            code:200, 
            message :"post deleted"
        })
    }else{
        return res.json({
            code:400, 
            message :"Something Went Wrong"
        })
    }
} catch (error) { 
    return res.json({
        code:400, 
        message :"Something Went Wrong"
    })
}
}

const list = async(req,res,next)=>{
    const {  latitude,longitude} = req.body;
    const Postable = postDb(); 
    const UserTable = init();
    try {
        let filter = {
            userAction:USERID,
        };
        if( latitude && latitude ){
            filter['location.latitude'] = latitude;
            filter['location.longitude'] = longitude;
        }
        let result =  await Postable.find(filter,{_id:{$toString:'$_id'},title:1,Body:1,status:1,userAction:1}).lean(); 
        if(result){ 
            let ids = _.uniq(_.map(result,"userAction"));
            let users = await UserTable.find({_id:{'$in':ids}},{_id:{$toString:"$_id"},fname:1,lname:1}).lean();
            _.each(result,async(element)=>{
                let name  = _.findWhere(users,{_id:element?.userAction});
                element.name = name?.fname+' '+ name?.lname; 
                delete element?.userAction;
            })
            return res.json({
                code:200, 
                data :result
            })
        }else{
            return res.json({
                code:400, 
                message :"Something Went Wrong"
            })
        }
    } catch (error) { 
        console.log(error);
        return res.json({
            code:400, 
            message :"Something Went Wrong"
        })
    }
}

const statics  = async(req,res)=>{ 
    const Postable = postDb(); 
    try {
        let result = await Postable.aggregate([
            {
                $group: {
                    _id: null,
                    active: {
                        $sum: {
                            $cond: [{ $eq: ["$status", true] }, 1, 0]
                        }
                    },
                    inactive: {
                        $sum: {
                            $cond: [{ $eq: ["$status", false] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    active: 1,
                    inactive: 1
                }
            }
        ]);
        if(result?.length){
            return res.json({
                code : 200,
                data : result[0]
            })
        }   else{
            return res.json({
                code : 200,
                data : {
                    active: 0,
                     inactive: 0
                }
            })
        }    
    } catch (error) {
        return res.json({
            code : 200,
            data : {
                active: 0,
                 inactive: 0
            }
        })
    }
}
export default {
    create,
    edit,
    deletepost,
    list,
    statics
}