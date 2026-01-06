<?php

/**
 * Enhanced Tag Selector - Auto Tagger
 * 
 * Automatically adds tags to posts based on content matching
 * 
 * @package Enhanced_Tag_Selector
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Auto Tagger class - Automatically tags posts based on content
 */
class ETS_Auto_Tagger
{

    /**
     * Constructor - Initialize hooks
     */
    public function __construct()
    {
        // Hook into post publish/update
        add_action('publish_post', array($this, 'auto_tag_post'), 10, 2);
        add_action('save_post', array($this, 'auto_tag_post'), 10, 2);
    }

    /**
     * Automatically add tags to a post based on content matching
     * 
     * @param int $post_id The post ID
     * @param WP_Post $post The post object
     * @return void
     */
    public function auto_tag_post($post_id, $post)
    {
        // Debug log entry (always log for troubleshooting)
        error_log("ETS Auto-Tagger: Function called for post ID: $post_id");

        // Skip if this is an autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            error_log("ETS Auto-Tagger: Skipped - autosave");
            return;
        }

        // Skip if this is a revision
        if (wp_is_post_revision($post_id)) {
            error_log("ETS Auto-Tagger: Skipped - revision");
            return;
        }

        // Only process posts (not pages or custom post types)
        if ($post->post_type !== 'post') {
            error_log("ETS Auto-Tagger: Skipped - not a post (type: {$post->post_type})");
            return;
        }

        // Only process if post status is publish
        if ($post->post_status !== 'publish') {
            error_log("ETS Auto-Tagger: Skipped - not published (status: {$post->post_status})");
            return;
        }

        // Check if the post already has tags
        $current_tags = wp_get_post_tags($post_id);
        if (!empty($current_tags)) {
            error_log("ETS Auto-Tagger: Skipped - post already has " . count($current_tags) . " tags");
            // Post already has tags, skip auto-tagging
            return;
        }

        // Get all existing tags
        $all_tags = get_terms(array(
            'taxonomy' => 'post_tag',
            'hide_empty' => false,
        ));

        if (is_wp_error($all_tags)) {
            error_log("ETS Auto-Tagger: Error getting tags - " . $all_tags->get_error_message());
            return;
        }

        if (empty($all_tags)) {
            error_log("ETS Auto-Tagger: No existing tags found in database");
            return;
        }

        error_log("ETS Auto-Tagger: Found " . count($all_tags) . " existing tags");

        // Get post content for matching
        $post_content = $this->get_post_content_for_matching($post);

        error_log("ETS Auto-Tagger: Content length: " . strlen($post_content) . " characters");
        error_log("ETS Auto-Tagger: Content preview: " . substr($post_content, 0, 200));

        // Find matching tags and count occurrences
        $tag_matches = $this->find_matching_tags($all_tags, $post_content);

        error_log("ETS Auto-Tagger: Found " . count($tag_matches) . " matching tags");
        if (!empty($tag_matches)) {
            error_log("ETS Auto-Tagger: Matches: " . print_r($tag_matches, true));
        }

        // Get top 10 tags by occurrence count
        $tags_to_add = $this->get_top_tags($tag_matches, 10);

