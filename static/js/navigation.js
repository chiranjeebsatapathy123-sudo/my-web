/**
 * navigation.js
 * Smart Global Navigation helper for the PersonalVault portfolio.
 */

window.navigateBack = function(fallbackUrl = '/') {
    // Check if the user came from within the same application (same origin)
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;

    if (referrer && referrer.startsWith(currentOrigin)) {
        // Safe to go back via browser history
        window.history.back();
    } else {
        // Direct link or external entry, use fallback
        window.location.href = fallbackUrl;
    }
};

// Bind ESC key to go back logic globally if an element with class .go-back-btn exists
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const goBackBtn = document.querySelector('.go-back-btn');
        if (goBackBtn) {
            goBackBtn.click();
        }
    }
});
