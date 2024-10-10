async assignExecutiveToCustomer(req,res,next) {
    try {

       // find customer
       let pipeline1 = [ { $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }]
       let projection1 = [{ customers:1,count:{ $size:'$customers' } } ]
       // find active executive
       let pipeline2 = [ { $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }]
       let projection2 = [{ customers:1,count:{ $size:'$customers' } } ]

       // round robin function
        
    } catch (error) {
       res.status(500).json(error); 
    }
}



let roundRobinIndex = 0; // Track the current executive for round-robin assignment

// Function to assign a customer to an executive with round-robin and limit checks
async function createCustomerAndAssignToExecutive(customerData) {
  try {
    // Step 1: Create a new customer in the database
    const newCustomer = await Customer.create({
      name: customerData.name,
      email: customerData.email
    });

    // Step 2: Fetch all active executives who haven't reached their assignment limit
    const executives = await Executive.find({
      active: true,
      currentAssignmentCount: { $lt: mongoose.Types.Decimal128('assignmentLimit') }
    });

    if (executives.length === 0) {
      // Handle overflow - all executives are at full capacity
      throw new Error('All executives have reached their assignment limit. Please try again later.');
    }

    // Step 3: Find the next available executive based on the round-robin index
    let assignedExecutive = null;
    const totalExecutives = executives.length;

    // Continue searching for an available executive within the limit
    for (let i = 0; i < totalExecutives; i++) {
      const currentExecutive = executives[roundRobinIndex];

      // Check if this executive has room for more customers
      if (currentExecutive.currentAssignmentCount < currentExecutive.assignmentLimit) {
        assignedExecutive = currentExecutive;
        break; // Break as soon as we find an available executive
      }

      // Increment and wrap around the roundRobinIndex
      roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;
    }

    // If no executive was found, throw an error (shouldn't happen due to earlier check)
    if (!assignedExecutive) {
      throw new Error('Unable to assign customer. All executives are at full capacity.');
    }

    // Step 4: Update the customer's assigned executive
    const updatedCustomer = await Customer.findByIdAndUpdate(
      newCustomer._id,
      { assignedExecutive: assignedExecutive._id }, // Assign the executive
      { new: true }
    );

    // Step 5: Update the executive's assigned customer list and increment the count
    await Executive.findByIdAndUpdate(
      assignedExecutive._id,
      {
        $push: { customers: newCustomer._id }, // Add customer to the executive's customer list
        $inc: { currentAssignmentCount: 1 } // Increment the number of customers assigned
      },
      { new: true }
    );

    console.log(`Customer ${updatedCustomer.name} assigned to executive: ${assignedExecutive.name}`);

    // Step 6: Increment the roundRobinIndex for the next customer (wrap around)
    roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;

    return updatedCustomer;
  } catch (err) {
    console.error('Error assigning customer:', err.message);
    throw err; // Propagate the error to handle it elsewhere if necessary
  }
}
