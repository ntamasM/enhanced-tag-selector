# Enhanced Tag Selector

A WordPress plugin that replaces the default "Choose from the most used tags" functionality with an enhanced, user-friendly tag selection interface.

## Features

- **Enhanced Tag Browser**: Replace the basic tag cloud with a comprehensive tag selector
- **Multiple Sorting Options**:
  - Alphabetical A-Z
  - Alphabetical Z-A
  - Most Used First
  - Least Used First
- **Smart Search**: Real-time search functionality with debouncing
- **Selection Management**: Selected tags are automatically removed from the options to prevent duplicate selection
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Multilingual Support**: Full internationalization with built-in translations for Greek, Spanish, French, and German

## Support the Project

If you find this plugin helpful, please consider supporting its development:

[![Support Me](https://img.shields.io/badge/Support-♥-red?style=for-the-badge)](https://ntamadakis.gr/support-me)

Your support helps maintain and improve this open-source project!

## Installation

1. Download the latest version from the [GitHub Releases](https://github.com/ntamasM/enhanced-tag-selector/releases) page:

   - Go to the releases page
   - Download the newest version (`.zip` file)

2. Install the plugin through WordPress admin:

   - Go to `Plugins > Add New`
   - Click "Upload Plugin"
   - Choose the downloaded `.zip` file
   - Click "Install Now"

3. Activate the plugin:

   - Click "Activate Plugin" after installation
   - Or go to `Plugins > Installed Plugins`, find "Enhanced Tag Selector", and click "Activate"

**Alternative for developers**: You can also clone this repository directly to your `wp-content/plugins/` directory if you want the development version.

## Usage

1. **Creating/Editing Posts**:

   - Go to `Posts > Add New` or edit an existing post
   - In the Tags metabox (usually in the sidebar), you'll see a "See All Tags" link
   - Click this link to open the enhanced tag selector

2. **Using the Tag Selector**:

   - **Search**: Type in the search box to filter tags by name
   - **Sort**: Use the dropdown to change sorting (Most Used First, Alphabetical, etc.)
   - **Select Tags**: Click on any tag to add it to your post
   - **Auto-removal**: Selected tags disappear from the list to prevent accidental re-selection

3. **Sorting Options**:
   - **Most Used First**: Tags with the highest post count appear first
   - **Least Used First**: Tags with the lowest post count appear first
   - **Alphabetical A-Z**: Tags sorted alphabetically from A to Z
   - **Alphabetical Z-A**: Tags sorted alphabetically from Z to A

## Technical Details

### Files Structure

```
enhanced-tag-selector/
├── enhanced-tag-selector.php    # Main plugin file
├── includes/
│   └── class-helper.php         # Helper functions and AJAX handlers
├── templates/
│   └── modal-template.php       # Modal HTML template
├── assets/
│   ├── js/
│   │   └── enhanced-tag-selector.js    # Frontend JavaScript
│   └── css/
│       └── enhanced-tag-selector.css   # Styling
├── languages/                   # Translation files
│   ├── enhanced-tag-selector.pot       # Translation template
│   ├── enhanced-tag-selector-el.po     # Greek translation
│   ├── enhanced-tag-selector-el.mo     # Greek compiled translation
│   ├── enhanced-tag-selector-es_ES.po  # Spanish translation
│   ├── enhanced-tag-selector-fr_FR.po  # French translation
│   ├── enhanced-tag-selector-de_DE.po  # German translation
│   └── README.md                       # Translation guide
└── README.md                    # This file
```

### WordPress Hooks Used

- `admin_enqueue_scripts`: Load CSS and JavaScript
- `wp_ajax_ets_get_tags`: Handle AJAX requests for tag data
- `admin_footer`: Inject the modal HTML
- `add_meta_boxes`: Remove default tag cloud metabox

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Languages & Translation

The Enhanced Tag Selector supports multiple languages out of the box:

### Included Languages

- **English** (Default)
- **Greek (Ελληνικά)** - Complete translation ✅
- **Spanish (Español)** - Complete translation ✅
- **French (Français)** - Complete translation ✅
- **German (Deutsch)** - Complete translation ✅

### How to Use

The plugin automatically detects your WordPress language setting and displays the interface in the appropriate language. To change the language:

1. Go to WordPress Admin → Settings → General
2. Set "Site Language" to your preferred language
3. Clear any caching plugins
4. The Enhanced Tag Selector will automatically display in your chosen language

### Contributing Translations

Want to add support for your language? See the `languages/README.md` file for detailed instructions on creating and contributing translations.

## Customization

### Styling

The plugin includes comprehensive CSS that can be customized by:

1. Editing `assets/css/enhanced-tag-selector.css`
2. Adding custom CSS to your theme's stylesheet
3. Using WordPress Customizer additional CSS

### JavaScript Events

The plugin triggers custom JavaScript events you can listen to:

- `ets:modal:opened` - When the tag selector modal opens
- `ets:tag:selected` - When a tag is selected
- `ets:modal:closed` - When the modal is closed

### PHP Filters

Future versions may include filters for:

- Tag query arguments
- Modal content
- Sorting options

## Troubleshooting

### Tags Not Loading

- Check browser console for JavaScript errors
- Verify WordPress AJAX is working properly
- Ensure the plugin is activated

### Modal Not Opening

- Check if jQuery is loaded
- Verify no JavaScript conflicts with other plugins
- Try deactivating other plugins temporarily

### Search Not Working

- Clear browser cache
- Check for JavaScript errors
- Verify AJAX endpoint is responding

## Development

### Local Development Setup

1. Clone the repository
2. Set up a local WordPress environment
3. Symlink or copy the plugin to your plugins directory
4. Activate and test

### Contributing

This is an open-source project! We welcome contributions:

1. Fork the [repository](https://github.com/ntamasM/enhanced-tag-selector)
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Types of contributions welcome:

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🌍 Translations
- 🎨 UI/UX enhancements

## Changelog

### Version 0.0.1

- Initial release
- Basic tag selection with sorting
- Search functionality
- Responsive design
- Auto-removal of selected tags

## License

This plugin is licensed under the GPL v2.

## Support

For technical support and bug reports, please create an issue on the [GitHub repository](https://github.com/ntamasM/enhanced-tag-selector).

### Support the Development

If you find this plugin useful and want to support its continued development:

🎯 **[Support Me](https://ntamadakis.gr/support-me)** - Help keep this project alive!

Your contribution helps:

- 🚀 Add new features
- 🐛 Fix bugs faster
- 📚 Improve documentation
- 🌍 Add more language translations

---

**Author**: [Ntamas](https://ntamadakis.gr)  
**Version**: 0.0.1  
**WordPress Compatibility**: 5.0+  
**PHP Compatibility**: 7.4+
