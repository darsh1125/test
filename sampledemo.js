const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    version: { type: Number, default: 1 },
    documentUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comments: { type: String }, // Optional comments from customer on rejection
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;


const documentHistorySchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    version: { type: Number, required: true },
    documentUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], required: true },
    comments: { type: String },  // Optional comments
    createdAt: { type: Date, default: Date.now }
});

const DocumentHistory = mongoose.model('DocumentHistory', documentHistorySchema);

module.exports = DocumentHistory;


const express = require('express');
const Document = require('./models/Document');
const DocumentHistory = require('./models/DocumentHistory');

const router = express.Router();

// Vendor uploads or re-uploads a document
router.post('/vendor/upload', async (req, res) => {
    try {
        const { vendorId, customerId, documentUrl } = req.body;

        // Check if a document already exists for this vendor and customer
        let document = await Document.findOne({ vendorId, customerId });

        if (!document) {
            // First-time upload
            document = new Document({
                vendorId,
                customerId,
                documentUrl,
                version: 1, // Initial version
                status: 'pending'
            });
        } else {
            // Re-upload (after rejection), increment version and update document URL
            document.version += 1;
            document.documentUrl = documentUrl;
            document.status = 'pending';
            document.comments = ''; // Reset comments for new upload
            document.updatedAt = new Date();
        }

        await document.save();

        // Store the upload in DocumentHistory
        const documentHistory = new DocumentHistory({
            documentId: document._id,
            version: document.version,
            documentUrl: documentUrl,
            status: 'pending' // Initially pending
        });

        await documentHistory.save();

        res.status(200).json({ message: 'Document uploaded successfully', document });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading document' });
    }
});

module.exports = router;


// Customer reviews the document (approve or reject)
router.post('/customer/review', async (req, res) => {
    try {
        const { documentId, status, comments } = req.body;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be either "approved" or "rejected".' });
        }

        // Find the document
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Update the document status and add any comments (if rejected)
        document.status = status;
        if (status === 'rejected') {
            document.comments = comments || 'No comments provided'; // Optional comments on rejection
        } else {
            document.comments = ''; // Clear comments if approved
        }
        document.updatedAt = new Date();

        await document.save();

        // Save the review in DocumentHistory
        const documentHistory = new DocumentHistory({
            documentId: document._id,
            version: document.version,
            documentUrl: document.documentUrl,
            status: status,
            comments: comments || '' // Store the comments for rejection, if any
        });

        await documentHistory.save();

        res.status(200).json({ message: `Document ${status} successfully`, document });
    } catch (error) {
        res.status(500).json({ error: 'Error updating document status' });
    }
});

module.exports = router;




