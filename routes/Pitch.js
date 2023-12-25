const express = require("express")
const {addPitch, getAllPitches, getPitchesByDay, reservePitch} = require("../controllers/Pitch")
const { check } = require("express-validator")
const router = express.Router()
const {verifyOwner, verifyUser} = require("../middleware/Auth") 
// const auth = require("../middleware/Auth");

router.post("/addPitch",verifyOwner, addPitch)
router.get("/getAllPitches",getAllPitches)
router.get("/getPitchesByDay",getPitchesByDay)
router.post("/reservePitch",verifyUser,reservePitch)

module.exports = router