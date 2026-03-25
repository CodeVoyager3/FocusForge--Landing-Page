const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Initializes a new course from LLM generated JSON and assigns it to the user.
 */
const initializeCourse = async (userId, llmGeneratedJson) => {
    try {
        // Unlock the first subtopic of the first module
        if (llmGeneratedJson.modules && llmGeneratedJson.modules.length > 0) {
            if (llmGeneratedJson.modules[0].subtopics && llmGeneratedJson.modules[0].subtopics.length > 0) {
                llmGeneratedJson.modules[0].subtopics[0].status = 'active';
            }
        }

        // Create the new course
        const newCourse = new Course({
            userId,
            course_query: llmGeneratedJson.course_query,
            course_title: llmGeneratedJson.course_title,
            modules: llmGeneratedJson.modules
        });

        const savedCourse = await newCourse.save();

        // Update the user's active course
        await User.findByIdAndUpdate(userId, {
            activeCourseId: savedCourse._id
        });

        return savedCourse;
    } catch (error) {
        console.error("Error in initializeCourse:", error);
        throw error;
    }
};

/**
 * Updates the user's trusted creators array based on search type.
 */
const updateTrustedCreators = async (userId, winningChannelId, searchType) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        let creators = user.trusted_creators || [];

        if (searchType === 'biased') {
            const index = creators.indexOf(winningChannelId);
            if (index > 0) {
                // Remove from current position and unshift to front
                creators.splice(index, 1);
                creators.unshift(winningChannelId);
            }
        } else if (searchType === 'general') {
            // Unshift the winning channel to the front
            creators.unshift(winningChannelId);
            
            // Deduplicate to avoid duplicates when shifting
            creators = [...new Set(creators)];
            
            // Keep maximum length to 3
            if (creators.length > 3) {
                creators.pop();
            }
        }

        user.trusted_creators = creators;
        await user.save();
        
        return user;
    } catch (error) {
        console.error("Error in updateTrustedCreators:", error);
        throw error;
    }
};

/**
 * Marks current subtopic complete and unlocks the next one in sequence.
 */
const markSubtopicCompleteAndUnlockNext = async (courseId) => {
    try {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        const { current_module_index, current_subtopic_index, modules } = course;
        
        if (current_module_index >= modules.length) {
            throw new Error("Course already complete or invalid module index");
        }

        const currentModule = modules[current_module_index];
        
        if (current_subtopic_index >= currentModule.subtopics.length) {
            throw new Error("Invalid subtopic index");
        }

        // Mark current subtopic as completed
        currentModule.subtopics[current_subtopic_index].status = 'completed';

        let nextModuleIndex = current_module_index;
        let nextSubtopicIndex = current_subtopic_index + 1;

        // Check if we need to advance to the next module
        if (nextSubtopicIndex >= currentModule.subtopics.length) {
            nextModuleIndex++;
            nextSubtopicIndex = 0;
        }

        // Check if there are more modules left to learn
        if (nextModuleIndex < modules.length) {
            // Unlock the new subtopic
            if (modules[nextModuleIndex].subtopics && modules[nextModuleIndex].subtopics.length > nextSubtopicIndex) {
                modules[nextModuleIndex].subtopics[nextSubtopicIndex].status = 'active';
            }
            
            course.current_module_index = nextModuleIndex;
            course.current_subtopic_index = nextSubtopicIndex;
        } else {
            // The entire course is complete
            // Leave indices pointing to the end or keep them as is
        }

        const updatedCourse = await course.save();
        return updatedCourse;
    } catch (error) {
        console.error("Error in markSubtopicCompleteAndUnlockNext:", error);
        throw error;
    }
};

/**
 * Assessment Engine: Generates and saves a quiz for a subtopic
 * Express endpoint POST /api/course/:courseId/module/:moduleIndex/subtopic/:subtopicIndex/generate-quiz
 */
const generateAndSaveQuiz = async (req, res) => {
    try {
        const { courseId, moduleIndex, subtopicIndex } = req.params;
        const { transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({ success: false, message: "Transcript is required" });
        }

        // Logic Step 1: Find the Course by courseId
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const currentModule = course.modules[moduleIndex];
        if (!currentModule || !currentModule.subtopics[subtopicIndex]) {
            return res.status(404).json({ success: false, message: "Module or subtopic index invalid" });
        }

        const subtopic = currentModule.subtopics[subtopicIndex];

        // Logic Step 2 (Caching): If quiz already exists, return it (saves API costs)
        if (subtopic.quiz && subtopic.quiz.length > 0) {
            return res.json({ success: true, cached: true, quiz: subtopic.quiz });
        }

        // Logic Step 3: Call Gemini
        const { generateQuizFromTranscript } = require('../utils/quizGenerator');
        const generatedQuiz = await generateQuizFromTranscript(subtopic.subtopic_title, transcript);

        if (!generatedQuiz || !Array.isArray(generatedQuiz) || generatedQuiz.length === 0) {
            return res.status(500).json({ success: false, message: "Failed to generate quiz from transcript" });
        }

        // Logic Step 4: Save the generated quiz to the Mongoose document
        subtopic.quiz = generatedQuiz;
        await course.save();

        return res.json({ success: true, cached: false, quiz: generatedQuiz });
    } catch (error) {
        console.error("Error in generateAndSaveQuiz:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

/**
 * Assessment Engine: Grades a user's quiz submission and potentially unlocks the next topic
 * Express endpoint POST /api/course/:courseId/module/:moduleIndex/subtopic/:subtopicIndex/grade
 */
const gradeQuiz = async (req, res) => {
    try {
        const { courseId, moduleIndex, subtopicIndex } = req.params;
        const { userAnswers } = req.body;

        if (!userAnswers || !Array.isArray(userAnswers)) {
            return res.status(400).json({ success: false, message: "userAnswers array is required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const currentModule = course.modules[moduleIndex];
        if (!currentModule || !currentModule.subtopics[subtopicIndex]) {
            return res.status(404).json({ success: false, message: "Module or subtopic index invalid" });
        }

        const subtopic = currentModule.subtopics[subtopicIndex];
        const quiz = subtopic.quiz;

        if (!quiz || quiz.length === 0) {
            return res.status(400).json({ success: false, message: "No quiz found for this subtopic. Please generate it first." });
        }

        if (userAnswers.length !== quiz.length) {
            return res.status(400).json({ success: false, message: `Expected ${quiz.length} answers but received ${userAnswers.length}` });
        }

        // Logic Step 3 (Grading): Compare userAnswers
        let correctCount = 0;
        quiz.forEach((q, index) => {
            if (q.correctAnswer === userAnswers[index]) {
                correctCount++;
            }
        });

        const scorePercentage = (correctCount / quiz.length) * 100;

        // Logic Step 4 (The Adaptive Trigger)
        if (scorePercentage >= 80) {
            // Unlock next topic
            await markSubtopicCompleteAndUnlockNext(courseId);
            return res.json({ 
                success: true, 
                score: scorePercentage, 
                unlockedNext: true,
                message: "Excellent! You scored 80% or higher and unlocked the next topic."
            });
        } else {
            // Do not unlock
            return res.json({
                success: true,
                score: scorePercentage,
                unlockedNext: false,
                message: "You need to score at least 80% to progress. Please review the material and try again."
            });
        }

    } catch (error) {
        console.error("Error in gradeQuiz:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

module.exports = {
    initializeCourse,
    updateTrustedCreators,
    markSubtopicCompleteAndUnlockNext,
    generateAndSaveQuiz,
    gradeQuiz
};
