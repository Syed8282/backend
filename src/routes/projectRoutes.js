const express = require('express');
const { getProjects, getProjectStats, addProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { validateProject } = require('../middleware/validationMiddleware');

const router = express.Router();

// All project management routes are protected, meaning only logged-in users
// can access them. This is a common pattern for portfolio editing.
// If you wanted to have public viewing of projects, you'd create a separate
// route (e.g., GET /api/public/projects) that doesn't use the 'protect' middleware.

router.get('/', protect, getProjects);       // Get all projects for the authenticated user
router.get('/stats', protect, getProjectStats); // Get project statistics for the user
router.post('/', protect, validateProject, addProject);  // Add a new project (with validation)
router.put('/:id', protect, validateProject, updateProject); // Update a project (with validation)
router.delete('/:id', protect, deleteProject);  // Delete a project

module.exports = router;
