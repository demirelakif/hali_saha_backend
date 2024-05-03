const User = require("../models/User")
const auth = require("../middleware/Auth");
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken');
const Pitch = require("../models/Pitch");
const Owner = require("../models/Owner");

exports.signup = (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }

    const user = new User(req.body)
    user.save()
        .then(() => {
            const { _id, name, phoneNumber } = user
            res.status(200).json({
                msg: "User successfully inserted",
                user: {
                    _id,
                    name,
                    phoneNumber
                }
            })
        })
        .catch((err) => {
            res.status(400).json({
                error: err.message
            })
        })
}

exports.signin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(400).json({
                error: "Wrong phoneNumber"
            });
        }

        // test a matching password
        user.comparePassword(password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(400).json({
                    error: "Wrong password"
                });
            }

            // create token
            const token = jwt.sign({ _id: user._id, phoneNumber: user.phoneNumber, name: user.name }, process.env.SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });

            const { _id, name, phoneNumber } = user;

            res.json({
                accessToken: token,
                user: {
                    _id,
                    name,
                    phoneNumber
                }
            });
        });
    } catch (err) {
        // Hata yönetimi
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};


exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.user_id).then(() => {
        res.status(200).json({ message: "User başarıyla silindi." })
    }).catch((error) => {
        res.status(400).json({ error: error.message })
    })
}

exports.getHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const resUserIds = user.reservationsHistory || [];

        const pitches = await Pitch.find();
        const matchedReservations = [];

        // Asenkron olarak bütün sahaları ve rezervasyonları kontrol et
        await Promise.all(
            pitches.map(async (pitch) => {
                for (const reservation of pitch.reservations) {
                    if (resUserIds.includes(reservation._id)) {
                        const owner = await Owner.findById(pitch.owner);
                        matchedReservations.push({ reservation, owner });
                    }
                }
            })
        );

        return res.json(matchedReservations);
    } catch (error) {
        return res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};




exports.signout = (req, res) => {
    res.clearCookie("token")
    res.status(200).json({
        message: "Logout successfully"
    })
}

