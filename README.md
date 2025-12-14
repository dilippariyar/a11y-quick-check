# A11y Quick Check Bookmarklet

This is a JavaScript bookmarklet designed to perform instant, client-side accessibility (A11y) audits on any web page. It is specifically optimized to provide low-noise feedback for screen reader users by primarily announcing Critical Errors and Warnings, following the principle that silence indicates compliance.

## Features

* **Error-Only Mode:** Focuses on injecting invisible, screen reader-friendly messages only next to detected Critical or Warning issues.
* **On-Demand Auditing:** Runs instantly on any page via a single bookmark click.
* **Cache Busting:** Ensures the latest version of the audit tool is always loaded.

### Accessibility Checks Included

* Heading structure (H1 duplication, skipped levels).
* Landmark naming and nesting.
* Form field labels and autocomplete for personal data inputs.
* Image (`<img>` / `role="img"`) accessible names.
* Link/Button accessible names and name/visible text mismatch.
* Media (`<audio>`, `<video>`) controls and caption tracks.
* Structural elements (Lists/Tables) nesting errors.
* Global checks (Language attribute, Skip-to-Main link validity).

## Installation

To install the A11y Quick Check tool, create a new bookmark in your browser using the following code.

### Bookmarklet Code

Copy the entire single line below:

```javascript
javascript:(function(){window.A11yQuickCheckToolUrl='[https://dilippariyar.github.io/a11y-quick-check/';if(document.getElementById('a11y-dialog-container'))return;const](https://dilippariyar.github.io/a11y-quick-check/';if(document.getElementById('a11y-dialog-container'))return;const) s=document.createElement('script');s.src=window.A11yQuickCheckToolUrl+'dialog.js?v='+Date.now();document.head.append(s);})();