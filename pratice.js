const mongoose = require('mongoose');

const executiveSchema = new mongoose.Schema({
    name: { type: String, required: true },
    assignedCustomersCount: { type: Number, default: 0 }, // Number of assigned customers
    customerLimit: { type: Number, required: true }, // Max customers for this executive
});

const Executive = mongoose.model('Executive', executiveSchema);

module.exports = Executive;


const roundRobinSchema = new mongoose.Schema({
    currentExecutiveIndex: { type: Number, default: 0 }, // Tracks current round-robin executive index
});

const RoundRobinPointer = mongoose.model('RoundRobinPointer', roundRobinSchema);

module.exports = RoundRobinPointer;


const Executive = require('./models/Executive');
const Customer = require('./models/Customer');
const RoundRobinPointer = require('./models/RoundRobinPointer');

async function assignExecutive(req, res, next) {
    try {
        let ResponseBody = {};

        const { customerId } = req.body;

        // Find the customer to assign
        const customer = await Customer.findById(customerId);
        if (!customer) {
            ResponseBody = { status: 404, message: 'Customer not found' };
            req.ResponseBody = ResponseBody;
            return next();
        }

        // Get round robin pointer (fetch or initialize)
        let roundRobin = await RoundRobinPointer.findOne();
        if (!roundRobin) {
            roundRobin = new RoundRobinPointer({ currentExecutiveIndex: 0 });
            await roundRobin.save();
        }

        // Get all executives ordered by creation (or any other order)
        const executives = await Executive.find().sort({ _id: 1 });

        if (!executives || executives.length === 0) {
            ResponseBody = { status: 400, message: 'No executives available' };
            req.ResponseBody = ResponseBody;
            return next();
        }

        let totalExecutives = executives.length;
        let assignedExecutive = null;

        // Start the round-robin from the current pointer
        for (let i = 0; i < totalExecutives; i++) {
            // Get the executive at the current pointer position
            let currentIndex = (roundRobin.currentExecutiveIndex + i) % totalExecutives;
            let currentExecutive = executives[currentIndex];

            // Check if this executive has not reached their customer limit
            if (currentExecutive.assignedCustomersCount < currentExecutive.customerLimit) {
                assignedExecutive = currentExecutive;

                // Update the round-robin pointer to the next index for future assignments
                roundRobin.currentExecutiveIndex = (currentIndex + 1) % totalExecutives;
                await roundRobin.save();

                // Assign the customer to the executive
                customer.executiveId = currentExecutive._id;
                await customer.save();

                // Increment the assigned customer count for the executive
                currentExecutive.assignedCustomersCount += 1;
                await currentExecutive.save();

                break;
            }
        }

        if (!assignedExecutive) {
            // If no executive is available within their limits
            ResponseBody = { status: 400, message: 'All executives have reached their limit' };
            req.ResponseBody = ResponseBody;
            return next();
        }

        // Respond with the assigned executive
        ResponseBody.status = 200;
        ResponseBody.message = 'Customer successfully assigned to an executive';
        ResponseBody.assignedExecutive = {
            executiveId: assignedExecutive._id,
            executiveName: assignedExecutive.name,
        };

        req.ResponseBody = ResponseBody;
        next();
    } catch (error) {
        ResponseBody = { status: 500, message: error.message };
        req.ResponseBody = ResponseBody;
        next();
    }
}

module.exports = assignExecutive;
