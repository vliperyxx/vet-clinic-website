document.addEventListener('DOMContentLoaded', () => {
    const authButtons = document.querySelectorAll('.nav-button');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const currentUserId = localStorage.getItem('userId'); 
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.overlay');
    const confirmationSection = document.getElementById('appointment-confirmation');

    authButtons.forEach(authButton => {
        if (isAuthenticated) {
            authButton.textContent = 'My Profile';
            authButton.addEventListener('click', () => {
                window.location.href = 'profile.html';
            });
        } else {
            authButton.textContent = 'Login';
            authButton.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    });

    if (burgerMenu && overlay && mobileMenu) {
        const toggleMenu = () => {
            mobileMenu.classList.toggle('visible');
            overlay.classList.toggle('active');
        };

        burgerMenu.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    // `logout-icon`
    const logoutIcon = document.querySelector('.logout-icon');
    if (logoutIcon) {
        logoutIcon.addEventListener('click', () => {
            localStorage.removeItem('isAuthenticated');
            window.location.href = 'login.html';
        });
    }

    // `book-appointment-button`
    document.querySelector('.book-appointment-button')?.addEventListener('click', () => {
        if (isAuthenticated) {
            window.location.href = 'appointment.html';
        } else {
            window.location.href = 'login.html';
        }
    });

    // `register.html`
    if (window.location.pathname.endsWith('register.html')) {
        const togglePassword = document.querySelector('#togglePassword');
        const passwordInput = document.querySelector('#reg-password');

        document.querySelector('.auth-button').addEventListener('click', function (event) {
            event.preventDefault();
            const username = document.querySelector('#reg-username').value;
            const password = passwordInput.value;

            fetch('http://localhost:3003/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: username, password: password })
            })
            .then(response => response.json())
            .then(user => {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userId', user.id); 
                window.location.href = 'profile.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to create account');
            });
        });

        togglePassword.addEventListener('click', () => {
            const isPasswordVisible = passwordInput.getAttribute('type') === 'password';

            passwordInput.setAttribute('type', isPasswordVisible ? 'text' : 'password');

            togglePassword.textContent = isPasswordVisible ? 'Hide' : 'Show';
        });
    }

    // `login.html`
    if (window.location.pathname.endsWith('login.html')) {
        const togglePassword = document.querySelector('#togglePassword');
        const passwordInput = document.querySelector('#password');

        document.querySelector('.auth-button').addEventListener('click', function (event) {
            event.preventDefault();
            const username = document.querySelector('#username').value;
            const password = passwordInput.value;

            fetch('http://localhost:3003/users')
                .then(response => response.json())
                .then(data => {
                    const user = data.find(user => user.name === username && user.password === password);
                    if (user) {
                        localStorage.setItem('isAuthenticated', 'true');
                        localStorage.setItem('userId', user.id);
                        window.location.href = 'profile.html';
                    } else {
                        alert('Invalid username or password');
                    }
                });
        });

        togglePassword.addEventListener('click', () => {
            const isPasswordVisible = passwordInput.getAttribute('type') === 'password';

            passwordInput.setAttribute('type', isPasswordVisible ? 'text' : 'password');

            togglePassword.textContent = isPasswordVisible ? 'Hide' : 'Show';
        });
    }

    // `appointment.html`
    if (window.location.pathname.endsWith('appointment.html')) {
        document.querySelector('.appointment-button')?.addEventListener('click', function (event) {
            event.preventDefault();
    
            const firstName = document.querySelector('#first-name').value;
            const lastName = document.querySelector('#last-name').value;
            const phone = document.querySelector('#phone-number').value;
            const service = document.querySelector('#service').value; 
    
            const currentUserId = localStorage.getItem('userId'); 
            if (!currentUserId) {
                alert('Please log in to book an appointment.');
                window.location.href = 'login.html';
                return;
            }

            localStorage.setItem('selectedService', service); 

            fetch('http://localhost:3001/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    name: `${firstName} ${lastName}`,
                    phone: phone,
                    visits: [{ date: new Date().toISOString().split('T')[0], service: service }]
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to book appointment');
                }
                return response.json();
            })
            .then(() => {
                localStorage.setItem('appointmentCreated', 'true');
                window.location.href = 'selectvet.html';
            })
            .catch(error => {
                console.error('Detailed Error:', error);
                alert('Failed to book appointment');
            });            
        });
    }    

    // `selectvet.html`
    if (window.location.pathname.endsWith('selectvet.html')) {
        const serviceNameElement = document.querySelector('.service-name');
        const selectedService = localStorage.getItem('selectedService') || 'Grooming';
    
        serviceNameElement.textContent = selectedService;

        const formattedServiceClass = selectedService.toLowerCase().replace(/\s+/g, '');
    
        document.querySelectorAll('.vet-card').forEach(card => {
            if (card.classList.contains(formattedServiceClass)) {
                card.style.display = 'flex'; 
            } else {
                card.style.display = 'none'; 
            }
    
            if (card.style.display === 'flex') {
                const vetName = card.querySelector('.vet-name').textContent;
                const vetSpecialty = card.querySelector('.vet-specialty').textContent;
                const vetImage = card.querySelector('.vet-image').src;
    
                card.addEventListener('click', () => {
                    const selectedVet = {
                        name: vetName,
                        specialty: vetSpecialty,
                        image: vetImage
                    };
                    localStorage.setItem('selectedVet', JSON.stringify(selectedVet));
                    localStorage.setItem('selectedService', selectedService);
                    window.location.href = 'vet-info.html';
                });
            }
        });
    }    

    // `vet-info.html`
    if (window.location.pathname.endsWith('vet-info.html')) {
        const selectedVet = JSON.parse(localStorage.getItem('selectedVet'));
    
        if (selectedVet) {
            document.querySelector('.vet-name').textContent = selectedVet.name;
            document.querySelector('.vet-specialty').textContent = selectedVet.specialty;
    
            const experienceByVet = {
                "Oleksandra Kovalenko": "2020 – present: Pet Life Veterinary Medicine Center",
                "Nataliia Shevchenko": "2018 – present: Pet Life Veterinary Grooming Services",
                "Viktoriia Ivanchuk": "2019 – present: Pet Life Large Pet Grooming Specialist",
                "Mykola Romanenko": "2017 – present: Pet Life Immunization Specialist",
                "Iryna Kovalenko": "2021 – present: Exotic Pet Vaccination Expert",
                "Nataliia Marchenko": "2015 – present: General Immunization and Rabies Expert",
                "Andrii Melnyk": "2016 – present: Dental Surgery Specialist",
                "Yuliia Hrytsenko": "2020 – present: Pet Dental Hygiene Specialist",
                "Dmytro Bondarenko": "2018 – present: Oral Health Specialist for Small Animals",
                "Anastasiia Berezhko": "2017 – present: Focused on pain management in critical cases",
                "Alina Radchenko": "2016 – present: Enhanced patient safety during procedures",
                "Yurii Staryk": "2018 – present: Developed anesthesia protocols for various species",
                "Sofiia Dovhal": "2015 – present: Specialized in diagnosing skin conditions",
                "Mykola Leshchenko": "2016 – present: Treated chronic skin disorders",
                "Olha Tyshchenko": "2019 – present: Applied innovative dermatology treatments",
                "Liliia Kovalchuk": "2018 – present: Conducted advanced imaging diagnostics",
                "Viktoriia Havryliuk": "2017 – present: Focused on tissue analysis for diagnoses",
                "Volodymyr Chumak": "2015 – present: Expert in ultrasound imaging",
                "Oleksandr Myronenko": "2016 – present: Managed pet identification systems",
                "Bohdan Poltavets": "2018 – present: Focused on lost pet recovery",
                "Ihor Klymenchuk": "2017 – present: Improved microchipping efficiency",
                "Diana Horbachuk": "2016 – present: Provided cancer care plans for pets",
                "Serhii Lysenko": "2019 – present: Used radiation therapy in oncology",
                "Nataliia Levchuk": "2018 – present: Specialized in tumor removal surgeries",
                "Kateryna Vasylenko": "2017 – present: Performed general animal surgeries",
                "Andrii Zadorozhnyi": "2016 – present: Focused on orthopedic surgeries",
                "Maksym Savchenko": "2019 – present: Expert in soft tissue surgeries"
            };

            document.querySelector('.experience-text').textContent = experienceByVet[selectedVet.name] || "Experience details unavailable";
    
            const photos = document.querySelectorAll('.vet-photo');
            photos.forEach(photo => {
                if (photo.getAttribute('data-vet') === selectedVet.name) {
                    photo.style.display = 'block';
                } else {
                    photo.style.display = 'none';
                }
            });
        } else {
            console.error("No vet selected. Redirecting to service selection.");
            window.location.href = "selectvet.html";
        }
    
        let currentDate = new Date();
        const calendarMonth = document.querySelector('.calendar-month');
        const calendarBody = document.querySelector('.calendar tbody');
        
        function renderCalendar(date) {
            calendarBody.innerHTML = '';
            const month = date.getMonth();
            const year = date.getFullYear();
            calendarMonth.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        
            const firstDay = new Date(year, month, 1).getDay();
            const lastDate = new Date(year, month + 1, 0).getDate();
            const prevLastDate = new Date(year, month, 0).getDate();
            let day = 1;
            let nextDay = 1;
        
            for (let i = 0; i < 6; i++) {
                const row = document.createElement('tr');
                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');
                    if (i === 0 && j < firstDay) {
                        cell.classList.add('disabled');
                        cell.textContent = prevLastDate - firstDay + j + 1;
                    } else if (day > lastDate) {
                        cell.classList.add('disabled');
                        cell.textContent = nextDay++;
                    } else {
                        const dateObj = new Date(year, month, day);
                        cell.textContent = day;
                        if (dateObj < new Date()) {
                            cell.classList.add('disabled'); 
                        } else {
                            cell.classList.add('date-slot');
                            cell.addEventListener('click', () => selectDate(cell, dateObj));
                        }
                        day++;
                    }
                    row.appendChild(cell);
                }
                calendarBody.appendChild(row);
                if (day > lastDate) break;
            }
        }
        
        let selectedDate = null;
        
        function selectDate(cell, dateObj) {
            if (selectedDate) {
                selectedDate.classList.remove('selected');
            }
            cell.classList.add('selected');
            selectedDate = cell;

            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        
            localStorage.setItem('formattedDate', formattedDate);
        }
        
        renderCalendar(currentDate);
        
        document.querySelector('.prev-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
        
        document.querySelector('.next-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });        
        
        const timeSlots = document.querySelectorAll('.time-slot');
        let selectedTime = null;
        
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                timeSlots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                selectedTime = slot.textContent;
            });
        });
        
        // `schedule-button`
        document.querySelector('.schedule-button').addEventListener('click', () => {
            const userId = localStorage.getItem('userId');
            const selectedService = localStorage.getItem('selectedService');
            const formattedDate = localStorage.getItem('formattedDate');

            if (selectedDate && selectedTime) {
                const selectedVet = JSON.parse(localStorage.getItem('selectedVet'));
        
                const appointment = {
                    userId: currentUserId, 
                    vetId: selectedVet.id,
                    vetName: selectedVet.name,
                    service: selectedService,
                    date: formattedDate,
                    time: selectedTime,
                };
        
                fetch('http://localhost:3002/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(appointment)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to schedule appointment');
                    }
                    return response.json();
                })
                .then(() => {
                    confirmationSection.classList.add('active');
                    document.querySelector('.schedule-overlay').classList.add('active');

                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to schedule appointment');
                });
            } else {
                alert('Please select both a date and a time for your appointment.');
            }
        });   
        
        // `confirm-button`
        const confirmButton = document.querySelector('.confirm-button');
        confirmButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // `profile.html`
    if (window.location.pathname.endsWith('profile.html')) {
        function updateLocalAppointments() {
            fetch('http://localhost:3002/appointments')
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('appointments', JSON.stringify(data));
                    loadAppointments(); 
                })
                .catch(error => console.error('Error fetching appointments:', error));
        }
    
        function loadAppointments(period = 'all') {
            const currentUserId = localStorage.getItem('userId');
            const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            const userAppointments = appointments.filter(app => app.userId === currentUserId);
    
            const orderHistoryDetails = document.querySelector('.order-history_details');
            if (!orderHistoryDetails) {
                console.error("Element '.order-history_details' not found.");
                return;
            }
    
            console.log(`Selected period: ${period}`);
            
            const filteredAppointments = filterAppointmentsByPeriod(userAppointments, period);
            
            console.log(`Filtered appointments for period "${period}":`, filteredAppointments);
    
            if (filteredAppointments.length > 0) {
                orderHistoryDetails.style.display = 'block'; 
                const appointmentContainer = orderHistoryDetails;
                appointmentContainer.innerHTML = ''; 
    
                const headerHtml = `<h4 class="order-history_title bold-txt">Online Order History</h4>`;
                orderHistoryDetails.insertAdjacentHTML('beforeend', headerHtml);
    
                filteredAppointments.forEach(appointment => {
                    const appointmentHtml = `
                        <div class="appointment-entry">
                            <p class="service-type">${appointment.service}</p>
                            <p class="vet-name bold-txt blue">${appointment.vetName}</p>
                            <div class="appointment-info">
                                <span class="status-badge blue">Scheduled</span>
                                <span class="appointment-time">
                                    <span class="profile-clock_icon-dot"></span>
                                    ${appointment.date}, ${appointment.time}
                                </span>                              
                            </div>
                        </div>
                    `;
                    appointmentContainer.insertAdjacentHTML('beforeend', appointmentHtml);
                });
            } else {
                console.log("No appointments found for the current user.");
                orderHistoryDetails.style.display = 'none';
            }
        }
    
        function filterAppointmentsByPeriod(appointments, period) {
            const now = new Date();
        
            let endDate;
        
            switch (period) {
                case '3-months':
                    endDate = new Date(now);
                    endDate.setMonth(endDate.getMonth() + 3);
                    break;
                case '6-months':
                    endDate = new Date(now);
                    endDate.setMonth(endDate.getMonth() + 6);
                    break;
                case '1-year':
                    endDate = new Date(now);
                    endDate.setFullYear(endDate.getFullYear() + 1);
                    break;
                default:
                    endDate = null; 
            }
        
            return appointments.filter(appointment => {
                const appointmentDate = new Date(Date.parse(appointment.date)); 
                
                if (isNaN(appointmentDate)) {
                    console.error(`Incorrect date format: ${appointment.date}`);
                    return false;
                }
        
                if (endDate) {
                    return appointmentDate >= now && appointmentDate <= endDate;
                } else {
                    return appointmentDate >= now; 
                }
            });
        }
        
            document.getElementById('history-period').addEventListener('change', (event) => {
            loadAppointments(event.target.value);
        });
    
        updateLocalAppointments();
    }
});