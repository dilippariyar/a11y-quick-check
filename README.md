A11y Quick Check Bookmarklet
This is a JavaScript bookmarklet designed to perform instant, client-side accessibility (A11y) audits on any web page. It is specifically optimized to provide low-noise feedback for screen reader users by primarily announcing Critical Errors and Warnings, following the principle that silence indicates compliance.
1. Features
• 
Error-Only Mode: Focuses on injecting invisible, screen reader-friendly messages only next to detected Critical or Warning issues.
• 
On-Demand Auditing: Runs instantly on any page via a single bookmark click.
• 
Cache Busting: Ensures the latest version of the audit tool is always loaded.
• 
Accessibility Checks Included:
• 
Heading structure (H1 duplication, skipped levels).
• 
Landmark naming and nesting.
• 
Form field labels and autocomplete for personal data inputs.
• 
Image (<img> / role="img") accessible names.
• 
Link/Button accessible names and name/visible text mismatch.
• 
Media (<audio>, <video>) controls and caption tracks.
• 
Structural elements (Lists/Tables) nesting errors.
• 
Global checks (Language attribute, Skip-to-Main link validity).
2. Installation
To install the A11y Quick Check tool, create a new bookmark in your browser using the following code.
Bookmarklet Code
Copy the entire single line below:
javascript:(function(){window.A11yQuickCheckToolUrl='https://dilippariyar.github.io/a11y-quick-check/';if(document.getElementById('a11y-dialog-container'))return;const s=document.createElement('script');s.src=window.A11yQuickCheckToolUrl+'dialog.js?v='+Date.now();document.head.append(s);})();
Setup Steps
1. 
Create New Bookmark: Open your browser's Bookmarks Manager (Ctrl+Shift+O or Cmd+Option+B). Create a new bookmark entry.
2. 
Name It: Name the bookmark "A11y Quick Check".
3. 
Paste Code: Paste the entire single line of JavaScript code above into the URL/Address field of the new bookmark.
3. Usage
1. 
Navigate to the web page you want to audit.
2. 
Click the "A11y Quick Check" bookmark in your browser toolbar.
3. 
A small configuration dialog will appear on the page.
4. 
For screen reader users, select the "Error Only Audit (Low Noise)" mode to ensure minimal distraction, and then click the "Analyze Page in Selected Mode" button.
5. 
Invisible, spoken messages will be inserted adjacent to elements that fail an accessibility check.
4. Contributing
For issues, feature requests, or contributions to the audit logic, please refer to the main repository.
Tool URL: https://dilippariyar.github.io/a11y-quick-check/