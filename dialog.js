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
    c.setAttribute('aria-describedby', 'a11y-dialog-instructions a11y-sited-tester-info'); // Updated aria-describedby
    
    // Backdrop style
    // High contrast background
    c.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;';

    // 1. Inject Styles (Maximum Contrast & Low Vision Optimization)
    const s = d.createElement('style');
    s.textContent = `
/* Low Vision & High Contrast Styling (White on Black/Dark Blue) */
#a11y-dialog-box{
    background:#111827; /* Dark background */
    color:#f3f4f6 !important; /* Light text */
    padding:35px; /* More padding */
    border-radius:15px;
    max-width:600px; /* Larger size */
    min-width:400px;
    font-family:Verdana, Geneva, sans-serif;
    box-shadow:0 15px 50px rgba(79, 70, 229, 0.7); /* Vibrant shadow */
    border: 4px solid #4f46e5; /* Strong accent border */
    font-size: 1.2em; /* Bigger base font size */
}
#a11y-dialog-title{
    font-size:2.0em; /* Extra large heading */
    font-weight:bold;
    color:#f3f4f6 !important;
    margin:0 0 20px;
    outline: none;
}
#a11y-dialog-box p{
    color:#e5e7eb !important;
    margin:0 0 28px;
    line-height:1.7; /* Increased line height for readability */
}
#a11y-dialog-box button{
    background:#4f46e5; /* Primary Button */
    color:#fff !important;
    border:none;
    padding:15px 25px; /* Largest buttons */
    font-size:1.2em;
    border-radius:8px;
    cursor:pointer;
    margin-right:20px;
    transition:background 0.3s, box-shadow 0.3s;
    font-weight: bold;
}
#a11y-dialog-box button#a11y-btn-close{
    background:#dc2626; /* Red Close Button */
    margin-right: 0;
}
#a11y-dialog-box button:focus{
    outline:5px solid #00c0ff; /* Super strong focus indicator */
    outline-offset:3px;
    box-shadow: 0 0 10px #00c0ff;
}
#a11y-dialog-instructions, #a11y-sited-tester-info {
    color: #a5b4fc !important; /* Lighter blue/purple for instruction text */
    font-size: 1.0em;
    margin-top: 10px;
    display: block;
}

/* Background Blur Implementation */
body.a11y-dialog-open > *:not(#a11y-dialog-container):not(style) {
    filter: blur(6px) brightness(0.6); /* Stronger blur and darken background */
    transition: filter 0.4s ease-out;
    pointer-events: none;
}
    `;
    d.head.append(s);

    // 2. Build Dialog Content
    const b = d.createElement('div');
    b.id = 'a11y-dialog-box';
    b.innerHTML = `
<h2 id="a11y-dialog-title" tabindex="-1">A11y Quick Check Audit Tool</h2>
<p>
    Welcome to the A11y Quick Check **bookmarklet**. This tool executes a quick, non-destructive, semantic accessibility audit on the current webpage by injecting invisible, screen reader-friendly messages directly next to any detected issue.<br><br>
    The audit focuses on core structural and semantic issues, including missing <code>lang</code> attributes, heading hierarchy problems, missing form field labels, unique landmark naming, and valid keyboard focus management.
</p>
<p id="a11y-sited-tester-info">
    **VISUAL RESULT:** Sited testers can read the complete audit result for any element by **hovering the mouse over the element**. The audit message will appear as the element's tooltip.
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
    // Ensure focus order is Title -> Button 1 -> Button 2 -> Button 3 (Close)
    const focusableEls = [dialogTitle, ...Array.from(b.querySelectorAll(focusableSelector)).filter(el => !el.disabled)];
    
    const firstFocusableEl = focusableEls[0];
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
    
    // Set initial focus to the heading
    if (dialogTitle) {
        dialogTitle.focus();
    }

})(window.A11yQuickCheckToolUrl);
