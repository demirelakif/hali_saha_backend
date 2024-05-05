const express = require("express")
const {addPitch, getAllPitches, getPitchesByDay, reservePitch, updatePitch, deletePitch, getPitchesByName, getPitchById, getPitchByDate, cancelReservation} = require("../controllers/Pitch")
const { check } = require("express-validator")
const router = express.Router()
const {verifyOwner, verifyUser} = require("../middleware/Auth") 
// const auth = require("../middleware/Auth");

router.post("/addPitch",verifyOwner, addPitch)
router.get("/getAllPitches",getAllPitches)
router.get("/getPitchesByDay",getPitchesByDay)
router.post("/reservePitch",verifyUser,reservePitch)
router.post("/updatePitch",verifyOwner,updatePitch)
router.post("/deletePitch",verifyOwner,deletePitch)
router.post("/getPitchesByName",getPitchesByName)
router.post("/getPitchById",getPitchById)
router.post("/getPitchByDate",getPitchByDate)
router.post("/cancelReservation",verifyUser,cancelReservation)


module.exports = router