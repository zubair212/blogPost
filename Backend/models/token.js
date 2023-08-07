const mongoose = require('mongoose');
const {Schema}= mongoose;

const refreshTokenSchema = Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference to the 'User' model
  },
  token: {
    type: String,
    required: true
  },
   
},
{timestamp:true}

);


const Token = mongoose.model('RefreshToken', refreshTokenSchema ,'tokens');

module.exports = Token;
