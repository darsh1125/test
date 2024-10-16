async assignExeCustomer(req, res, next) {
    try {
        // Find customers
        let pipeline1 = [
            { $match: {} },
            { $group: { _id: "null", customers: { $push: { id: "$_id" } } } },
            { $project: { customers: 1, count: { $size: '$customers' } } }
        ];
        // Execute pipeline1 and get customers
        const customers = await Customer.aggregate(pipeline1);

        // Find active executives
        let pipeline2 = [
            { $match: { isAvailable: true } }, // Filter to find only active executives
            { $group: { _id: "null", executives: { $push: { id: "$_id", name: "$name", currentAssignmentCount: "$currentAssignmentCount", assignmentLimit: "$assignmentLimit" } } } },
            { $project: { executives: 1, count: { $size: '$executives' } } }
        ];
        // Execute pipeline2 and get executives
        const executives = await Executive.aggregate(pipeline2);

        let customerBulkOps = [];
        let executiveBulkOps = [];
        let roundRobinIndex = 0;

        if (customers.length !== 0) {
            if (executives.length !== 0) {
                const assignedExecutives = [];

                const totalExecutives = executives[0].count; // Get total number of executives
                const executiveList = executives[0].executives; // Get the list of executives

                // Loop through each customer
                for (let i = 0; i < customers[0].count; i++) {
                    const customerId = customers[0].customers[i].id;

                    let assignedExecutive = null;

                    // Continue searching for an available executive within the limit
                    for (let j = 0; j < totalExecutives; j++) {
                        const currentExecutive = executiveList[roundRobinIndex];

                        // Check if this executive has room for more customers
                        if (currentExecutive.currentAssignmentCount < currentExecutive.assignmentLimit) {
                            assignedExecutive = currentExecutive;
                            break; // Break as soon as we find an available executive
                        }

                        // Increment and wrap around the roundRobinIndex
                        roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;
                    }

                    // If no assigned executive was found, return a response message
                    if (!assignedExecutive) {
                        return res.status(400).json({ message: 'Unable to assign customer. All executives are at full capacity.' });
                    }

                    // Prepare bulk write operations for customers and executives
                    customerBulkOps.push({
                        updateOne: {
                            filter: { _id: customerId },
                            update: { assignedExecutive: assignedExecutive.id } // Use `id` for the executive's ObjectId
                        }
                    });

                    executiveBulkOps.push({
                        updateOne: {
                            filter: { _id: assignedExecutive.id },
                            update: {
                                $push: { customers: customerId }, // Assuming you have a field 'customers' in Executive model
                                $inc: { currentAssignmentCount: 1 }
                            }
                        }
                    });

                    console.log(`Customer ${customerId} assigned to executive: ${assignedExecutive.name}`);
                    assignedExecutives.push({ customerId, executiveId: assignedExecutive.id });

                    // Increment the roundRobinIndex for the next customer (wrap around)
                    roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;
                }

                // Perform bulk updates for executives and customers
                if (executiveBulkOps.length > 0) {
                    await Executive.bulkWrite(executiveBulkOps);
                }

                if (customerBulkOps.length > 0) {
                    await Customer.bulkWrite(customerBulkOps);
                }

                res.status(200).json({
                    message: 'Customers assigned successfully',
                    assignedExecutives
                });
            } else {
                // No active executives available for assignment
                return res.status(400).json({ message: 'No active executives available for assignment.' });
            }
        } else {
            // No customers found
            return res.status(400).json({ message: 'No customers found.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
