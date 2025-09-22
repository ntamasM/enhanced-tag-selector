<?php

/**
 * Plugin Name: Enhanced Tag Selector
 * Plugin URI: https://github.com/ntamasM/enhanced-tag-selector
 * Description: Replaces the default "Choose from the most used tags" with an enhanced tag selector featuring sorting options and intelligent selection management.
 * Version: 0.0.1
 * Author: Ntamas
 * Author URI: https://ntamadakis.gr
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: enhanced-tag-selector
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Tested up to: 6.6
 *
 * Enhanced Tag Selector - WordPress plugin
 * Copyright (C) 2025  Ntamas
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ETS_VERSION', '0.0.1');
define('ETS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ETS_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Include helper classes
require_once ETS_PLUGIN_PATH . 'includes/class-helper.php';

class Enhanced_Tag_Selector
{

    public function __construct()
    {
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        add_action('init', array($this, 'init'));
    }

    public function load_textdomain()
    {
        // Load plugin text domain for translations
        $loaded = load_plugin_textdomain('enhanced-tag-selector', false, dirname(plugin_basename(__FILE__)) . '/languages/');

        // Debug: Log translation loading
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Enhanced Tag Selector: Text domain loaded: ' . ($loaded ? 'YES' : 'NO'));
            error_log('Enhanced Tag Selector: Current locale: ' . get_locale());
            error_log('Enhanced Tag Selector: Languages path: ' . dirname(plugin_basename(__FILE__)) . '/languages/');

            // Test a translation
            $test_translation = __('Select & Edit Tags', 'enhanced-tag-selector');
            error_log('Enhanced Tag Selector: Test translation result: ' . $test_translation);
        }
    }

    public function init()
    {
        // Hook into admin to replace default tag functionality
        add_action('admin_enqueue_scripts', array('ETS_Helper', 'enqueue_admin_assets'));
        add_action('wp_ajax_ets_get_tags', array('ETS_Helper', 'ajax_get_tags'));
        add_action('admin_footer', array($this, 'add_enhanced_tag_selector'));

        // Add support me button to plugins page
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_support_me_link'));

        // Don't remove the tag metabox - let WordPress handle it normally
        // Our JavaScript will add the enhanced functionality to the existing metabox
    }
    /**
     * Add the enhanced tag selector to the admin footer
     */
    public function add_enhanced_tag_selector()
    {
        if (!ETS_Helper::should_show_selector()) {
            return;
        }

        ETS_Helper::get_modal_template();
    }

    /**
     * Add support me link to plugin action links
     */
    public function add_support_me_link($links)
    {
        $support_link = '<a href="https://ntamadakis.gr/support-me" target="_blank" style="color: #e74c3c; font-weight: bold;">' . __('♥ Support Me', 'enhanced-tag-selector') . '</a>';
        array_unshift($links, $support_link);
        return $links;
    }
}

// Initialize the plugin
new Enhanced_Tag_Selector();
