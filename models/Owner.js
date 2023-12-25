var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;



var OwnerSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: false},
    phoneNumber: {
        type: String,
        index: { unique: true},
        required: true,
    },
    taxNo:{type:Number, /*değişir*/required:false, index:{unique:true}},
    address:{type:String, required:true},
    tcIdNo:{type:String, required:true}
},
    { timestamps: true }
);




  

OwnerSchema.pre('save', function (next) {
    var owner = this;

    // only hash the password if it has been modified (or is new)
    if (!owner.isModified('password')) return next();
    

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(owner.password, salt, function (err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            owner.password = hash;
            next();
        });
    });
});

OwnerSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};




module.exports = mongoose.model('Owner', OwnerSchema);