const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }
    try {
        const data = jwt.verify(token, config.SECRET);
        if(data.location){
            req.owner = data;
        }else{
            req.user = data;
        }
        
        return next();
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
};

exports.verifyUser = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) {
            return next(createError(403, "You are not authorized!"));
        }
        
        if (req.user) {
            next();
        } else {
            return next(createError(403, "You are not authorized!"));
        }
    });
};

exports.verifyOwner = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) {
            return next(createError(403, "You are not authorized!"));
        }
        
        if (req.owner) {
            next();
        } else {
            return next(createError(403, "You are not authorized!"));
        }
    });
};
