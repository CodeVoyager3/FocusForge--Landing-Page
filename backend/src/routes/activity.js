const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');

/**
 * GET /api/activity/:clerkId?days=30
 * Returns daily activity for the last N days (default 30).
 * Response shape:
 * {
 *   success: true,
 *   activity: [{ date: "2026-03-25", subtopicsCompleted: 4, courses: [...] }],
 *   streak: 3,               // current consecutive active days
 *   totalThisWeek: 12        // subtopics completed in last 7 days
 * }
 */
router.get('/:clerkId', async (req, res) => {
    try {
        const { clerkId } = req.params;
        const days = parseInt(req.query.days || '30', 10);

        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.json({ success: true, activity: [], streak: 0, totalThisWeek: 0 });
        }

        // Build date range: last N days as YYYY-MM-DD strings
        const today = new Date();
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            dates.push(d.toISOString().slice(0, 10));
        }

        const records = await Activity.find({
            userId: user._id,
            date: { $in: dates }
        }).lean();

        // Map to a keyed object for quick lookup
        const byDate = {};
        records.forEach(r => { byDate[r.date] = r; });

        // Fill all days (0 count for days with no activity)
        const activity = dates.map(date => ({
            date,
            subtopicsCompleted: byDate[date]?.subtopicsCompleted || 0,
            courses: byDate[date]?.courses || []
        }));

        // Calculate current streak (consecutive days ending today with > 0)
        let streak = 0;
        for (let i = activity.length - 1; i >= 0; i--) {
            if (activity[i].subtopicsCompleted > 0) {
                streak++;
            } else {
                break;
            }
        }

        // Total this week
        const last7 = activity.slice(-7);
        const totalThisWeek = last7.reduce((s, d) => s + d.subtopicsCompleted, 0);

        return res.json({ success: true, activity, streak, totalThisWeek });
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

module.exports = router;
