import Design from '../models/Design.model.js';

/**
 * @route   POST /api/designs
 * @desc    Create a new design
 * @access  Private
 */
export const createDesign = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, baseModel, colors, thumbnail, status, tags } = req.body;

    // Validate required fields
    if (!name || !baseModel || !colors) {
      return res.status(400).json({
        success: false,
        message: 'Name, base model, and colors are required',
      });
    }

    // Validate base model structure
    if (!baseModel.id || !baseModel.name) {
      return res.status(400).json({
        success: false,
        message: 'Base model must have id and name',
      });
    }

    // Validate colors structure
    const requiredColorFields = ['laces', 'mesh', 'caps', 'inner', 'sole', 'stripes', 'band', 'patch'];
    const missingColors = requiredColorFields.filter((field) => !colors[field]);
    if (missingColors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing color fields: ${missingColors.join(', ')}`,
      });
    }

    const trimmedName = name.trim();
    const isAutoSaved = tags && tags.includes('auto-saved');

    // Check if design name already exists for this user
    const existingDesign = await Design.findOne({ user: userId, name: trimmedName });
    
    if (existingDesign) {
      // For auto-saved designs, check if it's identical (same colors and base model)
      if (isAutoSaved) {
        const colorsMatch = JSON.stringify(existingDesign.colors) === JSON.stringify(colors);
        const baseModelMatch = existingDesign.baseModel.id === baseModel.id;
        
        if (colorsMatch && baseModelMatch) {
          // Return the existing design instead of creating a duplicate
          await existingDesign.populate('user', 'name email');
          return res.status(200).json({
            success: true,
            message: 'Design already exists',
            data: existingDesign,
          });
        }
        
        // If not identical, append timestamp to make name unique
        const timestamp = Date.now().toString(36).toUpperCase();
        const uniqueName = `${trimmedName.replace(/#[A-Z0-9]+$/, '')}#${timestamp}`;
        
        // Create design with unique name
        const design = await Design.create({
          user: userId,
          name: uniqueName,
          description: description?.trim() || '',
          baseModel,
          colors,
          thumbnail: thumbnail || null,
          status: status || 'draft',
          tags: tags || [],
        });

        await design.populate('user', 'name email');

        return res.status(201).json({
          success: true,
          message: 'Design saved successfully',
          data: design,
        });
      }
      
      // For manually saved designs, return error
      return res.status(400).json({
        success: false,
        message: 'A design with this name already exists. Please choose a different name.',
      });
    }

    // Create design
    const design = await Design.create({
      user: userId,
      name: trimmedName,
      description: description?.trim() || '',
      baseModel,
      colors,
      thumbnail: thumbnail || null,
      status: status || 'draft',
      tags: tags || [],
    });

    await design.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Design saved successfully',
      data: design,
    });
  } catch (error) {
    console.error('Error creating design:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Handle duplicate name error (from unique index)
    if (error.code === 11000 || error.message.includes('duplicate')) {
      const isAutoSaved = req.body.tags && req.body.tags.includes('auto-saved');
      
      if (isAutoSaved) {
        // For auto-saved designs, try again with timestamp
        const timestamp = Date.now().toString(36).toUpperCase();
        const baseName = req.body.name.trim().replace(/#[A-Z0-9]+$/, '');
        const uniqueName = `${baseName}#${timestamp}`;
        
        try {
          const design = await Design.create({
            user: req.user.id,
            name: uniqueName,
            description: req.body.description?.trim() || '',
            baseModel: req.body.baseModel,
            colors: req.body.colors,
            thumbnail: req.body.thumbnail || null,
            status: req.body.status || 'draft',
            tags: req.body.tags || [],
          });

          await design.populate('user', 'name email');

          return res.status(201).json({
            success: true,
            message: 'Design saved successfully',
            data: design,
          });
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'A design with this name already exists. Please choose a different name.',
      });
    }
    
    // Log validation errors in detail
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
      }));
      console.error('Validation error details:', validationErrors);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to save design',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      ...(error.name === 'ValidationError' && {
        validationErrors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message,
        })),
      }),
    });
  }
};

/**
 * @route   GET /api/designs
 * @desc    Get user's designs
 * @access  Private
 */
export const getDesigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20, search } = req.query;

    const query = { user: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const designs = await Design.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email');

    const total = await Design.countDocuments(query);

    res.json({
      success: true,
      data: designs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch designs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/designs/:designId
 * @desc    Get design by ID
 * @access  Private
 */
export const getDesignById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { designId } = req.params;

    const design = await Design.findOne({ _id: designId, user: userId })
      .populate('user', 'name email');

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found',
      });
    }

    res.json({
      success: true,
      data: design,
    });
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch design',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/designs/:designId
 * @desc    Update design
 * @access  Private
 */
export const updateDesign = async (req, res) => {
  try {
    const userId = req.user.id;
    const { designId } = req.params;
    const { name, description, colors, thumbnail, status, tags, baseModel } = req.body;

    const design = await Design.findOne({ _id: designId, user: userId });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found',
      });
    }

    // Update fields
    if (name !== undefined) {
      const trimmedName = name.trim();
      // Check if new name already exists for this user (excluding current design)
      if (trimmedName !== design.name) {
        const existingDesign = await Design.findOne({ 
          user: userId, 
          name: trimmedName,
          _id: { $ne: designId }
        });
        if (existingDesign) {
          return res.status(400).json({
            success: false,
            message: 'A design with this name already exists. Please choose a different name.',
          });
        }
      }
      design.name = trimmedName;
    }
    if (description !== undefined) design.description = description?.trim() || '';
    if (colors !== undefined) design.colors = colors;
    if (thumbnail !== undefined) design.thumbnail = thumbnail;
    if (status !== undefined) design.status = status;
    if (tags !== undefined) design.tags = tags;
    if (baseModel !== undefined) design.baseModel = baseModel;

    // Increment edit count
    design.totalEdits += 1;

    await design.save();
    await design.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Design updated successfully',
      data: design,
    });
  } catch (error) {
    console.error('Error updating design:', error);
    
    // Handle duplicate name error (from unique index)
    if (error.code === 11000 || error.message.includes('duplicate')) {
      return res.status(400).json({
        success: false,
        message: 'A design with this name already exists. Please choose a different name.',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update design',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   DELETE /api/designs/:designId
 * @desc    Delete design
 * @access  Private
 */
export const deleteDesign = async (req, res) => {
  try {
    const userId = req.user.id;
    const { designId } = req.params;

    const design = await Design.findOne({ _id: designId, user: userId });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found',
      });
    }

    await Design.deleteOne({ _id: designId });

    res.json({
      success: true,
      message: 'Design deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete design',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/designs/:designId/duplicate
 * @desc    Duplicate design
 * @access  Private
 */
export const duplicateDesign = async (req, res) => {
  try {
    const userId = req.user.id;
    const { designId } = req.params;

    const originalDesign = await Design.findOne({ _id: designId, user: userId });

    if (!originalDesign) {
      return res.status(404).json({
        success: false,
        message: 'Design not found',
      });
    }

    // Create duplicate
    const duplicate = await Design.create({
      user: userId,
      name: `${originalDesign.name} Copy`,
      description: originalDesign.description,
      baseModel: originalDesign.baseModel,
      colors: originalDesign.colors,
      thumbnail: originalDesign.thumbnail,
      status: 'draft',
      tags: originalDesign.tags,
      totalEdits: 1,
    });

    await duplicate.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Design duplicated successfully',
      data: duplicate,
    });
  } catch (error) {
    console.error('Error duplicating design:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate design',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};





