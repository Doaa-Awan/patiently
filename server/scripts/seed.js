require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const SymptomEntry = require('../models/symptoms');
const { connectDB } = require('../db/db');

// Sample data
const patients = [
  {
    email: 'patient1@example.com',
    password: 'password123',
    role: 'patient',
    name: 'John Doe',
    phone: '555-0101',
    address: '123 Main St, City, State 12345',
    patientInfo: {
      dateOfBirth: new Date('1985-05-15'),
      conditions: ['Hypertension', 'Diabetes Type 2'],
      medications: ['Metformin', 'Lisinopril'],
      emergencyContact: {
        name: 'Jane Doe',
        phone: '555-0102',
        relationship: 'Spouse'
      }
    }
  },
  {
    email: 'patient2@example.com',
    password: 'password123',
    role: 'patient',
    name: 'Sarah Smith',
    phone: '555-0201',
    address: '456 Oak Ave, City, State 12345',
    patientInfo: {
      dateOfBirth: new Date('1990-08-22'),
      conditions: ['Asthma', 'Seasonal Allergies'],
      medications: ['Albuterol', 'Loratadine'],
      emergencyContact: {
        name: 'Mike Smith',
        phone: '555-0202',
        relationship: 'Brother'
      }
    }
  },
  {
    email: 'patient3@example.com',
    password: 'password123',
    role: 'patient',
    name: 'Robert Johnson',
    phone: '555-0301',
    address: '789 Pine Rd, City, State 12345',
    patientInfo: {
      dateOfBirth: new Date('1978-12-10'),
      conditions: ['Chronic Pain', 'Arthritis'],
      medications: ['Ibuprofen', 'Gabapentin'],
      emergencyContact: {
        name: 'Mary Johnson',
        phone: '555-0302',
        relationship: 'Wife'
      }
    }
  }
];

const caregivers = [
  {
    email: 'caregiver1@example.com',
    password: 'password123',
    role: 'caregiver',
    name: 'Dr. Emily Chen',
    phone: '555-1001',
    address: '100 Medical Center Dr, City, State 12345'
  },
  {
    email: 'caregiver2@example.com',
    password: 'password123',
    role: 'caregiver',
    name: 'Nurse James Wilson',
    phone: '555-1002',
    address: '200 Health Plaza, City, State 12345'
  }
];

// Sample symptoms for each patient
const generateSymptoms = (patientId) => {
  const symptoms = [
    { symptom: 'Headache', category: 'Headache', severity: 6 },
    { symptom: 'Fatigue and tiredness', category: 'Fatigue', severity: 5 },
    { symptom: 'Mild chest discomfort', category: 'Pain', severity: 4 },
    { symptom: 'Difficulty sleeping', category: 'Sleep Issues', severity: 7 },
    { symptom: 'Nausea after meals', category: 'Nausea', severity: 5 },
    { symptom: 'Dizziness when standing', category: 'Dizziness', severity: 6 },
    { symptom: 'Joint pain in knees', category: 'Pain', severity: 7 },
    { symptom: 'Shortness of breath', category: 'Breathing', severity: 5 },
    { symptom: 'Loss of appetite', category: 'Appetite Changes', severity: 4 },
    { symptom: 'Feeling anxious', category: 'Mood Changes', severity: 6 }
  ];

  // Generate symptoms over the past 30 days
  const entries = [];
  const now = new Date();
  
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(startTime.getHours() - hoursAgo);

    const symptomData = symptoms[Math.floor(Math.random() * symptoms.length)];
    
    entries.push({
      patient: patientId,
      symptom: symptomData.symptom,
      category: symptomData.category,
      severity: symptomData.severity + Math.floor(Math.random() * 3) - 1, // Vary severity by ±1
      startTime: startTime,
      notes: `Symptom occurred at ${startTime.toLocaleString()}`
    });
  }

  return entries;
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await SymptomEntry.deleteMany({});
    console.log('✅ Cleared existing data');

    // Hash passwords and create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    // Create patients
    for (const patientData of patients) {
      const hashedPassword = await bcrypt.hash(patientData.password, 10);
      const user = await User.create({
        ...patientData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`  ✅ Created patient: ${user.name} (${user.email})`);
    }

    // Create caregivers
    for (const caregiverData of caregivers) {
      const hashedPassword = await bcrypt.hash(caregiverData.password, 10);
      const user = await User.create({
        ...caregiverData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`  ✅ Created caregiver: ${user.name} (${user.email})`);
    }

    // Create symptoms for patients
    console.log('📝 Creating symptom entries...');
    const patientUsers = createdUsers.filter(u => u.role === 'patient');
    
    for (const patient of patientUsers) {
      const symptomEntries = generateSymptoms(patient._id);
      await SymptomEntry.insertMany(symptomEntries);
      console.log(`  ✅ Created ${symptomEntries.length} symptom entries for ${patient.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - ${patientUsers.length} patients created`);
    console.log(`   - ${createdUsers.length - patientUsers.length} caregivers created`);
    console.log(`   - ${await SymptomEntry.countDocuments()} symptom entries created`);
    console.log('\n🔑 Login credentials:');
    console.log('   Patients:');
    patientUsers.forEach(p => {
      console.log(`     Email: ${p.email}, Password: password123`);
    });
    console.log('   Caregivers:');
    createdUsers.filter(u => u.role === 'caregiver').forEach(c => {
      console.log(`     Email: ${c.email}, Password: password123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed function
seedDatabase();
