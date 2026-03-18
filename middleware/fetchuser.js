const jwt = require("jsonwebtoken");
const JWT_SECRET = 'inoteyounote4i@notebook';

const fetchuser = (req, res, next) => {
    // Get user from jwt token and add id to request body
    const token = req.header('auth-token');
    
    // Check if token is present in the header 
    if (!token) {
        res.status(401).json({error: "Please authenticate using a valid token"});
    }

    try {
        // Get user id from the jwt token and set it in the request
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;

        next();
    } catch (error) {
        // If the jwt token invalid 
        res.status(401).json({error: "Please authenticate using avalid token"});
    }
    
}

module.exports = fetchuser;