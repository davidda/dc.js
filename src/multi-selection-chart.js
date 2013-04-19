dc.multiSelectionChart = function (_chart) {
    _chart.highlightSelected = function (e) {
        d3.select(e).classed(dc.constants.SELECTED_CLASS, true);
        d3.select(e).classed(dc.constants.DESELECTED_CLASS, false);
    };

    _chart.fadeDeselected = function (e) {
        d3.select(e).classed(dc.constants.SELECTED_CLASS, false);
        d3.select(e).classed(dc.constants.DESELECTED_CLASS, true);
    };

    _chart.resetHighlight = function (e) {
        d3.select(e).classed(dc.constants.SELECTED_CLASS, false);
        d3.select(e).classed(dc.constants.DESELECTED_CLASS, false);
    };

    _chart.onClick = function (d) {
        var toFilter = _chart.keyAccessor()(d);
        dc.events.trigger(function () {
            _chart.filterTo(toFilter);
        });
    };

    _chart.filterTo = function (toFilter) {
        var remove = _chart.isFilteredBy(toFilter);

        if (_chart.allowMultipleFilters() && (d3.event.ctrlKey || d3.event.shiftKey)) {
            if (remove)
                _chart.filterRemove(toFilter);
            else
                _chart.filterAdd(toFilter);
        } else {
            if (remove && _chart.filters().length > 1) {
                _chart.filterAll();
                remove = false;
            }
            _chart.filter(remove ? null : toFilter);
        }

        dc.redrawAll(_chart.chartGroup());
    };

    return _chart;
};
