if (!PrimeFaces.utils) {

    PrimeFaces.utils = {

        resolveDynamicOverlayContainer: function(widget) {
            return widget.cfg.appendTo
                ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(widget.cfg.appendTo)
                : $(document.body);
        },

        /**
         * Removes the overlay from the appendTo overlay container.
         */
        removeDynamicOverlay: function(widget, element, id, appendTo) {

            // if the id contains a ':'
            appendTo.children(PrimeFaces.escapeClientId(id)).not(element).remove();

            // if the id does NOT contain a ':'
            appendTo.children("[id='" + id + "']").not(element).remove();
        },

        appendDynamicOverlay: function(widget, element, id, appendTo) {
            var elementParent = element.parent();

            // skip when the parent currently is already the same
            // this likely happens when the dialog is updated directly instead of a container
            // as our ajax update mechanism just updates by id
            if (!elementParent.is(appendTo)
                    && !appendTo.is(element)) {

                PrimeFaces.utils.removeDynamicOverlay(widget, element, id, appendTo);

                element.appendTo(appendTo);
            }
        },

        addModal: function(id, zIndex, tabbablesCallback) {

            //Disable tabbing out of modal and stop events from targets outside of the overlay element
            var $document = $(document);
            $document.on('focus.' + id + ' mousedown.' + id + ' mouseup.' + id, function(event) {
                if ($(event.target).zIndex() < zIndex) {
                    event.preventDefault();
                }
            });
            $document.on('keydown.' + id, function(event) {
                var target = $(event.target);
                if (event.which === $.ui.keyCode.TAB) {
                    var tabbables = tabbablesCallback();
                    if (tabbables.length) {
                        var first = tabbables.filter(':first'),
                        last = tabbables.filter(':last'),
                        focusingRadioItem = null;

                        if(first.is(':radio')) {
                            focusingRadioItem = tabbables.filter('[name="' + first.attr('name') + '"]').filter(':checked');
                            if(focusingRadioItem.length > 0) {
                                first = focusingRadioItem;
                            }
                        }

                        if(last.is(':radio')) {
                            focusingRadioItem = tabbables.filter('[name="' + last.attr('name') + '"]').filter(':checked');
                            if(focusingRadioItem.length > 0) {
                                last = focusingRadioItem;
                            }
                        }

                        if(target.is(document.body)) {
                            first.focus(1);
                            event.preventDefault();
                        }
                        else if(event.target === last[0] && !event.shiftKey) {
                            first.focus(1);
                            event.preventDefault();
                        }
                        else if (event.target === first[0] && event.shiftKey) {
                            last.focus(1);
                            event.preventDefault();
                        }
                    }
                }
                else if(!target.is(document.body) && (target.zIndex() < zIndex)) {
                    event.preventDefault();
                }
            });

            var modalId = id + '_modal';

            var modalOverlay = $('<div id="' + modalId + '" class="ui-widget-overlay ui-dialog-mask"></div>');
            modalOverlay.appendTo($(document.body));
            modalOverlay.css('z-index' , zIndex);

            return modalOverlay;
        },

        removeModal: function(id) {
            var modalId = id + '_modal';

            // if the id contains a ':'
            $(PrimeFaces.escapeClientId(modalId)).remove();

            // if the id does NOT contain a ':'
            $(document.body).children("[id='" + modalId + "']").remove();

            $(document).off('focus.' + id + ' mousedown.' + id + ' mouseup.' + id + ' keydown.' + id);
        },

        /**
         * Checks if a modal for the given id is currently displayed.
         *
         * @param {type} id the base id
         */
        isModalActive: function(id) {
            var modalId = id + '_modal';

            return $(PrimeFaces.escapeClientId(modalId)).length === 1
                || $(document.body).children("[id='" + modalId + "']").length === 1;
        },


        /**
         * Registers the document handler, to execute the hideCallback when it's clicked outside of the overlay panel.
         *
         * @param {type} widget the widget instance
         * @param {type} hideNamespace the namespace
         * @param {type} overlay the overlay $element
         * @param {type} resolveIgnoredElementsCallback the callback which resolves the elements to ignore when clicked
         * @param {type} hideCallback will be executed when clicked outside
         */
        registerHideOverlayHandler: function(widget, hideNamespace, overlay, resolveIgnoredElementsCallback, hideCallback) {

            widget.destroyListeners.push(function() {
                $(document).off(hideNamespace);
            });

            $(document).off(hideNamespace).on(hideNamespace, function (e) {
                if (overlay.is(":hidden")) {
                    return;
                }

                var $eventTarget = $(e.target);

                // do nothing when the element should be ignored
                if (resolveIgnoredElementsCallback) {
                    var elementsToIgnore = resolveIgnoredElementsCallback();
                    if (elementsToIgnore) {
                        if (elementsToIgnore.is($eventTarget) || elementsToIgnore.has($eventTarget).length > 0) {
                            return;
                        }
                    }
                }

                // do nothing when the clicked element is a child of the overlay
                if (overlay.is($eventTarget) || overlay.has($eventTarget).length > 0) {
                    return;
                }

                // old check:
                /*
                var offset = overlay.offset();
                if (e.pageX < offset.left
                        || e.pageX > offset.left + overlay.width()
                        || e.pageY < offset.top
                        || e.pageY > offset.top + overlay.height()) {
                    hideCallback();
                }
                */

                hideCallback();
            });
        },


        registerResizeHandler: function(widget, resizeNamespace, element, resizeCallback) {

            widget.destroyListeners.push(function() {
                $(window).off(resizeNamespace);
            });

            $(window).off(resizeNamespace).on(resizeNamespace, function(e) {
                if (element && element.is(":hidden")) {
                    return;
                }

                resizeCallback();
            });
        }

    };

}