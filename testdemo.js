const Lead = require('./models/Lead');
const Agent = require('./models/Agent');

async function assignLeadsRoundRobin(limit) {
    try {
        // Fetch all agents with their lead count less than the maxLeads
        const availableAgents = await Agent.find({
            assignedLeadsCount: { $lt: limit },
        }).sort({ _id: 1 }).exec();

        if (availableAgents.length === 0) {
            throw new Error('No available agents found');
        }

        // Fetch all unassigned leads
        const unassignedLeads = await Lead.find({ status: 'unassigned' }).exec();

        if (unassignedLeads.length === 0) {
            throw new Error('No unassigned leads found');
        }

        // Round-robin assignment logic
        let agentIndex = 0;
        for (let i = 0; i < unassignedLeads.length; i++) {
            const agent = availableAgents[agentIndex];

            // Assign lead to agent
            unassignedLeads[i].assignedAgent = agent._id;
            unassignedLeads[i].status = 'assigned';

            // Increment agent's assigned lead count
            agent.assignedLeadsCount += 1;

            // Save lead and agent
            await unassignedLeads[i].save();
            await agent.save();

            // Move to the next agent in round-robin manner
            agentIndex = (agentIndex + 1) % availableAgents.length;

            // Stop if agent exceeds their limit
            if (agent.assignedLeadsCount >= agent.maxLeads) {
                availableAgents.splice(agentIndex, 1);
                if (availableAgents.length === 0) {
                    console.log('All agents have reached their lead limit.');
                    break;
                }
            }
        }

        console.log('Leads have been successfully assigned!');
    } catch (err) {
        console.error(err.message);
    }
}


// assing leads 

const mongoose = require('mongoose');

// Assuming you have a Mongoose schema and model, e.g.:
const MyModel = mongoose.model('MyCollection', new mongoose.Schema({
  someField: String,
  countField: { type: Number, default: 0 }
}));

// The bulkWrite operation
// async function bulkWriteOperation() {
//   try {
//     await MyModel.bulkWrite([
//       {
//         updateOne: {
//           filter: { someField: 'example' }, // Match condition
//           update: {
//             $inc: { countField: 1 },        // Increment 'countField' by 1
//             $setOnInsert: { countField: 1 } // Set 'countField' to 1 if it's a new document or field doesn't exist
//           },
//           upsert: true  // Insert a new document if no match is found
//         }
//       },
//       {
//         updateOne: {
//           filter: { someField: 'anotherExample' },
//           update: {
//             $inc: { countField: 1 },
//             $setOnInsert: { countField: 1 }
//           },
//           upsert: true
//         }
//       }
//     ]);
//   } catch (err) {
//     console.error(err);
//   }
// }

// bulkWriteOperation();
