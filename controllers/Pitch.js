const Pitch = require("../models/Pitch.js")
const auth = require("../middleware/Auth");
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken')

exports.addPitch = (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }

    const pitch = new Pitch(req.body)
    pitch.save()
        .then(async () => {

            await pitch.createDefaultReservations(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 13, 3);
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

exports.reservePitch = async (req, res) => {
    try {
        const pitch = await Pitch.findById(req.params.id);
        const { user, dayName, start_time, pitchId } = req.body;

        // TODO: Bu saatte başka bir rezervasyon var mı kontrolü yapılmalı

        const pitches = await Pitch.findById(pitchId)


        const reservationDay = pitches.reservations.find(reservation => reservation.dayName === dayName);

        if (reservationDay) {
            const reservationTime = reservationDay.reservationTimes.find(time => time.start_time.getUTCHours() === parseInt(start_time));
        
            if (reservationTime) {
                // reservationTime belgesini güncelle
                await Pitch.updateOne(
                    { "_id": pitchId, "reservations._id": reservationDay._id, "reservations.reservationTimes._id": reservationTime._id },
                    { $set: { "reservations.$.reservationTimes.$[time].isAvailable": false } },
                    { arrayFilters: [{ "time._id": reservationTime._id }] }
                );
        
                
            } else {
                console.log('Belirtilen saatte rezervasyon bulunamadı.');
            }
        } else {
            console.log('Belirtilen gün için rezervasyon bulunamadı.');
        }
        


        // Zamanlayıcı başlat
        // const timer = setTimeout(async () => {
        //   // 5 dakika içinde yanıt gelmezse rezervasyonu otomatik olarak reddet
        //   if (reservation.status !== 'approved') {
        //     reservation.status = 'rejected';
        //     await halisaha.save();
        //   }
        // }, 5 * 60 * 1000); // 5 dakika
        // if(reservation.reservationTimes[0].start_time.getHours === "2023-12-23T13:00:00.000+00:00")

        res.json({ message: 'Rezervasyon talebi gönderildi' });

        // Halı saha sahibinin yanıtı
        // Örneğin, burada WebSocket veya diğer gerçek zamanlı iletişim yöntemlerini kullanabilirsiniz
        // Halı saha sahibi yanıt verirse, timer'ı temizleyin ve rezervasyonu güncelleyin
        // clearTimeout(timer);
        // reservation.status = 'approved';
        // await halisaha.save();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}