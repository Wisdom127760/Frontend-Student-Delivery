#!/usr/bin/env node

/**
 * Script to clear all deliveries for drivers so we can start fresh
 * 
 * This script will:
 * 1. Fetch all deliveries from the API
 * 2. Delete each delivery one by one
 * 3. Provide progress tracking and confirmation
 * 4. Handle errors gracefully
 * 
 * Usage:
 * node scripts/clearAllDeliveries.js
 * 
 * Or with custom API URL:
 * REACT_APP_API_URL=http://your-api-url node scripts/clearAllDeliveries.js
 * 
 * WARNING: This will permanently delete ALL deliveries. Use with caution!
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

console.log('🚀 Starting Clear All Deliveries Script');
console.log('🌐 API URL:', API_BASE_URL);
console.log('⚠️  WARNING: This will permanently delete ALL deliveries!');
console.log('');

// Configuration
const BATCH_SIZE = 10; // Delete deliveries in batches to avoid overwhelming the server
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

let totalDeliveries = 0;
let deletedCount = 0;
let errorCount = 0;
let errors = [];

async function clearAllDeliveries() {
    try {
        console.log('🔍 Step 1: Fetching all deliveries...');

        // First, get all deliveries
        const deliveries = await fetchAllDeliveries();

        if (deliveries.length === 0) {
            console.log('✅ No deliveries found. Nothing to clear.');
            return;
        }

        totalDeliveries = deliveries.length;
        console.log(`📋 Found ${totalDeliveries} deliveries to delete`);
        console.log('');

        // Show confirmation
        if (!await confirmDeletion()) {
            console.log('❌ Operation cancelled by user.');
            return;
        }

        console.log('🗑️  Step 2: Starting deletion process...');
        console.log('');

        // Delete deliveries in batches
        await deleteDeliveriesInBatches(deliveries);

        // Show final results
        showFinalResults();

    } catch (error) {
        console.error('❌ Error in clear deliveries process:', error.message);
        console.error('📋 Full error:', error);
        process.exit(1);
    }
}

async function fetchAllDeliveries() {
    try {
        const allDeliveries = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
            console.log(`📄 Fetching page ${currentPage}...`);

            const response = await fetch(`${API_BASE_URL}/admin/deliveries?page=${currentPage}&limit=100`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Note: You might need to add authentication headers here
                    // 'Authorization': 'Bearer YOUR_TOKEN'
                }
            });

            if (!response.ok) {
                console.error(`❌ Failed to fetch page ${currentPage}:`, response.status, response.statusText);
                break;
            }

            const result = await response.json();

            if (result.success && result.data) {
                const deliveries = result.data.deliveries || result.data || [];
                allDeliveries.push(...deliveries);

                console.log(`✅ Page ${currentPage}: ${deliveries.length} deliveries`);

                // Check if there are more pages
                hasMore = result.data.hasMore ||
                    result.data.totalPages > currentPage ||
                    deliveries.length === 100; // If we got a full page, there might be more

                currentPage++;
            } else {
                console.log('⚠️ No more deliveries found or API response format changed');
                hasMore = false;
            }
        }

        console.log(`✅ Total deliveries fetched: ${allDeliveries.length}`);
        return allDeliveries;

    } catch (error) {
        console.error('❌ Error fetching deliveries:', error.message);
        throw error;
    }
}

async function confirmDeletion() {
    // In a real script, you might want to add a confirmation prompt
    // For now, we'll add a safety check
    console.log('⚠️  SAFETY CHECK:');
    console.log(`   - Total deliveries to delete: ${totalDeliveries}`);
    console.log('   - This action cannot be undone');
    console.log('   - All delivery data will be permanently lost');
    console.log('');

    // Add a small delay to give time to cancel if running in terminal
    console.log('⏳ Starting deletion in 3 seconds... (Press Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    return true;
}

async function deleteDeliveriesInBatches(deliveries) {
    const batches = [];

    // Split deliveries into batches
    for (let i = 0; i < deliveries.length; i += BATCH_SIZE) {
        batches.push(deliveries.slice(i, i + BATCH_SIZE));
    }

    console.log(`🔄 Processing ${batches.length} batches of up to ${BATCH_SIZE} deliveries each`);
    console.log('');

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} deliveries)...`);

        // Delete deliveries in current batch
        const batchPromises = batch.map(delivery => deleteSingleDelivery(delivery));
        await Promise.allSettled(batchPromises);

        // Show progress
        const progress = ((batchIndex + 1) / batches.length * 100).toFixed(1);
        console.log(`📊 Progress: ${progress}% (${deletedCount}/${totalDeliveries} deleted, ${errorCount} errors)`);

        // Delay between batches (except for the last batch)
        if (batchIndex < batches.length - 1) {
            console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }

        console.log('');
    }
}

async function deleteSingleDelivery(delivery) {
    try {
        const deliveryId = delivery._id || delivery.id;
        const deliveryCode = delivery.deliveryCode || delivery.code || 'Unknown';

        const response = await fetch(`${API_BASE_URL}/admin/deliveries/${deliveryId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Note: You might need to add authentication headers here
                // 'Authorization': 'Bearer YOUR_TOKEN'
            }
        });

        if (response.ok) {
            deletedCount++;
            console.log(`  ✅ Deleted: ${deliveryCode} (${deliveryId})`);
        } else {
            const errorText = await response.text();
            const error = `Failed to delete ${deliveryCode} (${deliveryId}): ${response.status} ${errorText}`;
            errors.push(error);
            errorCount++;
            console.log(`  ❌ ${error}`);
        }

    } catch (error) {
        const deliveryId = delivery._id || delivery.id;
        const deliveryCode = delivery.deliveryCode || delivery.code || 'Unknown';
        const errorMsg = `Error deleting ${deliveryCode} (${deliveryId}): ${error.message}`;
        errors.push(errorMsg);
        errorCount++;
        console.log(`  ❌ ${errorMsg}`);
    }
}

function showFinalResults() {
    console.log('');
    console.log('🎉 Clear Deliveries Script Completed!');
    console.log('📊 Final Results:');
    console.log(`   ✅ Successfully deleted: ${deletedCount} deliveries`);
    console.log(`   ❌ Errors: ${errorCount} deliveries`);
    console.log(`   📋 Total processed: ${deletedCount + errorCount} deliveries`);
    console.log('');

    if (errors.length > 0) {
        console.log('❌ Errors encountered:');
        errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
        console.log('');
    }

    if (deletedCount > 0) {
        console.log('✅ Success! All deliveries have been cleared.');
        console.log('📝 Next steps:');
        console.log('1. Refresh your admin panel');
        console.log('2. Verify that the deliveries list is empty');
        console.log('3. You can now start fresh with new deliveries');
    }

    if (errorCount > 0) {
        console.log('⚠️  Some deliveries could not be deleted. You may need to:');
        console.log('1. Check your API server is running');
        console.log('2. Verify authentication tokens');
        console.log('3. Check server logs for detailed error information');
        console.log('4. Manually delete remaining deliveries through the admin panel');
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('');
    console.log('⚠️  Process interrupted by user');
    console.log(`📊 Partial results: ${deletedCount} deleted, ${errorCount} errors`);
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('');
    console.log('⚠️  Process terminated');
    console.log(`📊 Partial results: ${deletedCount} deleted, ${errorCount} errors`);
    process.exit(0);
});

// Run the script
clearAllDeliveries().then(() => {
    console.log('');
    console.log('🏁 Script execution completed');
}).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
