const Pitch = require("../models/Pitch.js")
const Owner = require("../models/Owner.js")
const auth = require("../middleware/Auth");
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken')

exports.addPitch = async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }

    const owner = await Owner.findById(req.owner._id)
    console.log(owner)
    const pitch = new Pitch({
        ...req.body,
        owner: req.owner._id,  // Owner'ın _id'sini ekleyin,
        location:owner.location
    });

    // console.log(pitch)
    pitch.save()
        .then(async () => {

            // await pitch.createDefaultReservations(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 13, 3);
            const { _id, name, isCovered } = pitch
            res.status(200).json({
                msg: "pitch successfully inserted",
                pitch: {
                    _id,
                    name,
                    isCovered
                }
            })
        })
        .catch((err) => {
            res.status(400).json({
                error: err.message
            })
        })
}


exports.getAllPitches = async (req, res) => {
    try {
        const pitches = await Pitch.find();

        res.status(200).json({ pitches });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getPitchesByDay = async (req, res) => {
    try {
        const pitches = await Pitch.find();
        const reservation = pitches[0].reservations.find(reservation => {
            return (
                reservation.dayName === req.body.dayName
            );
        });

        res.status(200).json({ reservation })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getPitchesByName = async (req, res) => {
    try {
        
        const { name } = req.body; // Aranacak saha adı
        const pitches = await Pitch.find({ 'name': { $regex: new RegExp(name, 'i') } });

        res.status(200).json({ pitches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPitchById = async (req, res) => {
    try {
        
        const { id } = req.body; // Aranacak saha adı
        const pitch = await Pitch.findById(id)

        res.status(200).json({ pitch });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const schedule = require('node-schedule');

exports.reservePitch = async (req, res) => {
    try {

        const { pitchId, start_time, user_id, reservationName, reservationPhoneNumber } = req.body;

        const pitch = await Pitch.findById(pitchId);

        if (!pitch) {
            return res.status(404).json({ message: "Pitch not found" });
        }

        await pitch.reservePitch(start_time, user_id, reservationName, reservationPhoneNumber);

        res.status(201).json({ message: "Reservation created successfully" });
        // const pitch = await Pitch.findById(req.params.id);
        // const { dayName, start_time, pitchId, reservationPhoneNumber, reservationName, user_id } = req.body;
        // console.log(user_id)

        // const pitches = await Pitch.findById(pitchId);
        // const reservationDay = pitches.reservations.find(reservation => reservation.dayName === dayName);

        // if (reservationDay) {
        //     const reservationTime = reservationDay.reservationTimes.find(time => time.start_time.getUTCHours() === parseInt(start_time));

        //     if (reservationTime.isAvailable === "Müsait") {

        //         await Pitch.updateOne(
        //             { "_id": pitchId, "reservations._id": reservationDay._id, "reservations.reservationTimes._id": reservationTime._id },
        //             { $set: { "reservations.$.reservationTimes.$[time].isAvailable": "İstek Gönderildi" },
        //             "reservations.$.reservationTimes.$[time].reservationPhoneNumber": reservationPhoneNumber,
        //             "reservations.$.reservationTimes.$[time].reservationName": reservationName,
        //             "reservations.$.reservationTimes.$[time].user_id": user_id
        //          },
        //             { arrayFilters: [{ "time._id": reservationTime._id }] }
        //         );

        //         res.json({ message: 'Rezervasyon talebi gönderildi', reservationTime });

        //         // Belirli bir süre sonra kontrol işlemini gerçekleştirmek için node-schedule kullanımı
        //         const updateJob = schedule.scheduleJob(new Date(Date.now() + 10 * 60 * 1000), async () => {
        //             const updatedPitch = await Pitch.findById(pitchId);
        //             const updatedReservationDay = updatedPitch.reservations.find(reservation => reservation.dayName === dayName);
        //             const updatedReservationTime = updatedReservationDay.reservationTimes.find(time => time.start_time.getUTCHours() === parseInt(start_time));

        //             if (updatedReservationTime.isAvailable === "İstek Gönderildi") {

        //                 await Pitch.updateOne(
        //                     { "_id": pitchId, "reservations._id": reservationDay._id, "reservations.reservationTimes._id": reservationTime._id },
        //                     {
        //                         $set: {
        //                             "reservations.$.reservationTimes.$[time].isAvailable": "Müsait",
        //                         }

        //                     },
        //                     { arrayFilters: [{ "time._id": reservationTime._id }] }
        //                 );

        //                 console.log('Belge geri döndürüldü');
        //             } else {
        //                 console.log('Belge zaten güncellenmiş veya durumu değişmiş.');
        //             }
        //         });
        //     } else {
        //         console.log('Belirtilen saatte rezervasyon bulunamadı.');
        //         res.json({ message: 'Belirtilen saat dolu.', reservationTime });
        //     }
        // } else {
        //     console.log('Belirtilen gün için rezervasyon bulunamadı.');
        //     res.json({ message: 'Belirtilen gün için rezervasyon bulunamadı.', reservationDay });
        // }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updatePitch = async (req, res) => {
    try {
        const updateFields = req.body.updateFields;

        const pitch = await Pitch.findById(req.body.pitchId)
        if (req.owner._id === pitch.owner.toString()) {
            // Güncelleme işlemi
            const updatedPitch = await Pitch.findByIdAndUpdate(req.body.pitchId, updateFields, { new: true });

            if (updatedPitch) {
                console.log('Saha başarıyla güncellendi:', updatedPitch);
                res.json({ message: 'Saha başarıyla güncellendi', updatedPitch });
            } else {
                console.log('Saha bulunamadı veya güncellenemedi.');
                res.status(404).json({ message: 'Saha bulunamadı veya güncellenemedi' });
            }
        } else {
            res.status(500).json({ error: "Sadece kendi sahalarını düzenleyebilirsin." })
        }
    } catch (error) {
        console.error('Güncelleme sırasında bir hata oluştu:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deletePitch = async (req, res) => {
    try {
        const pitch = await Pitch.findById(req.body.pitchId)

        if (req.owner._id === pitch.owner.toString()) {
            Pitch.findByIdAndDelete(req.body.pitchId).then(() => {
                res.status(200).json({ message: "Saha başarıyla silindi." })
            }).catch((error) => {
                res.status(400).json({ error: error.message })
            })

        } else {
            res.status(400).json({ error: "Saha doğru değil veya sen sahanın sahibi değilsin." })
        }

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}