/* This is the full content for your new 'dialog.js' file */

(function(toolUrl) {
    const d = document;
    
    // Safety check for duplication
    if (d.getElementById('a11y-dialog-container')) { return; }

    const c = d.createElement('div');
    c.id = 'a11y-dialog-container';
    c.setAttribute('role', 'dialog');
    c.setAttribute('aria-modal', 'true');
    c.setAttribute('aria-labelledby', 'a11y-dialog-title');
    // Instructions are now provided via aria-describedby for screen reader users
    c.setAttribute('aria-describedby', 'a11y-dialog-instructions'); 
    
    // Backdrop style
    c.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;';

    // 1. Inject Styles (Optimized for Low Vision and Background Blur)
    const s = d.createElement('style');
    s.textContent = `
/* Low Vision & High Contrast Styling */
#a11y-dialog-box{
    background:#fff;
    color:#000 !important;
    padding:30px; 
    border-radius:12px;
    max-width:550px; /* Increased size */
    min-width:350px;
    font-family:Verdana, Geneva, sans-serif; /* High readability font */
    box-shadow:0 10px 40px rgba(0,0,0,0.8);
    border: 3px solid #4f46e5; /* Accent border */
    font-size: 1.1em; /* Increased base font size */
}
#a11y-dialog-title{
    font-size:1.8em; /* Larger heading */
    font-weight:bold;
    color:#000 !important;
    margin:0 0 15px;
    outline: none; /* Focusable but without visible outline on open */
}
#a11y-dialog-box p{
    color:#111 !important;
    margin:0 0 25px;
    line-height:1.6;
}
#a11y-dialog-box button{
    background:#4f46e5;
    color:#fff !important;
    border:none;
    padding:12px 20px; /* Bigger buttons */
    font-size:1.1em;
    border-radius:6px;
    cursor:pointer;
    margin-right:15px;
    transition:background 0.3s;
}
#a11y-dialog-box button#a11y-btn-close{
    background:#e54646; 
    margin-right: 0;
}
#a11y-dialog-box button:focus{
    outline:4px solid #005fcc; /* Stronger focus indicator */
    outline-offset:3px;
}
#a11y-dialog-instructions {
    color: #4f46e5 !important;
    font-size: 0.95em;
    margin-top: 15px;
    display: block;
}

/* Background Blur Implementation */
body.a11y-dialog-open > *:not(#a11y-dialog-container):not(style) {
    filter: blur(4px) brightness(0.7); /* Blur and darken background */
    transition: filter 0.3s ease-out;
    pointer-events: none; /* Prevent interaction with background */
}
    `;
    d.head.append(s);

    // 2. Build Dialog Content
    const b = d.createElement('div');
    b.id = 'a11y-dialog-box';
    b.innerHTML = `
<h2 id="a11y-dialog-title" tabindex="-1">A11y Quick Check Audit</h2>
<p>
    Welcome to the A11y Quick Check **bookmarklet** tool. This tool performs an instant, non-destructive, surface-level accessibility audit on the current webpage by injecting screen reader-friendly messages directly onto problematic elements.<br><br>
    The audit focuses on core structural and semantic issues, including missing <code>lang</code> attributes, heading hierarchy problems, missing form field labels, unique landmark naming, and valid keyboard focus management.
</p>
<button id="a11y-btn-here">Analyze Here (In-Page Overlay)</button>
<button id="a11y-btn-newtab">Analyze in New Tab (Dedicated Tool)</button>
<button id="a11y-btn-close">Close Dialog</button>
<span id="a11y-dialog-instructions" aria-hidden="true">
    Press the Escape key to close this dialog without running the audit.
</span>`;
    
    c.append(b);
    d.body.append(c);
    d.body.classList.add('a11y-dialog-open'); // Apply background blur

    const btnHere = d.getElementById('a11y-btn-here');
    const btnNewTab = d.getElementById('a11y-btn-newtab');
    const btnClose = d.getElementById('a11y-btn-close');
    const dialogTitle = d.getElementById('a11y-dialog-title');
    
    // Get focusable elements for trapping
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    // We add the focusable buttons to the list to create the loop order
    const focusableEls = [dialogTitle, ...Array.from(b.querySelectorAll(focusableSelector)).filter(el => !el.disabled)];
    
    const firstFocusableEl = focusableEls[0]; // Which is the dialogTitle
    const lastFocusableEl = focusableEls[focusableEls.length - 1]; 

    const closeDialog = () => { 
        c.remove(); 
        s.remove(); 
        d.body.classList.remove('a11y-dialog-open'); // Remove background blur
    };

    // Button Handlers
    btnHere.onclick = () => {
        const script = d.createElement('script');
        script.src = toolUrl + 'run-on-page.js?v=' + Date.now();
        d.head.append(script);
        closeDialog();
    };

    btnNewTab.onclick = () => {
        const code = encodeURIComponent(d.documentElement.outerHTML);
        window.open(toolUrl + '#code=' + code, '_blank');
        closeDialog();
    };

    btnClose.onclick = closeDialog;

    // 3. Focus Trapping and Escape Logic
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
            e.preventDefault();
        } else if (e.key === 'Tab') {
            
            if (e.shiftKey) {
                // Shift + Tab: If focus is on the title (first), loop to last button
                if (d.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else {
                // Tab: If focus is on the last button, loop to title (first)
                if (d.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        }
    };

    c.addEventListener('keydown', handleKeydown);
    
    // Set initial focus to the heading (due to tabindex="-1" on the H2)
    if (dialogTitle) {
        dialogTitle.focus();
    }

})(window.A11yQuickCheckToolUrl);
