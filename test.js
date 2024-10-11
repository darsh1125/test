let roundRobinIndex = 0; // Track the current executive for round-robin assignment

// Function to assign a batch of customers to executives in round-robin fashion
async function assignMultipleCustomersToExecutives(customerIds) {
  try {
    // Step 1: Fetch all active executives who haven't reached their assignment limit
    const executives = await Executive.find({
      active: true,
      currentAssignmentCount: { $lt: mongoose.Types.Decimal128('assignmentLimit') }
    });

    if (executives.length === 0) {
      // Handle overflow - all executives are at full capacity
      throw new Error('All executives have reached their assignment limit.');
    }

    const totalExecutives = executives.length;
    if (totalExecutives === 0) {
      throw new Error('No active executives available for assignment.');
    }

    // Step 2: Loop through each customer and assign to an executive in round-robin fashion
    const assignedExecutives = [];
    for (let i = 0; i < customerIds.length; i++) {
      const customerId = customerIds[i];

      let assignedExecutive = null;

      // Continue searching for an available executive within the limit
      for (let j = 0; j < totalExecutives; j++) {
        const currentExecutive = executives[roundRobinIndex];

        // Check if this executive has room for more customers
        if (currentExecutive.currentAssignmentCount < currentExecutive.assignmentLimit) {
          assignedExecutive = currentExecutive;
          break; // Break as soon as we find an available executive
        }

        // Increment and wrap around the roundRobinIndex
        roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;
      }

      if (!assignedExecutive) {
        throw new Error('Unable to assign customer. All executives are at full capacity.');
      }

      // Step 3: Update the customer's assigned executive
      await Customer.findByIdAndUpdate(
        customerId,
        { assignedExecutive: assignedExecutive._id }, // Assign the executive
        { new: true }
      );

      // Step 4: Update the executive's assigned customer list and increment the count
      await Executive.findByIdAndUpdate(
        assignedExecutive._id,
        {
          $push: { customers: customerId }, // Add customer to the executive's customer list
          $inc: { currentAssignmentCount: 1 } // Increment the number of customers assigned
        },
        { new: true }
      );

      console.log(`Customer ${customerId} assigned to executive: ${assignedExecutive.name}`);
      assignedExecutives.push({ customerId, executiveId: assignedExecutive._id });

      // Step 5: Increment the roundRobinIndex for the next customer (wrap around)
      roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;
    }

    return assignedExecutives; // Return array of assigned executives for each customer
  } catch (err) {
    console.error('Error assigning customers:', err.message);
    throw err;
  }
}
