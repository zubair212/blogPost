const jwt = require('jsonwebtoken');
const{Access_Token_Secret,Refresh_Secret_Token}=require('../Config/index');
const refereshToken=require('../models/token');
class JWTService {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  // Sign access token
 static signAccessToken(payload,expiryTime,) {
  
    return jwt.sign(payload,  Access_Token_Secret,{expiresIn:expiryTime}); 
  }

  // Sign refresh token
 static signRefreshToken(payload,expiryTime,) {
    
    return jwt.sign(payload, Refresh_Secret_Token, { expiresIn: expiryTime }); // Expires in 7 days
  }

  // Verify token (access or refresh)
 static verifyAccessToken(token) {
    
    
      return jwt.verify(token, Access_Token_Secret);
   
  }

 static verifyRefreshToken(token) {
    
    
    return jwt.verify(token, Refresh_Secret_Token);
 
}
//store token
  static async storeRefreshToke(token,userId){
try {
    
const newToken=new refereshToken({

    token:token,
    userId:userId
})
await newToken.save();

} catch (error) {
    console.log('error');
}


}

}

module.exports = JWTService;
