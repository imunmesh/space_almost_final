// Integration Tests for Enhanced Booking Feature
describe('Enhanced Booking Feature Integration', () => {
    beforeEach(() => {
        // Set up DOM elements that the booking system depends on
        document.body.innerHTML = `
            <div id="step1" class="booking-step active">
                <div class="tour-card" data-tour="orbit">
                    <button class="book-now">Book Now</button>
                    <div class="seats-available">8 seats available</div>
                </div>
            </div>
            <div id="step2" class="booking-step hidden">
                <form class="booking-form">
                    <input id="firstName" value="John">
                    <input id="lastName" value="Doe">
                    <input id="email" value="john@example.com">
                    <input id="age" value="30">
                    <input id="passport" value="P12345678">
                    <input id="health1" type="checkbox" checked>
                    <input id="health2" type="checkbox" checked>
                    <input id="health3" type="checkbox" checked>
                    <input id="health4" type="checkbox" checked>
                    <button type="button" id="proceedToSummary">Proceed</button>
                </form>
            </div>
            <div id="step3" class="booking-step hidden">
                <div id="summaryTour">Earth Orbit Experience</div>
                <div id="summaryDuration">5 days</div>
                <div id="summaryDate">June 15, 2024</div>
                <div id="tourPrice">$250,000</div>
                <div id="summaryName">John Doe</div>
                <div id="summaryEmail">john@example.com</div>
                <div id="summaryPassport">P12345678</div>
                <div id="totalCost">$277,500</div>
                <button id="confirmPayment">Confirm Payment</button>
            </div>
            <div id="step4" class="booking-step hidden">
                <div id="confirmTour">Earth Orbit Experience</div>
                <div id="confirmName">John Doe</div>
                <div id="confirmDate">June 15, 2024</div>
                <div id="confirmAmount">$277,500</div>
                <div id="bookingId">SPC123456789</div>
                <div id="bookingStatus">Confirmed</div>
                <button id="downloadTicket">Download Ticket</button>
                <button id="sendToEmail">Send to Email</button>
                <button id="newBooking">Book Another Tour</button>
            </div>
            <div class="step" data-step="1"></div>
            <div class="step" data-step="2"></div>
            <div class="step" data-step="3"></div>
            <div class="step" data-step="4"></div>
            <button id="viewBookingsBtn">View My Bookings (0)</button>
            <button id="manageBookings">Manage Bookings</button>
        `;
    });

    test('should initialize enhanced booking system', () => {
        const bookingSystem = new SpaceTourBooking();
        expect(bookingSystem).toBeTruthy();
        expect(bookingSystem.currentStep).toBe(1);
        expect(Array.isArray(bookingSystem.bookings)).toBe(true);
    });

    test('should handle real-time availability updates', () => {
        const bookingSystem = new SpaceTourBooking();
        const tourCard = document.querySelector('.tour-card');
        
        // Mock the updateTourAvailability method
        bookingSystem.updateTourAvailability = jest.fn();
        
        bookingSystem.selectTour(tourCard);
        expect(bookingSystem.selectedTour).toBe('orbit');
        expect(bookingSystem.updateTourAvailability).toHaveBeenCalledWith(tourCard);
    });

    test('should generate random dates', () => {
        const bookingSystem = new SpaceTourBooking();
        const date = bookingSystem.generateRandomDate();
        
        expect(typeof date).toBe('string');
        expect(date.length).toBeGreaterThan(0);
        // Check if it's a valid date string
        expect(() => new Date(date)).not.toThrow();
    });

    test('should manage bookings', () => {
        // Mock localStorage
        const mockBookings = [{
            id: 'SPC123456789',
            tour: 'orbit',
            date: 'June 15, 2024',
            traveler: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '123-456-7890',
                age: 30,
                passport: 'P12345678'
            },
            total: '$277,500',
            status: 'confirmed',
            timestamp: new Date().toISOString()
        }];
        
        localStorage.setItem('spaceTourBookings', JSON.stringify(mockBookings));
        
        const bookingSystem = new SpaceTourBooking();
        bookingSystem.loadBookings();
        
        expect(bookingSystem.bookings.length).toBe(1);
        expect(bookingSystem.bookings[0].id).toBe('SPC123456789');
    });

    test('should handle booking confirmation', () => {
        const bookingSystem = new SpaceTourBooking();
        
        // Set up required data
        bookingSystem.selectedTour = 'orbit';
        bookingSystem.travelerDetails = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            age: 30,
            passport: 'P12345678'
        };
        
        // Mock DOM elements
        document.getElementById = jest.fn().mockImplementation((id) => {
            const elements = {
                'confirmDate': { textContent: 'June 15, 2024' },
                'confirmAmount': { textContent: '$277,500' },
                'bookingId': { textContent: 'SPC123456789' },
                'bookingStatus': { textContent: 'Confirmed' },
                'confirmPayment': {
                    innerHTML: '<i class="fas fa-lock"></i> Confirm Payment',
                    disabled: false
                }
            };
            return elements[id] || { textContent: '', innerHTML: '', disabled: false };
        });
        
        // Mock localStorage
        Storage.prototype.setItem = jest.fn();
        
        // Mock showNotification to prevent DOM manipulation
        bookingSystem.showNotification = jest.fn();
        
        // Mock goToStep
        bookingSystem.goToStep = jest.fn();
        
        bookingSystem.confirmBooking();
        
        // Fast-forward the timer
        jest.advanceTimersByTime(2000);
        
        // Check that localStorage was called
        expect(localStorage.setItem).toHaveBeenCalledWith('spaceTourBookings', expect.any(String));
        
        // Check that goToStep was called
        expect(bookingSystem.goToStep).toHaveBeenCalledWith(4);
    });

    test('should handle ticket download', () => {
        const bookingSystem = new SpaceTourBooking();
        
        // Mock required DOM methods
        document.createElement = jest.fn().mockImplementation((tag) => {
            return {
                tagName: tag.toUpperCase(),
                style: {},
                setAttribute: jest.fn(),
                appendChild: jest.fn(),
                click: jest.fn(),
                remove: jest.fn()
            };
        });
        
        URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
        URL.revokeObjectURL = jest.fn();
        
        // Mock showNotification
        bookingSystem.showNotification = jest.fn();
        
        // Test with current booking
        bookingSystem.selectedTour = 'orbit';
        bookingSystem.travelerDetails = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            passport: 'P12345678'
        };
        
        document.getElementById = jest.fn().mockImplementation((id) => {
            const elements = {
                'bookingId': { textContent: 'SPC123456789' },
                'confirmDate': { textContent: 'June 15, 2024' },
                'confirmAmount': { textContent: '$277,500' },
                'bookingStatus': { textContent: 'confirmed' }
            };
            return elements[id] || { textContent: '' };
        });
        
        bookingSystem.downloadTicket();
        
        expect(bookingSystem.showNotification).toHaveBeenCalledWith('Ticket downloaded successfully!', 'success');
    });
});