const { queryOne, execute, queryAll } = require('../config/db');

const removeUser = async (identifier) => {
  if (!identifier) {
    console.log('⚠️ Please specify a user email or ID to remove.');
    console.log('Usage: node server/src/scripts/removeUser.js <email_or_id>');
    console.log('Example: node server/src/scripts/removeUser.js rahul@example.com');
    console.log('Example: node server/src/scripts/removeUser.js 3');
    process.exit(1);
  }

  try {
    const isNumeric = !isNaN(identifier);
    const user = isNumeric
      ? await queryOne('SELECT * FROM users WHERE id = ?', [parseInt(identifier)])
      : await queryOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [identifier.trim()]);

    if (!user) {
      console.log(`❌ User "${identifier}" not found in database.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (ID: ${user.id}, Email: ${user.email}, Role: ${user.role})`);

    // Prevent accidental deletion of primary admin unless forced
    if (user.role === 'admin') {
      const adminCount = await queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
      if (adminCount?.count <= 1) {
        console.log('⚠️ Cannot delete the last remaining Administrator account.');
        process.exit(1);
      }
    }

    const userId = user.id;

    // Clean up dependent data
    await execute('DELETE FROM reviews WHERE reviewer_id = ? OR reviewee_id = ?', [userId, userId]);
    await execute('DELETE FROM disputes WHERE reporter_id = ?', [userId]);
    await execute('DELETE FROM notifications WHERE user_id = ?', [userId]);
    await execute('DELETE FROM borrow_requests WHERE borrower_id = ? OR owner_id = ?', [userId, userId]);
    await execute('DELETE FROM items WHERE owner_id = ?', [userId]);
    await execute('DELETE FROM users WHERE id = ?', [userId]);

    console.log(`✅ Successfully removed user "${user.name}" (${user.email}) and all associated records.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing user:', error.message);
    process.exit(1);
  }
};

const target = process.argv[2];
removeUser(target);

