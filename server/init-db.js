import { db } from './database.js';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  console.log('🗄️  Initializing database...');
  
  try {
    // Create departments table using raw SQL
    await db.executeQuery({
      sql: `CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      parameters: []
    });

    // Create doctors table using raw SQL
    await db.executeQuery({
      sql: `CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        specialization TEXT,
        department_id INTEGER,
        photo_url TEXT,
        schedule TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )`,
      parameters: []
    });

    // Create services table using raw SQL
    await db.executeQuery({
      sql: `CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        department_id INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )`,
      parameters: []
    });

    console.log('✅ Database tables created successfully');

    // Insert sample data if tables are empty
    const departmentCount = await db.executeQuery({
      sql: 'SELECT COUNT(*) as count FROM departments',
      parameters: []
    });

    if (Number(departmentCount.rows[0]?.count) === 0) {
      console.log('📝 Inserting sample data...');
      
      // Sample departments
      const departments = [
        { name: 'Cardiology', description: 'Heart and cardiovascular care' },
        { name: 'Neurology', description: 'Brain and nervous system treatment' },
        { name: 'Orthopedics', description: 'Bone and joint care' },
        { name: 'Pediatrics', description: 'Child healthcare' },
        { name: 'General Medicine', description: 'Primary healthcare services' }
      ];

      for (const dept of departments) {
        await db.executeQuery({
          sql: 'INSERT INTO departments (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)',
          parameters: [dept.name, dept.description, new Date().toISOString(), new Date().toISOString()]
        });
      }

      // Sample doctors
      const doctors = [
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@adityahospital.com',
          phone: '+91 98765 43210',
          specialization: 'Cardiologist',
          department_id: 1,
          schedule: 'Mon-Fri: 9:00 AM - 5:00 PM'
        },
        {
          name: 'Dr. Priya Sharma',
          email: 'priya.sharma@adityahospital.com',
          phone: '+91 98765 43211',
          specialization: 'Neurologist',
          department_id: 2,
          schedule: 'Mon-Wed-Fri: 10:00 AM - 4:00 PM'
        },
        {
          name: 'Dr. Amit Singh',
          email: 'amit.singh@adityahospital.com',
          phone: '+91 98765 43212',
          specialization: 'Orthopedic Surgeon',
          department_id: 3,
          schedule: 'Tue-Thu-Sat: 8:00 AM - 2:00 PM'
        }
      ];

      for (const doctor of doctors) {
        await db.executeQuery({
          sql: 'INSERT INTO doctors (name, email, phone, specialization, department_id, schedule, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          parameters: [
            doctor.name,
            doctor.email,
            doctor.phone,
            doctor.specialization,
            doctor.department_id,
            doctor.schedule,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        });
      }

      // Sample services
      const services = [
        {
          name: 'ECG Testing',
          description: 'Electrocardiogram testing for heart conditions',
          department_id: 1
        },
        {
          name: 'MRI Scan',
          description: 'Magnetic Resonance Imaging for detailed brain scans',
          department_id: 2
        },
        {
          name: 'X-Ray Services',
          description: 'Digital X-ray imaging for bone and joint diagnosis',
          department_id: 3
        },
        {
          name: 'Vaccination',
          description: 'Immunization services for children',
          department_id: 4
        },
        {
          name: 'Health Checkup',
          description: 'Comprehensive health screening packages',
          department_id: 5
        }
      ];

      for (const service of services) {
        await db.executeQuery({
          sql: 'INSERT INTO services (name, description, department_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          parameters: [
            service.name,
            service.description,
            service.department_id,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        });
      }

      console.log('✅ Sample data inserted successfully');
    }

    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}
