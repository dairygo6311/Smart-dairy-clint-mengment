// Theme Toggle Component with Animations
class ThemeToggle {
    constructor(options = {}) {
        this.options = {
            showLabel: options.showLabel || false,
            variant: options.variant || 'default', // 'default', 'circle', 'circle-blur', 'gif'
            start: options.start || 'top-left', // for circle variants
            url: options.url || null, // for gif variant
            container: options.container || document.body,
            ...options
        };
        
        this.currentTheme = this.getStoredTheme() || 'light';
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.createElement();
        this.bindEvents();
        this.applyTheme(this.currentTheme, false);
    }
    
    createElement() {
        this.element = document.createElement('button');
        this.element.className = this.getClasses();
        
        if (this.options.variant === 'gif' && this.options.url) {
            this.element.style.backgroundImage = `url(${this.options.url})`;
        }
        
        this.updateContent();
        
        if (this.options.container instanceof Element) {
            this.options.container.appendChild(this.element);
        } else {
            document.querySelector(this.options.container).appendChild(this.element);
        }
    }
    
    getClasses() {
        let classes = ['theme-toggle'];
        
        if (this.options.showLabel) {
            classes.push('with-label');
        }
        
        if (this.options.variant !== 'default') {
            classes.push(this.options.variant);
        }
        
        if (this.options.variant === 'circle' || this.options.variant === 'circle-blur') {
            classes.push(this.options.start);
        }
        
        return classes.join(' ');
    }
    
    updateContent() {
        const isDark = this.currentTheme === 'dark';
        const icon = isDark ? '☀️' : '🌙';
        const text = isDark ? 'Light' : 'Dark';
        
        if (this.options.variant === 'gif') {
            this.element.innerHTML = this.options.showLabel ? 
                `<span class="theme-label">${text}</span>` : '';
        } else {
            this.element.innerHTML = this.options.showLabel ? 
                `<span class="icon">${icon}</span><span class="theme-label">${text}</span>` : 
                `<span class="icon">${icon}</span>`;
        }
    }
    
    bindEvents() {
        this.element.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.toggle();
            }
        });
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme, true);
    }
    
    applyTheme(theme, animate = false) {
        if (animate && !this.isAnimating) {
            this.playAnimation();
        }
        
        this.currentTheme = theme;
        this.storeTheme(theme);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update button content
        setTimeout(() => {
            this.updateContent();
        }, animate ? 300 : 0);
        
        // Emit custom event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme }
        }));
    }
    
    playAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.element.classList.add('animating');
        
        setTimeout(() => {
            this.element.classList.remove('animating');
            this.isAnimating = false;
        }, this.getAnimationDuration());
    }
    
    getAnimationDuration() {
        switch (this.options.variant) {
            case 'circle-blur': return 800;
            case 'circle': return 600;
            case 'gif': return 500;
            default: return 500;
        }
    }
    
    getStoredTheme() {
        try {
            return localStorage.getItem('app-theme');
        } catch {
            return null;
        }
    }
    
    storeTheme(theme) {
        try {
            localStorage.setItem('app-theme', theme);
        } catch {
            // localStorage not available
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Theme Toggle Factory Functions
window.createThemeToggle = function(options = {}) {
    return new ThemeToggle(options);
};

// Create multiple toggle variants for demo
window.createThemeTogglesDemo = function(container) {
    const demoContainer = document.querySelector(container);
    if (!demoContainer) return;
    
    demoContainer.innerHTML = '';
    demoContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    // GIF variants
    const gifUrls = [
        'https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif?cid=790b76112m5eeeydoe7et0cr3j3ekb1erunxozyshuhxx2vl&ep=v1_stickers_search&rid=giphy.gif&ct=s',
        'https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s',
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3JwcXdzcHd5MW92NWprZXVpcTBtNXM5cG9obWh0N3I4NzFpaDE3byZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/WgsVx6C4N8tjy/giphy.gif',
        'https://media.giphy.com/media/ArfrRmFCzYXsC6etQX/giphy.gif?cid=ecf05e47kn81xmnuc9vd5g6p5xyjt14zzd3dzwso6iwgpvy3&ep=v1_stickers_search&rid=giphy.gif&ct=s'
    ];
    
    gifUrls.forEach(url => {
        new ThemeToggle({
            showLabel: true,
            variant: 'gif',
            url: url,
            container: demoContainer
        });
    });
    
    // Default variant
    new ThemeToggle({
        showLabel: true,
        container: demoContainer
    });
    
    // Circle blur variants
    ['top-right', 'bottom-left', 'bottom-right'].forEach(start => {
        new ThemeToggle({
            showLabel: true,
            variant: 'circle-blur',
            start: start,
            container: demoContainer
        });
    });
    
    // Circle variants
    ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].forEach(start => {
        new ThemeToggle({
            showLabel: true,
            variant: 'circle',
            start: start,
            container: demoContainer
        });
    });
};

// Auto-initialize theme from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const storedTheme = localStorage.getItem('app-theme') || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeToggle;
}