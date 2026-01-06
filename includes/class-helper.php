<?php

/**
 * Enhanced Tag Selector Helper Functions
 * 
 * @package Enhanced_Tag_Selector
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Helper functions for Enhanced Tag Selector
 */
class ETS_Helper
{

    /**
     * Get the modal template
     * 
     * @return void
     */
    public static function get_modal_template()
    {
        $template_path = ETS_PLUGIN_PATH . 'templates/modal-template.php';
        if (file_exists($template_path)) {
            include $template_path;
        }
    }

    /**
     * Enqueue admin assets
     * 
     * @param string $hook Current admin page hook
     * @return void
     */
    public static function enqueue_admin_assets($hook)
    {
        // Only load on post edit pages
        if (!in_array($hook, array('post.php', 'post-new.php'))) {
            return;
        }

        // Use filemtime for development to prevent caching issues
        $js_version = defined('WP_DEBUG') && WP_DEBUG ?
            time() :  // Force cache refresh with current timestamp
            ETS_VERSION;

        wp_enqueue_script(
            'enhanced-tag-selector-js',
            ETS_PLUGIN_URL . 'assets/js/enhanced-tag-selector.js',
            array('jquery', 'wp-i18n'),
            $js_version,
            true
        );

        // Use filemtime for development to prevent caching issues
        $css_version = defined('WP_DEBUG') && WP_DEBUG ?
            filemtime(ETS_PLUGIN_PATH . 'assets/css/enhanced-tag-selector.css') :
            ETS_VERSION;

        wp_enqueue_style(
            'enhanced-tag-selector-css',
            ETS_PLUGIN_URL . 'assets/css/enhanced-tag-selector.css',
            array(),
            $css_version
        );

        // Set script translations
        wp_set_script_translations('enhanced-tag-selector-js', 'enhanced-tag-selector', ETS_PLUGIN_PATH . 'languages/');

        // Localize script for AJAX
        wp_localize_script('enhanced-tag-selector-js', 'ets_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ets_nonce'),
            'debug_info' => array(
                'locale' => get_locale(),
                'text_domain_loaded' => 'enhanced-tag-selector',
                'current_language' => get_bloginfo('language')
            ),
            'labels' => array(
                'see_all_tags' => __('Select & Edit Tags', 'enhanced-tag-selector'),
                'alphabetical_asc' => __('Alphabetical A-Z', 'enhanced-tag-selector'),
                'alphabetical_desc' => __('Alphabetical Z-A', 'enhanced-tag-selector'),
                'most_used_asc' => __('Least Used First', 'enhanced-tag-selector'),
                'most_used_desc' => __('Most Used First', 'enhanced-tag-selector'),
                'search_tags' => __('Search tags...', 'enhanced-tag-selector'),
                'no_tags_selected' => __('No tags selected for this post', 'enhanced-tag-selector'),
                'close' => __('Close', 'enhanced-tag-selector'),
                'clear_search' => __('Clear search', 'enhanced-tag-selector'),
                'loading_tags' => __('Loading tags...', 'enhanced-tag-selector'),
                'no_tags_assigned' => __('No tags assigned to this post', 'enhanced-tag-selector'),
                'current_post_tags' => __('Current Post Tags', 'enhanced-tag-selector'),
                'add_new_tag' => __('Add New Tag', 'enhanced-tag-selector'),
                'no_tag_found_create' => __('No tag found. You want to create a tag like this?', 'enhanced-tag-selector'),
                'create_add' => __('Create & Add', 'enhanced-tag-selector'),
                'enter_tag_names' => __('Enter new tag name(s), separated by commas...', 'enhanced-tag-selector'),
                'search_existing_tags' => __('Search existing tags...', 'enhanced-tag-selector'),
                'sort_by' => __('Sort by:', 'enhanced-tag-selector'),
                'select_a_tag' => __('Select a tag', 'enhanced-tag-selector'),
                'current_tags_explanation' => __('Tags currently assigned to this post. You can remove tags by clicking the × button next to each tag.', 'enhanced-tag-selector')
            )
        ));
    }

    /**
     * Handle AJAX request for getting tags
     * 
     * @return void
     */
    public static function ajax_get_tags()
    {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'ets_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }

        $order_by = isset($_POST['order_by']) ? sanitize_text_field($_POST['order_by']) : 'most_used';
        $order = isset($_POST['order']) ? sanitize_text_field($_POST['order']) : 'desc';
        $search = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $selected_tags = isset($_POST['selected_tags']) ? array_map('intval', $_POST['selected_tags']) : array();

        // Convert tag names to IDs if they are strings
        if (!empty($selected_tags) && is_array($selected_tags)) {
            $converted_ids = array();
            foreach ($selected_tags as $tag_identifier) {
                if (is_numeric($tag_identifier)) {
                    $converted_ids[] = intval($tag_identifier);
                } else {
                    // Convert tag name to ID
                    $tag = get_term_by('name', $tag_identifier, 'post_tag');
                    if ($tag && !is_wp_error($tag)) {
                        $converted_ids[] = $tag->term_id;
                    }
                }
            }
            $selected_tags = $converted_ids;
        }

        $args = array(
            'taxonomy' => 'post_tag',
            'hide_empty' => false,
            'number' => 200, // Increased limit for better selection
        );

        // Add search if provided
        if (!empty($search)) {
            $args['search'] = $search;
        }

        // Set ordering
        switch ($order_by) {
            case 'alphabetical':
                $args['orderby'] = 'name';
                $args['order'] = ($order === 'desc') ? 'DESC' : 'ASC';
                break;
            case 'most_used':
                $args['orderby'] = 'count';
                $args['order'] = ($order === 'desc') ? 'DESC' : 'ASC';
                break;
            default:
                $args['orderby'] = 'count';
                $args['order'] = 'DESC';
        }

        $tags = get_terms($args);

        if (is_wp_error($tags)) {
            wp_send_json_error('Error fetching tags: ' . $tags->get_error_message());
            return;
        }

        $response_tags = array();
        foreach ($tags as $tag) {
            // Skip already selected tags
            if (!in_array($tag->term_id, $selected_tags)) {
                $response_tags[] = array(
                    'id' => $tag->term_id,
                    'name' => $tag->name,
                    'count' => $tag->count,
                    'slug' => $tag->slug
                );
            }
        }

        wp_send_json_success($response_tags);
    }

    /**
     * Check if current screen should show the enhanced tag selector
     * 
     * @return bool
     */
    public static function should_show_selector()
    {
        if (!function_exists('get_current_screen')) {
            return false;
        }

        $screen = get_current_screen();
        return $screen && $screen->id === 'post';
    }
}
