const express = require('express');
const { google } = require('googleapis');
const { YoutubeTranscript } = require('../utils/youtubeTranscript'); // <-- New Local Import
const { evaluateWithGemini } = require('../utils/geminiEvaluator');

const router = express.Router();

// Initialize the YouTube API client
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

// --- HELPER FUNCTION: Fetch Stats AND Transcripts ---
async function getVideoStats(videoIds) {
    if (videoIds.length === 0) return [];

    // 1. Fetch stats in one cheap request
    const response = await youtube.videos.list({
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
    });

    // Filter out YouTube Shorts by checking duration (> 60 seconds)
    const items = response.data.items.filter(item => {
        const match = item.contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return true;
        const h = parseInt(match[1] || 0, 10);
        const m = parseInt(match[2] || 0, 10);
        const s = parseInt(match[3] || 0, 10);
        return (h * 3600 + m * 60 + s) > 60;
    });

    // 2. Concurrently fetch transcripts for all these videos
    const videosWithTranscripts = await Promise.all(items.map(async (item) => {
        let transcriptText = "";

        try {
            // Attempt to scrape the transcript
            const transcriptArray = await YoutubeTranscript.fetchTranscript(item.id);
            // Join the text blocks. We substring it here to save memory before it even hits Gemini.
            transcriptText = transcriptArray.map(t => t.text).join(' ').substring(0, 15000);
        } catch (error) {
            console.log(`⚠️ No transcript available for video ${item.id} - Error: ${error.message || error}`);
            transcriptText = ""; // Leave empty so Gemini knows it failed
        }

        return {
            id: item.id,
            title: item.snippet.title,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            viewCount: parseInt(item.statistics.viewCount || 0),
            likeCount: parseInt(item.statistics.likeCount || 0),
            likeViewRatio: (parseInt(item.statistics.likeCount || 0) / parseInt(item.statistics.viewCount || 1)),
            transcript: transcriptText // The text is now attached!
        };
    }));

    return videosWithTranscripts;
}

// --- HELPER FUNCTION: General Search (The Filtering Logic) ---
async function performGeneralSearch(searchQuery) {
    // 1. Fetch top 20 videos
    const searchRes = await youtube.search.list({
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 20
    });

    const videoIds = searchRes.data.items.map(item => item.id.videoId);
    const videosWithStats = await getVideoStats(videoIds);

    // 2. Calculate Average Views
    const totalViews = videosWithStats.reduce((sum, vid) => sum + vid.viewCount, 0);
    const avgViews = totalViews / (videosWithStats.length || 1);

    // 3. Filter and get Top 5 Most Viewed (Above Average)
    const aboveAverageVids = videosWithStats.filter(vid => vid.viewCount >= avgViews);
    const top5Views = aboveAverageVids
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);

    // 4. Get Top 5 Best Likes-to-Views Ratio
    const top5Ratio = [...videosWithStats]
        .sort((a, b) => b.likeViewRatio - a.likeViewRatio)
        .slice(0, 5);

    // 5. Combine and remove duplicates
    const combinedMap = new Map();
    top5Views.forEach(vid => combinedMap.set(vid.id, vid));
    top5Ratio.forEach(vid => combinedMap.set(vid.id, vid));

    return Array.from(combinedMap.values()); // Returns 5 to 10 unique candidate videos
}

// --- MAIN ROUTE ---
router.post('/', async (req, res) => {
    try {
        const { search_query, preferred_creators } = req.body;

        let winningVideo = null;
        let searchTypeUsed = '';
        let winningChannelIndex = -1;

        // =========================================================
        // STEP 1: The Optimized "Short-Circuit" Biased Search
        // =========================================================
        if (preferred_creators && Array.isArray(preferred_creators) && preferred_creators.length > 0) {
            console.log("\n--- Starting Short-Circuit Biased Search ---");
            const limits = [5, 3, 2]; // Max videos per preferred creator

            for (let i = 0; i < preferred_creators.length; i++) {
                if (i >= limits.length) break;

                const channelId = preferred_creators[i];
                console.log(`[Biased Search] Checking Index ${i} (Channel: ${channelId})...`);

                // 1. Fetch up to limits[i] videos from JUST this channel
                const searchRes = await youtube.search.list({
                    part: 'snippet',
                    q: search_query,
                    channelId: channelId,
                    type: 'video',
                    maxResults: limits[i]
                });

                const videoIds = searchRes.data.items.map(item => item.id.videoId);

                if (videoIds.length === 0) {
                    console.log(`No videos found on Channel ${channelId}. Moving to next index...`);
                    continue;
                }

                // 2. Get stats and transcripts for these specific channel videos
                const candidateVideos = await getVideoStats(videoIds);

                // 3. Ask Gemini to evaluate immediately
                const geminiChoice = await evaluateWithGemini(candidateVideos, search_query);

                if (geminiChoice) {
                    console.log(`✅ Gemini APPROVED a video from preferred Index ${i}! Stopping search.`);
                    winningVideo = geminiChoice;
                    searchTypeUsed = 'biased';
                    winningChannelIndex = i;
                    break; // EXIT THE LOOP: Saves API quota!
                } else {
                    console.log(`❌ Gemini REJECTED videos from preferred Index ${i}. Moving to next index...`);
                }
            }
        }

        // =========================================================
        // STEP 2: Fallback to General Search
        // =========================================================
        if (!winningVideo) {
            console.log("\n--- Running General Search Fallback ---");
            const generalCandidates = await performGeneralSearch(search_query);

            // Ask Gemini to pick the absolute best one from the mixed general pool
            winningVideo = await evaluateWithGemini(generalCandidates, search_query);
            searchTypeUsed = 'general';
        }

        // =========================================================
        // STEP 3: Handle Worst-Case Scenario
        // =========================================================
        if (!winningVideo) {
            return res.status(404).json({
                success: false,
                message: "Could not find a high-quality video for this topic that met the AI standards."
            });
        }

        // =========================================================
        // STEP 4: Send the Result
        // =========================================================
        res.json({
            success: true,
            searchType: searchTypeUsed,
            winningChannelIndex: winningChannelIndex,
            video: winningVideo
        });

    } catch (error) {
        console.error("Error in Search Engine:", error);
        res.status(500).json({ success: false, message: "Engine Failure", error: error.message });
    }
});

module.exports = router;