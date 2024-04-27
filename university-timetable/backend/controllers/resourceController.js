const Resource = require('../models/resource');

// Create Resource
const createResource = async (req, res) => {
  const { name, quantity } = req.body;
  try {
    if (req.userRole !== 'Admin') {
        return res.status(403).json({ message: 'Only admins can create resources' });
    }
  
    const resource = new Resource({ name, quantity });
    const newResource = await resource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Read All Resources
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read Resource by ID
const getResourceById = async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Resource
const updateResource = async (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  try {
    if (req.userRole !== 'Admin') {
        return res.status(403).json({ message: 'Only admins can update resources' });
    }
  
    const updatedResource = await Resource.findByIdAndUpdate(id, { name, quantity }, { new: true });
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Resource
const deleteResource = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.userRole !== 'Admin') {
        return res.status(403).json({ message: 'Only admins can create resources' });
    }
  
    await Resource.findByIdAndDelete(id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
};
