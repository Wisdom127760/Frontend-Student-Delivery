// ========================================
// BACKEND DOCUMENT UPLOAD ENDPOINT
// ========================================
// Add this to your backend routes to handle document uploads

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/documents/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only allow 1 file per request
    }
});

// POST /api/driver/documents/:documentType/upload
router.post('/:documentType/upload', upload.single('document'), async (req, res) => {
    try {
        const { documentType } = req.params;
        const driverId = req.user.id; // From authentication middleware

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No document file provided'
            });
        }

        // Validate document type
        const validDocumentTypes = [
            'studentId',
            'profilePhoto',
            'universityEnrollment',
            'identityCard',
            'transportationLicense'
        ];

        if (!validDocumentTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid document type'
            });
        }

        // Create document record in database
        const documentData = {
            driverId: driverId,
            documentType: documentType,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            status: 'pending',
            uploadedAt: new Date()
        };

        // Save to database (example with mongoose)
        const document = await DriverDocument.create(documentData);

        console.log(`✅ Document uploaded: ${documentType} for driver ${driverId}`);

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                documentId: document._id,
                documentType: document.documentType,
                fileName: document.fileName,
                status: document.status,
                uploadedAt: document.uploadedAt
            }
        });

    } catch (error) {
        console.error('❌ Document upload error:', error);

        if (error.message === 'Only image files are allowed!') {
            return res.status(400).json({
                success: false,
                error: 'Only image files (JPEG, PNG, WebP) are allowed. PDF files are not supported.'
            });
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 5MB.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to upload document'
        });
    }
});

// GET /api/driver/documents - Get driver's documents
router.get('/', async (req, res) => {
    try {
        const driverId = req.user.id;

        const documents = await DriverDocument.find({ driverId })
            .sort({ uploadedAt: -1 });

        res.json({
            success: true,
            data: {
                documents: documents.map(doc => ({
                    id: doc._id,
                    documentType: doc.documentType,
                    fileName: doc.fileName,
                    status: doc.status,
                    uploadedAt: doc.uploadedAt,
                    verifiedAt: doc.verifiedAt,
                    rejectionReason: doc.rejectionReason
                }))
            }
        });

    } catch (error) {
        console.error('❌ Error fetching documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch documents'
        });
    }
});

// DELETE /api/driver/documents/:documentId - Delete a document
router.delete('/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const driverId = req.user.id;

        const document = await DriverDocument.findOne({
            _id: documentId,
            driverId: driverId
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Delete file from filesystem
        const fs = require('fs');
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Delete from database
        await DriverDocument.findByIdAndDelete(documentId);

        console.log(`✅ Document deleted: ${documentId} for driver ${driverId}`);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete document'
        });
    }
});

module.exports = router;

// ========================================
// DRIVER DOCUMENT MODEL
// ========================================
// Add this to your models/DriverDocument.js

/*
const mongoose = require('mongoose');

const driverDocumentSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    documentType: {
        type: String,
        enum: ['studentId', 'profilePhoto', 'universityEnrollment', 'identityCard', 'transportationLicense'],
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
driverDocumentSchema.index({ driverId: 1, documentType: 1 });
driverDocumentSchema.index({ status: 1 });
driverDocumentSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('DriverDocument', driverDocumentSchema);
*/

// ========================================
// MAIN APP INTEGRATION
// ========================================
// In your main app.js or server.js file, add:

/*
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/driver/documents', documentRoutes);
*/
