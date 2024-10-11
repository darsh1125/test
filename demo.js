// async assignExecutiveToCustomer(req,res,next) {
//     try {

//        // find customer
//        let pipeline1 = [ { $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }]
//        let projection1 = [{ customers:1,count:{ $size:'$customers' } } ]

       

//        // find active executive
//        let pipeline2 = [ { $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }]
//        let projection2 = [{ customers:1,count:{ $size:'$customers' } } ]

//        // round robin function
        
//     } catch (error) {
//        res.status(500).json(error); 
//     }
// }



// let roundRobinIndex = 0; // Track the current executive for round-robin assignment

// // Function to assign a customer to an executive with round-robin and limit checks
// async function createCustomerAndAssignToExecutive(customerData) {
//   try {
//     // Step 1: Create a new customer in the database
//     const newCustomer = await Customer.create({
//       name: customerData.name,
//       email: customerData.email
//     });

//     // Step 2: Fetch all active executives who haven't reached their assignment limit
//     const executives = await Executive.find({
//       active: true,
//       currentAssignmentCount: { $lt: mongoose.Types.Decimal128('assignmentLimit') }
//     });

//     if (executives.length === 0) {
//       // Handle overflow - all executives are at full capacity
//       throw new Error('All executives have reached their assignment limit. Please try again later.');
//     }

//     // Step 3: Find the next available executive based on the round-robin index
//     let assignedExecutive = null;
//     const totalExecutives = executives.length;

//     // Continue searching for an available executive within the limit
//     for (let i = 0; i < totalExecutives; i++) {
//       const currentExecutive = executives[roundRobinIndex];

//       // Check if this executive has room for more customers
//       if (currentExecutive.currentAssignmentCount < currentExecutive.assignmentLimit) {
//         assignedExecutive = currentExecutive;
//         break; // Break as soon as we find an available executive
//       }

//       // Increment and wrap around the roundRobinIndex
//       roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;
//     }

//     // If no executive was found, throw an error (shouldn't happen due to earlier check)
//     if (!assignedExecutive) {
//       throw new Error('Unable to assign customer. All executives are at full capacity.');
//     }

//     // Step 4: Update the customer's assigned executive
//     const updatedCustomer = await Customer.findByIdAndUpdate(
//       newCustomer._id,
//       { assignedExecutive: assignedExecutive._id }, // Assign the executive
//       { new: true }
//     );

//     // Step 5: Update the executive's assigned customer list and increment the count
//     await Executive.findByIdAndUpdate(
//       assignedExecutive._id,
//       {
//         $push: { customers: newCustomer._id }, // Add customer to the executive's customer list
//         $inc: { currentAssignmentCount: 1 } // Increment the number of customers assigned
//       },
//       { new: true }
//     );

//     console.log(`Customer ${updatedCustomer.name} assigned to executive: ${assignedExecutive.name}`);

//     // Step 6: Increment the roundRobinIndex for the next customer (wrap around)
//     roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;

//     return updatedCustomer;
//   } catch (err) {
//     console.error('Error assigning customer:', err.message);
//     throw err; // Propagate the error to handle it elsewhere if necessary
//   }
// }


let roundRobinIndex = 0; // Track the current executive for round-robin assignment

// Function to assign a customer to an executive in round-robin fashion
async function assignCustomerToExecutive(customerId) {
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

    // Step 2: Find the next available executive based on the round-robin index
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

    console.log(`Customer assigned to executive: ${assignedExecutive.name}`);

    // Step 5: Increment the roundRobinIndex for the next customer (wrap around)
    roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;

    return assignedExecutive;
  } catch (err) {
    console.error('Error assigning customer:', err.message);
    throw err;
  }
}



async assignExeCustomer (req,res,next) {
    
     try {
       
       // find customer
       let pipeline1 = [ { $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }]
       let projection1 = [{ customers:1,count:{ $size:'$customers' } } ]
       const customers;
       

     // find active executive
       let pipeline2 = [ { $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }]
       let projection2 = [{ customers:1,count:{ $size:'$customers' } } ]
       const executives;

       let customerBulk = [];
       let executiveBulk = [];

       if(customers.length !==0){
          
        if(executives.length !== 0){

          const assignedExecutive = [];

          for (let i = 0; i < customerIds.length; i++) {
            const customerId = customerIds[i];
      
            let assignedExecutive = null;
            // let assined = false;
      
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


            // for bulk write

         

            customerBulkOps.push({
              updateOne: {
                filter: { _id: customerId },
                update: { assignedExecutive: assignedExecutive._id }
              }
            });
      
            // Step 4: Prepare bulk operation to update the executive's customer list and count
            executiveBulkOps.push({
              updateOne: {
                filter: { _id: assignedExecutive._id },
                update: {
                  $push: { customers: customerId },
                  $inc: { currentAssignmentCount: 1 }
                }
              }
            });
      
      
            // Step 3: Update the customer's assigned executive
            // await Customer.findByIdAndUpdate(
            //   customerId,
            //   { assignedExecutive: assignedExecutive._id }, // Assign the executive
            //   { new: true }
            // );
      
            // // Step 4: Update the executive's assigned customer list and increment the count
            // await Executive.findByIdAndUpdate(
            //   assignedExecutive._id,
            //   {
            //     $push: { customers: customerId }, // Add customer to the executive's customer list
            //     $inc: { currentAssignmentCount: 1 } // Increment the number of customers assigned
            //   },
            //   { new: true }
            // );
      
            console.log(`Customer ${customerId} assigned to executive: ${assignedExecutive.name}`);
            assignedExecutives.push({ customerId, executiveId: assignedExecutive._id });
      
            // Step 5: Increment the roundRobinIndex for the next customer (wrap around)
            roundRobinIndex = (roundRobinIndex + 1) % totalExecutives;

          }
   
          if(executiveBulk.length){
            await Executive.bulkWrite(executiveBulkOps);  
          }

          if(customerBulk.length) {
             Customer.bulkWrite(customerBulkOps);
          }
 
        }else {
          return "No active executives available for assignment."
        }

       }else{
         return "No Customer found"
       }
       

     } catch (error) {
        res.status(500).json(error);
     }
}

// perform operariton

const mongoose = require('mongoose');

// Reusable bulkWrite function for any collection
async function performBulkWrite(tableName, modelSchema, bulkOperations) {
  try {
    // Check if bulk operations are provided
    if (!bulkOperations || bulkOperations.length === 0) {
      throw new Error('No bulk operations provided.');
    }

    // Execute the bulkWrite on the passed model schema
    const result = await modelSchema.bulkWrite(bulkOperations);
    
    console.log(`Bulk write successful on ${tableName}`);
    return result;
  } catch (err) {
    console.error(`Error during bulk write on ${tableName}:`, err.message);
    throw err;
  }
}
