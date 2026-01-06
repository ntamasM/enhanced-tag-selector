# Enhanced Tag Selector - Languages

This folder contains translation files for the Enhanced Tag Selector WordPress plugin.

## Available Languages

- **Greek (el)** - Full translation ✅
- **Spanish (es_ES)** - Full translation ✅
- **French (fr_FR)** - Full translation ✅
- **German (de_DE)** - Full translation ✅
- **English** - Default language (built into the plugin)

## File Structure

- `enhanced-tag-selector.pot` - Template file for translators
- `enhanced-tag-selector-[locale].po` - Translation source files
- `enhanced-tag-selector-[locale].mo` - Compiled translation files

## How to Add a New Translation

1. Copy the `enhanced-tag-selector.pot` file
2. Rename it to `enhanced-tag-selector-[locale].po` (e.g., `enhanced-tag-selector-it_IT.po` for Italian)
3. Edit the file header with proper language information
4. Translate all the `msgstr` entries
5. Generate the `.mo` file using a tool like POEdit or msgfmt
6. Test the translation in WordPress

## Translation Tools

- **POEdit** (Recommended) - User-friendly GUI tool for editing .po files
- **msgfmt** - Command line tool to compile .po to .mo files
- **WordPress.org Translate** - Online translation platform

## Contributing Translations

If you want to contribute a translation:

1. Create the translation files as described above
2. Test them thoroughly in a WordPress installation
3. Submit them via GitHub or contact the plugin author

## Language Codes Reference

Common WordPress locale codes:

- `el` - Greek
- `es_ES` - Spanish (Spain)
- `fr_FR` - French (France)
- `de_DE` - German (Germany)
- `it_IT` - Italian (Italy)
- `pt_BR` - Portuguese (Brazil)
- `ru_RU` - Russian (Russia)
- `ja` - Japanese
- `zh_CN` - Chinese (Simplified)

## Testing Translations

To test a translation:

1. Upload the `.po` and `.mo` files to this languages folder
2. Set your WordPress language to the corresponding locale in Settings > General
3. Clear any caching plugins
4. Visit the post editor and test the Enhanced Tag Selector

## Notes

- The Greek translation is complete and fully tested
- Other language files are ready for use but may need refinement by native speakers
- JavaScript strings are automatically translated when proper .mo files are present
- All strings use the `enhanced-tag-selector` text domain
