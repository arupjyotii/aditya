import { db } from './database.js';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  console.log('🗄️  Initializing database...');
  
  try {
    // Create departments table
    await db.schema
      .createTable('departments')
      .ifNotExists()
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('description', 'text')
      .addColumn('created_at', 'text', (col) => col.notNull())
      .addColumn('updated_at', 'text', (col) => col.notNull())
      .execute();

    // Create doctors table
    await db.schema
      .createTable('doctors')
      .ifNotExists()
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('email', 'text')
      .addColumn('phone', 'text')
      .addColumn('specialization', 'text')
      .addColumn('department_id', 'integer', (col) => 
        col.references('departments.id').onDelete('set null'))
      .addColumn('photo_url', 'text')
      .addColumn('schedule', 'text')
      .addColumn('created_at', 'text', (col) => col.notNull())
      .addColumn('updated_at', 'text', (col) => col.notNull())
      .execute();

    // Create services table
    await db.schema
      .createTable('services')
      .ifNotExists()
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('description', 'text')
      .addColumn('department_id', 'integer', (col) => 
        col.references('departments.id').onDelete('set null'))
      .addColumn('created_at', 'text', (col) => col.notNull())
      .addColumn('updated_at', 'text', (col) => col.notNull())
      .execute();

    console.log('✅ Database tables created successfully');

    // Insert sample data if tables are empty
    const departmentCount = await db.selectFrom('departments')
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst();

    if (Number(departmentCount?.count) === 0) {
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
        await db.insertInto('departments')
          .values({
            ...dept,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .execute();
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
        await db.insertInto('doctors')
          .values({
            ...doctor,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .execute();
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
        await db.insertInto('services')
          .values({
            ...service,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .execute();
      }

      console.log('✅ Sample data inserted successfully');
    }

    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };