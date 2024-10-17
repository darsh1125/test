// models/AssignmentTracker.js
const mongoose = require('mongoose');

const assignmentTrackerSchema = new mongoose.Schema({
    lastAssignedIndex: {
        type: Number,
        default: -1  // Initialize with -1 to start with the first executive
    }
});

module.exports = mongoose.model('AssignmentTracker', assignmentTrackerSchema);



const Customer = require('./models/Customer');
const Executive = require('./models/Executive');
const AssignmentTracker = require('./models/AssignmentTracker');

// Assign an executive to a customer using round-robin
app.post('/assign-executive-round-robin', async (req, res) => {
    try {
        const { customerId } = req.body;

        // Get all available executives
        const executives = await Executive.find();
        if (executives.length === 0) {
            return res.status(404).json({ error: 'No executives available' });
        }

        // Find the customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Get or initialize the assignment tracker (only one document in this collection)
        let tracker = await AssignmentTracker.findOne();
        if (!tracker) {
            tracker = new AssignmentTracker({ lastAssignedIndex: -1 });
            await tracker.save();
        }

        // Calculate the next executive in round-robin order
        const nextIndex = (tracker.lastAssignedIndex + 1) % executives.length;
        const nextExecutive = executives[nextIndex];

        // Assign the next executive to the customer
        customer.assignedExecutive = nextExecutive._id;
        await customer.save();

        // Update the tracker with the new last assigned executive index
        tracker.lastAssignedIndex = nextIndex;
        await tracker.save();

        // Optionally, increment the assigned customer count for the executive
        nextExecutive.assignedCustomers += 1;
        await nextExecutive.save();

        res.status(200).json({
            message: `Executive ${nextExecutive.name} assigned to customer successfully`,
            customer
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign executive' });
    }
});



const Customer = require('./models/Customer');
const Executive = require('./models/Executive');
const AssignmentTracker = require('./models/AssignmentTracker');

// Assign an executive to a customer using round-robin with a limit
app.post('/assign-executive-round-robin', async (req, res) => {
    try {
        const { customerId } = req.body;

        // Get all available executives
        const executives = await Executive.find();
        if (executives.length === 0) {
            return res.status(404).json({ error: 'No executives available' });
        }

        // Find the customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Get or initialize the assignment tracker (only one document in this collection)
        let tracker = await AssignmentTracker.findOne();
        if (!tracker) {
            tracker = new AssignmentTracker({ lastAssignedIndex: -1 });
            await tracker.save();
        }

        // Initialize variables for round-robin assignment
        let assigned = false;
        let nextIndex = tracker.lastAssignedIndex;

        // Loop through executives to find one that hasn't reached their max limit
        for (let i = 0; i < executives.length; i++) {
            // Calculate the next index in the round-robin order
            nextIndex = (nextIndex + 1) % executives.length;
            const nextExecutive = executives[nextIndex];

            // Check if this executive has reached their customer limit
            if (nextExecutive.assignedCustomers < nextExecutive.maxCustomers) {
                // Assign the executive to the customer
                customer.assignedExecutive = nextExecutive._id;
                await customer.save();

                // Update the executive's assigned customer count
                nextExecutive.assignedCustomers += 1;
                await nextExecutive.save();

                // Update the assignment tracker
                tracker.lastAssignedIndex = nextIndex;
                await tracker.save();

                assigned = true;
                res.status(200).json({
                    message: `Executive ${nextExecutive.name} assigned to customer successfully`,
                    customer
                });
                break;  // Exit loop after successfully assigning an executive
            }
        }

        if (!assigned) {
            return res.status(400).json({ error: 'No executives available for assignment. All have reached their customer limit.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign executive' });
    }
});
