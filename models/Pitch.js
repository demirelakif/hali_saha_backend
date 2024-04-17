var mongoose = require('mongoose'),
    Schema = mongoose.Schema

const LocationSchema = new mongoose.Schema({
    lat: { type: Number, default: 'Point', required: true },
    lng: { type: Number, default: 'Point', required: true },
    name: { type: String, required: true },
}, { _id: false });


const ReservationSchema = new Schema({
    start_time: { type: Number, required: true },
    isAvailable: { type: String, required: true, default: "Müsait" },
    user_id: { type: Schema.Types.ObjectId, ref:'User', required: false },
    date: { type: Date, required: true },    
});

// const ReservationDays = new Schema({
//     reservationTimes: [ReservationSchema],
//     dayName:{type:String,required:true}
// });

var PhotoSchema = new Schema({
    url: { type: String, required: true },
    caption: { type: String },
    dateTaken: { type: Date }
});

const SahaOzellikleriSchema = new Schema({
    icecekIkrami: { type: Boolean, default: false },
    kramponHizmeti: { type: Boolean, default: false },
    fileVarMi: { type: Boolean, default: false },
    dus: { type: Boolean, default: false },
    sosyalHaliSahaVarMi: { type: Boolean, default: false },
    kapaliMi: { type: Boolean, default: false },
    parkAlani: { type: Boolean, default: false },
    tribun: { type: Boolean, default: false },
    playground: { type: Boolean, default: false },
    kilitliDolap: { type: Boolean, default: false },
    eldiven: { type: Boolean, default: false },
    mutfak: { type: Boolean, default: false },
    scoreBoard: { type: Boolean, default: false },
    // Diğer özellikleri buraya ekleyebilirsiniz.
}, { _id: false });


var PitchSchema = new Schema({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
    photos: [PhotoSchema],
    reservations: [ReservationSchema],
    features: SahaOzellikleriSchema,
    location: { type: LocationSchema, required: true, index: '2dsphere' },
    rating: { type: Number, required: true, default: 5 }
},
    { timestamps: true }
);


PitchSchema.pre('save', function (next) {
    if (!this.isNew) {
        // Eğer saha zaten varsa izin verme
        return next();
    }

    // Eğer yeni bir saha ekleniyorsa, saha sahibi (owner) kontrolü yap
    // Bu örnekte, owner saha sahibinin kullanıcı kimliği olarak kabul edilmiştir.
    // Bu kontrolü kendi uygulamanıza göre ayarlamalısınız.
    if (!this.owner) {
        return next(new Error('Saha sahibi belirtilmemiş.'));
    }

    // Diğer özel doğrulama kurallarını burada ekleyebilirsiniz.

    next();
});


// Belirli bir tarih aralığında default rezervasyonları oluşturan yardımcı fonksiyon
PitchSchema.methods.createDefaultReservations = async function (days, startHour, endHour) {
    try {
        const reservations = [];

        for (const day of days) {
            const reservationDay = {
                dayName: day,
                reservationTimes: [],
            };

            let currentHour = startHour;
            do {
                const reservation = {
                    start_time: new Date().setUTCHours(currentHour, 0, 0, 0),
                    end_time: new Date().setUTCHours(currentHour + 1, 0, 0, 0),
                };

                reservationDay.reservationTimes.push(reservation);

                currentHour = (currentHour + 1) % 24; // Use modulo to loop around the clock
            } while (currentHour !== endHour);

            reservations.push(reservationDay);
        }

        this.reservations = reservations;
        await this.save();

        console.log('Default rezervasyonlar oluşturuldu.');
    } catch (error) {
        console.error('Hata:', error.message);
    }
};

PitchSchema.methods.reservePitch = async function (start_time, user_id, reservationName, reservationPhoneNumber,date) {
    try {
        // Rezervasyon çakışmasını kontrol et
        if (this.isReservationConflict(start_time, new Date(date))) {
            throw new Error('Bu zaman dilimi için başka bir rezervasyon bulunmaktadır.');
        }

        const reservation = {
            start_time: start_time,
            isAvailable: "İstek Gönderildi",
            reservationPhoneNumber: reservationPhoneNumber,
            reservationName: reservationName,
            user_id: user_id,
            date: date
        };

        this.reservations.push(reservation);
        await this.save();

        //console.log('Saha rezerve edildi:', this);
        return this; // Opsiyonel olarak, rezerve edilen sahayı geri döndürebilirsiniz.
    } catch (error) {
        console.error('Hata:', error.message);
        throw error;
    }
};


PitchSchema.methods.isReservationConflict = function (start_time, date) {

    return this.reservations.some(reservation => {
        const reservationDate = new Date(reservation.date);
        //console.log(reservationDate.getMonth(),date.getMonth())
        if (reservation.start_time == start_time && reservationDate.getMonth() == date.getMonth() && reservationDate.getDay() == date.getDay() ) {
            return true;
        }
    });
};


module.exports = mongoose.model('Pitch', PitchSchema);