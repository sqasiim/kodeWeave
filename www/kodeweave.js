function saveFile(fileName, fileData) {
  // Get access to the file system
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
    // Create the file.
    fileSystem.root.getFile(fileName, { create: true, exclusive: false }, function (entry) {
      // After you save the file, you can access it with this URL
      myFileUrl = entry.toURL();
      entry.createWriter(function(writer) {
        writer.onwriteend = function(evt) {
          alert("Successfully saved file to " + myFileUrl);
        };
        // Write to the file
        writer.write(fileData);
      }, function(error) {
        alert("Error: Could not create file writer, " + error.code);
      });
    }, function(error) {
      alert("Error: Could not create file, " + error.code);
    });
  }, function(evt) {
    alert("Error: Could not access file system, " + evt.target.error.code);
  });
}

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  // Device is ready
}

var timeout,
    delay,
    server,
    selected_text,
    str,
    mynum,
    start_cursor,
    cursorLine,
    cursorCh,
    jsContent,
    cssSelected,
    htmlContent,
    hasMD,
    hasHTML,
    hasCSS,
    hasJS,
    editEmbed,
    darkUI,
    seeThrough,
    hasResult,
    checkStatus = function() {
      if (navigator.onLine) {
        // user is online
        if ($(".checkStatus").hasClass("hide")) {
          $(".checkStatus").removeClass("hide");
        }
        document.getElementById("charmenu").style.left = "";
      } else {
        // user is offline
        $(".checkStatus").addClass("hide");
        document.getElementById("charmenu").style.left = "153px";
      }
    },
    loadgist = function(gistid) {
      $.ajax({
        url: "https://api.github.com/gists/" + gistid,
        type: "GET",
        dataType: "jsonp",
        jsonp: "callback"
      }).success(function(gistdata) {
        var htmlVal        = gistdata.data.files["index.html"];
        var jadeVal        = gistdata.data.files["index.jade"];
        var cssVal         = gistdata.data.files["index.css"];
        var stylusVal      = gistdata.data.files["index.styl"];
        var jsVal          = gistdata.data.files["index.js"];
        var coffeeVal      = gistdata.data.files["index.coffee"];
        var mdVal      = gistdata.data.files["README.md"];
        var settings   = gistdata.data.files["settings.json"].content;
        var libraries  = gistdata.data.files["libraries.json"].content;
        var jsonSets   = JSON.parse(settings);
        var jsonLibs   = JSON.parse(libraries);

        // Return font settings from json
        var siteTitle        = jsonSets.siteTitle;
        var WeaveVersion     = jsonSets.version;
        var editorFontSize   = jsonSets.editorFontSize;
        var WeaveDesc        = jsonSets.description;
        var WeaveAuthor      = jsonSets.author;

        $("[data-action=sitetitle]").val(siteTitle);
        $("[data-value=version]").val(WeaveVersion);
        $("[data-editor=fontSize]").val(editorFontSize);
        $("[data-action=sitedesc]").val(WeaveDesc);
        $("[data-action=siteauthor]").val(WeaveAuthor);
        storeValues();

        // Return settings from the json
        $(".metaboxes input.heading").trigger("keyup");

        // Return libraries from json
        $.each(jsonLibs, function(name, value) {
          $(".ldd-submenu #" + name).prop("checked", value).trigger("keyup");
        });

        // Set checked libraries into preview
        $("#jquery").trigger("keyup");

        // Return the editor's values
        if (mdVal) {
          mdEditor.setValue(mdVal.content);
        }
        if (!mdVal) {
          mdEditor.setValue("");
        }
        if (htmlVal) {
          htmlEditor.setValue(htmlVal.content);
          $("#html-preprocessor").val("none").change();
        }
        if (jadeVal) {
          htmlEditor.setValue(jadeVal.content);
          $("#html-preprocessor").val("jade").change();
        }
        if (!htmlVal && !jadeVal) {
          htmlEditor.setValue("");
        }
        if (cssVal) {
          cssEditor.setValue(cssVal.content);
          $("#css-preprocessor").val("none").change();
        }
        if (stylusVal) {
          cssEditor.setValue(stylusVal.content);
          $("#css-preprocessor").val("stylus").change();
        }
        if (!cssVal && !stylusVal) {
          cssEditor.setValue("");
        }
        if (jsVal) {
          jsEditor.setValue(jsVal.content);
          $("#js-preprocessor").val("none").change();
        }
        if (coffeeVal) {
          jsEditor.setValue(coffeeVal.content);
          $("#js-preprocessor").val("coffeescript").change();
        }
        if (!jsVal && !coffeeVal) {
          jsEditor.setValue("");
        }

        setTimeout(function() {
          mdEditor.setOption("paletteHints", "true");
          htmlEditor.setOption("paletteHints", "true");
          cssEditor.setOption("paletteHints", "true");
          jsEditor.setOption("paletteHints", "true");
        }, 300);
        
        $(".preloader").remove();
      }).error(function(e) {
        // ajax error
        console.warn("Error: Could not load weave!", e);
        alertify.error("Error: Could not load weave!");
      });
    },
    renderYourHTML = function() {
      var htmlSelected  = $("#html-preprocessor option:selected").val();

      if ( htmlSelected == "none") {
        yourHTML = htmlEditor.getValue();
      } else if ( htmlSelected == "jade") {
        var options = {
            pretty: true
        };
        yourHTML = jade.render(htmlEditor.getValue(), options);
      }
    },
    renderYourCSS = function() {
      cssSelected = $("#css-preprocessor option:selected").val();

      if ( cssSelected == "none") {
        yourCSS = cssEditor.getValue();
      } else if ( cssSelected == "stylus") {
        stylus(cssEditor.getValue()).render(function(err, out) {
          if(err !== null) {
            console.error("something went wrong");
          } else {
            yourCSS = out;
          }
        });
      }
    },
    renderYourJS = function() {
      var jsSelected = $("#js-preprocessor option:selected").val();
      
      if ( jsSelected == "none") {
        yourJS = jsEditor.getValue();
      } else if ( jsSelected == "coffeescript") {
        yourJS = CoffeeScript.compile(jsEditor.getValue(), { bare: true });
      }
    },
    JSValEnabled = function() {
      // jsEditor.setOption("lint", true)
      jsEditor.setOption("gutters", ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
    },
    JSValDisabled = function() {
      // jsEditor.setOption("lint", false)
      jsEditor.setOption("gutters", ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
    },
    validators = function() {
      var JSValStatus = localStorage.getItem("JSValStatus");
      if (JSValStatus === "true") {
        $("#myjsvalidationswitch").prop("checked", true);
        JSValEnabled();
      } else {
        $("#myjsvalidationswitch").prop("checked", "");
        JSValDisabled();
      }

      document.getElementById("myjsvalidationswitch").onclick = function() {
        localStorage.setItem("JSValStatus", $(this).prop("checked"));
        if ( this.checked === true ) {
          localStorage.setItem("SaveJSValSwitch", '"checked", "true"');
          JSValEnabled();
        } else {
          localStorage.setItem("SaveJSValSwitch", '"checked", ""');
          JSValDisabled();
        }
      };
    },
    singleFileDownload = function() {
      document.querySelector(".savehtml").onclick = function() {
        var htmlSelected = $("#html-preprocessor option:selected").val();

        if ( htmlSelected == "none") {
          yourHTML = htmlEditor.getValue();
          saveFile("source.html", yourHTML);
        } else if ( htmlSelected == "jade") {
          saveFile("source.jade", yourHTML);
        }
      };
      document.querySelector(".savecss").onclick = function() {
        cssSelected = $("#css-preprocessor option:selected").val();

        if ( cssSelected == "none") {
          saveFile("source.css", cssEditor.getValue());
        } else if ( cssSelected == "stylus") {
          saveFile("source.styl", cssEditor.getValue());
        }
      };
      document.querySelector(".savejs").onclick = function() {
        var jsSelected = $("#js-preprocessor option:selected").val();

        if ( jsSelected == "none") {
          saveFile("source.js", jsEditor.getValue());
        } else if ( jsSelected == "coffeescript") {
          saveFile("source.coffee", jsEditor.getValue());
        }
      };
      document.querySelector(".savemd").onclick = function() {
        var blob = new Blob([ mdEditor.getValue() ], {type: "text/x-markdown"});
        saveAs(blob, "source.md");
      };
    },
    applyLowercase = function() {
      if ( activeEditor.value === "htmlEditor" ) {
        selected_text = htmlEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        htmlEditor.replaceSelection(selected_text);
        htmlEditor.focus();
      } else if ( activeEditor.value === "cssEditor" ) {
        selected_text = cssEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        cssEditor.replaceSelection(selected_text);
        cssEditor.focus();
      } else if ( activeEditor.value === "jsEditor" ) {
        selected_text = jsEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        jsEditor.replaceSelection(selected_text);
        jsEditor.focus();
      } else if ( activeEditor.value === "mdEditor" ) {
        selected_text = mdEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        mdEditor.replaceSelection(selected_text);
        mdEditor.focus();
      }
    },
    applyUppercase = function() {
      if ( activeEditor.value === "htmlEditor" ) {
        selected_text = htmlEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        htmlEditor.replaceSelection(selected_text);
        htmlEditor.focus();
      } else if ( activeEditor.value === "cssEditor" ) {
        selected_text = cssEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        cssEditor.replaceSelection(selected_text);
        cssEditor.focus();
      } else if ( activeEditor.value === "jsEditor" ) {
        selected_text = jsEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        jsEditor.replaceSelection(selected_text);
        jsEditor.focus();
      } else if ( activeEditor.value === "mdEditor" ) {
        selected_text = mdEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        mdEditor.replaceSelection(selected_text);
        mdEditor.focus();
      }
    },
    applyMinify = function() {
      if ( activeEditor.value === "htmlEditor" ) {
        htmlEditor.setValue(htmlEditor.getValue().replace(/\<\!--\s*?[^\s?\[][\s\S]*?--\>/g,'').replace(/\>\s*\</g,'><'));
        $("input[name=menubar].active").trigger("click");
      } else if ( activeEditor.value === "cssEditor" ) {
        cssEditor.setValue( cssEditor.getValue().replace(/\/\*.*\*\/|\/\*[\s\S]*?\*\/|\n|\t|\v|\s{2,}/g,"").replace(/\s*\{\s*/g,"{").replace(/\s*\}\s*/g,"}").replace(/\s*\:\s*/g,":").replace(/\s*\;\s*/g,";").replace(/\s*\,\s*/g,",").replace(/\s*\~\s*/g,"~").replace(/\s*\>\s*/g,">").replace(/\s*\+\s*/g,"+").replace(/\s*\!\s*/g,"!") );
      } else if ( activeEditor.value === "jsEditor" ) {
        jsEditor.setValue( jsEditor.getValue().replace(/\/\*[\s\S]*?\*\/|\/\/.*\n|\s{2,}|\n|\t|\v|\s(?=function\(.*?\))|\s(?=\=)|\s(?=\{)/g,"").replace(/\s?function\s?\(/g,"function(").replace(/\s?\{\s?/g,"{").replace(/\s?\}\s?/g,"}").replace(/\,\s?/g,",").replace(/if\s?/g,"if") );
      }
    },
    applyBeautify = function() {
      if ( activeEditor.value === "htmlEditor" ) {
        beautifyHTML();
      } else if ( activeEditor.value === "cssEditor" ) {
        beautifyCSS();
      } else if ( activeEditor.value === "jsEditor" ) {
        beautifyJS();
      }
    },
    OtherKeyResults = function() {
      $("[data-action=lowercase]").attr("title", "CTRL+'");
      $("[data-action=uppercase]").attr("title", "CTRL+\\");
      $("[data-action=gotoline]").attr("title", "Ctrl+L");
      $("[data-action=search]").attr("title", "CTRL+F");
      $("[data-action=replace]").attr("title", "Shift-Ctrl-F");
      $("[data-action=replaceall]").attr("title", "Shift-Ctrl-R");
      $("[data-action=minify]").attr("title", "Shift+Ctrl+'");
      $("[data-action=tidy]").attr("title", "Shift+Ctrl+\\");
      $("[data-action=toggle_comment]").attr("title", "Ctrl+/");
    },
    shortcutKeys = function() {
      // Load File
      shortcut.add("Ctrl+O", function() {
        $("[data-action=open-file]").trigger("click");
      });
      // New Document
      shortcut.add("Ctrl+N", function() {
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=sitetitle]").val("site title").trigger("change");
        $("[data-action=sitedesc]").val("sample description").trigger("change");
        $("[data-action=siteauthor]").val("kodeWeave").trigger("change");
        htmlEditor.setValue("<!-- comment -->\nhello world!");
        cssEditor.setValue("");
        jsEditor.setValue("");
      });
      // Export layout hotkey
      shortcut.add("Ctrl+S", function() {
        $("[data-action=download-zip]").trigger("click");
      });
      // Reload Application
      shortcut.add("F5", function() {
        location.reload(true);
      });
      shortcut.add("Ctrl+R", function() {
        location.reload(true);
      });
      document.getElementById("restartapp").onclick = function() {
        location.reload(true);
      };
      // window.addEventListener("keydown", function(e) {
      // // New Document (CMD+N)
      //   if ( e.metaKey && e.keyCode == 78 ) {
      //     $(".check").attr("checked", false).trigger("change");
      //     htmlEditor.setValue("<!-- comment -->\nhello world!");
      //     cssEditor.setValue("");
      //     jsEditor.setValue("");
      //     mdEditor.setValue("");
      //   }
      // // Export as Zip (CMD+S)
      //   if ( e.metaKey && e.keyCode == 83 ) {
      //     $("[data-action=download-zip]").trigger("click");
      //   }
      // });

      if ( navigator.platform.indexOf('Mac') > -1 ) {
        $("[data-action=lowercase]").attr("title", "Cmd+'");
        $("[data-action=uppercase]").attr("title", "Cmd+\\");
        $("[data-action=gotoline]").attr("title", "Cmd+L");
        $("[data-action=search]").attr("title", "CMD+F");
        $("[data-action=replace]").attr("title", "Cmd+Option+F");
        $("[data-action=replaceall]").attr("title", "Shift+Cmd+Option+F");
        $("[data-action=minify]").attr("title", "Shift+Cmd+'");
        $("[data-action=tidy]").attr("title", "Shift+Cmd+\\");
        $("[data-action=toggle_comment]").attr("title", "Cmd+/");
      } else {
        OtherKeyResults();
      }
    },
    initGenerators = function() {
      // Tidy Up/Beautify Code
      document.querySelector("[data-action=tidy]").onclick = function() {
        // if ( activeEditor.value === "htmlEditor" ) {
        //   var htmlLines = htmlEditor.lineCount();
        //   htmlEditor.autoFormatRange({line:0, ch:0}, {line:htmlLines});
        // } else if ( activeEditor.value === "cssEditor" ) {
        //   var cssLines = cssEditor.lineCount();
        //   cssEditor.autoFormatRange({line:0, ch:0}, {line:cssLines});
        // } else if ( activeEditor.value === "jsEditor" ) {
        //   var jsLines = jsEditor.lineCount();
        //   jsEditor.autoFormatRange({line:0, ch:0}, {line:jsLines});
        // }

        applyBeautify();

        $("input[name=menubar].active").trigger("click");
      };

      // Minify Code
      document.querySelector("[data-action=minify]").onclick = function() {
        applyMinify();
        $("input[name=menubar].active").trigger("click");
      };

      // Go To Line
      document.querySelector("[data-action=gotoline]").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("gotoLine");
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("gotoLine");
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("gotoLine");
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.execCommand("gotoLine");
        }

        $("input[name=menubar].active").trigger("click");
      };

      // Comment Current Selection
      document.querySelector("[data-action=toggle_comment]").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("emmet.toggle_comment");
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("emmet.toggle_comment");
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("emmet.toggle_comment");
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.execCommand("emmet.toggle_comment");
        }

        $("input[name=menubar].active").trigger("click");
      };

      // Make text selection lowercase
      document.querySelector("[data-action=lowercase]").onclick = function() {
        applyLowercase();
        $("input[name=menubar].active").trigger("click");
      };

      // Make text selection uppercase
      document.querySelector("[data-action=uppercase]").onclick = function() {
        applyUppercase();
        $("input[name=menubar].active").trigger("click");
      };

      document.querySelector("[data-action=search]").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("find");
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("find");
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("find");
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.execCommand("find");
        }
        $("input[name=menubar].active").trigger("click");
      };
      document.querySelector("[data-action=replace]").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("replace");
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("replace");
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("replace");
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.execCommand("replace");
        }
        $("input[name=menubar].active").trigger("click");
      };
      document.querySelector("[data-action=replaceall]").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("replaceAll");
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("replaceAll");
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("replaceAll");
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.execCommand("replaceAll");
        }
        $("input[name=menubar].active").trigger("click");
      };
    },
    newDocument = function() {
      document.querySelector("[data-action=newdocument]").onclick = function() {
        // localStorage.clear();
        localStorage.removeItem("htmlPreprocessorVal");
        localStorage.removeItem("cssPreprocessorVal");
        localStorage.removeItem("jsPreprocessorVal");
        localStorage.removeItem("htmlData");
        localStorage.removeItem("cssData");
        localStorage.removeItem("jsData");
        localStorage.removeItem("mdData");
        localStorage.removeItem("checkedInputs");
        localStorage.removeItem("checkedLibraries");
        localStorage.removeItem("JSValStatus");
        localStorage.removeItem("SaveJSValSwitch");
        localStorage.removeItem("siteTitle");
        localStorage.removeItem("appVersion");
        // localStorage.removeItem("fontSize");
        localStorage.removeItem("saveDesc");
        // localStorage.removeItem("saveAuthor");
        // localStorage.removeItem("gridSetting");
        location.reload(true);
        
        /*
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("site title").trigger("change");
        $("[data-action=sitedesc]").val("sample description").trigger("change");
        $("[data-action=siteauthor]").val("kodeWeave").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        mdEditor.setValue("");
        htmlEditor.setValue("");
        cssEditor.setValue("");
        jsEditor.setValue("");
        if ($("input[name=menubar].active").is(":visible")) {
          $(".hide-demos").trigger("click");
        }
        
        */
      };
    },
    appDemos = function() {
      var clearPreview = function() {
        var previewFrame = document.getElementById("preview");
        var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
        preview.open();
        preview.write("");
        preview.close();
      };
      $(".adddemos-tablets a").click(function() {
        $("#jquery").trigger("keyup");
      });
      document.querySelector("[data-action=alphabetizer]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Alphabetizer").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<div class=\"grid\">\n  <div class=\"grid__col--12\">\n    <button class=\"btn--default\" data-action=\"alphabetize\">Alphabetize</button>\n    <textarea class=\"form__input\" data-action=\"input-list\" rows=\"7\" placeholder=\"Alphabetize your text here...\">China\nIndia\nUnited States of America\nIndonesia\nBrazil\nPakistan\nNigeria\nBangladesh\nRussia\nJapan\nMexico\nPhilippines\nEthiopia\nVietnam\nEgypt\nGermany\nIran\nTurkey\nDemocratic Republic of the Congo\nFrance</textarea>\n  </div>\n</div>");
        cssEditor.setValue("");
        jsEditor.setValue("var txt = document.querySelector(\"[data-action=input-list]\")\n\ndocument.querySelector(\"[data-action=alphabetize]\").addEventListener(\"click\", function() {\n  txt.value = (txt.value.split(\"\\n\").sort(caseInsensitive).join(\"\\n\"))\n\n  function caseInsensitive(a, b) {\n    return a.toLowerCase().localeCompare(b.toLowerCase())\n  }\n})\n");
        $(".hide-demos, #polyui").trigger("click");
        
      };
      document.querySelector("[data-action=angular]").onclick = function() {
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Angular JS Demo").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        $("#css-preprocessor").val("none").trigger("change");
        htmlEditor.setValue("<div class=\"page-wrap\" ng-app>\n  <h1 class=\"headline\">Simple content toggle with AngularJS</h1>\n  <p>\n    Choose what to display:\n    <select class=\"content-select\" ng-model=\"selection\">\n      <option value=\"content1\">Content #1</option>\n      <option value=\"content2\">Content #2</option>\n    </select>\n  </p>\n\n  <div class=\"container\">\n    <article ng-show=\"selection == 'content1'\">\n      <h2 class=\"h2\">Content #1</h2>\n      <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est.</p>\n    </article>\n    <article ng-show=\"selection == 'content2'\">\n      <h2 class=\"h2\">Content #2</h2>\n      <p>Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>\n    </article>\n  </div>\n</div>");
        cssEditor.setValue("body {\n  padding: 3em 2em;\n  font-size: 1em;\n  line-height: 1;\n}\n\n/* Pen specific CSS */\n.page-wrap {\n  margin: 0 auto;\n  max-width: 700px;\n}\n\n.headline {\n  margin: 0 0 .7em 0;\n  font-size: 1.7em;\n  font-weight: bold;\n}\n\n.content-select {\n  margin: 0 0 0 1em;\n}\n\narticle {\n  margin: 3em 0 0 0;\n}\narticle p {\n  margin: 0 0 .5em 0;\n  line-height: 1.3;\n}\narticle .h2 {\n  margin: 0 0 .5em 0;\n  font-size: 1.2em;\n}");
        jsEditor.setValue("");
        $(".hide-demos, #normalize, #angular").trigger("click");
        
      };
      document.querySelector("[data-action=applicator]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Code Applicator").trigger("change");
        if (document.getElementById("html-preprocessor").value == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").trigger("change");
        }
        htmlEditor.setValue("textarea#addcode(placeholder='Encode here...')\ntextarea#encode(readonly='', placeholder='Encoded code goes here...')\n  | #decode Preview code here.");
        cssEditor.setValue("body\n  margin 0\n\n::-webkit-input-placeholder\n  color #555\n\n:-moz-placeholder\n  color #555\n\n::-moz-placeholder\n  color #555\n\n:-ms-input-placeholder\n  color #555\n\n#addcode, #encode, #decode\n  position absolute\n  font-family monospace\n  line-height 1.4em\n  font-size 1em\n  overflow auto\n  resize none\n  margin 0\n  padding 0\n  border 0\n\n#encode, #decode\n  left 0\n  width 50%\n  height 50%\n  background-color #fff\n\n#addcode\n  top 0\n  right 0\n  bottom 0\n  margin 0\n  width 50%\n  height 100%\n  min-height 1.4em\n  border 0\n  border-radius 0\n  resize none\n  color #ccc\n  background-color #111\n\n#encode\n  top 0\n\n#decode\n  bottom 0");
        jsEditor.setValue("document.querySelector('#addcode').onkeyup = ->\n  document.querySelector('#encode').textContent = @value\n  document.querySelector('#encode').textContent = document.querySelector('#encode').innerHTML\n  if @value == ''\n    document.querySelector('#decode').innerHTML = 'Preview code here.'\n  else\n    document.querySelector('#decode').innerHTML = @value\n  false\n\ndocument.querySelector('#encode').onclick = ->\n  @select()\n  false");
        $(".hide-demos").trigger("click");
        
      };
      document.querySelector("[data-action=charactermap]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Character Map").trigger("change");
        if (document.getElementById("html-preprocessor").value == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        $("#html-preprocessor").val("jade").trigger("change");
        $("#js-preprocessor").val("none").trigger("change");
        htmlEditor.setValue("iframe(src='http://dev.w3.org/html5/html-author/charref')");
        cssEditor.setValue("html, body\n  height 100%\n\niframe\n  width 100%\n  height 100%\n  border 0");
        jsEditor.setValue("");
        $(".hide-demos").trigger("click");
        
      };
      document.querySelector("[data-action=codeeditor]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Code Editor").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<textarea id=\"code\"><!doctype html>\n<html>\n  <head>\n    <meta charset=utf-8>\n    <title>HTML5 canvas demo</title>\n    <style>\n      p {\n        font: 12px Verdana, sans-serif;\n        color: #935033;\n      }\n    </style>\n  </head>\n  <body>\n    <p>Canvas pane goes here:</p>\n    <canvas id=\"pane\" width=\"300\" height=\"200\"></canvas>\n\n    <script>\n      var canvas = document.getElementById(\"pane\")\n      var context = canvas.getContext(\"2d\")\n\n      context.fillStyle = \"rgb(250,0,0)\"\n      context.fillRect(10, 10, 55, 50)\n\n      context.fillStyle = \"rgba(0, 0, 250, 0.5)\"\n      context.fillRect(30, 30, 55, 50)\n    </script>\n  </body>\n</html></textarea>\n\n<iframe id=\"preview\"></iframe>");
        cssEditor.setValue(".CodeMirror {\n  float: left;\n  width: 50%;\n  border: 1px solid #000;\n}\n\niframe {\n  width: 49%;\n  float: left;\n  height: 300px;\n  border: 1px solid #000;\n  border-left: 0;\n}");
        jsEditor.setValue("var delay\n\n// Initialize CodeMirror editor\nvar editor = CodeMirror.fromTextArea(document.getElementById(\"code\"), {\n  mode: \"text/html\",\n  tabMode: \"indent\",\n  styleActiveLine: true,\n  lineNumbers: true,\n  lineWrapping: true,\n  autoCloseTags: true,\n  foldGutter: true,\n  dragDrop: true,\n  lint: true,\n  gutters: [\"CodeMirror-lint-markers\", \"CodeMirror-linenumbers\", \"CodeMirror-foldgutter\"]\n})\nInlet(editor)\nemmetCodeMirror(editor)\n\n// Live preview\neditor.on(\"change\", function() {\n  clearTimeout(delay)\n  delay = setTimeout(updatePreview, 300)\n})\n\nfunction updatePreview() {\n  var previewFrame = document.getElementById(\"preview\")\n  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document\n  preview.open()\n  preview.write(editor.getValue())\n  preview.close()\n}\nsetTimeout(updatePreview, 300)\n");
        $(".hide-demos, #codemirror").trigger("click");
        
      };
      document.querySelector("[data-action=convertforvalues]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Convert for Values").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<textarea class=\"editor\" placeholder=\"Code with multiple lines here...\"></textarea>\n<textarea class=\"preview\" placeholder=\"Generated result here...\"></textarea>");
        cssEditor.setValue("body {\n  margin: 0;\n  background: #333;\n}\n\n.editor, .preview {\n  position: absolute;\n  width: 50%;\n  height: 100%;\n  padding: 0;\n  font-family: monospace;\n  min-height: 1.4em;\n  line-height: 1.4em;\n  font-size: 1em;\n  border: 0;\n  border-radius: 0;\n  resize: none;\n}\n\n.editor {\n  left: 0;\n  color: #0b0;\n  background-color: #000;\n}\n\n::-webkit-input-placeholder { /* WebKit browsers */\n  color: #0f6;\n}\n:-moz-placeholder { /* Mozilla Firefox 4 to 18 */\n  color: #0f6;\n}\n::-moz-placeholder { /* Mozilla Firefox 19+ */\n  color: #0f6;\n}\n:-ms-input-placeholder { /* Internet Explorer 10+ */\n  color: #0f6;\n}\n\n.preview {\n  right: 0;\n  background-color: #fff;\n}\n");
        jsEditor.setValue("$(document).ready(function() {\n  var editor = $(\".editor\"),\n      preview = $(\".preview\");\n  \n  // Remove new line and insert new line showing the text in value\n  editor.keyup(function() {\n    preview.val( this.value.replace(/\"/g,'\\\\\"').replace(/\\n/g,\"\\\\n\") )\n  }).click(function() {\n    this.select()\n  })\n  \n  // Easily Select Converted Code\n  preview.click(function() {\n    this.select()\n  })\n})\n");
        $(".hide-demos, #normalize, #jquery").trigger("click");
        
      };
      document.querySelector("[data-action=dateclock]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Date and Time").trigger("change");
        if (document.getElementById("html-preprocessor").value == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("span.date(data-action='leftdate')\nspan.date.fr(data-action='rightdate')\n.clock(data-action='clock')");
        cssEditor.setValue(".date\n  font-family arial\n\n.fr\n  float right\n\n.clock\n  font bold 1.5em sans\n  text-align center");
        jsEditor.setValue("// Define a function to display the current time\nfunction displayTime() {\n  var now = new Date();\n  document.querySelector('[data-action=clock]').innerHTML =  now.toLocaleTimeString();\n  setTimeout(displayTime, 1000);\n}\ndisplayTime();\n\n// Date\nvar currentTime = new Date();\nvar month = currentTime.getMonth() + 1;\nvar date = currentTime.getDate();\nvar year = currentTime.getFullYear();\ndocument.querySelector('[data-action=leftdate]').innerHTML = month + '/' + date + '/' + year;\n\nvar today = new Date();\nif (year < 1000)\n  year += 1900;\nvar day = today.getDay();\nvar monthname = today.getMonth();\nif (date < 10)\n  date = '0' + date;\nvar dayarray = new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');\nvar montharray = new Array('January','February','March','April','May','June','July','August','September','October','November','December');\ndocument.querySelector('[data-action=rightdate]').innerHTML = dayarray[day] + ', ' + montharray[monthname] + ' ' + date + ', ' + year;\n");
        $(".hide-demos").trigger("click");
        
      };
      document.querySelector("[data-action=detectorientation]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Detect Orientation").trigger("change");
        if (document.getElementById("html-preprocessor").value == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("h1.portrait Portrait\nh1.landscape Landscape\nfooter.foot");
        cssEditor.setValue("body\n  font 26px arial\n\n.portrait,\n.landscape,\n.foot\n  text-align center\n\n.foot\n  position absolute\n  bottom 0\n  left 0\n  right 0\n  padding 26px");
        jsEditor.setValue("var detectOrientation = function() {\n  if ( window.innerWidth > window.innerHeight ) {\n    document.querySelector(\".landscape\").style.display = \"block\"\n    document.querySelector(\".portrait\").style.display = \"none\"\n  } else if ( window.innerWidth < window.innerHeight ) {\n    document.querySelector(\".landscape\").style.display = \"none\"\n    document.querySelector(\".portrait\").style.display = \"block\"\n  }\n  document.querySelector(\".foot\").innerHTML =  window.innerWidth + \"px, \" + window.innerHeight + \"px\"\n}\n\nwindow.addEventListener(\"resize\", function() {\n  detectOrientation()\n})\n\ndetectOrientation()\n");
        $(".hide-demos").trigger("click");
        
      };
      document.querySelector("[data-action=osdisplay]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Detect Operating System").trigger("change");
        if (document.getElementById("html-preprocessor").value == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").trigger("change");
        }
        htmlEditor.setValue("div(data-output='os')");
        cssEditor.setValue("");
        jsEditor.setValue("yourOS = document.querySelector('[data-output=os]')\n\ndocument.addEventListener 'DOMContentLoaded', ->\n  yourOS.innerHTML = '<strong>Operating System</strong>: ' + navigator.platform");
        $(".hide-demos").trigger("click");
        
      };
      document.querySelector("[data-action=markdowneditor]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Live Markdown Editor").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").trigger("change");
        }
        htmlEditor.setValue("<div class=\"editor-and-preview-container\">\n  <div class=\"editor-container\">Markdown Editor</div>\n  <div class=\"preview-container\">Preview</div>\n</div>\n<div class=\"editor-and-preview-container\">\n  <div class=\"editor-container\">\n    <textarea id=\"editor\">Welcome!\n===================\n\n![Placer text](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABOdSURBVHic7Z15lFTVtYe/36nqAZp5kBkbBREwPhNnQYWoKPLENoIoiOIYoyvGaMAsY5JCiRrHRNEoRmOMcQIRjVFARJOAUVGXkZCYFwdiDA5hULCB7q6++/3RdNNzDXeo6tZvLRZ969579q5zfrXPufdMop1hIPYaMwTHSIgN8RylIjYY0Ru5nqCeSMWgQqQS5EAqB1Ui7UBuI9hG5D4x6d/OaR3E3sW8v7P6sfcEluvvGCTKtQN+sb0OHYBnoz250UIHIu2D1BkJEEjsLOR6xynO1R03ObcVaY3JrXZoFc5bpVUPr8/l9/dLmxOAlY4thvKxnpggp+NAe9UVZLOFGKgAmp6T/mHoGedYQqduL+iZ2ypylzuZ0yYEYKNGFbI1Pt5T7BRJJyJ1abYgcyOA+uc/M7knnLlH2RZbptfmV+Uqz9IlrwVgA/cb5mHnyDETqU/KQs69AOqf+9jQI85pvp6/e21ucjA1eSkA6z9qjDldjjQRpF2Z36YEUO+YVZL7KSvuekp51ojMGwEYiH4jyszpR6D9ms3cNiuAun+vS7GrWH77k/kihLwQgPXda4JJVyPt36Qg25cAAAfSq0JXavm8pdHndkNyKgDrP3y4ed5NoIktFnL7FEDtv+VC39WyW/8afe7XkBMBWP/+HUkWX43cxSbFWy3k9iwAhElVyN3iuiihBbdsj7osXNQGrc8eR1NVtAZ0KRCP2n4eUgA229tqb1ZN+N7XozYeWQSw0tJiykkAs8C52l+BpfqVt/8IUP+cId3t4p2/q98ltkVRLpFEAOs+cF+2eq9idnlUNtsoAs73qstfshMuHxWFwdALw7oPOg2nF4FIvlD7wL7ied7q5MTZZ4ZtKbQqwCBGjwE3gi5pGiZ3hcFIq4DCQujZHXbrVfP/i69B0sunKqCpHcdNbv+Os5VIeGGUUygCMEYV0n3zb0CnNJ9JIQsgHoeRw+ArI9HQUigdCLsPhH59wO36yjbuNNi8Jb8FICGnx7WleJpeSOwIuqwCb4Vb796dSG56DNP4SB8ydx8I40ajcaPhq6OguDj1PYUF4fsVAGacROfKp21CokzPJLYEmXagArCS3fpQydOIrwWZbov06wOTjkWTjoPhe2Z+fxsRAIDBOCuoWmEnJY7X44lPgko3MAFYt76leN6zoKFBpdksMQdfPxydPgXGHATORzu2oO0IYCf7e5ZcaWWJ8VqcWBdEgoE8BVinvr2prl4ChFf4xUVwxlT0wmI0/yY44hB/hQ9tKgLUYQzzqF5uUxJ9g0jOtwCsR48ukFwCDA/An6bE43DWNLTy92jObBjYP7i0C0J8ESnBCUfC1PHQuSTo1Pf0kt5SK0t085uQLwEYFFKphaHV+aMPRs8uRInZ0Ktn8On7jSCtcfwYdOnp6ILJ6OFr4fTja8QcFMa+JhbZhFuL/CSTdQ4YOEp6PAAc48eBZnEO/eBS9Nu7YM8hgSdfh0J6TOneBV0wZddxhyJ01iR05xUwao/AzBg2zjpsetimPBrLNo3sfwIlPW4CpqS8LguUuBwuOCvcXyiEJgB9+zTo3LHpidJ+6GeXonPLIJ51mTXAoMyzt67J9v6scthKukwDuyRbo63SoRhmnhZK0k0Io/wP2ReOOqgVm4KpR6NbL4NBfYKxacxKTp57Yja3ZiwAK+m+L6a7szGWFj26h//LryXoCFBchC6dkd61QwehO2ahcfsHYVkyu8dOnTso0xszymmDYjzvAaCZ+BYQRb7aNBkSrAB0dhn07ZX+DUWF6PtnoPNOrHm/4Y+e1UktsPPvyujZNjOrHTrdAPaVjO7JlMLCUJNvQJARYMgAmDw+OzdOHod+fA4U+fvuwg72Nm24OpN70haAFZccjemizN3KEJ+ZkBFBlb+ELpnhq2GnA0fi5p4HJWn0YbSaELNtyjVHpnt5WgIw6Ai6k5B6DxsQpQCCamuMPwy+NsJ/OvvsgZt7PnTwVQ3KgzvSrQrSy4GikquBLHpbssAF83gUGSUd0IVTg0tv+GDcVedCsa8fwkhv86a0ntJSCsAKO40Avu3Hm7wlgDaAzp8CPX2/kW3IyFI0a5o//0TCpt24e6rL0ogA3s1AdL0mUY4h8MvwUjjpqFCS1sEj0VnH+0mioyWTN6a6qFUBWKzjBOA4P17kNX7aAE7ospmhvrPQN45Ah2Y/lNLE5KpTf9qqQlv03kA4m5O19baAn2jzv2NhVLhDHwD0rTJfjULhrmrtfMvyLSwsAw7M2nK2hNVBE6Strp3Qt04N1peW6N4ZjUhZlbeIsMPs1OsPb+l8ywIw/Shrq22G7ASgC6dB104B+9IClVXY2//xlYShK1s616wALF58NLCfL6ttgWwiwD7DasJ/RNjS1bCl3F8aMN6m3thsNG8hAniX+bLoh0irgAyvdw7NOqfB0PJQ2VKOPbQ8kKTMcUVznzcRgFE0DDg2EKvZkM9tgMnHwl6lobjSHHb/UtgazBRBgxNt6vVNXuY1jQBxO5e29TQeDT26ovNCGf/SPG9/gC1bHWSK8mLxsxt/2EAABgUYZwRpNWPyNALoO2eEMbizeczw7lwMXsCzwWRnN+4jaBgBYrHjwAIZbtwmSFcA+4+CY8eE60s97NnV8Nb7ISRM3+S28gYvhhpVAe6U4K1mSJQRIB1iMXTZ2dH5tWUb9qunQ0vemRr0XNUJwKAYbFJolvORdAp1+gkwdHD4vuzE7n7S92NfCgtlNiVR19W4KwLE42OBLiFaTo8oA0AqAfTphc6eHI0vAGvewVa8FraVbsmCrkfUHuwSgMeEsC3nHSnKX987Gzr6HKGTLlVJvNsWgoW/fKCT6jr46rcB8kQAefIUcOhXYezBkbliDy+Hfwc26TcFXl1ZOwCDAWDDIrKeR7QggMICNOvc6Nz4z3+xhc9FZw+NtNNv6Qd1ESAW3TNOKvLhVfDMk2FwgJNQW8MMu+1RqExGY28n1egwqBWAs8MitZ4vNCe2gX3RzG9E5oI9+wr2xj8js1eLYDTUCsAUfb9/PtCMADTrvOjmJmwpx375ZDS2GmFwEIAzcKFP9siEKKuAxr16Rx0GYw6IzLzNXwyffR6ZvfoI7WOYHLAHENHohjwjXu+1eHERurRJX0l4/PUdePaV6Ow1wboy7fbBDghgRkOARBkB6i0RowumQb/dorFb7WHzFkTyzN+qG3Eb6YAQV2DIc4p2CmDvPWF6hG/BFyyHd/0N8woCeVbqwGU/4rCNo/59YMyBaN6cYJdvaY2PNmIPLInGVmqGxMEG59X4jyirgOllaHpZdPYAu2MhVFTmR6+nY3cHRFTxpUke5EtorPoLvPhmrr2oQ0ZvB4Sw/NaXNKGiEvvFglx70QCDng7okWtHvgjYr5+Cjzbm2o1GqKcjzOVesiEf6sag+XADPLYi1140g3V0QIQrMqRBOxSA3bkQktF29qRJUf4JoL2x9l1Y+UauvWiJoi/37wkZu3dxzt/4tYYDKnPtRLsm6NVDgqUi/wSQx7+WbNDU8YEtCxsCFQ4Icwzyl+w5EKblyXDLppQ7YFOuvWhAO4sAAJoxEYZmvIprFGx0wIZce9HuiTk064y8qwokNuSfANpfAKhh6CA4JfitFfxgNRFAIcxC/JLm0IyJUBrRaON0MFvnwFuXaz8a0A7bAHUUxNH386gqMK1zwHu59uMLxdBBcHLku8Q3i4e954C/5dqRBrTnCLATnTkRdu+XazeIF8TX1kaAQLcj/ZIUFMTRZdOi2xmlWfQZv7rwA6eaRUH/mkNPGhJlBHjjb/Byjjpq9i6Fb4zNjW3AsDVCViNBWaCrEbUVbNVr2Dd/gM2dB170VY/OnAgDczMiT+JlqJ0a5mlVTrxojigjQEVFzf+PLYHfPB6d3VqKCnDfm56TqsB2lvlOy9X5I4Aoqayq+9N+8Vv4Vw7G6o8oRZNaXMo3NGIF8T/DTgEI1oP+L3Ivcs2Oil1/V1RiP/55bqqCsyZC/wx2G/PPWt130UfQcIWQZ6L0oGUiLIDKRj3hb74FC8JboatFigrRd6ZGNxxOu8p6lwBcvgggQqqajtOz2+6HDz6K3BXtOxQdf2gktjxzdVOTdgkgmXwB+CwSD1ojygjcXLjfvgP7yR05eSGlc0+AvqFP0/g0Xrn5T7UHdQIQVICeCNt6XtHSUqyr34QnglmlOyOKC9HFk0OuCmyRFiTq6r5Gzx/eoyFaTo8of3mt2LJb7oNPop/Iof2GoWPCW6TCQ4/UP24ogOrqpaAPQ7Oeb7S2GHP5Nuzau6LzpR46dxL06hpCwnwULyl5vv5HruF5koj7g7ecAVFGgFSPfCtfgyV/av2aMCgpRheFslDVPZr/zar6HzR9BZXUL8nluJxIq4DUy7HbzffC5ujbxjpwBDp83yCTNGfu3sYfNhGAqHibvHknEDLVaazH/+lW7MYm+RYJOn+S/82ka9OCp/Tgd99t/HkLL6HdTYFYzXfSjTbPvgh/yEF/WffOaGowO5PKvBua+7xZASi5YwXweiCWMyXSNkD6O3LY9b+ErdFPodCk0TDE3+ARg5f18OxmGzMtd0PJWt1xMjTyqRFYnw2bsdsfDM+Xlog5dPBIf2m4lsuyRQGosvIJIJcL2YVPGo3ABjzxHLwe8Qi6rduwZ17O+naD1bEHZ7XYpmu9I9pc+949NNOePzPsJ3fC9orU1wZBshq7/kFfq4ma9H2hFr9oqwJQsnwpEG33WJQPoNlUN+s/we55LHhfmsHmP4m98baPFPRIwUOzWl2aJPVQFFV/h3ybQRwU2W7L9tDv4e9NnqgCxRb/EXv6JT9JbHVeVcodYFMKQBUVbwM/8+NJRuRrI7DBfR527d2QrA7Wn53YqjXYvT4Dr1lCC65MOcQpvcFoFeUJwE8sSh8vnExtlkwbgfV5+3144HfB+bITe/Ut7Prf+t00cq3r3vO2dC5MSwCC7cA3iaKGroiwtvE5/MvuWwzr1gfkDNjr/8Dm/tpvZPGc8a3G7/xbIu3hqNrx+Qpkt2bvV5pEKgCfW7NWJbFr5geyxav9eQ02594GA1WzS8iu08Ir0u7Bymw88vbPLwf7S8ZOZUJFRI9YEEx742/vwCJ/Gz7Zohewuff53jfIxEuuR+9EJvdkJABBBTGbTpjLyjQeqBkmAY0AtrsWwEdZLLNQUYVd/5uanUP8RhFjQ6w6OSXd0F9LxjMS9PnnazHNIKz2wMbNobWumxDU7tzbd2A33JfZPe+txy6+CXvu1SA8MINztCjxQaY3ZjUlRds/fRzs5mzuTUlFBcy7O5SkmxDkI+cra2DJyvRsPrYC+/aN8F5ADUjZdfFFP8xq96ns5ySVfzobeCTldVlgN87DfnQtVPlsEKUiqAiwE5v3EGxqZfDIug+xS27G7lzkv7G3i4fdPnZltjdnLQCBR/mmGcDSbNNolV89iI0/GZY9n/rabAn6pdOWcuzae5qmu20Hds9i7IJrapaODQjBCre9x0wlElkr2desREEVxZoChLPl9TvrsHMvwaaeA2+G0AsXcAQA4OU18Oiymr+3bYdFK7AZP4QHlwS6YLTBq4rrRD1zsa/HpkAGoFvn/r2gaiXScCSQq0la9f7VP8bV/W2NzzW+t/Zv5+CoI9GZU2HMwYGMnbcJM+HD/zb1r+7YpT7X5LsJYjHYYyCs3wA7Khvd2/A+a+lcK3mG9I7zqkfryWs+9psHgc1AsG59S/G8ZUjDQhFA/XOlg9GpZTC1DLp1yd7nY8+AjzcGL4CWzgUhAKd/OmfHaNFP/pX1F69HoFNQrPOAnrjkU8gdEqoAao87lcBRR6DxR8IRh0LHDpn5O34GfLKpzQjApFdjsYKJejwR2D7zgQoAwHr37kQyvhDTsaELoP754mIYfRA65gg4ZH8Y0De1r6MnQ/n2NiEAoRVKFp2kZxKBrucUuAAAjFGFdN38a5xOjUwAjc917QIjhsHIYWjvYbDXHjU7g3btXONkMokdMGnXPXksAIlF2tphul5I7Ai6rEIRAICBo/vAaxGzkBS5ABqfqz3u2AEG9IFOnWrWA0inkHMnAEPuOndA8ZV+HvVaIzQB1GI9+x8NsQdAffJCAOmcyw8BbDBxZvypG0Idkhf66kTauH455h2ASOM96ZcAGPaKq44dGHbhQwQCANCm/3zAhvfHgeYAoYSydoIhuzX28dYxWnLduigMhl4FNMZ6lR4J7nacRn1ZBTSoAtY400Vaekuk05EjX6BOG9b9gQ2D90N2CbA1avt5yDakOa5ztwOiLnzIQQSoj/Ua3t+L23WCGV/ICGDuKaGLtPzn70ef+zXkVAC1WJ+9jjKnHyMd/sUQgHtJjh9o2byc7yebFwKoxfqNOMKkK1C9t4jtSwCvyIvN0fO352AxwubJKwHUYgNG/Y8nXSZpGijWxgVgSM9JulUr7gp+IoFP8lIAtVj/fQYR1zQzXYhzg9uYAD40cb9zsbu1Yv47ucnB1OS1AGoxxsYp3XK0B1OFypC65akANhssdrhHiO3+nF5I5OWW4fVpEwKoj40aVci2Dkd64jjJHQcamVsBsNbMLXFOS9i8/Y9au6BNTaRtcwJojJUe2JcCN9qTGy3PHYTTPkhdQxLAZ8itMVjtcCsxW6WXH/I9KieXtHkBNIftPbYUz0YQY4iHK8UxWLjdQD2ReiJ1BMWROu8s5K2gJNI2pI1IG834GOf+7eTeA/ceBdV/14uL/pXr7xY0/w8REJPfjzLKBgAAAABJRU5ErkJggg==)  \n\nHey! I'm your placement Markdown text.\n\n----------\n\n\nTypography\n-------------\n\n[kodeWeave Link](http://kodeweave.sourceforge.net/)  \n**bold text**  \n*italic text*  \n\n### Blockquote:\n\n> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n### Bullet List\n\n - Green\n - Eggs\n - and\n - Ham\n\n### Numbered List\n\n 1. Green\n 2. Eggs\n 3. and\n 4. Ham\n</textarea>\n  </div>\n  <div class=\"preview-container\">\n    <div id=\"preview\"></div>\n  </div>\n</div>");
        cssEditor.setValue("* {\n  box-sizing: border-box;\n}\n\nbody {\n  line-height: 1.4;\n}\n\n.editor-and-preview-container {\n  padding: 1em;\n  width: 100%;\n  height: 100%;\n}\n\n.editor-container, .preview-container {\n  display: inline;\n  overflow: hidden;\n  float: left;\n  width: 50%;\n  height: 100%;\n}\n\n#editor {\n  display: inline-block;\n  width: 100%;\n  height: 500px;\n  resize: none;\n  padding: 1em;\n  line-height: 1.5;\n}\n#editor:focus {\n  outline: none;\n}\n\n#preview {\n  width: 100%;\n  height: 500px;\n  border: 1px green solid;\n  padding: 0 1em;\n  overflow: auto;\n}");
        jsEditor.setValue("mdconverter = new (Showdown.converter)\neditor = $('#editor')\npreview = $('#preview')\n\nupdatePreview = ->\n  preview.html mdconverter.makeHtml(editor.val())\n\nupdatePreview()\neditor.on 'keyup', ->\n  updatePreview()");
        $(".hide-demos, #normalize, #jquery, #showdown").trigger("click");
        
      };
      document.querySelector("[data-action=keylogger]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Keylogger").trigger("change");
        if (document.getElementById("html-preprocessor").value == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").trigger("change");
        }
        htmlEditor.setValue(".container-fluid\n  .row\n    .col-lg-12\n      input.form-control(type='text', data-action='input', placeholder='Type here for keyCode')");
        cssEditor.setValue("html, body\n  height 100%\n\nbody\n  padding 1em 0\n  background #0072ff\n\n.form-control\n  border-radius 5px\n  box-shadow 0 0 25px #00162d");
        jsEditor.setValue("$('[data-action=input]').keydown (e) ->\n  @value = e.which\n  e.preventDefault()\n");
        $(".hide-demos, #jquery, #bootstrap").trigger("click");
        
      };
      newDocument();
      document.querySelector("[data-action=packagezipfiles]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Package Zip Files [JSZip Demo]").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").trigger("change");
        }
        htmlEditor.setValue("<div class=\"grid\">\n  <div class=\"grid__col--12\">\n    <button class=\"btn--default download\">Run</button>\n    <textarea class=\"form__input\" id=\"jszipdemo\" rows=\"7\" placeholder=\"Demo code here...\">var zip = new JSZip();\nzip.file(\"Hello.txt\", \"Hello World\");\nvar folder = zip.folder(\"images\");\nfolder.file(\"folder.txt\", \"I'm a file in a new folder\");\nvar content = zip.generate({type:\"blob\"});\n// see FileSaver.js\nsaveAs(content, \"example.zip\");</textarea>\n  </div>\n</div>\n");
        cssEditor.setValue("");
        jsEditor.setValue("$('.download').click ->\n  setTimeout $('#jszipdemo').val(), 0");
        $(".hide-demos, #polyui, #jquery, #jszip").trigger("click");
        
      };
      document.querySelector("[data-action=passwordgen]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Password Generator").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<div class=\"container-fluid\">\n  <div class=\"row\">\n    <div class=\"col-lg-12\">\n      <div class=\"input-group\">\n        <input type=\"text\" class=\"form-control\" data-action=\"genoutput\" />\n        <span class=\"input-group-btn\">\n          <button class=\"btn btn-default btn-primary\" type=\"button\" data-action=\"gen\">\n            Generate!\n          </button>\n        </span>\n      </div>\n    </div>\n  </div>\n</div>");
        cssEditor.setValue("html, body {\n  height: 100%;\n}\n\nbody {\n  padding: 1em 0;\n  background: #0072ff;\n}\n\n.input-group {\n  box-shadow: 0 0 25px #00162d;\n}\n\n.input-group, .form-control, .input-group-btn, .btn {\n  border-radius: 5px;\n}");
        jsEditor.setValue("function PasswordGen() {\n  var char = \"0123456789abcdefghijklmnopqrstuvwxyz\",\n  fullchar = \"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\",\n  genHash  = \"\",\n             i;\n\n  for (i = 0; i < 8; i++) {\n    var rnum = Math.floor(Math.random() * char.length)\n    genHash += char.substring(rnum, rnum + 1)\n  }\n\n  $(\"[data-action=genoutput]\").val(genHash)\n}\n\n$(\"[data-action=gen]\").click(function() {\n  PasswordGen()\n})\n\nPasswordGen()");
        $(".hide-demos, #jquery, #bootstrap").trigger("click");
        
      };
      document.querySelector("[data-action=pdfembed]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Embed a PDF Example").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<embed width=\"100%\" height=\"100%\" name=\"plugin\" src=\"http://www.usconstitution.net/const.pdf\" type=\"application/pdf\">");
        cssEditor.setValue("html, body {\n  height: 100%;\n  overflow: hidden;\n}");
        jsEditor.setValue("");
        $(".hide-demos, #normalize").trigger("click");
        
      };
      document.querySelector("[data-action=pictureviewer]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("FileReader Picture Viewer").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<div id=\"holder\">\n  Drag and drop image <a data-action=\"call\" href=\"javascript:void()\">here</a>...\n</div> \n\n<div class=\"fill check hide\" align=\"center\">\n  <canvas class=\"logo\" width=\"128\" height=\"128\"></canvas>\n</div>\n\n<div class=\"hide\">\n  <input type=\"file\" data-action=\"load\">\n</div>\n\n<p id=\"status\">\n  File API &amp; FileReader API not supported\n</p>");
        cssEditor.setValue("#holder {\n  border: 10px dashed #ccc;\n  margin: 20px auto;\n  text-align: center;\n}\n#holder.hover {\n  border: 10px dashed #333;\n}\n\n.hide {\n  display: none;\n}\n.fill {\n  width: 100%;\n}");
        jsEditor.setValue("var canvas = $(\".logo\"),\n    ctx = canvas[0].getContext(\"2d\"),\n    holder = document.getElementById(\"holder\"),\n    state = document.getElementById(\"status\");\n\nif (typeof window.FileReader === \"undefined\") {\n  state.className = \"fail\"\n} else {\n  state.className = \"success\"\n  state.innerHTML = \"File API & FileReader available\"\n}\n\nfunction displayPreview(file) {\n  var reader = new FileReader()\n\n  reader.onload = function(e) {\n    var img = new Image()\n    img.src = e.target.result\n    img.onload = function() {\n      // x, y, width, height\n      ctx.clearRect(0, 0, 128, 128)\n      ctx.drawImage(img, 0, 0, 128, 128)\n    }\n  }\n  reader.readAsDataURL(file)\n}\n\n$(\"[data-action=call]\").click(function() {\n  $(\"[data-action=load]\").trigger(\"click\")\n})\n\n$(\"[data-action=load]\").change(function(e) {\n  var file = e.target.files[0]\n  displayPreview(file)\n  $(\".check\").removeClass(\"hide\")\n})\n\n// Drag and drop image load\nholder.ondragover = function () {\n  this.className = \"hover\"\n  return false\n}\nholder.ondragend = function () {\n  this.className = \"\"\n  return false\n}\nholder.ondrop = function(e) {\n  this.className = \"\"\n  e.preventDefault()\n  var file = e.dataTransfer.files[0]\n  displayPreview(file)\n  $(\".check\").removeClass(\"hide\")\n}");
        $(".hide-demos, #jquery").trigger("click");
        
      };
      document.querySelector("[data-action=polyui]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Poly UI Kit").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<div class=\"grid\">\n  <header class=\"grid__col--12 panel--padded--centered\" role=\"banner\"> \n    <a class=\"site-logo\" href=\"javascript:void(0)\">\n      <b class=\"srt\">Poly - UI Toolkit</b>\n    </a>\n    <nav class=\"navbar\" role=\"navigation\">\n      <span id=\"toggle\" class=\"icn--nav-toggle is-displayed-mobile\">\n        <b class=\"srt\">Toggle</b>\n      </span>   \n      <ul class=\"nav is-collapsed-mobile\" role=\"navigation\">\n        <li class=\"nav__item\"><a href=\"#type\">Typography</a></li>\n        <li class=\"nav__item\"><a href=\"#buttons\">Buttons</a></li>\n        <li class=\"nav__item\"><a href=\"#forms\">Form</a></li>\n        <li class=\"nav__item\"><a href=\"#images\">Images</a></li>\n        <li class=\"nav__item\"><a href=\"#grid\">Grid</a></li>\n        <li class=\"nav__item--current\"><a href=\"#nav\">Navigation</a></li>\n        <!-- Current Page Class Style -->\n        <!-- <li class=\"nav__item--current\"><a href=\"#nav\">Navigation</a></li> -->\n      </ul>\n    </nav>\n  </header>\n</div>\n\n<div class=\"grid is-hidden-mobile\">\n  <div class=\"grid__col--12\">\n    <img class=\"img--hero\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/hero.jpg\" alt=\"Poly - A simple UI Kit\">\n  </div>\n</div>\n\n<h4 id=\"type\" class=\"grid\">Typography</h4>\n\n<div class=\"grid\">\n  <div class=\"centered grid__col--8\">\n    <h1 class=\"headline-primary--grouped\">Take a look at this amazing headline</h1>\n    <h2 class=\"headline-secondary--grouped\">Don't forget about the subtitle</h2>\n    <p>This is a typical paragraph for the UI Kit. <a href=\"#\">Here is what a link might look like</a>. The typical font family for this kit is Helvetica Neue.  This kit is intended for clean and refreshing web layouts. No jazz hands here, just the essentials to make dreams come true, with minimal clean web design. The kit comes fully equipped with everything from full responsive media styling to buttons to form fields. <em>I enjoy using italics as well from time to time</em>. Fell free to create the most amazing designs ever with this kit. I truly hope you enjoy not only the kit but this amazing paragraph as well. :)</p>\n    <blockquote>You know what really gets me going? A really nice set of block quotes.  That's right, block quotes that say, \"Hey, I'm an article you want to read and nurture.\"</blockquote>\n  </div>\n</div>\n\n<h4 id=\"buttons\" class=\"grid\">Buttons</h4>\n\n<div class=\"grid\">\n  <div class=\"grid__col--12\">\n    <a class=\"btn--default\" href=\"#\">Button Default</a>\n    <a class=\"btn--success\" href=\"#\">Button Success</a>\n    <a class=\"btn--error\" href=\"#\">Button Error</a>\n    <button class=\"btn--warning\">Button Warning</button>\n    <button class=\"btn--info\">Button Info</button>\n  </div>\n</div>\n\n<h4 id=\"forms\" class=\"grid\">Form Elements</h4>\n\n<div class=\"grid\">\n  <div class=\"grid__col--7\"> \n    <form class=\"form\">\n      <label class=\"form__label--hidden\" for=\"name\">Name:</label> \n      <input class=\"form__input\" type=\"text\" id=\"name\" placeholder=\"Name\">\n\n      <label class=\"form__label--hidden\" for=\"email\">Email:</label>\n      <input class=\"form__input\" type=\"email\" id=\"email\" placeholder=\"email@website.com\">\n\n      <label class=\"form__label--hidden\" for=\"msg\">Message:</label>\n      <textarea class=\"form__input\" id=\"msg\" placeholder=\"Message...\" rows=\"7\"></textarea>\n\n      <input class=\"btn--default\" type=\"submit\" value=\"Submit\">\n      <input class=\"btn--warning\" type=\"reset\" value=\"Reset\">\n    </form>\n  </div>\n  <div class=\"grid__col--4\">\n    <img class=\"img--avatar\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/avatar.png\" alt=\"Avatar\">\n    <form>\n      <label class=\"form__label--hidden\" for=\"username\">Username:</label> \n      <input class=\"form__input\" type=\"text\" id=\"username\" placeholder=\"Username\">\n      <label class=\"form__label--hidden\" for=\"password\">Password:</label>\n      <input class=\"form__input\" type=\"password\" id=\"password\" placeholder=\"Password\">\n      <input class=\"form__btn\" type=\"submit\" value=\"Login\">\n    </form>\n  </div>\n</div>\n\n<h4 id=\"images\" class=\"grid\">Images</h4>\n\n<div class=\"grid\">\n  <div class=\"grid__col--5\">\n    <img src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/sample.jpg\" alt=\"sample image\">\n  </div>\n  <div class=\"grid__col--5\">\n    <img class=\"img--wrap\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/sample.jpg\" alt=\"sample image\">\n  </div>\n  <div class=\"grid__col--2\">\n    <img class=\"img--avatar\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/avatar.png\" alt=\"Avatar\">\n  </div>\n</div>\n\n<h4 id=\"grid\" class=\"grid\">Grid System</h4>\n\n<div class=\"theme__poly\">\n  <div class=\"grid\">\n    <div class=\"grid__col--12\">.grid__col--12</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--6\">.grid__col--6</div>\n    <div class=\"grid__col--6\">.grid__col--6</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--4\">.grid__col--4</div>\n    <div class=\"grid__col--4\">.grid__col--4</div>\n    <div class=\"grid__col--4\">.grid__col--4</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--3\">.grid__col--3</div>\n    <div class=\"grid__col--3\">.grid__col--3</div>\n    <div class=\"grid__col--3\">.grid__col--3</div>\n    <div class=\"grid__col--3\">.grid__col--3</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--5\">.grid__col--5</div>\n    <div class=\"grid__col--7\">.grid__col--7</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--8\">.grid__col--8</div>\n    <div class=\"grid__col--4\">.grid__col--4</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"centered grid__col--7\">.centered .grid__col--7</div>\n  </div>\n</div>\n\n<div class=\"grid\">\n  <div class=\"grid__col--7\">\n    <h4 id=\"nav\">Navigation</h4>\n    <ul class=\"nav\" role=\"navigation\">\n      <li class=\"nav__item\"><a href=\"#\">Nav Link</a></li>\n      <li class=\"nav__item\"><a href=\"#\">Nav Link 2</a></li>\n      <li class=\"nav__item--current\"><a href=\"#\">Nav Current</a></li>\n    </ul>\n    <p>This is what the navigation menu looks like when the screen is at 769px or higher. When the screen is less than 769px, you will have the option to display a toggle menu icon.</p>\n  </div>\n\n  <div class=\"grid__col--4\">\n    <h4>Offcanvas Menu</h4>\n    <div class=\"offcanvas\">\n      <span class=\"icn--close\">\n        <b class=\"srt\">close</b>\n      </span>\n      <ul class=\"menu\" role=\"navigation\">\n        <a class=\"menu__link\" href=\"#\">Link 1</a>\n        <a class=\"menu__link\" href=\"#\">Link 2</a>\n        <a class=\"menu__link\" href=\"#\">Link 3</a>\n        <a class=\"menu__link--end\" href=\"#\">Link 4</a>\n      </ul>\n    </div>\n  </div>\n</div>");
        cssEditor.setValue("");
        jsEditor.setValue("// Toggle Menu for Phones\n$(\"#toggle\").click(function() {\n  $(this).next(\".nav\").toggleClass(\"is-collapsed-mobile\")\n})\n\n// Handles Navigation Style Classes\n$(\".nav__item\").on(\"click\", function() {\n  $(this).parent().find(\"li\").removeClass(\"nav__item--current\").addClass(\"nav__item\")\n  $(this).addClass(\"nav__item--current\").removeClass(\"nav__item\")\n})");
        $(".hide-demos, #polyui, #jquery").trigger("click");
        
      };

      document.querySelector("[data-action=simpleslideshow]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("Simplest jQuery Slideshow").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        htmlEditor.setValue("<div class=\"fadelinks\">\n  <a>\n    <img src=\"http://farm3.static.flickr.com/2610/4148988872_990b6da667.jpg\">\n  </a>\n  <a>\n    <img src=\"http://farm3.static.flickr.com/2597/4121218611_040cd7b3f2.jpg\">\n  </a>\n  <a>\n    <img src=\"http://farm3.static.flickr.com/2531/4121218751_ac8bf49d5d.jpg\">\n  </a>\n</div>\n");
        cssEditor.setValue("body {\n  font-family: arial, helvetica, sans-serif;\n  font-size: 12px;\n}\n\n.fadelinks {\n  position: relative;\n  height: 332px;\n  width: 500px;\n}\n\n.fadelinks > a {\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n}");
        jsEditor.setValue("$(document).ready(function() {\n  $(\".fadelinks > :gt(0)\").hide()\n  setInterval(function() {\n    $(\".fadelinks > :first-child\").fadeOut().next().fadeIn().end().appendTo(\".fadelinks\")\n  }, 3000)\n})");
        $(".hide-demos, #normalize, #jquery").trigger("click");
        
      };
      document.querySelector("[data-action=splitter]").onclick = function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").trigger("change");
        $("[data-action=sitetitle]").val("JQWidgets Splitter").trigger("change");
        if (document.getElementById("html-preprocessor").value == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("css-preprocessor").value == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").trigger("change");
        }
        if (document.getElementById("js-preprocessor").value == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").trigger("change");
        }
        
        htmlEditor.setValue("<div id=\"mainSplitter\">\n  <div>\n    <div id=\"firstNested\">\n      <div>\n        <div id=\"secondNested\">\n          <div>\n            <span>Panel 1</span></div>\n          <div>\n            <span>Panel 2</span></div>\n        </div>\n      </div>\n      <div>\n        <span>Panel 3</span></div>\n    </div>\n  </div>\n  <div>\n    <div id=\"thirdNested\">\n      <div>\n        <span>Panel 4</span></div>\n      <div>\n        <span>Panel 5</span></div>\n    </div>\n  </div>\n</div>\n");
        cssEditor.setValue("");
        jsEditor.setValue("$(document).ready(function () {\n  $(\"#mainSplitter\").jqxSplitter({\n    width: 850,\n    height: 850,\n    orientation: \"horizontal\",\n    panels: [{\n      size: 300,\n      collapsible: false\n    }]\n  });\n  $(\"#firstNested\").jqxSplitter({\n    width: \"100%\",\n    height: \"100%\",\n    orientation: \"vertical\",\n    panels: [{\n      size: 300,\n      collapsible: false\n    }]\n  });\n  $(\"#secondNested\").jqxSplitter({\n    width: \"100%\", \n    height: \"100%\", \n    orientation: \"horizontal\",\n    panels: [{ size: 150 }]\n  });\n  $(\"#thirdNested\").jqxSplitter({\n    width: \"100%\",\n    height: \"100%\", \n    orientation: \"horizontal\",\n    panels: [{\n      size: 150,\n      collapsible: false\n    }]\n  });\n});\n");
        $(".hide-demos, #jquery, #jqxsplitter").trigger("click");
        
      };
    },
    activateMD = function() {
      activeEditor.value = "mdEditor";
      if ($("#function").is(":hidden")) {
        $("#function").show();
      }
      $(".md-chars").removeClass("hide");
      if ( $(".main-editor-chars").is(":visible") ) {
        $(".md-chars").removeClass("hide");
        $(".main-editor-chars").addClass("hide");
      }
    },
    charGeneration = function() {
      document.getElementById("undo").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.undo();
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.undo();
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.undo();
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.undo();
        }
      };
      document.getElementById("redo").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.redo();
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.redo();
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.redo();
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.redo();
        }
      };
      document.getElementById("tabindent").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("indentMore");
          htmlEditor.focus();
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("indentMore");
          cssEditor.focus();
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("indentMore");
          jsEditor.focus();
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.execCommand("indentMore");
          mdEditor.focus();
        }
      };
      document.getElementById("taboutdent").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("indentLess");
          htmlEditor.focus();
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("indentLess");
          cssEditor.focus();
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("indentLess");
          jsEditor.focus();
        } else if ( activeEditor.value === "mdEditor" ) {
          mdEditor.execCommand("indentLess");
          mdEditor.focus();
        }
      };
      document.getElementById("zeninit").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          htmlEditor.execCommand("emmet.expand_abbreviation_with_tab");
          htmlEditor.focus();
        } else if ( activeEditor.value === "cssEditor" ) {
          cssEditor.execCommand("emmet.expand_abbreviation_with_tab");
          cssEditor.focus();
        } else if ( activeEditor.value === "jsEditor" ) {
          jsEditor.execCommand("emmet.expand_abbreviation_with_tab");
          jsEditor.focus();
        }
      };
      document.getElementById("charsym1").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          if (!htmlEditor.getSelection().split(" ").join("")) {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("", htmlEditor.getCursor());
            htmlEditor.replaceRange("<>", htmlEditor.getCursor());
            htmlEditor.focus();
            str = ">";
            mynum = str.length;
            start_cursor = htmlEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            htmlEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            htmlEditor.replaceRange(selected_text, htmlEditor.getCursor());
            htmlEditor.focus();
          } else {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("<" + selected_text + ">");
            htmlEditor.focus();
          }
        } else if ( activeEditor.value === "cssEditor" ) {
          if (!cssEditor.getSelection().split(" ").join("")) {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("", cssEditor.getCursor());
            cssEditor.replaceRange("<>", cssEditor.getCursor());
            cssEditor.focus();
            str = ">";
            mynum = str.length;
            start_cursor = cssEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            cssEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            cssEditor.replaceRange(selected_text, cssEditor.getCursor());
            cssEditor.focus();
          } else {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("<" + selected_text + ">");
            cssEditor.focus();
          }
        } else if ( activeEditor.value === "jsEditor" ) {
          if (!jsEditor.getSelection().split(" ").join("")) {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("", jsEditor.getCursor());
            jsEditor.replaceRange("<>", jsEditor.getCursor());
            jsEditor.focus();
            str = ">";
            mynum = str.length;
            start_cursor = jsEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            jsEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            jsEditor.replaceRange(selected_text, jsEditor.getCursor());
            jsEditor.focus();
          } else {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("<" + selected_text + ">");
            jsEditor.focus();
          }
        } else if ( activeEditor.value === "mdEditor" ) {
          if (!mdEditor.getSelection().split(" ").join("")) {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("", mdEditor.getCursor());
            mdEditor.replaceRange("<>", mdEditor.getCursor());
            mdEditor.focus();
            str = ">";
            mynum = str.length;
            start_cursor = mdEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            mdEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            mdEditor.replaceRange(selected_text, mdEditor.getCursor());
            mdEditor.focus();
          } else {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("<" + selected_text + ">");
            mdEditor.focus();
          }
        }
      };
      document.getElementById("charsym2").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          if (!htmlEditor.getSelection().split(" ").join("")) {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("", htmlEditor.getCursor());
            htmlEditor.replaceRange("{}", htmlEditor.getCursor());
            htmlEditor.focus();
            str = "}";
            mynum = str.length;
            start_cursor = htmlEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            htmlEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            htmlEditor.replaceRange(selected_text, htmlEditor.getCursor());
            htmlEditor.focus();
          } else {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("{" + selected_text + "}");
            htmlEditor.focus();
          }
        } else if ( activeEditor.value === "cssEditor" ) {
          if (!cssEditor.getSelection().split(" ").join("")) {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("", cssEditor.getCursor());
            cssEditor.replaceRange("{}", cssEditor.getCursor());
            cssEditor.focus();
            str = "}";
            mynum = str.length;
            start_cursor = cssEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            cssEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            cssEditor.replaceRange(selected_text, cssEditor.getCursor());
            cssEditor.focus();
          } else {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("{" + selected_text + "}");
            cssEditor.focus();
          }
        } else if ( activeEditor.value === "jsEditor" ) {
          if (!jsEditor.getSelection().split(" ").join("")) {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("", jsEditor.getCursor());
            jsEditor.replaceRange("{}", jsEditor.getCursor());
            jsEditor.focus();
            str = "}";
            mynum = str.length;
            start_cursor = jsEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            jsEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            jsEditor.replaceRange(selected_text, jsEditor.getCursor());
            jsEditor.focus();
          } else {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("{" + selected_text + "}");
            jsEditor.focus();
          }
        } else if ( activeEditor.value === "mdEditor" ) {
          if (!mdEditor.getSelection().split(" ").join("")) {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("", mdEditor.getCursor());
            mdEditor.replaceRange("{}", mdEditor.getCursor());
            mdEditor.focus();
            str = "}";
            mynum = str.length;
            start_cursor = mdEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            mdEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            mdEditor.replaceRange(selected_text, mdEditor.getCursor());
            mdEditor.focus();
          } else {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("{" + selected_text + "}");
            mdEditor.focus();
          }
        }
      };
      document.getElementById("charsym3").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          if (!htmlEditor.getSelection().split(" ").join("")) {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("", htmlEditor.getCursor());
            htmlEditor.replaceRange('""', htmlEditor.getCursor());
            htmlEditor.focus();
            str = '"';
            mynum = str.length;
            start_cursor = htmlEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            htmlEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            htmlEditor.replaceRange(selected_text, htmlEditor.getCursor());
            htmlEditor.focus();
          } else {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection('"' + selected_text + '"');
            htmlEditor.focus();
          }
        } else if ( activeEditor.value === "cssEditor" ) {
          if (!cssEditor.getSelection().split(" ").join("")) {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("", cssEditor.getCursor());
            cssEditor.replaceRange('""', cssEditor.getCursor());
            cssEditor.focus();
            str = '"';
            mynum = str.length;
            start_cursor = cssEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            cssEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            cssEditor.replaceRange(selected_text, cssEditor.getCursor());
            cssEditor.focus();
          } else {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection('"' + selected_text + '"');
            cssEditor.focus();
          }
        } else if ( activeEditor.value === "jsEditor" ) {
          if (!jsEditor.getSelection().split(" ").join("")) {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("", jsEditor.getCursor());
            jsEditor.replaceRange('""', jsEditor.getCursor());
            jsEditor.focus();
            str = '"';
            mynum = str.length;
            start_cursor = jsEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            jsEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            jsEditor.replaceRange(selected_text, jsEditor.getCursor());
            jsEditor.focus();
          } else {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection('"' + selected_text + '"');
            jsEditor.focus();
          }
        } else if ( activeEditor.value === "mdEditor" ) {
          if (!mdEditor.getSelection().split(" ").join("")) {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("", mdEditor.getCursor());
            mdEditor.replaceRange('""', mdEditor.getCursor());
            mdEditor.focus();
            str = '"';
            mynum = str.length;
            start_cursor = mdEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            mdEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            mdEditor.replaceRange(selected_text, mdEditor.getCursor());
            mdEditor.focus();
          } else {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection('"' + selected_text + '"');
            mdEditor.focus();
          }
        }
      };
      document.getElementById("charsym4").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          if (!htmlEditor.getSelection().split(" ").join("")) {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("", htmlEditor.getCursor());
            htmlEditor.replaceRange("''", htmlEditor.getCursor());
            htmlEditor.focus();
            str = "'";
            mynum = str.length;
            start_cursor = htmlEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            htmlEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            htmlEditor.replaceRange(selected_text, htmlEditor.getCursor());
            htmlEditor.focus();
          } else {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("'" + selected_text + "'");
            htmlEditor.focus();
          }
        } else if ( activeEditor.value === "cssEditor" ) {
          if (!cssEditor.getSelection().split(" ").join("")) {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("", cssEditor.getCursor());
            cssEditor.replaceRange("''", cssEditor.getCursor());
            cssEditor.focus();
            str = "'";
            mynum = str.length;
            start_cursor = cssEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            cssEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            cssEditor.replaceRange(selected_text, cssEditor.getCursor());
            cssEditor.focus();
          } else {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("'" + selected_text + "'");
            cssEditor.focus();
          }
        } else if ( activeEditor.value === "jsEditor" ) {
          if (!jsEditor.getSelection().split(" ").join("")) {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("", jsEditor.getCursor());
            jsEditor.replaceRange("''", jsEditor.getCursor());
            jsEditor.focus();
            str = "'";
            mynum = str.length;
            start_cursor = jsEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            jsEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            jsEditor.replaceRange(selected_text, jsEditor.getCursor());
            jsEditor.focus();
          } else {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("'" + selected_text + "'");
            jsEditor.focus();
          }
        } else if ( activeEditor.value === "mdEditor" ) {
          if (!mdEditor.getSelection().split(" ").join("")) {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("", mdEditor.getCursor());
            mdEditor.replaceRange("''", mdEditor.getCursor());
            mdEditor.focus();
            str = "'";
            mynum = str.length;
            start_cursor = mdEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            mdEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            mdEditor.replaceRange(selected_text, mdEditor.getCursor());
            mdEditor.focus();
          } else {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("'" + selected_text + "'");
            mdEditor.focus();
          }
        }
      };
      document.getElementById("charsym5").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          if (!htmlEditor.getSelection().split(" ").join("")) {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("", htmlEditor.getCursor());
            htmlEditor.replaceRange("()", htmlEditor.getCursor());
            htmlEditor.focus();
            str = ")";
            mynum = str.length;
            start_cursor = htmlEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            htmlEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            htmlEditor.replaceRange(selected_text, htmlEditor.getCursor());
            htmlEditor.focus();
          } else {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("(" + selected_text + ")");
            htmlEditor.focus();
          }
        } else if ( activeEditor.value === "cssEditor" ) {
          if (!cssEditor.getSelection().split(" ").join("")) {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("", cssEditor.getCursor());
            cssEditor.replaceRange("()", cssEditor.getCursor());
            cssEditor.focus();
            str = ")";
            mynum = str.length;
            start_cursor = cssEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            cssEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            cssEditor.replaceRange(selected_text, cssEditor.getCursor());
            cssEditor.focus();
          } else {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("(" + selected_text + ")");
            cssEditor.focus();
          }
        } else if ( activeEditor.value === "jsEditor" ) {
          if (!jsEditor.getSelection().split(" ").join("")) {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("", jsEditor.getCursor());
            jsEditor.replaceRange("()", jsEditor.getCursor());
            jsEditor.focus();
            str = ")";
            mynum = str.length;
            start_cursor = jsEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            jsEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            jsEditor.replaceRange(selected_text, jsEditor.getCursor());
            jsEditor.focus();
          } else {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("(" + selected_text + ")");
            jsEditor.focus();
          }
        } else if ( activeEditor.value === "mdEditor" ) {
          if (!mdEditor.getSelection().split(" ").join("")) {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("", mdEditor.getCursor());
            mdEditor.replaceRange("()", mdEditor.getCursor());
            mdEditor.focus();
            str = ")";
            mynum = str.length;
            start_cursor = mdEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            mdEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            mdEditor.replaceRange(selected_text, mdEditor.getCursor());
            mdEditor.focus();
          } else {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("(" + selected_text + ")");
            mdEditor.focus();
          }
        }
      };
      document.getElementById("charsym6").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          if (!htmlEditor.getSelection().split(" ").join("")) {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("", htmlEditor.getCursor());
            htmlEditor.replaceRange("[]", htmlEditor.getCursor());
            htmlEditor.focus();
            str = "]";
            mynum = str.length;
            start_cursor = htmlEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            htmlEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            htmlEditor.replaceRange(selected_text, htmlEditor.getCursor());
            htmlEditor.focus();
          } else {
            selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

            htmlEditor.replaceSelection("[" + selected_text + "]");
            htmlEditor.focus();
          }
        } else if ( activeEditor.value === "cssEditor" ) {
          if (!cssEditor.getSelection().split(" ").join("")) {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("", cssEditor.getCursor());
            cssEditor.replaceRange("[]", cssEditor.getCursor());
            cssEditor.focus();
            str = "]";
            mynum = str.length;
            start_cursor = cssEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            cssEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            cssEditor.replaceRange(selected_text, cssEditor.getCursor());
            cssEditor.focus();
          } else {
            selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

            cssEditor.replaceSelection("[" + selected_text + "]");
            cssEditor.focus();
          }
        } else if ( activeEditor.value === "jsEditor" ) {
          if (!jsEditor.getSelection().split(" ").join("")) {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("", jsEditor.getCursor());
            jsEditor.replaceRange("[]", jsEditor.getCursor());
            jsEditor.focus();
            str = "]";
            mynum = str.length;
            start_cursor = jsEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            jsEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            jsEditor.replaceRange(selected_text, jsEditor.getCursor());
            jsEditor.focus();
          } else {
            selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

            jsEditor.replaceSelection("[" + selected_text + "]");
            jsEditor.focus();
          }
        } else if ( activeEditor.value === "mdEditor" ) {
          if (!mdEditor.getSelection().split(" ").join("")) {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("", mdEditor.getCursor());
            mdEditor.replaceRange("[]", mdEditor.getCursor());
            mdEditor.focus();
            str = "]";
            mynum = str.length;
            start_cursor = mdEditor.getCursor();  // Need to get the cursor position
            cursorLine = start_cursor.line;
            cursorCh = start_cursor.ch;

            // Code to move cursor back [x] amount of spaces. [x] is the data-val value.
            mdEditor.setCursor({line: cursorLine , ch : cursorCh -mynum });
            mdEditor.replaceRange(selected_text, mdEditor.getCursor());
            mdEditor.focus();
          } else {
            selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

            mdEditor.replaceSelection("[" + selected_text + "]");
            mdEditor.focus();
          }
        }
      };
      document.getElementById("function").onclick = function() {
        if ( activeEditor.value === "htmlEditor" ) {
          selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection("function() {}");
          htmlEditor.focus();
        } else if ( activeEditor.value === "cssEditor" ) {
          alertify.alert("Can't add <strong>\"function() {}\"</strong> into CSS").set("basic", true);
        } else if ( activeEditor.value === "jsEditor" ) {
          selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection("function() {}");
          jsEditor.focus();
        }
      };
      $("[data-add=sym]").on("click", function() {
        if ( activeEditor.value === "htmlEditor" ) {
          selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection(selected_text + this.textContent);
          htmlEditor.focus();
        } else if ( activeEditor.value === "cssEditor" ) {
          selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection(selected_text + this.textContent);
          cssEditor.focus();
        } else if ( activeEditor.value === "jsEditor" ) {
          selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection(selected_text + this.textContent);
          jsEditor.focus();
        } else if ( activeEditor.value === "mdEditor" ) {
          selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection(selected_text + this.textContent);
          mdEditor.focus();
        }
      });

      // WYSIWYG Editor for Markdown
      document.getElementById("lorem").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam impedit dolore magnam dolor, atque quia dicta voluptatum. Nam impedit distinctio, tempore molestiae voluptatibus ducimus ullam! Molestiae consectetur, recusandae labore? Cupiditate.");
        mdEditor.focus();
      };
      document.getElementById("bold").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("**" + selected_text + "**");
        mdEditor.focus();
      };
      document.getElementById("italic").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("*" + selected_text + "*");
        mdEditor.focus();
      };
      document.getElementById("strike").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("<strike>" + selected_text + "</strike>");
        mdEditor.focus();
      };
      document.getElementById("anchor").onclick = function() {
        alertify.prompt("Enter URL Below", "",
        function(evt, value) {
          selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("");
          mdEditor.replaceSelection("["+ selected_text +"]("+ value +")");
          mdEditor.focus();
        },
        function() {
          // User clicked cancel
        }).set('basic', true);
      };
      document.getElementById("quote").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("\n  > " + selected_text.replace(/\n/g,'\n  > '));
        mdEditor.focus();
      };
      document.getElementById("code").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("`" + selected_text + "`");
        mdEditor.focus();
      };
      document.getElementById("img").onclick = function() {
        alertify.prompt("Enter Image URL Below", "",
        function(evt, value) {
          selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("");
          mdEditor.replaceSelection("!["+ selected_text +"]("+ value +")");
          mdEditor.focus();
        },
        function() {
          // User clicked cancel
        }).set('basic', true);
      };
      document.getElementById("list-ol").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        var i, len, text;
        for (i = 0, len = selected_text.split("\n").length, text = ""; i < len; i++) {
            text += i + 1 + ". " + selected_text.split("\n")[i] + "\n  ";
        }
        mdEditor.replaceSelection("\n  " + text);
        mdEditor.focus();
      };
      document.getElementById("list-ul").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("\n  - " + selected_text.replace(/\n/g,'\n  - '));
        mdEditor.focus();
      };
      document.getElementById("h1").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("# " + selected_text);
        mdEditor.focus();
      };
      document.getElementById("h2").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("## " + selected_text);
        mdEditor.focus();
      };
      document.getElementById("h3").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("### " + selected_text);
        mdEditor.focus();
      };
      document.getElementById("h4").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("#### " + selected_text);
        mdEditor.focus();
      };
      document.getElementById("h5").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("##### " + selected_text);
        mdEditor.focus();
      };
      document.getElementById("h6").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("###### " + selected_text);
        mdEditor.focus();
      };
      document.getElementById("hr").onclick = function() {
        selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection(selected_text + "\n\n----------\n\n");
        mdEditor.focus();
      };
    },
    initdataURLGrabber = function() {
    var logo            = document.querySelector("[data-action=dataurloutput]"),
        imgUrl          = document.querySelector("[data-url=dataurlimgurl]"),
        dataurlholder   = document.getElementById("dataurlholder"),
        JSimgUrl        = document.querySelector("[data-url=dataurlimgurl]");

    $("#dataurl").on("change", function() {
      (this.checked) ? $("input[name=menubar].active").trigger("click") : "";
    });
      
    // Save Site Title Value for LocalStorage
    function displayDURL(file) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var img = new Image();
        img.src = e.target.result;
        img.onload = function() {
          var dataUrl = e.target.result;
          logo.src = dataUrl;
          imgUrl.value = logo.src;
        };
      };
      reader.readAsDataURL(file);
    }

    // Select all dataurl when textbox clicked
    JSimgUrl.onfocus = function() {
      this.select();
      return false;
    };

    $("#inputdataurl").change(function(e) {
      var file = e.target.files[0];
      displayDURL(file);
      $(".checkdataurl").removeClass("hide");
    });

    // Drag and drop image load
    dataurlholder.ondragover = function () {
      this.className = "block fn txtcenter pointer hover";
      return false;
    };
    dataurlholder.ondragend = function () {
      this.className = "block fn txtcenter pointer";
      return false;
    };
    dataurlholder.ondrop = function(e) {
      this.className = "block fn txtcenter pointer";
      e.preventDefault();
      var file = e.dataTransfer.files[0];
      displayDURL(file);
      $(".checkdataurl").removeClass("hide");
    };

    // Insert DataURL into Active Editor
    document.querySelector("[data-action=dataURLtoEditor]").onclick = function() {
      if ( activeEditor.value === "htmlEditor" ) {
        htmlEditor.replaceSelection(imgUrl.value);
        htmlEditor.focus();
      } else if ( activeEditor.value === "cssEditor" ) {
        cssEditor.replaceSelection(imgUrl.value);
        cssEditor.focus();
      } else if ( activeEditor.value === "jsEditor" ) {
        jsEditor.replaceSelection(imgUrl.value);
        jsEditor.focus();
      } else if ( activeEditor.value === "mdEditor" ) {
        mdEditor.replaceSelection(imgUrl.value);
        mdEditor.focus();
      }
      $("#dataurl").trigger("click");
    };
  },
    responsiveUI = function() {
      // Splitter Theme
      $("#mainSplitter, #splitContainer, #leftSplitter, #rightSplitter").jqxSplitter({
        theme: "metro"
      });

      // Select active editor when clicked/touched
      $("#htmlEditor, #cssEditor, #jsEditor, #mdEditor").on("mousedown touchend", function() {
        $("input[name=menubar].active").trigger("click");

        if ( this.id === "htmlEditor" ) {
          activeEditor.value = "htmlEditor";
          if ($("#function").is(":hidden")) {
            $("#function").show();
          }
          $(".main-editor-chars").removeClass("hide");
          if ( $(".md-chars").is(":visible") ) {
            $(".md-chars").addClass("hide");
          }
        } else if ( this.id === "cssEditor" ) {
          activeEditor.value = "cssEditor";
          if ($("#function").is(":visible")) {
            $("#function").hide();
          }
          $(".main-editor-chars").removeClass("hide");
          if ( $(".md-chars").is(":visible") ) {
            $(".md-chars").addClass("hide");
          }
        } else if ( this.id === "jsEditor" ) {
          activeEditor.value = "jsEditor";
          $(".main-editor-chars").removeClass("hide");
          if ( $(".md-chars").is(":visible") ) {
            $(".md-chars").addClass("hide");
          }
          if ($("#function").is(":hidden")) {
            $("#function").show();
          }
        } else if ( this.id === "mdEditor" ) {
          activeEditor.value = "mdEditor";
          if ($("#function").is(":hidden")) {
            $("#function").show();
          }
          $(".md-chars").removeClass("hide");
          if ( $(".main-editor-chars").is(":visible") ) {
            $(".md-chars").removeClass("hide");
            $(".main-editor-chars").addClass("hide");
          }
        }
      });
      $("#htmlEditor, #cssEditor, #jsEditor").on("mouseup touchend", function() {
        if ( $(document.body).hasClass("live-markdown-preview") ) {
          $(document.body).removeClass("live-markdown-preview");
          if ( !$(document.body).hasClass("app") ) {
            $(document.body).addClass("app");
            updatePreview();
          }
        } else if ( !$(document.body).hasClass("app") ) {
          $(document.body).addClass("app");
          updatePreview();
        }
      });
      $("#mdEditor").on("mouseup touchend", function() {
        if ( $(document.body).hasClass("app") ) {
          $(document.body).removeClass("app");
          if ( !$(document.body).hasClass("live-markdown-preview") ) {
            $(document.body).addClass("live-markdown-preview");
            markdownPreview();
          }
        } else if ( !$(document.body).hasClass("live-markdown-preview") ) {
          $(document.body).addClass("live-markdown-preview");
          markdownPreview();
        }
      });

      // Handle Menu Dropdowns
      $("input[name=menubar]").on("change", function() {
        $(this).toggleClass("active");
        $("input[name=menubar]:checkbox").not(this).removeClass("active").prop("checked", false);
      });

      // Grids
      var checked = JSON.parse(localStorage.getItem("gridSetting"));
      document.getElementById("changeGrid").checked = checked;
      var gridChecked = function() {
        $("#splitContainer").jqxSplitter({
          height: "auto",
          width: "100%",
          orientation: "vertical",
          showSplitBar: true,
          panels: [{ size: "50%",collapsible:false },
                   { size: "50%" }]
        });
        $("#leftSplitter").jqxSplitter({
          width: "100%",
          height: "100%",
          orientation: "horizontal",
          showSplitBar: true,
          panels: [{
            size: "50%",
            collapsible: false
          }]
        });
        $("#rightSplitter").jqxSplitter({
          width: "100%",
          height: "100%",
          orientation: "horizontal",
          showSplitBar: true,
          panels: [{
            size: "50%",
            collapsible: false
          }]
        });
      };
      var gridNotChecked = function() {
        $("#splitContainer").jqxSplitter({
          height: "auto",
          width: "100%",
          orientation: "horizontal",
          showSplitBar: true,
          panels: [{ size: "50%",collapsible:false },
                   { size: "50%" }]
        });
        $("#leftSplitter").jqxSplitter({
          width: "100%",
          height: "100%",
          orientation: "vertical",
          showSplitBar: true,
          panels: [{
            size: "50%",
            collapsible: false
          }]
        });
        $("#rightSplitter").jqxSplitter({
          width: "100%",
          height: "100%",
          orientation: "vertical",
          showSplitBar: true,
          panels: [{
            size: "50%",
            collapsible: false
          }]
        });
      };
      function GridScheme() {
        var checkbox = document.getElementById("changeGrid");
        (checkbox.checked) ? gridChecked() : gridNotChecked();
        (checkbox.checked) ? localStorage.setItem("gridSetting", "true") : localStorage.setItem("gridSetting", "false");
      }
      $("#changeGrid").on("change", function() {
        GridScheme();
        $("input[name=menubar].active").trigger("click");
      }).trigger("change");
      $("#selectEditor").on("change", function() {
        $("#mdEditor, .savemd, #htmlEditor, .savehtml, .htmlSetting").toggleClass("invisible");
        $(".show-editor").toggleClass("html-editor md-editor");

        if (this.checked) {
          $(".pickEditor").attr("src", "assets/html5-small.svg");
          $(".selectEditor").css("top", "87px");
          mdEditor.focus();
          activeEditor.value = "mdEditor";
          if ($("#function").is(":hidden")) {
            $("#function").show();
          }
          $(".md-chars").removeClass("hide");
          if ( $(".main-editor-chars").is(":visible") ) {
            $(".md-chars").removeClass("hide");
            $(".main-editor-chars").addClass("hide");
          }
        } else {
          $(".pickEditor").attr("src", "assets/md-small.svg");
          $(".selectEditor").css("top", "");
          htmlEditor.focus();
          activeEditor.value = "htmlEditor";
          if ($("#function").is(":hidden")) {
            $("#function").show();
          }
          $(".main-editor-chars").removeClass("hide");
          if ( $(".md-chars").is(":visible") ) {
            $(".md-chars").addClass("hide");
          }
        }
      });
      
      document.querySelector(".fullscreen-html-toggle").onclick = function() {
        $(this).toggleClass("fill unfill");
        if ( $(".fullscreen-html-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="fullscreen-html"></span>');
          GridScheme();
        } else if ( $(".fullscreen-html-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="fullscreen-html"></span>');
          $("#splitContainer").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: "100%" },
                     { size: "100%" }]
          });
          $("#leftSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "100%" },
                     { size: "0%"}]
          });
          $("#rightSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "0%"},
                     { size: "0%"}]
          });
        }
      };
      document.querySelector(".fullscreen-css-toggle").onclick = function() {
        $(this).toggleClass("fill unfill");
        if ( $(".fullscreen-css-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="fullscreen-css"></span>');
          GridScheme();
        } else if ( $(".fullscreen-css-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="fullscreen-css"></span>');
          $("#splitContainer").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: "100%" },
                     { size: "100%" }]
          });
          $("#leftSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "0%" },
                     { size: "100%"}]
          });
          $("#rightSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "100%"},
                     { size: "0%"}]
          });
        }
      };
      document.querySelector(".fullscreen-js-toggle").onclick = function() {
        $(this).toggleClass("fill unfill");
        if ( $(".fullscreen-js-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="fullscreen-js"></span>');
          GridScheme();
        } else if ( $(".fullscreen-js-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="fullscreen-js"></span>');
          $("#splitContainer").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: "0%" },
                     { size: "100%" }]
          });
          $("#leftSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "0%" },
                     { size: "0%"}]
          });
          $("#rightSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "100%"},
                     { size: "0%"}]
          });
        }
      };
      document.querySelector(".preview-mode-toggle").onclick = function() {
        $(this).toggleClass("fill unfill");
        if ( $(".preview-mode-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="preview-mode"></span>');
          GridScheme();
        } else if ( $(".preview-mode-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="preview-mode"></span>');
          $("#splitContainer").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: "0%" },
                     { size: "100%" }]
          });
          $("#leftSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "0%" },
                     { size: "0%"}]
          });
          $("#rightSplitter").jqxSplitter({
            height: "100%",
            width: "100%",
            orientation: "horizontal",
            showSplitBar: false,
            panels: [{ size: "0%"},
                     { size: "100%"}]
          });
        }
      };
      
      // Change Welcome Dialog Margin when Orientation Changes
      $(window).on("load resize", function() {
        if ( window.innerWidth > window.innerHeight ) {
          // Landscape
          document.querySelector(".walkthrough-dialog").style = "";
        } else if ( window.innerWidth < window.innerHeight ) {
          // Portrait
          document.querySelector(".walkthrough-dialog").style.margin = "2em";
        }
      });
    },
    loadFiles = function() {
      // Load Files Into Editor
      document.querySelector("[data-action=open-load]").onclick = function() {
        $("input[name=menubar].active").trigger("click");
          if (navigator.onLine) {
            // user is online
            $("[data-action=loadDialog]").fadeIn();
          } else {
            // user is offline
            $("#loadfile").trigger("click");
          }
      };
      document.querySelector("[data-action=open-file]").onclick = function() {
        $("#loadfile").trigger("click");
        $("[data-action=loadDialog]").fadeOut();
      };
      document.querySelector("[data-action=loadProject]").onclick = function() {
        alertify.prompt("Enter project code below!", "",
          function(evt, value) {
          localStorage.clear();
          $(document.body).append('<div class="fixedfill preloader" style="background: radial-gradient(ellipse at center, rgba(122, 188, 255, 0.85) 0%, rgba(64, 150, 238, 0.87) 100%)!important; color: #fff!important;"></div>');
          $(".preloader").html('<div class="table"><div class="cell"><h1>Loading Weave!</h1><div class="spinner"><div class="bounce1" style="background: #fff!important;"></div><div class="bounce2" style="background: #fff!important;"></div><div class="bounce3" style="background: #fff!important;"></div></div></div></div>');
          loadgist(value);
        },
        function() {
          // User clicked cancel
        }).set('basic', true);
        $("[data-action=loadDialog]").fadeOut();
      };
      document.querySelector("[data-action=load-cancel]").onclick = function() {
        $("[data-action=loadDialog]").fadeOut();
      };
      $("#loadfile").on("change", function() {
        loadfile(this);
      });

      function loadfile(input) {
        var reader = new FileReader();
        reader.onload = function(e) {
          // var path = input.value.replace(/.*(\/|\\)/, '');
          var path = input.value;
          if (path.toLowerCase().substring(path.length - 5) === ".html") {
            htmlEditor.setValue( e.target.result );
          } else if (path.toLowerCase().substring(path.length - 5) === ".jade") {
            htmlEditor.setValue( e.target.result );
          } else if (path.toLowerCase().substring(path.length - 4) === ".css") {
            cssEditor.setValue( e.target.result );
          } else if (path.toLowerCase().substring(path.length - 3) === ".js") {
            jsEditor.setValue( e.target.result );
          } else if (path.toLowerCase().substring(path.length - 7) === ".coffee") {
            jsEditor.setValue( e.target.result );
          } else if (path.toLowerCase().substring(path.length - 3) === ".md") {
            mdEditor.setValue( e.target.result );
          } else if (path.toLowerCase().substring(path.length - 3) === ".svg") {
            htmlEditor.setValue( e.target.result );
          } else {
            alertify.error("Sorry kodeWeave does not support that file type!");
          }
        };
        $("input[name=menubar].active").trigger("click");
        reader.readAsText(input.files[0]);
      }

      if (window.File && window.FileReader && window.FileList && window.Blob) {

      } else {
        alertify.error("The File APIs are not fully supported in this browser.");
      }

      singleFileDownload();
    },
    preprocessors = function() {
      $(".settings").click(function() {
        $("input[name=menubar].active").trigger("click");
        $(".preprocessor").addClass("hide");
        if ($(this).hasClass("htmlSetting")) {
          $(".html-preprocessor").removeClass("hide");
        } else if ($(this).hasClass("cssSetting")) {
          $(".css-preprocessor").removeClass("hide");
        } else if ($(this).hasClass("jsSetting")) {
          $(".js-preprocessor").removeClass("hide");
        }
        if (document.getElementById("html-preprocessor").value == "none") {
          if (!htmlEditor.getValue) {
            $(".html-preprocessor-convert").addClass("hide");
          }
        } else if (document.getElementById("html-preprocessor").value == "jade") {
          if (!htmlEditor.getValue) {
            $(".html-preprocessor-convert").addClass("hide");
          }
        }
        if (document.getElementById("js-preprocessor").value == "none") {
          if (!jsEditor.getValue) {
            $(".js-preprocessor-convert").addClass("hide");
          }
        } else if (document.getElementById("js-preprocessor").value == "coffeescript") {
          if (!jsEditor.getValue) {
            $(".js-preprocessor-convert").addClass("hide");
          }
        }
        $("[data-action=preprocessors]").fadeIn();
      });
      $(".confirm-preprocessor").click(function() {
        // Default fadeout speed is 400ms
        $("[data-action=preprocessors]").fadeOut();
        // Hiding all other preprocessors at 400ms
        // Delay only works with animating methods
        // Using setTimeout as an alternative:
        setTimeout(function() {
          $(".preprocessor").addClass("hide");
        }, 400);
      });
      // Preprocessors (Doesn't compile to preview)
      $("#html-preprocessor").on("change", function() {
        var valueSelected = this.value;
        localStorage.setItem("htmlPreprocessorVal", this.value);
        if ( valueSelected == "none") {
          htmlEditor.setOption("mode", "text/html");
          htmlEditor.setOption("gutters", ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
          // htmlEditor.refresh();
        } else if ( valueSelected == "jade") {
          htmlEditor.setOption("mode", "text/x-jade");
          htmlEditor.setOption("gutters", ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
          // htmlEditor.refresh();
        } else {
          htmlEditor.setOption("mode", "text/html");
          htmlEditor.setOption("gutters", ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
          // htmlEditor.refresh();
        }
        updatePreview();
      }).trigger("change");
      $("#css-preprocessor").on("change", function() {
        var valueSelected = this.value;
        localStorage.setItem("cssPreprocessorVal", this.value);

        if ( valueSelected == "none") {
          cssEditor.setOption("mode", "css");
          cssEditor.setOption("gutters", ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
          // cssEditor.setOption("lint", true);
          // cssEditor.refresh();
        } else if ( valueSelected == "stylus") {
          cssEditor.setOption("mode", "text/x-styl");
          cssEditor.setOption("gutters", ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
          setTimeout(function() {
            $(".CodeMirror-lint-mark-error, .CodeMirror-lint-mark-error-metro").removeClass("CodeMirror-lint-mark-error CodeMirror-lint-mark-error-metro");
            $(".CodeMirror-lint-mark-warning, .CodeMirror-lint-mark-warning-metro").removeClass("CodeMirror-lint-mark-warning CodeMirror-lint-mark-warning-metro");
          }, 300);
          // cssEditor.setOption("lint", false);
          // cssEditor.refresh();
        } else {
          cssEditor.setOption("mode", "css");
          cssEditor.setOption("gutters", ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
          // cssEditor.setOption("lint", true);
          // cssEditor.refresh();
        }
        updatePreview();
      }).trigger("change");
      $("#js-preprocessor").on("change", function() {
        var valueSelected = this.value;
        localStorage.setItem("jsPreprocessorVal", this.value);
        if ( valueSelected == "none") {
          jsEditor.setOption("mode", "javascript");
          jsEditor.refresh();
        } else if ( valueSelected == "coffeescript") {
          jsEditor.setOption("mode", "text/x-coffeescript");
          jsEditor.setOption("lint", false);
          jsEditor.setOption("lint", true);
        }
        updatePreview();
      }).trigger("change");

      // Compile preprocessors to preview
      $(".html-preprocessor-convert").click(function() {
        var options = {
            pretty: true
        };
        if (document.getElementById("html-preprocessor").value == "none") {
          Html2Jade.convertHtml(htmlEditor.getValue(), {selectById: true}, function (err, jadeString) {
            if(err) {
              console.error(err);
            } else {
              htmlEditor.setValue(jadeString);
              htmlEditor.execCommand("selectAll");
              htmlEditor.execCommand("indentLess");
              htmlEditor.execCommand("indentLess");
              htmlEditor.setCursor({line: 0 , ch : 0 });
              htmlEditor.execCommand("deleteLine");
              htmlEditor.execCommand("deleteLine");
              htmlEditor.execCommand("deleteLine");
            }
          });
          $("#html-preprocessor").val("jade").trigger("change");
        } else if (document.getElementById("html-preprocessor").value == "jade") {
          $("#html-preprocessor").val("none").trigger("change");
          htmlContent = jade.render(htmlEditor.getValue(), options);
          htmlEditor.setValue(htmlContent);
          beautifyHTML();
        }
      });
      $(".css-preprocessor-convert").click(function() {
        if (document.getElementById("css-preprocessor").value == "none") {
          var css = cssEditor.getValue();
          var converter = new Css2Stylus.Converter(css);
          converter.processCss();
          cssEditor.setValue(converter.getStylus());
          $("#css-preprocessor").val("stylus").trigger("change");
          cssEditor.setOption("lint", false);
          cssEditor.refresh();
        } else if (document.getElementById("css-preprocessor").value == "stylus") {
          var cssContent = cssEditor.getValue();
          stylus(cssContent).render(function(err, out) {
            if(err !== null) {
              console.error("something went wrong");
            } else {
              cssEditor.setValue(out);
            }
          });
          $("#css-preprocessor").val("none").trigger("change");
          beautifyCSS();
        }
      });
      $(".js-preprocessor-convert").click(function() {
        if (document.getElementById("js-preprocessor").value == "none") {
          jsContent = js2coffee.build(jsEditor.getValue()).code;
          jsEditor.setValue(jsContent);
          $("#js-preprocessor").val("coffeescript").trigger("change");
        } else if (document.getElementById("js-preprocessor").value == "coffeescript") {
          $("#js-preprocessor").val("none").trigger("change");
          jsContent = CoffeeScript.compile(jsEditor.getValue(), { bare: true });
          jsEditor.setValue(jsContent);
          beautifyJS();
        }
      });
    },
    miscellaneous = function() {
      // Tool Inputs
      $("[data-action=sitedesc], [data-action=siteauthor]").bind("keyup change", function() {
        var sitedesc = ( document.querySelector("[data-action=sitedesc]").value === "" ? "" : "    <meta name=\"description\" content=\""+ document.querySelector("[data-action=sitedesc]").value +"\">\n" );
        var siteauthor = ( document.querySelector("[data-action=siteauthor]").value === "" ? "" : "    <meta name=\"author\" content=\""+ document.querySelector("[data-action=siteauthor]").value +"\">\n" );
        closeHTML.setValue("</title>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"initial-scale=1.0\">\n" + sitedesc + siteauthor + "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\" />\n");
        updatePreview();
      });
      $(".clear_input").click(function() {
        $("[data-action=sitedesc], [data-action=siteauthor]").trigger("change");
      });
      
      // If textbox has a value...
      // a clear icon will display to clear the input
      $(".metaboxes .heading").not("input[type=number]").clearSearch();
      
      // Show Twitter Feed
      document.querySelector("[data-action=feed]").onclick = function() {
        $("#tab3").trigger("click");
      };
      
      // Close Share Dialog
      document.querySelector("[data-action=social-cancel]").onclick = function() {
        $("[data-action=socialdialog]").fadeOut();
        document.getElementById("clearSharePreview").innerHTML = "";
      };
    },
    myarray = [],
    current = 1,
    activeEditor = document.querySelector("[data-action=activeEditor]"),
    storeValues = function() {
      // Save Site Title Value for LocalStorage
      if ( localStorage.getItem("siteTitle")) {
        $("[data-action=sitetitle]").val(localStorage.getItem("siteTitle"));
      }
      $("[data-action=sitetitle]").on("keyup change", function() {
        localStorage.setItem("siteTitle", this.value);
        if (this.value.split(" ").join("") === "") {
          document.title = "kodeWeave";
        } else {
          document.title = "kodeWeave: " + this.value;
        }
      });
      
      document.title = "kodeWeave: " + document.querySelector("[data-action=sitetitle]").value;

      // Save App Version for LocalStorage
      if ( localStorage.getItem("appVersion")) {
        document.querySelector("[data-value=version]").value = localStorage.getItem("appVersion");
      }
      $("[data-value=version]").on("keyup change", function() {
        localStorage.setItem("appVersion", this.value);
      });
      // Save FontSize for LocalStorage
      if ( localStorage.getItem("fontSize")) {
        document.querySelector("[data-editor=fontSize]").value = localStorage.getItem("fontSize");
        $(".CodeMirror").css("font-size", localStorage.getItem("fontSize") + "px");
      }
      $("[data-editor=fontSize]").on("keyup change", function() {
        $(".CodeMirror").css("font-size", this.value + "px");
        localStorage.setItem("fontSize", this.value);
      });

      // Save Description for LocalStorage
      if ( localStorage.getItem("saveDesc")) {
        document.querySelector("[data-action=sitedesc]").value = localStorage.getItem("saveDesc");
      }
      $("[data-action=sitedesc]").on("keyup change", function() {
        localStorage.setItem("saveDesc", this.value);
      });
      // Save Author for LocalStorage
      if ( localStorage.getItem("saveAuthor")) {
        document.querySelector("[data-action=siteauthor]").value = localStorage.getItem("saveAuthor");
      }
      $("[data-action=siteauthor]").on("keyup change", function() {
        localStorage.setItem("saveAuthor", this.value);
      });
      // Save Preprocessors
      if ( localStorage.getItem("htmlPreprocessorVal")) {
        $("#html-preprocessor").val(localStorage.getItem("htmlPreprocessorVal"));
      }
      if ( localStorage.getItem("cssPreprocessorVal")) {
        $("#css-preprocessor").val(localStorage.getItem("cssPreprocessorVal"));
      }
      if ( localStorage.getItem("jsPreprocessorVal")) {
        document.getElementById("js-preprocessor").value = localStorage.getItem("jsPreprocessorVal");
      }
    },
    checkedLibs = function() {
      if ( $("#alertify").is(":checked") ) {
        $('.alertifyjs').clear();
        download_to_textbox('libraries/alertifyjs/css/alertify.min.css', $('.alertifyjs1'));
        download_to_textbox('libraries/alertifyjs/css/themes/default.min.css', $('.alertifyjs2'));
        download_to_textbox('libraries/alertifyjs/alertify.min.js', $('.alertifyjs3'));
        download_to_textbox('libraries/alertifyjs/css/alertify.rtl.min.css', $('.alertifyjs4'));
        download_to_textbox('libraries/alertifyjs/css/themes/bootstrap.min.css', $('.alertifyjs5'));
        download_to_textbox('libraries/alertifyjs/css/themes/bootstrap.rtl.min.css', $('.alertifyjs6'));
        download_to_textbox('libraries/alertifyjs/css/themes/default.rtl.min.css', $('.alertifyjs7'));
        download_to_textbox('libraries/alertifyjs/css/themes/semantic.min.css', $('.alertifyjs8'));
        download_to_textbox('libraries/alertifyjs/css/themes/semantic.rtl.min.css', $('.alertifyjs9'));

        $(".alertifyzip").val("zip.file('libraries/alertifyjs/css/alertify.min.css', $(\".alertifyjs1\").val());\n    zip.file('libraries/alertifyjs/css/themes/default.min.css', $(\".alertifyjs2\").val());\n    zip.file('libraries/alertifyjs/alertify.min.js', $(\".alertifyjs3\").val());\n    zip.file('libraries/alertifyjs/css/alertify.rtl.min.css', $(\".alertifyjs4\").val());\n    zip.file('libraries/alertifyjs/css/themes/bootstrap.min.css', $(\".alertifyjs5\").val());\n    zip.file('libraries/alertifyjs/css/themes/bootstrap.rtl.min.css', $(\".alertifyjs6\").val());\n    zip.file('libraries/alertifyjs/css/themes/default.rtl.min.css', $(\".alertifyjs7\").val());\n    zip.file('libraries/alertifyjs/css/themes/semantic.min.css', $(\".alertifyjs8\").val());\n    zip.file('libraries/alertifyjs/css/themes/semantic.rtl.min.css', $(\".alertifyjs9\").val());");
      } else {
        $('.alertifyjs, .alertifyzip').clear();
      }

      if ( $("#angular").is(":checked") ) {
        $('.angularjs').clear();
        download_to_textbox('libraries/angular/angular.min.js', $('.angularjs'));
        $(".angularzip").val("zip.file('libraries/angular/angular.min.js', $(\".angularjs\").val());");
      } else {
        $('.angularjs, .angularzip').clear();
      }

      if ( $("#bootstrap").is(":checked") ) {
        $('.bootstrap').clear();
        download_to_textbox('libraries/bootstrap/bootstrap.css', $('.bootstrap1'));
        download_to_textbox('libraries/bootstrap/bootstrap.js', $('.bootstrap2'));
        $('.bootstrap1, .bootstrap2').trigger("change");
        $(".bootstrapzip").val("zip.file('libraries/bootstrap/bootstrap.css', $('.bootstrap1').val());\n  zip.file('libraries/bootstrap/bootstrap.js', $('.bootstrap2').val());");
      } else {
        $('.bootstrap, .bootstrapzip').clear();
      }

      if ( $("#chartjs").is(":checked") ) {
        $('.chartjs').clear();
        download_to_textbox('libraries/chartjs/chart.min.js', $('.chartjs'));
        $('.chartjs').trigger("change");
        $(".chartjszip").val("zip.file('libraries/chartjs/chart.min.js', $('.chartjs').val());");
      } else {
        $('.chartjs, .chartjszip').clear();
      }
      if ( $("#codemirror").is(":checked") ) {
        $('.codemirror').clear();

        download_to_textbox('libraries/codemirror/lib/codemirror.css', $('.codemirror1'));
        download_to_textbox('libraries/codemirror/addon/fold/foldgutter.css', $('.codemirror2'));
        download_to_textbox('libraries/codemirror/lib/codemirror.js', $('.codemirror3'));
        download_to_textbox('libraries/codemirror/mode/javascript/javascript.js', $('.codemirror7'));
        download_to_textbox('libraries/codemirror/mode/xml/xml.js', $('.codemirror8'));
        download_to_textbox('libraries/codemirror/mode/css/css.js', $('.codemirror9'));
        download_to_textbox('libraries/codemirror/mode/htmlmixed/htmlmixed.js', $('.codemirror10'));
        download_to_textbox('libraries/codemirror/addon/edit/closetag.js', $('.codemirror11'));
        download_to_textbox('libraries/codemirror/addon/edit/matchbrackets.js', $('.codemirror12'));
        download_to_textbox('libraries/codemirror/addon/selection/active-line.js', $('.codemirror13'));
        download_to_textbox('libraries/codemirror/addon/fold/foldcode.js', $('.codemirror14'));
        download_to_textbox('libraries/codemirror/addon/fold/foldgutter.js', $('.codemirror15'));
        download_to_textbox('libraries/codemirror/addon/fold/brace-fold.js', $('.codemirror16'));
        download_to_textbox('libraries/codemirror/addon/fold/xml-fold.js', $('.codemirror17'));
        download_to_textbox('libraries/codemirror/addon/fold/comment-fold.js', $('.codemirror18'));
        download_to_textbox('libraries/codemirror/addon/search/search.js', $('.codemirror19'));
        download_to_textbox('libraries/codemirror/addon/search/searchcursor.js', $('.codemirror20'));
        download_to_textbox('libraries/codemirror/addon/dialog/dialog.js', $('.codemirror21'));
        download_to_textbox('libraries/codemirror/addon/hint/show-hint.js', $('.codemirror22'));
        download_to_textbox('libraries/codemirror/addon/hint/xml-hint.js', $('.codemirror23'));
        download_to_textbox('libraries/codemirror/addon/hint/html-hint.js', $('.codemirror24'));
        download_to_textbox('libraries/codemirror/addon/hint/css-hint.js', $('.codemirror25'));
        download_to_textbox('libraries/codemirror/addon/hint/javascript-hint.js', $('.codemirror26'));
        download_to_textbox('libraries/codemirror/addon/search/match-highlighter.js', $('.codemirror27'));
        download_to_textbox('libraries/codemirror/htmlhint.js', $('.codemirror28'));
        download_to_textbox('libraries/codemirror/csslint.js', $('.codemirror29'));
        download_to_textbox('libraries/codemirror/jshint.js', $('.codemirror30'));
        download_to_textbox('libraries/codemirror/addon/lint/lint.js', $('.codemirror31'));
        download_to_textbox('libraries/codemirror/addon/lint/html-lint.js', $('.codemirror32'));
        download_to_textbox('libraries/codemirror/addon/lint/css-lint.js', $('.codemirror33'));
        download_to_textbox('libraries/codemirror/addon/lint/javascript-lint.js', $('.codemirror34'));
        download_to_textbox('libraries/codemirror/inlet.min.js', $('.codemirror35'));
        download_to_textbox('libraries/codemirror/inlet.css', $('.codemirror36'));
        download_to_textbox('libraries/codemirror/emmet.js', $('.codemirror37'));
        download_to_textbox('libraries/codemirror/addon/lint/lint.css', $('.codemirror38'));
        download_to_textbox('libraries/codemirror/addon/dialog/dialog.css', $('.codemirror39'));
        download_to_textbox('libraries/codemirror/addon/hint/show-hint.css', $('.codemirror40'));
        download_to_textbox('libraries/codemirror/addon/search/jump-to-line.js', $('.codemirror41'));
        download_to_textbox('libraries/codemirror/markdown.js', $('.codemirror42'));
        download_to_textbox('libraries/codemirror/continuelist.js', $('.codemirror43'));
        download_to_textbox('libraries/codemirror/mode/haml/haml.js', $('.codemirror44'));
        download_to_textbox('libraries/codemirror/mode/jade/jade.js', $('.codemirror45'));
        download_to_textbox('libraries/codemirror/mode/sass/sass.js', $('.codemirror46'));
        download_to_textbox('libraries/codemirror/mode/livescript/livescript.js', $('.codemirror47'));
        download_to_textbox('libraries/codemirror/mode/coffeescript/coffeescript.js', $('.codemirror48'));
        download_to_textbox('libraries/codemirror/mode/ruby/ruby.js', $('.codemirror49'));
        download_to_textbox('libraries/codemirror/coffee-script.js', $('.codemirror50'));
        download_to_textbox('libraries/codemirror/coffeelint.js', $('.codemirror51'));
        download_to_textbox('libraries/codemirror/addon/lint/coffeescript-lint.js', $('.codemirror52'));
        download_to_textbox('libraries/codemirror/mode/stylus/stylus.js', $('.codemirror53'));

        // var grabCodemirror = [
        //   "zip.file('libraries/codemirror/lib/codemirror.css', $('.codemirror1').val());\n",
        //   "zip.file('libraries/codemirror/addon/fold/foldgutter.css', $('.codemirror2').val());\n",
        //   "zip.file('libraries/codemirror/lib/codemirror.js', $('.codemirror3').val());\n",
        //   "zip.file('libraries/codemirror/mode/javascript/javascript.js', $('.codemirror7').val());\n",
        //   "zip.file('libraries/codemirror/mode/xml/xml.js', $('.codemirror8').val());\n",
        //   "zip.file('libraries/codemirror/mode/css/css.js', $('.codemirror9').val());\n",
        //   "zip.file('libraries/codemirror/mode/htmlmixed/htmlmixed.js', $('.codemirror10').val());\n",
        //   "zip.file('libraries/codemirror/addon/edit/closetag.js', $('.codemirror11').val());\n",
        //   "zip.file('libraries/codemirror/addon/edit/matchbrackets.js', $('.codemirror12').val());\n",
        //   "zip.file('libraries/codemirror/addon/selection/active-line.js', $('.codemirror13').val());\n",
        //   "zip.file('libraries/codemirror/addon/fold/foldcode.js', $('.codemirror14').val());\n",
        //   "zip.file('libraries/codemirror/addon/fold/foldgutter.js', $('.codemirror15').val());\n",
        //   "zip.file('libraries/codemirror/addon/fold/brace-fold.js', $('.codemirror16').val());\n",
        //   "zip.file('libraries/codemirror/addon/fold/xml-fold.js', $('.codemirror17').val());\n",
        //   "zip.file('libraries/codemirror/addon/fold/comment-fold.js', $('.codemirror18').val());\n",
        //   "zip.file('libraries/codemirror/addon/search/search.js', $('.codemirror19').val());\n",
        //   "zip.file('libraries/codemirror/addon/search/searchcursor.js', $('.codemirror20').val());\n",
        //   "zip.file('libraries/codemirror/addon/dialog/dialog.js', $('.codemirror21').val());\n",
        //   "zip.file('libraries/codemirror/addon/hint/show-hint.js', $('.codemirror22').val());\n",
        //   "zip.file('libraries/codemirror/addon/hint/xml-hint.js', $('.codemirror23').val());\n",
        //   "zip.file('libraries/codemirror/addon/hint/html-hint.js', $('.codemirror24').val());\n",
        //   "zip.file('libraries/codemirror/addon/hint/css-hint.js', $('.codemirror25').val());\n",
        //   "zip.file('libraries/codemirror/addon/hint/javascript-hint.js', $('.codemirror26').val());\n",
        //   "zip.file('libraries/codemirror/addon/search/match-highlighter.js', $('.codemirror27').val());\n",
        //   "zip.file('libraries/codemirror/htmlhint.js', $('.codemirror28').val());\n",
        //   "zip.file('libraries/codemirror/csslint.js', $('.codemirror29').val());\n",
        //   "zip.file('libraries/codemirror/jshint.js', $('.codemirror30').val());\n",
        //   "zip.file('libraries/codemirror/addon/lint/lint.js', $('.codemirror31').val());\n",
        //   "zip.file('libraries/codemirror/addon/lint/html-lint.js', $('.codemirror32').val());\n",
        //   "zip.file('libraries/codemirror/addon/lint/css-lint.js', $('.codemirror33').val());\n",
        //   "zip.file('libraries/codemirror/addon/lint/javascript-lint.js', $('.codemirror34').val());\n",
        //   "zip.file('libraries/codemirror/inlet.min.js', $('.codemirror35').val());\n",
        //   "zip.file('libraries/codemirror/inlet.css', $('.codemirror36').val());\n",
        //   "zip.file('libraries/codemirror/emmet.js', $('.codemirror37').val());\n",
        //   "zip.file('libraries/codemirror/addon/lint/lint.css', $('.codemirror38').val());\n",
        //   "zip.file('libraries/codemirror/addon/dialog/dialog.css', $('.codemirror39').val());\n",
        //   "zip.file('libraries/codemirror/addon/hint/show-hint.css', $('.codemirror40').val());\n",
        //   "zip.file('libraries/codemirror/addon/search/jump-to-line.js', $('.codemirror41').val());\n",
        //   "zip.file('libraries/codemirror/markdown.js', $('.codemirror42').val());\n",
        //   "zip.file('libraries/codemirror/continuelist.js', $('.codemirror43').val());\n",
        //   "zip.file('libraries/codemirror/mode/haml/haml.js', $('.codemirror44').val());\n",
        //   "zip.file('libraries/codemirror/mode/jade/jade.js', $('.codemirror45').val());\n",
        //   "zip.file('libraries/codemirror/mode/sass/sass.js', $('.codemirror46').val());\n",
        //   "zip.file('libraries/codemirror/mode/livescript/livescript.js', $('.codemirror47').val());\n",
        //   "zip.file('libraries/codemirror/mode/coffeescript/coffeescript.js', $('.codemirror48').val());\n",
        //   "zip.file('libraries/codemirror/mode/ruby/ruby.js', $('.codemirror49').val());\n",
        //   "zip.file('libraries/codemirror/coffee-script.js', $('.codemirror50').val());\n",
        //   "zip.file('libraries/codemirror/coffeelint.js', $('.codemirror51').val());\n",
        //   "zip.file('libraries/codemirror/addon/lint/coffeescript-lint.js', $('.codemirror52').val());\n",
        //   "zip.file('libraries/codemirror/mode/stylus/stylus.js', $('.codemirror53').val());\n"
        // ];

        var grabCodemirror = "zip.file('libraries/codemirror/lib/codemirror.css', $('.codemirror1').val());\n\n      zip.file('libraries/codemirror/addon/fold/foldgutter.css', $('.codemirror2').val());\n\n      zip.file('libraries/codemirror/lib/codemirror.js', $('.codemirror3').val());\n\n      zip.file('libraries/codemirror/mode/javascript/javascript.js', $('.codemirror7').val());\n\n      zip.file('libraries/codemirror/mode/xml/xml.js', $('.codemirror8').val());\n\n      zip.file('libraries/codemirror/mode/css/css.js', $('.codemirror9').val());\n\n      zip.file('libraries/codemirror/mode/htmlmixed/htmlmixed.js', $('.codemirror10').val());\n\n      zip.file('libraries/codemirror/addon/edit/closetag.js', $('.codemirror11').val());\n\n      zip.file('libraries/codemirror/addon/edit/matchbrackets.js', $('.codemirror12').val());\n\n      zip.file('libraries/codemirror/addon/selection/active-line.js', $('.codemirror13').val());\n\n      zip.file('libraries/codemirror/addon/fold/foldcode.js', $('.codemirror14').val());\n\n      zip.file('libraries/codemirror/addon/fold/foldgutter.js', $('.codemirror15').val());\n\n      zip.file('libraries/codemirror/addon/fold/brace-fold.js', $('.codemirror16').val());\n\n      zip.file('libraries/codemirror/addon/fold/xml-fold.js', $('.codemirror17').val());\n\n      zip.file('libraries/codemirror/addon/fold/comment-fold.js', $('.codemirror18').val());\n\n      zip.file('libraries/codemirror/addon/search/search.js', $('.codemirror19').val());\n\n      zip.file('libraries/codemirror/addon/search/searchcursor.js', $('.codemirror20').val());\n\n      zip.file('libraries/codemirror/addon/dialog/dialog.js', $('.codemirror21').val());\n\n      zip.file('libraries/codemirror/addon/hint/show-hint.js', $('.codemirror22').val());\n\n      zip.file('libraries/codemirror/addon/hint/xml-hint.js', $('.codemirror23').val());\n\n      zip.file('libraries/codemirror/addon/hint/html-hint.js', $('.codemirror24').val());\n\n      zip.file('libraries/codemirror/addon/hint/css-hint.js', $('.codemirror25').val());\n\n      zip.file('libraries/codemirror/addon/hint/javascript-hint.js', $('.codemirror26').val());\n\n      zip.file('libraries/codemirror/addon/search/match-highlighter.js', $('.codemirror27').val());\n\n      zip.file('libraries/codemirror/htmlhint.js', $('.codemirror28').val());\n\n      zip.file('libraries/codemirror/csslint.js', $('.codemirror29').val());\n\n      zip.file('libraries/codemirror/jshint.js', $('.codemirror30').val());\n\n      zip.file('libraries/codemirror/addon/lint/lint.js', $('.codemirror31').val());\n\n      zip.file('libraries/codemirror/addon/lint/html-lint.js', $('.codemirror32').val());\n\n      zip.file('libraries/codemirror/addon/lint/css-lint.js', $('.codemirror33').val());\n\n      zip.file('libraries/codemirror/addon/lint/javascript-lint.js', $('.codemirror34').val());\n\n      zip.file('libraries/codemirror/inlet.min.js', $('.codemirror35').val());\n\n      zip.file('libraries/codemirror/inlet.css', $('.codemirror36').val());\n\n      zip.file('libraries/codemirror/emmet.js', $('.codemirror37').val());\n\n      zip.file('libraries/codemirror/addon/lint/lint.css', $('.codemirror38').val());\n\n      zip.file('libraries/codemirror/addon/dialog/dialog.css', $('.codemirror39').val());\n\n      zip.file('libraries/codemirror/addon/hint/show-hint.css', $('.codemirror40').val());\n\n      zip.file('libraries/codemirror/addon/search/jump-to-line.js', $('.codemirror41').val());\n\n      zip.file('libraries/codemirror/markdown.js', $('.codemirror42').val());\n\n      zip.file('libraries/codemirror/continuelist.js', $('.codemirror43').val());\n\n      zip.file('libraries/codemirror/mode/haml/haml.js', $('.codemirror44').val());\n\n      zip.file('libraries/codemirror/mode/jade/jade.js', $('.codemirror45').val());\n\n      zip.file('libraries/codemirror/mode/sass/sass.js', $('.codemirror46').val());\n\n      zip.file('libraries/codemirror/mode/livescript/livescript.js', $('.codemirror47').val());\n\n      zip.file('libraries/codemirror/mode/coffeescript/coffeescript.js', $('.codemirror48').val());\n\n      zip.file('libraries/codemirror/mode/ruby/ruby.js', $('.codemirror49').val());\n\n      zip.file('libraries/codemirror/coffee-script.js', $('.codemirror50').val());\n\n      zip.file('libraries/codemirror/coffeelint.js', $('.codemirror51').val());\n\n      zip.file('libraries/codemirror/addon/lint/coffeescript-lint.js', $('.codemirror52').val());\n      zip.file('libraries/codemirror/mode/stylus/stylus.js', $('.codemirror53').val());\n";

        $('.codemirror').trigger("change");
        $(".codemirrorzip").val(grabCodemirror);
      } else {
        $('.codemirror, .codemirrorzip').clear();
      }
      if ( $("#createjs").is(":checked") ) {
        $('.createjs').clear();
        download_to_textbox('libraries/createjs/createjs.min.js', $('.createjs1'));
        download_to_textbox('libraries/createjs/easeljs.min.js', $('.createjs2'));
        download_to_textbox('libraries/createjs/tweenjs.min.js', $('.createjs3'));
        download_to_textbox('libraries/createjs/soundjs.min.js', $('.createjs4'));
        download_to_textbox('libraries/createjs/preloadjs.min.js', $('.createjs5'));
        $('.createjs').trigger("change");
        $(".createjszip").val("zip.file('libraries/createjs/createjs.min.js', $('.createjs1').val());\nzip.file('libraries/createjs/easeljs.min.js', $('.createjs2').val());\nzip.file('libraries/createjs/tweenjs.min.js', $('.createjs3').val());\nzip.file('libraries/createjs/soundjs.min.js', $('.createjs4').val());\nzip.file('libraries/createjs/preloadjs.min.js', $('.createjs5').val());");
      } else {
        $('.createjs, .createjszip').clear();
      }
      if ( $("#d3").is(":checked") ) {
        $('.d3').clear();
        download_to_textbox('libraries/d3/d3.js', $('.d3'));
        $('.d3').trigger("change");
        $(".d3zip").val("zip.file('libraries/d3/d3.js', $(\".d3\").val());");
      } else {
        $('.d3, .d3zip').clear();
      }
      if ( $("#dojo").is(":checked") ) {
        $('.dojo').clear();
        download_to_textbox('libraries/dojo/dojo.js', $('.dojo'));
        $('.dojo').trigger("change");
        $(".dojozip").val("zip.file('libraries/dojo/dojo.js', $(\".dojo\").val());");
      } else {
        $('.dojo, .dojozip').clear();
      }
      if ( $("#fabric").is(":checked") ) {
        $('.fabric').clear();
        download_to_textbox('libraries/fabric/fabric.min.js', $('.fabric'));
        $('.fabric').trigger("change");
        $(".fabriczip").val("zip.file('libraries/fabric/fabric.min.js', $(\".fabric\").val());");
      } else {
        $('.fabric, .fabriczip').clear();
      }
      if ( $("#jquery").is(":checked") ) {
        $('.jquery').clear();
        download_to_textbox('libraries/jquery/jquery.js', $('.jquery'));
        $('.jquery').trigger("change");
        $(".jqueryzip").val("zip.file('libraries/jquery/jquery.js', $(\".jquery\").val());");
      } else {
        $('.jquery, .jqueryzip').clear();
      }
      if ( $("#jqueryui").is(":checked") ) {
        $('.jqueryui').clear();
        download_to_textbox('libraries/jqueryui/jqueryui.css', $('.jqueryui1'));
        download_to_textbox('libraries/jqueryui/jqueryui.min.js', $('.jqueryui2'));
        download_to_textbox('libraries/jqueryui/jquery.ui.touch-punch.min.js', $('.jqueryui3'));
        $('.jqueryui').trigger("change");
        $(".jqueryuizip").val("zip.file('libraries/jqueryui/jqueryui.css', $(\".jqueryui1\").val());\nzip.file('libraries/jqueryui/jqueryui.min.js', $(\".jqueryui2\").val());\nzip.file('libraries/jqueryui/jquery.ui.touch-punch.min.js', $(\".jqueryui3\").val());");
      } else {
        $('.jqueryui, .jqueryuizip').clear();
      }
      if ( $("#jquerytools").is(":checked") ) {
        $('.jquerytools').clear();
        download_to_textbox('libraries/jquerytools/jquery.tools.min.js', $('.jquerytools'));
        $('.jquerytools').trigger("change");
        $(".jquerytoolszip").val("zip.file('libraries/jquerytools/jquery.tools.min.js', $(\".jquerytools\").val());");
      } else {
        $('.jquerytools, .jquerytoolszip').clear();
      }
      if ( $("#jszip").is(":checked") ) {
        $('.jszip').clear();
        download_to_textbox('libraries/jszip/jszip.min.js', $('.jszip1'));
        download_to_textbox('libraries/jszip/jszip-utils.js', $('.jszip2'));
        download_to_textbox('libraries/jszip/FileSaver.js', $('.jszip3'));
        download_to_textbox('libraries/jszip/Blob.js', $('.jszip4'));
        $('.jszip').trigger("change");
        $(".jszipzip").val("zip.file('libraries/jszip/jszip.min.js', $(\".jszip1\").val());\nzip.file('libraries/jszip/jszip-utils.js', $(\".jszip2\").val());\nzip.file('libraries/jszip/FileSaver.js', $(\".jszip3\").val());\nzip.file('libraries/jszip/Blob.js', $(\".jszip4\").val());");
      } else {
        $('.jszip, .jszipzip').clear();
      }
      if ( $("#jqxsplitter").is(":checked") ) {
        $('.jqxsplitter').clear();

        download_to_textbox('libraries/jqwidgets/styles/jqx.base.css', $('.jqwidgets1'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.android.css', $('.jqwidgets2'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.arctic.css', $('.jqwidgets3'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.black.css', $('.jqwidgets4'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.blackberry.css', $('.jqwidgets5'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.bootstrap.css', $('.jqwidgets6'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.classic.css', $('.jqwidgets7'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.darkblue.css', $('.jqwidgets8'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.energyblue.css', $('.jqwidgets9'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.fresh.css', $('.jqwidgets10'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.highcontrast.css', $('.jqwidgets11'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.metro.css', $('.jqwidgets12'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.metrodark.css', $('.jqwidgets13'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.mobile.css', $('.jqwidgets14'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.office.css', $('.jqwidgets15'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.orange.css', $('.jqwidgets16'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.shinyblack.css', $('.jqwidgets17'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.summer.css', $('.jqwidgets18'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-darkness.css', $('.jqwidgets19'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-le-frog.css', $('.jqwidgets20'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-lightness.css', $('.jqwidgets21'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-overcast.css', $('.jqwidgets22'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-redmond.css', $('.jqwidgets23'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-smoothness.css', $('.jqwidgets24'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-start.css', $('.jqwidgets25'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.ui-sunny.css', $('.jqwidgets26'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.web.css', $('.jqwidgets27'));
        download_to_textbox('libraries/jqwidgets/styles/jqx.windowsphone.css', $('.jqwidgets28'));
        download_to_textbox('libraries/jqwidgets/jqxcore.js', $('.jqwidgets29'));
        download_to_textbox('libraries/jqwidgets/jqxsplitter.js', $('.jqwidgets30'));

        // var jqxsplitter = [
        //   "zip.file('libraries/jqwidgets/styles/jqx.base.css', $('.jqwidgets1').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.android.css', $('.jqwidgets2').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.arctic.css', $('.jqwidgets3').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.black.css', $('.jqwidgets4').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.blackberry.css', $('.jqwidgets5').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.bootstrap.css', $('.jqwidgets6').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.classic.css', $('.jqwidgets7').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.darkblue.css', $('.jqwidgets8').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.energyblue.css', $('.jqwidgets9').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.fresh.css', $('.jqwidgets10').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.highcontrast.css', $('.jqwidgets11').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.metro.css', $('.jqwidgets12').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.metrodark.css', $('.jqwidgets13').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.mobile.css', $('.jqwidgets14').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.office.css', $('.jqwidgets15').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.orange.css', $('.jqwidgets16').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.shinyblack.css', $('.jqwidgets17').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.summer.css', $('.jqwidgets18').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-darkness.css', $('.jqwidgets19').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-le-frog.css', $('.jqwidgets20').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-lightness.css', $('.jqwidgets21').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-overcast.css', $('.jqwidgets22').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-redmond.css', $('.jqwidgets23').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-smoothness.css', $('.jqwidgets24').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-start.css', $('.jqwidgets25').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.ui-sunny.css', $('.jqwidgets26').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.web.css', $('.jqwidgets27').val());\n",
        //   "zip.file('libraries/jqwidgets/styles/jqx.windowsphone.css', $('.jqwidgets28').val());\n",
        //   "zip.file('libraries/jqwidgets/jqxcore.js', $('.jqwidgets29').val());\n",
        //   "zip.file('libraries/jqwidgets/jqxsplitter.js', $('.jqwidgets30').val());\n"
        // ];

        var jqxsplitter = "zip.file('libraries/jqwidgets/styles/jqx.base.css', $('.jqwidgets1').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.android.css', $('.jqwidgets2').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.arctic.css', $('.jqwidgets3').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.black.css', $('.jqwidgets4').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.blackberry.css', $('.jqwidgets5').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.bootstrap.css', $('.jqwidgets6').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.classic.css', $('.jqwidgets7').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.darkblue.css', $('.jqwidgets8').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.energyblue.css', $('.jqwidgets9').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.fresh.css', $('.jqwidgets10').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.highcontrast.css', $('.jqwidgets11').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.metro.css', $('.jqwidgets12').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.metrodark.css', $('.jqwidgets13').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.mobile.css', $('.jqwidgets14').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.office.css', $('.jqwidgets15').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.orange.css', $('.jqwidgets16').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.shinyblack.css', $('.jqwidgets17').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.summer.css', $('.jqwidgets18').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-darkness.css', $('.jqwidgets19').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-le-frog.css', $('.jqwidgets20').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-lightness.css', $('.jqwidgets21').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-overcast.css', $('.jqwidgets22').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-redmond.css', $('.jqwidgets23').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-smoothness.css', $('.jqwidgets24').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-start.css', $('.jqwidgets25').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.ui-sunny.css', $('.jqwidgets26').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.web.css', $('.jqwidgets27').val());\n\n      zip.file('libraries/jqwidgets/styles/jqx.windowsphone.css', $('.jqwidgets28').val());\n\n      zip.file('libraries/jqwidgets/jqxcore.js', $('.jqwidgets29').val());\n\n      zip.file('libraries/jqwidgets/jqxsplitter.js', $('.jqwidgets30').val());\n";

        $('.jqxsplitter').trigger("change");
        $(".jqxsplitterzip").val(jqxsplitter);
      } else {
        $('.jqxsplitter, .jqxsplitterzip').clear();
      }
      if ( $("#kinetic").is(":checked") ) {
        $('.kinetic').clear();
        download_to_textbox('libraries/kinetic/kinetic.js', $('.kinetic'));
        $('.kinetic').trigger("change");
        $(".kineticzip").val("zip.file('libraries/kinetic/kinetic.js', $(\".kinetic\").val());");
      } else {
        $('.kinetic, .kineticzip').clear();
      }
      if ( $("#knockout").is(":checked") ) {
        $('.knockout').clear();
        download_to_textbox('libraries/knockout/knockout.js', $('.knockout'));
        $('.knockout').trigger("change");
        $(".knockoutzip").val("zip.file('libraries/knockout/knockout.js', $(\".knockout\").val());");
      } else {
        $('.knockout, .knockoutzip').clear();
      }
      if ( $("#modernizer").is(":checked") ) {
        $('.modernizer').clear();
        download_to_textbox('libraries/modernizer/modernizer.js', $('.modernizer'));
        $('.modernizer').trigger("change");
        $(".modernizerzip").val("zip.file('libraries/modernizer/modernizer.js', $(\".modernizer\").val());");
      } else {
        $('.modernizer, .modernizerzip').clear();
      }
      if ( $("#mootools").is(":checked") ) {
        $('.mootools').clear();
        download_to_textbox('libraries/mootools/mootools-yui-compressed.js', $('.mootools'));
        $('.mootools').trigger("change");
        $(".mootoolszip").val("zip.file('libraries/mootools/mootools-yui-compressed.js', $(\".mootools\").val());");
      } else {
        $('.mootools, .mootoolszip').clear();
      }
      if ( $("#normalize").is(":checked") ) {
        $('.normalize').clear();
        download_to_textbox('libraries/normalize/normalize.css', $('.normalize'));
        $('.normalize').trigger("change");
        $(".normalizezip").val("zip.file('libraries/normalize/normalize.css', $(\".normalize\").val());");
      } else {
        $('.normalize, .normalizezip').clear();
      }
      if ( $("#paperjs").is(":checked") ) {
        $('.paperjs').clear();
        download_to_textbox('libraries/paperjs/paperjs.js', $('.paperjs'));
        $('.paperjs').trigger("change");
        $(".paperjszip").val("zip.file('libraries/paperjs/paperjs.js', $(\".paperjs\").val());");
      } else {
        $('.paperjs, .paperjszip').clear();
      }
      if ( $("#polyui").is(":checked") ) {
        $('.polyui').clear();
        download_to_textbox('libraries/polyui/polyui.css', $('.polyui'));
        $('.polyui').trigger("change");
        $(".polyuizip").val("zip.file('libraries/polyui/polyui.css', $(\".polyui\").val());");
      } else {
        $('.polyui, .polyuizip').clear();
      }
      if ( $("#prefixfree").is(":checked") ) {
        $('.prefixfree').clear();
        download_to_textbox('libraries/prefixfree/prefixfree.min.js', $('.prefixfree'));
        $('.prefixfree').trigger("change");
        $(".prefixfreezip").val("zip.file('libraries/prefixfree/prefixfree.min.js', $(\".prefixfree\").val());");
      } else {
        $('.prefixfree, .prefixfreezip').clear();
      }
      if ( $("#processingjs").is(":checked") ) {
        $('.processingjs').clear();
        download_to_textbox('libraries/processingjs/processingjs.js', $('.processingjs'));
        $('.processingjs').trigger("change");
        $(".processingjszip").val("zip.file('libraries/processingjs/processingjs.js', $(\".processingjs\").val());");
      } else {
        $('.processingjs, .processingjsszip').clear();
      }
      if ( $("#prototypejs").is(":checked") ) {
        $('.prototypejs').clear();
        download_to_textbox('libraries/prototypejs/prototypejs.js', $('.prototypejs'));
        $('.prototypejs').trigger("change");
        $(".prototypejszip").val("zip.file('libraries/prototypejs/prototypejs.js', $(\".prototypejs\").val());");
      } else {
        $('.prototypejs, .prototypejszip').clear();
      }
      if ( $("#qooxdoo").is(":checked") ) {
        $('.qooxdoo').clear();
        download_to_textbox('libraries/qooxdoo/qooxdoo.js', $('.qooxdoo'));
        $('.qooxdoo').trigger("change");
        $(".qooxdooszip").val("zip.file('libraries/qooxdoo/qooxdoo.js', $(\".qooxdoo\").val());");
      } else {
        $('.qooxdoo, .qooxdooszip').clear();
      }
      if ( $("#raphael").is(":checked") ) {
        $('.raphael').clear();
        download_to_textbox('libraries/raphael/raphael.js', $('.raphael'));
        $('.raphael').trigger("change");
        $(".raphaelzip").val("zip.file('libraries/raphael/raphael.js', $(\".raphael\").val());");
      } else {
        $('.raphael, .raphaelzip').clear();
      }
      if ( $("#requirejs").is(":checked") ) {
        $('.requirejs').clear();
        download_to_textbox('libraries/require/require.js', $('.requirejs'));
        $('.requirejs').trigger("change");
        $(".requirejszip").val("zip.file('libraries/require/require.js', $(\".requirejs\").val());");
      } else {
        $('.requirejs, .requirejszip').clear();
      }
      if ( $("#showdown").is(":checked") ) {
        $('.showdown').clear();
        download_to_textbox('libraries/showdown/Showdown.min.js', $('.showdown'));
        $('.showdown').trigger("change");
        $(".showdownzip").val("zip.file('libraries/showdown/Showdown.min.js', $(\".showdown\").val());");
      } else {
        $('.showdown, .showdownzip').clear();
      }
      if ( $("#scriptaculous").is(":checked") ) {
        $('.scriptaculous').clear();
        download_to_textbox('libraries/scriptaculous/scriptaculous.js', $('.scriptaculous'));
        $('.scriptaculous').trigger("change");
        $(".scriptaculouszip").val("zip.file('libraries/scriptaculous/scriptaculous.js', $(\".scriptaculous\").val());");
      } else {
        $('.scriptaculous, .scriptaculouszip').clear();
      }
      if ( $("#snapsvg").is(":checked") ) {
        $('.snapsvg').clear();
        download_to_textbox('libraries/snap-svg/snap-svg.js', $('.snapsvg'));
        $('.snapsvg').trigger("change");
        $(".snapsvgzip").val("zip.file('libraries/snap-svg/snap-svg.js', $(\".snapsvg\").val());");
      } else {
        $('.snapsvg, .snapsvgzip').clear();
      }
      if ( $("#svgjs").is(":checked") ) {
        $('.svgjs').clear();
        download_to_textbox('libraries/svg-svg/svg-svg.js', $('.svgjs'));
        $('.svgjs').trigger("change");
        $(".svgjszip").val("zip.file('libraries/svg-svg/svg-svg.js', $(\".svgjs\").val());");
      } else {
        $('.svgjs, .svgjszip').clear();
      }
      if ( $("#threejs").is(":checked") ) {
        $('.threejs').clear();
        download_to_textbox('libraries/threejs/three.min.js', $('.threejs'));
        $('.threejs').trigger("change");
        $(".threejszip").val("zip.file('libraries/threejs/three.min.js', $(\".threejs\").val());");
      } else {
        $('.threejs, .threejszip').clear();
      }
      if ( $("#underscorejs").is(":checked") ) {
        $('.underscorejs').clear();
        download_to_textbox('libraries/underscore/underscore.js', $('.underscorejs'));
        $('.underscorejs').trigger("change");
        $(".underscorejszip").val("zip.file('libraries/underscore/underscore.js', $(\".underscorejs\").val());");
      } else {
        $('.underscorejs, .underscorejszip').clear();
      }
      if ( $("#webfontloader").is(":checked") ) {
        $('.webfontloader').clear();
        download_to_textbox('libraries/webfont/webfont.js', $('.webfontloader'));
        $('.webfontloader').trigger("change");
        $(".webfontloaderzip").val("zip.file('libraries/webfont/webfont.js', $(\".webfontloader\").val());");
      } else {
        $('.webfontloader, .webfontloaderzip').clear();
      }
      if ( $("#yui").is(":checked") ) {
        $('.yui').clear();
        download_to_textbox('libraries/yui/yui.js', $('.yui'));
        $('.yui').trigger("change");
        $(".yuizip").val("zip.file('libraries/yui/yui.js', $(\".yui\").val());");
      } else {
        $('.yui, .yuizip').clear();
      }
      if ( $("#zepto").is(":checked") ) {
        $('.zepto').clear();
        download_to_textbox('libraries/zepto/zepto.js', $('.zepto'));
        $('.zepto').trigger("change");
        $(".zeptozip").val("zip.file('libraries/zepto/zepto.js', $(\".zepto\").val());");
      } else {
        $('.zepto, .zeptozip').clear();
      }

      // Update JSZip (Applied dynamically from HTML div )
      $("[data-action=ziplibs]").val(function() {
        return $.map($(".jszipcode"), function (el) {
          return el.value;
        }).join("");
      });
    },
    download_to_textbox = function (url, el) {
      return $.get(url, null, function (data) {
        el.val(data);
      }, "text");
    },
    download_to_editor = function (url, el) {
      return $.get(url, null, function (data) {
        el.setValue(data);
      }, "text");
    };

// Rules Specified for HTML Validation
var ruleSets = {
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true
};

// IntelliSense with Tern
function getURL(url, c) {
  var xhr = new XMLHttpRequest();
  xhr.open("get", url, true);
  xhr.send();
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    if (xhr.status < 400) return c(null, xhr.responseText);
    var e = new Error(xhr.responseText || "No response");
    e.status = xhr.status;
    c(e);
  };
}

getURL("https://ternjs.net/defs/ecma5.json", function(err, code) {
  if (err) throw new Error("Request for ecma5.json: " + err);
  server = new CodeMirror.TernServer({defs: [JSON.parse(code)]});
  jsEditor.on("cursorActivity", function(cm) { server.updateArgHints(cm); });
});

// Initialize Editors
var htmlEditor = CodeMirror(document.getElementById("htmlEditor"), {
  mode: "text/html",
  tabMode: "indent",
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  autoCloseTags: true,
  foldGutter: true,
  dragDrop: true,
  lint: true,
  gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  extraKeys: {
    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); },
    "Ctrl-'": function(){ applyLowercase(); },
    "Ctrl-\\": function(){ applyUppercase(); },
    "Cmd-'": function(){ applyLowercase(); },
    "Cmd-\\": function(){ applyUppercase(); },
    "Shift-Ctrl-'": function(){ applyMinify(); },
    "Shift-Ctrl-\\": function(){ applyBeautify(); },
    "Shift-Cmd-'": function(){ applyMinify(); },
    "Shift-Cmd-\\": function(){ applyBeautify(); },
    "Cmd-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Ctrl-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Alt-Delete": function(cm){ cm.execCommand("delWordAfter"); },
    "Alt-Shift-Cmd-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Ctrl-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Cmd-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    },
    "Alt-Shift-Ctrl-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    }
  },
  value: "<!-- comment -->\nhello world!",
  paletteHints: true
});
Inlet(htmlEditor);
emmetCodeMirror(htmlEditor);
var cssEditor = CodeMirror(document.getElementById("cssEditor"), {
  mode: "css",
  tabMode: "indent",
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  autoCloseTags: true,
  foldGutter: true,
  dragDrop: true,
  lint: true,
  gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  extraKeys: {
    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); },
    "Ctrl-'": function(){ applyLowercase(); },
    "Ctrl-\\": function(){ applyUppercase(); },
    "Cmd-'": function(){ applyLowercase(); },
    "Cmd-\\": function(){ applyUppercase(); },
    "Shift-Ctrl-'": function(){ applyMinify(); },
    "Shift-Ctrl-\\": function(){ applyBeautify(); },
    "Shift-Cmd-'": function(){ applyMinify(); },
    "Shift-Cmd-\\": function(){ applyBeautify(); },
    "Cmd-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Ctrl-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Alt-Delete": function(cm){ cm.execCommand("delWordAfter"); },
    "Alt-Shift-Cmd-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Ctrl-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Cmd-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    },
    "Alt-Shift-Ctrl-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    }
  },
  paletteHints: true
});
Inlet(cssEditor);
emmetCodeMirror(cssEditor);
var jsEditor = CodeMirror(document.getElementById("jsEditor"), {
  tabMode: "indent",
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  autoCloseTags: true,
  foldGutter: true,
  dragDrop: true,
  lint: {
    options: {
      "asi": true
    }
  },
  gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  extraKeys: {
    "Ctrl-Space": function(cm) { server.complete(cm); },
    "Ctrl-I": function(cm) { server.showType(cm); },
    "Ctrl-O": function(cm) { server.showDocs(cm); },
    "Alt-.": function(cm) { server.jumpToDef(cm); },
    "Alt-,": function(cm) { server.jumpBack(cm); },
    "Ctrl-Q": function(cm) { server.rename(cm); },
    "Ctrl-.": function(cm) { server.selectName(cm); },
    "Ctrl-'": function(){ applyLowercase(); },
    "Ctrl-\\": function(){ applyUppercase(); },
    "Cmd-'": function(){ applyLowercase(); },
    "Cmd-\\": function(){ applyUppercase(); },
    "Shift-Ctrl-'": function(){ applyMinify(); },
    "Shift-Ctrl-\\": function(){ applyBeautify(); },
    "Shift-Cmd-'": function(){ applyMinify(); },
    "Shift-Cmd-\\": function(){ applyBeautify(); },
    "Cmd-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Ctrl-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Alt-Delete": function(cm){ cm.execCommand("delWordAfter"); },
    "Alt-Shift-Cmd-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Ctrl-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Cmd-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    },
    "Alt-Shift-Ctrl-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    },
    "Cmd-/": function(cm){ 
      for (var line = cm.getCursor("to").line; line >= cm.getCursor("from").line; line--) {
        cm.replaceRange("// ", {line: line, ch: 0});
      }
    },
    "Ctrl-/": function(cm){ 
      for (var line = cm.getCursor("to").line; line >= cm.getCursor("from").line; line--) {
        cm.replaceRange("// ", {line: line, ch: 0});
      }
    }
  },
  mode: {name: "javascript", globalVars: false},
  paletteHints: true
});
Inlet(jsEditor);
var mdEditor = CodeMirror(document.getElementById("mdEditor"), {
  mode: "text/x-markdown",
  theme: "default",
  tabMode: "indent",
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  autoCloseTags: true,
  dragDrop: true,
  gutters: ["CodeMirror-linenumbers"],
  extraKeys: {
    "Enter": "newlineAndIndentContinueMarkdownList",
    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); },
    "Ctrl-'": function(){ applyLowercase(); },
    "Ctrl-\\": function(){ applyUppercase(); },
    "Cmd-'": function(){ applyLowercase(); },
    "Cmd-\\": function(){ applyUppercase(); },
    "Shift-Ctrl-'": function(){ applyMinify(); },
    "Shift-Ctrl-\\": function(){ applyBeautify(); },
    "Shift-Cmd-'": function(){ applyMinify(); },
    "Shift-Cmd-\\": function(){ applyBeautify(); },
    "Cmd-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Ctrl-L": function(){ $("[data-action=gotoline]").trigger("click"); },
    "Alt-Delete": function(cm){ cm.execCommand("delWordAfter"); },
    "Alt-Shift-Cmd-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Ctrl-[": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "fold");
      }
    },
    "Alt-Shift-Cmd-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    },
    "Alt-Shift-Ctrl-]": function(cm){ 
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, "unfold");
      }
    }
  }
});

// Autocomplete for JS and CSS
/*
var ExcludedIntelliSenseTriggerKeysCSS = {
    "8": "backspace",
    "9": "tab",
    "13": "enter",
    "16": "shift",
    "17": "ctrl",
    "18": "alt",
    "19": "pause",
    "20": "capslock",
    "27": "escape",
    "33": "pageup",
    "34": "pagedown",
    "35": "end",
    "36": "home",
    "37": "left",
    "38": "up",
    "39": "right",
    "40": "down",
    "45": "insert",
    "46": "delete",
    "91": "left window key",
    "92": "right window key",
    "93": "select",
    "107": "add",
    "109": "subtract",
    "110": "decimal point",
    "111": "divide",
    "112": "f1",
    "113": "f2",
    "114": "f3",
    "115": "f4",
    "116": "f5",
    "117": "f6",
    "118": "f7",
    "119": "f8",
    "120": "f9",
    "121": "f10",
    "122": "f11",
    "123": "f12",
    "144": "numlock",
    "145": "scrolllock",
    "186": "semicolon",
    "187": "equalsign",
    "188": "comma",
    "189": "dash",
    "190": "period",
    "191": "slash",
    "192": "graveaccent",
    "219": "left bracket",
    "221": "right bracket",
    "220": "backslash",
    "222": "quote"
},
    ExcludedIntelliSenseTriggerKeysJS = {
    "8": "backspace",
    "9": "tab",
    "13": "enter",
    "16": "shift",
    "17": "ctrl",
    "18": "alt",
    "19": "pause",
    "20": "capslock",
    "27": "escape",
    "33": "pageup",
    "34": "pagedown",
    "35": "end",
    "36": "home",
    "37": "left",
    "38": "up",
    "39": "right",
    "40": "down",
    "45": "insert",
    "46": "delete",
    "91": "left window key",
    "92": "right window key",
    "93": "select",
    "107": "add",
    "109": "subtract",
    "110": "decimal point",
    "111": "divide",
    "112": "f1",
    "113": "f2",
    "114": "f3",
    "115": "f4",
    "116": "f5",
    "117": "f6",
    "118": "f7",
    "119": "f8",
    "120": "f9",
    "121": "f10",
    "122": "f11",
    "123": "f12",
    "144": "numlock",
    "145": "scrolllock",
    "186": "semicolon",
    "187": "equalsign",
    "188": "comma",
    "189": "dash",
    "190": "period",
    "191": "slash",
    "192": "graveaccent",
    "220": "backslash",
    "222": "quote"
};

cssEditor.on("keyup", function (cm, event) {
  if (!cm.state.completionActive &&
      !ExcludedIntelliSenseTriggerKeysCSS[(event.keyCode || event.which).toString()]) {
    CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
  }
});
jsEditor.on("keyup", function (cm, event) {
  if (!cm.state.completionActive &&
      !ExcludedIntelliSenseTriggerKeysJS[(event.keyCode || event.which).toString()]) {
    CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
  }
});
*/

if ( localStorage.getItem("htmlData")) {
  htmlEditor.setValue(localStorage.getItem("htmlData"));
}
if ( localStorage.getItem("cssData")) {
  cssEditor.setValue(localStorage.getItem("cssData"));
}
if ( localStorage.getItem("jsData")) {
  jsEditor.setValue(localStorage.getItem("jsData"));
}
if ( localStorage.getItem("mdData")) {
  mdEditor.setValue(localStorage.getItem("mdData"));
}

// Initialize Open and Close for HTML editor
var openHTML = CodeMirror(document.getElementById("openHTML"), {
  mode: "text/html",
  value: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>"
});
var sitedesc = ( document.querySelector("[data-action=sitedesc]").value === "" ? "" : "    <meta name=\"description\" content=\""+ document.querySelector("[data-action=sitedesc]").value +"\">\n" );
var siteauthor = ( document.querySelector("[data-action=siteauthor]").value === "" ? "" : "    <meta name=\"author\" content=\""+ document.querySelector("[data-action=siteauthor]").value +"\">\n" );
var closeHTML = CodeMirror(document.getElementById("closeHTML"), {
  mode: "text/html",
  value: "</title>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"initial-scale=1.0\">\n" + sitedesc + siteauthor + "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\" />\n"
});
var closeRefs = CodeMirror(document.getElementById("closeRefs"), {
  mode: "text/html",
  value: "  </head>\n  <body>\n"
});
var closeFinal = CodeMirror(document.getElementById("closeFinal"), {
  mode: "text/html",
  value: "\n  </body>\n</html>"
});

// Render Chosen CSS Preprocessor
function cssPreProcessor(cssSelected) {
  cssSelected = $("#css-preprocessor  option:selected").val();

  if (cssSelected == "none") {
    cssContent = cssEditor.getValue();
  } else if (cssSelected == "stylus") {
    var cssVal = cssEditor.getValue();
    stylus(cssVal).render(function(err, out) {
      if(err !== null) {
        console.error("something went wrong");
      } else {
        cssContent = out;
      }
    });
  }
}

// Live preview
function updatePreview() {
  $(".preview-editor").empty();
  var frame = document.createElement("iframe");
  frame.setAttribute("id", "preview");
  frame.setAttribute("sandbox", "allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts");
  document.querySelector(".preview-editor").appendChild(frame);
  var previewFrame = document.getElementById("preview");
  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  var heading = openHTML.getValue() + document.querySelector("[data-action=sitetitle]").value + closeHTML.getValue() + document.querySelector("[data-action=library-code]").value + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\">\n" + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\">\n";
  preview.open();
  var htmlSelected = $("#html-preprocessor option:selected").val();
  var jsSelected   = $("#js-preprocessor   option:selected").val();
  
  cssPreProcessor();
  
  if ( jsSelected == "none") {
    jsContent = "<script>" + jsEditor.getValue() + "</script>";
  } else if ( jsSelected == "coffeescript") {
    jsContent = "<script>" + CoffeeScript.compile(jsEditor.getValue(), { bare: true }) + "</script>";
  }

  if ( htmlSelected == "none") {
    htmlContent = heading + "<style id='b8c770cc'>" + cssContent + "</style>" + closeRefs.getValue() + "\n" + htmlEditor.getValue() + "\n\n    " + jsContent + closeFinal.getValue();
    preview.write(htmlContent);
  } else if ( htmlSelected == "jade") {
    var options = {
        pretty: true
    };
    var jade2HTML = jade.render(htmlEditor.getValue(), options);
    htmlContent = heading + "<style id='b8c770cc'>" + cssContent + "</style>" + closeRefs.getValue() + "\n" + jade2HTML + jsContent + closeFinal.getValue();
    preview.write(htmlContent);
  }
  preview.close();
}
function markdownPreview() {
  $(".preview-editor").empty();
  var frame = document.createElement("iframe");
  frame.setAttribute("id", "preview");
  frame.setAttribute("sandbox", "allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts");
  document.querySelector(".preview-editor").appendChild(frame);
  var mdconverter = new Showdown.converter(),
      previewFrame = document.getElementById("preview"),
      preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;

  preview.open();
  preview.write( mdconverter.makeHtml( mdEditor.getValue() ) );
  preview.close();
}
markdownPreview();
updatePreview();

var cancel = setTimeout(function() {
  updatePreview();
}, 300);

htmlEditor.on("change", function() {
  clearTimeout(cancel);
  setTimeout(function() {
    updatePreview();
  }, 300);
  localStorage.setItem("htmlData", htmlEditor.getValue());
  
  setTimeout(function() {
    htmlEditor.setOption("paletteHints", "true");
  }, 300);
});
cssEditor.on("change", function() {
  cssPreProcessor();
  $("#preview").contents().find("#b8c770cc").html(cssContent);
  localStorage.setItem("cssData", cssEditor.getValue());
  
  setTimeout(function() {
    cssEditor.setOption("paletteHints", "true");
  }, 300);
});
jsEditor.on("change", function() {
  clearTimeout(cancel);
  setTimeout(function() {
    updatePreview();
  }, 300);
  localStorage.setItem("jsData", jsEditor.getValue());
  
  setTimeout(function() {
    jsEditor.setOption("paletteHints", "true");
  }, 300);
});
mdEditor.on("change", function() {
  markdownPreview();
  localStorage.setItem("mdData", mdEditor.getValue());
  
  setTimeout(function() {
    mdEditor.setOption("paletteHints", "true");
  }, 300);
});

// Don't add to code, replace with new drop file's code
htmlEditor.on("drop", function() {
  htmlEditor.setValue("");
});
cssEditor.on("drop", function() {
  cssEditor.setValue("");
});
jsEditor.on("drop", function() {
  jsEditor.setValue("");
});
mdEditor.on("drop", function() {
  mdEditor.setValue("");
});

validators();
responsiveUI();
loadFiles();

// Checks Internet Connection
window.addEventListener("online", function() {
  checkStatus();
  document.querySelector("[data-action=newdocument]").removeAttribute("style");
});
window.addEventListener("offline", function() {
  checkStatus();
  document.querySelector("[data-action=newdocument]").style.display = "block";
  document.querySelector("[data-action=newdocument]").style.width = "100%";
});
if (navigator.onLine) {
  document.querySelector("[data-action=newdocument]").removeAttribute("style");
} else {
  document.querySelector("[data-action=newdocument]").style.display = "block";
  document.querySelector("[data-action=newdocument]").style.width = "100%";
}
checkStatus();

// Clear Input Values - JQuery Plugin
(function($) {
  $.fn.clear = function() {
    $(this).val("");
  };
}) (jQuery);

function displayPreview(file) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var img = new Image();
    var img16 = new Image();
    var img32 = new Image();
    var img64 = new Image();
    img.src = e.target.result;
    img16.src = e.target.result;
    img32.src = e.target.result;
    img64.src = e.target.result;
    img16.onload = function() {
      // x, y, width, height
      ctx16.clearRect(0, 0, 16, 16);
      ctx16.drawImage(img16, 0, 0, 16, 16);
    };
    img32.onload = function() {
      // x, y, width, height
      ctx32.clearRect(0, 0, 32, 32);
      ctx32.drawImage(img32, 0, 0, 32, 32);
    };
    img64.onload = function() {
      // x, y, width, height
      ctx64.clearRect(0, 0, 64, 64);
      ctx64.drawImage(img64, 0, 0, 64, 64);
    };
    img.onload = function() {
      // x, y, width, height
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(img, 0, 0, 128, 128);
    };
  };
  reader.readAsDataURL(file);
  return false;
}
storeValues();

// Save as a Gist Online
document.querySelector("[data-action=save-gist]").onclick = function() {
  $("input[name=menubar].active").trigger("click");
  
  // Return checked libraries
  var arr = {};
  $(".ldd-submenu input[type=checkbox]").each(function() {
    var id = this.id;
    arr[id] = (this.checked ? true : false);
  });

  // check if description and markdown editor have a value
  if ( !document.querySelector("[data-action=sitedesc]").value) {
    $("[data-action=sitedesc]").val("Saved from kodeWeave!");
  }

  // Return user settings
  var sArr = {
    "siteTitle": document.querySelector("[data-action=sitetitle]").value,
    "version": document.querySelector("[data-value=version]").value,
    "editorFontSize": document.querySelector("[data-editor=fontSize]").value,
    "description": document.querySelector("[data-action=sitedesc]").value,
    "author": document.querySelector("[data-action=siteauthor]").value
  };

  var files = {};
	if (htmlEditor.getValue()) {
      var htmlSelected = $("#html-preprocessor option:selected").val();

      if ( htmlSelected == "none") {
        yourHTML = htmlEditor.getValue();
        files["index.html"] = htmlEditor.getValue() ? { content: yourHTML } : null;
      } else if ( htmlSelected == "jade") {
        yourHTML = htmlEditor.getValue();
        files["index.jade"] = htmlEditor.getValue() ? { content: yourHTML } : null;
      }
	}
	if (cssEditor.getValue()) {
      cssSelected = $("#css-preprocessor option:selected").val();

      if ( cssSelected == "none") {
        yourCSS = cssEditor.getValue();
        files["index.css"] = cssEditor.getValue() ? { content: yourCSS } : null;
      } else if ( cssSelected == "stylus") {
        yourCSS = cssEditor.getValue();
        files["index.styl"] = cssEditor.getValue() ? { content: yourCSS } : null;
      }
	}
	if (jsEditor.getValue()) {
    var jsSelected = $("#js-preprocessor option:selected").val();

    if ( jsSelected == "none") {
      yourJS = jsEditor.getValue();
      files["index.js"] = jsEditor.getValue() ? { content: yourJS } : null;
    } else if ( jsSelected == "coffeescript") {
      yourJS = jsEditor.getValue();
      files["index.coffee"] = jsEditor.getValue() ? { content: yourJS } : null;
    }
	}
	if (mdEditor.getValue()) {
		files["README.md"] = mdEditor.getValue() ? { content: mdEditor.getValue() } : null;
	}
	files["libraries.json"] = { "content": JSON.stringify(arr) };
	files["settings.json"] = { "content": JSON.stringify(sArr) };

  data = {
    "description": document.querySelector("[data-action=sitedesc]").value,
    "public": true,
    "files": files
  };
  
  if (!mdEditor.getValue().trim()) {
    $("#mdurl").prop("checked", false);
    hasMD = "";
  } else {
    hasMD = "md,";
  }
  if (!htmlEditor.getValue().trim()) {
    $("#htmlurl").prop("checked", false);
    hasHTML = "";
  } else {
    hasHTML = "html,";
  }
  if (!cssEditor.getValue().trim()) {
    $("#cssurl").prop("checked", false);
    hasCSS = "";
  } else {
    hasCSS = "css,";
  }
  if (!jsEditor.getValue().trim()) {
    $("#jsurl").prop("checked", false);
    hasJS = "";
  } else {
    hasJS = "js,";
  }
  //ar editEmbed = "edit,";
  // darkUI = "dark,";
  // seeThrough = "transparent,";
  hasResult = "result";
  // showEditors = hasMD + hasHTML + hasCSS + hasJS + editEmbed + darkUI + seeThrough + hasResult;
  var showEditors = hasMD + hasHTML + hasCSS + hasJS + hasResult;

  // Post on Github via JQuery Ajax
  $.ajax({
    url: "https://api.github.com/gists",
    type: "POST",
    dataType: "json",
    data: JSON.stringify(data)
  }).success(function(e) {
    window.location.hash = e.html_url.split("https://gist.github.com/").join("");
    hash = window.location.hash.replace(/#/g,"");
    
    embedProject = e.html_url.split("https://gist.github.com/").join("");
    document.querySelector("[data-output=projectURL]").value = "http://kodeweave.sourceforge.net/editor/#" + embedProject;
    document.querySelector("[data-output=projectURL]").onclick = function() {
      this.select(true);
    };
    document.querySelector("[data-output=projectString]").value = embedProject;
    document.querySelector("[data-output=projectString]").onclick = function() {
      this.select(true);
    };
    
    // Toggle Editor's Visibility for Embed
    $("[data-target=editorURL]").on("change", function() {
      if (document.getElementById("mdurl").checked) {
        hasMD = "md,";
      } else {
        hasMD = "";
      }
      if (document.getElementById("htmlurl").checked) {
        hasHTML = "html,";
      } else {
        hasHTML = "";
      }
      if (document.getElementById("cssurl").checked) {
        hasCSS = "css,";
      } else {
        hasCSS = "";
      }
      if (document.getElementById("jsurl").checked) {
        hasJS = "js,";
      } else {
        hasJS = "";
      }
      if (document.getElementById("resulturl").checked) {
        hasResult = "result";
      } else {
        hasResult = "";
      }
      if (document.getElementById("jsurl").checked && !document.getElementById("resulturl").checked) {
        hasJS = "js";
      }
      if (document.getElementById("cssurl").checked && !document.getElementById("jsurl").checked && !document.getElementById("resulturl").checked) {
        hasCSS = "css";
      }
      if (document.getElementById("htmlurl").checked && !document.getElementById("cssurl").checked && !document.getElementById("jsurl").checked && !document.getElementById("resulturl").checked) {
        hasHTML = "html";
      }
      if (document.getElementById("mdurl").checked && !document.getElementById("htmlurl").checked && !document.getElementById("cssurl").checked && !document.getElementById("jsurl").checked && !document.getElementById("resulturl").checked) {
        hasMD = "md";
      }
      if (document.getElementById("resulturl").checked) {
        hasResult = "result";
      } else {
        hasResult = "";
      }
      if (document.getElementById("transparentembed").checked) {
        seeThrough = "transparent,";
      } else {
        seeThrough = "";
      }
      if (document.getElementById("darkembed").checked) {
        darkUI = "dark,";
      } else {
        darkUI = "";
      }
      if (document.getElementById("editembed").checked) {
        editEmbed = "edit,";
      } else {
        editEmbed = "";
      }
      var showEditors = hasMD + hasHTML + hasCSS + hasJS + editEmbed + darkUI + seeThrough + hasResult;

      document.getElementById("clearSharePreview").innerHTML = "";
      var shareFrame = document.createElement("iframe");
      shareFrame.setAttribute("id", "shareWeavePreview");
      shareFrame.setAttribute("sandbox", "allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts");
      shareFrame.style.width = "calc(100% + 1.5em)";
      shareFrame.style.height = "300px";
      document.getElementById("clearSharePreview").appendChild(shareFrame);
      var previewWeave = document.getElementById("shareWeavePreview");
      previewWeave.src = "http://kodeweave.sourceforge.net/embed/#" + embedProject + "?" + showEditors;
      document.querySelector("[data-output=embedProject]").value = "<iframe width=\"100%\" height=\"300\" src=\"http://kodeweave.sourceforge.net/embed/#" + embedProject + "?" + showEditors + "\" allowfullscreen=\"allowfullscreen\" frameborder=\"0\"></iframe>";
    });
    
    document.getElementById("clearSharePreview").innerHTML = "";
    var shareFrame = document.createElement("iframe");
    shareFrame.setAttribute("id", "shareWeavePreview");
    shareFrame.setAttribute("sandbox", "allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts");
    shareFrame.style.width = "calc(100% + 1.5em)";
    shareFrame.style.height = "300px";
    document.getElementById("clearSharePreview").appendChild(shareFrame);
    var previewWeave = document.getElementById("shareWeavePreview");
    previewWeave.src = "http://kodeweave.sourceforge.net/embed/#" + embedProject + "?" + showEditors;
    document.querySelector("[data-output=embedProject]").value = "<iframe width=\"100%\" height=\"300\" src=\"http://kodeweave.sourceforge.net/embed/#" + embedProject + "?" + showEditors + "\" allowfullscreen=\"allowfullscreen\" frameborder=\"0\"></iframe>";
    document.querySelector("[data-output=embedProject]").onclick = function() {
      this.select(true);
    };

    $(".share-facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=http%3A//kodeweave.sourceforge.net/editor/%23" + embedProject);
    $(".share-twitter").attr("href", "https://twitter.com/home?status=Checkout%20my%20"+ document.querySelector("[data-action=sitetitle]").value.split(" ").join("%20") +"%20%23weave%20on%20%23kodeWeave%20%23kodeWeaveShare%20-%20http%3A//kwe.sf.net/e/%23" + embedProject);
    $(".share-gplus").attr("href", "https://plus.google.com/share?url=http%3A//kodeweave.sourceforge.net/editor/%23" + embedProject);
    $(".share-instagram").attr("href", "https://www.linkedin.com/shareArticle?mini=true&url=http%3A//kodeweave.sourceforge.net/editor/%23"+ embedProject +"&title=Checkout%20my%20%23weave%20on%20%23kodeWeave%3A%20&summary=&source=");
    $("[data-action=socialdialog]").fadeIn();

    // Let user view gist
    alertify.success("Your weave is saved!");
  }).error(function(e) {
    console.warn("Error: Could not save weave!", e);
    alertify.error("Error: Could not save weave!");
  });
};

// Save Checked Libraries for LocalStorage
var textarea = document.querySelector("[data-action=library-code]");
if (localStorage.getItem("checkedLibraries")) {
 textarea.value = localStorage.getItem("checkedLibraries");

 var lsStored = JSON.parse(localStorage.getItem('checkedInputs')) || [];
 for (var j = 0, jLen = lsStored.length; j < jLen; j++) {
   $('#' + lsStored[j]).prop('checked', true);
 }
}

// Add/Remove Libraries
$("[data-action=check]").on("change keyup", function() {
  var value = $(this).parent().nextAll("div").children(".libsources:first").val() + "\n";
  checkedLibs();

  var libsTextarea = $("[data-action=libstextarea]");

  if ( $(this).prop("checked") === true ) {
    textarea.value = textarea.value + value;
  } else {
    textarea.value = textarea.value.replace( value, "");
  }

  updatePreview();

  var checked = $("[type=checkbox].check:checked");
  var lsChecked = [];
  for (var i = 0, iLen = checked.length; i < iLen; i++) {
    lsChecked.push($(checked[i]).attr('id'));
  }
  localStorage.setItem("checkedLibraries", textarea.value);
  localStorage.setItem("checkedInputs", JSON.stringify(lsChecked));
});
$("#jquery").trigger("keyup");

shortcutKeys();
initGenerators();
checkedLibs();
appDemos();
charGeneration();
initdataURLGrabber();
miscellaneous();
newDocument();

// Scroll Character Menu
(function() {
  function scrollMenu(e) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    document.getElementById('charmenu').scrollLeft -= (delta*40); // Multiplied by 40
    return false;
  }
  if (document.getElementById('charmenu').addEventListener) {
    // IE9, Chrome, Safari, Opera
    document.getElementById('charmenu').addEventListener('mousewheel', scrollMenu, false);
    // Firefox
    document.getElementById('charmenu').addEventListener('DOMMouseScroll', scrollMenu, false);
  } else {
    // IE 6/7/8
    document.getElementById('charmenu').attachEvent('onmousewheel', scrollMenu);
  }
})();