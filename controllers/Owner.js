const Owner = require("../models/Owner")
const auth = require("../middleware/Auth");
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken')



function tcKimlikDogrula(tcKimlikNo) {
    const digits = tcKimlikNo.toString().split('').map(Number);
  
    if (digits.length !== 11) {
      return false; // TC Kimlik numarası 11 haneli olmalıdır.
    }
    
    let tek = 0;
    let cift = 0
    const sum = digits.slice(0, 9).reduce((acc, digit, index) => {
      if ((index+1) % 2 === 0) {
        cift += digit
      } else {
        tek += digit
      }
    }, 0);
    
    const no10 = ((tek*7)-cift) % 10;
    const toplam = digits.reduce((acc, num) => acc + num, 0) - digits[10];

    if((toplam%10)==digits[10] && no10 == digits[9]){
        return true;
    }
  }

exports.signup = (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }

    const owner = new Owner(req.body)

    if (!tcKimlikDogrula(owner.tcIdNo)){
        return res.status(400).json({
            error: "Wrong tcIdNo"
        })
    }

    owner.save()
        .then(() => {
            const { _id, name, phoneNumber} = owner
            res.status(200).json({
                msg: "Owner successfully inserted",
                owner: {
                    _id,
                    name
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
        const owner = await Owner.findOne({ phoneNumber });

        if (!owner) {
            return res.status(400).json({
                error: "Wrong phoneNumber"
            });
        }

        // test a matching password
        owner.comparePassword(password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(400).json({
                    error: "Wrong password"
                });
            }

            // create token
            const token = jwt.sign({ _id: owner._id, phoneNumber: owner.phoneNumber, address:owner.address }, process.env.SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });

            const { _id, name, phoneNumber} = owner;

            res.json({
                accessToken: token,
                owner: {
                    _id,
                    name,
                    phoneNumber,
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


exports.setOwner = (req, res) => {
    res.clearCookie("token")
    res.status(200).json({
        message: "Logout successfully"
    })
}


exports.signout = (req, res) => {
    res.clearCookie("token")
    res.status(200).json({
        message: "Logout successfully"
    })
}

