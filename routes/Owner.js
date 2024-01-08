const express = require("express")
const { signup, signin, signout, getMyRequests, updateRequest, deleteOwner} = require("../controllers/Owner")
const { check } = require("express-validator")
const router = express.Router()
const {verifyUser,verifyOwner} = require("../middleware/Auth") 

router.post("/signup", [
    check("name", "Name atleast should be 3 characters").isLength({ min: 3 }),
    check("phoneNumber", "Phone Number should be valid").isMobilePhone(),
    check("password", "Password atleast 4 character").isLength({ min: 4 }),
    check("tcIdNo","Tc Id No should be 11 character").isLength(11)
], signup)

router.post("/signin",signin)

router.get("/checkowner",verifyOwner,(req,res,next)=>{res.send("hello owner")})

router.post("/signout",signout)

router.get("/getMyRequests",verifyOwner,getMyRequests)

router.post("/deleteOwner",verifyOwner,deleteOwner)

router.post("/updateRequest",verifyOwner,updateRequest)

module.exports = router