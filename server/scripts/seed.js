const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const SymptomEntry = require('../models/symptoms');
const { connectDB } = require('../db/db');

const patients = [
  {
    email: 'patient1@example.com',
    password: 'T@rtBoat12',
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
        relationship: 'Spouse',
      },
    },
  },
];

const caregivers = [
  {
    email: 'caregiver1@example.com',
    password: 'password123',
    role: 'caregiver',
    name: 'Dr. Emily Chen',
    phone: '555-1001',
    address: '100 Medical Center Dr, City, State 12345',
  },
];

const toBulletSymptom = ({ symptoms, onsetTiming, progression, modifiers, currentStatus }) => {
  return [
    `- **Symptoms:** ${symptoms}`,
    `- **Onset/Timing:** ${onsetTiming}`,
    `- **Progression:** ${progression}`,
    `- **Modifiers:** ${modifiers}`,
    `- **Current status:** ${currentStatus}`,
  ].join('\n');
};

const dateAtDaysAgo = (daysAgo, hour) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const buildFluWeekEntries = (patientId) => {
  return [
    {
      patient: patientId,
      category: 'Fatigue',
      severity: 4,
      startTime: dateAtDaysAgo(7, 19),
      symptom: toBulletSymptom({
        symptoms: 'Low energy, mild body ache, feeling run down',
        onsetTiming: 'Started in the evening after work, about a week ago',
        progression: 'New onset, mild so far',
        modifiers: 'Rest helped slightly; activity made fatigue more noticeable',
        currentStatus: 'Tired but still functioning normally',
      }),
      notes: 'Seeded flu progression day 1',
    },
    {
      patient: patientId,
      category: 'Headache',
      severity: 5,
      startTime: dateAtDaysAgo(6, 9),
      symptom: toBulletSymptom({
        symptoms: 'Dull headache, increased tiredness',
        onsetTiming: 'Headache began the next morning',
        progression: 'Worse than yesterday, especially by afternoon',
        modifiers: 'Hydration and acetaminophen helped for a few hours',
        currentStatus: 'Mild-moderate discomfort by evening',
      }),
      notes: 'Seeded flu progression day 2',
    },
    {
      patient: patientId,
      category: 'Fatigue',
      severity: 6,
      startTime: dateAtDaysAgo(5, 13),
      symptom: toBulletSymptom({
        symptoms: 'Exhaustion, headache, sore throat, reduced appetite',
        onsetTiming: 'Symptoms present most of the day',
        progression: 'Noticeably worse than previous day',
        modifiers: 'Naps helped briefly; screen time worsened headache',
        currentStatus: 'Needed to rest for most of the afternoon',
      }),
      notes: 'Seeded flu progression day 3',
    },
    {
      patient: patientId,
      category: 'Nausea',
      severity: 7,
      startTime: dateAtDaysAgo(4, 11),
      symptom: toBulletSymptom({
        symptoms: 'Nausea, strong fatigue, headache, chills',
        onsetTiming: 'Late morning through evening',
        progression: 'Peak severity period',
        modifiers: 'Small bland meals were tolerated better; movement worsened nausea',
        currentStatus: 'Felt sick and mostly stayed in bed',
      }),
      notes: 'Seeded flu progression day 4',
    },
    {
      patient: patientId,
      category: 'Headache',
      severity: 6,
      startTime: dateAtDaysAgo(3, 10),
      symptom: toBulletSymptom({
        symptoms: 'Headache and fatigue, nausea improving',
        onsetTiming: 'Morning symptoms, gradually easing later in day',
        progression: 'Slight improvement from worst day',
        modifiers: 'Fluids and rest helped; skipped heavy meals',
        currentStatus: 'Still unwell but able to do light tasks',
      }),
      notes: 'Seeded flu progression day 5',
    },
    {
      patient: patientId,
      category: 'Fatigue',
      severity: 4,
      startTime: dateAtDaysAgo(2, 15),
      symptom: toBulletSymptom({
        symptoms: 'General fatigue, mild lingering headache',
        onsetTiming: 'Mostly afternoon tiredness',
        progression: 'Continuing to improve',
        modifiers: 'Normal meals and hydration improved energy',
        currentStatus: 'Much better, not fully back to baseline',
      }),
      notes: 'Seeded flu progression day 6',
    },
    {
      patient: patientId,
      category: 'Fatigue',
      severity: 2,
      startTime: dateAtDaysAgo(1, 18),
      symptom: toBulletSymptom({
        symptoms: 'Mild tiredness only',
        onsetTiming: 'Intermittent in the evening',
        progression: 'Near recovery',
        modifiers: 'Rest quickly resolves symptoms',
        currentStatus: 'Almost back to normal',
      }),
      notes: 'Seeded flu progression day 7',
    },
  ];
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    await connectDB();
    console.log('Connected to database');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await SymptomEntry.deleteMany({});
    console.log('Cleared existing data');

    console.log('Creating users...');
    const createdUsers = [];

    for (const patientData of patients) {
      const hashedPassword = await bcrypt.hash(patientData.password, 10);
      const user = await User.create({
        ...patientData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`  Created patient: ${user.name} (${user.email})`);
    }

    for (const caregiverData of caregivers) {
      const hashedPassword = await bcrypt.hash(caregiverData.password, 10);
      const user = await User.create({
        ...caregiverData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`  Created caregiver: ${user.name} (${user.email})`);
    }

    console.log('Creating symptom entries...');
    const patientUsers = createdUsers.filter((u) => u.role === 'patient');

    for (const patient of patientUsers) {
      let symptomEntries = [];

      if (patient.email === 'patient1@example.com') {
        symptomEntries = buildFluWeekEntries(patient._id);
      }

      if (symptomEntries.length > 0) {
        await SymptomEntry.insertMany(symptomEntries);
      }

      console.log(`  Created ${symptomEntries.length} symptom entries for ${patient.name}`);
    }

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`   - ${patientUsers.length} patients created`);
    console.log(`   - ${createdUsers.length - patientUsers.length} caregivers created`);
    console.log(`   - ${await SymptomEntry.countDocuments()} symptom entries created`);

    console.log('\nLogin credentials:');
    console.log('   Patients:');
    patientUsers.forEach((p) => {
      const seededPatient = patients.find((seed) => seed.email === p.email);
      console.log(`     Email: ${p.email}, Password: ${seededPatient?.password || '[unknown]'}`);
    });

    console.log('   Caregivers:');
    createdUsers
      .filter((u) => u.role === 'caregiver')
      .forEach((c) => {
        const seededCaregiver = caregivers.find((seed) => seed.email === c.email);
        console.log(`     Email: ${c.email}, Password: ${seededCaregiver?.password || '[unknown]'}`);
      });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
