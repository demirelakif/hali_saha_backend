var mongoose = require('mongoose'),
    Schema = mongoose.Schema


const ReservationSchema = new Schema({
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    isAvailable: {type:Boolean, required: true, default:true}
});

const ReservationDays = new Schema({
    reservationTimes: [ReservationSchema],
    dayName:{type:String,required:true}
});

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
    kapaliMi:{type:Boolean,default:false},
    parkAlani:{type:Boolean,default:false},
    tribun:{type:Boolean,default:false},
    playground:{type:Boolean,default:false},
    kilitliDolap:{type:Boolean,default:false},
    eldiven:{type:Boolean,default:false},
    mutfak:{type:Boolean,default:false},
    scoreBoard:{type:Boolean,default:false},
    // Diğer özellikleri buraya ekleyebilirsiniz.
}, { _id: false });


var PitchSchema = new Schema({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'Owner', required:true },
    photos: [PhotoSchema],
    reservations: [ReservationDays],
    features:SahaOzellikleriSchema
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


module.exports = mongoose.model('Pitch', PitchSchema);