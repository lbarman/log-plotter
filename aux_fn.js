function quotes(s) {
    return '"' + s + '"';
}

function list2Gnu(arr) {
    return arr.join(",\t")
}

function printSmth(smth) {
    if (typeof smth == 'string' || smth instanceof String) {
        return smth;
    } else if ($.isArray(smth)) {
        var builder = ""
        _.each(smth, function(i) {
            builder += printSmth(i) + "\n";
        });
        return builder.substring(0, builder.length - 1);
    } else {
        return JSON.stringify(smth);
    }
}

function parseRaw(data) {
    var parsed = formatRaw(data);
    if (!IsJsonString(parsed)) {
        return "Unable to parse";
    } else {
        return JSON.parse(parsed);
    }
}

function IsJsonString(data) {
    try {
        JSON.parse(data);
    } catch (e) {
        console.log(e)
        return false;
    }
    return true;
}

function formatRaw(data) {
    arrayOfLines = data.match(/[^\r\n]+/g)
    var jsonInner = _.chain(arrayOfLines).map(function(s) {
        return s.trim()
    }).filter(function(s) {
        return s.lastIndexOf('{', 0) === 0
    }).map(function(s) {
        return s.replace("},", "}")
    }).value().join(",")
    var json = "[" + jsonInner + "]"
    return json;
}

function stats(arr) {
    var m = Math.round(mean(arr))
    var v = Math.round(variance(arr))
    return [m, v];
}

function sum(x) {
    var value = 0;
    for (var i = 0; i < x.length; i++) {
        value += parseInt("" + x[i]);
    }
    return value;
}

function mean(x) {
    if (x.length === 0) return null;
    return sum(x) / x.length;
}

function min(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        if (x[i] < value || value === undefined) value = x[i];
    }
    return value;
}

function max(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        if (x[i] > value || value === undefined) value = x[i];
    }
    return value;
}

function variance(x) {
    if (x.length === 0) return null;
    var mean_value = mean(x),
        deviations = [];
    for (var i = 0; i < x.length; i++) {
        deviations.push(Math.pow(x[i] - mean_value, 2));
    }
    var std = mean(deviations);
    var sterr = Math.sqrt(std)
    var z_value_95 = 1.96
    var margin_error = sterr * z_value_95
    return margin_error;
}