const express = require("express")
const { signup, signin, signout, getMyRequests, updateRequest, deleteOwner, getOwnerById, getAllOwners, getOwnersByName, getMyPitches} = require("../controllers/Owner")
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

router.get("/checkOwner",verifyOwner,(req,res,next)=>{res.send("hello owner")})

router.post("/signout",signout)

router.get("/getAllOwners",getAllOwners)

router.get("/getMyRequests",verifyOwner,getMyRequests)

router.post("/getOwnerById",getOwnerById)

router.post("/deleteOwner",verifyOwner,deleteOwner)

router.post("/updateRequest",verifyOwner,updateRequest)

router.post("/getOwnersByName",getOwnersByName)

router.get("/getMyPitches",verifyOwner,getMyPitches)

module.exports = router