const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/:courseId/module/:moduleIndex/subtopic/:subtopicIndex/generate-quiz', courseController.generateAndSaveQuiz);
router.post('/:courseId/module/:moduleIndex/subtopic/:subtopicIndex/grade', courseController.gradeQuiz);

module.exports = router;
