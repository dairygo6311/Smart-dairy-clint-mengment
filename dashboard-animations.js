// Advanced Dashboard Animations
class DashboardAnimations {
    constructor() {
        this.counters = [];
        this.progressBars = [];
        this.isAnimating = false;
    }

    // Initialize all dashboard animations
    init() {
        this.setupCounters();
        this.setupProgressBars();
        this.startAnimations();
    }

    // Setup animated counters
    setupCounters() {
        this.counters = [
            { element: document.getElementById('total-clients'), target: 0, current: 0 },
            { element: document.getElementById('active-clients'), target: 0, current: 0 },
            { element: document.getElementById('inactive-clients'), target: 0, current: 0 }
        ];
    }

    // Setup progress bars
    setupProgressBars() {
        this.progressBars = [
            { element: document.getElementById('total-progress'), percentage: 0 },
            { element: document.getElementById('active-progress'), percentage: 0 },
            { element: document.getElementById('inactive-progress'), percentage: 0 }
        ];
    }

    // Update statistics with animation
    updateStats(totalClients, activeClients, inactiveClients) {
        if (this.isAnimating) return;
        
        const total = totalClients || 0;
        const active = activeClients || 0;
        const inactive = inactiveClients || 0;

        // Update counter targets
        this.counters[0].target = total;
        this.counters[1].target = active;
        this.counters[2].target = inactive;

        // Calculate percentages for progress bars
        const totalMax = Math.max(total, 10); // Minimum scale for visual effect
        this.progressBars[0].percentage = Math.min((total / totalMax) * 100, 100);
        this.progressBars[1].percentage = total > 0 ? (active / total) * 100 : 0;
        this.progressBars[2].percentage = total > 0 ? (inactive / total) * 100 : 0;

        this.animateCounters();
        this.animateProgressBars();
    }

    // Animate counter numbers
    animateCounters() {
        this.isAnimating = true;
        const duration = 2000; // 2 seconds
        const steps = 60;
        const interval = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = this.easeOutCubic(currentStep / steps);

            this.counters.forEach(counter => {
                if (counter.element) {
                    const value = Math.floor(counter.target * progress);
                    counter.current = value;
                    counter.element.textContent = this.formatNumber(value);
                    
                    // Add pulsing effect on significant changes
                    if (currentStep === steps && counter.target > 0) {
                        this.addPulseEffect(counter.element);
                    }
                }
            });

            if (currentStep >= steps) {
                clearInterval(timer);
                this.isAnimating = false;
            }
        }, interval);
    }

    // Animate progress bars
    animateProgressBars() {
        setTimeout(() => {
            this.progressBars.forEach(bar => {
                if (bar.element) {
                    bar.element.style.width = `${bar.percentage}%`;
                }
            });
        }, 500); // Start after counter animation begins
    }

    // Easing function for smooth animation
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Format numbers with commas
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    // Add pulse effect to elements
    addPulseEffect(element) {
        element.style.animation = 'numberPulse 0.6s ease-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    // Start background animations
    startAnimations() {
        this.createFloatingParticles();
        this.startCardAnimations();
    }

    // Create floating particles in the background
    createFloatingParticles() {
        const dashboard = document.getElementById('dashboard-screen');
        if (!dashboard) return;

        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'dashboard-particles';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;

        // Create individual particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 6 + 2}px;
                height: ${Math.random() * 6 + 2}px;
                background: rgba(102, 126, 234, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 20 + 15}s infinite linear;
                animation-delay: ${Math.random() * 5}s;
            `;
            particleContainer.appendChild(particle);
        }

        dashboard.style.position = 'relative';
        dashboard.appendChild(particleContainer);
    }

    // Start card entrance animations
    startCardAnimations() {
        const cards = document.querySelectorAll('.stat-card-advanced');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 200);
        });
    }

    // Reset all animations
    reset() {
        this.counters.forEach(counter => {
            if (counter.element) {
                counter.current = 0;
                counter.target = 0;
                counter.element.textContent = '0';
            }
        });

        this.progressBars.forEach(bar => {
            if (bar.element) {
                bar.element.style.width = '0%';
            }
        });

        this.isAnimating = false;
    }
}

// Add CSS for number pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes numberPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    @keyframes floatParticle {
        0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
            opacity: 0;
        }
    }

    .dashboard-particles {
        overflow: hidden;
    }

    .stat-card-advanced.animate-in {
        animation: cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    /* Enhanced hover effects */
    .stat-card-advanced:hover .stat-number {
        text-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }

    .stat-card-advanced:hover .stat-icon-advanced {
        animation: iconFloat 2s ease-in-out infinite;
    }

    @keyframes iconFloat {
        0%, 100% { transform: rotate(10deg) scale(1.1) translateY(0px); }
        50% { transform: rotate(10deg) scale(1.1) translateY(-5px); }
    }

    /* Loading shimmer effect */
    .stat-loading {
        background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            rgba(255, 255, 255, 0.1) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(style);

// Initialize dashboard animations
window.dashboardAnimations = new DashboardAnimations();

// Auto-initialize when dashboard is shown
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations when dashboard screen becomes active
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const dashboard = document.getElementById('dashboard-screen');
                if (dashboard && dashboard.classList.contains('active')) {
                    setTimeout(() => {
                        window.dashboardAnimations.init();
                    }, 100);
                }
            }
        });
    });

    const dashboard = document.getElementById('dashboard-screen');
    if (dashboard) {
        observer.observe(dashboard, { attributes: true });
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardAnimations;
}