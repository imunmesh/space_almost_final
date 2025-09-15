// Space Tour Booking System
class SpaceTourBooking {
    constructor() {
        this.currentStep = 1;
        this.selectedTour = null;
        this.travelerDetails = {};
        this.bookings = JSON.parse(localStorage.getItem('spaceTourBookings')) || [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.loadBookings();
            });
        } else {
            this.setupEventListeners();
            this.loadBookings();
        }
    }

    setupEventListeners() {
        // Tour selection
        const tourCards = document.querySelectorAll('.tour-card');
        tourCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!card.classList.contains('disabled')) {
                    this.selectTour(card);
                }
            });
        });

        // Book now buttons
        const bookNowButtons = document.querySelectorAll('.book-now');
        bookNowButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const tourCard = button.closest('.tour-card');
                if (!tourCard.classList.contains('disabled')) {
                    this.selectTour(tourCard);
                    this.nextStep();
                }
            });
        });

        // Navigation buttons
        document.getElementById('backToTours').addEventListener('click', () => this.previousStep());
        document.getElementById('proceedToSummary').addEventListener('click', () => this.nextStep());
        document.getElementById('backToDetails').addEventListener('click', () => this.previousStep());
        document.getElementById('confirmPayment').addEventListener('click', () => this.confirmBooking());
        document.getElementById('newBooking').addEventListener('click', () => this.resetBooking());
        document.getElementById('viewBookingsBtn').addEventListener('click', () => this.viewBookings());
        document.getElementById('downloadTicket').addEventListener('click', () => this.downloadTicket());
        document.getElementById('sendToEmail').addEventListener('click', () => this.sendToEmail());

        // Form validation
        const form = document.querySelector('.booking-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateTravelerDetails();
            });
        }

        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                paymentMethods.forEach(m => m.classList.remove('selected'));
                method.classList.add('selected');
            });
        });

        // Step navigation
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.addEventListener('click', () => {
                const stepNumber = parseInt(step.getAttribute('data-step'));
                if (stepNumber <= this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });

        // Booking management
        document.getElementById('manageBookings').addEventListener('click', () => this.showBookingManagement());
        document.getElementById('cancelBooking').addEventListener('click', () => this.cancelBooking());
        document.getElementById('modifyBooking').addEventListener('click', () => this.modifyBooking());
    }

    selectTour(tourCard) {
        // Remove selection from all cards
        document.querySelectorAll('.tour-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select clicked card
        tourCard.classList.add('selected');
        this.selectedTour = tourCard.getAttribute('data-tour');
        
        // Update availability in real-time
        this.updateTourAvailability(tourCard);
    }

    updateTourAvailability(tourCard) {
        // Simulate real-time availability checking
        const tourType = tourCard.getAttribute('data-tour');
        const availabilityElement = tourCard.querySelector('.seats-available') || tourCard.querySelector('.seats-full');
        
        if (availabilityElement) {
            // Simulate API call to check availability
            setTimeout(() => {
                let seatsAvailable;
                switch(tourType) {
                    case 'orbit':
                        seatsAvailable = Math.floor(Math.random() * 5) + 5; // 5-9 seats
                        break;
                    case 'moon':
                        seatsAvailable = Math.floor(Math.random() * 3) + 2; // 2-4 seats
                        break;
                    case 'mars':
                        seatsAvailable = Math.floor(Math.random() * 2); // 0-1 seats
                        break;
                    default:
                        seatsAvailable = 8;
                }
                
                if (seatsAvailable > 0) {
                    availabilityElement.textContent = `${seatsAvailable} seats available`;
                    availabilityElement.className = 'seats-available';
                    const bookButton = tourCard.querySelector('.book-now');
                    if (bookButton) {
                        bookButton.disabled = false;
                        bookButton.classList.remove('btn-secondary');
                        bookButton.classList.add('btn-primary');
                        bookButton.textContent = 'Book Now';
                    }
                } else {
                    availabilityElement.textContent = 'FULLY BOOKED';
                    availabilityElement.className = 'seats-full';
                    const bookButton = tourCard.querySelector('.book-now');
                    if (bookButton) {
                        bookButton.disabled = true;
                        bookButton.classList.remove('btn-primary');
                        bookButton.classList.add('btn-secondary');
                        bookButton.textContent = 'Notify When Available';
                    }
                }
            }, 500);
        }
    }

    nextStep() {
        if (this.currentStep === 2) {
            if (!this.validateTravelerDetails()) {
                return;
            }
        }

        if (this.currentStep < 4) {
            this.goToStep(this.currentStep + 1);
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    goToStep(stepNumber) {
        // Update current step
        this.currentStep = stepNumber;

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            const stepNum = index + 1;
            if (stepNum === stepNumber) {
                step.classList.add('active');
            } else if (stepNum < stepNumber) {
                step.classList.add('completed');
            }
        });

        // Show current step content
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.add('hidden');
        });
        document.getElementById(`step${stepNumber}`).classList.remove('hidden');

        // Update summary if moving to step 3
        if (stepNumber === 3) {
            this.updateBookingSummary();
        }
    }

    validateTravelerDetails() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const age = document.getElementById('age').value.trim();
        const passport = document.getElementById('passport').value.trim();

        // Basic validation
        if (!firstName || !lastName || !email || !age || !passport) {
            this.showNotification('Please fill in all required fields.', 'error');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            return false;
        }

        // Age validation
        const ageNum = parseInt(age);
        if (ageNum < 18 || ageNum > 75) {
            this.showNotification('Age must be between 18 and 75.', 'error');
            return false;
        }

        // Store traveler details
        this.travelerDetails = {
            firstName,
            lastName,
            email,
            phone: document.getElementById('phone').value.trim(),
            age: ageNum,
            passport,
            address: document.getElementById('address').value.trim()
        };

        // Health declaration validation
        const healthCheckboxes = [
            document.getElementById('health1'),
            document.getElementById('health2'),
            document.getElementById('health3'),
            document.getElementById('health4')
        ];

        const allChecked = healthCheckboxes.every(checkbox => checkbox.checked);
        if (!allChecked) {
            this.showNotification('Please confirm all health declarations.', 'error');
            return false;
        }

        this.showNotification('Traveler details validated successfully.', 'success');
        return true;
    }

    updateBookingSummary() {
        // Get tour details based on selection
        let tourName, tourDuration, tourPrice;
        switch (this.selectedTour) {
            case 'orbit':
                tourName = 'Earth Orbit Experience';
                tourDuration = '5 days';
                tourPrice = '$250,000';
                break;
            case 'moon':
                tourName = 'Lunar Expedition';
                tourDuration = '12 days';
                tourPrice = '$1,200,000';
                break;
            case 'mars':
                tourName = 'Mars Flyby';
                tourDuration = '45 days';
                tourPrice = '$5,000,000';
                break;
            default:
                tourName = 'Space Tour';
                tourDuration = '5 days';
                tourPrice = '$250,000';
        }

        // Update tour details
        document.getElementById('summaryTour').textContent = tourName;
        document.getElementById('summaryDuration').textContent = tourDuration;
        document.getElementById('summaryDate').textContent = this.generateRandomDate();
        document.getElementById('tourPrice').textContent = tourPrice;

        // Update traveler details
        document.getElementById('summaryName').textContent = 
            `${this.travelerDetails.firstName} ${this.travelerDetails.lastName}`;
        document.getElementById('summaryEmail').textContent = this.travelerDetails.email;
        document.getElementById('summaryPassport').textContent = this.travelerDetails.passport;

        // Update confirmation details
        document.getElementById('confirmTour').textContent = tourName;
        document.getElementById('confirmName').textContent = 
            `${this.travelerDetails.firstName} ${this.travelerDetails.lastName}`;
        document.getElementById('confirmDate').textContent = this.generateRandomDate();

        // Update total cost
        let totalCost;
        switch (this.selectedTour) {
            case 'orbit':
                totalCost = '$277,500';
                document.getElementById('confirmAmount').textContent = totalCost;
                break;
            case 'moon':
                totalCost = '$1,320,000';
                document.getElementById('confirmAmount').textContent = totalCost;
                break;
            case 'mars':
                totalCost = '$5,500,000';
                document.getElementById('confirmAmount').textContent = totalCost;
                break;
            default:
                totalCost = '$277,500';
                document.getElementById('confirmAmount').textContent = totalCost;
        }
        document.getElementById('totalCost').textContent = totalCost;
    }

    generateRandomDate() {
        // Generate a random date within the next 6 months
        const today = new Date();
        const randomDays = Math.floor(Math.random() * 180) + 30; // 30-210 days from now
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + randomDays);
        
        return futureDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    confirmBooking() {
        // Simulate payment processing
        const paymentBtn = document.getElementById('confirmPayment');
        const originalText = paymentBtn.innerHTML;
        paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        paymentBtn.disabled = true;

        // Simulate API call delay
        setTimeout(() => {
            // Reset button
            paymentBtn.innerHTML = originalText;
            paymentBtn.disabled = false;

            // Create booking object
            const booking = {
                id: 'SPC' + Date.now(),
                tour: this.selectedTour,
                date: document.getElementById('confirmDate').textContent,
                traveler: {
                    firstName: this.travelerDetails.firstName,
                    lastName: this.travelerDetails.lastName,
                    email: this.travelerDetails.email,
                    phone: this.travelerDetails.phone,
                    age: this.travelerDetails.age,
                    passport: this.travelerDetails.passport
                },
                total: document.getElementById('confirmAmount').textContent,
                status: 'confirmed',
                timestamp: new Date().toISOString()
            };

            // Add to bookings
            this.bookings.push(booking);
            localStorage.setItem('spaceTourBookings', JSON.stringify(this.bookings));

            // Show success message
            this.showNotification('Payment processed successfully! Your booking is confirmed.', 'success');

            // Move to confirmation step
            this.goToStep(4);
            
            // Update confirmation details
            document.getElementById('bookingId').textContent = booking.id;
            document.getElementById('bookingStatus').textContent = 'Confirmed';
        }, 2000);
    }

    resetBooking() {
        // Reset form
        document.querySelector('.booking-form').reset();

        // Reset selections
        document.querySelectorAll('.tour-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Reset payment methods
        document.querySelectorAll('.payment-method').forEach((method, index) => {
            method.classList.toggle('selected', index === 0);
        });

        // Go back to step 1
        this.goToStep(1);
    }

    viewBookings() {
        this.showBookingManagement();
    }

    showBookingManagement() {
        // Create booking management modal
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="booking-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-list"></i> My Bookings</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.bookings.length > 0 ? `
                        <div class="bookings-list">
                            ${this.bookings.map(booking => `
                                <div class="booking-item" data-booking-id="${booking.id}">
                                    <div class="booking-info">
                                        <h3>${this.getTourName(booking.tour)}</h3>
                                        <p><i class="fas fa-calendar"></i> ${booking.date}</p>
                                        <p><i class="fas fa-user"></i> ${booking.traveler.firstName} ${booking.traveler.lastName}</p>
                                        <p><i class="fas fa-dollar-sign"></i> ${booking.total}</p>
                                        <p class="booking-status ${booking.status}">
                                            <i class="fas fa-check-circle"></i> ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </p>
                                    </div>
                                    <div class="booking-actions">
                                        <button class="btn btn-outline download-ticket" data-booking-id="${booking.id}">
                                            <i class="fas fa-download"></i> Download
                                        </button>
                                        <button class="btn btn-secondary modify-booking" data-booking-id="${booking.id}">
                                            <i class="fas fa-edit"></i> Modify
                                        </button>
                                        <button class="btn btn-danger cancel-booking" data-booking-id="${booking.id}">
                                            <i class="fas fa-times"></i> Cancel
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="no-bookings">
                            <i class="fas fa-ticket-alt"></i>
                            <h3>No Bookings Found</h3>
                            <p>You haven't made any bookings yet.</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .booking-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .booking-modal-content {
                background: linear-gradient(145deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9));
                border-radius: 20px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(0, 255, 136, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .modal-header h2 {
                margin: 0;
                color: var(--plasma-green);
                font-family: 'Orbitron', monospace;
            }
            
            .close-modal {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .close-modal:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .bookings-list {
                display: grid;
                gap: 20px;
            }
            
            .booking-item {
                background: rgba(26, 26, 46, 0.7);
                border-radius: 15px;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .booking-info h3 {
                color: var(--plasma-green);
                margin-bottom: 10px;
            }
            
            .booking-info p {
                margin: 5px 0;
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .booking-status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 20px;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.8rem;
                margin-top: 10px;
            }
            
            .booking-status.confirmed {
                background: rgba(0, 255, 136, 0.2);
                color: var(--plasma-green);
            }
            
            .booking-status.pending {
                background: rgba(255, 215, 0, 0.2);
                color: var(--warning-yellow);
            }
            
            .booking-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .no-bookings {
                text-align: center;
                padding: 40px 20px;
                color: var(--text-secondary);
            }
            
            .no-bookings i {
                font-size: 3rem;
                margin-bottom: 20px;
                color: var(--text-muted);
            }
            
            .no-bookings h3 {
                color: var(--text-primary);
                margin-bottom: 10px;
            }
            
            @media (max-width: 768px) {
                .booking-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .booking-actions {
                    flex-direction: row;
                    width: 100%;
                    margin-top: 20px;
                }
                
                .booking-actions .btn {
                    flex: 1;
                }
            }
        `;

        document.head.appendChild(modalStyles);
        document.body.appendChild(modal);

        // Add event listeners for modal actions
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(modalStyles);
        });

        // Add event listeners for booking actions
        modal.querySelectorAll('.download-ticket').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.download-ticket').getAttribute('data-booking-id');
                this.downloadTicket(bookingId);
            });
        });

        modal.querySelectorAll('.cancel-booking').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.cancel-booking').getAttribute('data-booking-id');
                this.cancelBooking(bookingId, modal, modalStyles);
            });
        });

        modal.querySelectorAll('.modify-booking').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.modify-booking').getAttribute('data-booking-id');
                this.modifyBooking(bookingId);
                document.body.removeChild(modal);
                document.head.removeChild(modalStyles);
            });
        });
    }

    getTourName(tourKey) {
        const tourNames = {
            'orbit': 'Earth Orbit Experience',
            'moon': 'Lunar Expedition',
            'mars': 'Mars Flyby'
        };
        return tourNames[tourKey] || 'Space Tour';
    }

    downloadTicket(bookingId) {
        // If bookingId is provided, find the booking, otherwise use current booking
        let booking;
        if (bookingId) {
            booking = this.bookings.find(b => b.id === bookingId);
        } else {
            // For current booking in step 4
            booking = {
                id: document.getElementById('bookingId').textContent,
                tour: this.selectedTour,
                date: document.getElementById('confirmDate').textContent,
                traveler: this.travelerDetails,
                total: document.getElementById('confirmAmount').textContent,
                status: 'confirmed'
            };
        }

        if (!booking) {
            this.showNotification('Booking not found.', 'error');
            return;
        }

        // Create ticket content
        const ticketContent = `
ASTROHELP SPACE TOUR TICKET
============================
Booking ID: ${booking.id}
Tour: ${this.getTourName(booking.tour)}
Date: ${booking.date}
Traveler: ${booking.traveler.firstName} ${booking.traveler.lastName}
Email: ${booking.traveler.email}
Passport: ${booking.traveler.passport}
Total Paid: ${booking.total}
Status: ${booking.status.toUpperCase()}

IMPORTANT INFORMATION:
- Please arrive at the spaceport 2 hours before departure
- Bring your passport and this ticket
- Follow all safety instructions from crew members
- Enjoy your space adventure!

For assistance, contact: support@astrohelp.com
        `;

        // Create and download file
        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `astrohelp-ticket-${booking.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Ticket downloaded successfully!', 'success');
    }

    sendToEmail() {
        const email = this.travelerDetails.email;
        if (!email) {
            this.showNotification('No email address provided.', 'error');
            return;
        }

        // Simulate sending email
        this.showNotification(`Ticket sent to ${email}`, 'success');
    }

    cancelBooking(bookingId, modal, modalStyles) {
        if (!bookingId) {
            this.showNotification('No booking selected for cancellation.', 'error');
            return;
        }

        // Find and remove booking
        const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            const booking = this.bookings[bookingIndex];
            // Show confirmation dialog
            if (confirm(`Are you sure you want to cancel your booking for ${this.getTourName(booking.tour)}?`)) {
                this.bookings.splice(bookingIndex, 1);
                localStorage.setItem('spaceTourBookings', JSON.stringify(this.bookings));
                
                // Close modal and show notification
                if (modal && modalStyles) {
                    document.body.removeChild(modal);
                    document.head.removeChild(modalStyles);
                }
                
                this.showNotification('Booking cancelled successfully.', 'success');
                this.loadBookings(); // Refresh bookings display
            }
        } else {
            this.showNotification('Booking not found.', 'error');
        }
    }

    modifyBooking(bookingId) {
        if (!bookingId) {
            this.showNotification('No booking selected for modification.', 'error');
            return;
        }

        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) {
            this.showNotification('Booking not found.', 'error');
            return;
        }

        // Pre-fill form with booking details
        document.getElementById('firstName').value = booking.traveler.firstName;
        document.getElementById('lastName').value = booking.traveler.lastName;
        document.getElementById('email').value = booking.traveler.email;
        document.getElementById('phone').value = booking.traveler.phone || '';
        document.getElementById('age').value = booking.traveler.age;
        document.getElementById('passport').value = booking.traveler.passport;
        document.getElementById('address').value = booking.traveler.address || '';

        // Select the tour
        this.selectedTour = booking.tour;
        document.querySelectorAll('.tour-card').forEach(card => {
            card.classList.remove('selected');
            if (card.getAttribute('data-tour') === booking.tour) {
                card.classList.add('selected');
            }
        });

        // Go to step 2
        this.goToStep(2);
        this.showNotification('Booking loaded for modification. Update details and proceed.', 'info');
    }

    loadBookings() {
        // Load bookings from localStorage
        this.bookings = JSON.parse(localStorage.getItem('spaceTourBookings')) || [];
        
        // Update bookings count in UI
        const bookingsBtn = document.getElementById('viewBookingsBtn');
        if (bookingsBtn) {
            bookingsBtn.innerHTML = `<i class="fas fa-list"></i> View My Bookings (${this.bookings.length})`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#3742fa'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease forwards;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Remove notification after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize booking system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.spaceTourBooking = new SpaceTourBooking();
});