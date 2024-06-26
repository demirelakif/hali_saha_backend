var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;



var UserSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: false },
    email: { type: String, required: false },
    footNum: { type: Number, required: false },
    position: { type: String, required: false },
    phoneNumber: {
        type: String,
        index: { unique: true },
        required: true,
    },
    reservationsHistory: [{type: Schema.Types.ObjectId, ref:'reservations', required: false }],
},
    { timestamps: true }
);

UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};




module.exports = mongoose.model('User', UserSchema);