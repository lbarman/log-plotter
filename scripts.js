$(function() {


    var delay, delay2;
    var scriptToRun = "out = []"

    function debounceRunScript() {
        clearTimeout(delay);
        delay = setTimeout(function(){
            var script = editorGnu.getValue()
            runScript(script)
        }, 100);
    }

    function debounceRunGnuPlot() {
        clearTimeout(delay2);
        delay2 = setTimeout(function(){
            var script = editorGnu.getValue()
            scriptChange(script)
        }, 100);
    }


    //Prepare Editor

    CodeMirror.defineSimpleMode("gnuplot", {
  start: [
    {regex: /"(?:[^\\]|\\.)*?"/, token: "string"},
    {regex: /'(?:[^\\]|\\.)*?'/, token: "string"},
    {regex: /(function)(\s+)([a-z$][\w$]*)/,  token: ["keyword", null, "variable-2"]},
    {regex: /(?:set|plot|using|with)\b/, token: "keyword"},
    {regex: /(\$[0-9]+)/, token: "variable-2"},
    {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
    {regex: /#.*/, token: "comment"},
  ],

  meta: {
    dontIndentStates: ["comment"],
    lineComment: "#"
  }
});

    CodeMirror.commands.autocomplete = function(cm) {
        cm.showHint({
            hint: CodeMirror.hint.anyword
        });
    }
    var editorInputFn = CodeMirror.fromTextArea(document.getElementById("inputFn"), {
        lineNumbers: true,
        mode: 'javascript',
      scrollbarStyle: "simple",
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
    });
    editorInputFn.on("change", function() {
        debounceRunScript();
    });

    var editorInputRaw = CodeMirror.fromTextArea(document.getElementById("raw"), {
        lineNumbers: true,
        mode: 'javascript',
        scrollbarStyle: "simple"
    });
    editorInputRaw.on("change", function() {
        debounceRunScript();
    });

    var editorOut = CodeMirror.fromTextArea(document.getElementById("out"), {
        lineNumbers: true,
        mode: "gnuplot",
        scrollbarStyle: "simple"
    });
    editorOut.on("change", function() {
        files = {
            "data.txt": editorOut.getValue()
        }
        debounceRunGnuPlot();
    });

    var editorGnu = CodeMirror.fromTextArea(document.getElementById("gnuplotScript"), {
        lineNumbers: true,
        mode: "gnuplot"
    });
    editorGnu.on("change", function() {
        $("#gnuplotScriptRaw").val(editorGnu.getValue());
        debounceRunGnuPlot();
    });

    var documentWidth = $(document).width()
    editorInputFn.setSize(documentWidth/2, 200)
    editorInputRaw.setSize(documentWidth/2, 200)
    editorOut.setSize(documentWidth/2, 200)
    editorGnu.setSize(documentWidth/2, 400)


        $("#gnuplotScriptRaw").val(editorGnu.getValue());
    debounceRunScript();


 $("#preset").change(function () {
        var presetToLoad = this.value;
        var text = `set xlabel "File Size" offset 0,0.5
set ylabel "Latency [s]" offset 1.7,0
#set xrange [0:1]
#set yrange [0:1]

# Line style for axes
set style line 80 lt rgb "#808080"

# Line style for grid
set style line 81 lt 0  # dashed
set style line 81 lt rgb "#808080"  # grey
set grid back linestyle 81
set border 3 back linestyle 80 # Remove border on top and right.
               
# Also, put it in grey; no need for so much emphasis on a border.
set xtics nomirror
set ytics nomirror

set terminal svg enhanced size 1000,700
set output 'out.svg'
set rmargin 2.2
set tmargin 1
set lmargin 7.5
set bmargin 3

# Line styles: pleasing colors
set style line 1 lt rgb "#A00000" lw 3 pt 1
set style line 2 lt rgb "#00A000" lw 3 pt 6
set style line 3 lt rgb "#5060D0" lw 3 pt 2
set style line 4 lt rgb "#F25900" lw 3 pt 9
set style line 5 lt rgb "#4dbeee" lw 3 pt 4
set style line 6 lt rgb "#7e2f8e" lw 3 pt 1
set key top left

set bars small
`

		if(presetToLoad == "blocks")
		{
			text += "plot 'data.txt' using 1:3:xtic(2) title '' with boxes ls 1"
		}
		else if(presetToLoad == "lines")
		{
			text += "plot 'data.txt' using 1:3:xtic(2) title '' with lp ls 1"
		}
		else if(presetToLoad == "tplat")
		{
			text += "plot 'data.txt' using 1:3 title '' w p ls 1"
		}
		else if(presetToLoad == "tplaterr")
		{
			text += "plot 'data.txt' using 1:3:4 title '' with yerrorbars ls 1"
		}

        editorGnu.setValue(text)
        debounceRunScript();
    });

    //Helper functions

    if (typeof String.prototype.startsWith != 'function') {
        // see below for better implementation!
        String.prototype.startsWith = function(str) {
            return this.indexOf(str) === 0;
        };
    }

    function runScript() {

        editorOut.setValue("[running...]")
        var data = editorInputRaw.getValue()
        var json = parseRaw(data);
        var json2 = _.chain(json);

        var cmd = editorInputFn.getValue();

        eval("" + cmd);

        var out2 = printSmth(out)
        editorOut.setValue(out2);
        files = {
            "data.txt": out
        }

        debounceRunGnuPlot();
    }
})