dc.baseChart = function (_chart) {
    _chart.__dc_flag__ = true;

    var _dimension;
    var _group;

    var _anchor;
    var _root;
    var _svg;

    var _width = 200, _height = 200;

    var _keyAccessor = function (d) {
        return d.key;
    };
    var _valueAccessor = function (d) {
        return d.value;
    };

    var _label = function (d) {
        return d.key;
    };
    var _renderLabel = false;

    var _title = function (d) {
        return d.key + ": " + d.value;
    };
    var _renderTitle = false;

    var _transitionDuration = 750;

    var _filter;
    var _allowMultipleFilters = false;
    var _multiFilter = [];
    var _filterPrinter = dc.printers.filter;
    var _multiFilterPrinter = dc.printers.multiFilter;
    var _filterHandler = function (dimension, filter) {
        if (_chart.allowMultipleFilters()) {
            if (filter.length > 0)
                dimension.filterFunction(function (d) { return filter.indexOf(d) >= 0; });
            else
                dimension.filter(null);
        } else
            dimension.filter(filter);

        return filter;
    };

    var _renderlets = [];

    var _chartGroup = dc.constants.DEFAULT_CHART_GROUP;

    var NULL_LISTENER = function (chart) {
    };
    var _listeners = {
        preRender: NULL_LISTENER,
        postRender: NULL_LISTENER,
        preRedraw: NULL_LISTENER,
        postRedraw: NULL_LISTENER,
        filtered: NULL_LISTENER
    };

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.dimension = function (d) {
        if (!arguments.length) return _dimension;
        _dimension = d;
        _chart.expireCache();
        return _chart;
    };

    _chart.group = function (g) {
        if (!arguments.length) return _group;
        _group = g;
        _chart.expireCache();
        return _chart;
    };

    _chart.orderedGroup = function () {
        return _group.order(function (p) {
            return p.key;
        });
    };

    _chart.filterAll = function () {
        return _chart.filter(null);
    };

    _chart.dataSet = function () {
        return _dimension != undefined && _group != undefined;
    };

    _chart.select = function (s) {
        return _root.select(s);
    };

    _chart.selectAll = function (s) {
        return _root.selectAll(s);
    };

    _chart.anchor = function (a, chartGroup) {
        if (!arguments.length) return _anchor;
        if (dc.instanceOfChart(a)) {
            _anchor = a.anchor();
            _root = a.root();
        } else {
            _anchor = a;
            _root = d3.select(_anchor);
            _root.classed(dc.constants.CHART_CLASS, true);
            dc.registerChart(_chart, chartGroup);
        }
        _chartGroup = chartGroup;
        return _chart;
    };

    _chart.root = function (r) {
        if (!arguments.length) return _root;
        _root = r;
        return _chart;
    };

    _chart.svg = function (_) {
        if (!arguments.length) return _svg;
        _svg = _;
        return _chart;
    };

    _chart.resetSvg = function () {
        _chart.select("svg").remove();
        return _chart.generateSvg();
    };

    _chart.generateSvg = function () {
        _svg = _chart.root().append("svg")
            .attr("width", _chart.width())
            .attr("height", _chart.height());
        return _svg;
    };

    _chart.filterPrinter = function (_) {
        if (!arguments.length) return _filterPrinter;
        _filterPrinter = _;
        return _chart;
    };

    _chart.multiFilterPrinter = function (_) {
        if (!arguments.length) return _multiFilterPrinter;
        _multiFilterPrinter = _;
        return _chart;
    };

    _chart.turnOnControls = function () {
        _chart.selectAll(".reset").style("display", null);
        _chart.selectAll(".filter").text(_multiFilterPrinter(_chart.filters(), _chart.filterPrinter())).style("display", null);
        return _chart;
    };

    _chart.turnOffControls = function () {
        _chart.selectAll(".reset").style("display", "none");
        _chart.selectAll(".filter").style("display", "none").text(_chart.filter());
        return _chart;
    };

    _chart.transitionDuration = function (d) {
        if (!arguments.length) return _transitionDuration;
        _transitionDuration = d;
        return _chart;
    };

    _chart.render = function () {
        _listeners.preRender(_chart);

        if (_dimension == null)
            throw new dc.errors.InvalidStateException("Mandatory attribute chart.dimension is missing on chart["
                + _chart.anchor() + "]");

        if (_group == null)
            throw new dc.errors.InvalidStateException("Mandatory attribute chart.group is missing on chart["
                + _chart.anchor() + "]");

        var result = _chart.doRender();


        if (_chart.transitionDuration() > 0) {
            setTimeout(function () {
                _chart.invokeRenderlet(_chart);
                _listeners.postRender(_chart);
            }, _chart.transitionDuration());
        } else {
            _chart.invokeRenderlet(_chart);
            _listeners.postRender(_chart);
        }

        return result;
    };

    _chart.redraw = function () {
        _listeners.preRedraw(_chart);

        var result = _chart.doRedraw();

        _chart.invokeRenderlet(_chart);

        _listeners.postRedraw(_chart);

        return result;
    };

    _chart.invokeFilteredListener = function (chart, f) {
        if (f !== undefined) _listeners.filtered(_chart, f);
    };

    _chart.hasFilter = function () {
        return _filter != null;
    };

    _chart.isFilteredBy = function (d) {
        return _multiFilter.indexOf(d) >= 0;
    };

    _chart.filter = function (newFilter) {
        if (!arguments.length) return _filter;

        return _chart.filters(newFilter ? [newFilter] : []);
    };

    _chart.filterAdd = function (newFilter) {
        if (!arguments.length || !newFilter) return _chart;

        if (_multiFilter.length > 0 && !_chart.allowMultipleFilters())
            throw new dc.errors.Exception("Multiple filters are not enabled for this chart!");

        _multiFilter.push(newFilter);

        return _chart.filters(_multiFilter);
    };

    _chart.filterRemove = function (delFilter) {
        if (!arguments.length || !delFilter) return _chart;

        var i = _multiFilter.indexOf(delFilter);

        if (i >= 0)
            _multiFilter.splice(i, 1);

        return _chart.filters(_multiFilter);
    };

    _chart.filters = function (filters) {
        if (!arguments.length) return _multiFilter;

        if (!filters) filters = [];

        if (filters.length > 1 && !_chart.allowMultipleFilters())
            throw new dc.errors.Exception("Multiple filters are not enabled for this chart!");

        _filter = filters.length == 0 ? null : filters[filters.length - 1];

        if (_chart.dataSet() && _chart.dimension().filter != undefined) {
            var f;
            if (_chart.allowMultipleFilters()) {
                f = _filterHandler(_chart.dimension(), filters);
                _multiFilter = f ? f : filters;
                _filter = _multiFilter.length == 0 ? null : _multiFilter[_multiFilter.length - 1];
            } else {
                f = _filterHandler(_chart.dimension(), _filter);
                _filter = f ? f : _filter;
                _multiFilter = f ? [f] : _multiFilter;
            }
        }

        _chart.displayFilter();
        _chart.invokeFilteredListener(_chart, _chart.allowMultipleFilters() ? _multiFilter : _filter);

        return _chart;
    };

    _chart.filterHandler = function (_) {
        if (!arguments.length) return _filterHandler;
        _filterHandler = _;
        return _chart;
    };

    _chart.allowMultipleFilters = function (b) {
        if (!arguments.length) return _allowMultipleFilters;
        _allowMultipleFilters = b;
        return _chart;
    };

    _chart.displayFilter = function () {
        if (_chart.hasFilter())
            _chart.turnOnControls();
        else
            _chart.turnOffControls();

        return _chart;
    };

    _chart.doRender = function () {
        // do nothing in base, should be overridden by sub-function
        return _chart;
    };

    _chart.doRedraw = function () {
        // do nothing in base, should be overridden by sub-function
        return _chart;
    };

    _chart.keyAccessor = function (_) {
        if (!arguments.length) return _keyAccessor;
        _keyAccessor = _;
        return _chart;
    };

    _chart.valueAccessor = function (_) {
        if (!arguments.length) return _valueAccessor;
        _valueAccessor = _;
        return _chart;
    };

    _chart.label = function (_) {
        if (!arguments.length) return _label;
        _label = _;
        _renderLabel = true;
        return _chart;
    };

    _chart.renderLabel = function (_) {
        if (!arguments.length) return _renderLabel;
        _renderLabel = _;
        return _chart;
    };

    _chart.title = function (_) {
        if (!arguments.length) return _title;
        _title = _;
        _renderTitle = true;
        return _chart;
    };

    _chart.renderTitle = function (_) {
        if (!arguments.length) return _renderTitle;
        _renderTitle = _;
        return _chart;
    };

    _chart.renderlet = function (_) {
        _renderlets.push(_);
        return _chart;
    };

    _chart.invokeRenderlet = function (chart) {
        for (var i = 0; i < _renderlets.length; ++i) {
            _renderlets[i](chart);
        }
    };

    _chart.chartGroup = function (_) {
        if (!arguments.length) return _chartGroup;
        _chartGroup = _;
        return _chart;
    };

    _chart.on = function (event, listener) {
        _listeners[event] = listener;
        return _chart;
    };

    _chart.expireCache = function(){
         // do nothing in base, should be overridden by sub-function
        return _chart;
    };

    return _chart;
};
