const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    activeCourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    trusted_creators: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
