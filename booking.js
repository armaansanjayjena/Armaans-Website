// Booking/Scheduling Interface JavaScript - Shelters Realty
document.addEventListener('DOMContentLoaded', function() {
    
    let currentStep = 1;
    let bookingData = {
        property: {},
        agent: null,
        appointment: {},
        visitor: {}
    };
    
    // Initialize booking interface
    initializeBooking();
    
    function initializeBooking() {
        setupDatePicker();
        setupAgentSelection();
        setupTimeSlots();
        setupFormValidation();
        setupStepNavigation();
    }
    
    // Date picker setup
    function setupDatePicker() {
        const dateInput = document.getElementById('viewing-date');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Set minimum date to tomorrow
        dateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Set maximum date to 30 days from now
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 30);
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        dateInput.addEventListener('change', function() {
            updateTimeSlots();
            validateStep3();
        });
    }
    
    // Agent selection setup
    function setupAgentSelection() {
        const agentOptions = document.querySelectorAll('.agent-option');
        const nextBtn = document.getElementById('agent-next-btn');
        
        agentOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selection from all options
                agentOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked option
                this.classList.add('selected');
                
                // Store selected agent data
                const agentName = this.dataset.agent;
                const agentCard = this.querySelector('.agent-card');
                const name = agentCard.querySelector('.agent-name').textContent;
                const title = agentCard.querySelector('.agent-title').textContent;
                const specialty = agentCard.querySelector('.agent-specialty').textContent;
                const phone = agentCard.querySelector('.contact-link').href;
                
                bookingData.agent = {
                    id: agentName,
                    name: name,
                    title: title,
                    specialty: specialty,
                    phone: phone
                };
                
                // Enable next button
                nextBtn.disabled = false;
                nextBtn.classList.add('enabled');
            });
        });
    }
    
    // Time slots setup
    function setupTimeSlots() {
        updateTimeSlots();
    }
    
    function updateTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        const selectedDate = document.getElementById('viewing-date').value;
        
        if (!selectedDate) {
            timeSlotsContainer.innerHTML = '<p class="no-slots">Please select a date first</p>';
            return;
        }
        
        // Generate time slots based on selected date
        const timeSlots = generateTimeSlots(selectedDate);
        
        timeSlotsContainer.innerHTML = '';
        
        if (timeSlots.length === 0) {
            timeSlotsContainer.innerHTML = '<p class="no-slots">No available slots for this date</p>';
            return;
        }
        
        timeSlots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;
            slotElement.innerHTML = `
                <span class="slot-time">${slot.time}</span>
                <span class="slot-status">${slot.available ? 'Available' : 'Booked'}</span>
            `;
            
            if (slot.available) {
                slotElement.addEventListener('click', function() {
                    // Remove selection from all slots
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    
                    // Add selection to clicked slot
                    this.classList.add('selected');
                    
                    // Store selected time
                    bookingData.appointment.time = slot.time;
                    bookingData.appointment.slot = slot.slot;
                    
                    validateStep3();
                });
            }
            
            timeSlotsContainer.appendChild(slotElement);
        });
    }
    
    function generateTimeSlots(date) {
        const slots = [];
        const selectedDate = new Date(date);
        const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
        
        // Different time slots for weekdays and weekends
        const timeRanges = isWeekend ? 
            ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] :
            ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        
        timeRanges.forEach((time, index) => {
            // Simulate availability (80% chance of being available)
            const available = Math.random() > 0.2;
            
            slots.push({
                time: time,
                slot: index + 1,
                available: available
            });
        });
        
        return slots;
    }
    
    // Form validation setup
    function setupFormValidation() {
        // Step 1 validation
        const step1Form = document.getElementById('property-form');
        step1Form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateStep1()) {
                goToStep(2);
            }
        });
        
        // Step 4 validation
        const step4Form = document.querySelector('#step-4');
        const confirmBtn = document.getElementById('confirm-booking');
        
        confirmBtn.addEventListener('click', function() {
            if (validateStep4()) {
                confirmBooking();
            }
        });
    }
    
    function validateStep1() {
        const requiredFields = ['property-type', 'property-location', 'viewing-purpose'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value) {
                field.style.borderColor = '#ff6b6b';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        if (isValid) {
            // Store property data
            bookingData.property = {
                type: document.getElementById('property-type').value,
                location: document.getElementById('property-location').value,
                budget: document.getElementById('budget-range').value,
                requirements: document.getElementById('property-requirements').value,
                purpose: document.getElementById('viewing-purpose').value
            };
        }
        
        return isValid;
    }
    
    function validateStep3() {
        const dateSelected = document.getElementById('viewing-date').value;
        const timeSelected = document.querySelector('.time-slot.selected');
        const nextBtn = document.getElementById('time-next-btn');
        
        if (dateSelected && timeSelected) {
            nextBtn.disabled = false;
            nextBtn.classList.add('enabled');
            
            // Store appointment data
            bookingData.appointment.date = dateSelected;
            bookingData.appointment.duration = document.getElementById('viewing-duration').value;
            bookingData.appointment.type = document.querySelector('input[name="viewingType"]:checked').value;
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.remove('enabled');
        }
    }
    
    function validateStep4() {
        const requiredFields = ['visitor-name', 'visitor-phone', 'visitor-email'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value) {
                field.style.borderColor = '#ff6b6b';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        // Email validation
        const email = document.getElementById('visitor-email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            document.getElementById('visitor-email').style.borderColor = '#ff6b6b';
            isValid = false;
        }
        
        // Phone validation
        const phone = document.getElementById('visitor-phone').value;
        const phoneRegex = /^[6-9]\d{9}$/;
        if (phone && !phoneRegex.test(phone.replace(/\D/g, ''))) {
            document.getElementById('visitor-phone').style.borderColor = '#ff6b6b';
            isValid = false;
        }
        
        if (isValid) {
            // Store visitor data
            bookingData.visitor = {
                name: document.getElementById('visitor-name').value,
                phone: document.getElementById('visitor-phone').value,
                email: document.getElementById('visitor-email').value,
                notes: document.getElementById('visitor-notes').value
            };
        }
        
        return isValid;
    }
    
    // Step navigation setup
    function setupStepNavigation() {
        // Agent next button
        document.getElementById('agent-next-btn').addEventListener('click', function() {
            if (bookingData.agent) {
                goToStep(3);
            }
        });
        
        // Time next button
        document.getElementById('time-next-btn').addEventListener('click', function() {
            if (bookingData.appointment.time) {
                goToStep(4);
            }
        });
    }
    
    // Step navigation functions
    function goToStep(step) {
        // Hide current step
        document.querySelector('.booking-step.active').classList.remove('active');
        document.querySelector('.step.active').classList.remove('active');
        
        // Show target step
        document.getElementById(`step-${step}`).classList.add('active');
        document.querySelector(`[data-step="${step}"]`).classList.add('active');
        
        currentStep = step;
        
        // Update step-specific content
        if (step === 4) {
            updateBookingSummary();
        }
    }
    
    function updateBookingSummary() {
        // Property summary
        const propertySummary = document.getElementById('property-summary');
        propertySummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Type:</span>
                <span class="summary-value">${getPropertyTypeLabel(bookingData.property.type)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Location:</span>
                <span class="summary-value">${getLocationLabel(bookingData.property.location)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Budget:</span>
                <span class="summary-value">${getBudgetLabel(bookingData.property.budget)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Purpose:</span>
                <span class="summary-value">${getPurposeLabel(bookingData.property.purpose)}</span>
            </div>
        `;
        
        // Agent summary
        const agentSummary = document.getElementById('agent-summary');
        agentSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Agent:</span>
                <span class="summary-value">${bookingData.agent.name}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Title:</span>
                <span class="summary-value">${bookingData.agent.title}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Specialty:</span>
                <span class="summary-value">${bookingData.agent.specialty}</span>
            </div>
        `;
        
        // Appointment summary
        const appointmentSummary = document.getElementById('appointment-summary');
        appointmentSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Date:</span>
                <span class="summary-value">${formatDate(bookingData.appointment.date)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Time:</span>
                <span class="summary-value">${bookingData.appointment.time}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${bookingData.appointment.duration} minutes</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Type:</span>
                <span class="summary-value">${bookingData.appointment.type === 'in-person' ? 'In-Person Visit' : 'Virtual Tour'}</span>
            </div>
        `;
    }
    
    // Confirm booking
    function confirmBooking() {
        // Simulate booking confirmation
        showLoadingState();
        
        setTimeout(() => {
            hideLoadingState();
            showSuccessModal();
            
            // Log booking data (in real implementation, send to backend)
            console.log('Booking confirmed:', bookingData);
        }, 2000);
    }
    
    function showLoadingState() {
        const confirmBtn = document.getElementById('confirm-booking');
        confirmBtn.innerHTML = `
            <span>Confirming...</span>
            <div class="loading-spinner"></div>
        `;
        confirmBtn.disabled = true;
    }
    
    function hideLoadingState() {
        const confirmBtn = document.getElementById('confirm-booking');
        confirmBtn.innerHTML = `
            <span>Confirm Booking</span>
            <div class="button-glow"></div>
        `;
        confirmBtn.disabled = false;
    }
    
    function showSuccessModal() {
        const modal = document.getElementById('success-modal');
        const bookingDetails = document.getElementById('booking-details');
        
        bookingDetails.innerHTML = `
            <div class="booking-detail">
                <strong>Property:</strong> ${getPropertyTypeLabel(bookingData.property.type)} in ${getLocationLabel(bookingData.property.location)}
            </div>
            <div class="booking-detail">
                <strong>Agent:</strong> ${bookingData.agent.name}
            </div>
            <div class="booking-detail">
                <strong>Date & Time:</strong> ${formatDate(bookingData.appointment.date)} at ${bookingData.appointment.time}
            </div>
            <div class="booking-detail">
                <strong>Duration:</strong> ${bookingData.appointment.duration} minutes
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset booking form
        resetBookingForm();
    }
    
    function bookAnother() {
        closeSuccessModal();
        goToStep(1);
    }
    
    function resetBookingForm() {
        // Reset all forms
        document.getElementById('property-form').reset();
        document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        
        // Reset step 1
        document.getElementById('step-1').classList.add('active');
        document.querySelector('[data-step="1"]').classList.add('active');
        
        // Reset booking data
        bookingData = {
            property: {},
            agent: null,
            appointment: {},
            visitor: {}
        };
        
        // Reset agent selection
        document.querySelectorAll('.agent-option').forEach(option => option.classList.remove('selected'));
        document.getElementById('agent-next-btn').disabled = true;
        document.getElementById('agent-next-btn').classList.remove('enabled');
        
        // Reset time selection
        document.getElementById('time-next-btn').disabled = true;
        document.getElementById('time-next-btn').classList.remove('enabled');
        
        currentStep = 1;
    }
    
    // Utility functions
    function getPropertyTypeLabel(type) {
        const labels = {
            'apartment': 'Apartment',
            'villa': 'Villa',
            'plot': 'Plot',
            'commercial': 'Commercial',
            'other': 'Other'
        };
        return labels[type] || type;
    }
    
    function getLocationLabel(location) {
        const labels = {
            'viman-nagar': 'Viman Nagar',
            'kharadi': 'Kharadi',
            'koregaon-park': 'Koregaon Park',
            'wadgaon-sheri': 'Wadgaon Sheri',
            'kalyani-nagar': 'Kalyani Nagar',
            'other': 'Other'
        };
        return labels[location] || location;
    }
    
    function getBudgetLabel(budget) {
        const labels = {
            'under-50': 'Under ₹50 Lakhs',
            '50-75': '₹50 Lakhs - ₹75 Lakhs',
            '75-100': '₹75 Lakhs - ₹1 Crore',
            '100-150': '₹1 Crore - ₹1.5 Crore',
            '150-200': '₹1.5 Crore - ₹2 Crore',
            'above-200': 'Above ₹2 Crore'
        };
        return labels[budget] || 'Not specified';
    }
    
    function getPurposeLabel(purpose) {
        const labels = {
            'buy': 'Looking to Buy',
            'rent': 'Looking to Rent',
            'investment': 'Investment Purpose',
            'explore': 'Just Exploring'
        };
        return labels[purpose] || purpose;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Radio button styling
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Update visual state
            radioOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Form input animations
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.info-card, .booking-step, .agent-option');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : 'var(--electric-blue)'};
            color: var(--obsidian);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Make functions globally available
    window.goToStep = goToStep;
    window.closeSuccessModal = closeSuccessModal;
    window.bookAnother = bookAnother;
});
