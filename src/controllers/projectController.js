const Project = require('../models/project');
const User = require('../models/user'); // For potential future use, e.g., checking user existence
const { Op, sequelize } = require('sequelize'); // Import sequelize for raw queries/functions if needed

// @desc    Get all projects for the authenticated user
// @route   GET /api/projects
// @access  Private (only shows projects belonging to the logged-in user)
const getProjects = async (req, res) => {
    try {
        // Find all projects where the userId matches the authenticated user's ID
        const projects = await Project.findAll({
            where: { userId: req.user }, // req.user is set by authMiddleware
            order: [['createdAt', 'DESC']] // Order by creation date, newest first
        });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error fetching projects.' });
    }
};

// @desc    Get project statistics for the authenticated user
// @route   GET /api/projects/stats
// @access  Private
const getProjectStats = async (req, res) => {
    try {
        const userId = req.user;

        // Total projects count for the user
        const totalProjects = await Project.count({ where: { userId } });

        // Projects added in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Subtract 30 days

        const projectsLast30Days = await Project.count({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: thirtyDaysAgo, // Greater than or equal to 30 days ago
                },
            },
        });

        // Projects added per month (for a bar chart, e.g.)
        // This query groups projects by month and counts them.
        const monthlyProjects = await Project.findAll({
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('created_at')), 'month'], // Extract month part of createdAt
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'] // Count projects
            ],
            where: { userId }, // Filter by user
            group: [sequelize.fn('date_trunc', 'month', sequelize.col('created_at'))], // Group by the truncated month
            order: [[sequelize.fn('date_trunc', 'month', sequelize.col('created_at')), 'ASC']], // Order by month ascending
            raw: true // Return raw data, not Sequelize instances
        });

        // Format monthly data for easier consumption by frontend charting libraries
        const formattedMonthlyProjects = monthlyProjects.map(item => ({
            month: new Date(item.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            count: parseInt(item.count) // Ensure count is a number
        }));

        res.json({
            totalProjects,
            projectsLast30Days,
            monthlyProjects: formattedMonthlyProjects,
            // Add more stats here as needed, e.g., projects by category
        });

    } catch (error) {
        console.error('Error fetching project statistics:', error);
        res.status(500).json({ message: 'Server error fetching statistics.' });
    }
};

// @desc    Add a new project
// @route   POST /api/projects
// @access  Private
const addProject = async (req, res) => {
    const { name, link, description, apkLink } = req.body; // destructure data from request body

    try {
        // Create the project, associating it with the authenticated user's ID
        const project = await Project.create({
            name,
            link,
            description,
            apkLink,
            userId: req.user, // The userId is taken from the authenticated user's token
        });
        res.status(201).json({ message: 'Project added successfully!', project });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ message: 'Server error adding project.' });
    }
};

// @desc    Update an existing project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    const { id } = req.params; // Project ID from URL parameters
    const { name, link, description, apkLink } = req.body; // Updated data

    try {
        // Find the project by its ID AND ensure it belongs to the authenticated user
        const project = await Project.findOne({ where: { id, userId: req.user } });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not authorized to update it.' });
        }

        // Update project fields
        project.name = name !== undefined ? name : project.name;
        project.link = link !== undefined ? link : project.link;
        project.description = description !== undefined ? description : project.description;
        project.apkLink = apkLink !== undefined ? apkLink : project.apkLink;

        await project.save(); // Save changes to the database
        res.json({ message: 'Project updated successfully!', project });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error updating project.' });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    const { id } = req.params; // Project ID from URL parameters

    try {
        // Find the project by its ID AND ensure it belongs to the authenticated user
        const project = await Project.findOne({ where: { id, userId: req.user } });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not authorized to delete it.' });
        }

        await project.destroy(); // Delete the project from the database
        res.json({ message: 'Project deleted successfully!' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error deleting project.' });
    }
};

module.exports = {
    getProjects,
    getProjectStats,
    addProject,
    updateProject,
    deleteProject,
};
