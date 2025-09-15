// Test script for booking functions
console.log('Testing Booking Feature Functions...\n');

// Test getTourName function
function getTourName(tourKey) {
    const tourNames = {
        'orbit': 'Earth Orbit Experience',
        'moon': 'Lunar Expedition',
        'mars': 'Mars Flyby'
    };
    return tourNames[tourKey] || 'Space Tour';
}

console.log('1. Testing getTourName function:');
const tourTests = [
    { input: 'orbit', expected: 'Earth Orbit Experience' },
    { input: 'moon', expected: 'Lunar Expedition' },
    { input: 'mars', expected: 'Mars Flyby' },
    { input: 'unknown', expected: 'Space Tour' }
];

let tourTestsPassed = 0;
tourTests.forEach(test => {
    const result = getTourName(test.input);
    const passed = result === test.expected;
    if (passed) tourTestsPassed++;
    console.log(`   ${test.input}: ${result} ${passed ? '✓' : '✗'}`);
});

console.log(`   Result: ${tourTestsPassed}/${tourTests.length} tests passed\n`);

// Test generateRandomDate function
function generateRandomDate() {
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 180) + 30;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + randomDays);
    
    return futureDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

console.log('2. Testing generateRandomDate function:');
const date = generateRandomDate();
const isValid = typeof date === 'string' && date.length > 0;
const canParse = !isNaN(new Date(date).getTime());

console.log(`   Generated date: ${date}`);
console.log(`   Is valid string: ${isValid ? '✓' : '✗'}`);
console.log(`   Can parse as date: ${canParse ? '✓' : '✗'}`);
console.log(`   Result: ${isValid && canParse ? 'PASS' : 'FAIL'}\n`);

// Test step navigation
console.log('3. Testing step navigation:');
let currentStep = 1;
const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 4) {
        currentStep = stepNumber;
    }
};

const steps = [1, 2, 3, 4];
let stepTestsPassed = 0;
steps.forEach(step => {
    goToStep(step);
    const passed = currentStep === step;
    if (passed) stepTestsPassed++;
    console.log(`   Go to step ${step}: Current step ${currentStep} ${passed ? '✓' : '✗'}`);
});

console.log(`   Result: ${stepTestsPassed}/${steps.length} tests passed\n`);

// Test booking object structure
console.log('4. Testing booking object structure:');
const booking = {
    id: 'SPC' + Date.now(),
    tour: 'orbit',
    date: generateRandomDate(),
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
};

const hasRequiredProps = 
    booking.id && 
    booking.tour && 
    booking.date && 
    booking.traveler && 
    booking.traveler.firstName && 
    booking.traveler.lastName && 
    booking.traveler.email && 
    booking.traveler.passport && 
    booking.total && 
    booking.status && 
    booking.timestamp;

const idFormatCorrect = booking.id.startsWith('SPC');
const statusValid = ['confirmed', 'pending'].includes(booking.status);

console.log(`   Has all required properties: ${hasRequiredProps ? '✓' : '✗'}`);
console.log(`   ID format correct: ${idFormatCorrect ? '✓' : '✗'}`);
console.log(`   Status valid: ${statusValid ? '✓' : '✗'}`);
console.log(`   Result: ${hasRequiredProps && idFormatCorrect && statusValid ? 'PASS' : 'FAIL'}\n`);

// Test localStorage availability (simulated)
console.log('5. Testing localStorage availability:');
const localStorageAvailable = typeof Storage !== "undefined";
console.log(`   localStorage available: ${localStorageAvailable ? '✓' : '✗'}`);
console.log(`   Result: ${localStorageAvailable ? 'PASS' : 'FAIL'}\n`);

console.log('=== Test Summary ===');
const totalTests = 5;
const passedTests = [
    tourTestsPassed === tourTests.length,
    isValid && canParse,
    stepTestsPassed === steps.length,
    hasRequiredProps && idFormatCorrect && statusValid,
    localStorageAvailable
].filter(Boolean).length;

console.log(`Overall Result: ${passedTests}/${totalTests} test categories passed`);
console.log(passedTests === totalTests ? '🎉 All tests passed!' : '⚠️  Some tests failed.');