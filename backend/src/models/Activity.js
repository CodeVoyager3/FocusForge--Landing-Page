const mongoose = require('mongoose');

/**
 * Tracks daily learning activity per user.
 * One document per user per day — upserted on each subtopic completion.
 */
const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Store date as YYYY-MM-DD string for simple day-level grouping
    date: {
        type: String,
        required: true
    },
    // How many subtopics were completed on this day
    subtopicsCompleted: {
        type: Number,
        default: 0
    },
    // Which courses were touched (for breakdown)
    courses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        courseTitle: String,
        count: { type: Number, default: 1 }
    }]
}, { timestamps: true });

// Compound unique index: one doc per user per day
activitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Activity', activitySchema);