        // Add tags to the post
        if (!empty($tags_to_add)) {
            $result = wp_set_post_tags($post_id, $tags_to_add, false);
            error_log(sprintf(
                'ETS Auto-Tagger: Successfully added %d tags to post #%d: %s (Result: %s)',
                count($tags_to_add),
                $post_id,
                implode(', ', $tags_to_add),
                $result ? 'true' : 'false'
            ));
        } else {
            error_log("ETS Auto-Tagger: No tags to add - no matches found");
        }
    }

    /**
     * Get post content for tag matching
     * Combines title, content, and excerpt
     * 
     * @param WP_Post $post The post object
     * @return string The combined content for matching
     */
    private function get_post_content_for_matching($post)
    {
        // Combine title, content, and excerpt
        $content = '';

        // Add title (weighted more by including it multiple times)
        if (!empty($post->post_title)) {
            $content .= str_repeat($post->post_title . ' ', 3);
        }

        // Add post content
        if (!empty($post->post_content)) {
            // Strip HTML tags and shortcodes
            $post_content = strip_tags(strip_shortcodes($post->post_content));
            $content .= $post_content . ' ';
        }

        // Add excerpt if available
        if (!empty($post->post_excerpt)) {
            $content .= str_repeat($post->post_excerpt . ' ', 2);
        }

        // Convert to lowercase for case-insensitive matching (UTF-8 safe)
        $content = mb_strtolower($content, 'UTF-8');

        // Remove extra whitespace
        $content = preg_replace('/\s+/u', ' ', $content);

        return trim($content);
    }

    /**
     * Find matching tags in content and count occurrences
     * 
     * @param array $tags Array of tag objects
     * @param string $content The content to search in
     * @return array Associative array of tag names => occurrence counts
     */
    private function find_matching_tags($tags, $content)
    {
        $matches = array();

        foreach ($tags as $tag) {
            $tag_name = mb_strtolower($tag->name, 'UTF-8');
            $count = 0;

            // Method 1: Exact match
            $pattern = '/(?:^|[\s\.,;!?\(\)\[\]\{\}\'\"]+)(' . preg_quote($tag_name, '/') . ')(?:[\s\.,;!?\(\)\[\]\{\}\'\"]+|$)/ui';
            $exact_count = preg_match_all($pattern, $content);
            $count += $exact_count;

            // Method 2: Fuzzy match for Greek grammatical variations
            // Split multi-word tags and match each word with variations
            $tag_words = preg_split('/\s+/u', $tag_name);

            if (count($tag_words) > 1) {
                // For multi-word tags (e.g., "Μέση Ανατολή")
                // Check if all words appear close to each other with variations
                $fuzzy_count = $this->fuzzy_match_phrase($tag_words, $content);
                $count += $fuzzy_count;
            } else {
                // For single-word tags, match word stems
                $stem = $this->get_word_stem($tag_name);
                if (mb_strlen($stem, 'UTF-8') >= 3) {
                    $stem_pattern = '/(?:^|[\s\.,;!?\(\)\[\]\{\}\'\"]+)(' . preg_quote($stem, '/') . '[^\s\.,;!?\(\)\[\]\{\}\'\"]*?)(?:[\s\.,;!?\(\)\[\]\{\}\'\"]+|$)/ui';
                    $stem_count = preg_match_all($stem_pattern, $content);
                    // Don't count exact matches twice
                    $count += max(0, $stem_count - $exact_count);
                }
            }

            if ($count > 0) {
                $matches[$tag->name] = $count;
                error_log("ETS Auto-Tagger: Matched tag '{$tag->name}' {$count} times (exact: {$exact_count})");
            }
        }

        return $matches;
    }

    /**
     * Get word stem by removing common Greek endings
     * 
     * @param string $word The word to stem
     * @return string The word stem
     */
    private function get_word_stem($word)
    {
        // Remove common Greek endings to get the stem
        // This handles cases like: Ανατολή → Ανατολ, Ανατολής → Ανατολ
        $endings = array(
            'ών',
            'ές',
            'άς',
            'ής',
            'ός',
            'ύς',
            'ώς',
            'ά',
            'έ',
            'ή',
            'ί',
            'ό',
            'ύ',
            'ώ',
            'ς',
            'ν',
            'α',
            'ε',
            'η',
            'ι',
            'ο',
            'υ',
            'ω'
        );

        $stem = $word;
        $original_length = mb_strlen($word, 'UTF-8');

        // Try to remove endings, but keep at least 3 characters
        foreach ($endings as $ending) {
            $ending_length = mb_strlen($ending, 'UTF-8');
            if (mb_strlen($stem, 'UTF-8') > 3 + $ending_length) {
                if (mb_substr($stem, -$ending_length, null, 'UTF-8') === $ending) {
                    $stem = mb_substr($stem, 0, -$ending_length, 'UTF-8');
                    break;
                }
            }
        }

        return $stem;
    }

    /**
     * Fuzzy match a phrase in content (for multi-word tags)
     * 
     * @param array $words Array of words in the tag
     * @param string $content The content to search in
     * @return int Number of matches found
     */
    private function fuzzy_match_phrase($words, $content)
    {
        $count = 0;

        // Create stems for each word
        $stems = array_map(array($this, 'get_word_stem'), $words);

        // Build a pattern that matches all word stems within a reasonable distance
        $pattern_parts = array();
        foreach ($stems as $stem) {
            if (mb_strlen($stem, 'UTF-8') >= 3) {
                $pattern_parts[] = preg_quote($stem, '/') . '[^\s\.,;!?\(\)\[\]\{\}\'\"]*';
            }
        }

        if (!empty($pattern_parts)) {
            // Match all stems appearing within 50 characters of each other
            $pattern = '/' . implode('[\s\.,;!?\(\)\[\]\{\}\'\"]{1,50}', $pattern_parts) . '/ui';
            $count = preg_match_all($pattern, $content);
        }

        return $count;
    }

    /**
     * Get top N tags by occurrence count
     * 
     * @param array $tag_matches Associative array of tag names => counts
     * @param int $limit Maximum number of tags to return
     * @return array Array of tag names
     */
    private function get_top_tags($tag_matches, $limit = 10)
    {
        if (empty($tag_matches)) {
            return array();
        }

        // Sort by count (descending)
        arsort($tag_matches);

        // Get top N tags
        $top_tags = array_slice(array_keys($tag_matches), 0, $limit);

        return $top_tags;
    }
}
