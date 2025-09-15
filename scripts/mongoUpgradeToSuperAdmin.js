/**
 * MongoDB Script to Upgrade wisdom@greep.io to Super Admin
 * 
 * This script can be run directly in MongoDB shell or MongoDB Compass
 * 
 * Usage:
 * 1. Connect to your MongoDB database
 * 2. Run this script in the MongoDB shell or MongoDB Compass
 * 
 * MongoDB Shell:
 * mongo your-database-name scripts/mongoUpgradeToSuperAdmin.js
 * 
 * Or copy-paste the commands below into MongoDB Compass
 */

// MongoDB Commands to run:

// 1. Find the user first
db.users.findOne({ email: "wisdom@greep.io" })

// 2. Update the user to super_admin
db.users.updateOne(
    { email: "wisdom@greep.io" },
    {
        $set: {
            userType: "super_admin",
            role: "super_admin",
            permissions: [
                "create_delivery",
                "edit_delivery",
                "delete_delivery",
                "manage_drivers",
                "view_analytics",
                "manage_remittances",
                "manage_admins",
                "manage_system_settings",
                "manage_earnings_config"
            ]
        }
    }
)

// 3. Verify the update
db.users.findOne({ email: "wisdom@greep.io" }, { email: 1, userType: 1, role: 1, permissions: 1 })

// Alternative: If your collection is named differently, try these:
// db.admins.updateOne({ email: "wisdom@greep.io" }, { $set: { userType: "super_admin", role: "super_admin" } })
// db.admin_users.updateOne({ email: "wisdom@greep.io" }, { $set: { userType: "super_admin", role: "super_admin" } })

console.log("✅ MongoDB script completed!");
console.log("📝 Next steps:");
console.log("1. Refresh your admin panel");
console.log("2. Log out and log back in");
console.log("3. Check that Remittances and Settings are now visible");
