// Skiper UI utility functions for vanilla JavaScript implementation

// Utility function to merge classes (similar to cn function in Skiper UI)
function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}

// Button component styling classes
const buttonVariants = {
    default: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline"
};

// Input component styling classes
const inputClasses = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Card component styling classes
const cardClasses = {
    card: "rounded-lg border bg-card text-card-foreground shadow-sm",
    header: "flex flex-col space-y-1.5 p-6",
    title: "text-2xl font-semibold leading-none tracking-tight",
    description: "text-sm text-muted-foreground",
    content: "p-6 pt-0",
    footer: "flex items-center p-6 pt-0"
};

// Apply Skiper UI button styling to an element
function applyButtonStyling(element, variant = 'default') {
    element.className = cn(buttonVariants[variant], element.className);
}

// Apply Skiper UI input styling to an element
function applyInputStyling(element) {
    element.className = cn(inputClasses, element.className);
}

// Apply Skiper UI card styling to elements
function applyCardStyling(cardElement, headerElement, titleElement, contentElement) {
    if (cardElement) cardElement.className = cn(cardClasses.card, cardElement.className);
    if (headerElement) headerElement.className = cn(cardClasses.header, headerElement.className);
    if (titleElement) titleElement.className = cn(cardClasses.title, titleElement.className);
    if (contentElement) contentElement.className = cn(cardClasses.content, contentElement.className);
}

// Create a Skiper UI styled button
function createSkiperButton(text, variant = 'default', icon = '', onClick = null) {
    const button = document.createElement('button');
    button.innerHTML = icon ? `<i class="${icon}"></i> ${text}` : text;
    button.className = buttonVariants[variant];
    if (onClick) button.onclick = onClick;
    return button;
}

// Create a Skiper UI styled input
function createSkiperInput(placeholder = '', type = 'text') {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.className = inputClasses;
    return input;
}

// Create a Skiper UI styled card
function createSkiperCard(title = '', content = '') {
    const card = document.createElement('div');
    card.className = cardClasses.card;
    
    if (title) {
        const header = document.createElement('div');
        header.className = cardClasses.header;
        
        const titleEl = document.createElement('h3');
        titleEl.className = cardClasses.title;
        titleEl.textContent = title;
        
        header.appendChild(titleEl);
        card.appendChild(header);
    }
    
    if (content) {
        const contentEl = document.createElement('div');
        contentEl.className = cardClasses.content;
        contentEl.innerHTML = content;
        card.appendChild(contentEl);
    }
    
    return card;
}

// Wrap Button component (inspired by Skiper UI)
function createWrapButton(text, href = '#', icon = '') {
    const button = document.createElement('a');
    button.href = href;
    button.innerHTML = icon ? `<i class="${icon}"></i> ${text}` : text;
    button.className = cn(
        "group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium",
        "bg-gradient-to-r from-slate-900 to-slate-700 text-white",
        "rounded-lg border border-slate-200/20 shadow-sm",
        "transition-all duration-200 ease-out",
        "hover:shadow-lg hover:shadow-slate-900/25",
        "hover:scale-105 hover:-translate-y-0.5",
        "active:scale-95 active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
    );
    
    // Add shimmer effect
    const shimmer = document.createElement('div');
    shimmer.className = "absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse";
    button.appendChild(shimmer);
    
    return button;
}

// Make functions globally available
window.skiperUI = {
    cn,
    buttonVariants,
    inputClasses,
    cardClasses,
    applyButtonStyling,
    applyInputStyling,
    applyCardStyling,
    createSkiperButton,
    createSkiperInput,
    createSkiperCard,
    createWrapButton
};