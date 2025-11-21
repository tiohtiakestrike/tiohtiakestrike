# Resource Card Generator Script

A helper script to create new resource cards for the resources page.

## Features

1. **Interactive prompts** for:
   - Resource title (English and French)
   - Description (English and French)
   - Link URL and type (download/pdf/email/external/internal)
   - Link button text (English and French)
   - Optional ARIA labels for accessibility
   - Optional additional instructions text

2. **Automatic generation**:
   - HTML card matching your existing structure
   - Translation keys in camelCase
   - Appropriate SVG icons based on link type
   - Proper accessibility attributes

3. **Fully automated end-to-end**:
   - Automatically updates `lang/en.json` and `lang/fr.json` with the new translations
   - Automatically inserts the HTML card into `resources.html`
   - No manual copying or pasting required!

## Usage

Run the script with:

```bash
node utils/create-resource-card.js
```

Or since it's executable:

```bash
./utils/create-resource-card.js
```

## What it does

The script will:

1. Prompt you for all the information needed for a resource card
2. Generate the HTML card code that matches your existing structure
3. Generate the translation keys for both English and French
4. **Automatically update** `lang/en.json` and `lang/fr.json` with the new translations
5. **Automatically insert** the HTML card into `resources.html` in the correct location
6. Show you a summary of what was done

Everything is automated - just answer the prompts and you're done!

## Example

When you run the script, you'll be prompted for:

- Resource title (English): `Pamphlet`
- Resource title (French): `Dépliant`
- Resource description (English): `Download and share our pamphlet.`
- Resource description (French): `Téléchargez et partagez notre dépliant.`
- Link URL: `/resources/TIOHTIAKE STRIKE.pdf`
- Link type: `pdf`
- Link button text (English): `Get Pamphlet`
- Link button text (French): `Obtenir le dépliant`
- ARIA label (English): `Download the Tiohtià:ke Strike pamphlet (PDF)`
- ARIA label (French): `Télécharger le dépliant Grève Tiohtià:ke (PDF)`

The script will then:
- Generate the HTML card code
- Generate the translation keys
- Ask if you want to update files automatically (defaults to "yes")
- If confirmed, automatically:
  - Add the translation keys to `lang/en.json` and `lang/fr.json`
  - Insert the HTML card into `resources.html` in the correct location

## After Running

Once the script completes:

1. **Test the page** - Open `resources.html` in a browser to verify the new card appears correctly
2. **Check translations** - Verify that both English and French translations work properly
3. **That's it!** - The card is fully integrated and ready to use

If you chose not to auto-update, the script will show you the generated HTML and translation keys so you can add them manually.

