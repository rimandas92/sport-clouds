const config       =   require('../config');
const secretKey    =   config.secretKey ;
const jwt          =   require('jsonwebtoken') ;

module.exports = {
  
  // **********create token using arrow function ***********************//
    createToken : (adminData) => {
      var tokenData = {
          id: adminData._id
      };
      var token = jwt.sign(tokenData, secretKey, {
           // expiresIn: 86400  // expires in 24 hours
           expiresIn: '30d'
      });
      return token;
    },
  // **********generate with fixed length 4 digit otp ***********************//
    generateOtp : function(){
      return Math.floor(1000 + Math.random() * 9000);
    },
   // output 
    // 1234

  // **********generate otp with own length  ***********************//
    generateUniqueCode : function (length){
        var digits = '0123456789';
        var otp = '';
        for(let i=1; i<=length; i++)
        {
            var index = Math.floor(Math.random()*(digits.length));
            otp = otp + digits[index];
        }
        return otp;
    },
    // output 
    // 123456

  // **********generate  random string with number  ***********************//
    generateString : function (length){
      let result           = '';
      let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

      let charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
     // output 
    // Ab923d

  // **********get a whole months data by month number and year   ***********************//
    
    getDaysInMonth : function(month,year) {
        return new Date(year, month, 0).getDate();
    },
   

}

