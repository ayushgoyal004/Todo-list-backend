const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(403).json({ message: "No token provided, access denied." });
    }

    try {
        // Bearer <token>
        const tokenWithoutBearer = token.split(' ')[1];  // Removing 'Bearer ' part

        // Verify the token using JWT_SECRET
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

        // Adding decoded user data to request object
        req.user = decoded;  // This will be available in all routes using this middleware
        next();
        console.log("token verified")
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};

module.exports = verifyToken;