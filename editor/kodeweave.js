var timeout,
    delay,
    renderYourHTML = function() {
      var htmlSelected  = $("#html-preprocessor option:selected").val();

      if ( htmlSelected == "none") {
        yourHTML = htmlEditor.getValue();
      } else if ( htmlSelected == "jade") {
        var options = {
            pretty: true
        }
        yourHTML = jade.render(htmlEditor.getValue(), options);
      }
    },
    renderYourCSS = function() {
      var cssSelected = $("#css-preprocessor option:selected").val();

      if ( cssSelected == "none") {
        yourCSS = cssEditor.getValue();
      } else if ( cssSelected == "stylus") {
        stylus(cssEditor.getValue()).render(function(err, out) {
          if(err != null) {
            console.error("something went wrong");
          } else {
            yourCSS = out;
          }
        })
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
    singleFileDownload = function() {
      $(".savehtml").click(function() {
        var htmlSelected = $("#html-preprocessor option:selected").val();

        if ( htmlSelected == "none") {
          yourHTML = htmlEditor.getValue();
          var blob = new Blob([ yourHTML ], {type: "text/html"});
          saveAs(blob, "source.html");
        } else if ( htmlSelected == "jade") {
          var blob = new Blob([ htmlEditor.getValue() ], {type: "text/x-jade"});
          saveAs(blob, "source.jade");
        }
      })
      $(".savecss").click(function() {
        var cssSelected = $("#css-preprocessor option:selected").val();

        if ( cssSelected == "none") {
          yourCSS = cssEditor.getValue();
          var blob = new Blob([ yourCSS ], {type: "text/css"});
          saveAs(blob, "source.css");
        } else if ( cssSelected == "stylus") {
          var blob = new Blob([ cssEditor.getValue() ], {type: "text/x-styl"});
          saveAs(blob, "source.styl");
        }
      })
      $(".savejs").click(function() {
        var jsSelected = $("#js-preprocessor option:selected").val();

        if ( jsSelected == "none") {
          var blob = new Blob([ jsEditor.getValue() ], {type: "text/javascript"});
          saveAs(blob, "source.js");
        } else if ( jsSelected == "coffeescript") {
          var blob = new Blob([ jsEditor.getValue() ], {type: "text/x-coffeescript"});
          saveAs(blob, "source.coffee");
        }
      })
      $(".savemd").click(function() {
        var blob = new Blob([ mdEditor.getValue() ], {type: "text/x-markdown"});
        saveAs(blob, "source.md");
      })
    },
    applyLowercase = function() {
      if ( activeEditor.val() === "htmlEditor" ) {
        var selected_text = htmlEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        htmlEditor.replaceSelection(selected_text);
        htmlEditor.focus();
      } else if ( activeEditor.val() === "cssEditor" ) {
        var selected_text = cssEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        cssEditor.replaceSelection(selected_text);
        cssEditor.focus();
      } else if ( activeEditor.val() === "jsEditor" ) {
        var selected_text = jsEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        jsEditor.replaceSelection(selected_text);
        jsEditor.focus();
      } else if ( activeEditor.val() === "mdEditor" ) {
        var selected_text = mdEditor.getSelection().toLowerCase();  // Need to grab the Active Selection

        mdEditor.replaceSelection(selected_text);
        mdEditor.focus();
      }
    },
    applyUppercase = function() {
      if ( activeEditor.val() === "htmlEditor" ) {
        var selected_text = htmlEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        htmlEditor.replaceSelection(selected_text);
        htmlEditor.focus();
      } else if ( activeEditor.val() === "cssEditor" ) {
        var selected_text = cssEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        cssEditor.replaceSelection(selected_text);
        cssEditor.focus();
      } else if ( activeEditor.val() === "jsEditor" ) {
        var selected_text = jsEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        jsEditor.replaceSelection(selected_text);
        jsEditor.focus();
      } else if ( activeEditor.val() === "mdEditor" ) {
        var selected_text = mdEditor.getSelection().toUpperCase();  // Need to grab the Active Selection

        mdEditor.replaceSelection(selected_text);
        mdEditor.focus();
      }
    },
    applyMinify = function() {
      if ( activeEditor.val() === "htmlEditor" ) {
        htmlEditor.setValue(htmlEditor.getValue().replace(/\<\!--\s*?[^\s?\[][\s\S]*?--\>/g,'').replace(/\>\s*\</g,'><'));
        $("input[name=menubar].active").trigger("click");
      } else if ( activeEditor.val() === "cssEditor" ) {
        cssEditor.setValue( cssEditor.getValue().replace(/\/\*.*\*\/|\/\*[\s\S]*?\*\/|\n|\t|\v|\s{2,}/g,"").replace(/\s*\{\s*/g,"{").replace(/\s*\}\s*/g,"}").replace(/\s*\:\s*/g,":").replace(/\s*\;\s*/g,";").replace(/\s*\,\s*/g,",").replace(/\s*\~\s*/g,"~").replace(/\s*\>\s*/g,">").replace(/\s*\+\s*/g,"+").replace(/\s*\!\s*/g,"!") );
      } else if ( activeEditor.val() === "jsEditor" ) {
        jsEditor.setValue( jsEditor.getValue().replace(/\/\*[\s\S]*?\*\/|\/\/.*\n|\s{2,}|\n|\t|\v|\s(?=function\(.*?\))|\s(?=\=)|\s(?=\{)/g,"").replace(/\s?function\s?\(/g,"function(").replace(/\s?\{\s?/g,"{").replace(/\s?\}\s?/g,"}").replace(/\,\s?/g,",").replace(/if\s?/g,"if") );
      }
    },
    applyBeautify = function() {
      if ( activeEditor.val() === "htmlEditor" ) {
        beautifyHTML();
      } else if ( activeEditor.val() === "cssEditor" ) {
        beautifyCSS();
      } else if ( activeEditor.val() === "jsEditor" ) {
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
        $("[data-action=sitetitle]").val("site title").change();
        $("[data-action=sitedesc]").val("sample description").change();
        $("[data-action=siteauthor]").val("kodeWeave").change();
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
      $("#restartapp").click(function() {
        location.reload(true);
      });
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
      $("[data-action=tidy]").click(function() {;
        // if ( activeEditor.val() === "htmlEditor" ) {
        //   var htmlLines = htmlEditor.lineCount();
        //   htmlEditor.autoFormatRange({line:0, ch:0}, {line:htmlLines});
        // } else if ( activeEditor.val() === "cssEditor" ) {
        //   var cssLines = cssEditor.lineCount();
        //   cssEditor.autoFormatRange({line:0, ch:0}, {line:cssLines});
        // } else if ( activeEditor.val() === "jsEditor" ) {
        //   var jsLines = jsEditor.lineCount();
        //   jsEditor.autoFormatRange({line:0, ch:0}, {line:jsLines});
        // }

        applyBeautify();

        $("input[name=menubar].active").trigger("click");
      });

      // Minify Code
      $("[data-action=minify]").click(function() {
        applyMinify();
        $("input[name=menubar].active").trigger("click");
      });

      // Go To Line
      $("[data-action=gotoline]").click(function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("gotoLine");
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("gotoLine");
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("gotoLine");
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.execCommand("gotoLine");
        }

        $("input[name=menubar].active").trigger("click");
      });

      // Comment Current Selection
      $("[data-action=toggle_comment]").click(function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("emmet.toggle_comment");
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("emmet.toggle_comment");
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("emmet.toggle_comment");
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.execCommand("emmet.toggle_comment");
        }

        $("input[name=menubar].active").trigger("click");
      });

      // Make text selection lowercase
      $("[data-action=lowercase]").click(function() {
        applyLowercase();
        $("input[name=menubar].active").trigger("click");
      });

      // Make text selection uppercase
      $("[data-action=uppercase]").click(function() {
        applyUppercase();
        $("input[name=menubar].active").trigger("click");
      });

      $("[data-action=search]").click(function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("find");
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("find");
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("find");
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.execCommand("find");
        }
        $("input[name=menubar].active").trigger("click");
      });
      $("[data-action=replace]").click(function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("replace");
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("replace");
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("replace");
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.execCommand("replace");
        }
        $("input[name=menubar].active").trigger("click");
      });
      $("[data-action=replaceall]").click(function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("replaceAll");
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("replaceAll");
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("replaceAll");
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.execCommand("replaceAll");
        }
        $("input[name=menubar].active").trigger("click");
      });
    },
    fullscreenEditor = function() {
      $(".fullscreen-html-toggle").click(function() {
        $(this).toggleClass("fill unfill");
        if ( $(".fullscreen-html-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="fullscreen-html"></span>');
          GridScheme();
        } else if ( $(".fullscreen-html-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="fullscreen-html"></span>');
          $("#mainSplitter").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: '0%' },
                     { size: '100%',collapsible:false }]
          });
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
      });
      $(".fullscreen-css-toggle").click(function() {
        $(this).toggleClass("fill unfill");
        if ( $(".fullscreen-css-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="fullscreen-css"></span>');
          GridScheme();
        } else if ( $(".fullscreen-css-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="fullscreen-css"></span>');
          $("#mainSplitter").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: '0%' },
                     { size: '100%',collapsible:false }]
          });
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
      });
      $(".fullscreen-js-toggle").click(function() {
        $(this).toggleClass("fill unfill");
        if ( $(".fullscreen-js-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="fullscreen-js"></span>');
          GridScheme();
        } else if ( $(".fullscreen-js-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="fullscreen-js"></span>');
          $("#mainSplitter").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: '0%' },
                     { size: '100%',collapsible:false }]
          });
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
      });
      $(".fullscreen-md-toggle").click(function() {
        $(this).toggleClass("fill unfill");
        if ( $(".fullscreen-md-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="fullscreen-md"></span>');
          GridScheme();
        } else if ( $(".fullscreen-md-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="fullscreen-md"></span>');
          $("#mainSplitter").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: '100%' },
                     { size: '0%',collapsible:false }]
          });
          $("#splitContainer").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: "0%" },
                     { size: "0%" }]
          });
        }
      });
      $(".preview-mode-toggle").click(function() {
        $(this).toggleClass("fill unfill");
        if ( $(".preview-mode-toggle.unfill").is(":visible") ) {
          $(this).html('<span class="fa fa-expand" id="preview-mode"></span>');
          GridScheme();
        } else if ( $(".preview-mode-toggle.fill").is(":visible") ) {
          $(this).html('<span class="fa fa-compress" id="preview-mode"></span>');
          $("#mainSplitter").jqxSplitter({
            height: "auto",
            width: "100%",
            orientation: "vertical",
            showSplitBar: false,
            panels: [{ size: '0%' },
                     { size: '100%',collapsible:false }]
          });
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
      });
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
      $("[data-action=alphabetizer]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Alphabetizer").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<div class=\"grid\">\n  <div class=\"grid__col--12\">\n    <button class=\"btn--default\" data-action=\"alphabetize\">Alphabetize</button>\n    <textarea class=\"form__input\" data-action=\"input-list\" rows=\"7\" placeholder=\"Alphabetize your text here...\">China\nIndia\nUnited States of America\nIndonesia\nBrazil\nPakistan\nNigeria\nBangladesh\nRussia\nJapan\nMexico\nPhilippines\nEthiopia\nVietnam\nEgypt\nGermany\nIran\nTurkey\nDemocratic Republic of the Congo\nFrance</textarea>\n  </div>\n</div>");
        cssEditor.setValue("");
        jsEditor.setValue("var txt = document.querySelector(\"[data-action=input-list]\")\n\ndocument.querySelector(\"[data-action=alphabetize]\").addEventListener(\"click\", function() {\n  txt.value = (txt.value.split(\"\\n\").sort(caseInsensitive).join(\"\\n\"))\n\n  function caseInsensitive(a, b) {\n    return a.toLowerCase().localeCompare(b.toLowerCase())\n  }\n})\n");
        $(".hide-demos, #polyui").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=angular]").on("click", function() {
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Angular JS Demo").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        $("#css-preprocessor").val("none").change();
        htmlEditor.setValue("<div class=\"page-wrap\" ng-app>\n  <h1 class=\"headline\">Simple content toggle with AngularJS</h1>\n  <p>\n    Choose what to display:\n    <select class=\"content-select\" ng-model=\"selection\">\n      <option value=\"content1\">Content #1</option>\n      <option value=\"content2\">Content #2</option>\n    </select>\n  </p>\n\n  <div class=\"container\">\n    <article ng-show=\"selection == 'content1'\">\n      <h2 class=\"h2\">Content #1</h2>\n      <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est.</p>\n    </article>\n    <article ng-show=\"selection == 'content2'\">\n      <h2 class=\"h2\">Content #2</h2>\n      <p>Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>\n    </article>\n  </div>\n</div>");
        cssEditor.setValue("body {\n  padding: 3em 2em;\n  font-size: 1em;\n  line-height: 1;\n}\n\n/* Pen specific CSS */\n.page-wrap {\n  margin: 0 auto;\n  max-width: 700px;\n}\n\n.headline {\n  margin: 0 0 .7em 0;\n  font-size: 1.7em;\n  font-weight: bold;\n}\n\n.content-select {\n  margin: 0 0 0 1em;\n}\n\narticle {\n  margin: 3em 0 0 0;\n}\narticle p {\n  margin: 0 0 .5em 0;\n  line-height: 1.3;\n}\narticle .h2 {\n  margin: 0 0 .5em 0;\n  font-size: 1.2em;\n}");
        jsEditor.setValue("");
        $(".hide-demos, #normalize, #angular").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=applicator]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Code Applicator").change();
        if ($("#html-preprocessor").val() == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").change();
        }
        if ($("#css-preprocessor").val() == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").change();
        }
        if ($("#js-preprocessor").val() == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").change();
        }
        htmlEditor.setValue("textarea#addcode(placeholder='Encode here...')\ntextarea#encode(readonly='', placeholder='Encoded code goes here...')\n  | #decode Preview code here.");
        cssEditor.setValue("body\n  margin 0\n\n::-webkit-input-placeholder\n  color #555\n\n:-moz-placeholder\n  color #555\n\n::-moz-placeholder\n  color #555\n\n:-ms-input-placeholder\n  color #555\n\n#addcode, #encode, #decode\n  position absolute\n  font-family monospace\n  line-height 1.4em\n  font-size 1em\n  overflow auto\n  resize none\n  margin 0\n  padding 0\n  border 0\n\n#encode, #decode\n  left 0\n  width 50%\n  height 50%\n  background-color #fff\n\n#addcode\n  top 0\n  right 0\n  bottom 0\n  margin 0\n  width 50%\n  height 100%\n  min-height 1.4em\n  border 0\n  border-radius 0\n  resize none\n  color #ccc\n  background-color #111\n\n#encode\n  top 0\n\n#decode\n  bottom 0");
        jsEditor.setValue("document.querySelector('#addcode').onkeyup = ->\n  document.querySelector('#encode').textContent = @value\n  document.querySelector('#encode').textContent = document.querySelector('#encode').innerHTML\n  if @value == ''\n    document.querySelector('#decode').innerHTML = 'Preview code here.'\n  else\n    document.querySelector('#decode').innerHTML = @value\n  false\n\ndocument.querySelector('#encode').onclick = ->\n  @select()\n  false");
        $(".hide-demos").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=charactermap]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Character Map").change();
        if ($("#html-preprocessor").val() == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").change();
        }
        if ($("#css-preprocessor").val() == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        $("#html-preprocessor").val("jade").change();
        $("#js-preprocessor").val("none").change();
        htmlEditor.setValue("iframe(src='http://dev.w3.org/html5/html-author/charref')");
        cssEditor.setValue("html, body\n  height 100%\n\niframe\n  width 100%\n  height 100%\n  border 0");
        jsEditor.setValue("");
        $(".hide-demos").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=codeeditor]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Code Editor").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<textarea id=\"code\"><!doctype html>\n<html>\n  <head>\n    <meta charset=utf-8>\n    <title>HTML5 canvas demo</title>\n    <style>\n      p {\n        font: 12px Verdana, sans-serif;\n        color: #935033;\n      }\n    </style>\n  </head>\n  <body>\n    <p>Canvas pane goes here:</p>\n    <canvas id=\"pane\" width=\"300\" height=\"200\"></canvas>\n\n    <script>\n      var canvas = document.getElementById(\"pane\")\n      var context = canvas.getContext(\"2d\")\n\n      context.fillStyle = \"rgb(250,0,0)\"\n      context.fillRect(10, 10, 55, 50)\n\n      context.fillStyle = \"rgba(0, 0, 250, 0.5)\"\n      context.fillRect(30, 30, 55, 50)\n    </script>\n  </body>\n</html></textarea>\n\n<iframe id=\"preview\"></iframe>");
        cssEditor.setValue(".CodeMirror {\n  float: left;\n  width: 50%;\n  border: 1px solid #000;\n}\n\niframe {\n  width: 49%;\n  float: left;\n  height: 300px;\n  border: 1px solid #000;\n  border-left: 0;\n}");
        jsEditor.setValue("var delay\n\n// Initialize CodeMirror editor\nvar editor = CodeMirror.fromTextArea(document.getElementById(\"code\"), {\n  mode: \"text/html\",\n  tabMode: \"indent\",\n  styleActiveLine: true,\n  lineNumbers: true,\n  lineWrapping: true,\n  autoCloseTags: true,\n  foldGutter: true,\n  dragDrop: true,\n  lint: true,\n  gutters: [\"CodeMirror-lint-markers\", \"CodeMirror-linenumbers\", \"CodeMirror-foldgutter\"]\n})\nInlet(editor)\nemmetCodeMirror(editor)\n\n// Live preview\neditor.on(\"change\", function() {\n  clearTimeout(delay)\n  delay = setTimeout(updatePreview, 300)\n})\n\nfunction updatePreview() {\n  var previewFrame = document.getElementById(\"preview\")\n  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document\n  preview.open()\n  preview.write(editor.getValue())\n  preview.close()\n}\nsetTimeout(updatePreview, 300)\n");
        $(".hide-demos, #codemirror").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=convertforvalues]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Convert for Values").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<textarea class=\"editor\" placeholder=\"Code with multiple lines here...\"></textarea>\n<textarea class=\"preview\" placeholder=\"Generated result here...\"></textarea>");
        cssEditor.setValue("body {\n  margin: 0;\n  background: #333;\n}\n\n.editor, .preview {\n  position: absolute;\n  width: 50%;\n  height: 100%;\n  padding: 0;\n  font-family: monospace;\n  min-height: 1.4em;\n  line-height: 1.4em;\n  font-size: 1em;\n  border: 0;\n  border-radius: 0;\n  resize: none;\n}\n\n.editor {\n  left: 0;\n  color: #0b0;\n  background-color: #000;\n}\n\n::-webkit-input-placeholder { /* WebKit browsers */\n  color: #0f6;\n}\n:-moz-placeholder { /* Mozilla Firefox 4 to 18 */\n  color: #0f6;\n}\n::-moz-placeholder { /* Mozilla Firefox 19+ */\n  color: #0f6;\n}\n:-ms-input-placeholder { /* Internet Explorer 10+ */\n  color: #0f6;\n}\n\n.preview {\n  right: 0;\n  background-color: #fff;\n}\n");
        jsEditor.setValue("$(document).ready(function() {\n  var editor = $(\".editor\"),\n      preview = $(\".preview\");\n  \n  // Remove new line and insert new line showing the text in value\n  editor.keyup(function() {\n    preview.val( this.value.replace(/\"/g,'\\\\\"').replace(/\\n/g,\"\\\\n\") )\n  }).click(function() {\n    this.select()\n  })\n  \n  // Easily Select Converted Code\n  preview.click(function() {\n    this.select()\n  })\n})\n");
        $(".hide-demos, #normalize, #jquery").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=dateclock]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Date and Time").change();
        if ($("#html-preprocessor").val() == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").change();
        }
        if ($("#css-preprocessor").val() == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("span.date(data-action='leftdate')\nspan.date.fr(data-action='rightdate')\n.clock(data-action='clock')");
        cssEditor.setValue(".date\n  font-family arial\n\n.fr\n  float right\n\n.clock\n  font bold 1.5em sans\n  text-align center");
        jsEditor.setValue("// Define a function to display the current time\nfunction displayTime() {\n  var now = new Date();\n  document.querySelector('[data-action=clock]').innerHTML =  now.toLocaleTimeString();\n  setTimeout(displayTime, 1000);\n}\ndisplayTime();\n\n// Date\nvar currentTime = new Date();\nvar month = currentTime.getMonth() + 1;\nvar date = currentTime.getDate();\nvar year = currentTime.getFullYear();\ndocument.querySelector('[data-action=leftdate]').innerHTML = month + '/' + date + '/' + year;\n\nvar today = new Date();\nif (year < 1000)\n  year += 1900;\nvar day = today.getDay();\nvar monthname = today.getMonth();\nif (date < 10)\n  date = '0' + date;\nvar dayarray = new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');\nvar montharray = new Array('January','February','March','April','May','June','July','August','September','October','November','December');\ndocument.querySelector('[data-action=rightdate]').innerHTML = dayarray[day] + ', ' + montharray[monthname] + ' ' + date + ', ' + year;\n");
        $(".hide-demos").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=detectorientation]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Detect Orientation").change();
        if ($("#html-preprocessor").val() == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").change();
        }
        if ($("#css-preprocessor").val() == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("h1.portrait Portrait\nh1.landscape Landscape\nfooter.foot");
        cssEditor.setValue("body\n  font 26px arial\n\n.portrait,\n.landscape,\n.foot\n  text-align center\n\n.foot\n  position absolute\n  bottom 0\n  left 0\n  right 0\n  padding 26px");
        jsEditor.setValue("var detectOrientation = function() {\n  if ( window.innerWidth > window.innerHeight ) {\n    document.querySelector(\".landscape\").style.display = \"block\"\n    document.querySelector(\".portrait\").style.display = \"none\"\n  } else if ( window.innerWidth < window.innerHeight ) {\n    document.querySelector(\".landscape\").style.display = \"none\"\n    document.querySelector(\".portrait\").style.display = \"block\"\n  }\n  document.querySelector(\".foot\").innerHTML =  window.innerWidth + \"px, \" + window.innerHeight + \"px\"\n}\n\nwindow.addEventListener(\"resize\", function() {\n  detectOrientation()\n})\n\ndetectOrientation()\n");
        $(".hide-demos").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=osdisplay]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Detect Operating System").change();
        if ($("#html-preprocessor").val() == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").change();
        }
        htmlEditor.setValue("div(data-output='os')");
        cssEditor.setValue("");
        jsEditor.setValue("yourOS = document.querySelector('[data-output=os]')\n\ndocument.addEventListener 'DOMContentLoaded', ->\n  yourOS.innerHTML = '<strong>Operating System</strong>: ' + navigator.platform");
        $(".hide-demos").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=markdowneditor]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Live Markdown Editor").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").change();
        }
        htmlEditor.setValue("<div class=\"editor-and-preview-container\">\n  <div class=\"editor-container\">Markdown Editor</div>\n  <div class=\"preview-container\">Preview</div>\n</div>\n<div class=\"editor-and-preview-container\">\n  <div class=\"editor-container\">\n    <textarea id=\"editor\">Welcome!\n===================\n\n![Placer text](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABOdSURBVHic7Z15lFTVtYe/36nqAZp5kBkbBREwPhNnQYWoKPLENoIoiOIYoyvGaMAsY5JCiRrHRNEoRmOMcQIRjVFARJOAUVGXkZCYFwdiDA5hULCB7q6++/3RdNNzDXeo6tZvLRZ969579q5zfrXPufdMop1hIPYaMwTHSIgN8RylIjYY0Ru5nqCeSMWgQqQS5EAqB1Ui7UBuI9hG5D4x6d/OaR3E3sW8v7P6sfcEluvvGCTKtQN+sb0OHYBnoz250UIHIu2D1BkJEEjsLOR6xynO1R03ObcVaY3JrXZoFc5bpVUPr8/l9/dLmxOAlY4thvKxnpggp+NAe9UVZLOFGKgAmp6T/mHoGedYQqduL+iZ2ypylzuZ0yYEYKNGFbI1Pt5T7BRJJyJ1abYgcyOA+uc/M7knnLlH2RZbptfmV+Uqz9IlrwVgA/cb5mHnyDETqU/KQs69AOqf+9jQI85pvp6/e21ucjA1eSkA6z9qjDldjjQRpF2Z36YEUO+YVZL7KSvuekp51ojMGwEYiH4jyszpR6D9ms3cNiuAun+vS7GrWH77k/kihLwQgPXda4JJVyPt36Qg25cAAAfSq0JXavm8pdHndkNyKgDrP3y4ed5NoIktFnL7FEDtv+VC39WyW/8afe7XkBMBWP/+HUkWX43cxSbFWy3k9iwAhElVyN3iuiihBbdsj7osXNQGrc8eR1NVtAZ0KRCP2n4eUgA229tqb1ZN+N7XozYeWQSw0tJiykkAs8C52l+BpfqVt/8IUP+cId3t4p2/q98ltkVRLpFEAOs+cF+2eq9idnlUNtsoAs73qstfshMuHxWFwdALw7oPOg2nF4FIvlD7wL7ied7q5MTZZ4ZtKbQqwCBGjwE3gi5pGiZ3hcFIq4DCQujZHXbrVfP/i69B0sunKqCpHcdNbv+Os5VIeGGUUygCMEYV0n3zb0CnNJ9JIQsgHoeRw+ArI9HQUigdCLsPhH59wO36yjbuNNi8Jb8FICGnx7WleJpeSOwIuqwCb4Vb796dSG56DNP4SB8ydx8I40ajcaPhq6OguDj1PYUF4fsVAGacROfKp21CokzPJLYEmXagArCS3fpQydOIrwWZbov06wOTjkWTjoPhe2Z+fxsRAIDBOCuoWmEnJY7X44lPgko3MAFYt76leN6zoKFBpdksMQdfPxydPgXGHATORzu2oO0IYCf7e5ZcaWWJ8VqcWBdEgoE8BVinvr2prl4ChFf4xUVwxlT0wmI0/yY44hB/hQ9tKgLUYQzzqF5uUxJ9g0jOtwCsR48ukFwCDA/An6bE43DWNLTy92jObBjYP7i0C0J8ESnBCUfC1PHQuSTo1Pf0kt5SK0t085uQLwEYFFKphaHV+aMPRs8uRInZ0Ktn8On7jSCtcfwYdOnp6ILJ6OFr4fTja8QcFMa+JhbZhFuL/CSTdQ4YOEp6PAAc48eBZnEO/eBS9Nu7YM8hgSdfh0J6TOneBV0wZddxhyJ01iR05xUwao/AzBg2zjpsetimPBrLNo3sfwIlPW4CpqS8LguUuBwuOCvcXyiEJgB9+zTo3LHpidJ+6GeXonPLIJ51mTXAoMyzt67J9v6scthKukwDuyRbo63SoRhmnhZK0k0Io/wP2ReOOqgVm4KpR6NbL4NBfYKxacxKTp57Yja3ZiwAK+m+L6a7szGWFj26h//LryXoCFBchC6dkd61QwehO2ahcfsHYVkyu8dOnTso0xszymmDYjzvAaCZ+BYQRb7aNBkSrAB0dhn07ZX+DUWF6PtnoPNOrHm/4Y+e1UktsPPvyujZNjOrHTrdAPaVjO7JlMLCUJNvQJARYMgAmDw+OzdOHod+fA4U+fvuwg72Nm24OpN70haAFZccjemizN3KEJ+ZkBFBlb+ELpnhq2GnA0fi5p4HJWn0YbSaELNtyjVHpnt5WgIw6Ai6k5B6DxsQpQCCamuMPwy+NsJ/OvvsgZt7PnTwVQ3KgzvSrQrSy4GikquBLHpbssAF83gUGSUd0IVTg0tv+GDcVedCsa8fwkhv86a0ntJSCsAKO40Avu3Hm7wlgDaAzp8CPX2/kW3IyFI0a5o//0TCpt24e6rL0ogA3s1AdL0mUY4h8MvwUjjpqFCS1sEj0VnH+0mioyWTN6a6qFUBWKzjBOA4P17kNX7aAE7ospmhvrPQN45Ah2Y/lNLE5KpTf9qqQlv03kA4m5O19baAn2jzv2NhVLhDHwD0rTJfjULhrmrtfMvyLSwsAw7M2nK2hNVBE6Strp3Qt04N1peW6N4ZjUhZlbeIsMPs1OsPb+l8ywIw/Shrq22G7ASgC6dB104B+9IClVXY2//xlYShK1s616wALF58NLCfL6ttgWwiwD7DasJ/RNjS1bCl3F8aMN6m3thsNG8hAniX+bLoh0irgAyvdw7NOqfB0PJQ2VKOPbQ8kKTMcUVznzcRgFE0DDg2EKvZkM9tgMnHwl6lobjSHHb/UtgazBRBgxNt6vVNXuY1jQBxO5e29TQeDT26ovNCGf/SPG9/gC1bHWSK8mLxsxt/2EAABgUYZwRpNWPyNALoO2eEMbizeczw7lwMXsCzwWRnN+4jaBgBYrHjwAIZbtwmSFcA+4+CY8eE60s97NnV8Nb7ISRM3+S28gYvhhpVAe6U4K1mSJQRIB1iMXTZ2dH5tWUb9qunQ0vemRr0XNUJwKAYbFJolvORdAp1+gkwdHD4vuzE7n7S92NfCgtlNiVR19W4KwLE42OBLiFaTo8oA0AqAfTphc6eHI0vAGvewVa8FraVbsmCrkfUHuwSgMeEsC3nHSnKX987Gzr6HKGTLlVJvNsWgoW/fKCT6jr46rcB8kQAefIUcOhXYezBkbliDy+Hfwc26TcFXl1ZOwCDAWDDIrKeR7QggMICNOvc6Nz4z3+xhc9FZw+NtNNv6Qd1ESAW3TNOKvLhVfDMk2FwgJNQW8MMu+1RqExGY28n1egwqBWAs8MitZ4vNCe2gX3RzG9E5oI9+wr2xj8js1eLYDTUCsAUfb9/PtCMADTrvOjmJmwpx375ZDS2GmFwEIAzcKFP9siEKKuAxr16Rx0GYw6IzLzNXwyffR6ZvfoI7WOYHLAHENHohjwjXu+1eHERurRJX0l4/PUdePaV6Ow1wboy7fbBDghgRkOARBkB6i0RowumQb/dorFb7WHzFkTyzN+qG3Eb6YAQV2DIc4p2CmDvPWF6hG/BFyyHd/0N8woCeVbqwGU/4rCNo/59YMyBaN6cYJdvaY2PNmIPLInGVmqGxMEG59X4jyirgOllaHpZdPYAu2MhVFTmR6+nY3cHRFTxpUke5EtorPoLvPhmrr2oQ0ZvB4Sw/NaXNKGiEvvFglx70QCDng7okWtHvgjYr5+Cjzbm2o1GqKcjzOVesiEf6sag+XADPLYi1140g3V0QIQrMqRBOxSA3bkQktF29qRJUf4JoL2x9l1Y+UauvWiJoi/37wkZu3dxzt/4tYYDKnPtRLsm6NVDgqUi/wSQx7+WbNDU8YEtCxsCFQ4Icwzyl+w5EKblyXDLppQ7YFOuvWhAO4sAAJoxEYZmvIprFGx0wIZce9HuiTk064y8qwokNuSfANpfAKhh6CA4JfitFfxgNRFAIcxC/JLm0IyJUBrRaON0MFvnwFuXaz8a0A7bAHUUxNH386gqMK1zwHu59uMLxdBBcHLku8Q3i4e954C/5dqRBrTnCLATnTkRdu+XazeIF8TX1kaAQLcj/ZIUFMTRZdOi2xmlWfQZv7rwA6eaRUH/mkNPGhJlBHjjb/Byjjpq9i6Fb4zNjW3AsDVCViNBWaCrEbUVbNVr2Dd/gM2dB170VY/OnAgDczMiT+JlqJ0a5mlVTrxojigjQEVFzf+PLYHfPB6d3VqKCnDfm56TqsB2lvlOy9X5I4Aoqayq+9N+8Vv4Vw7G6o8oRZNaXMo3NGIF8T/DTgEI1oP+L3Ivcs2Oil1/V1RiP/55bqqCsyZC/wx2G/PPWt130UfQcIWQZ6L0oGUiLIDKRj3hb74FC8JboatFigrRd6ZGNxxOu8p6lwBcvgggQqqajtOz2+6HDz6K3BXtOxQdf2gktjxzdVOTdgkgmXwB+CwSD1ojygjcXLjfvgP7yR05eSGlc0+AvqFP0/g0Xrn5T7UHdQIQVICeCNt6XtHSUqyr34QnglmlOyOKC9HFk0OuCmyRFiTq6r5Gzx/eoyFaTo8of3mt2LJb7oNPop/Iof2GoWPCW6TCQ4/UP24ogOrqpaAPQ7Oeb7S2GHP5Nuzau6LzpR46dxL06hpCwnwULyl5vv5HruF5koj7g7ecAVFGgFSPfCtfgyV/av2aMCgpRheFslDVPZr/zar6HzR9BZXUL8nluJxIq4DUy7HbzffC5ujbxjpwBDp83yCTNGfu3sYfNhGAqHibvHknEDLVaazH/+lW7MYm+RYJOn+S/82ka9OCp/Tgd99t/HkLL6HdTYFYzXfSjTbPvgh/yEF/WffOaGowO5PKvBua+7xZASi5YwXweiCWMyXSNkD6O3LY9b+ErdFPodCk0TDE3+ARg5f18OxmGzMtd0PJWt1xMjTyqRFYnw2bsdsfDM+Xlog5dPBIf2m4lsuyRQGosvIJIJcL2YVPGo3ABjzxHLwe8Qi6rduwZ17O+naD1bEHZ7XYpmu9I9pc+949NNOePzPsJ3fC9orU1wZBshq7/kFfq4ma9H2hFr9oqwJQsnwpEG33WJQPoNlUN+s/we55LHhfmsHmP4m98baPFPRIwUOzWl2aJPVQFFV/h3ybQRwU2W7L9tDv4e9NnqgCxRb/EXv6JT9JbHVeVcodYFMKQBUVbwM/8+NJRuRrI7DBfR527d2QrA7Wn53YqjXYvT4Dr1lCC65MOcQpvcFoFeUJwE8sSh8vnExtlkwbgfV5+3144HfB+bITe/Ut7Prf+t00cq3r3vO2dC5MSwCC7cA3iaKGroiwtvE5/MvuWwzr1gfkDNjr/8Dm/tpvZPGc8a3G7/xbIu3hqNrx+Qpkt2bvV5pEKgCfW7NWJbFr5geyxav9eQ02594GA1WzS8iu08Ir0u7Bymw88vbPLwf7S8ZOZUJFRI9YEEx742/vwCJ/Gz7Zohewuff53jfIxEuuR+9EJvdkJABBBTGbTpjLyjQeqBkmAY0AtrsWwEdZLLNQUYVd/5uanUP8RhFjQ6w6OSXd0F9LxjMS9PnnazHNIKz2wMbNobWumxDU7tzbd2A33JfZPe+txy6+CXvu1SA8MINztCjxQaY3ZjUlRds/fRzs5mzuTUlFBcy7O5SkmxDkI+cra2DJyvRsPrYC+/aN8F5ADUjZdfFFP8xq96ns5ySVfzobeCTldVlgN87DfnQtVPlsEKUiqAiwE5v3EGxqZfDIug+xS27G7lzkv7G3i4fdPnZltjdnLQCBR/mmGcDSbNNolV89iI0/GZY9n/rabAn6pdOWcuzae5qmu20Hds9i7IJrapaODQjBCre9x0wlElkr2desREEVxZoChLPl9TvrsHMvwaaeA2+G0AsXcAQA4OU18Oiymr+3bYdFK7AZP4QHlwS6YLTBq4rrRD1zsa/HpkAGoFvn/r2gaiXScCSQq0la9f7VP8bV/W2NzzW+t/Zv5+CoI9GZU2HMwYGMnbcJM+HD/zb1r+7YpT7X5LsJYjHYYyCs3wA7Khvd2/A+a+lcK3mG9I7zqkfryWs+9psHgc1AsG59S/G8ZUjDQhFA/XOlg9GpZTC1DLp1yd7nY8+AjzcGL4CWzgUhAKd/OmfHaNFP/pX1F69HoFNQrPOAnrjkU8gdEqoAao87lcBRR6DxR8IRh0LHDpn5O34GfLKpzQjApFdjsYKJejwR2D7zgQoAwHr37kQyvhDTsaELoP754mIYfRA65gg4ZH8Y0De1r6MnQ/n2NiEAoRVKFp2kZxKBrucUuAAAjFGFdN38a5xOjUwAjc917QIjhsHIYWjvYbDXHjU7g3btXONkMokdMGnXPXksAIlF2tphul5I7Ai6rEIRAICBo/vAaxGzkBS5ABqfqz3u2AEG9IFOnWrWA0inkHMnAEPuOndA8ZV+HvVaIzQB1GI9+x8NsQdAffJCAOmcyw8BbDBxZvypG0Idkhf66kTauH455h2ASOM96ZcAGPaKq44dGHbhQwQCANCm/3zAhvfHgeYAoYSydoIhuzX28dYxWnLduigMhl4FNMZ6lR4J7nacRn1ZBTSoAtY400Vaekuk05EjX6BOG9b9gQ2D90N2CbA1avt5yDakOa5ztwOiLnzIQQSoj/Ua3t+L23WCGV/ICGDuKaGLtPzn70ef+zXkVAC1WJ+9jjKnHyMd/sUQgHtJjh9o2byc7yebFwKoxfqNOMKkK1C9t4jtSwCvyIvN0fO352AxwubJKwHUYgNG/Y8nXSZpGijWxgVgSM9JulUr7gp+IoFP8lIAtVj/fQYR1zQzXYhzg9uYAD40cb9zsbu1Yv47ucnB1OS1AGoxxsYp3XK0B1OFypC65akANhssdrhHiO3+nF5I5OWW4fVpEwKoj40aVci2Dkd64jjJHQcamVsBsNbMLXFOS9i8/Y9au6BNTaRtcwJojJUe2JcCN9qTGy3PHYTTPkhdQxLAZ8itMVjtcCsxW6WXH/I9KieXtHkBNIftPbYUz0YQY4iHK8UxWLjdQD2ReiJ1BMWROu8s5K2gJNI2pI1IG834GOf+7eTeA/ceBdV/14uL/pXr7xY0/w8REJPfjzLKBgAAAABJRU5ErkJggg==)  \n\nHey! I'm your placement Markdown text.\n\n----------\n\n\nTypography\n-------------\n\n[kodeWeave Link](http://kodeweave.sourceforge.net/)  \n**bold text**  \n*italic text*  \n\n### Blockquote:\n\n> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n### Bullet List\n\n - Green\n - Eggs\n - and\n - Ham\n\n### Numbered List\n\n 1. Green\n 2. Eggs\n 3. and\n 4. Ham\n</textarea>\n  </div>\n  <div class=\"preview-container\">\n    <div id=\"preview\"></div>\n  </div>\n</div>");
        cssEditor.setValue("* {\n  box-sizing: border-box;\n}\n\nbody {\n  line-height: 1.4;\n}\n\n.editor-and-preview-container {\n  padding: 1em;\n  width: 100%;\n  height: 100%;\n}\n\n.editor-container, .preview-container {\n  display: inline;\n  overflow: hidden;\n  float: left;\n  width: 50%;\n  height: 100%;\n}\n\n#editor {\n  display: inline-block;\n  width: 100%;\n  height: 500px;\n  resize: none;\n  padding: 1em;\n  line-height: 1.5;\n}\n#editor:focus {\n  outline: none;\n}\n\n#preview {\n  width: 100%;\n  height: 500px;\n  border: 1px green solid;\n  padding: 0 1em;\n  overflow: auto;\n}");
        jsEditor.setValue("mdconverter = new (Showdown.converter)\neditor = $('#editor')\npreview = $('#preview')\n\nupdatePreview = ->\n  preview.html mdconverter.makeHtml(editor.val())\n\nupdatePreview()\neditor.on 'keyup', ->\n  updatePreview()");
        $(".hide-demos, #normalize, #jquery, #showdown").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=keylogger]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Keylogger").change();
        if ($("#html-preprocessor").val() == "none") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("jade").change();
        }
        if ($("#css-preprocessor").val() == "none") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("stylus").change();
        }
        if ($("#js-preprocessor").val() == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").change();
        }
        htmlEditor.setValue(".container-fluid\n  .row\n    .col-lg-12\n      input.form-control(type='text', data-action='input', placeholder='Type here for keyCode')");
        cssEditor.setValue("html, body\n  height 100%\n\nbody\n  padding 1em 0\n  background #0072ff\n\n.form-control\n  border-radius 5px\n  box-shadow 0 0 25px #00162d");
        jsEditor.setValue("$('[data-action=input]').keydown (e) ->\n  @value = e.which\n  e.preventDefault()\n");
        $(".hide-demos, #jquery, #bootstrap").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=newdocument]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("site title").change();
        $("[data-action=sitedesc]").val("sample description").change();
        $("[data-action=siteauthor]").val("kodeWeave").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        mdEditor.setValue("");
        htmlEditor.setValue("");
        cssEditor.setValue("");
        jsEditor.setValue("");
        if ($("input[name=menubar].active").is(":visible")) {
          $(".hide-demos").trigger("click");
        }
        callCollabUpdate();
      });
      $("[data-action=packagezipfiles]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Package Zip Files [JSZip Demo]").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "none") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("coffeescript").change();
        }
        htmlEditor.setValue("<div class=\"grid\">\n  <div class=\"grid__col--12\">\n    <button class=\"btn--default download\">Run</button>\n    <textarea class=\"form__input\" id=\"jszipdemo\" rows=\"7\" placeholder=\"Demo code here...\">var zip = new JSZip();\nzip.file(\"Hello.txt\", \"Hello World\");\nvar folder = zip.folder(\"images\");\nfolder.file(\"folder.txt\", \"I'm a file in a new folder\");\nvar content = zip.generate({type:\"blob\"});\n// see FileSaver.js\nsaveAs(content, \"example.zip\");</textarea>\n  </div>\n</div>\n");
        cssEditor.setValue("");
        jsEditor.setValue("$('.download').click ->\n  setTimeout $('#jszipdemo').val(), 0");
        $(".hide-demos, #polyui, #jquery, #jszip").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=passwordgen]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Password Generator").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<div class=\"container-fluid\">\n  <div class=\"row\">\n    <div class=\"col-lg-12\">\n      <div class=\"input-group\">\n        <input type=\"text\" class=\"form-control\" data-action=\"genoutput\" />\n        <span class=\"input-group-btn\">\n          <button class=\"btn btn-default btn-primary\" type=\"button\" data-action=\"gen\">\n            Generate!\n          </button>\n        </span>\n      </div>\n    </div>\n  </div>\n</div>");
        cssEditor.setValue("html, body {\n  height: 100%;\n}\n\nbody {\n  padding: 1em 0;\n  background: #0072ff;\n}\n\n.input-group {\n  box-shadow: 0 0 25px #00162d;\n}\n\n.input-group, .form-control, .input-group-btn, .btn {\n  border-radius: 5px;\n}");
        jsEditor.setValue("function PasswordGen() {\n  var char = \"0123456789abcdefghijklmnopqrstuvwxyz\",\n  fullchar = \"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\",\n  genHash  = \"\",\n             i;\n\n  for (i = 0; i < 8; i++) {\n    var rnum = Math.floor(Math.random() * char.length)\n    genHash += char.substring(rnum, rnum + 1)\n  }\n\n  $(\"[data-action=genoutput]\").val(genHash)\n}\n\n$(\"[data-action=gen]\").click(function() {\n  PasswordGen()\n})\n\nPasswordGen()");
        $(".hide-demos, #jquery, #bootstrap").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=pdfembed]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Embed a PDF Example").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<embed width=\"100%\" height=\"100%\" name=\"plugin\" src=\"http://www.usconstitution.net/const.pdf\" type=\"application/pdf\">");
        cssEditor.setValue("html, body {\n  height: 100%;\n  overflow: hidden;\n}");
        jsEditor.setValue("");
        $(".hide-demos, #normalize").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=pictureviewer]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("FileReader Picture Viewer").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<div id=\"holder\">\n  Drag and drop image <a data-action=\"call\" href=\"javascript:void()\">here</a>...\n</div> \n\n<div class=\"fill check hide\" align=\"center\">\n  <canvas class=\"logo\" width=\"128\" height=\"128\"></canvas>\n</div>\n\n<div class=\"hide\">\n  <input type=\"file\" data-action=\"load\">\n</div>\n\n<p id=\"status\">\n  File API &amp; FileReader API not supported\n</p>");
        cssEditor.setValue("#holder {\n  border: 10px dashed #ccc;\n  margin: 20px auto;\n  text-align: center;\n}\n#holder.hover {\n  border: 10px dashed #333;\n}\n\n.hide {\n  display: none;\n}\n.fill {\n  width: 100%;\n}");
        jsEditor.setValue("var canvas = $(\".logo\"),\n    ctx = canvas[0].getContext(\"2d\"),\n    holder = document.getElementById(\"holder\"),\n    state = document.getElementById(\"status\");\n\nif (typeof window.FileReader === \"undefined\") {\n  state.className = \"fail\"\n} else {\n  state.className = \"success\"\n  state.innerHTML = \"File API & FileReader available\"\n}\n\nfunction displayPreview(file) {\n  var reader = new FileReader()\n\n  reader.onload = function(e) {\n    var img = new Image()\n    img.src = e.target.result\n    img.onload = function() {\n      // x, y, width, height\n      ctx.clearRect(0, 0, 128, 128)\n      ctx.drawImage(img, 0, 0, 128, 128)\n    }\n  }\n  reader.readAsDataURL(file)\n}\n\n$(\"[data-action=call]\").click(function() {\n  $(\"[data-action=load]\").trigger(\"click\")\n})\n\n$(\"[data-action=load]\").change(function(e) {\n  var file = e.target.files[0]\n  displayPreview(file)\n  $(\".check\").removeClass(\"hide\")\n})\n\n// Drag and drop image load\nholder.ondragover = function () {\n  this.className = \"hover\"\n  return false\n}\nholder.ondragend = function () {\n  this.className = \"\"\n  return false\n}\nholder.ondrop = function(e) {\n  this.className = \"\"\n  e.preventDefault()\n  var file = e.dataTransfer.files[0]\n  displayPreview(file)\n  $(\".check\").removeClass(\"hide\")\n}");
        $(".hide-demos, #jquery").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=polyui]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Poly UI Kit").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<div class=\"grid\">\n  <header class=\"grid__col--12 panel--padded--centered\" role=\"banner\"> \n    <a class=\"site-logo\" href=\"javascript:void(0)\">\n      <b class=\"srt\">Poly - UI Toolkit</b>\n    </a>\n    <nav class=\"navbar\" role=\"navigation\">\n      <span id=\"toggle\" class=\"icn--nav-toggle is-displayed-mobile\">\n        <b class=\"srt\">Toggle</b>\n      </span>   \n      <ul class=\"nav is-collapsed-mobile\" role=\"navigation\">\n        <li class=\"nav__item\"><a href=\"#type\">Typography</a></li>\n        <li class=\"nav__item\"><a href=\"#buttons\">Buttons</a></li>\n        <li class=\"nav__item\"><a href=\"#forms\">Form</a></li>\n        <li class=\"nav__item\"><a href=\"#images\">Images</a></li>\n        <li class=\"nav__item\"><a href=\"#grid\">Grid</a></li>\n        <li class=\"nav__item--current\"><a href=\"#nav\">Navigation</a></li>\n        <!-- Current Page Class Style -->\n        <!-- <li class=\"nav__item--current\"><a href=\"#nav\">Navigation</a></li> -->\n      </ul>\n    </nav>\n  </header>\n</div>\n\n<div class=\"grid is-hidden-mobile\">\n  <div class=\"grid__col--12\">\n    <img class=\"img--hero\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/hero.jpg\" alt=\"Poly - A simple UI Kit\">\n  </div>\n</div>\n\n<h4 id=\"type\" class=\"grid\">Typography</h4>\n\n<div class=\"grid\">\n  <div class=\"centered grid__col--8\">\n    <h1 class=\"headline-primary--grouped\">Take a look at this amazing headline</h1>\n    <h2 class=\"headline-secondary--grouped\">Don't forget about the subtitle</h2>\n    <p>This is a typical paragraph for the UI Kit. <a href=\"#\">Here is what a link might look like</a>. The typical font family for this kit is Helvetica Neue.  This kit is intended for clean and refreshing web layouts. No jazz hands here, just the essentials to make dreams come true, with minimal clean web design. The kit comes fully equipped with everything from full responsive media styling to buttons to form fields. <em>I enjoy using italics as well from time to time</em>. Fell free to create the most amazing designs ever with this kit. I truly hope you enjoy not only the kit but this amazing paragraph as well. :)</p>\n    <blockquote>You know what really gets me going? A really nice set of block quotes.  That's right, block quotes that say, \"Hey, I'm an article you want to read and nurture.\"</blockquote>\n  </div>\n</div>\n\n<h4 id=\"buttons\" class=\"grid\">Buttons</h4>\n\n<div class=\"grid\">\n  <div class=\"grid__col--12\">\n    <a class=\"btn--default\" href=\"#\">Button Default</a>\n    <a class=\"btn--success\" href=\"#\">Button Success</a>\n    <a class=\"btn--error\" href=\"#\">Button Error</a>\n    <button class=\"btn--warning\">Button Warning</button>\n    <button class=\"btn--info\">Button Info</button>\n  </div>\n</div>\n\n<h4 id=\"forms\" class=\"grid\">Form Elements</h4>\n\n<div class=\"grid\">\n  <div class=\"grid__col--7\"> \n    <form class=\"form\">\n      <label class=\"form__label--hidden\" for=\"name\">Name:</label> \n      <input class=\"form__input\" type=\"text\" id=\"name\" placeholder=\"Name\">\n\n      <label class=\"form__label--hidden\" for=\"email\">Email:</label>\n      <input class=\"form__input\" type=\"email\" id=\"email\" placeholder=\"email@website.com\">\n\n      <label class=\"form__label--hidden\" for=\"msg\">Message:</label>\n      <textarea class=\"form__input\" id=\"msg\" placeholder=\"Message...\" rows=\"7\"></textarea>\n\n      <input class=\"btn--default\" type=\"submit\" value=\"Submit\">\n      <input class=\"btn--warning\" type=\"reset\" value=\"Reset\">\n    </form>\n  </div>\n  <div class=\"grid__col--4\">\n    <img class=\"img--avatar\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/avatar.png\" alt=\"Avatar\">\n    <form>\n      <label class=\"form__label--hidden\" for=\"username\">Username:</label> \n      <input class=\"form__input\" type=\"text\" id=\"username\" placeholder=\"Username\">\n      <label class=\"form__label--hidden\" for=\"password\">Password:</label>\n      <input class=\"form__input\" type=\"password\" id=\"password\" placeholder=\"Password\">\n      <input class=\"form__btn\" type=\"submit\" value=\"Login\">\n    </form>\n  </div>\n</div>\n\n<h4 id=\"images\" class=\"grid\">Images</h4>\n\n<div class=\"grid\">\n  <div class=\"grid__col--5\">\n    <img src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/sample.jpg\" alt=\"sample image\">\n  </div>\n  <div class=\"grid__col--5\">\n    <img class=\"img--wrap\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/sample.jpg\" alt=\"sample image\">\n  </div>\n  <div class=\"grid__col--2\">\n    <img class=\"img--avatar\" src=\"http://treehouse-code-samples.s3.amazonaws.com/poly/img/avatar.png\" alt=\"Avatar\">\n  </div>\n</div>\n\n<h4 id=\"grid\" class=\"grid\">Grid System</h4>\n\n<div class=\"theme__poly\">\n  <div class=\"grid\">\n    <div class=\"grid__col--12\">.grid__col--12</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--6\">.grid__col--6</div>\n    <div class=\"grid__col--6\">.grid__col--6</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--4\">.grid__col--4</div>\n    <div class=\"grid__col--4\">.grid__col--4</div>\n    <div class=\"grid__col--4\">.grid__col--4</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--3\">.grid__col--3</div>\n    <div class=\"grid__col--3\">.grid__col--3</div>\n    <div class=\"grid__col--3\">.grid__col--3</div>\n    <div class=\"grid__col--3\">.grid__col--3</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--5\">.grid__col--5</div>\n    <div class=\"grid__col--7\">.grid__col--7</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"grid__col--8\">.grid__col--8</div>\n    <div class=\"grid__col--4\">.grid__col--4</div>\n  </div>\n  <div class=\"grid\">\n    <div class=\"centered grid__col--7\">.centered .grid__col--7</div>\n  </div>\n</div>\n\n<div class=\"grid\">\n  <div class=\"grid__col--7\">\n    <h4 id=\"nav\">Navigation</h4>\n    <ul class=\"nav\" role=\"navigation\">\n      <li class=\"nav__item\"><a href=\"#\">Nav Link</a></li>\n      <li class=\"nav__item\"><a href=\"#\">Nav Link 2</a></li>\n      <li class=\"nav__item--current\"><a href=\"#\">Nav Current</a></li>\n    </ul>\n    <p>This is what the navigation menu looks like when the screen is at 769px or higher. When the screen is less than 769px, you will have the option to display a toggle menu icon.</p>\n  </div>\n\n  <div class=\"grid__col--4\">\n    <h4>Offcanvas Menu</h4>\n    <div class=\"offcanvas\">\n      <span class=\"icn--close\">\n        <b class=\"srt\">close</b>\n      </span>\n      <ul class=\"menu\" role=\"navigation\">\n        <a class=\"menu__link\" href=\"#\">Link 1</a>\n        <a class=\"menu__link\" href=\"#\">Link 2</a>\n        <a class=\"menu__link\" href=\"#\">Link 3</a>\n        <a class=\"menu__link--end\" href=\"#\">Link 4</a>\n      </ul>\n    </div>\n  </div>\n</div>");
        cssEditor.setValue("");
        jsEditor.setValue("// Toggle Menu for Phones\n$(\"#toggle\").click(function() {\n  $(this).next(\".nav\").toggleClass(\"is-collapsed-mobile\")\n})\n\n// Handles Navigation Style Classes\n$(\".nav__item\").on(\"click\", function() {\n  $(this).parent().find(\"li\").removeClass(\"nav__item--current\").addClass(\"nav__item\")\n  $(this).addClass(\"nav__item--current\").removeClass(\"nav__item\")\n})");
        $(".hide-demos, #polyui, #jquery").trigger("click");
        callCollabUpdate();
      });

      $("[data-action=simpleslideshow]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("Simplest jQuery Slideshow").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        htmlEditor.setValue("<div class=\"fadelinks\">\n  <a>\n    <img src=\"http://farm3.static.flickr.com/2610/4148988872_990b6da667.jpg\">\n  </a>\n  <a>\n    <img src=\"http://farm3.static.flickr.com/2597/4121218611_040cd7b3f2.jpg\">\n  </a>\n  <a>\n    <img src=\"http://farm3.static.flickr.com/2531/4121218751_ac8bf49d5d.jpg\">\n  </a>\n</div>\n");
        cssEditor.setValue("body {\n  font-family: arial, helvetica, sans-serif;\n  font-size: 12px;\n}\n\n.fadelinks {\n  position: relative;\n  height: 332px;\n  width: 500px;\n}\n\n.fadelinks > a {\n  display: block;\n  position: absolute;\n  top: 0;\n  left: 0;\n}");
        jsEditor.setValue("$(document).ready(function() {\n  $(\".fadelinks > :gt(0)\").hide()\n  setInterval(function() {\n    $(\".fadelinks > :first-child\").fadeOut().next().fadeIn().end().appendTo(\".fadelinks\")\n  }, 3000)\n})");
        $(".hide-demos, #normalize, #jquery").trigger("click");
        callCollabUpdate();
      });
      $("[data-action=splitter]").on("click", function() {
        clearPreview();
        $(".check").attr("checked", false).trigger("change");
        $("[data-action=library-code]").val("").change();
        $("[data-action=sitetitle]").val("JQWidgets Splitter").change();
        if ($("#html-preprocessor").val() == "jade") {
          htmlEditor.setValue("");
          $("#html-preprocessor").val("none").change();
        }
        if ($("#css-preprocessor").val() == "stylus") {
          cssEditor.setValue("");
          $("#css-preprocessor").val("none").change();
        }
        if ($("#js-preprocessor").val() == "coffeescript") {
          jsEditor.setValue("");
          $("#js-preprocessor").val("none").change();
        }
        
        htmlEditor.setValue("<div id=\"mainSplitter\">\n  <div>\n    <div id=\"firstNested\">\n      <div>\n        <div id=\"secondNested\">\n          <div>\n            <span>Panel 1</span></div>\n          <div>\n            <span>Panel 2</span></div>\n        </div>\n      </div>\n      <div>\n        <span>Panel 3</span></div>\n    </div>\n  </div>\n  <div>\n    <div id=\"thirdNested\">\n      <div>\n        <span>Panel 4</span></div>\n      <div>\n        <span>Panel 5</span></div>\n    </div>\n  </div>\n</div>\n");
        cssEditor.setValue("");
        jsEditor.setValue("$(document).ready(function () {\n  $(\"#mainSplitter\").jqxSplitter({\n    width: 850,\n    height: 850,\n    orientation: \"horizontal\",\n    panels: [{\n      size: 300,\n      collapsible: false\n    }]\n  });\n  $(\"#firstNested\").jqxSplitter({\n    width: \"100%\",\n    height: \"100%\",\n    orientation: \"vertical\",\n    panels: [{\n      size: 300,\n      collapsible: false\n    }]\n  });\n  $(\"#secondNested\").jqxSplitter({\n    width: \"100%\", \n    height: \"100%\", \n    orientation: \"horizontal\",\n    panels: [{ size: 150 }]\n  });\n  $(\"#thirdNested\").jqxSplitter({\n    width: \"100%\",\n    height: \"100%\", \n    orientation: \"horizontal\",\n    panels: [{\n      size: 150,\n      collapsible: false\n    }]\n  });\n});\n");
        $(".hide-demos, #jquery, #jqxsplitter").trigger("click");
        callCollabUpdate();
      });
    },
    activateMD = function() {
      activeEditor.val("mdEditor");
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
      $("#undo").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.undo();
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.undo();
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.undo();
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.undo();
        }
      });
      $("#redo").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.redo();
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.redo();
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.redo();
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.redo();
        }
      });
      $("#tabindent").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("indentMore");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("indentMore");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("indentMore");
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.execCommand("indentMore");
          mdEditor.focus();
        }
      });
      $("#taboutdent").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("indentLess");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("indentLess");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("indentLess");
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          mdEditor.execCommand("indentLess");
          mdEditor.focus();
        }
      });
      $("#zeninit").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          htmlEditor.execCommand("emmet.expand_abbreviation_with_tab");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          cssEditor.execCommand("emmet.expand_abbreviation_with_tab");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          jsEditor.execCommand("emmet.expand_abbreviation_with_tab");
          jsEditor.focus();
        }
      });
      $("#charsym1").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection("<" + selected_text + ">");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          var selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection("<" + selected_text + ">");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection("<" + selected_text + ">");
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("<" + selected_text + ">");
          mdEditor.focus();
        }
      });
      $("#charsym2").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection("{" + selected_text + "}");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          var selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection("{" + selected_text + "}");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection("{" + selected_text + "}");
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("{" + selected_text + "}");
          mdEditor.focus();
        }
      });
      $("#charsym3").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection('"' + selected_text + '"');
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          var selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection('"' + selected_text + '"');
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection('"' + selected_text + '"');
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection('"' + selected_text + '"');
          mdEditor.focus();
        }
      });
      $("#charsym4").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection("'" + selected_text + "'");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          var selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection("'" + selected_text + "'");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection("'" + selected_text + "'");
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("'" + selected_text + "'");
          mdEditor.focus();
        }
      });
      $("#charsym5").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection("(" + selected_text + ")");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          var selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection("(" + selected_text + ")");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection("(" + selected_text + ")");
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("(" + selected_text + ")");
          mdEditor.focus();
        }
      });
      $("#charsym6").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection("[" + selected_text + "]");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          var selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection("[" + selected_text + "]");
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection("[" + selected_text + "]");
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("[" + selected_text + "]");
          mdEditor.focus();
        }
      });
      $("#function").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection("function() {}");
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          alertify.alert("Can't add <strong>\"function() {}\"</strong> into CSS");
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection("function() {}");
          jsEditor.focus();
        }
      });
      $("[data-add=sym]").on("click", function() {
        if ( activeEditor.val() === "htmlEditor" ) {
          var selected_text = htmlEditor.getSelection();  // Need to grab the Active Selection

          htmlEditor.replaceSelection(selected_text + this.textContent);
          htmlEditor.focus();
        } else if ( activeEditor.val() === "cssEditor" ) {
          var selected_text = cssEditor.getSelection();  // Need to grab the Active Selection

          cssEditor.replaceSelection(selected_text + this.textContent);
          cssEditor.focus();
        } else if ( activeEditor.val() === "jsEditor" ) {
          var selected_text = jsEditor.getSelection();  // Need to grab the Active Selection

          jsEditor.replaceSelection(selected_text + this.textContent);
          jsEditor.focus();
        } else if ( activeEditor.val() === "mdEditor" ) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection(selected_text + this.textContent);
          mdEditor.focus();
        }
      });

      // WYSIWYG Editor for Markdown
      $("#lorem").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam impedit dolore magnam dolor, atque quia dicta voluptatum. Nam impedit distinctio, tempore molestiae voluptatibus ducimus ullam! Molestiae consectetur, recusandae labore? Cupiditate.");
        mdEditor.focus();
      });
      $("#bold").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("**" + selected_text + "**");
        mdEditor.focus();
      });
      $("#italic").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("*" + selected_text + "*");
        mdEditor.focus();
      });
      $("#strike").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("<strike>" + selected_text + "</strike>");
        mdEditor.focus();
      });
      $("#anchor").on("click", function() {
        alertify.prompt("Enter URL Below", "",
        function(evt, value) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("")
          mdEditor.replaceSelection("["+ selected_text +"]("+ value +")");
          mdEditor.focus();
        },
        function() {
          // User clicked cancel
        }).set('basic', true);
      });
      $("#quote").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("\n  > " + selected_text.replace(/\n/g,'\n  > '));
        mdEditor.focus();
      });
      $("#code").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("`" + selected_text + "`");
        mdEditor.focus();
      });
      $("#img").on("click", function() {
        alertify.prompt("Enter Image URL Below", "",
        function(evt, value) {
          var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

          mdEditor.replaceSelection("");
          mdEditor.replaceSelection("!["+ selected_text +"]("+ value +")");
          mdEditor.focus();
        },
        function() {
          // User clicked cancel
        }).set('basic', true);
      });
      $("#list-ol").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        var i, len, text;
        for (i = 0, len = selected_text.split("\n").length, text = ""; i < len; i++) {
            text += i + 1 + ". " + selected_text.split("\n")[i] + "\n  ";
        }
        mdEditor.replaceSelection("\n  " + text);
        mdEditor.focus();
      });
      $("#list-ul").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("\n  - " + selected_text.replace(/\n/g,'\n  - '));
        mdEditor.focus();
      });
      $("#h1").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("# " + selected_text);
        mdEditor.focus();
      });
      $("#h2").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("## " + selected_text);
        mdEditor.focus();
      });
      $("#h3").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("### " + selected_text);
        mdEditor.focus();
      });
      $("#h4").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("#### " + selected_text);
        mdEditor.focus();
      });
      $("#h5").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("##### " + selected_text);
        mdEditor.focus();
      });
      $("#h6").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection("###### " + selected_text);
        mdEditor.focus();
      });
      $("#hr").on("click", function() {
        var selected_text = mdEditor.getSelection();  // Need to grab the Active Selection

        mdEditor.replaceSelection(selected_text + "\n\n----------\n\n");
        mdEditor.focus();
      });
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
}

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
    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()) },
    "Ctrl-'": function(){ applyLowercase() },
    "Ctrl-\\": function(){ applyUppercase() },
    "Cmd-'": function(){ applyLowercase() },
    "Cmd-\\": function(){ applyUppercase() },
    "Shift-Ctrl-'": function(){ applyMinify() },
    "Shift-Ctrl-\\": function(){ applyBeautify() },
    "Shift-Cmd-'": function(){ applyMinify() },
    "Shift-Cmd-\\": function(){ applyBeautify() }
  },
  value: "<!-- comment -->\nhello world!",
  paletteHints: true
});
Inlet(htmlEditor);
emmetCodeMirror(htmlEditor);
var cssEditor = CodeMirror(document.getElementById("cssEditor"), {
  mode: "text/css",
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
    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()) },
    "Ctrl-'": function(){ applyLowercase() },
    "Ctrl-\\": function(){ applyUppercase() },
    "Cmd-'": function(){ applyLowercase() },
    "Cmd-\\": function(){ applyUppercase() },
    "Shift-Ctrl-'": function(){ applyMinify() },
    "Shift-Ctrl-\\": function(){ applyBeautify() },
    "Shift-Cmd-'": function(){ applyMinify() },
    "Shift-Cmd-\\": function(){ applyBeautify() }
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
    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()) },
    "Ctrl-'": function(){ applyLowercase() },
    "Ctrl-\\": function(){ applyUppercase() },
    "Cmd-'": function(){ applyLowercase() },
    "Cmd-\\": function(){ applyUppercase() },
    "Shift-Ctrl-'": function(){ applyMinify() },
    "Shift-Ctrl-\\": function(){ applyBeautify() },
    "Shift-Cmd-'": function(){ applyMinify() },
    "Shift-Cmd-\\": function(){ applyBeautify() },
    "Ctrl-Space": "autocomplete"
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
    "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()) },
    "Ctrl-'": function(){ applyLowercase() },
    "Ctrl-\\": function(){ applyUppercase() },
    "Cmd-'": function(){ applyLowercase() },
    "Cmd-\\": function(){ applyUppercase() },
    "Shift-Ctrl-'": function(){ applyMinify() },
    "Shift-Ctrl-\\": function(){ applyBeautify() },
    "Shift-Cmd-'": function(){ applyMinify() },
    "Shift-Cmd-\\": function(){ applyBeautify() }
  }
});

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
var openHTML = CodeMirror(document.querySelector("#openHTML"), {
  mode: "text/html",
  value: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>"
});
var sitedesc = ( $("[data-action=sitedesc]").val() === "" ? "" : "    <meta name=\"description\" content=\""+ $("[data-action=sitedesc]").val() +"\">\n" );
var siteauthor = ( $("[data-action=siteauthor]").val() === "" ? "" : "    <meta name=\"author\" content=\""+ $("[data-action=siteauthor]").val() +"\">\n" );
var closeHTML = CodeMirror(document.querySelector("#closeHTML"), {
  mode: "text/html",
  value: "</title>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"initial-scale=1.0\">\n" + sitedesc + siteauthor + "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\" />\n"
});
var closeRefs = CodeMirror(document.querySelector("#closeRefs"), {
  mode: "text/html",
  value: "  </head>\n  <body>\n"
});
var closeFinal = CodeMirror(document.querySelector("#closeFinal"), {
  mode: "text/html",
  value: "\n  </body>\n</html>"
});

