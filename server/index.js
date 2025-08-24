import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
dotenv.config();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        req.user = user;
        next();
    });
};
// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }
        // For demo purposes, using hardcoded admin user
        // In production, you'd query from a users table
        const validUsers = [
            {
                id: 1,
                username: 'admin',
                password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
                name: 'Joon Borah',
                role: 'admin'
            }
        ];
        const user = validUsers.find(u => u.username === username);
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});
app.post('/api/auth/logout', (req, res) => {
    // In a real app, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
});
// Dashboard API
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const doctorsCount = await db.selectFrom('doctors').select(db.fn.count('id').as('count')).executeTakeFirst();
        const departmentsCount = await db.selectFrom('departments').select(db.fn.count('id').as('count')).executeTakeFirst();
        const servicesCount = await db.selectFrom('services').select(db.fn.count('id').as('count')).executeTakeFirst();
        res.json({
            doctors: Number(doctorsCount?.count) || 0,
            departments: Number(departmentsCount?.count) || 0,
            services: Number(servicesCount?.count) || 0
        });
    }
    catch (error) {
        console.error('Dashboard API error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
// Department APIs
app.get('/api/departments', authenticateToken, async (req, res) => {
    try {
        const departments = await db.selectFrom('departments')
            .selectAll()
            .orderBy('name')
            .execute();
        res.json(departments);
    }
    catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});
app.post('/api/departments', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await db.insertInto('departments')
            .values({
            name,
            description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .returning('id')
            .executeTakeFirst();
        res.json({ id: result?.id, name, description });
    }
    catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({ error: 'Failed to create department' });
    }
});
app.put('/api/departments/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        await db.updateTable('departments')
            .set({
            name,
            description,
            updated_at: new Date().toISOString()
        })
            .where('id', '=', Number(id))
            .execute();
        res.json({ id: Number(id), name, description });
    }
    catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ error: 'Failed to update department' });
    }
});
app.delete('/api/departments/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteFrom('departments').where('id', '=', Number(id)).execute();
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});
// Doctor APIs
app.get('/api/doctors', authenticateToken, async (req, res) => {
    try {
        const doctors = await db.selectFrom('doctors')
            .leftJoin('departments', 'doctors.department_id', 'departments.id')
            .select([
            'doctors.id',
            'doctors.name',
            'doctors.email',
            'doctors.phone',
            'doctors.specialization',
            'doctors.department_id',
            'doctors.photo_url',
            'doctors.schedule',
            'doctors.created_at',
            'doctors.updated_at',
            'departments.name as department_name'
        ])
            .orderBy('doctors.name')
            .execute();
        res.json(doctors);
    }
    catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});
app.post('/api/doctors', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, specialization, department_id, photo_url, schedule } = req.body;
        const result = await db.insertInto('doctors')
            .values({
            name,
            email,
            phone,
            specialization,
            department_id: department_id || null,
            photo_url,
            schedule,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .returning('id')
            .executeTakeFirst();
        res.json({ id: result?.id, name, email, phone, specialization, department_id, photo_url, schedule });
    }
    catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({ error: 'Failed to create doctor' });
    }
});
app.put('/api/doctors/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, specialization, department_id, photo_url, schedule } = req.body;
        await db.updateTable('doctors')
            .set({
            name,
            email,
            phone,
            specialization,
            department_id: department_id || null,
            photo_url,
            schedule,
            updated_at: new Date().toISOString()
        })
            .where('id', '=', Number(id))
            .execute();
        res.json({ id: Number(id), name, email, phone, specialization, department_id, photo_url, schedule });
    }
    catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({ error: 'Failed to update doctor' });
    }
});
app.delete('/api/doctors/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteFrom('doctors').where('id', '=', Number(id)).execute();
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({ error: 'Failed to delete doctor' });
    }
});
// Service APIs
app.get('/api/services', authenticateToken, async (req, res) => {
    try {
        const services = await db.selectFrom('services')
            .leftJoin('departments', 'services.department_id', 'departments.id')
            .select([
            'services.id',
            'services.name',
            'services.description',
            'services.department_id',
            'services.created_at',
            'services.updated_at',
            'departments.name as department_name'
        ])
            .orderBy('services.name')
            .execute();
        res.json(services);
    }
    catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
app.post('/api/services', authenticateToken, async (req, res) => {
    try {
        const { name, description, department_id } = req.body;
        const result = await db.insertInto('services')
            .values({
            name,
            description,
            department_id: department_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .returning('id')
            .executeTakeFirst();
        res.json({ id: result?.id, name, description, department_id });
    }
    catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});
app.put('/api/services/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, department_id } = req.body;
        await db.updateTable('services')
            .set({
            name,
            description,
            department_id: department_id || null,
            updated_at: new Date().toISOString()
        })
            .where('id', '=', Number(id))
            .execute();
        res.json({ id: Number(id), name, description, department_id });
    }
    catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});
app.delete('/api/services/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteFrom('services').where('id', '=', Number(id)).execute();
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});
// Public API endpoints (no authentication required)
app.get('/api/public/departments', async (req, res) => {
    try {
        const departments = await db.selectFrom('departments')
            .selectAll()
            .orderBy('name')
            .execute();
        // Calculate doctor_count and service_count for each department
        const departmentsWithCounts = await Promise.all(departments.map(async (dept) => {
            const doctorCount = await db.selectFrom('doctors')
                .select(db.fn.count('id').as('count'))
                .where('department_id', '=', dept.id)
                .executeTakeFirst();
            const serviceCount = await db.selectFrom('services')
                .select(db.fn.count('id').as('count'))
                .where('department_id', '=', dept.id)
                .executeTakeFirst();
            return {
                ...dept,
                doctor_count: Number(doctorCount?.count) || 0,
                service_count: Number(serviceCount?.count) || 0
            };
        }));
        res.json(departmentsWithCounts);
    }
    catch (error) {
        console.error('Get public departments error:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});
app.get('/api/public/doctors', async (req, res) => {
    try {
        const doctors = await db.selectFrom('doctors')
            .leftJoin('departments', 'doctors.department_id', 'departments.id')
            .select([
            'doctors.id',
            'doctors.name',
            'doctors.email',
            'doctors.phone',
            'doctors.specialization',
            'doctors.department_id',
            'doctors.photo_url',
            'doctors.schedule',
            'doctors.created_at',
            'doctors.updated_at',
            'departments.name as department_name'
        ])
            .orderBy('doctors.name')
            .execute();
        res.json(doctors);
    }
    catch (error) {
        console.error('Get public doctors error:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});
app.get('/api/public/services', async (req, res) => {
    try {
        const services = await db.selectFrom('services')
            .leftJoin('departments', 'services.department_id', 'departments.id')
            .select([
            'services.id',
            'services.name',
            'services.description',
            'services.department_id',
            'services.created_at',
            'services.updated_at',
            'departments.name as department_name'
        ])
            .orderBy('services.name')
            .execute();
        res.json(services);
    }
    catch (error) {
        console.error('Get public services error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Export a function to start the server
export async function startServer(port) {
    try {
        if (process.env.NODE_ENV === 'production') {
            setupStaticServing(app);
        }
        app.listen(port, () => {
            console.log(`API Server running on port ${port}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Starting server...');
    startServer(Number(process.env.PORT) || 3001);
}
