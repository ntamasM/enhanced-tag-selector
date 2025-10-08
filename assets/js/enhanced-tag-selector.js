jQuery(document).ready(function ($) {
  "use strict";

  // Check if ets_ajax is properly loaded
  if (typeof ets_ajax === "undefined") {
    console.error(
      "Enhanced Tag Selector: ets_ajax object not found. Plugin may not be properly loaded."
    );
    return;
  }

  // Debug: Log translation information
  console.log("Enhanced Tag Selector Debug Info:");
  console.log("Version: 0.0.3 - Updated Add New Tag UI");
  console.log(
    "Locale:",
    ets_ajax.debug_info ? ets_ajax.debug_info.locale : "debug_info not found"
  );
  console.log(
    "Language:",
    ets_ajax.debug_info
      ? ets_ajax.debug_info.current_language
      : "debug_info not found"
  );
  console.log(
    "Sample translation (see_all_tags):",
    ets_ajax.labels ? ets_ajax.labels.see_all_tags : "labels not found"
  );
  console.log("Full labels object:", ets_ajax.labels);

  var ETS = {
    modal: null,
    selectedTags: [], // Tags already added to the post
    currentSort: "most_used_desc",
    searchTimeout: null,

    init: function () {
      this.modal = $("#ets-modal");
      if (this.modal.length === 0) {
        console.error("Enhanced Tag Selector: Modal element not found.");
        return;
      }
      this.bindEvents();
      this.replaceDefaultTagInterface();
      this.getSelectedTags();
    },

    bindEvents: function () {
      var self = this; // Store context

      // Close modal events
      $(".ets-close").on("click", function (e) {
        self.closeModal();
      });

      $(".ets-modal").on("click", function (e) {
        if (e.target === this) {
          self.closeModal();
        }
      });

      // Prevent modal close when clicking inside content
      $(".ets-modal-content").on("click", function (e) {
        e.stopPropagation();
      });

      // Sort change event
      $("#ets-sort").on("change", function () {
        self.currentSort = $(this).val();
        console.log("Sort changed to:", self.currentSort);
        self.loadTags();
      });

      // Search with debouncing and clear button handling
      $("#ets-search").on("input", function () {
        clearTimeout(self.searchTimeout);
        var searchValue = $(this).val();

        // Show/hide clear button based on input
        if (searchValue.length > 0) {
          $("#ets-search-clear").show();
        } else {
          $("#ets-search-clear").hide();
        }

        self.searchTimeout = setTimeout(function () {
          self.loadTags();
        }, 300);
      });

      // Search clear button
      $("#ets-search-clear").on("click", function (e) {
        e.preventDefault();
        $("#ets-search").val("").trigger("input").focus();
      });

      // ESC key to close modal
      $(document).on("keydown", function (e) {
        if (e.keyCode === 27 && self.modal.is(":visible")) {
          self.closeModal();
        }
      });
    },

    bindNewTagEvents: function () {
      var self = this;

      // Create New Tag button
      $("#ets-create-tag")
        .off("click")
        .on("click", function (e) {
          if (e.target === this) {
            console.log("Create Tag button clicked");
            self.createNewTag();
          }
        });

      // Enter key on new tag input
      $("#ets-new-tag")
        .off("keypress")
        .on("keypress", function (e) {
          if (e.which === 13) {
            // Enter key
            e.preventDefault();
            self.createNewTag();
          }
        });
    },

    replaceDefaultTagInterface: function () {
      var self = this; // Store context

      // Find the WordPress tag metabox
      var $tagDiv = $("#tagsdiv-post_tag");
      if ($tagDiv.length) {
        console.log("Found tag div, replacing entire interface...");

        // Hide ALL original tag interface elements more aggressively
        $tagDiv.find(".jaxtag").hide(); // Hide the tag input area
        $tagDiv.find(".howto").hide(); // Hide instructions
        $tagDiv.find("#tagchecklist").hide(); // Hide existing tags display
        $tagDiv.find(".tagcloud-link").hide(); // Hide any tag cloud links
        $tagDiv.find(".ajaxtag").hide(); // Hide ajax tag elements
        $tagDiv.find(".newtag").hide(); // Hide new tag inputs
        $tagDiv.find(".tagadd").hide(); // Hide tag add buttons

        // Hide any other WordPress tag interface elements
        $tagDiv.find(".inside").children().not(".ets-custom-interface").hide();

        // Create our custom interface
        var customInterface =
          '<div class="ets-custom-interface">' +
          '<div id="ets-current-tags-display" class="ets-current-tags-display">' +
          '<p class="ets-empty-state-message">' +
          (ets_ajax.labels.no_tags_selected ||
            "No tags selected for this post") +
          "</p>" +
          "</div>" +
          '<div class="ets-main-button-container">' +
          '<button type="button" id="ets-select-tags" class="ets-select-tags-btn">' +
          '<span class="ets-icon">🏷️</span> ' +
          ets_ajax.labels.see_all_tags +
          "</button>" +
          "</div>" +
          "</div>";

        // Add our interface to the tag div
        $tagDiv.find(".inside").prepend(customInterface);

        // Force hide any WordPress elements that might appear later
        setTimeout(function () {
          $tagDiv
            .find(".inside")
            .children()
            .not(".ets-custom-interface")
            .hide();
        }, 100);

        // Bind click event to our select tags button
        $("#ets-select-tags").on("click", function (e) {
          e.preventDefault();
          console.log("Select Tags button clicked!");
          self.openModal();
        });

        // Initialize the current tags display
        this.updateCustomTagsDisplay();
      } else {
        console.log("Tag div not found, trying fallback...");
        // Fallback: add to any tag metabox if it exists
        var $tagMetabox = $('.tagsdiv, [id*="tag"]');
        if ($tagMetabox.length) {
          var customInterface =
            '<div class="ets-custom-interface">' +
            '<div class="ets-main-button-container">' +
            '<button type="button" id="ets-select-tags" class="ets-select-tags-btn">' +
            '<span class="ets-icon">🏷️</span> ' +
            ets_ajax.labels.see_all_tags +
            "</button>" +
            "</div>" +
            '<div id="ets-current-tags-display" class="ets-current-tags-display">' +
            '<p class="ets-empty-state-message">' +
            (ets_ajax.labels.no_tags_selected ||
              "No tags selected for this post") +
            "</p>" +
            "</div>" +
            "</div>";

          $tagMetabox.first().find(".inside").prepend(customInterface);

          $("#ets-select-tags").on("click", function (e) {
            e.preventDefault();
            console.log("Select Tags button clicked (fallback)!");
            self.openModal();
          });

          this.updateCustomTagsDisplay();
        } else {
          console.log("No tag areas found on this page.");
        }
      }
    },

    openModal: function () {
      this.getSelectedTags();
      this.displayCurrentPostTags(); // Display existing post tags
      this.modal.fadeIn(300);
      this.loadTags();
      $("#ets-search").focus();

      // Trigger custom event
      $(document).trigger("ets:modal:opened");
    },

    closeModal: function () {
      this.modal.fadeOut(300);
      $("#ets-search").val("");

      // Trigger custom event
      $(document).trigger("ets:modal:closed");
    },

    getSelectedTags: function () {
      this.selectedTags = [];

      // Method 1: Get currently selected tags from the WordPress tag input (most reliable)
      var $tagInput = $("#tax-input-post_tag");
      if ($tagInput.length && $tagInput.val()) {
        var tagNames = $tagInput.val().split(",");
        this.selectedTags = tagNames
          .map(function (name) {
            return name.trim();
          })
          .filter(function (name) {
            return name.length > 0;
          });

        console.log("Selected tags from input field:", this.selectedTags);
        return; // Use this method as primary and exit early
      }

      // Method 2: Check for WordPress tag checkboxes (as shown in your image)
      var selectedIds = [];
      $('input[name="tax_input[post_tag][]"]:checked').each(function () {
        selectedIds.push(parseInt($(this).val()));
      });

      if (selectedIds.length > 0) {
        this.selectedTags = selectedIds;
        console.log("Selected tags from checkboxes (IDs):", this.selectedTags);
        return;
      }

      // Method 3: Check for tags in the tag checklist display (last resort)
      var tagNamesFromChecklist = [];
      $("#tagchecklist, .tagchecklist")
        .find("span")
        .each(function () {
          var $span = $(this);
          // Remove any delete buttons and their text
          var $spanClone = $span.clone();
          $spanClone.find("a, .ntdelbutton").remove();
          var tagText = $spanClone.text().replace(/×/g, "").trim();

          // Skip if text contains Greek removal text or IDs
          if (
            tagText.length > 0 &&
            !tagText.match(/Αφαίρεση όρου:/) &&
            !tagText.match(/Remove term:/) &&
            !tagText.match(/^\d+$/)
          ) {
            // Skip pure numbers
            tagNamesFromChecklist.push(tagText);
          }
        });

      if (tagNamesFromChecklist.length > 0) {
        this.selectedTags = tagNamesFromChecklist;
        console.log("Selected tags from checklist:", this.selectedTags);
      }

      console.log("Finally selected tags:", this.selectedTags);
    },

    loadTags: function () {
      var self = this; // Store context
      var $container = $("#ets-tags-container");
      $container.html(
        '<div class="ets-loading"><span class="ets-icon ets-icon-loading"></span>' +
          ets_ajax.labels.loading_tags +
          "</div>"
      );

      // Check if currentSort is defined and is a string
      if (!this.currentSort || typeof this.currentSort !== "string") {
        console.log(
          "currentSort was invalid:",
          this.currentSort,
          "resetting to default"
        );
        this.currentSort = "most_used_desc";
      }

      console.log("Current sort:", this.currentSort);

      // Extra safety check before split
      if (typeof this.currentSort !== "string") {
        console.error(
          "currentSort is still not a string!",
          typeof this.currentSort,
          this.currentSort
        );
        this.currentSort = "most_used_desc";
      }

      var sortParts = this.currentSort.split("_");
      console.log("Sort parts:", sortParts);

      if (sortParts.length < 2) {
        console.error("Invalid sort format, using default");
        this.currentSort = "most_used_desc";
        sortParts = this.currentSort.split("_");
      }

      var orderBy, order;

      if (sortParts.length === 2) {
        // Handle format like "alphabetical_asc" or "alphabetical_desc"
        orderBy = sortParts[0]; // alphabetical or most_used (but most_used needs special handling)
        order = sortParts[1]; // asc or desc

        // Fix for most_used case - need to reconstruct it
        if (orderBy === "most") {
          console.error("Incomplete sort format detected, reconstructing");
          this.currentSort = "most_used_desc";
          sortParts = this.currentSort.split("_");
          orderBy = sortParts[0] + "_" + sortParts[1]; // most_used
          order = sortParts[2]; // desc
        }
      } else if (sortParts.length === 3) {
        // Handle format like "most_used_desc"
        orderBy = sortParts[0] + "_" + sortParts[1]; // most_used
        order = sortParts[2]; // asc or desc
      } else {
        console.error("Unexpected sort format, using default");
        this.currentSort = "most_used_desc";
        orderBy = "most_used";
        order = "desc";
      }

      console.log("Order by:", orderBy, "Order:", order);

      // Check if ets_ajax is available
      if (typeof ets_ajax === "undefined") {
        $container.html(
          '<div class="ets-error">Error: Plugin configuration not loaded properly.</div>'
        );
        return;
      }

      var data = {
        action: "ets_get_tags",
        nonce: ets_ajax.nonce,
        order_by: orderBy,
        order: order,
        search: $("#ets-search").val() || "",
        selected_tags: this.selectedTags || [],
      };

      console.log("AJAX data:", data);

      $.post(ets_ajax.ajax_url, data, function (response) {
        if (response.success) {
          self.renderTags(response.data); // Use self instead of ETS
        } else {
          $container.html(
            '<div class="ets-error">Error loading tags: ' +
              (response.data || "Unknown error") +
              "</div>"
          );
        }
      }).fail(function (xhr, status, error) {
        console.error("AJAX Error:", status, error);
        $container.html(
          '<div class="ets-error">Error loading tags. Please try again. (Error: ' +
            status +
            ")</div>"
        );
      });
    },

    renderTags: function (tags) {
      var self = this; // Store context
      var $container = $("#ets-tags-container");
      var searchTerm = $("#ets-search").val().trim();

      console.log("renderTags called with tags.length:", tags.length);
      console.log("Available labels:", ets_ajax.labels);

      if (tags.length === 0) {
        console.log("No tags found, rendering add new tag interface");
        // Always show add new tag option when no tags are found (without wrapper div)
        var addNewTagHTML =
          '<div class="ets-add-new-tag-section">' +
          '<h4 class="ets-new-tag-title">' +
          '<span class="ets-icon ets-icon-plus"></span>' +
          (ets_ajax.labels.no_tag_found_create ||
            "No tag found. You want to create a tag like this?") +
          "</h4>" +
          '<div class="ets-section-content">' +
          '<div class="ets-new-tag-input">' +
          '<div class="ets-input-wrapper">' +
          '<span class="ets-icon ets-icon-tag"></span>' +
          '<input type="text" id="ets-new-tag" value="' +
          searchTerm +
          '" placeholder="' +
          (ets_ajax.labels.enter_tag_names ||
            "Enter new tag name(s), separated by commas...") +
          '" />' +
          "</div>" +
          '<button id="ets-create-tag" class="ets-create-tag-btn" type="button">' +
          (ets_ajax.labels.create_add || "Create & Add") +
          "</button>" +
          "</div>" +
          "</div>" +
          "</div>";

        console.log("Setting HTML to:", addNewTagHTML);
        $container.html(addNewTagHTML);

        // Bind events for the new tag creation
        self.bindNewTagEvents();

        return;
      }

      console.log("Rendering", tags.length, "tags");
      var html = '<div class="ets-tags-grid">';
      tags.forEach(function (tag) {
        // Check if tag is already added to the post
        var isAlreadyAdded = self.isTagAlreadyAdded(tag);
        var addedClass = isAlreadyAdded ? " ets-tag-added" : "";

        html +=
          '<div class="ets-tag-item' +
          addedClass +
          '" data-tag-id="' +
          tag.id +
          '" data-tag-name="' +
          tag.name +
          '" data-tag-slug="' +
          tag.slug +
          '">';
        html += '<span class="ets-tag-name">' + tag.name + "</span>";
        html += '<span class="ets-tag-count">(' + tag.count + ")</span>";
        html += "</div>";
      });
      html += "</div>";

      $container.html(html);

      // Bind click events to tag items using direct binding
      $(".ets-tag-item").on("click", function () {
        console.log("Tag clicked:", $(this).data("tag-name"));
        self.addTagDirectly($(this));
      });
    },

    isTagAlreadyAdded: function (tag) {
      // Check if tag is already in selectedTags (current post tags)
      if (Array.isArray(this.selectedTags)) {
        if (typeof this.selectedTags[0] === "string") {
          // selectedTags contains tag names
          return this.selectedTags.some(function (tagName) {
            // Ensure both values are strings before comparison
            return (
              String(tagName).toLowerCase() === String(tag.name).toLowerCase()
            );
          });
        } else {
          // selectedTags contains tag IDs
          return this.selectedTags.some(function (tagId) {
            return tagId === tag.id;
          });
        }
      }
      return false;
    },

    addTagDirectly: function ($tagItem) {
      var tagName = $tagItem.data("tag-name");
      var tagId = $tagItem.data("tag-id");
      var tagSlug = $tagItem.data("tag-slug");

      // Ensure tagName is a string
      tagName = String(tagName);

      console.log("Adding tag directly:", tagName, "ID:", tagId);

      // Check if tag is already added to the post
      if (this.isTagAlreadyAdded({ id: tagId, name: tagName })) {
        console.log("Tag '" + tagName + "' is already added to this post");
        return;
      }

      // Add tag directly to the post
      this.addTagToPost({
        id: tagId,
        name: tagName,
        slug: tagSlug,
      });
    },

    addTagToPost: function (tag) {
      var self = this;
      console.log("Adding tag to post:", tag);

      // Primary method: Use WordPress tag input field
      var $tagInput = $("#tax-input-post_tag");
      if ($tagInput.length) {
        console.log("Found tag input field");
        var currentTags = $tagInput.val().trim();
        var existingTags = currentTags
          ? currentTags.split(",").map(function (t) {
              return t.trim().toLowerCase();
            })
          : [];

        // Check if tag already exists
        if (existingTags.indexOf(String(tag.name).toLowerCase()) !== -1) {
          console.log("Tag '" + tag.name + "' is already added to this post");
          return;
        }

        // Update the input field
        var newTagsValue = currentTags
          ? currentTags + ", " + tag.name
          : tag.name;
        $tagInput.val(newTagsValue);

        // Add tag to WordPress display area
        var $tagsList = $("#tagchecklist");
        if ($tagsList.length) {
          // Check if tag is already displayed
          var existingSpan = $tagsList.find("span").filter(function () {
            return $(this).text().replace(/×/g, "").trim() === tag.name;
          });

          if (existingSpan.length === 0) {
            // Create tag element
            var $tagSpan = $("<span></span>");
            var $deleteButton = $('<a class="ntdelbutton">×</a>').on(
              "click",
              function () {
                // Remove from input when delete button is clicked
                var currentVal = $tagInput.val();
                var tagArray = currentVal.split(",").map(function (t) {
                  return t.trim();
                });
                var filteredTags = tagArray.filter(function (t) {
                  return t !== tag.name;
                });
                $tagInput.val(filteredTags.join(", "));
                $tagSpan.remove();

                // Update our selectedTags and refresh displays
                setTimeout(function () {
                  self.getSelectedTags();
                  self.updateCustomTagsDisplay();
                  self.displayCurrentPostTags();
                  // Refresh the tags grid to update the "added" status
                  self.loadTags();
                }, 100);
                return false;
              }
            );

            $tagSpan.append($deleteButton).append("&nbsp;" + tag.name);
            $tagsList.append($tagSpan);
          }
        }

        // Trigger change events
        $tagInput.trigger("change");
        $tagInput.trigger("input");

        console.log("Tag '" + tag.name + "' added successfully!");

        // Update selectedTags and refresh displays
        setTimeout(function () {
          self.getSelectedTags();
          self.updateCustomTagsDisplay(); // Update the custom interface
          self.displayCurrentPostTags(); // Update current post tags display
          // Refresh the tags grid to update the "added" status
          self.loadTags();
        }, 100);

        console.log("Successfully added tag:", tag.name);
      } else {
        // Fallback: Try checkbox method
        var $existingCheckbox = $(
          'input[name="tax_input[post_tag][]"][value="' + tag.id + '"]'
        );

        if ($existingCheckbox.length) {
          if (!$existingCheckbox.is(":checked")) {
            $existingCheckbox.prop("checked", true);
            console.log("Checked existing tag checkbox for:", tag.name);
            console.log("Tag '" + tag.name + "' added successfully!");

            // Update selectedTags and refresh displays
            setTimeout(function () {
              self.getSelectedTags();
              self.updateCustomTagsDisplay();
              self.displayCurrentPostTags();
              self.loadTags();
            }, 100);
          } else {
            console.log("Tag '" + tag.name + "' is already added to this post");
          }
        } else {
          console.log("Tag checkbox not found for:", tag.name);
          console.log(
            "Could not add tag '" + tag.name + "'. Please try again."
          );
        }
      }
    },

    selectTag: function ($tagItem) {
      var tagName = $tagItem.data("tag-name");
      var tagId = $tagItem.data("tag-id");
      var tagSlug = $tagItem.data("tag-slug");

      console.log("Selecting tag:", tagName, "ID:", tagId);

      // Add tag to WordPress tag input
      var $tagInput = $("#tax-input-post_tag");
      console.log("Tag input found:", $tagInput.length > 0);

      if ($tagInput.length) {
        var currentTags = $tagInput.val().trim();
        console.log("Current tags:", currentTags);

        if (currentTags) {
          // Check if tag already exists to prevent duplicates
          var existingTags = currentTags.split(",").map(function (tag) {
            return tag.trim().toLowerCase();
          });

          if (existingTags.indexOf(String(tagName).toLowerCase()) === -1) {
            $tagInput.val(currentTags + ", " + tagName);
            console.log("Added tag to existing list");
          } else {
            console.log("Tag already exists, skipping");
            console.log('Tag "' + tagName + '" is already selected!');
            return;
          }
        } else {
          $tagInput.val(tagName);
          console.log("Added first tag");
        }

        // Trigger WordPress tag addition if available
        if (typeof tagBox !== "undefined" && tagBox.parseTags) {
          console.log("Triggering WordPress tagBox.parseTags");
          tagBox.parseTags("post_tag");
        } else {
          console.log("WordPress tagBox not available");
        }

        // Trigger input change event for WordPress
        $tagInput.trigger("change");
        $tagInput.trigger("input");

        console.log("Final tag input value:", $tagInput.val());
      } else {
        console.error("WordPress tag input field not found!");
        console.log("Error: Tag input field not found!");
        return;
      }

      // Remove the selected tag from our display and update selected tags
      $tagItem.fadeOut(300, function () {
        $(this).remove();
      });

      // Update our internal selected tags array
      this.selectedTags.push(tagId);

      console.log('Tag "' + tagName + '" added successfully!');

      // Trigger custom event
      $(document).trigger("ets:tag:selected", {
        id: tagId,
        name: tagName,
        slug: tagSlug,
      });
    },

    updateCustomTagsDisplay: function () {
      var $customDisplay = $("#ets-current-tags-display");
      if (!$customDisplay.length) {
        return; // Element doesn't exist yet
      }

      // Get current post tags
      this.getSelectedTags();

      if (this.selectedTags.length === 0) {
        // Show "no tags" message
        $customDisplay.html(
          '<p class="ets-empty-state-message">' +
            (ets_ajax.labels.no_tags_selected ||
              "No tags selected for this post") +
            "</p>"
        );
      } else {
        // Show current tags as chips
        var html = '<div class="ets-custom-tags-grid">';
        var self = this;

        this.selectedTags.forEach(function (tag) {
          var tagName = typeof tag === "string" ? tag : tag.name || tag;
          html += '<span class="ets-custom-tag-chip">' + tagName + "</span>";
        });
        html += "</div>";

        $customDisplay.html(html);
      }

      // Update the button text to show count
      var $button = $("#ets-select-tags");
      if ($button.length) {
        var buttonText =
          this.selectedTags.length > 0
            ? '<span class="ets-icon">🏷️</span> ' +
              ets_ajax.labels.see_all_tags +
              " (" +
              this.selectedTags.length +
              ")"
            : '<span class="ets-icon">🏷️</span> ' +
              ets_ajax.labels.see_all_tags;
        $button.html(buttonText);
      }
    },

    displayCurrentPostTags: function () {
      var $currentTagsContainer = $("#ets-current-post-tags");
      var $noCurrent = $currentTagsContainer.find(".ets-no-current");

      // Get current post tags
      this.getSelectedTags();

      if (this.selectedTags.length === 0) {
        // Show "no tags" message
        if ($noCurrent.length === 0) {
          $currentTagsContainer.html(
            '<p class="ets-no-current"><span class="ets-icon ets-icon-info"></span>' +
              ets_ajax.labels.no_tags_assigned +
              "</p>"
          );
        }
      } else {
        // Show current tags
        var html = '<div class="ets-current-tags-grid">';
        var self = this;

        this.selectedTags.forEach(function (tag) {
          var tagName = typeof tag === "string" ? tag : tag.name || tag;
          // Ensure tagName is always a string
          tagName = String(tagName);
          html += '<div class="ets-current-tag-item">';
          html += '<span class="ets-current-tag-name">' + tagName + "</span>";
          html +=
            '<span class="ets-remove-current-tag" data-tag-name="' +
            tagName +
            '">&times;</span>';
          html += "</div>";
        });
        html += "</div>";

        $currentTagsContainer.html(html);

        // Bind click events for removing current tags
        $currentTagsContainer
          .find(".ets-remove-current-tag")
          .on("click", function (e) {
            e.stopPropagation();
            var tagName = $(this).data("tag-name");
            self.removeCurrentTag(tagName);
          });
      }
    },

    removeCurrentTag: function (tagName) {
      // Ensure tagName is a string
      tagName = String(tagName);

      var $tagInput = $("#tax-input-post_tag");
      if ($tagInput.length) {
        var currentTags = $tagInput.val().trim();
        if (currentTags) {
          var tagArray = currentTags.split(",").map(function (tag) {
            return tag.trim();
          });

          // Remove the tag
          var filteredTags = tagArray.filter(function (tag) {
            return tag.toLowerCase() !== tagName.toLowerCase();
          });

          $tagInput.val(filteredTags.join(", "));

          // Remove from visual display
          var $tagsList = $("#tagchecklist");
          if ($tagsList.length) {
            $tagsList
              .find("span")
              .filter(function () {
                return $(this).text().replace(/×/g, "").trim() === tagName;
              })
              .remove();
          }

          // Trigger change events
          $tagInput.trigger("change");
          $tagInput.trigger("input");

          // Update displays
          this.getSelectedTags();
          this.displayCurrentPostTags();
          this.updateCustomTagsDisplay(); // Update the custom interface
          this.loadTags(); // Reload to show the removed tag in available tags

          console.log('Tag "' + tagName + '" removed from post');
        }
      }
    },

    createNewTag: function () {
      var $newTagInput = $("#ets-new-tag");
      var newTagNames = $newTagInput.val().trim();

      if (!newTagNames) {
        console.log("Please enter a tag name");
        return;
      }

      // Split by commas and trim each tag name
      var tagNamesArray = newTagNames
        .split(",")
        .map(function (tag) {
          return tag.trim();
        })
        .filter(function (tag) {
          return tag.length > 0; // Remove empty strings
        });

      if (tagNamesArray.length === 0) {
        console.log("Please enter valid tag names");
        return;
      }

      var self = this;
      var addedTags = [];
      var skippedTags = [];
      var duplicateMessage = [];

      // Process each tag
      tagNamesArray.forEach(function (newTagName) {
        // Check if tag already exists in current post tags
        var existingCurrent = self.selectedTags.find(function (tag) {
          var tagName = typeof tag === "string" ? tag : tag.name || tag;
          return (
            String(tagName).toLowerCase() === String(newTagName).toLowerCase()
          );
        });

        if (existingCurrent) {
          skippedTags.push(newTagName);
          duplicateMessage.push(
            'Tag "' + newTagName + '" is already assigned to this post'
          );
          return;
        }

        // Create new tag object
        var newTag = {
          id: -Date.now() - Math.random(), // Unique negative ID for new tags
          name: newTagName,
          slug: newTagName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, ""),
        };

        // Add directly to post
        self.addTagToPost(newTag);
        addedTags.push(newTagName);

        console.log("Created and added new tag:", newTag);
      });

      // Clear the input
      $newTagInput.val("");

      // Clear the search field and reload tags if tags were successfully added
      if (addedTags.length > 0) {
        $("#ets-search").val("");
        self.loadTags(); // Refresh the tags display
      }

      // Log results
      if (addedTags.length > 0 && skippedTags.length === 0) {
        var message =
          addedTags.length === 1
            ? 'New tag "' + addedTags[0] + '" created and added to post'
            : addedTags.length +
              " new tags created and added to post: " +
              addedTags.join(", ");
        console.log(message);
      } else if (addedTags.length > 0 && skippedTags.length > 0) {
        var successMessage =
          addedTags.length + " tags created and added: " + addedTags.join(", ");
        var warningMessage =
          skippedTags.length +
          " tags skipped (already exist): " +
          skippedTags.join(", ");
        console.log(successMessage + ". " + warningMessage);
      } else if (skippedTags.length > 0) {
        console.log(duplicateMessage.join(". "));
      }
    },
  };

  // Initialize when DOM is ready
  console.log("Enhanced Tag Selector: Initializing...");
  ETS.init();
  console.log("Enhanced Tag Selector: Initialization complete.");
});
