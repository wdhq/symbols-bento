document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const symbolButtons = Array.from(container.querySelectorAll('.symbol-button')).filter(btn => btn.getAttribute('data-symbols') !== "");
    const emptyDivs = container.querySelectorAll('.empty-div');
    const bymbolsButton = container.querySelector('.symbol-button[data-symbols=""]'); // Bymbols button

    let lastRandomButton = null; // Track last randomly selected button

    // Animation parameters
    const fadeOutDelay = 100; // Delay between each fade-out (ms)
    const fadeDuration = 300; // Duration of fade-out (ms)

    // Initialize empty divs with spans
    const initializeEmptyDivs = () => {
        emptyDivs.forEach(div => {
            if (!div.querySelector('span')) {
                div.innerHTML = `<span>${div.textContent}</span>`;
            }
        });
    };

    // Update empty divs with symbols and fade effects
    const updateEmptyDivs = (symbols) => {
        symbolButtons.forEach(btn => btn.disabled = true); // Disable buttons during animation

        emptyDivs.forEach((div, index) => {
            const symbol = symbols[index % symbols.length];
            const span = div.querySelector('span');
            if (!span) return;

            setTimeout(() => {
                div.classList.add('fade-out');
            }, index * fadeOutDelay);

            setTimeout(() => {
                span.textContent = symbol;
                div.classList.remove('fade-out');
            }, index * fadeOutDelay + fadeDuration);
        });

        // Re-enable buttons after transitions
        const totalTransitionTime = (emptyDivs.length - 1) * fadeOutDelay + fadeDuration + 300;
        setTimeout(() => {
            symbolButtons.forEach(btn => btn.disabled = false);
        }, totalTransitionTime);
    };

    // Provide feedback effect on button click
    const provideFeedback = (button) => {
        button.classList.add('active-feedback');
        setTimeout(() => {
            button.classList.remove('active-feedback');
        }, 300);
    };

    // Show 'Copied' message on Bymbols button
    const showCopiedMessage = () => {
        if (!bymbolsButton) return;

        const bymbolsText = bymbolsButton.querySelector('.bymbols-text');
        const copiedText = bymbolsButton.querySelector('.copied-text');
        if (!bymbolsText || !copiedText) return;

        bymbolsText.style.opacity = '0';
        setTimeout(() => {
            copiedText.style.opacity = '1';
        }, fadeDuration);

        setTimeout(() => {
            copiedText.style.opacity = '0';
            setTimeout(() => {
                bymbolsText.style.opacity = '1';
            }, fadeDuration);
        }, fadeDuration + 1000);
    };

    // Debounce function to limit function execution rate
    const debounce = (func, delay) => {
        let inDebounce;
        return function(...args) {
            if (inDebounce) return;
            func.apply(this, args);
            inDebounce = true;
            setTimeout(() => inDebounce = false, delay);
        };
    };

    // Event listener for symbol buttons
    symbolButtons.forEach(button => {
        button.addEventListener('click', debounce(() => {
            const symbols = button.getAttribute('data-symbols').split(',').map(s => s.trim());
            updateEmptyDivs(symbols);
            provideFeedback(button);
        }, 100));
    });

    // Toggle active class on symbol buttons
    symbolButtons.forEach(button => {
        button.addEventListener('click', () => {
            symbolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.toggle('active');
        });
    });

    // Hover functionality for grid expansion
    const items = container.querySelectorAll('.symbol-button, .empty-div');

    items.forEach(item => {
        const colStart = parseInt(item.getAttribute('data-col'));
        const rowStart = parseInt(item.getAttribute('data-row'));
        const colSpan = parseInt(item.getAttribute('data-colspan')) || 1;
        const rowSpan = parseInt(item.getAttribute('data-rowspan')) || 1;

        item.style.gridColumn = `${colStart} / span ${colSpan}`;
        item.style.gridRow = `${rowStart} / span ${rowSpan}`;

        item.addEventListener('mouseover', () => {
            for (let i = 1; i <= 10; i++) {
                const size = (i >= colStart && i < colStart + colSpan) ? '2fr' : '1fr';
                container.style.setProperty(`--col${i}-size`, size);
            }
            for (let i = 1; i <= 5; i++) {
                const size = (i >= rowStart && i < rowStart + rowSpan) ? '2fr' : '1fr';
                container.style.setProperty(`--row${i}-size`, size);
            }
        });

        item.addEventListener('mouseout', () => {
            for (let i = 1; i <= 10; i++) {
                container.style.setProperty(`--col${i}-size`, '1fr');
            }
            for (let i = 1; i <= 5; i++) {
                container.style.setProperty(`--row${i}-size`, '1fr');
            }
        });
    });

    // Event listener for Bymbols button
    if (bymbolsButton) {
        bymbolsButton.addEventListener('click', debounce(() => {
            if (symbolButtons.length === 0) return;

            let randomButton;
            do {
                randomButton = symbolButtons[Math.floor(Math.random() * symbolButtons.length)];
            } while (randomButton === lastRandomButton && symbolButtons.length > 1);

            lastRandomButton = randomButton;
            if (randomButton) {
                randomButton.click();
            }
            provideFeedback(bymbolsButton);
        }, 100));
    }

    // Copy text to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showCopiedMessage();
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    // Provide feedback on empty div click
    const provideDivFeedback = (div) => {
        div.classList.add('div-active-feedback');
        setTimeout(() => {
            div.classList.remove('div-active-feedback');
        }, 300);
    };

    // Event listeners for empty divs to copy text on click
    emptyDivs.forEach(div => {
        div.addEventListener('click', () => {
            const span = div.querySelector('span');
            if (span && span.textContent.trim() !== '') {
                copyToClipboard(span.textContent.trim());
                provideDivFeedback(div);
            }
        });

        // Keyboard accessibility
        div.setAttribute('tabindex', '0');
        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                div.click();
            }
        });
    });

    // Initialize empty divs with spans
    initializeEmptyDivs();

    // Trigger Bymbols button on page load
    if (bymbolsButton) {
        bymbolsButton.click();
    }
});
