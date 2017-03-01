localStorage.removeItem('gnuplot.script');
         localStorage.removeItem('gnuplot.files');
         

         localStorage["gnuplot.files"] = JSON.stringify({"data.txt":"0, \"1M\",\t4504.8,\t4395.136011992998,\t4614.463988007003\r\n1, \"2M\",\t1581.2,\t1507.0892923687811,\t1655.310707631219\r\n2, \"8M\",\t5187.9,\t5119.862615111984,\t5255.937384888015\r\n3, \"16M\",\t2682.7,\t2629.54456150496,\t2735.85543849504\r\n4, \"32M\",\t6843.5,\t6718.242274617492,\t6968.757725382508\r\n5, \"64M\",\t9115.6,\t9027.252817914774,\t9203.947182085227"})

         gnuplot = new Gnuplot('gnuplot.js');
         gnuplot.onOutput = function(text) {
             document.getElementById('gnuLog').value += text + '\n';
             document.getElementById('gnuLog').scrollTop = 99999;
         };
         gnuplot.onError = function(text) {
             document.getElementById('gnuLog').value += 'ERR: ' + text + '\n';
             document.getElementById('gnuLog').scrollTop = 99999;
         };
         var lastTAContent = '';
         function scriptChange() {
             var val = document.getElementById('gnuplotScriptRaw').value
             localStorage["gnuplot.script"] = val;
             if (gnuplot.isRunning) {
                 setTimeout(scriptChange, 1000);
             } else {
                 lastTAContent = val;
                 runScript();
             }
         }
         ;
         files = {};
         if (localStorage["gnuplot.files"])
             files = JSON.parse(localStorage["gnuplot.files"]);

         for (var key in files)
             gnuplot.onOutput("Found locally stored file: " + key + " with " + files[key].length + " bytes.");

         var runScript = function() {

            console.log("files")
            console.log(files)

             var editor = document.getElementById('gnuplotScriptRaw');   // textarea
             var start = Date.now();
             // "upload" files to worker thread


             for (var f in files)
             {
                 gnuplot.putFile(f, files[f]);
             }
         
             gnuplot.run(editor.value, function(e) {
                 gnuplot.onOutput('Execution took ' + (Date.now() - start) / 1000 + 's.');
                 gnuplot.getFile('out.svg', function(e) {
                     if (!e.content) {
                         gnuplot.onError("Output file out.svg not found!");
                         return;
                     }
                     var img = document.getElementById('gnuimg');
                     try {
                         var ab = new Uint8Array(e.content);
                         var blob = new Blob([ab], {"type": "image\/svg+xml"});
                         window.URL = window.URL || window.webkitURL;
                         img.src = window.URL.createObjectURL(blob);
                     } catch (err) { // in case blob / URL missing, fallback to data-uri
                         if (!window.blobalert) {
                             alert('Warning - your browser does not support Blob-URLs, using data-uri with a lot more memory and time required. Err: ' + err);
                             window.blobalert = true;
                         }
                         var rstr = '';
                         for (var i = 0; i < e.content.length; i++)
                             rstr += String.fromCharCode(e.content[i]);
                         img.src = 'data:image\/svg+xml;base64,' + btoa(rstr);
                     }
                 });
             });
         };
         
         function handleFileSelect(evt) {
             var _files = evt.target.files; // FileList object
         
             // files is a FileList of File objects. List some properties.
             var output = [];
             for (var i = 0, f; f = _files[i]; i++) {
                 output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                         f.size, ' bytes, last modified: ',
                         f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                         '</li>');
                 (function() {
                     var reader = new FileReader();
                     var fname = f.name;
                     reader.onloadend = function(e) {
                         if (e.target.result) {
                             gnuplot.onOutput(fname + ": Read success - storing in browser. " + e.target.result.length);
                             files[fname] = e.target.result;
                             localStorage["gnuplot.files"] = JSON.stringify(files);
                         }
         
                     };
                     reader.readAsText(f);
                 })();
             }
             document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
         }