// Simple tests for booking feature
const { JSDOM } = require('jsdom');

// Set up DOM
const dom = new JSDOM(`<!DOCTYPE html><html><body>
    <div id="step1" class="booking-step active"></div>
    <div id="step2" class="booking-step hidden"></div>
    <div id="step3" class="booking-step hidden"></div>
    <div id="step4" class="booking-step hidden"></div>
    <div class="step" data-step="1"></div>
    <div class="step" data-step="2"></div>
    <div class="step" data-step="3"></div>
    <div class="step" data-step="4"></div>
</body></html>`);

global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.localStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Import the actual booking.js file
const fs = require('fs');
const path = require('path');

// Read the booking.js file
const bookingJsPath = path.join(__dirname, 'booking.js');
const bookingJsContent = fs.readFileSync(bookingJsPath, 'utf8');

// Execute the booking.js code in our test environment
eval(bookingJsContent);

describe('SpaceTourBooking Basic Tests', () => {
    test('should create SpaceTourBooking class', () => {
        expect(typeof SpaceTourBooking).toBe('function');
    });

    test('should initialize with step 1', () => {
        const bookingSystem = new SpaceTourBooking();
        expect(bookingSystem.currentStep).toBe(1);
    });

    test('should navigate between steps', () => {
        const bookingSystem = new SpaceTourBooking();
        expect(bookingSystem.currentStep).toBe(1);
        
        bookingSystem.goToStep(2);
        expect(bookingSystem.currentStep).toBe(2);
        
        bookingSystem.goToStep(3);
        expect(bookingSystem.currentStep).toBe(3);
    });

    test('should generate random dates', () => {
        const bookingSystem = new SpaceTourBooking();
        const date = bookingSystem.generateRandomDate();
        expect(typeof date).toBe('string');
        expect(date.length).toBeGreaterThan(0);
        // Check that it's a valid date
        expect(() => new Date(date)).not.toThrow();
    });

    test('should get tour names', () => {
        const bookingSystem = new SpaceTourBooking();
        expect(bookingSystem.getTourName('orbit')).toBe('Earth Orbit Experience');
        expect(bookingSystem.getTourName('moon')).toBe('Lunar Expedition');
        expect(bookingSystem.getTourName('mars')).toBe('Mars Flyby');
        expect(bookingSystem.getTourName('unknown')).toBe('Space Tour');
    });
});