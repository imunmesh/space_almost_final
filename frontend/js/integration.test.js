// Integration Tests for Booking Feature
describe('Booking Feature Integration', () => {
    beforeEach(() => {
        // Set up DOM elements that the booking system depends on
        document.body.innerHTML = `
            <div id="step1" class="booking-step active">
                <div class="tour-card" data-tour="orbit">
                    <button class="book-now">Book Now</button>
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
            <div id="step3" class="booking-step hidden"></div>
            <div id="step4" class="booking-step hidden"></div>
            <div class="step" data-step="1"></div>
            <div class="step" data-step="2"></div>
            <div class="step" data-step="3"></div>
            <div class="step" data-step="4"></div>
        `;
    });

    test('should initialize booking system', () => {
        const bookingSystem = new SpaceTourBooking();
        expect(bookingSystem).toBeTruthy();
        expect(bookingSystem.currentStep).toBe(1);
    });

    test('should navigate through booking steps', () => {
        const bookingSystem = new SpaceTourBooking();
        
        // Test step navigation
        bookingSystem.goToStep(2);
        expect(bookingSystem.currentStep).toBe(2);
        
        bookingSystem.goToStep(3);
        expect(bookingSystem.currentStep).toBe(3);
        
        bookingSystem.goToStep(4);
        expect(bookingSystem.currentStep).toBe(4);
    });

    test('should validate traveler details', () => {
        const bookingSystem = new SpaceTourBooking();
        
        // Mock showNotification to prevent DOM manipulation
        bookingSystem.showNotification = jest.fn();
        
        const result = bookingSystem.validateTravelerDetails();
        expect(result).toBe(true);
    });

    test('should handle tour selection', () => {
        const bookingSystem = new SpaceTourBooking();
        const tourCard = document.querySelector('.tour-card');
        
        bookingSystem.selectTour(tourCard);
        expect(bookingSystem.selectedTour).toBe('orbit');
    });
});