$("[data-action=sitedesc], [data-action=siteauthor]").bind("keyup change", function() {
  var sitedesc = ( $("[data-action=sitedesc]").val() === "" ? "" : "    <meta name=\"description\" content=\""+ $("[data-action=sitedesc]").val() +"\">\n" );
  var siteauthor = ( $("[data-action=siteauthor]").val() === "" ? "" : "    <meta name=\"author\" content=\""+ $("[data-action=siteauthor]").val() +"\">\n" );
  closeHTML.setValue("</title>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"initial-scale=1.0\">\n" + sitedesc + siteauthor + "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\" />\n");
  updatePreview();
});

$(".clear_input").click(function() {
  $("[data-action=sitedesc], [data-action=siteauthor]").trigger("change");
});

// Render Chosen CSS Preprocessor
function cssPreProcessor(cssSelected) {
  var cssSelected = $("#css-preprocessor  option:selected").val();

  if (cssSelected == "none") {
    cssContent = cssEditor.getValue();
  } else if (cssSelected == "stylus") {
    var cssVal = cssEditor.getValue();
    stylus(cssVal).render(function(err, out) {
      if(err != null) {
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
  frame.setAttribute("sandbox", "allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts");
  document.querySelector(".preview-editor").appendChild(frame);
  var previewFrame = document.getElementById("preview");
  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  var heading = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + $("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\">\n" + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\">\n";
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
    var htmlContent = heading + "<style id='b8c770cc'>" + cssContent + "</style>" + closeRefs.getValue() + "\n" + htmlEditor.getValue() + "\n\n    " + jsContent + closeFinal.getValue();
    preview.write(htmlContent);
  } else if ( htmlSelected == "jade") {
    var options = {
        pretty: true
    }
    var jade2HTML = jade.render(htmlEditor.getValue(), options);
    var htmlContent = heading + "<style id='b8c770cc'>" + cssContent + "</style>" + closeRefs.getValue() + "\n" + jade2HTML + jsContent + closeFinal.getValue();
    preview.write(htmlContent);
  }
  preview.close();
}

function markdownPreview() {
  $(".preview-editor").empty();
  var frame = document.createElement("iframe");
  frame.setAttribute("id", "preview");
  frame.setAttribute("sandbox", "allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts");
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
  updatePreview();
  localStorage.setItem("htmlData", htmlEditor.getValue());
  
  setTimeout(function() {
    htmlEditor.setOption("paletteHints", "true");
  }, 300);
});
cssEditor.on("change", function() {
  cssPreProcessor();
  $("#preview").contents().find("#b8c770cc").html(cssContent);
  localStorage.setItem("cssData", cssEditor.getValue());
  
  var valueSelected = $("#css-preprocessor").val();
  if ( valueSelected == "stylus") {
      cssEditor.setOption("lint", false);
      cssEditor.refresh();
  } else {
    cssEditor.setOption("lint", true);
    cssEditor.refresh();
  }

  setTimeout(function() {
    cssEditor.setOption("paletteHints", "true");
  }, 300);
});
jsEditor.on("change", function() {
  updatePreview();
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

// Save Site Title Value for LocalStorage
var JSValStatus = localStorage.getItem("JSValStatus");
if (JSValStatus === "true") {
  $("#myjsvalidationswitch").prop("checked", true);
  JSValEnabled();
} else {
  $("#myjsvalidationswitch").prop("checked", "");
  JSValDisabled();
}

$("#myjsvalidationswitch").on("click", function() {
  localStorage.setItem("JSValStatus", $(this).prop("checked"));
  if ( this.checked === true ) {
    localStorage.setItem("SaveJSValSwitch", '"checked", "true"');
    JSValEnabled();
  } else {
    localStorage.setItem("SaveJSValSwitch", '"checked", ""');
    JSValDisabled();
  }
});

function callCollabUpdate() {
  var updatehtml = htmlEditor.getValue();
  if (TogetherJS.running) {
    TogetherJS.send({
      type: "update-html",
      output: updatehtml
    });
  }
  var updatecss = cssEditor.getValue();
  if (TogetherJS.running) {
    TogetherJS.send({
      type: "update-css",
      output: updatecss
    });
  }
  var updatejs = jsEditor.getValue();
  if (TogetherJS.running) {
    TogetherJS.send({
      type: "update-js",
      output: updatejs
    });
  }
  var updatemd = mdEditor.getValue();
  if (TogetherJS.running) {
    TogetherJS.send({
      type: "update-md",
      output: updatemd
    });
  }
}

// Update TogetherJS
TogetherJS.hub.on("update-html", function(msg) {
  if (!msg.sameUrl) {
      return
  }
  htmlEditor.setValue(msg.output);
});
TogetherJS.hub.on("update-css", function(msg) {
  if (!msg.sameUrl) {
      return
  }
  cssEditor.setValue(msg.output);
});
TogetherJS.hub.on("update-js", function(msg) {
  if (!msg.sameUrl) {
      return
  }
  jsEditor.setValue(msg.output);
});
TogetherJS.hub.on("update-md", function(msg) {
  if (!msg.sameUrl) {
      return
  }
  mdEditor.setValue(msg.output);
});

// Adjust User Interface for RWD
$(window).load(function() {
  // Splitter Theme
  $("#mainSplitter, #splitContainer, #leftSplitter, #rightSplitter").jqxSplitter({
    theme: "metro"
  });

  // Select active editor when clicked/touched
  $("#htmlEditor, #cssEditor, #jsEditor, #mdEditor").on("mousedown touchend", function() {
    $("input[name=menubar].active").trigger("click");

    if ( $(this).attr("id") === "htmlEditor" ) {
      activeEditor.val("htmlEditor");
      if ($("#function").is(":hidden")) {
        $("#function").show();
      }
      $(".main-editor-chars").removeClass("hide");
      if ( $(".md-chars").is(":visible") ) {
        $(".md-chars").addClass("hide");
      }
    } else if ( $(this).attr("id") === "cssEditor" ) {
      activeEditor.val("cssEditor");
      if ($("#function").is(":visible")) {
        $("#function").hide();
      }
      $(".main-editor-chars").removeClass("hide");
      if ( $(".md-chars").is(":visible") ) {
        $(".md-chars").addClass("hide");
      }
    } else if ( $(this).attr("id") === "jsEditor" ) {
      activeEditor.val("jsEditor");
      $(".main-editor-chars").removeClass("hide");
      if ( $(".md-chars").is(":visible") ) {
        $(".md-chars").addClass("hide");
      }
      if ($("#function").is(":hidden")) {
        $("#function").show();
      }
    } else if ( $(this).attr("id") === "mdEditor" ) {
      activeEditor.val("mdEditor");
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
    if ( $("body").hasClass("live-markdown-preview") ) {
      $("body").removeClass("live-markdown-preview");
      if ( !$("body").hasClass("app") ) {
        $("body").addClass("app");
        updatePreview();
      }
    } else if ( !$("body").hasClass("app") ) {
      $("body").addClass("app");
      updatePreview();
    }
  });
  $("#mdEditor").on("mouseup touchend", function() {
    if ( $("body").hasClass("app") ) {
      $("body").removeClass("app");
      if ( !$("body").hasClass("live-markdown-preview") ) {
        $("body").addClass("live-markdown-preview");
        markdownPreview();
      }
    } else if ( !$("body").hasClass("live-markdown-preview") ) {
      $("body").addClass("live-markdown-preview");
      markdownPreview();
    }
  });
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
  $("#mainSplitter").jqxSplitter({
    height: "auto",
    width: "100%",
    orientation: "vertical",
    showSplitBar: true,
    panels: [{ size: '25%' },
             { size: '75%',collapsible:false }]
  }).jqxSplitter("collapse");
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
  $("#mainSplitter").jqxSplitter({
    height: "auto",
    width: "100%",
    orientation: "vertical",
    showSplitBar: true,
    panels: [{ size: '25%' },
             { size: '75%',collapsible:false }]
  }).jqxSplitter("collapse");
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

$("#mainSplitter").jqxSplitter({
  height: "auto",
  width: "100%",
  orientation: "vertical",
  showSplitBar: true,
  panels: [{ size: '25%' },
           { size: '75%',collapsible:false }]
}).jqxSplitter("collapse");

// Clear Input Values - JQuery Plugin
(function($) {
  $.fn.clear = function() {
    $(this).val("");
  };
}) (jQuery);

var loader = $("#load"),
    c16 = $("[data-action=n16]"),
    c32 = $("[data-action=n32]"),
    c64 = $("[data-action=n64]"),
    canvas = $("[data-action=holder]"),
    ctx16 = c16[0].getContext("2d"),
    ctx32 = c32[0].getContext("2d"),
    ctx64 = c64[0].getContext("2d"),
    ctx = canvas[0].getContext("2d"),
    holder = document.getElementById("holder"),
    myarray = [],
    current = 1,
    activeEditor = $("[data-action=activeEditor]"),
    storeValues = function() {
      // Save Site Title Value for LocalStorage
      if ( localStorage.getItem("siteTitle")) {
        $("[data-action=sitetitle]").val(localStorage.getItem("siteTitle"));
      }
      $("[data-action=sitetitle]").on("keyup change", function() {
        localStorage.setItem("siteTitle", this.value);
      });

      // Save App Version for LocalStorage
      if ( localStorage.getItem("appVersion")) {
        $("[data-value=version]").val(localStorage.getItem("appVersion"));
      }
      $("[data-value=version]").on("keyup change", function() {
        localStorage.setItem("appVersion", this.value);
      });
      // Save FontSize for LocalStorage
      if ( localStorage.getItem("fontSize")) {
        $("[data-editor=fontSize]").val(localStorage.getItem("fontSize"));
        $(".CodeMirror").css("font-size", localStorage.getItem("fontSize") + "px");
      }
      $("[data-editor=fontSize]").on("keyup change", function() {
        $(".CodeMirror").css("font-size", this.value + "px");
        localStorage.setItem("fontSize", this.value);
      });

      // Save Description for LocalStorage
      if ( localStorage.getItem("saveDesc")) {
        $("[data-action=sitedesc]").val(localStorage.getItem("saveDesc"));
      }
      $("[data-action=sitedesc]").on("keyup change", function() {
        localStorage.setItem("saveDesc", this.value);
      });
      // Save Author for LocalStorage
      if ( localStorage.getItem("saveAuthor")) {
        $("[data-action=siteauthor]").val(localStorage.getItem("saveAuthor"));
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
        $("#js-preprocessor").val(localStorage.getItem("jsPreprocessorVal"));
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
        download_to_textbox('libraries/codemirror/javascripts/code-completion.js', $('.codemirror4'));
        download_to_textbox('libraries/codemirror/javascripts/css-completion.js', $('.codemirror5'));
        download_to_textbox('libraries/codemirror/javascripts/html-completion.js', $('.codemirror6'));
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
        download_to_textbox('libraries/codemirror/addon/search/goto-line.js', $('.codemirror41'));
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
        //   "zip.file('libraries/codemirror/javascripts/code-completion.js', $('.codemirror4').val());\n",
        //   "zip.file('libraries/codemirror/javascripts/css-completion.js', $('.codemirror5').val());\n",
        //   "zip.file('libraries/codemirror/javascripts/html-completion.js', $('.codemirror6').val());\n",
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
        //   "zip.file('libraries/codemirror/addon/search/goto-line.js', $('.codemirror41').val());\n",
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

        var grabCodemirror = "zip.file('libraries/codemirror/lib/codemirror.css', $('.codemirror1').val());\n\n      zip.file('libraries/codemirror/addon/fold/foldgutter.css', $('.codemirror2').val());\n\n      zip.file('libraries/codemirror/lib/codemirror.js', $('.codemirror3').val());\n\n      zip.file('libraries/codemirror/javascripts/code-completion.js', $('.codemirror4').val());\n\n      zip.file('libraries/codemirror/javascripts/css-completion.js', $('.codemirror5').val());\n\n      zip.file('libraries/codemirror/javascripts/html-completion.js', $('.codemirror6').val());\n\n      zip.file('libraries/codemirror/mode/javascript/javascript.js', $('.codemirror7').val());\n\n      zip.file('libraries/codemirror/mode/xml/xml.js', $('.codemirror8').val());\n\n      zip.file('libraries/codemirror/mode/css/css.js', $('.codemirror9').val());\n\n      zip.file('libraries/codemirror/mode/htmlmixed/htmlmixed.js', $('.codemirror10').val());\n\n      zip.file('libraries/codemirror/addon/edit/closetag.js', $('.codemirror11').val());\n\n      zip.file('libraries/codemirror/addon/edit/matchbrackets.js', $('.codemirror12').val());\n\n      zip.file('libraries/codemirror/addon/selection/active-line.js', $('.codemirror13').val());\n\n      zip.file('libraries/codemirror/addon/fold/foldcode.js', $('.codemirror14').val());\n\n      zip.file('libraries/codemirror/addon/fold/foldgutter.js', $('.codemirror15').val());\n\n      zip.file('libraries/codemirror/addon/fold/brace-fold.js', $('.codemirror16').val());\n\n      zip.file('libraries/codemirror/addon/fold/xml-fold.js', $('.codemirror17').val());\n\n      zip.file('libraries/codemirror/addon/fold/comment-fold.js', $('.codemirror18').val());\n\n      zip.file('libraries/codemirror/addon/search/search.js', $('.codemirror19').val());\n\n      zip.file('libraries/codemirror/addon/search/searchcursor.js', $('.codemirror20').val());\n\n      zip.file('libraries/codemirror/addon/dialog/dialog.js', $('.codemirror21').val());\n\n      zip.file('libraries/codemirror/addon/hint/show-hint.js', $('.codemirror22').val());\n\n      zip.file('libraries/codemirror/addon/hint/xml-hint.js', $('.codemirror23').val());\n\n      zip.file('libraries/codemirror/addon/hint/html-hint.js', $('.codemirror24').val());\n\n      zip.file('libraries/codemirror/addon/hint/css-hint.js', $('.codemirror25').val());\n\n      zip.file('libraries/codemirror/addon/hint/javascript-hint.js', $('.codemirror26').val());\n\n      zip.file('libraries/codemirror/addon/search/match-highlighter.js', $('.codemirror27').val());\n\n      zip.file('libraries/codemirror/htmlhint.js', $('.codemirror28').val());\n\n      zip.file('libraries/codemirror/csslint.js', $('.codemirror29').val());\n\n      zip.file('libraries/codemirror/jshint.js', $('.codemirror30').val());\n\n      zip.file('libraries/codemirror/addon/lint/lint.js', $('.codemirror31').val());\n\n      zip.file('libraries/codemirror/addon/lint/html-lint.js', $('.codemirror32').val());\n\n      zip.file('libraries/codemirror/addon/lint/css-lint.js', $('.codemirror33').val());\n\n      zip.file('libraries/codemirror/addon/lint/javascript-lint.js', $('.codemirror34').val());\n\n      zip.file('libraries/codemirror/inlet.min.js', $('.codemirror35').val());\n\n      zip.file('libraries/codemirror/inlet.css', $('.codemirror36').val());\n\n      zip.file('libraries/codemirror/emmet.js', $('.codemirror37').val());\n\n      zip.file('libraries/codemirror/addon/lint/lint.css', $('.codemirror38').val());\n\n      zip.file('libraries/codemirror/addon/dialog/dialog.css', $('.codemirror39').val());\n\n      zip.file('libraries/codemirror/addon/hint/show-hint.css', $('.codemirror40').val());\n\n      zip.file('libraries/codemirror/addon/search/goto-line.js', $('.codemirror41').val());\n\n      zip.file('libraries/codemirror/markdown.js', $('.codemirror42').val());\n\n      zip.file('libraries/codemirror/continuelist.js', $('.codemirror43').val());\n\n      zip.file('libraries/codemirror/mode/haml/haml.js', $('.codemirror44').val());\n\n      zip.file('libraries/codemirror/mode/jade/jade.js', $('.codemirror45').val());\n\n      zip.file('libraries/codemirror/mode/sass/sass.js', $('.codemirror46').val());\n\n      zip.file('libraries/codemirror/mode/livescript/livescript.js', $('.codemirror47').val());\n\n      zip.file('libraries/codemirror/mode/coffeescript/coffeescript.js', $('.codemirror48').val());\n\n      zip.file('libraries/codemirror/mode/ruby/ruby.js', $('.codemirror49').val());\n\n      zip.file('libraries/codemirror/coffee-script.js', $('.codemirror50').val());\n\n      zip.file('libraries/codemirror/coffeelint.js', $('.codemirror51').val());\n\n      zip.file('libraries/codemirror/addon/lint/coffeescript-lint.js', $('.codemirror52').val());\n      zip.file('libraries/codemirror/mode/stylus/stylus.js', $('.codemirror53').val());\n"

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
    }
    img32.onload = function() {
      // x, y, width, height
      ctx32.clearRect(0, 0, 32, 32);
      ctx32.drawImage(img32, 0, 0, 32, 32);
    }
    img64.onload = function() {
      // x, y, width, height
      ctx64.clearRect(0, 0, 64, 64);
      ctx64.drawImage(img64, 0, 0, 64, 64);
    }
    img.onload = function() {
      // x, y, width, height
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(img, 0, 0, 128, 128);
    }
  }
  reader.readAsDataURL(file);
  return false;
}
storeValues();

// Load Files
$(window).load(function() {
  /**
   * Chooser (Drop Box)
   * https://www.dropbox.com/developers/dropins/chooser/js
   */
  options = {
      success: function(file) {
        if (file[0].link.toLowerCase().substring(file[0].link.length - 5) === ".html") {
          download_to_editor(file[0].link, htmlEditor)
        } else if (file[0].link.toLowerCase().substring(file[0].link.length - 5) === ".jade") {
          download_to_editor(file[0].link, htmlEditor)
        } else if (file[0].link.toLowerCase().substring(file[0].link.length - 4) === ".css") {
          download_to_editor(file[0].link, cssEditor)
        } else if (file[0].link.toLowerCase().substring(file[0].link.length - 3) === ".js") {
          download_to_editor(file[0].link, jsEditor)
        } else if (file[0].link.toLowerCase().substring(file[0].link.length - 7) === ".coffee") {
          download_to_editor(file[0].link, jsEditor)
        } else if (file[0].link.toLowerCase().substring(file[0].link.length - 3) === ".md") {
          download_to_editor(file[0].link, mdEditor)
        } else if (file[0].link.toLowerCase().substring(file[0].link.length - 4) === ".svg") {
          download_to_editor(file[0].link, htmlEditor)
        } else {
          alertify.error("Sorry kodeWeave does not support that file type!")
        }
        window.close()
      },
      cancel: function() {
        //optional
      },
      linkType: "direct", // "preview" or "direct"
      multiselect: false, // true or false
      extensions: [".html", ".jade", ".css", ".js", ".coffee", ".md", ".svg"]
  };

  $("[data-action=open-dropbox]").click(function() {
    Dropbox.choose(options);
  });

  TogetherJS.hub.on("togetherjs.hello togetherjs.hello-back", function() {
    TogetherJS.reinitialize();
  });

  // Load Files Into Editor
  $("#loadfile").on("change", function() {
    loadfile(this);
  });

  if (window.File && window.FileReader && window.FileList && window.Blob) {
    function loadfile(input) {
      var reader = new FileReader();
      reader.onload = function(e) {
          // var path = input.value.replace(/.*(\/|\\)/, '');
          var path = input.value
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
        }
      $("input[name=menubar].active").trigger("click");
      reader.readAsText(input.files[0]);
    }
  } else {
    alertify.error("The File APIs are not fully supported in this browser.");
  }

  singleFileDownload();
});

var hash = window.location.hash.substring(1);
if (window.location.hash) {
  if (location.hash.substring(1) === "dataurl") {
    $("#dataurl").attr("checked", true).trigger("change");
  } else {
    function loadgist(gistid) {
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
        if (!mdVal) {
          mdEditor.setValue("");
        } else {
          mdEditor.setValue(mdVal.content);
        }
        if (!htmlVal) {
          if (!jadeVal) {
            htmlEditor.setValue("");
          } else {
            htmlEditor.setValue(jadeVal.content);
            $("#html-preprocessor").val("jade").change();
          }
        } else {
          htmlEditor.setValue(htmlVal.content);
          $("#html-preprocessor").val("none").change();
        }
        if (!jadeVal) {
          if (!htmlVal) {
            htmlEditor.setValue("");
          } else {
            htmlEditor.setValue(htmlVal.content);
            $("#html-preprocessor").val("none").change();
          }
        } else {
          htmlEditor.setValue(jadeVal.content);
          $("#html-preprocessor").val("jade").change();
        }
        if (!cssVal) {
          if (!stylusVal) {
            cssEditor.setValue("");
          } else {
            cssEditor.setValue(stylusVal.content);
            $("#css-preprocessor").val("stylus").change();
          }
        } else {
          cssEditor.setValue(cssVal.content);
          $("#css-preprocessor").val("none").change();
        }
        if (!stylusVal) {
          if (!cssVal) {
            cssEditor.setValue("");
          } else {
            cssEditor.setValue(cssVal.content);
            $("#css-preprocessor").val("none").change();
          }
        } else {
          cssEditor.setValue(stylusVal.content);
          $("#css-preprocessor").val("stylus").change();
        }
        if (!jsVal) {
          if (!coffeeVal) {
            jsEditor.setValue("");
          } else {
            jsEditor.setValue(coffeeVal.content);
            $("#js-preprocessor").val("coffeescript").change();
          }
        } else {
          jsEditor.setValue(jsVal.content);
          $("#js-preprocessor").val("none").change();
        }
        if (!coffeeVal) {
          if (!jsVal) {
            jsEditor.setValue("");
          } else {
            jsEditor.setValue(jsVal.content);
            $("#js-preprocessor").val("none").change();
          }
        } else {
          jsEditor.setValue(coffeeVal.content);
          $("#js-preprocessor").val("coffeescript").change();
        }

        setTimeout(function() {
          mdEditor.setOption("paletteHints", "true");
          htmlEditor.setOption("paletteHints", "true");
          cssEditor.setOption("paletteHints", "true");
          jsEditor.setOption("paletteHints", "true");
        }, 300);
      }).error(function(e) {
        // ajax error
        console.warn("Error: Could not load weave!", e);
        alertify.error("Error: Could not load weave!");
      });
    }

    loadgist(hash);
  }
} {
  setTimeout(function() {
    mdEditor.setOption("paletteHints", "true");
    htmlEditor.setOption("paletteHints", "true");
    cssEditor.setOption("paletteHints", "true");
    jsEditor.setOption("paletteHints", "true");
  }, 300);
}

// Setup Preprocessors
$(".settings").on("click", function() {
  $("input[name=menubar].active").trigger("click");
  $(".preprocessor").addClass("hide");
  if ($(this).hasClass("htmlSetting")) {
    $(".html-preprocessor").removeClass("hide");
  } else if ($(this).hasClass("cssSetting")) {
    $(".css-preprocessor").removeClass("hide");
  } else if ($(this).hasClass("jsSetting")) {
    $(".js-preprocessor").removeClass("hide");
  }
  if ($("#html-preprocessor").val() == "none") {
    if (!htmlEditor.getValue) {
      $(".html-preprocessor-convert").addClass("hide");
    }
  } else if ($("#html-preprocessor").val() == "jade") {
    if (!htmlEditor.getValue) {
      $(".html-preprocessor-convert").addClass("hide");
    }
  }
  if ($("#js-preprocessor").val() == "none") {
    if (!jsEditor.getValue) {
      $(".js-preprocessor-convert").addClass("hide");
    }
  } else if ($("#js-preprocessor").val() == "coffeescript") {
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
    cssEditor.setOption("mode", "text/css");
    cssEditor.setOption("gutters", ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
    // cssEditor.refresh();
  } else if ( valueSelected == "stylus") {
    cssEditor.setOption("mode", "text/x-styl");
    cssEditor.setOption("gutters", ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
    setTimeout(function() {
      $(".CodeMirror-lint-mark-error, .CodeMirror-lint-mark-error-metro").removeClass("CodeMirror-lint-mark-error CodeMirror-lint-mark-error-metro");
      $(".CodeMirror-lint-mark-warning, .CodeMirror-lint-mark-warning-metro").removeClass("CodeMirror-lint-mark-warning CodeMirror-lint-mark-warning-metro");
    }, 300);
    // cssEditor.refresh();
  } else {
    cssEditor.setOption("mode", "text/css");
    cssEditor.setOption("gutters", ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
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
  }
  if ($("#html-preprocessor").val() == "none") {
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
    })
    $("#html-preprocessor").val("jade").change();
  } else if ($("#html-preprocessor").val() == "jade") {
    $("#html-preprocessor").val("none").change();
    var htmlContent = jade.render(htmlEditor.getValue(), options);
    htmlEditor.setValue(htmlContent);
    beautifyHTML();
  }
});
$(".css-preprocessor-convert").click(function() {
  if ($("#css-preprocessor").val() == "none") {
    var css = cssEditor.getValue();
    var converter = new Css2Stylus.Converter(css);
    converter.processCss();
    cssEditor.setValue(converter.getStylus());
    $("#css-preprocessor").val("stylus").change();
    cssEditor.setOption("lint", false);
    cssEditor.refresh();
  } else if ($("#css-preprocessor").val() == "stylus") {
    var cssContent = cssEditor.getValue();
    stylus(cssContent).render(function(err, out) {
      if(err != null) {
        console.error("something went wrong");
      } else {
        cssEditor.setValue(out);
      }
    })
    $("#css-preprocessor").val("none").change();
    beautifyCSS();
  }
});
$(".js-preprocessor-convert").click(function() {
  if ($("#js-preprocessor").val() == "none") {
    var jsContent = js2coffee.build(jsEditor.getValue()).code;
    jsEditor.setValue(jsContent);
    $("#js-preprocessor").val("coffeescript").change();
  } else if ($("#js-preprocessor").val() == "coffeescript") {
    $("#js-preprocessor").val("none").change();
    var jsContent = CoffeeScript.compile(jsEditor.getValue(), { bare: true });
    jsEditor.setValue(jsContent);
    beautifyJS();
  }
});

// Save as a Gist Online
$("[data-action=save-gist]").click(function() {
  $("input[name=menubar].active").trigger("click");
  
  // Return checked libraries
  var arr = {};
  $(".ldd-submenu input[type=checkbox]").each(function() {
    var id = this.id;
    arr[id] = (this.checked ? true : false);
  });

  // check if description and markdown editor have a value
  if ( !$("[data-action=sitedesc]").val()) {
    $("[data-action=sitedesc]").val("Saved from kodeWeave!");
  }

  // Return user settings
  var sArr = {
    "siteTitle": $("[data-action=sitetitle]").val(),
    "version": $("[data-value=version]").val(),
    "editorFontSize": $("[data-editor=fontSize]").val(),
    "description": $("[data-action=sitedesc]").val(),
    "author": $("[data-action=siteauthor]").val()
  }

  var files = {}
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
      var cssSelected = $("#css-preprocessor option:selected").val();

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
    "description": $("[data-action=sitedesc]").val(),
    "public": true,
    "files": files
  };

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
    $("[data-output=projectURL]").val("http://kodeweave.sourceforge.net/editor/#" + embedProject).click(function() {
      this.select(true);
    });
    $("[data-output=embedProject]").val("<iframe width=\"100%\" height=\"300\" src=\"http://kodeweave.sourceforge.net/embed/#" + embedProject + "\" allowfullscreen=\"allowfullscreen\" frameborder=\"0\"></iframe>").click(function() {
      this.select(true);
    });

    $(".share-facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=http%3A//kodeweave.sourceforge.net/editor/%23" + hash);
    $(".share-twitter").attr("href", "https://twitter.com/home?status=Checkout%20my%20%23weave%20on%20%23kodeWeave%3A%20http%3A//kodeweave.sourceforge.net/editor/%23" + hash);
    $(".share-gplus").attr("href", "https://plus.google.com/share?url=http%3A//kodeweave.sourceforge.net/editor/%23" + hash);
    $(".share-instagram").attr("href", "https://www.linkedin.com/shareArticle?mini=true&url=http%3A//kodeweave.sourceforge.net/editor/%23"+ hash +"&title=Checkout%20my%20%23weave%20on%20%23kodeWeave%3A%20&summary=&source=");
    $("[data-action=socialdialog]").fadeIn();

    // Let user view gist
    alertify.success("Your weave is saved!");
  }).error(function(e) {
    console.warn("Error: Could not save weave!", e);
    alertify.error("Error: Could not save weave!");
  });
});
// Close share dialog
$("[data-action=social-cancel]").on("click", function() {
  $("[data-action=socialdialog]").fadeOut();
});

// Team up / Collaborate
$("#collaborate").click(function() {
  TogetherJS(this);
  return false;
});

// Drag and drop image load
holder.ondragover = function() {
  this.className = "hover";
  return false;
};
holder.ondragend = function() {
  this.className = "";
  return false;
};
holder.ondrop = function(e) {
  this.className = "";
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  desktopExport(file);
  $(".watch").removeClass("hide");
  $(".download-dialog").addClass("imagehasloaded");
  $("#imagehasloaded").prop("checked", true);
  return false;
};

// Show Preloader
$("[data-action=download-as-win-app], [data-action=download-as-win32-app], [data-action=download-as-mac-app], [data-action=download-as-lin-app], [data-action=download-as-lin32-app], [data-action=app-confirm], [data-action=ext-confirm]").click(function() {
  $(".preloader").removeClass("hide");
});

var desktopExport = function(file) {
  displayPreview(file);

  var reader = new FileReader();

  reader.onload = function(e) {
    // Download as Windows App
    $("[data-action=download-as-win-app]").on("click", function() {
      $("input[name=menubar].active").trigger("click");

      JSZipUtils.getBinaryContent('zips/YourWinApp.zip', function(err, data) {
        if(err) {
          throw err // or handle err
        }

        var zip = new JSZip();
        renderYourHTML();
        renderYourCSS();
        renderYourJS();

        var appName = zip.folder( $("[data-action=sitetitle]").val().replace(/ /g, "-")  );
        appName.load(data);

        // Your Web App
        var grabString = "<script src=\"libraries/jquery/jquery.js\"></script\>",
            replaceString = "<script src=\"libraries/jquery/jquery.js\"></script\>\n    <script>\n      try {\n        $ = jQuery = module.exports;\n        // If you want module.exports to be empty, uncomment:\n        // module.exports = {};\n      } catch(e) {}\n    </script\>";

        var Img16 = c16[0].toDataURL("image/png");
        var Img32 = c32[0].toDataURL("image/png");
        var Img64 = c64[0].toDataURL("image/png");
        var Img128 = canvas[0].toDataURL("image/png");
        appName.file("resources/default_app/icons/16.png", Img16.split('base64,')[1],{base64: true});
        appName.file("resources/default_app/icons/32.png", Img32.split('base64,')[1],{base64: true});
        appName.file("resources/default_app/icons/64.png", Img64.split('base64,')[1],{base64: true});
        appName.file("resources/default_app/icons/128.png", Img128.split('base64,')[1],{base64: true});

        // check if css editor has a value
        if (cssEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

          appName.file("resources/default_app/css/index.css", cssEditor.getValue());
          appName.file("resources/default_app/index.html", htmlContent);
        }
        // check if js editor has a value
        if ( jsEditor.getValue() !== "") {
          if (cssEditor.getValue() === "") {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          } else {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          }
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          appName.file("resources/default_app/js/index.js", yourJS);
          appName.file("resources/default_app/index.html", htmlContent);
        }
        // check if css and js editors have values
        if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          appName.file("resources/default_app/css/index.css", cssEditor.getValue());
          appName.file("resources/default_app/js/index.js", yourJS);
          appName.file("resources/default_app/index.html", htmlContent);
        }
        if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
          closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

          appName.file("resources/default_app/index.html", htmlContent);
        }
        // check if markdown editor has a value
        if ( mdEditor.getValue() !== "") {
          appName.file("resources/default_app/README.md", mdEditor.getValue());
        }


        appName.file("resources/default_app/package.json", "{\n  \"name\": \""+ $("[data-action=sitetitle]").val() +"\",\n  \"productName\": \""+ $("[data-action=sitetitle]").val() +"\",\n  \"version\": \"1.0.0\",\n  \"main\": \"default_app.js\",\n  \"license\": \"MIT\"\n}\n");
        eval( $("[data-action=ziplibs]").val().replace(/libraries/g,"resources/default_app/libraries").replace(/zip.file/g,"appName.file") );

        var content = zip.generate({type:"blob"});
        saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + "-win.zip");
        $(".preloader").addClass("hide");
        return false;
      });
      return false;
    });
    $("[data-action=download-as-win32-app]").on("click", function() {
      $("input[name=menubar].active").trigger("click");

      JSZipUtils.getBinaryContent('zips/YourWin32App.zip', function(err, data) {
        if(err) {
          throw err // or handle err
        }

        var zip = new JSZip(data);
        renderYourHTML();
        renderYourCSS();
        renderYourJS();

        // Your Web App
        var grabString = "<script src=\"libraries/jquery/jquery.js\"></script\>",
            replaceString = "<script src=\"libraries/jquery/jquery.js\"></script\>\n    <script>\n      try {\n        $ = jQuery = module.exports;\n        // If you want module.exports to be empty, uncomment:\n        // module.exports = {};\n      } catch(e) {}\n    </script\>";

        closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
        var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();
        var Img16 = c16[0].toDataURL("image/png");
        var Img32 = c32[0].toDataURL("image/png");
        var Img64 = c64[0].toDataURL("image/png");
        var Img128 = canvas[0].toDataURL("image/png");
        zip.file("app/icons/16.png", Img16.split('base64,')[1],{base64: true});
        zip.file("app/icons/32.png", Img32.split('base64,')[1],{base64: true});
        zip.file("app/icons/64.png", Img64.split('base64,')[1],{base64: true});
        zip.file("app/icons/128.png", Img128.split('base64,')[1],{base64: true});

        // check if css editor has a value
        if (cssEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

          zip.file("app/css/index.css", cssEditor.getValue());
          zip.file("app/index.html", htmlContent);
        }
        // check if js editor has a value
        if ( jsEditor.getValue() !== "") {
          if (jsEditor.getValue() === "") {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          } else {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          }
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          zip.file("app/js/index.js", yourJS);
          zip.file("app/index.html", htmlContent);
        }
        // check if css and js editors have values
        if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          zip.file("app/css/index.css", cssEditor.getValue());
          zip.file("app/js/index.js", yourJS);
          zip.file("app/index.html", htmlContent);
        }
        if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
          closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

          zip.file("index.html", htmlContent);
        }
        // check if markdown editor has a value
        if ( mdEditor.getValue() !== "") {
          zip.file("data/README.md", mdEditor.getValue());
        }

        eval( $("[data-action=ziplibs]").val().replace(/libraries/g,"app/libraries") );

        zip.file("package.json", '{\n  "main"  : "app/index.html",\n  "name"  : "'+ $("[data-action=sitetitle]").val() +'",\n  "window": {\n      "toolbar" : false,\n      "icon"    : "app/icons/128.png",\n      "width"   : 1000,\n      "height"  : 600,\n      "position": "center"\n  }\n}');

        var content = zip.generate({type:"blob"});
        saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + "-win32.zip");
        $(".preloader").addClass("hide");
        return false;
      });
      return false;
    });

    // Download as Mac App
    $("[data-action=download-as-mac-app]").on("click", function() {
      $("input[name=menubar].active").trigger("click");

      JSZipUtils.getBinaryContent('zips/YourMacApp.zip', function(err, data) {
        if(err) {
          throw err // or handle err
        }

        var zip = new JSZip(data);
        renderYourHTML();
        renderYourCSS();
        renderYourJS();

        // Your Web App
        var grabString = "<script src=\"libraries/jquery/jquery.js\"></script\>",
            replaceString = "<script src=\"libraries/jquery/jquery.js\"></script\>\n    <script>\n      try {\n        $ = jQuery = module.exports;\n        // If you want module.exports to be empty, uncomment:\n        // module.exports = {};\n      } catch(e) {}\n    </script\>";

        closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
        var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();
        var Img16 = c16[0].toDataURL("image/png");
        var Img32 = c32[0].toDataURL("image/png");
        var Img64 = c64[0].toDataURL("image/png");
        var Img128 = canvas[0].toDataURL("image/png");
        zip.file("content/app/icons/16.png", Img16.split('base64,')[1],{base64: true});
        zip.file("content/app/icons/32.png", Img32.split('base64,')[1],{base64: true});
        zip.file("content/app/icons/64.png", Img64.split('base64,')[1],{base64: true});
        zip.file("content/app/icons/128.png", Img128.split('base64,')[1],{base64: true});

        // check if css editor has a value
        if (cssEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

          zip.file("content/app/css/index.css", cssEditor.getValue());
          zip.file("content/app/index.html", htmlContent);
        }
        // check if js editor has a value
        if ( jsEditor.getValue() !== "") {
          if (jsEditor.getValue() === "") {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          } else {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          }
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          zip.file("content/app/js/index.js", yourJS);
          zip.file("content/app/index.html", htmlContent);
        }
        // check if css and js editors have values
        if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          zip.file("content/app/css/index.css", cssEditor.getValue());
          zip.file("content/app/js/index.js", yourJS);
          zip.file("content/app/index.html", htmlContent);
        }
        if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
          closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

          zip.file("content/index.html", htmlContent);
        }
        // check if markdown editor has a value
        if ( mdEditor.getValue() !== "") {
          zip.file("README.md", mdEditor.getValue());
        }

        eval( $("[data-action=ziplibs]").val().replace(/libraries/g,"content/app/libraries") );

        zip.file("package.json", '{\n  "main"  : "content/index.html",\n  "name"  : "'+ $("[data-action=sitetitle]").val() +'",\n  "window": {\n    "toolbar"    : false\n  }\n}');
        zip.file("content/index.html", '<!doctype html>\n<html>\n <head>\n    <title>'+ $("[data-action=sitetitle]").val() +'</title>\n    <style>\n      iframe {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        overflow: visible;\n        border: 0;\n      }\n    </style>\n  </head>\n <body>\n    <iframe src="app/index.html"></iframe>\n\n    <script src="js/main.js"></script>\n  </body>\n</html>');
        zip.file("content/js/main.js", 'document.addEventListener("DOMContentLoaded", function() {\n  // Load library\n  var gui = require("nw.gui");\n\n  // Reference to window\n  var win = gui.Window.get();\n\n  // Create menu container\n  var Menu = new gui.Menu({\n    type: "menubar"\n  });\n\n  //initialize default mac menu\n  Menu.createMacBuiltin("'+ $("[data-action=sitetitle]").val() +'");\n\n  // Get the root menu from the default mac menu\n  var windowMenu = Menu.items[2].submenu;\n\n  // Append new item to root menu\n  windowMenu.insert(\n    new gui.MenuItem({\n      type: "normal",\n      label: "Toggle Fullscreen",\n      key: "F",\n      modifiers: "cmd",\n      click : function () {\n        win.toggleFullscreen();\n      }\n    })\n  );\n\n  windowMenu.insert(\n    new gui.MenuItem({\n      type: "normal",\n      label: "Reload App",\n      key: "r",\n      modifiers: "cmd",\n      click : function () {\n        win.reload();\n      }\n    })\n  );\n\n  // Append Menu to Window\n  gui.Window.get().menu = Menu;\n});');

        var content = zip.generate({type:"blob"});
        saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + "-mac.zip");
        $(".preloader").addClass("hide");
        return false;
      });
      return false;
    });

    // Download as Linux App
    $("[data-action=download-as-lin-app]").on("click", function() {
      $("input[name=menubar].active").trigger("click");

      JSZipUtils.getBinaryContent('zips/YourLinApp.zip', function(err, data) {
        if(err) {
          throw err // or handle err
        }

        var zip = new JSZip();
        var appName = zip.folder( $("[data-action=sitetitle]").val().replace(/ /g, "-")  );
        appName.load(data);
        renderYourHTML();
        renderYourCSS();
        renderYourJS();

        // Your Web App
        var grabString = "<script src=\"libraries/jquery/jquery.js\"></script\>",
            replaceString = "<script src=\"libraries/jquery/jquery.js\"></script\>\n    <script>\n      try {\n        $ = jQuery = module.exports;\n        // If you want module.exports to be empty, uncomment:\n        // module.exports = {};\n      } catch(e) {}\n    </script\>";

        var Img16 = c16[0].toDataURL("image/png");
        var Img32 = c32[0].toDataURL("image/png");
        var Img64 = c64[0].toDataURL("image/png");
        var Img128 = canvas[0].toDataURL("image/png");
        appName.file("resources/default_app/icons/16.png", Img16.split('base64,')[1],{base64: true});
        appName.file("resources/default_app/icons/32.png", Img32.split('base64,')[1],{base64: true});
        appName.file("resources/default_app/icons/64.png", Img64.split('base64,')[1],{base64: true});
        appName.file("resources/default_app/icons/128.png", Img128.split('base64,')[1],{base64: true});

        // check if css editor has a value
        if (cssEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

          appName.file("resources/default_app/css/index.css", cssEditor.getValue());
          appName.file("resources/default_app/index.html", htmlContent);
        }
        // check if js editor has a value
        if ( jsEditor.getValue() !== "") {
          if (cssEditor.getValue() === "") {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          } else {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          }
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          appName.file("resources/default_app/js/index.js", yourJS);
          appName.file("resources/default_app/index.html", htmlContent);
        }
        // check if css and js editors have values
        if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          appName.file("resources/default_app/css/index.css", cssEditor.getValue());
          appName.file("resources/default_app/js/index.js", yourJS);
          appName.file("resources/default_app/index.html", htmlContent);
        }
        if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
          closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

          appName.file("resources/default_app/index.html", htmlContent);
        }
        // check if markdown editor has a value
        if ( mdEditor.getValue() !== "") {
          appName.file("resources/default_app/README.md", mdEditor.getValue());
        }

        appName.file("resources/default_app/package.json", "{\n  \"name\": \""+ $("[data-action=sitetitle]").val() +"\",\n  \"productName\": \""+ $("[data-action=sitetitle]").val() +"\",\n  \"version\": \"1.0.0\",\n  \"main\": \"default_app.js\",\n  \"license\": \"MIT\"\n}\n");
        eval( $("[data-action=ziplibs]").val().replace(/libraries/g,"resources/default_app/libraries").replace(/zip.file/g,"appName.file") );

        zip.file("make.sh", "if [ -d ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +" ]; then\n  typeset LP_FILE=${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +".desktop\n\n  # Remove the target file if any\n  rm -f ${LP_FILE}\n  printf \"%s[Desktop Entry]\\nName="+ $("[data-action=sitetitle]").val() +"\\nPath=${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"\\nActions=sudo\\nExec=./"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/electron\\nIcon=${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/resources/default_app/icons/128.png\\nTerminal=true\\nType=Application\\nStartupNotify=true > ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +".desktop\" >> ${LP_FILE}\n\n  echo 'Your application and launcher are now located at ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"'\n  rm README.md\n  rm make.sh\n  cd ../\n  rmdir "+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"-lin\n  cd ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/\n  chmod 775 electron\nfi\n\nif [ ! -d ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +" ]; then\n  mv "+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +" ${HOME}\n\n  typeset LP_FILE=${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +".desktop\n\n  # Remove the target file if any\n  rm -f ${LP_FILE}\n  printf \"%s[Desktop Entry]\\nName="+ $("[data-action=sitetitle]").val() +"\\nPath=${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"\\nActions=sudo\\nExec=./"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/electron\\nIcon=${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/resources/default_app/icons/128.png\\nTerminal=true\\nType=Application\\nStartupNotify=true > ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +".desktop\" >> ${LP_FILE}\n\n  echo 'Your application and launcher are now located at ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"'\n  rm README.md\n  rm make.sh\n  cd ../\n  rmdir "+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"-lin\n  cd ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"/\n  chmod 775 electron\nfi\n\n# For Windows OS\n#if EXIST ${HOME}/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +" (\n  #echo Yes\n#) ELSE (\n  #echo No\n#)\n");
        zip.file("README.md", "### Instructions\n 1. Extract the `"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"-lin.zip` folder anywhere on your computer except the home folder. \n 2. Open a terminal and then navigate to "+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"'s directory and `run the make.sh file`.\n\n  **example**:\n  cd Downloads/"+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +"-lin\n\n 3. This will move the "+ $("[data-action=sitetitle]").val().replace(/ /g, "-") +" sibling folder and it's decendants to your home directory and create an application launcher.\n");

        var content = zip.generate({type:"blob"});
        saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + "-lin.zip");
        $(".preloader").addClass("hide");
        return false;
      });
      return false;
    });
    $("[data-action=download-as-lin32-app]").on("click", function() {
      $("input[name=menubar].active").trigger("click");

      JSZipUtils.getBinaryContent('zips/YourLin32App.zip', function(err, data) {
        if(err) {
          throw err // or handle err
        }

        var zip = new JSZip(data);
        renderYourHTML();
        renderYourCSS();
        renderYourJS();

        // Your Web App
        var grabString = "<script src=\"libraries/jquery/jquery.js\"></script\>",
            replaceString = "<script src=\"libraries/jquery/jquery.js\"></script\>\n    <script>\n      try {\n        $ = jQuery = module.exports;\n        // If you want module.exports to be empty, uncomment:\n        // module.exports = {};\n      } catch(e) {}\n    </script\>";

        closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
        var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();
        var Img16 = c16[0].toDataURL("image/png");
        var Img32 = c32[0].toDataURL("image/png");
        var Img64 = c64[0].toDataURL("image/png");
        var Img128 = canvas[0].toDataURL("image/png");
        zip.file("app/icons/16.png", Img16.split('base64,')[1],{base64: true});
        zip.file("app/icons/32.png", Img32.split('base64,')[1],{base64: true});
        zip.file("app/icons/64.png", Img64.split('base64,')[1],{base64: true});
        zip.file("app/icons/128.png", Img128.split('base64,')[1],{base64: true});

        // check if css editor has a value
        if (cssEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

          zip.file("app/css/index.css", cssEditor.getValue());
          zip.file("app/index.html", htmlContent);
        }
        // check if js editor has a value
        if ( jsEditor.getValue() !== "") {
          if (jsEditor.getValue() === "") {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          } else {
            closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          }
          var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          zip.file("app/js/index.js", yourJS);
          zip.file("app/index.html", htmlContent);
        }
        // check if css and js editors have values
        if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
          closeRefs.setValue($("[data-action=library-code]").val().split(grabString).join(replaceString) + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

          zip.file("app/css/index.css", cssEditor.getValue());
          zip.file("app/js/index.js", yourJS);
          zip.file("app/index.html", htmlContent);
        }
        if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
          closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
          htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

          zip.file("index.html", htmlContent);
        }
        // check if markdown editor has a value
        if ( mdEditor.getValue() !== "") {
          zip.file("data/README.md", mdEditor.getValue());
        }

        eval( $("[data-action=ziplibs]").val().replace(/libraries/g,"app/libraries") );

        zip.file("package.json", '{\n  "main"  : "app/index.html",\n  "name"  : "'+ $("[data-action=sitetitle]").val() +'",\n  "window": {\n      "toolbar" : false,\n      "icon"    : "app/icons/128.png",\n      "width"   : 1000,\n      "height"  : 600,\n      "position": "center"\n  }\n}');

        var content = zip.generate({type:"blob"});
        saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + "-lin32.zip");
        $(".preloader").addClass("hide");
        return false;
      });
      return false;
    });

    // Download as Chrome App
    $("[data-action=download-as-chrome-app]").on("click", function() {
      $("input[name=menubar].active").trigger("click");
      $("[data-action=chromeappdialog]").fadeIn();
    });
    $("[data-action=app-cancel]").on("click", function() {
      $("[data-action=chromeappdialog]").fadeOut();
    });
    $("[data-action=app-confirm]").on("click", function() {
      if ( ($("[data-action=sitetitle]").val() === "") || ($("[data-action=app-descr]").val() === "") ) {
        alertify.error("Download failed! Please fill in all required fields.");
        $(".preloader").addClass("hide");
      } else {
        $("[data-action=chromeappdialog]").fadeOut();
        JSZipUtils.getBinaryContent("zips/font-awesome.zip", function(err, data) {
          if(err) {
            throw err // or handle err
          }

          var zip = new JSZip(data);
          var appName = zip.folder("app");
          appName.load(data);
          renderYourHTML();
          renderYourCSS();
          renderYourJS();

          // Your Web App
          // check if css editor has a value
          if (cssEditor.getValue() !== "") {
            closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
            var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

            zip.file("app/css/index.css", cssEditor.getValue());
            zip.file("app/index.html", htmlContent);
          }
          // check if js editor has a value
          if ( jsEditor.getValue() !== "") {
            if (cssEditor.getValue() === "") {
              closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
            } else {
              closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
            }
            var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

            zip.file("app/js/index.js", yourJS);
            zip.file("app/index.html", htmlContent);
          }
          // check if css and js editors have values
          if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
            closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
            htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

            zip.file("app/css/index.css", cssEditor.getValue());
            zip.file("app/js/index.js", yourJS);
            zip.file("app/index.html", htmlContent);
          }
          if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
            closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
            htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

            zip.file("app/index.html", htmlContent);
          }
          // check if markdown editor has a value
          if ( mdEditor.getValue() !== "") {
            zip.file("README.md", mdEditor.getValue());
          }

          var Img16 = c16[0].toDataURL("image/png");
          var Img32 = c32[0].toDataURL("image/png");
          var Img64 = c64[0].toDataURL("image/png");
          var Img128 = canvas[0].toDataURL("image/png");
          zip.file("assets/16.png", Img16.split('base64,')[1],{base64: true});
          zip.file("assets/32.png", Img32.split('base64,')[1],{base64: true});
          zip.file("assets/64.png", Img64.split('base64,')[1],{base64: true});
          zip.file("assets/128.png", Img128.split('base64,')[1],{base64: true});
          eval( $("[data-action=ziplibs]").val().replace(/libraries/g,"app/libraries") );
          zip.file("css/index.css", "html, body {\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  height: 100%;\n}\n\nwebview, iframe {\n  width: 100%;\n  height: 100%;\n  border: 0;\n}");
          zip.file("index.html", "<!DOCTYPE html>\n<html>\n  <head>\n    <title>"+ $("[data-action=sitetitle]").val() +"</title>\n    <link rel=\"stylesheet\" href=\"css/index.css\" />\n  </head>\n  <body>\n    <iframe src=\"app/index.html\">\n      Your Chromebook does not support the iFrame html element.\n    </iframe>\n  </body>\n</html>");

          if ( $(".offline-mode").is(":checked") ) {
            zip.file("manifest.json", '{\n  "manifest_version": 2,\n  "name": "'+ $("[data-action=sitetitle]").val() +'",\n  "short_name": "'+ $("[data-action=sitetitle]").val() +'",\n  "description": "'+ $("[data-action=app-descr]").val() +'",\n  "version": "'+ $("[data-value=version]").val() +'",\n  "minimum_chrome_version": "38",\n  "offline_enabled": true,\n  "permissions": [ "storage", "fileSystem", "unlimitedStorage", "http://*/", "https://*/" ],\n  "icons": {\n    "16": "assets/16.png",\n    "32": "assets/32.png",\n    "64": "assets/64.png",\n    "128": "assets/128.png"\n  },\n\n  "app": {\n    "background": {\n      "scripts": ["background.js"]\n    }\n  }\n}\n');
            if ( $(".frame-mode").is(":checked") ) {
              zip.file("background.js", "/**\n * Listens for the app launching, then creates the window.\n *\n * @see http://developer.chrome.com/apps/app.runtime.html\n * @see http://developer.chrome.com/apps/app.window.html\n */\nchrome.app.runtime.onLaunched.addListener(function(launchData) {\n  chrome.app.window.create(\n    'app/index.html',\n    {\n      frame: 'none',\n      id: 'mainWindow',\n      innerBounds: {\n        'width': 800,\n        'height': 600\n      }\n    }\n  );\n});");
            } else {
              zip.file("background.js", "/**\n * Listens for the app launching, then creates the window.\n *\n * @see http://developer.chrome.com/apps/app.runtime.html\n * @see http://developer.chrome.com/apps/app.window.html\n */\nchrome.app.runtime.onLaunched.addListener(function(launchData) {\n  chrome.app.window.create(\n    'app/index.html',\n    {\n      id: 'mainWindow',\n      innerBounds: {\n        'width': 800,\n        'height': 600\n      }\n    }\n  );\n});");
            }
          } else {
            zip.file("manifest.json", '{\n  "manifest_version": 2,\n  "name": "'+ $("[data-action=sitetitle]").val() +'",\n  "short_name": "'+ $("[data-action=sitetitle]").val() +'",\n  "description": "'+ $("[data-action=app-descr]").val() +'",\n  "version": "'+ $("[data-value=version]").val() +'",\n  "minimum_chrome_version": "38",\n  "offline_enabled": false,\n  "permissions": [ "storage", "fileSystem", "unlimitedStorage", "http://*/", "https://*/" ],\n  "icons": {\n    "16": "assets/16.png",\n    "32": "assets/32.png",\n    "64": "assets/64.png",\n    "128": "assets/128.png"\n  },\n\n  "app": {\n    "background": {\n      "scripts": ["background.js"]\n    }\n  }\n}\n');
            if ( $(".frame-mode").is(":checked") ) {
              zip.file("background.js", "/**\n * Listens for the app launching, then creates the window.\n *\n * @see http://developer.chrome.com/apps/app.runtime.html\n * @see http://developer.chrome.com/apps/app.window.html\n */\nchrome.app.runtime.onLaunched.addListener(function(launchData) {\n  chrome.app.window.create(\n    'app/index.html',\n    {\n      frame: 'none',\n      id: 'mainWindow',\n      innerBounds: {\n        'width': 800,\n        'height': 600\n      }\n    }\n  );\n});");
            } else {
              zip.file("background.js", "/**\n * Listens for the app launching, then creates the window.\n *\n * @see http://developer.chrome.com/apps/app.runtime.html\n * @see http://developer.chrome.com/apps/app.window.html\n */\nchrome.app.runtime.onLaunched.addListener(function(launchData) {\n  chrome.app.window.create(\n    'app/index.html',\n    {\n      id: 'mainWindow',\n      innerBounds: {\n        'width': 800,\n        'height': 600\n      }\n    }\n  );\n});");
            }
          }

          // Your Web App
          var content = zip.generate({type:"blob"});
          saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + "-chromeapp.zip");
          $(".preloader").addClass("hide");
          $(".dialog-bg").fadeOut();
          return false;
        });
      }
      return false;
    });

    // Download as Chrome Extension
    $("[data-action=download-as-chrome-ext]").on("click", function() {
      $("input[name=menubar].active").trigger("click");
      $("[data-action=chromeextdialog]").fadeIn();
    });
    $("[data-action=ext-cancel]").on("click", function() {
      $("[data-action=chromeextdialog]").fadeOut();
    });
    $("[data-action=ext-confirm]").on("click", function() {
      if ( ($("[data-action=sitetitle]").val() === "") || ($("[data-action=ext-descr]").val() === "") ) {
        alertify.error("Download failed! Please fill in all required fields.");
        $(".preloader").addClass("hide");
      } else {
        $("[data-action=chromeextdialog]").fadeOut();
        JSZipUtils.getBinaryContent("zips/font-awesome.zip", function(err, data) {
          if(err) {
            throw err // or handle err
          }

          var zip = new JSZip(data);
          renderYourHTML();
          renderYourCSS();
          renderYourJS();

          // Your Web App
          // check if css editor has a value
          if (cssEditor.getValue() !== "") {
            closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
            var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

            zip.file("css/index.css", yourCSS);
            zip.file("index.html", htmlContent);
          }
          // check if js editor has a value
          if ( jsEditor.getValue() !== "") {
            if (cssEditor.getValue() === "") {
              closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
            } else {
              closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
            }
            var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

            zip.file("js/index.js", yourJS);
            zip.file("index.html", htmlContent);
          }
          // check if css and js editors have values
          if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
            closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
            htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

            zip.file("css/index.css", yourCSS);
            zip.file("js/index.js", yourJS);
            zip.file("index.html", htmlContent);
          }
          if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
            closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
            htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

            zip.file("index.html", htmlContent);
          }
          // check if markdown editor has a value
          if ( mdEditor.getValue() !== "") {
            zip.file("README.md", mdEditor.getValue());
          }

          var Img16 = c16[0].toDataURL("image/png");
          var Img32 = c32[0].toDataURL("image/png");
          var Img64 = c64[0].toDataURL("image/png");
          var Img128 = canvas[0].toDataURL("image/png");
          zip.file("assets/16.png", Img16.split('base64,')[1],{base64: true});
          zip.file("assets/32.png", Img32.split('base64,')[1],{base64: true});
          zip.file("assets/64.png", Img64.split('base64,')[1],{base64: true});
          zip.file("assets/128.png", Img128.split('base64,')[1],{base64: true});
          eval( $("[data-action=ziplibs]").val() );

          zip.file("manifest.json", "{\n  \"manifest_version\": 2,\n  \"name\": \""+ $("[data-action=sitetitle]").val() +"\",\n  \"short_name\": \""+ $("[data-action=sitetitle]").val() +"\",\n  \"description\": \""+ $("[data-action=ext-descr]").val() +"\",\n  \"version\": \""+ $("[data-value=version]").val() +"\",\n  \"minimum_chrome_version\": \"38\",\n  \"permissions\": [ \"storage\", \"unlimitedStorage\", \"http://*/\", \"https://*/\" ],\n  \"icons\": {\n    \"16\": \"assets/16.png\",\n    \"32\": \"assets/32.png\",\n    \"64\": \"assets/64.png\",\n    \"128\": \"assets/128.png\"\n  },\n\n  \"browser_action\": {\n    \"default_icon\": \"assets/128.png\",\n    \"default_title\": \""+ $("[data-action=sitetitle]").val() +"\",\n    \"default_popup\": \"index.html\"\n  },\n  \n  \"content_security_policy\": \"script-src 'self' 'unsafe-eval'; object-src 'self'\"\n}");

          // Your Web App
          var content = zip.generate({type:"blob"});
          saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + "-chromeext.zip");
          $(".preloader").addClass("hide");
          $(".dialog-bg").fadeOut();
          return false;
        });
      }
      return false;
    });
    return false;
  };
  reader.readAsArrayBuffer(file);
  return false;
};

