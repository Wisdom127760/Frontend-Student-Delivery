# AI Document Verification API Specification

## Overview

This document outlines the backend API endpoints required for AI-powered document verification in the Student Delivery application.

## Base URL

```
POST /api/ai/documents/*
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Complete Document Verification

**POST** `/api/ai/documents/verify`

Performs complete AI verification pipeline for a document.

#### Request Body

```javascript
{
  document: File, // Multipart form data
  documentType: String, // 'studentId', 'profilePhoto', 'universityEnrollment', 'identityCard', 'transportationLicense'
  userId: String
}
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "status": "verified" | "rejected" | "manual_review",
    "confidence": {
      "overall": 0.95,
      "classification": 0.98,
      "textExtraction": 0.92,
      "authenticity": 0.94,
      "fraudDetection": 0.96
    },
    "extractedData": {
      "documentType": "student_id",
      "fields": {
        "student_id": "20223056",
        "university_name": "Eastern Mediterranean University",
        "student_name": "Wisdom Agunta",
        "expiry_date": "2025-12-31"
      },
      "confidence": 0.95
    },
    "verification": {
      "isAuthentic": true,
      "isNotFraudulent": true,
      "meetsRequirements": true,
      "issues": [],
      "recommendations": []
    },
    "metadata": {
      "processingTime": 2.5,
      "aiModel": "gpt-4-vision",
      "processingDate": "2025-01-21T10:30:00Z"
    }
  }
}
```

### 2. Document Classification

**POST** `/api/ai/documents/classify`

Classifies the type of document uploaded.

#### Request Body

```javascript
{
  document: File;
}
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "documentType": "student_id",
    "confidence": 0.98,
    "alternativeTypes": [
      { "type": "identity_card", "confidence": 0.02 }
    ]
  }
}
```

### 3. Text Extraction (OCR)

**POST** `/api/ai/documents/extract-text`

Extracts text from documents using OCR.

#### Request Body

```javascript
{
  document: File;
}
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "text": "Student ID: 20223056\nUniversity: Eastern Mediterranean University\nName: Wisdom Agunta",
    "confidence": 0.92,
    "structuredData": {
      "student_id": "20223056",
      "university_name": "Eastern Mediterranean University",
      "student_name": "Wisdom Agunta"
    }
  }
}
```

### 4. Face Detection and Comparison

**POST** `/api/ai/documents/detect-face`

Detects and analyzes faces in documents.

#### Request Body

```javascript
{
  document: File,
  referenceImage?: File // Optional reference image for comparison
}
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "faceDetected": true,
    "faceCount": 1,
    "faceQuality": 0.95,
    "faceMatch": {
      "isMatch": true,
      "confidence": 0.92,
      "similarity": 0.89
    },
    "faceAttributes": {
      "age": 25,
      "gender": "male",
      "expression": "neutral"
    }
  }
}
```

### 5. Document Authenticity Verification

**POST** `/api/ai/documents/verify-authenticity`

Verifies document authenticity and security features.

#### Request Body

```javascript
{
  document: File,
  documentType: String
}
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "isAuthentic": true,
    "securityFeatures": {
      "watermarks": true,
      "holograms": false,
      "microtext": true,
      "uvFeatures": false
    },
    "authenticityScore": 0.94,
    "tamperingIndicators": []
  }
}
```

### 6. Fraud Detection

**POST** `/api/ai/documents/detect-fraud`

Detects signs of fraud or tampering.

#### Request Body

```javascript
{
  document: File,
  documentType: String
}
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "isFraudulent": false,
    "fraudScore": 0.05,
    "fraudIndicators": [],
    "riskLevel": "low",
    "recommendations": []
  }
}
```

### 7. Verification Status Check

**GET** `/api/ai/documents/status/:documentId`

Get verification status for a specific document.

#### Response

```javascript
{
  "success": true,
  "data": {
    "documentId": "doc_123",
    "status": "processing" | "completed" | "failed",
    "progress": 75,
    "estimatedTime": 30,
    "result": { /* verification result */ }
  }
}
```

### 8. Batch Verification

**POST** `/api/ai/documents/verify-batch`

Verify multiple documents in a single request.

#### Request Body

```javascript
{
  documents: [
    { file: File, type: "studentId" },
    { file: File, type: "profilePhoto" },
  ];
}
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "results": [
      { /* verification result for doc 1 */ },
      { /* verification result for doc 2 */ }
    ],
    "summary": {
      "total": 2,
      "verified": 1,
      "rejected": 1,
      "processingTime": 5.2
    }
  }
}
```

## AI Models and Technologies

### Recommended AI Stack:

1. **Document Classification**: GPT-4 Vision or Azure Computer Vision
2. **OCR Text Extraction**: Google Cloud Vision API or Azure Computer Vision
3. **Face Detection**: Azure Face API or AWS Rekognition
4. **Fraud Detection**: Custom ML model or Azure Anomaly Detector
5. **Document Authenticity**: Azure Computer Vision or AWS Textract

### Implementation Example (Node.js/Express):

```javascript
// AI Verification Controller
const aiVerificationController = {
  // Complete verification pipeline
  async verifyDocument(req, res) {
    try {
      const { document, documentType, userId } = req.body;

      // 1. Classify document
      const classification = await classifyDocument(document);

      // 2. Extract text
      const extractedText = await extractText(document);

      // 3. Detect faces (if applicable)
      let faceData = null;
      if (["profilePhoto", "identityCard"].includes(documentType)) {
        faceData = await detectFace(document);
      }

      // 4. Verify authenticity
      const authenticity = await verifyAuthenticity(document, documentType);

      // 5. Detect fraud
      const fraudDetection = await detectFraud(document, documentType);

      // 6. Compile results
      const result = compileVerificationResult({
        classification,
        extractedText,
        faceData,
        authenticity,
        fraudDetection,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
```

## Error Handling

### Common Error Responses:

```javascript
// 400 Bad Request
{
  "success": false,
  "message": "Invalid document type",
  "code": "INVALID_DOCUMENT_TYPE"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}

// 413 Payload Too Large
{
  "success": false,
  "message": "File size exceeds limit",
  "code": "FILE_TOO_LARGE"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "AI verification service unavailable",
  "code": "AI_SERVICE_ERROR"
}
```

## Rate Limiting

- **Standard**: 10 requests per minute per user
- **Batch**: 5 requests per minute per user
- **Premium**: 50 requests per minute per user

## Security Considerations

1. **File Validation**: Validate file types and sizes
2. **Content Scanning**: Scan for malicious content
3. **Data Privacy**: Ensure extracted data is encrypted
4. **Access Control**: Implement proper authorization
5. **Audit Logging**: Log all verification attempts

## Cost Optimization

1. **Caching**: Cache verification results
2. **Batch Processing**: Process multiple documents together
3. **Model Selection**: Use appropriate AI models for each task
4. **Compression**: Compress images before AI processing

## Integration Notes

- All endpoints support CORS
- File uploads use multipart/form-data
- Responses include detailed confidence scores
- Processing times typically 2-5 seconds per document
- Support for async processing for large documents
