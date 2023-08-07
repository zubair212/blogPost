require('dotenv').config(); // Load environment variables from .env file


const PORT = process.env.PORT || 3000; // Use the PORT from the .env file or default to 3000
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
const Access_Token_Secret = process.env.Access_Token_Secret;
const Refresh_Secret_Token  = process.env.Refresh_Secret_Token;
const BACKEND_SERVER_PATH =process.env.BACKEND_SERVER_PATH;
module.exports = {

    PORT,
    MONGODB_CONNECTION_STRING,
    Access_Token_Secret,
    Refresh_Secret_Token,
    BACKEND_SERVER_PATH

}
