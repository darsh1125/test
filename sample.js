const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Agent = require('../models/Agent');

// Dashboard Widgets API

// 1. Get total number of leads and their statuses
router.get('/leads', async (req, res) => {
    try {
        const totalLeads = await Lead.countDocuments({});
        const leadsByStatus = await Lead.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.json({ totalLeads, leadsByStatus });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch leads data" });
    }
});

// 2. Get total number of properties and their statuses
router.get('/properties', async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments({});
        const propertiesByStatus = await Property.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.json({ totalProperties, propertiesByStatus });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch properties data" });
    }
});

// 3. Get agent performance: total leads assigned per agent
router.get('/agents', async (req, res) => {
    try {
        const agentPerformance = await Agent.aggregate([
            { 
                $lookup: {
                    from: "leads", 
                    localField: "_id", 
                    foreignField: "assignedAgent", 
                    as: "leads" 
                } 
            },
            { 
                $project: {
                    name: 1,
                    totalLeads: { $size: "$leads" }
                } 
            }
        ]);

        res.json({ agentPerformance });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch agent performance data" });
    }
});

module.exports = router;


// {
//     "totalLeads": 100,
//     "leadsByStatus": [
//         { "_id": "New", "count": 40 },
//         { "_id": "Closed", "count": 30 },
//         { "_id": "Negotiation", "count": 20 },
//         { "_id": "Qualified", "count": 10 }
//     ]
// }


// {
//     "agentPerformance": [
//         { "name": "Agent 1", "totalLeads": 20 },
//         { "name": "Agent 2", "totalLeads": 15 },
//         { "name": "Agent 3", "totalLeads": 10 }
//     ]
// }


// const express = require('express');
// const router = express.Router();
// const Vendor = require('../models/Vendor');                                                                                                                  

// // 4. Get total number of vendors and their types
// router.get('/vendors', async (req, res) => {
//     try {
//         // Get total vendors count
//         const totalVendors = await Vendor.countDocuments({});
        
//         // Group vendors by type
//         const vendorsByType = await Vendor.aggregate([
//             { $group: { _id: "$type", count: { $sum: 1 } } }
//         ]);

//         // Get active vendors count
//         const activeVendors = await Vendor.countDocuments({ isActive: true });

//         res.json({ totalVendors, vendorsByType, activeVendors });
//     } catch (err) {
//         res.status(500).json({ error: "Failed to fetch vendor data" });
//     }
// });

// // 5. Get vendor performance: projects per vendor and average response time
// router.get('/vendors/performance', async (req, res) => {
//     try {
//         const vendorPerformance = await Vendor.aggregate([
//             { 
//                 $project: {
//                     name: 1,
//                     totalProjects: { $size: "$projects" },
//                     averageResponseTime: "$performance.averageResponseTime",
//                     completedProjects: "$performance.completedProjects"
//                 } 
//             }
//         ]);

//         res.json({ vendorPerformance });
//     } catch (err) {
//         res.status(500).json({ error: "Failed to fetch vendor performance data" });
//     }
// });

// module.exports = router;


// {
//     "totalVendors": 15,
//     "vendorsByType": [
//         { "_id": "Contractor", "count": 5 },
//         { "_id": "Inspector", "count": 3 },
//         { "_id": "Maintenance", "count": 4 },
//         { "_id": "Electrician", "count": 2 }
//     ],
//     "activeVendors": 12
// }


// {
//     "vendorPerformance": [
//         { 
//             "name": "John's Contracting",
//             "totalProjects": 3,
//             "averageResponseTime": 12,  // in hours
//             "completedProjects": 20
//         },
//         { 
//             "name": "QuickFix Maintenance",
//             "totalProjects": 2,
//             "averageResponseTime": 8,
//             "completedProjects": 15
//         }
//     ]
// }

// sells deed

const express = require('express');
const router = express.Router();
const SalesDeed = require('../models/SalesDeed');
const generateSalesDeedPDF = require('../utils/pdfGenerator');
const path = require('path');

// Create a new sales deed
router.post('/', async (req, res) => {
    try {
        const salesDeedData = req.body;

        // Create a new Sales Deed record in the database
        const salesDeed = new SalesDeed(salesDeedData);
        await salesDeed.save();

        // Define the file path to save the PDF
        const filePath = path.join(__dirname, '../pdfs', `${salesDeed._id}-sales-deed.pdf`);

        // Generate the PDF
        await generateSalesDeedPDF(salesDeed, filePath);

        // Send response back with the file path or a download link
        res.json({
            message: 'Sales deed created successfully',
            pdfUrl: `/pdfs/${salesDeed._id}-sales-deed.pdf`  // URL to access the PDF
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve the PDFs
router.get('/pdfs/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../pdfs', fileName);
    res.sendFile(filePath);
});

module.exports = router;


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salesDeedSchema = new Schema({
    buyerName: { type: String, required: true },
    sellerName: { type: String, required: true },
    propertyAddress: { type: String, required: true },
    salePrice: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    // Add any other relevant fields
});

module.exports = mongoose.model('SalesDeed', salesDeedSchema);



const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateSalesDeedPDF(salesDeed, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();

        // Pipe the PDF into a writable stream
        doc.pipe(fs.createWriteStream(filePath));

        // Add content to the PDF
        doc.fontSize(20).text('Sales Deed', { align: 'center' });
        doc.moveDown();

        // Buyer Details
        doc.fontSize(14).text(`Buyer Name: ${salesDeed.buyerName}`);
        doc.text(`Buyer Address: ${salesDeed.buyerAddress || 'Not Provided'}`);
        doc.moveDown();

        // Seller Details
        doc.text(`Seller Name: ${salesDeed.sellerName}`);
        doc.text(`Seller Address: ${salesDeed.sellerAddress || 'Not Provided'}`);
        doc.moveDown();

        // Property Details
        doc.text(`Property Address: ${salesDeed.propertyAddress}`);
        doc.text(`Sale Price: $${salesDeed.salePrice}`);
        doc.text(`Sale Date: ${salesDeed.saleDate.toLocaleDateString()}`);
        doc.moveDown();

        // Finalizing the PDF
        doc.end();

        // Resolve promise once PDF is generated
        doc.on('finish', () => {
            resolve(filePath);
        });

        // Handle errors
        doc.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = generateSalesDeedPDF;


