// js/router.js
// This is the brain that loads our pages dynamically.

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');

// 1. The function that fetches and injects a page
async function loadPage(pageId) {
    try {
        // Send the robot to fetch the HTML file
        const response = await fetch(`pages/${pageId}.html`);
        
        // If the file doesn't exist, throw an error
        if (!response.ok) throw new Error('Page not found'); 
        
        // Get the text from the file
        const html = await response.text();

                // Inject it into the empty <main> tag!
        mainContent.innerHTML = html;

        // 👇 NEW: hand the "active" key to the page we just injected
        const injectedPage = mainContent.querySelector('.page');
        if (injectedPage) injectedPage.classList.add('active');
        // 👆

        // 👇 AUTOMATIC TRIGGERS FOR OUR MODULES 👇
        if (pageId === 'ethernet') initCsma();
        if (pageId === 'bluetooth') initFhss();   // <--- ADD THIS LINE!
        // 👆

        // Update the active class on the navigation links (the orange highlight)
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        // Update the URL (e.g., from #inicio to #ethernet) without reloading
        history.pushState(null, '', '#' + pageId);
        
        // Scroll to the top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        mainContent.innerHTML = `<h1>404 Error</h1><p>Could not load the page.</p>`;
        console.error(error);
    }
}

// 2. Listen for clicks on the navigation bar
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Stop the browser from jumping to the top of the page
        const pageId = this.dataset.page; // Grab "inicio", "ethernet", etc.
        loadPage(pageId); // Trigger the robot!
    });
});

// 3. Load the correct page when the website first opens
const initialHash = location.hash.replace('#', '') || 'inicio';
loadPage(initialHash);

// 4. Handle the browser's Back/Forward buttons
window.addEventListener('popstate', () => {
    const hash = location.hash.replace('#', '') || 'inicio';
    loadPage(hash);
});

// 5. INTERNAL LINKS (CTAs inside pages + footer links) via Event Delegation
document.addEventListener('click', function(e) {
    // Find the closest clicked element that is a hash link (or null)
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;                                   // not a link? ignore
    if (link.classList.contains('nav-link')) return;     // navbar already handled
    const pageId = link.getAttribute('href').slice(1);
    if (!pageId) return;                                 // bare "#" ? ignore
    e.preventDefault();
    loadPage(pageId);
});
