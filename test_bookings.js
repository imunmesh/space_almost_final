// Test script to populate some sample bookings for testing the management dashboard
function createTestBookings() {
    const testBookings = [
        {
            id: 'SPC2024001',
            tour: 'orbit',
            date: 'June 15, 2024',
            traveler: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                age: 35,
                passport: 'P12345678'
            },
            total: '$277,500',
            status: 'confirmed',
            timestamp: new Date().toISOString()
        },
        {
            id: 'SPC2024002',
            tour: 'moon',
            date: 'July 22, 2024',
            traveler: {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1987654321',
                age: 28,
                passport: 'P87654321'
            },
            total: '$1,320,000',
            status: 'confirmed',
            timestamp: new Date(Date.now() - 86400000).toISOString() // Yesterday
        },
        {
            id: 'SPC2024003',
            tour: 'orbit',
            date: 'June 30, 2024',
            traveler: {
                firstName: 'Robert',
                lastName: 'Johnson',
                email: 'robert.j@example.com',
                phone: '+1555666777',
                age: 42,
                passport: 'P11223344'
            },
            total: '$277,500',
            status: 'pending',
            timestamp: new Date().toISOString()
        }
    ];

    // Save to localStorage
    localStorage.setItem('spaceTourBookings', JSON.stringify(testBookings));
    console.log('Test bookings created successfully');
}

// Run the function
createTestBookings();