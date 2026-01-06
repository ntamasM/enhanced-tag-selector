<?php

/**
 * Enhanced Tag Selector Modal Template
 * 
 * @package Enhanced_Tag_Selector
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div id="ets-modal" class="ets-modal" style="display: none;">
    <div class="ets-modal-content">
        <div class="ets-modal-header">
            <h3>
                <span class="ets-icon ets-icon-tags"></span>
                <?php _e('Select & Edit Tags', 'enhanced-tag-selector'); ?>
            </h3>
            <button class="ets-close" type="button" aria-label="<?php _e('Close', 'enhanced-tag-selector'); ?>">
                <span class="ets-icon ets-icon-close"></span>
            </button>
        </div>
        <div class="ets-modal-body">

            <!-- Search, Filter and Results Section -->
            <div class="ets-controls-section">
                <div class="ets-section-header">
                    <h4>
                        <span class="ets-icon ets-icon-filter"></span>
                        <?php _e('Select a tag', 'enhanced-tag-selector'); ?>
                        <span class="ets-tooltip-trigger" data-tooltip="<?php esc_attr_e('Use the search box to find specific tags or change the sorting order to organize how tags are displayed.', 'enhanced-tag-selector'); ?>">
                            <span class="ets-icon ets-icon-info"></span>
                        </span>
                    </h4>
                </div>
                <div class="ets-section-content">
                    <div class="ets-controls">
                        <div class="ets-search-area">
                            <div class="ets-search-wrapper">
                                <span class="ets-icon ets-icon-search"></span>
                                <input type="text" id="ets-search" placeholder="<?php _e('Search existing tags...', 'enhanced-tag-selector'); ?>" />
                                <button type="button" class="ets-search-clear" id="ets-search-clear" style="display: none;">
                                    <span class="ets-icon ets-icon-clear"></span>
                                </button>
                            </div>
                        </div>
                        <div class="ets-sort-container">
                            <label for="ets-sort">
                                <span class="ets-icon ets-icon-sort"></span>
                                <?php _e('Sort by:', 'enhanced-tag-selector'); ?>
                            </label>
                            <select id="ets-sort">
                                <option value="most_used_desc"><?php _e('Most Used First', 'enhanced-tag-selector'); ?></option>
                                <option value="most_used_asc"><?php _e('Least Used First', 'enhanced-tag-selector'); ?></option>
                                <option value="alphabetical_asc"><?php _e('Alphabetical A-Z', 'enhanced-tag-selector'); ?></option>
                                <option value="alphabetical_desc"><?php _e('Alphabetical Z-A', 'enhanced-tag-selector'); ?></option>
                            </select>
                        </div>
                    </div>

                    <!-- Tags Grid Container (Results) -->
                    <div id="ets-tags-container" class="ets-tags-container">
                        <div class="ets-loading">
                            <span class="ets-icon ets-icon-loading"></span>
                            <?php _e('Loading tags...', 'enhanced-tag-selector'); ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Current Post Tags Section -->
            <div class="ets-current-tags-section">
                <div class="ets-section-header">
                    <h4>
                        <span class="ets-icon ets-icon-document"></span>
                        <?php _e('Current Post Tags', 'enhanced-tag-selector'); ?>
                        <span class="ets-tooltip-trigger" data-tooltip="<?php esc_attr_e('Tags currently assigned to this post. You can remove tags by clicking the × button next to each tag.', 'enhanced-tag-selector'); ?>">
                            <span class="ets-icon ets-icon-info"></span>
                        </span>
                    </h4>
                </div>
                <div class="ets-section-content">
                    <div id="ets-current-post-tags" class="ets-current-post-tags">
                        <p class="ets-no-current">
                            <span class="ets-icon ets-icon-info"></span>
                            <?php _e('No tags assigned to this post', 'enhanced-tag-selector'); ?>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>