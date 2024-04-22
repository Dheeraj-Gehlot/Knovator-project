import mongoose from "mongoose"; 

const Schema = mongoose.Schema;

const documentSchema = new Schema({
	title: {
		type: String,
		required: true, 
	},
    Body:{
        type: String,
		required: true,
    },
	status: {
		type: Boolean,
		required: true,
	}, 
    location :{
        type: Object,
		required: true,
    },
    userAction: {  
        type: String,  
    }
}, { timestamps: true });

documentSchema.pre('save', function(next) {
    if (this.isNew) { 
        this.userAction =USERID; 
    }
    next();
});
let postsTable; 

const postDb = () => {
	let myDB = mongoose.connection.useDb();
	postsTable = myDB.model('tbl_posts', documentSchema);
    return postsTable;
};
 
export {  postDb };