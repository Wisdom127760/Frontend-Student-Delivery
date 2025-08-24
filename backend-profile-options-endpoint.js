// ========================================
// BACKEND PROFILE OPTIONS ENDPOINT
// ========================================
// Add this to your backend routes to provide profile options

const express = require('express');
const router = express.Router();

// GET /api/public/profile-options
router.get('/profile-options', async (req, res) => {
    try {
        // Profile options data
        const profileOptions = {
            addresses: [
                'Kucuk',
                'Lefkosa',
                'Girne',
                'Iskele',
                'Guzelyurt',
                'Lefke'
            ],
            transportationMethods: [
                'Walking',
                'Bicycle',
                'Motorcycle',
                'Car',
                'Public Transport',
                'Other'
            ],
            universities: [
                'Eastern Mediterranean University',
                'Cyprus West University',
                'Cyprus International University',
                'Near East University',
                'Girne American University',
                'European University of Lefke',
                'University of Kyrenia',
                'Final International University',
                'University of Mediterranean Karpasia',
                'Lefke European University',
                'American University of Cyprus',
                'Cyprus Science University',
                'University of Central Lancashire Cyprus'
            ],
            studentIdFormats: [
                'EMU-2024-001',
                'CWU-2024-001',
                'CIU-2024-001',
                'NEU-2024-001',
                'GAU-2024-001',
                'EUL-2024-001',
                'UK-2024-001',
                'FIU-2024-001',
                'UMK-2024-001',
                'LEU-2024-001',
                'AUC-2024-001',
                'CSU-2024-001',
                'UCLAN-2024-001'
            ],
            academicYears: [
                '1st Year',
                '2nd Year',
                '3rd Year',
                '4th Year',
                '5th Year',
                'Graduate Student',
                'PhD Student'
            ],
            studyPrograms: [
                'Computer Engineering',
                'Electrical Engineering',
                'Mechanical Engineering',
                'Civil Engineering',
                'Business Administration',
                'Economics',
                'International Relations',
                'Psychology',
                'Medicine',
                'Dentistry',
                'Pharmacy',
                'Architecture',
                'Fine Arts',
                'Education',
                'Law',
                'Tourism Management',
                'Hotel Management',
                'Marketing',
                'Finance',
                'Accounting',
                'Information Technology',
                'Software Engineering',
                'Data Science',
                'Artificial Intelligence',
                'Cybersecurity',
                'Digital Marketing',
                'Graphic Design',
                'Interior Design',
                'Fashion Design',
                'Journalism',
                'Public Relations',
                'Social Work',
                'Nursing',
                'Physiotherapy',
                'Nutrition',
                'Sports Science',
                'Environmental Science',
                'Biology',
                'Chemistry',
                'Physics',
                'Mathematics',
                'Statistics',
                'Geography',
                'History',
                'Philosophy',
                'Sociology',
                'Anthropology',
                'Political Science',
                'English Language and Literature',
                'Turkish Language and Literature',
                'Translation and Interpretation',
                'Other'
            ]
        };

        console.log('✅ Profile options requested and served successfully');

        res.json({
            success: true,
            message: 'Profile options retrieved successfully',
            data: profileOptions
        });

    } catch (error) {
        console.error('❌ Error serving profile options:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve profile options'
        });
    }
});

// GET /api/public/universities - Get universities only
router.get('/universities', async (req, res) => {
    try {
        const universities = [
            'Eastern Mediterranean University',
            'Cyprus West University',
            'Cyprus International University',
            'Near East University',
            'Girne American University',
            'European University of Lefke',
            'University of Kyrenia',
            'Final International University',
            'University of Mediterranean Karpasia',
            'Lefke European University',
            'American University of Cyprus',
            'Cyprus Science University',
            'University of Central Lancashire Cyprus'
        ];

        res.json({
            success: true,
            data: universities
        });

    } catch (error) {
        console.error('❌ Error serving universities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve universities'
        });
    }
});

// GET /api/public/transportation-methods - Get transportation methods only
router.get('/transportation-methods', async (req, res) => {
    try {
        const transportationMethods = [
            'Walking',
            'Bicycle',
            'Motorcycle',
            'Car',
            'Public Transport',
            'Other'
        ];

        res.json({
            success: true,
            data: transportationMethods
        });

    } catch (error) {
        console.error('❌ Error serving transportation methods:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve transportation methods'
        });
    }
});

// GET /api/public/service-areas - Get service areas only
router.get('/service-areas', async (req, res) => {
    try {
        const serviceAreas = [
            'Kucuk',
            'Lefkosa',
            'Girne',
            'Iskele',
            'Guzelyurt',
            'Lefke'
        ];

        res.json({
            success: true,
            data: serviceAreas
        });

    } catch (error) {
        console.error('❌ Error serving service areas:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve service areas'
        });
    }
});

module.exports = router;

// ========================================
// MAIN APP INTEGRATION
// ========================================
// In your main app.js or server.js file, add:

/*
const publicRoutes = require('./routes/publicRoutes');
app.use('/api/public', publicRoutes);
*/

// ========================================
// ALTERNATIVE: ADD TO EXISTING ROUTES
// ========================================
// If you prefer to add these endpoints to an existing route file:

/*
// In your existing routes file (e.g., routes/public.js or routes/api.js):

// Profile options endpoint
app.get('/api/public/profile-options', async (req, res) => {
    try {
        const profileOptions = {
            addresses: ['Kucuk', 'Lefkosa', 'Girne', 'Iskele', 'Guzelyurt', 'Lefke'],
            transportationMethods: ['Walking', 'Bicycle', 'Motorcycle', 'Car', 'Public Transport', 'Other'],
            universities: [
                'Eastern Mediterranean University',
                'Cyprus West University',
                'Cyprus International University',
                'Near East University',
                'Girne American University',
                'European University of Lefke',
                'University of Kyrenia',
                'Final International University',
                'University of Mediterranean Karpasia',
                'Lefke European University',
                'American University of Cyprus',
                'Cyprus Science University',
                'University of Central Lancashire Cyprus'
            ]
        };

        res.json({
            success: true,
            message: 'Profile options retrieved successfully',
            data: profileOptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve profile options'
        });
    }
});
*/
