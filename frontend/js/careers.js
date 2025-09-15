// Space Tourism Careers System
window.SpaceTourismCareers = class SpaceTourismCareers {
    constructor() {
        this.careerData = [
            {
                id: 'engineering',
                category: 'Engineering',
                icon: 'fas fa-rocket',
                jobs: [
                    { 
                        title: 'Aerospace Engineer', 
                        salary: '$120,000 - $200,000', 
                        icon: 'fas fa-cogs',
                        requirements: [
                            'Bachelor\'s degree in Aerospace Engineering or related field',
                            '5+ years of experience in aerospace design',
                            'Proficiency in CAD software and simulation tools',
                            'Strong understanding of aerodynamics and propulsion systems',
                            'Experience with space vehicle design preferred'
                        ],
                        responsibilities: [
                            'Design and develop spacecraft components and systems',
                            'Conduct structural and thermal analysis',
                            'Collaborate with cross-functional teams on vehicle integration',
                            'Test and validate engineering designs',
                            'Document technical specifications and procedures'
                        ]
                    },
                    { 
                        title: 'Propulsion Specialist', 
                        salary: '$100,000 - $180,000', 
                        icon: 'fas fa-fire',
                        requirements: [
                            'Master\'s degree in Mechanical or Chemical Engineering',
                            '3+ years of experience in propulsion systems',
                            'Knowledge of rocket engines and fuel systems',
                            'Experience with testing and validation procedures',
                            'Understanding of safety protocols and regulations'
                        ],
                        responsibilities: [
                            'Design and optimize propulsion systems',
                            'Conduct performance testing and analysis',
                            'Troubleshoot propulsion system issues',
                            'Develop maintenance procedures',
                            'Ensure compliance with safety standards'
                        ]
                    },
                    { 
                        title: 'Systems Integration Engineer', 
                        salary: '$95,000 - $160,000', 
                        icon: 'fas fa-microchip',
                        requirements: [
                            'Bachelor\'s degree in Systems Engineering or Electrical Engineering',
                            '4+ years of experience in complex system integration',
                            'Proficiency in system modeling and simulation tools',
                            'Strong problem-solving and analytical skills',
                            'Experience with space mission systems preferred'
                        ],
                        responsibilities: [
                            'Integrate complex subsystems into cohesive spacecraft systems',
                            'Develop system architecture and interface specifications',
                            'Coordinate testing and validation activities',
                            'Identify and resolve system integration issues',
                            'Document integration procedures and results'
                        ]
                    },
                    { 
                        title: 'Materials Scientist', 
                        salary: '$90,000 - $150,000', 
                        icon: 'fas fa-flask',
                        requirements: [
                            'PhD in Materials Science or related field',
                            '3+ years of research experience in advanced materials',
                            'Knowledge of material properties under extreme conditions',
                            'Experience with materials testing and characterization',
                            'Publication record in peer-reviewed journals'
                        ],
                        responsibilities: [
                            'Research and develop advanced materials for space applications',
                            'Test material properties under simulated space conditions',
                            'Collaborate with engineering teams on material selection',
                            'Document research findings and recommendations',
                            'Stay current with advances in materials science'
                        ]
                    },
                    { 
                        title: 'Avionics Technician', 
                        salary: '$70,000 - $120,000', 
                        icon: 'fas fa-satellite',
                        requirements: [
                            'Associate degree in Avionics or Electronics Technology',
                            '2+ years of experience in avionics systems',
                            'Knowledge of digital and analog electronics',
                            'Experience with troubleshooting and repair procedures',
                            'Familiarity with FAA or equivalent certifications'
                        ],
                        responsibilities: [
                            'Install and maintain avionics systems and components',
                            'Troubleshoot and repair electronic systems',
                            'Perform routine inspections and calibrations',
                            'Document maintenance activities and results',
                            'Ensure compliance with safety and quality standards'
                        ]
                    }
                ]
            },
            {
                id: 'astronaut',
                category: 'Astronaut Crew',
                icon: 'fas fa-helmet-safety',
                jobs: [
                    { 
                        title: 'Commander', 
                        salary: '$150,000 - $250,000', 
                        icon: 'fas fa-star',
                        requirements: [
                            'Master\'s degree in Engineering, Biological Science, Physical Science, Computer Science, or Mathematics',
                            '3+ years of related professional experience',
                            '1,000+ hours of pilot-in-command time in jet aircraft',
                            'Pass rigorous physical and psychological evaluations',
                            'Demonstrated leadership abilities'
                        ],
                        responsibilities: [
                            'Lead crew during all phases of space missions',
                            'Ensure crew safety and mission success',
                            'Communicate with mission control and ground teams',
                            'Operate spacecraft systems and perform maneuvers',
                            'Make critical decisions in high-pressure situations'
                        ]
                    },
                    { 
                        title: 'Pilot', 
                        salary: '$130,000 - $220,000', 
                        icon: 'fas fa-plane',
                        requirements: [
                            'Bachelor\'s degree in Engineering, Biological Science, Physical Science, Computer Science, or Mathematics',
                            '1,000+ hours of pilot-in-command time in jet aircraft',
                            'Excellent physical condition and reflexes',
                            'Strong spatial awareness and hand-eye coordination',
                            'Ability to work under extreme stress'
                        ],
                        responsibilities: [
                            'Operate spacecraft during launch, orbit, and re-entry',
                            'Monitor and control vehicle systems',
                            'Assist commander in mission execution',
                            'Perform routine maintenance on flight systems',
                            'Support scientific experiments during missions'
                        ]
                    },
                    { 
                        title: 'Mission Specialist', 
                        salary: '$110,000 - $190,000', 
                        icon: 'fas fa-user-astronaut',
                        requirements: [
                            'Bachelor\'s degree in Engineering, Biological Science, Physical Science, Computer Science, or Mathematics',
                            '3+ years of related professional experience',
                            'Pass rigorous physical and psychological evaluations',
                            'Strong technical and problem-solving skills',
                            'Ability to work effectively in team environments'
                        ],
                        responsibilities: [
                            'Conduct scientific experiments in microgravity',
                            'Operate and maintain mission equipment',
                            'Support payload operations and deployments',
                            'Document experiment results and observations',
                            'Participate in spacewalks and vehicle maintenance'
                        ]
                    },
                    { 
                        title: 'Flight Engineer', 
                        salary: '$100,000 - $170,000', 
                        icon: 'fas fa-tools',
                        requirements: [
                            'Bachelor\'s degree in Engineering or related technical field',
                            '2+ years of experience in engineering or technical operations',
                            'Strong mechanical aptitude and troubleshooting skills',
                            'Ability to work in confined spaces for extended periods',
                            'Pass rigorous physical and psychological evaluations'
                        ],
                        responsibilities: [
                            'Monitor and maintain spacecraft systems',
                            'Perform routine and emergency maintenance tasks',
                            'Troubleshoot technical issues during missions',
                            'Support crew with technical operations',
                            'Document system performance and anomalies'
                        ]
                    },
                    { 
                        title: 'Scientist-Astronaut', 
                        salary: '$95,000 - $160,000', 
                        icon: 'fas fa-atom',
                        requirements: [
                            'PhD in Physical Science, Biological Science, or related field',
                            '3+ years of research experience in relevant field',
                            'Published research in peer-reviewed journals',
                            'Pass rigorous physical and psychological evaluations',
                            'Strong communication and presentation skills'
                        ],
                        responsibilities: [
                            'Conduct scientific experiments in space',
                            'Collect and analyze research data',
                            'Collaborate with ground-based research teams',
                            'Document and report scientific findings',
                            'Support educational and public outreach activities'
                        ]
                    }
                ]
            },
            {
                id: 'hospitality',
                category: 'Hospitality',
                icon: 'fas fa-hotel',
                jobs: [
                    { 
                        title: 'Space Concierge', 
                        salary: '$60,000 - $100,000', 
                        icon: 'fas fa-concierge-bell',
                        requirements: [
                            'Bachelor\'s degree in Hospitality Management or related field',
                            '2+ years of experience in luxury hospitality',
                            'Excellent customer service and interpersonal skills',
                            'Ability to work in unique and challenging environments',
                            'Knowledge of space travel procedures and safety protocols'
                        ],
                        responsibilities: [
                            'Coordinate space tourist experiences and activities',
                            'Address guest needs and concerns during missions',
                            'Plan and organize special events and celebrations',
                            'Maintain guest satisfaction and comfort',
                            'Ensure compliance with safety and security protocols'
                        ]
                    },
                    { 
                        title: 'Zero-G Chef', 
                        salary: '$55,000 - $90,000', 
                        icon: 'fas fa-utensils',
                        requirements: [
                            'Culinary degree or equivalent experience',
                            '3+ years of experience in high-end cuisine',
                            'Knowledge of food preparation in microgravity',
                            'Understanding of nutritional requirements for space travel',
                            'Creative approach to menu planning and presentation'
                        ],
                        responsibilities: [
                            'Prepare meals for crew and passengers',
                            'Plan menus considering nutritional and psychological needs',
                            'Adapt recipes for microgravity environment',
                            'Maintain food safety and sanitation standards',
                            'Manage inventory and food storage systems'
                        ]
                    },
                    { 
                        title: 'Entertainment Coordinator', 
                        salary: '$50,000 - $85,000', 
                        icon: 'fas fa-music',
                        requirements: [
                            'Bachelor\'s degree in Entertainment, Communications, or related field',
                            '2+ years of experience in event planning or entertainment',
                            'Creative and innovative approach to activities',
                            'Strong organizational and multitasking abilities',
                            'Experience with virtual and augmented reality technologies'
                        ],
                        responsibilities: [
                            'Plan and coordinate entertainment activities for missions',
                            'Organize social events and recreational activities',
                            'Manage media and communication systems',
                            'Facilitate virtual connections with Earth',
                            'Ensure passenger engagement and satisfaction'
                        ]
                    },
                    { 
                        title: 'Luxury Experience Designer', 
                        salary: '$65,000 - $110,000', 
                        icon: 'fas fa-paint-brush',
                        requirements: [
                            'Bachelor\'s degree in Design, Architecture, or related field',
                            '3+ years of experience in luxury experience design',
                            'Strong understanding of human factors in space environments',
                            'Proficiency in design software and visualization tools',
                            'Innovative approach to creating unique experiences'
                        ],
                        responsibilities: [
                            'Design luxurious and comfortable space environments',
                            'Create unique experiences for passengers',
                            'Optimize living spaces for microgravity conditions',
                            'Collaborate with engineering teams on interior design',
                            'Ensure aesthetic and functional excellence'
                        ]
                    },
                    { 
                        title: 'Cultural Ambassador', 
                        salary: '$55,000 - $95,000', 
                        icon: 'fas fa-globe',
                        requirements: [
                            'Bachelor\'s degree in International Relations, Anthropology, or related field',
                            '2+ years of experience in cultural exchange or diplomacy',
                            'Fluency in multiple languages',
                            'Strong interpersonal and communication skills',
                            'Knowledge of diverse cultural practices and traditions'
                        ],
                        responsibilities: [
                            'Facilitate cultural exchange during missions',
                            'Educate passengers about space exploration history',
                            'Coordinate international collaboration activities',
                            'Promote peaceful cooperation in space',
                            'Document cultural experiences and interactions'
                        ]
                    }
                ]
            },
            {
                id: 'medical',
                category: 'Medical & Safety',
                icon: 'fas fa-heartbeat',
                jobs: [
                    { 
                        title: 'Space Medicine Physician', 
                        salary: '$200,000 - $350,000', 
                        icon: 'fas fa-stethoscope',
                        requirements: [
                            'MD degree from accredited medical school',
                            'Board certification in Aerospace Medicine or related specialty',
                            '5+ years of clinical experience',
                            'Experience with telemedicine and remote healthcare',
                            'Understanding of space physiology and psychology'
                        ],
                        responsibilities: [
                            'Provide medical care for crew and passengers',
                            'Monitor health and fitness during missions',
                            'Develop and implement health protocols',
                            'Conduct research on space medicine topics',
                            'Train crew in medical emergency procedures'
                        ]
                    },
                    { 
                        title: 'Flight Surgeon', 
                        salary: '$180,000 - $300,000', 
                        icon: 'fas fa-user-md',
                        requirements: [
                            'MD degree from accredited medical school',
                            'Residency in Aerospace Medicine or related field',
                            '3+ years of experience in flight medicine',
                            'Strong understanding of aerospace physiology',
                            'Excellent diagnostic and emergency response skills'
                        ],
                        responsibilities: [
                            'Ensure crew medical readiness for missions',
                            'Monitor crew health during flights',
                            'Respond to medical emergencies in flight',
                            'Coordinate with ground-based medical teams',
                            'Maintain medical equipment and supplies'
                        ]
                    },
                    { 
                        title: 'Biomedical Engineer', 
                        salary: '$100,000 - $170,000', 
                        icon: 'fas fa-dna',
                        requirements: [
                            'Master\'s degree in Biomedical Engineering or related field',
                            '3+ years of experience in medical device development',
                            'Knowledge of regulatory requirements for medical devices',
                            'Strong analytical and problem-solving skills',
                            'Experience with telemedicine technologies'
                        ],
                        responsibilities: [
                            'Design and develop medical devices for space use',
                            'Test and validate biomedical equipment',
                            'Support medical operations during missions',
                            'Troubleshoot technical issues with medical systems',
                            'Ensure compliance with safety and quality standards'
                        ]
                    },
                    { 
                        title: 'Psychologist', 
                        salary: '$90,000 - $150,000', 
                        icon: 'fas fa-brain',
                        requirements: [
                            'PhD in Psychology with focus on behavioral health',
                            '3+ years of experience in clinical psychology',
                            'Knowledge of isolation and confinement psychology',
                            'Experience with group dynamics and team performance',
                            'Strong research and assessment skills'
                        ],
                        responsibilities: [
                            'Support crew mental health and well-being',
                            'Monitor psychological effects of space travel',
                            'Develop coping strategies for isolation',
                            'Facilitate team building and conflict resolution',
                            'Conduct research on space psychology topics'
                        ]
                    },
                    { 
                        title: 'Emergency Response Specialist', 
                        salary: '$75,000 - $130,000', 
                        icon: 'fas fa-ambulance',
                        requirements: [
                            'Bachelor\'s degree in Emergency Management or related field',
                            '5+ years of experience in emergency response',
                            'Certification in emergency medical services preferred',
                            'Knowledge of hazardous materials handling',
                            'Strong leadership and decision-making skills'
                        ],
                        responsibilities: [
                            'Develop and implement emergency response procedures',
                            'Train crew in emergency protocols',
                            'Coordinate response to in-flight emergencies',
                            'Maintain emergency equipment and supplies',
                            'Conduct post-incident analysis and reporting'
                        ]
                    }
                ]
            },
            {
                id: 'ground',
                category: 'Ground Support',
                icon: 'fas fa-building',
                jobs: [
                    { 
                        title: 'Mission Control Operator', 
                        salary: '$80,000 - $140,000', 
                        icon: 'fas fa-gamepad',
                        requirements: [
                            'Bachelor\'s degree in Engineering, Computer Science, or related field',
                            '3+ years of experience in operations or control systems',
                            'Strong analytical and problem-solving abilities',
                            'Ability to work under high-pressure conditions',
                            'Excellent communication and teamwork skills'
                        ],
                        responsibilities: [
                            'Monitor spacecraft systems and crew status',
                            'Coordinate with flight crew and support teams',
                            'Respond to anomalies and emergency situations',
                            'Document mission events and activities',
                            'Support mission planning and execution'
                        ]
                    },
                    { 
                        title: 'Trajectory Analyst', 
                        salary: '$90,000 - $150,000', 
                        icon: 'fas fa-chart-line',
                        requirements: [
                            'Master\'s degree in Aerospace Engineering, Physics, or Mathematics',
                            '3+ years of experience in orbital mechanics',
                            'Proficiency in trajectory analysis software',
                            'Strong mathematical and computational skills',
                            'Knowledge of space mission design principles'
                        ],
                        responsibilities: [
                            'Calculate and optimize spacecraft trajectories',
                            'Analyze orbital mechanics and mission parameters',
                            'Support mission planning and navigation',
                            'Develop trajectory correction procedures',
                            'Coordinate with flight dynamics teams'
                        ]
                    },
                    { 
                        title: 'Communications Specialist', 
                        salary: '$70,000 - $120,000', 
                        icon: 'fas fa-satellite-dish',
                        requirements: [
                            'Bachelor\'s degree in Communications, Electrical Engineering, or related field',
                            '2+ years of experience in telecommunications',
                            'Knowledge of satellite communications systems',
                            'Strong technical troubleshooting abilities',
                            'Experience with data transmission protocols'
                        ],
                        responsibilities: [
                            'Manage communication links with spacecraft',
                            'Monitor and maintain communication equipment',
                            'Troubleshoot communication system issues',
                            'Coordinate data transmission and reception',
                            'Ensure reliable communication during missions'
                        ]
                    },
                    { 
                        title: 'Logistics Coordinator', 
                        salary: '$65,000 - $110,000', 
                        icon: 'fas fa-truck',
                        requirements: [
                            'Bachelor\'s degree in Logistics, Supply Chain Management, or related field',
                            '3+ years of experience in logistics coordination',
                            'Strong organizational and planning skills',
                            'Proficiency in logistics management software',
                            'Ability to manage complex supply chains'
                        ],
                        responsibilities: [
                            'Coordinate supply chain for space missions',
                            'Manage inventory of equipment and supplies',
                            'Plan and execute cargo loading operations',
                            'Track shipments and delivery schedules',
                            'Ensure compliance with safety and quality standards'
                        ]
                    },
                    { 
                        title: 'Training Instructor', 
                        salary: '$60,000 - $100,000', 
                        icon: 'fas fa-chalkboard-teacher',
                        requirements: [
                            'Bachelor\'s degree in Education, Aerospace, or related field',
                            '3+ years of experience in training and instruction',
                            'Strong presentation and communication skills',
                            'Knowledge of space systems and operations',
                            'Ability to develop training curricula and materials'
                        ],
                        responsibilities: [
                            'Develop and deliver training programs for crew',
                            'Create training materials and simulations',
                            'Evaluate trainee performance and progress',
                            'Update training programs based on mission requirements',
                            'Support certification and qualification processes'
                        ]
                    }
                ]
            }
        ];
        this.jobDataMap = {}; // Store job data with unique IDs
        this.nextJobId = 0; // Counter for unique job IDs
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.renderCareerCards();
            });
        } else {
            this.setupEventListeners();
            this.renderCareerCards();
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('careersSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCareers(e.target.value);
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('careersFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }
    }

    renderCareerCards() {
        const careersGrid = document.getElementById('careersGrid');
        if (!careersGrid) return;

        careersGrid.innerHTML = '';

        this.careerData.forEach((career, index) => {
            const card = this.createCareerCard(career, index);
            careersGrid.appendChild(card);
        });

        // Add event listeners to job items after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.setupCardEventListeners();
        }, 100);
    }

    createCareerCard(career, index) {
        const card = document.createElement('div');
        card.className = `career-card ${career.id}`;
        
        // Create job items with safer data handling
        let jobItemsHtml = '';
        career.jobs.forEach((job) => {
            // Generate a unique ID for this job
            const jobId = `job-${this.nextJobId++}`;
            this.jobDataMap[jobId] = { job, category: career.category };
            
            jobItemsHtml += `
                <div class="job-item" data-job-id="${jobId}">
                    <i class="${job.icon}"></i>
                    <div class="job-title">${job.title}</div>
                    <div class="job-salary">${job.salary}</div>
                </div>
            `;
        });
        
        card.innerHTML = `
            <div class="career-card-header">
                <i class="${career.icon}"></i>
                <h3>${career.category}</h3>
                <div class="job-count">${career.jobs.length} Positions Available</div>
            </div>
            <div class="job-list">
                ${jobItemsHtml}
            </div>
            <button class="expand-btn">
                View Positions <i class="fas fa-chevron-down"></i>
            </button>
        `;

        return card;
    }

    setupCardEventListeners() {
        // Add event listeners to expand buttons
        const cards = document.querySelectorAll('.career-card');
        cards.forEach(card => {
            const expandBtn = card.querySelector('.expand-btn');
            if (expandBtn) {
                // Remove existing event listeners to prevent duplicates
                const newBtn = expandBtn.cloneNode(true);
                expandBtn.parentNode.replaceChild(newBtn, expandBtn);
                
                newBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.classList.toggle('expanded');
                });
            }
        });

        // Add event listeners to job items
        this.setupJobEventListeners();
    }

    setupJobEventListeners() {
        const jobItems = document.querySelectorAll('.job-item');
        
        jobItems.forEach((item) => {
            // Remove existing event listeners to prevent duplicates
            const jobId = item.getAttribute('data-job-id');
            const newElement = item.cloneNode(true);
            item.parentNode.replaceChild(newElement, item);
            
            // Add new event listener
            newElement.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.jobDataMap && this.jobDataMap[jobId]) {
                    const { job, category } = this.jobDataMap[jobId];
                    this.showJobDetails(job, category);
                }
            });
        });
    }

    showJobDetails(job, category) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'job-details-modal';
        modal.innerHTML = `
            <div class="job-details-modal-content">
                <div class="job-details-modal-header">
                    <h2><i class="${job.icon}"></i> ${job.title}</h2>
                    <button class="job-details-modal-close">&times;</button>
                </div>
                <div class="job-details-modal-body">
                    <div class="job-overview">
                        <div class="job-category"><i class="fas fa-tag"></i> ${category}</div>
                        <div class="job-salary"><i class="fas fa-dollar-sign"></i> ${job.salary}</div>
                    </div>
                    
                    <div class="job-section">
                        <h3><i class="fas fa-tasks"></i> Responsibilities</h3>
                        <ul class="job-responsibilities">
                            ${job.responsibilities ? job.responsibilities.map(resp => `<li>${resp}</li>`).join('') : '<li>Responsibilities information not available</li>'}
                        </ul>
                    </div>
                    
                    <div class="job-section">
                        <h3><i class="fas fa-clipboard-list"></i> Requirements</h3>
                        <ul class="job-requirements">
                            ${job.requirements ? job.requirements.map(req => `<li>${req}</li>`).join('') : '<li>Requirements information not available</li>'}
                        </ul>
                    </div>
                    
                    <div class="job-section">
                        <h3><i class="fas fa-file-alt"></i> Apply for this Position</h3>
                        <form class="job-application-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="applicantName">Full Name *</label>
                                    <input type="text" id="applicantName" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="applicantEmail">Email Address *</label>
                                    <input type="email" id="applicantEmail" name="email" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="applicantPhone">Phone Number</label>
                                    <input type="tel" id="applicantPhone" name="phone">
                                </div>
                                <div class="form-group">
                                    <label for="applicantExperience">Years of Experience *</label>
                                    <input type="number" id="applicantExperience" name="experience" min="0" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="applicantEducation">Highest Education Level *</label>
                                <select id="applicantEducation" name="education" required>
                                    <option value="">Select Education Level</option>
                                    <option value="high-school">High School</option>
                                    <option value="associate">Associate Degree</option>
                                    <option value="bachelor">Bachelor's Degree</option>
                                    <option value="master">Master's Degree</option>
                                    <option value="doctorate">Doctorate</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="applicantResume">Resume/CV *</label>
                                <input type="file" id="applicantResume" name="resume" accept=".pdf,.doc,.docx" required>
                                <small class="form-hint">Please upload in PDF, DOC, or DOCX format</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="applicantCoverLetter">Cover Letter</label>
                                <textarea id="applicantCoverLetter" name="coverLetter" rows="5" placeholder="Tell us why you're interested in this position and what makes you a great candidate..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="applicantAgreement" required>
                                    I agree to the terms and conditions and privacy policy
                                </label>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancelApplication">Cancel</button>
                                <button type="submit" class="btn btn-primary">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .job-details-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .job-details-modal-content {
                background: linear-gradient(145deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
                border-radius: 25px;
                width: 90%;
                max-width: 900px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(170, 0, 255, 0.5);
                position: relative;
            }
            
            .job-details-modal-header {
                padding: 20px 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(10, 10, 15, 0.7);
            }
            
            .job-details-modal-header h2 {
                font-family: 'Orbitron', monospace;
                color: var(--plasma-green);
                margin: 0;
                font-size: 1.8rem;
            }
            
            .job-details-modal-header h2 i {
                margin-right: 10px;
            }
            
            .job-details-modal-close {
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
            
            .job-details-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }
            
            .job-details-modal-body {
                padding: 30px;
                max-height: 75vh;
                overflow-y: auto;
            }
            
            .job-overview {
                display: flex;
                gap: 20px;
                margin-bottom: 30px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .job-category, .job-salary {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-secondary);
            }
            
            .job-category i, .job-salary i {
                color: var(--plasma-green);
            }
            
            .job-section {
                margin-bottom: 30px;
            }
            
            .job-section h3 {
                color: var(--plasma-green);
                margin-bottom: 15px;
                font-family: 'Orbitron', monospace;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .job-responsibilities, .job-requirements {
                list-style: none;
                padding: 0;
            }
            
            .job-responsibilities li, .job-requirements li {
                padding: 12px 0;
                padding-left: 30px;
                position: relative;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                color: var(--text-secondary);
            }
            
            .job-responsibilities li:last-child, .job-requirements li:last-child {
                border-bottom: none;
            }
            
            .job-responsibilities li:before, .job-requirements li:before {
                content: "•";
                color: var(--plasma-green);
                position: absolute;
                left: 0;
                font-size: 1.5rem;
                line-height: 1;
            }
            
            .job-application-form {
                background: rgba(255, 255, 255, 0.03);
                padding: 25px;
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .form-row {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .form-group {
                flex: 1;
                margin-bottom: 20px;
            }
            
            .form-group.full-width {
                width: 100%;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--text-primary);
                font-weight: 500;
            }
            
            .form-group input, .form-group select, .form-group textarea {
                width: 100%;
                padding: 12px 15px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(10, 10, 15, 0.7);
                color: var(--text-primary);
                font-family: 'Exo 2', sans-serif;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                outline: none;
                border-color: var(--plasma-green);
                box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.3);
            }
            
            .form-hint {
                display: block;
                margin-top: 5px;
                color: var(--text-secondary);
                font-size: 0.85rem;
            }
            
            .form-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .btn {
                padding: 12px 25px;
                border-radius: 8px;
                font-family: 'Exo 2', sans-serif;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                border: none;
            }
            
            .btn-primary {
                background: var(--gradient-success);
                color: white;
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-secondary);
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
            }
            
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
                color: var(--text-primary);
            }
            
            @media (max-width: 768px) {
                .job-details-modal-content {
                    width: 95%;
                    height: 95%;
                }
                
                .job-details-modal-body {
                    padding: 20px;
                }
                
                .form-row {
                    flex-direction: column;
                    gap: 0;
                }
                
                .job-overview {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('.job-details-modal-close');
        const cancelBtn = modal.querySelector('#cancelApplication');
        
        const closeModal = () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Handle form submission
        const form = modal.querySelector('.job-application-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitApplication(job, form);
        });
    }

    submitApplication(job, form) {
        // In a real application, this would send the data to a server
        // For this demo, we'll just show a success message
        
        const modalBody = form.closest('.job-details-modal-body');
        modalBody.innerHTML = `
            <div class="application-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Application Submitted Successfully!</h2>
                <p>Thank you for your interest in the <strong>${job.title}</strong> position.</p>
                <p>Your application has been received and our recruitment team will review it shortly.</p>
                <p>We'll contact you via email to arrange the next steps in the selection process.</p>
                <button class="btn btn-primary" id="closeSuccessModal">Close</button>
            </div>
        `;
        
        // Add success styles
        const style = document.createElement('style');
        style.textContent = `
            .application-success {
                text-align: center;
                padding: 40px 20px;
            }
            
            .success-icon {
                font-size: 4rem;
                color: var(--plasma-green);
                margin-bottom: 20px;
                animation: pulse 1s infinite;
            }
            
            .application-success h2 {
                color: var(--plasma-green);
                margin-bottom: 20px;
                font-family: 'Orbitron', monospace;
            }
            
            .application-success p {
                color: var(--text-secondary);
                margin-bottom: 15px;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        
        document.head.appendChild(style);
        
        // Add close functionality
        const closeBtn = modalBody.querySelector('#closeSuccessModal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(document.querySelector('.job-details-modal'));
            document.head.removeChild(style);
        });
    }

    filterCareers(searchTerm) {
        const cards = document.querySelectorAll('.career-card');
        searchTerm = searchTerm.toLowerCase();

        cards.forEach(card => {
            const category = card.querySelector('h3').textContent.toLowerCase();
            const jobs = card.querySelectorAll('.job-title');
            let match = category.includes(searchTerm);

            jobs.forEach(job => {
                if (job.textContent.toLowerCase().includes(searchTerm)) {
                    match = true;
                }
            });

            card.style.display = match ? 'block' : 'none';
        });
    }

    filterByCategory(category) {
        const cards = document.querySelectorAll('.career-card');

        if (category === 'all') {
            cards.forEach(card => {
                card.style.display = 'block';
            });
        } else {
            cards.forEach(card => {
                if (card.classList.contains(category)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
}