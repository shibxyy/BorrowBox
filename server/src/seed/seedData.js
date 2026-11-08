const bcrypt = require('bcryptjs');
const { initDatabase, execute, queryOne, queryAll } = require('../config/db');

const seed = async () => {
  console.log('🌱 Starting BorrowBox Database Seeding...');
  await initDatabase();

  // Check if already seeded
  const userCount = await queryOne('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count > 0) {
    console.log('ℹ️  Database already contains data. Skipping seed. (To reseed, delete borrowbox.db and rerun)');
    return;
  }

  // 1. Seed Categories
  const categories = [
    { name: 'Cameras & Electronics', description: 'DSLRs, mirrorless cameras, lenses, gimbals, drones, and projectors', icon: 'Camera' },
    { name: 'Power Tools & DIY', description: 'Drills, saws, sanders, toolboxes, ladders, and lawn care', icon: 'Wrench' },
    { name: 'Books & Academics', description: 'College textbooks, entrance exam prep, classic literature, and technical manuals', icon: 'BookOpen' },
    { name: 'Musical Instruments', description: 'Guitars, keyboards, amplifiers, violins, and studio gear', icon: 'Music' },
    { name: 'Camping & Outdoors', description: 'Tents, backpacks, trekking poles, sleeping bags, and lanterns', icon: 'Compass' },
    { name: 'Sports & Fitness', description: 'Badminton & tennis rackets, dumbbells, cricket kits, and yoga gear', icon: 'Trophy' }
  ];

  for (const cat of categories) {
    await execute('INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)', [cat.name, cat.description, cat.icon]);
  }
  console.log('✅ Categories seeded.');

  // 2. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const users = [
    {
      name: 'System Admin',
      email: 'admin@borrowbox.com',
      phone: '+91 98765 00001',
      password: adminPasswordHash,
      location: 'Central Admin Office / Cochin Campus',
      bio: 'BorrowBox Platform Administrator maintaining safe, reliable peer-to-peer exchanges.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      role: 'admin',
      is_verified: 1,
      trust_score: 5.0
    },
    {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 98765 11111',
      password: passwordHash,
      location: 'Kalamassery / CUSAT Campus',
      bio: 'Photography and drone enthusiast. Love lending equipment to fellow creators who treat gear with care!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      role: 'user',
      is_verified: 1,
      trust_score: 4.9
    },
    {
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      phone: '+91 98765 22222',
      password: passwordHash,
      location: 'Thrikkakara / Model Engg College',
      bio: 'BCA 3rd Year student. Tech hobbyist, avid reader, and weekend outdoor trekker.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80',
      role: 'user',
      is_verified: 1,
      trust_score: 4.8
    },
    {
      name: 'Ananya Nair',
      email: 'ananya@example.com',
      phone: '+91 98765 33333',
      password: passwordHash,
      location: 'Kakkanad Infopark Area',
      bio: 'Indie musician & UI designer. Happy to share musical instruments and audio recording equipment.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
      role: 'user',
      is_verified: 1,
      trust_score: 5.0
    },
    {
      name: 'Karthik Menon',
      email: 'karthik@example.com',
      phone: '+91 98765 44444',
      password: passwordHash,
      location: 'Edappally Toll',
      bio: 'DIY enthusiast and camper. Have a garage full of power tools and outdoor gear idle most weekends!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      role: 'user',
      is_verified: 1,
      trust_score: 4.7
    }
  ];

  for (const u of users) {
    await execute(
      `INSERT INTO users (name, email, phone, password, location, bio, avatar, role, is_verified, trust_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.name, u.email, u.phone, u.password, u.location, u.bio, u.avatar, u.role, u.is_verified, u.trust_score]
    );
  }
  console.log('✅ Users seeded.');

  // 3. Seed Items
  const items = [
    {
      owner_id: 2, // Priya
      category_id: 1, // Cameras & Electronics
      title: 'Sony Alpha A7 III Full-Frame Camera + 28-70mm Lens',
      description: 'Excellent condition 24.2MP full-frame mirrorless camera. Includes 2 batteries, 64GB SanDisk Extreme Pro SD card, charger, and padded carrying case. Perfect for college events and short films.',
      condition: 'Like New',
      location: 'Kalamassery, Near CUSAT Metro',
      security_deposit: 1500.00,
      max_duration_days: 5,
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      is_available: 1
    },
    {
      owner_id: 5, // Karthik
      category_id: 2, // Power Tools & DIY
      title: 'Bosch Professional Rotary Hammer Drill 800W',
      description: 'Heavy duty corded hammer drill with SDS-plus chuck. Comes with masonry drill bits set (6mm, 8mm, 10mm, 12mm) and auxiliary handle. Ideal for home mounting and DIY projects.',
      condition: 'Good',
      location: 'Edappally Toll, Cochin',
      security_deposit: 500.00,
      max_duration_days: 4,
      image_url: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&q=80',
      is_available: 0 // currently borrowed by Rahul
    },
    {
      owner_id: 4, // Ananya
      category_id: 4, // Musical Instruments
      title: 'Yamaha F310 Full-Size Acoustic Guitar with Gig Bag',
      description: 'Rich warm tone dreadnought acoustic guitar. Strung with fresh D’Addario bronze strings. Comes with water-resistant gig bag, clip-on digital tuner, and 3 plectrums.',
      condition: 'Like New',
      location: 'Kakkanad Infopark Phase 1',
      security_deposit: 800.00,
      max_duration_days: 14,
      image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
      is_available: 1
    },
    {
      owner_id: 5, // Karthik
      category_id: 5, // Camping & Outdoors
      title: 'Quechua Arpenaz 4.1 Family Camping Tent (4-Person)',
      description: 'Waterproof and wind-resistant 4-person camping tent with standing height living area. Easy to pitch with color-coded poles. Includes ground pegs, guy ropes, and transport carry bag.',
      condition: 'Good',
      location: 'Edappally, Cochin',
      security_deposit: 1000.00,
      max_duration_days: 7,
      image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      is_available: 1
    },
    {
      owner_id: 3, // Rahul
      category_id: 3, // Books & Academics
      title: 'Introduction to Algorithms (CLRS 4th Edition Hardcover)',
      description: 'The definitive textbook for algorithms and data structures by Cormen, Leiserson, Rivest, and Stein. Pristine condition with no markings or highlights. Great for semester exams and coding interviews.',
      condition: 'Brand New',
      location: 'Thrikkakara, Model Engg College',
      security_deposit: 300.00,
      max_duration_days: 21,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      is_available: 1
    },
    {
      owner_id: 2, // Priya
      category_id: 1, // Cameras & Electronics
      title: 'DJI Mini 2 4K Ultralight Foldable Drone Combo',
      description: 'Compact drone under 249g. 4K 30fps video with 3-axis motorized gimbal. Includes smart controller, 3 intelligent flight batteries (31 min each), two-way charging hub, and shoulder bag.',
      condition: 'Like New',
      location: 'Kalamassery, Cochin',
      security_deposit: 2500.00,
      max_duration_days: 3,
      image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80',
      is_available: 1
    },
    {
      owner_id: 3, // Rahul
      category_id: 6, // Sports & Fitness
      title: 'Wilson Pro Staff Tennis Racket Set (2 Rackets + 6 Balls)',
      description: 'Pair of Wilson graphite composite tennis rackets with comfortable grip tape. Includes a can of 6 tournament tennis balls and protective head covers. Perfect for college turf matches.',
      condition: 'Good',
      location: 'Thrikkakara, Cochin',
      security_deposit: 400.00,
      max_duration_days: 7,
      image_url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
      is_available: 1
    },
    {
      owner_id: 4, // Ananya
      category_id: 4, // Musical Instruments
      title: 'Akai Professional MPK Mini MK3 25-Key MIDI Keyboard',
      description: 'Ultra-compact USB keyboard and pad controller. 25 mini keys with Gen 2 dynamic keybed, 8 backlit MPC pads with note repeat & full level, 8 assignable endless knobs. Connects plug-and-play to PC/Mac.',
      condition: 'Like New',
      location: 'Kakkanad Infopark Phase 1',
      security_deposit: 700.00,
      max_duration_days: 10,
      image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      is_available: 1
    }
  ];

  for (const item of items) {
    await execute(
      `INSERT INTO items (owner_id, category_id, title, description, condition, location, security_deposit, max_duration_days, image_url, is_available, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        item.owner_id,
        item.category_id,
        item.title,
        item.description,
        item.condition,
        item.location,
        item.security_deposit,
        item.max_duration_days,
        item.image_url,
        item.is_available
      ]
    );
  }
  console.log('✅ Items seeded.');

  // 4. Seed Requests across distinct workflow stages
  // Stages: Requested, Approved, Active, Returned, Completed
  const requests = [
    // 1. Requested (Pending approval)
    {
      item_id: 3, // Yamaha Guitar (Ananya is owner)
      borrower_id: 3, // Rahul is borrower
      owner_id: 4,
      start_date: '2026-11-15',
      return_date: '2026-11-20',
      purpose: 'Practicing acoustic tracks for our college cultural fest unplugged competition.',
      status: 'Requested'
    },
    // 2. Approved (Owner approved, awaiting physical handover)
    {
      item_id: 1, // Sony Camera (Priya is owner)
      borrower_id: 4, // Ananya is borrower
      owner_id: 2,
      start_date: '2026-11-12',
      return_date: '2026-11-14',
      purpose: 'Filming promotional video clips for our student music band.',
      status: 'Approved'
    },
    // 3. Active (Currently in use / handed over)
    {
      item_id: 2, // Bosch Hammer Drill (Karthik is owner)
      borrower_id: 3, // Rahul is borrower
      owner_id: 5,
      start_date: '2026-11-06',
      return_date: '2026-11-10',
      purpose: 'Mounting study wall shelves and whiteboard in my college hostel room.',
      status: 'Active',
      handover_date: '2026-11-06 10:30:00'
    },
    // 4. Returned (Item returned, pending final review/closing)
    {
      item_id: 5, // CLRS Book (Rahul is owner)
      borrower_id: 5, // Karthik is borrower
      owner_id: 3,
      start_date: '2026-10-20',
      return_date: '2026-10-28',
      purpose: 'Preparing graph algorithm concepts for an upcoming technical interview.',
      status: 'Returned',
      handover_date: '2026-10-20 09:00:00',
      actual_return_date: '2026-10-28 17:00:00'
    },
    // 5. Completed (Fully completed transaction with reviews)
    {
      item_id: 4, // Quechua Camping Tent (Karthik is owner)
      borrower_id: 3, // Rahul is borrower
      owner_id: 5,
      start_date: '2026-10-01',
      return_date: '2026-10-05',
      purpose: 'Weekend college trek to Meesapulimala Munnar.',
      status: 'Completed',
      handover_date: '2026-10-01 08:00:00',
      actual_return_date: '2026-10-05 18:30:00'
    }
  ];

  for (const r of requests) {
    await execute(
      `INSERT INTO borrow_requests (
        item_id, borrower_id, owner_id, start_date, return_date, purpose, status, handover_date, actual_return_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.item_id,
        r.borrower_id,
        r.owner_id,
        r.start_date,
        r.return_date,
        r.purpose,
        r.status,
        r.handover_date || null,
        r.actual_return_date || null
      ]
    );
  }
  console.log('✅ Borrow requests seeded.');

  // 5. Seed Reviews for completed request #5
  await execute(
    `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, item_id, rating, comment, review_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      5,
      3, // Rahul (borrower) rates Karthik (owner)
      5,
      4, // Tent
      5,
      'Karthik was fantastic! The tent was in spotless condition, waterproof, and he even showed me how to pitch it. Highly recommended lender!',
      'borrower_to_owner'
    ]
  );

  await execute(
    `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, item_id, rating, comment, review_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      5,
      5, // Karthik (owner) rates Rahul (borrower)
      3,
      4,
      5,
      'Rahul took great care of the tent and returned it neatly packed exactly on time. Would happily lend to him again anytime!',
      'owner_to_borrower'
    ]
  );
  console.log('✅ Reviews seeded.');

  // 6. Seed Notifications
  const notifications = [
    {
      user_id: 4, // Ananya
      title: 'New Borrowing Request',
      message: 'Rahul Verma requested to borrow "Yamaha F310 Full-Size Acoustic Guitar" from Nov 15 to Nov 20.',
      type: 'request',
      link: '/dashboard/lending'
    },
    {
      user_id: 4, // Ananya
      title: 'Request Approved!',
      message: 'Priya Sharma approved your request for "Sony Alpha A7 III Full-Frame Camera". Connect to coordinate handover.',
      type: 'approval',
      link: '/dashboard/borrowing'
    },
    {
      user_id: 3, // Rahul
      title: 'Handover Active — Return Due Nov 10',
      message: 'You have borrowed "Bosch Professional Rotary Hammer Drill". Please return by Nov 10.',
      type: 'active',
      link: '/dashboard/borrowing'
    },
    {
      user_id: 5, // Karthik
      title: 'Item Returned — Please Review',
      message: 'Rahul returned "Quechua Arpenaz 4.1 Camping Tent". Rate your experience to build community trust.',
      type: 'review',
      link: '/dashboard/lending'
    }
  ];

  for (const n of notifications) {
    await execute(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [n.user_id, n.title, n.message, n.type, n.link]
    );
  }
  console.log('✅ Notifications seeded.');

  console.log('🎉 BorrowBox database successfully seeded!');
};

// Execute if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed error:', err);
      process.exit(1);
    });
}

module.exports = seed;

