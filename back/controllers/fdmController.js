const FdmEvent = require("../models/fdm.model");

// @desc    Get all FDM events (with sorting & basic filtering)
// @route   GET /api/fdm
exports.getAllEvents = async (req, res) => {
    try {
        const events = await FdmEvent.find().sort({ occurrenceDate: -1 });
        res.status(200).json({
            success: true,
            count: events.length,
            data: events 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get a single FDM event
// @route   GET /api/fdm/:id
exports.getEventById = async (req, res) => {
    try {
        const event = await FdmEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: "Record not found" });
        
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new FDM event
// @route   POST /api/fdm
exports.createEvent = async (req, res) => {
    try {
        const eventData = { ...req.body };
        
        // Handle file upload if present
        if (req.file) {
            eventData.attachments = [{
                fileName: req.file.originalname,
                filePath: req.file.filename
            }];
        }

        const newEvent = await FdmEvent.create(eventData);
        res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
        res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    }
};

// @desc    Update FDM event (General edit or Close)
// @route   PUT /api/fdm/:id
exports.updateEvent = async (req, res) => {
    try {
        const updated = await FdmEvent.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        
        if (!updated) return res.status(404).json({ success: false, message: "Record not found" });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed", error: error.message });
    }
};

// @desc    Delete FDM event
// @route   DELETE /api/fdm/:id
exports.deleteEvent = async (req, res) => {
    try {
        const event = await FdmEvent.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: "Record not found" });
        
        res.status(200).json({ success: true, message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};