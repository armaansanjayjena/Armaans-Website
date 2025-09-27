// calculator.js for Shelters Realty

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const emiForm = document.getElementById('emi-form');
    const loanAmountInput = document.getElementById('loan-amount');
    const loanTenureInput = document.getElementById('loan-tenure');
    const loanTenureSlider = document.getElementById('loan-tenure-slider');
    const downPaymentInput = document.getElementById('down-payment');

    const emiResultsContainer = document.getElementById('emi-results');
    const emiAmountEl = document.getElementById('emi-amount');
    const principalAmountEl = document.getElementById('principal-amount');
    const totalInterestEl = document.getElementById('total-interest');
    const totalAmountEl = document.getElementById('total-amount');

    // --- Fixed Partner Rate ---
    const FIXED_INTEREST_RATE = 7.3;

    // --- Eligibility Calculator Element Selectors ---
    const eligibilityForm = document.getElementById('eligibility-form');
    const applicantNameInput = document.getElementById('applicant-name');
    const applicantPhoneInput = document.getElementById('applicant-phone');
    const applicantEmailInput = document.getElementById('applicant-email');
    const applicantAgeInput = document.getElementById('applicant-age');
    const creditScoreInput = document.getElementById('credit-score');
    const monthlyIncomeInput = document.getElementById('monthly-income');
    const existingEmisInput = document.getElementById('existing-emis');
    const loanTypeRadios = document.querySelectorAll('input[name="loanType"]');
    const coApplicantSection = document.getElementById('co-applicant-section');
    const coApplicantNameInput = document.getElementById('co-applicant-name');
    const coApplicantIncomeInput = document.getElementById('co-applicant-income');

    const eligibilityResultsContainer = document.getElementById('eligibility-results');
    const eligibleAmountEl = document.getElementById('eligible-amount');
    
    // --- Handoff Modal Elements ---
    const handoffModal = document.getElementById('handoff-modal');
    const modalEligibleAmountEl = document.getElementById('modal-eligible-amount');
    const countdownTimerEl = document.getElementById('countdown-timer');
    const modalRedirectLink = document.getElementById('modal-redirect-link');

    const affiliateBaseUrl = 'https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan'; // Placeholder

    // --- Utility Functions ---

    /**
     * Formats a number into Indian Rupee currency format.
     * @param {number} amount - The number to format.
     * @returns {string} - The formatted currency string (e.g., "₹1,23,456").
     */
    const formatCurrency = (amount) => {
        if (isNaN(amount) || amount === Infinity) {
            return '₹0';
        }
        return '₹' + Math.round(amount).toLocaleString('en-IN');
    };

    // --- Core Calculation Logic ---

    /**
     * Calculates and displays the EMI and other loan details.
     */
    const calculateEMI = () => {
        // 1. Get and parse float/integer values from inputs
        const propertyPrice = parseInt(loanAmountInput.value.replace(/,/g, ''), 10);
        const downPayment = parseInt(downPaymentInput.value.replace(/,/g, ''), 10);
        const interestRate = FIXED_INTEREST_RATE;
        const tenureYears = parseInt(loanTenureInput.value, 10);

        // 2. Validate inputs
        if (isNaN(propertyPrice) || isNaN(interestRate) || isNaN(tenureYears) || isNaN(downPayment)) {
            return;
        }

        // 3. Calculate loan details
        const principal = propertyPrice - downPayment;
        const monthlyRate = interestRate / (12 * 100);
        const tenureMonths = tenureYears * 12;

        // Check for edge cases
        if (principal <= 0 || tenureMonths <= 0 || monthlyRate <= 0) {
            displayEMIResults({ emi: 0, principal: 0, totalInterest: 0, totalAmount: 0 });
            return;
        }

        // 4. Calculate EMI using the formula
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        const totalAmount = emi * tenureMonths;
        const totalInterest = totalAmount - principal;

        // 5. Display the results
        displayEMIResults({ emi, principal, totalInterest, totalAmount });
    };

    /**
     * Updates the DOM with the calculated EMI results.
     * @param {object} results - The calculated loan details.
     */
    const displayEMIResults = (results) => {
        emiResultsContainer.style.display = 'block';
        emiAmountEl.textContent = formatCurrency(results.emi);
        principalAmountEl.textContent = formatCurrency(results.principal);
        totalInterestEl.textContent = formatCurrency(results.totalInterest);
        totalAmountEl.textContent = formatCurrency(results.totalAmount);
    };

    // --- Event Listeners ---

    // Sync slider and input fields
    const syncInputs = (slider, input) => {
        slider.addEventListener('input', () => {
            input.value = slider.value;
            calculateEMI();
        });
        input.addEventListener('input', () => {
            // Ensure slider value doesn't exceed its max/min on manual input
            const value = parseFloat(input.value);
            const min = parseFloat(slider.min);
            if (value < min) input.value = min;
            slider.max = Math.max(parseFloat(slider.max), value * 1.5); // Dynamically adjust slider max
            slider.value = input.value;
            calculateEMI();
        });
    };

    // Add event listener for the standalone loan amount input
    loanAmountInput.addEventListener('input', calculateEMI);

    // Add event listener for the standalone down payment input
    downPaymentInput.addEventListener('input', calculateEMI);

    // Sync tenure slider and input
    syncInputs(loanTenureSlider, loanTenureInput);

    // Handle EMI form submission and input changes
    emiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateEMI();
    });

    // --- Initial Calculation ---
    calculateEMI();

    // --- Eligibility Calculator Logic ---

    // Toggle co-applicant section
    loanTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'joint' && radio.checked) {
                coApplicantSection.style.display = 'block';
            } else {
                coApplicantSection.style.display = 'none';
            }
        });
    });

    const generateAffiliateUrl = (leadData) => {
        const params = new URLSearchParams();
        params.append('ref', 'sheltersrealty');
        Object.entries(leadData).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        return `${affiliateBaseUrl}?${params.toString()}`;
    };

    const submitLeadAndRedirect = async (leadData) => {
        // Step 1: Send data to our backend (Netlify Function)
        try {
            // OLD: const response = await fetch('/.netlify/functions/submit-lead', {
            const response = await fetch('https://hook.make.com/REPLACE_WITH_YOUR_WEBHOOK?secret=REPLACE_SECRET', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData),
            });

            if (!response.ok) {
                throw new Error('Lead submission failed.');
            }

            // The Make.com webhook might not return a referral ID in the same way.
            // This part is commented out as it might not be applicable anymore.
            // const result = await response.json();
            // leadData.referralId = result.referralId; // Add the ID to our data object
            console.log('Lead successfully captured by Make.com webhook.');

        } catch (error) {
            console.error('Error capturing lead:', error);
            // Optionally, show an error message to the user
            alert('There was an error submitting your details. Please try again.');
            return; // Stop the process if lead capture fails
        }

        // Step 2: Show handoff modal and start countdown
        const affiliateUrl = generateAffiliateUrl(leadData);
        modalEligibleAmountEl.textContent = formatCurrency(leadData.eligibleAmount);
        modalRedirectLink.href = affiliateUrl;
        handoffModal.style.display = 'flex';

        let countdown = 5;
        countdownTimerEl.textContent = countdown;

        const interval = setInterval(() => {
            countdown--;
            countdownTimerEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                window.location.href = affiliateUrl;
            }
        }, 1000);
    };

    eligibilityForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // --- Data Collection ---
        const loanType = document.querySelector('input[name="loanType"]:checked').value;
        let totalIncome = parseInt(monthlyIncomeInput.value, 10);
        let totalExistingEMIs = parseInt(existingEmisInput.value, 10) || 0;

        if (loanType === 'joint') {
            totalIncome += parseInt(coApplicantIncomeInput.value, 10) || 0;
        }

        // --- Eligibility Calculation ---
        const maxPermissibleEMI = (totalIncome * 0.50) - totalExistingEMIs;
        const tenureYears = parseInt(loanTenureInput.value, 10);
        const monthlyRate = FIXED_INTEREST_RATE / (12 * 100);
        const tenureMonths = tenureYears * 12;
        let eligibleAmount = 0;

        if (maxPermissibleEMI > 0 && tenureMonths > 0 && monthlyRate > 0) {
            eligibleAmount = (maxPermissibleEMI * (Math.pow(1 + monthlyRate, tenureMonths) - 1)) /
                             (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths));
        }

        // --- Prepare Lead Data for Submission ---
        const leadData = {
            // User Info
            applicantName: applicantNameInput.value,
            applicantPhone: applicantPhoneInput.value,
            applicantEmail: applicantEmailInput.value,
            applicantAge: parseInt(applicantAgeInput.value, 10),
            creditScore: creditScoreInput.value,
            // Loan Info
            loanAmount: parseInt(loanAmountInput.value, 10),
            loanTenure: tenureYears,
            loanType: loanType,
            // Financials
            monthlyIncome: parseInt(monthlyIncomeInput.value, 10),
            existingEMIs: parseInt(existingEmisInput.value, 10) || 0,
            coApplicantName: loanType === 'joint' ? coApplicantNameInput.value : null,
            coApplicantIncome: loanType === 'joint' ? (parseInt(coApplicantIncomeInput.value, 10) || 0) : null,
            // Calculated
            eligibleAmount: Math.round(eligibleAmount),
        };

        // --- Submit and Redirect ---
        submitLeadAndRedirect(leadData);
    });
});