// Check Application Fields (For Download)
$("#load").on("change", function(evt) {
  if ( $(this).val() === "" ) {
    $(".watch").addClass("hide");
  } else {
    $(".watch").removeClass("hide");
    var file = evt.target.files[0];
    desktopExport(file);
    $(".download-dialog").addClass("imagehasloaded");
    $("#imagehasloaded").prop("checked", true);
    return false;
  }
});

// Download as zip
$("[data-action=download-zip]").on("click", function() {
  $("input[name=menubar].active").trigger("click");

  JSZipUtils.getBinaryContent("zips/font-awesome.zip", function(err, data) {
    if(err) {
      throw err // or handle err
    }

    var zip = new JSZip(data);
    renderYourHTML();
    renderYourCSS();
    renderYourJS();

    // check if css editor has a value
    if (cssEditor.getValue() !== "") {
      closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
      var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n    " + closeFinal.getValue();

      zip.file("css/index.css", yourCSS);
      zip.file("index.html", htmlContent);
    }
    // check if js editor has a value

    if ( jsEditor.getValue() !== "") {
      if (cssEditor.getValue() === "") {
        closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
      } else {
        closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
      }
      var htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

      zip.file("js/index.js", yourJS);
      zip.file("index.html", htmlContent);
    }
    // check if css and js editors have values
    if (cssEditor.getValue() !== "" && jsEditor.getValue() !== "") {
      closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />\n    <link rel=\"stylesheet\" href=\"css/index.css\" />" + "\n  </head>\n  <body>\n\n");
      htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n\n    <script src=\"js/index.js\"></script>" + closeFinal.getValue();

      zip.file("css/index.css", yourCSS);
      zip.file("js/index.js", yourJS);
      zip.file("index.html", htmlContent);
    }
    if (cssEditor.getValue() == "" && jsEditor.getValue() == "") {
      closeRefs.setValue($("[data-action=library-code]").val() + "    <link rel=\"stylesheet\" href=\"libraries/font-awesome/font-awesome.css\" />\n    <link rel=\"stylesheet\" href=\"libraries/font-awesome/macset.css\" />" + "\n  </head>\n  <body>\n\n");
      htmlContent = openHTML.getValue() + $("[data-action=sitetitle]").val() + closeHTML.getValue() + closeRefs.getValue() + yourHTML + "\n" + closeFinal.getValue();

      zip.file("index.html", htmlContent);
    }
    // check if markdown editor has a value
    if ( mdEditor.getValue() !== "") {
      zip.file("README.md", mdEditor.getValue());
    }
    eval( $("[data-action=ziplibs]").val() );
    var content = zip.generate({type:"blob"});
    saveAs(content, $("[data-action=sitetitle]").val().split(" ").join("-") + ".zip");
    $(".preloader").addClass("hide");
    return false;
  });
});

