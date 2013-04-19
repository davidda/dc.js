
Changes for enabling multiple filtering/selection in dc.js
=====

The goal was
--------------------
* be able to filter by multiple data points in supported charts
* the user can trigger this functionality by holding a modifier key while clicking
* changes should not break existing code that uses dc.js -> backwards compatibility

Usage
--------------------
(also refer to updated API)

The usage is simple: By default multiple selection is not enabled. By calling .allowMultipleFilters(true) on a supported chart the feature is enabled. By holding CTRL or SHIFT while clicking, multiple data points can then be selected.

Implementation Details
--------------------
Three somehow distinct tasks were identified (independent of filter multiplicity):
* Selection (detect user actions on UI)
* Filtering (crossfilter interaction, filterHandler)
* Display filter (display controls, highlight filtered portion within chart)

The implementation seperates these three tasks.

### Selection
Because every chart that supports single data point selection can also support multi selection, singleSelectionChart was replaced by multiSelectionChart. It captures the click event to support single selection. However, if multiple filtering is turned on, it reacts to modifier keys to trigger multiple selection accordingly.

### Filtering
Filtering and Selection were both handeled by singleSelectionChart. Filtering is now moved to the base chart. The filter() method behaves still the same. New methods filterAdd(f), filterRemove(f) and filters(f) were added to support multiple filtering programatically.

### Display Filter
The charts basically supported highligthing more than one slice/bar/whatever already, so very little had to be changed here. The base chart also provides a method displayFilter() that can be overriden by a subchart (instead of overriding filter like before). This is only used by coordinateGridChart so far.

There were definitely a lot of other ways this could have been implemented. I don't claim this is the best one. At least it works fine on current Firefox and IE browsers. Also, because backwards compatibility was a goal, there is some overhead associated with it. The implementation could be cleaner, if that goal was dropped.
