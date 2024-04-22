import Joi from 'joi';

const Schema = Joi.object({
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export default Schema;