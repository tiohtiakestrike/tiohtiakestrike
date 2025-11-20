#!/usr/bin/env node

/**
 * Script to help create new resource cards for the resources page
 * See README for more details
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function generateKeyFromTitle(title) {
    // Convert title to camelCase key
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .map((word, index) => 
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
}

function generateHTMLCard(resource) {
    const { titleKey, descriptionKey, linkTextKey, href, linkType, ariaLabelKey, hasInstructions, instructionsKey } = resource;
    
    let linkHTML = '';
    let svgIcon = '';
    
    // Determine SVG icon based on link type
    if (linkType === 'download' || linkType === 'pdf') {
        svgIcon = `<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>`;
    } else if (linkType === 'email' || linkType === 'mailto') {
        svgIcon = `<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>`;
    } else if (linkType === 'external') {
        svgIcon = `<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>`;
    } else {
        // Default icon (generic link)
        svgIcon = `<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>`;
    }
    
    // Build link attributes
    const linkAttrs = [];
    if (href.startsWith('http') || href.startsWith('mailto:')) {
        linkAttrs.push(`href="${href}"`);
    } else {
        linkAttrs.push(`href="${href}"`);
        linkAttrs.push(`data-i18n-href="${linkTextKey}Url"`);
    }
    
    if (linkType === 'external' || linkType === 'download' || linkType === 'pdf') {
        linkAttrs.push('target="_blank"');
        linkAttrs.push('rel="noopener noreferrer"');
    }
    
    if (ariaLabelKey) {
        linkAttrs.push(`data-i18n-aria-label="aria${ariaLabelKey}"`);
        linkAttrs.push(`aria-label="[Will be translated]"`);
    }
    
    linkHTML = `<a ${linkAttrs.join(' ')} class="resource-link">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        ${svgIcon}
                    </svg>
                    <span data-i18n="${linkTextKey}"></span>
                </a>`;
    
    let instructionsHTML = '';
    if (hasInstructions && instructionsKey) {
        instructionsHTML = `\n                <p class="mailing-list-instructions" data-i18n="${instructionsKey}"></p>`;
    }
    
    return `            <div class="resource-card">
                <h3 data-i18n="${titleKey}"></h3>
                <p data-i18n="${descriptionKey}"></p>
                ${linkHTML}${instructionsHTML}
            </div>`;
}

function updateLanguageFile(filePath, translations) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add all translations
    Object.keys(translations).forEach(key => {
        content[key] = translations[key];
    });
    
    // Write back with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
}

function insertCardIntoHTML(htmlCard, resourcesPath) {
    const content = fs.readFileSync(resourcesPath, 'utf8');
    
    // Find the resource-grid div and insert the card before the closing tag
    // Pattern: match everything up to the closing </div> of resource-grid, but before the more-resources paragraph
    const resourceGridRegex = /(<div class="resource-grid">[\s\S]*?)(\s+<\/div>\s*\n\s*<p class="more-resources")/;
    
    if (!resourceGridRegex.test(content)) {
        // Try alternative pattern in case formatting is different
        const altPattern = /(<div class="resource-grid">[\s\S]*?)(<\/div>\s*<p class="more-resources")/;
        if (!altPattern.test(content)) {
            throw new Error('Could not find resource-grid div in resources.html');
        }
        
        // Use alternative pattern
        const updatedContent = content.replace(
            altPattern,
            (match, before, after) => {
                return before + '\n' + htmlCard + '\n        ' + after;
            }
        );
        fs.writeFileSync(resourcesPath, updatedContent, 'utf8');
        return;
    }
    
    // Insert the new card with proper indentation
    const updatedContent = content.replace(
        resourceGridRegex,
        (match, before, after) => {
            // Add the new card before the closing div, maintaining indentation
            return before + '\n' + htmlCard + after;
        }
    );
    
    fs.writeFileSync(resourcesPath, updatedContent, 'utf8');
}

async function main() {
    console.log('\n=== Resource Card Generator ===\n');
    
    // Get resource information
    const titleEn = await question('Resource title (English): ');
    const titleFr = await question('Resource title (French): ');
    const descriptionEn = await question('Resource description (English): ');
    const descriptionFr = await question('Resource description (French): ');
    
    console.log('\nLink information:');
    const href = await question('Link URL (e.g., /resources/file.pdf, https://example.com, mailto:email@example.com): ');
    
    const linkTypeInput = await question('Link type (download/pdf/email/external/internal) [external]: ');
    const linkType = linkTypeInput.trim() || 'external';
    
    const linkTextEn = await question('Link button text (English, e.g., "Get Resource"): ');
    const linkTextFr = await question('Link button text (French): ');
    
    const ariaLabelEn = await question('ARIA label for link (English, optional): ');
    const ariaLabelFr = ariaLabelEn ? await question('ARIA label for link (French, optional): ') : '';
    
    const hasInstructions = (await question('Has additional instructions text? (y/n) [n]: ')).toLowerCase() === 'y';
    let instructionsEn = '';
    let instructionsFr = '';
    if (hasInstructions) {
        instructionsEn = await question('Instructions text (English): ');
        instructionsFr = await question('Instructions text (French): ');
    }
    
    // Generate keys
    const baseKey = generateKeyFromTitle(titleEn);
    const titleKey = baseKey;
    const descriptionKey = baseKey + 'Desc';
    const linkTextKey = baseKey + 'Link';
    const instructionsKey = hasInstructions ? baseKey + 'Instructions' : null;
    const ariaLabelKey = ariaLabelEn ? baseKey + 'Link' : null;
    
    // Generate HTML
    const htmlCard = generateHTMLCard({
        titleKey,
        descriptionKey,
        linkTextKey,
        href,
        linkType,
        ariaLabelKey,
        hasInstructions,
        instructionsKey
    });
    
    // Prepare translations
    const translationsEn = {
        [titleKey]: titleEn,
        [descriptionKey]: descriptionEn,
        [linkTextKey]: linkTextEn
    };
    
    const translationsFr = {
        [titleKey]: titleFr,
        [descriptionKey]: descriptionFr,
        [linkTextKey]: linkTextFr
    };
    
    // Add URL if it's a relative path
    if (!href.startsWith('http') && !href.startsWith('mailto:')) {
        translationsEn[linkTextKey + 'Url'] = href;
        translationsFr[linkTextKey + 'Url'] = href;
    }
    
    // Add ARIA labels
    if (ariaLabelEn) {
        translationsEn['aria' + ariaLabelKey] = ariaLabelEn;
        translationsFr['aria' + ariaLabelKey] = ariaLabelFr;
    }
    
    // Add instructions
    if (hasInstructions && instructionsKey) {
        translationsEn[instructionsKey] = instructionsEn;
        translationsFr[instructionsKey] = instructionsFr;
    }
    
    // Display results
    console.log('\n=== Generated Resource Card HTML ===\n');
    console.log(htmlCard);
    console.log('\n=== Generated Translation Keys ===\n');
    console.log('English translations:');
    console.log(JSON.stringify(translationsEn, null, 2));
    console.log('\nFrench translations:');
    console.log(JSON.stringify(translationsFr, null, 2));
    
    // Ask if user wants to update files automatically
    const updateFiles = (await question('\nUpdate files automatically? (y/n) [y]: ')).toLowerCase();
    const shouldUpdate = updateFiles === '' || updateFiles === 'y';
    
    if (shouldUpdate) {
        const langEnPath = path.join(__dirname, '..', 'lang', 'en.json');
        const langFrPath = path.join(__dirname, '..', 'lang', 'fr.json');
        const resourcesPath = path.join(__dirname, '..', 'resources.html');
        
        try {
            // Update language files
            updateLanguageFile(langEnPath, translationsEn);
            updateLanguageFile(langFrPath, translationsFr);
            console.log('\n✓ Language files updated!');
            
            // Insert card into resources.html
            insertCardIntoHTML(htmlCard, resourcesPath);
            console.log('✓ Resource card added to resources.html!');
            
            console.log('\n=== All Done! ===');
            console.log('The resource card has been automatically added to resources.html');
            console.log('Translation keys have been added to lang/en.json and lang/fr.json');
            console.log('Please test the page to ensure everything works correctly.\n');
        } catch (error) {
            console.error('\n✗ Error updating files:', error.message);
            console.log('\nYou can manually:');
            console.log('1. Copy the HTML card above');
            console.log('2. Add it to resources.html inside the <div class="resource-grid"> section');
            console.log('3. Add the translation keys to lang/en.json and lang/fr.json\n');
        }
    } else {
        console.log('\n=== Next Steps ===');
        console.log('1. Copy the HTML card above');
        console.log('2. Add it to resources.html inside the <div class="resource-grid"> section');
        console.log('3. Add the translation keys to lang/en.json and lang/fr.json');
        console.log('4. Test the page to ensure everything works correctly\n');
    }
    
    rl.close();
}

main().catch(err => {
    console.error('Error:', err);
    rl.close();
    process.exit(1);
});