// Save Checked Libraries for LocalStorage
var textarea = $("[data-action=library-code]");
if (localStorage.getItem("checkedLibraries")) {
 textarea.val(localStorage.getItem("checkedLibraries"));

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
    textarea.val( textarea.val() + value );
  } else {
    textarea.val( textarea.val().replace( value, "") );
  }

  updatePreview();

  var checked = $("[type=checkbox].check:checked");
  var lsChecked = [];
  for (var i = 0, iLen = checked.length; i < iLen; i++) {
    lsChecked.push($(checked[i]).attr('id'));
  }
  localStorage.setItem("checkedLibraries", textarea.val());
  localStorage.setItem("checkedInputs", JSON.stringify(lsChecked));
});
$("#jquery").trigger("keyup");

// If textbox has a value...
// a clear icon will display to clear the input
$(".metaboxes .heading").not("input[type=number]").clearSearch();

// Hide menu when DataURL is Checked
$("#dataurl").on("change", function() {
  (this.checked) ? $("input[name=menubar].active").trigger("click") : ""
});

// Clear localStorage when clicked
$("[data-action=clearStorage]").click(function() {
  localStorage.clear();
});

shortcutKeys();
initGenerators();
fullscreenEditor();
checkedLibs();
appDemos();
charGeneration();

var logo            = $("[data-action=dataurloutput]"),
    imgUrl          = $("[data-url=dataurlimgurl]"),
    dataurlholder   = document.getElementById("dataurlholder"),
    JSimgUrl        = document.querySelector("[data-url=dataurlimgurl]");

// Save Site Title Value for LocalStorage
function displayDURL(file) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var img = new Image();
    img.src = e.target.result;
    img.onload = function() {
      var dataUrl = e.target.result;
      logo.attr("src", dataUrl);
      imgUrl.val( logo.attr("src") );
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
$("[data-action=dataURLtoEditor]").click(function() {
  if ( activeEditor.val() === "htmlEditor" ) {
    htmlEditor.replaceSelection(imgUrl.val());
    htmlEditor.focus();
  } else if ( activeEditor.val() === "cssEditor" ) {
    cssEditor.replaceSelection(imgUrl.val());
    cssEditor.focus();
  } else if ( activeEditor.val() === "jsEditor" ) {
    jsEditor.replaceSelection(imgUrl.val());
    jsEditor.focus();
  } else if ( activeEditor.val() === "mdEditor" ) {
    mdEditor.replaceSelection(imgUrl.val());
    mdEditor.focus();
  }
  $("#dataurl").trigger("click");
});

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