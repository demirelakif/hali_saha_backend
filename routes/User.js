const express = require("express")
const { signup, signin, signout, deleteUser} = require("../controllers/User")
const { check } = require("express-validator")
const router = express.Router()
const {verifyUser,verifyOwner} = require("../middleware/Auth") 

router.post("/signup", [
    check("name", "Name atleast should be 3 characters").isLength({ min: 3 }),
    check("phoneNumber", "Phone Number should be valid").isMobilePhone(),
    check("password", "Password atleast 4 character").isLength({ min: 4 })
], signup)

router.post("/signin",signin)

router.get("/checkuser",verifyUser,(req,res,next)=>{res.send("hello user")})

router.post("/signout",signout)

router.post("/deleteUser",verifyUser,deleteUser)

module.exports = router