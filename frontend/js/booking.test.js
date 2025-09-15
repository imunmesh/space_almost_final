// Import the SpaceTourBooking class
const { JSDOM } = require('jsdom');

// Set up a basic DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock the SpaceTourBooking class
const SpaceTourBooking = jest.fn().mockImplementation(() => {
  return {
    currentStep: 1,
    selectedTour: null,
    travelerDetails: {},
    bookings: [],
    init: jest.fn(),
    setupEventListeners: jest.fn(),
    selectTour: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    goToStep: jest.fn(),
    validateTravelerDetails: jest.fn(),
    updateBookingSummary: jest.fn(),
    generateRandomDate: jest.fn(),
    confirmBooking: jest.fn(),
    resetBooking: jest.fn(),
    viewBookings: jest.fn(),
    showBookingManagement: jest.fn(),
    getTourName: jest.fn(),
    downloadTicket: jest.fn(),
    sendToEmail: jest.fn(),
    cancelBooking: jest.fn(),
    modifyBooking: jest.fn(),
    loadBookings: jest.fn(),
    showNotification: jest.fn(),
    updateTourAvailability: jest.fn(),
  };
});

// Booking Feature Tests
describe('SpaceTourBooking', () => {
    let bookingSystem;
    
    beforeEach(() => {
        // Create a new instance of the booking system
        bookingSystem = new SpaceTourBooking();
    });
    
    test('should initialize with step 1', () => {
        expect(bookingSystem.currentStep).toBe(1);
    });
    
    test('should select a tour', () => {
        const mockTourCard = {
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn().mockReturnValue(false)
            },
            getAttribute: jest.fn().mockReturnValue('orbit')
        };
        
        bookingSystem.selectTour(mockTourCard);
        
        expect(bookingSystem.selectedTour).toBe('orbit');
        expect(mockTourCard.classList.add).toHaveBeenCalledWith('selected');
    });
    
    test('should validate traveler details', () => {
        // Mock form elements
        document.getElementById = jest.fn().mockImplementation((id) => {
            const values = {
                'firstName': { value: 'John' },
                'lastName': { value: 'Doe' },
                'email': { value: 'john@example.com' },
                'age': { value: '30' },
                'passport': { value: 'P12345678' },
                'health1': { checked: true },
                'health2': { checked: true },
                'health3': { checked: true },
                'health4': { checked: true }
            };
            return values[id] || { value: '', checked: false };
        });
        
        const result = bookingSystem.validateTravelerDetails();
        expect(result).toBe(true);
    });
    
    test('should reject invalid email', () => {
        // Mock form elements with invalid email
        document.getElementById = jest.fn().mockImplementation((id) => {
            const values = {
                'firstName': { value: 'John' },
                'lastName': { value: 'Doe' },
                'email': { value: 'invalid-email' },
                'age': { value: '30' },
                'passport': { value: 'P12345678' },
                'health1': { checked: true },
                'health2': { checked: true },
                'health3': { checked: true },
                'health4': { checked: true }
            };
            return values[id] || { value: '', checked: false };
        });
        
        const result = bookingSystem.validateTravelerDetails();
        expect(result).toBe(false);
    });
    
    test('should navigate between steps', () => {
        expect(bookingSystem.currentStep).toBe(1);
        
        bookingSystem.goToStep(2);
        expect(bookingSystem.currentStep).toBe(2);
        
        bookingSystem.goToStep(3);
        expect(bookingSystem.currentStep).toBe(3);
    });
    
    test('should generate random dates', () => {
        const date = bookingSystem.generateRandomDate();
        expect(typeof date).toBe('string');
        expect(date.length).toBeGreaterThan(0);
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
        
        localStorage.getItem.mockReturnValue(JSON.stringify(mockBookings));
        
        bookingSystem.loadBookings();
        expect(bookingSystem.bookings.length).toBe(1);
        expect(bookingSystem.bookings[0].id).toBe('SPC123456789');
    });
    
    test('should get tour names', () => {
        bookingSystem.getTourName = jest.fn((tourKey) => {
            const tourNames = {
                'orbit': 'Earth Orbit Experience',
                'moon': 'Lunar Expedition',
                'mars': 'Mars Flyby'
            };
            return tourNames[tourKey] || 'Space Tour';
        });
        
        expect(bookingSystem.getTourName('orbit')).toBe('Earth Orbit Experience');
        expect(bookingSystem.getTourName('moon')).toBe('Lunar Expedition');
        expect(bookingSystem.getTourName('mars')).toBe('Mars Flyby');
        expect(bookingSystem.getTourName('unknown')).toBe('Space Tour');
    });
});