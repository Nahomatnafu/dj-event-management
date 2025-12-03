import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            email: 'admin@completeweddings.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin',
            serviceCategory: null,
            status: 'active',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'sarah.johnson@completeweddings.com',
            password: 'staff123',
            name: 'Sarah Johnson',
            role: 'staff',
            serviceCategory: 'DJ',
            status: 'active',
            createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'mike.chen@completeweddings.com',
            password: 'staff123',
            name: 'Mike Chen',
            role: 'staff',
            serviceCategory: 'Videographer',
            status: 'active',
            createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'emily.rodriguez@completeweddings.com',
            password: 'staff123',
            name: 'Emily Rodriguez',
            role: 'staff',
            serviceCategory: 'Photographer',
            status: 'active',
            createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'david.kim@completeweddings.com',
            password: 'staff123',
            name: 'David Kim',
            role: 'staff',
            serviceCategory: 'DJ',
            status: 'active',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'jessica.martinez@completeweddings.com',
            password: 'staff123',
            name: 'Jessica Martinez',
            role: 'staff',
            serviceCategory: 'Videographer',
            status: 'active',
            createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'tom.wilson@completeweddings.com',
            password: 'staff123',
            name: 'Tom Wilson',
            role: 'staff',
            serviceCategory: 'Photographer',
            status: 'active',
            createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});