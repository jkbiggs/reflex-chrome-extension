/*global window, jQuery, $ */

function _reflex() {
    'use strict';
    var $, 
	ElementInfo, 
	css, 
	Tip, 
	tip,	
	panel, 
	ctrl, 
	_r,
	DOM_TREE_DEPTH = 5,
	elementInfoCache = [];
	
    ElementInfo = function (element) {
        this.element = $(element);
        this.detect();
    };
    ElementInfo.prototype = {
        detect: function () {
            this.type = this.element.prop('tagName');
			this.id = this.element.prop('id');
		},
		getDomTree: function(elm) {
			var elementParents = [];
			$(elm).parents().addBack().not('html').each(function() {
				if (elementParents.length < DOM_TREE_DEPTH) {
					elementParents.push(this.tagName.toLowerCase());
				}
			});
			return elementParents.join(" > ");
		},
		getXPath: function(elm) { 
			// if we have an id, let's use that
			if (elm && elm.id) {
				return '//*[@id="' + elm.id + '"]';
			} else {
				var paths = [];
				
				// Use nodeName (instead of localName) so namespace prefix is included (if any).
				for (; elm && elm.nodeType == 1; elm = elm.parentNode)  {
					var index = 0;
					
					for (var sibling = elm.previousSibling; sibling; sibling = sibling.previousSibling) {
						// Ignore document type declaration.
						if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
							continue;
						if (sibling.nodeName == elm.nodeName)
							++index;
					}				
					var tagName = elm.nodeName.toLowerCase();
					var pathIndex = (index ? "[" + (index+1) + "]" : "");
					paths.splice(0, 0, tagName + pathIndex);
				}
				return paths.length ? "/" + paths.join("/") : null;
			}
		}
    };
    css = {
        STYLE_PRE: '__reflex_',
        STYLE: null,
        init: function () {
            var cssContent = 
			 "@-webkit-keyframes slideDown{from{max-height:0}to{max-height:375px}}@-webkit-keyframes fadeIn{from{opacity:0}to{opacity:1}}*{cursor:default!important}"
			 +"@font-face{font-family:FontAwesome;src:url('" + chrome.extension.getURL("/css/fontawesome-webfont.woff?v=4.5.0") + "');}"
			 +".__reflex_basic{background:transparent;-webkit-border-radius:none;bottom:auto;-webkit-box-shadow:none;clear:none;color:inherit;cursor:auto;float:none;font-family:'Source Sans Pro',sans-serif;height:auto;left:auto;list-style:none;margin:0;max-height:none;max-width:none;min-height:none;min-width:none;overflow:visible;padding:0;position:static;right:auto;text-align:inherit;text-decoration:none;text-indent:0;text-shadow:inherit;text-transform:none;top:auto;visibility:visible;width:auto;z-index:auto;zoom:1;-webkit-font-smoothing:antialiased}"
			 +".__reflex_basic *{color:inherit}.__reflex_basic a,.__reflex_basic a:visited .__reflex_basic a:hover,.__reflex_basic a:active{color:inherit;cursor:pointer!important;text-decoration:none}"
			 +".__reflex_tip{display:none;background:#092231;font-weight:400;font-size:16px;-webkit-border-radius:2px;line-height:1;color:#fff;font-family:'Source Sans Pro',sans-serif;opacity:.9;padding:10px 10px 10px 10px;position:absolute;z-index:2147483647}"
			 +".__reflex_panel{color:#fff;width:600px;padding:0px 30px 10px 20px;background:-webkit-linear-gradient(#05141e,#053657);opacity:.98;-webkit-border-radius:2px;-webkit-box-shadow:inset 0 1px 0 #555,0 0 5px #000;position:absolute;z-index:214748364}"
			 +".__reflex_panel_content{height:auto;text-align:left;font-family:'Source Sans Pro',sans-serif;}"
			 +".__reflex_label{padding:0px 0px 13px 0px;font-size:11pt;}"
			 +".__reflex_value{padding:6px 0px 0px 0px;display:block;}"
			 +".__reflex_input{padding:2px 2px 2px 2px;font-size:10pt;-webkit-border-radius:2px;}"
			 +".__reflex_tree{text-align:center;font-size:11pt;padding:5px 0px 10px 0px;}"
			 +".__reflex_id{width:100%;}"
			 +".__reflex_x_path{width:100%;line-height:5em;word-wrap:break-word;}"
			 +".__reflex_button{height:32px;width:160px;background:#00a99d;color:#fff;font-weight:600;font-size:20px;border:none;-webkit-border-radius:2px;text-align:center}"
			 +".__reflex_button_div{text-align:center;}"
			 +".__reflex_save_pane{display:none;width:103%;height:135px;background:#fff;color:black;padding:20px 0px 0px 10px;position:relative;left:-10px;}" 
			 +".__reflex_save_pane_div{width:33%;float:left;padding:0px 0px 10px 0px;}"
			 +".__reflex_save_pane_value{padding:6px 20px 0px 0px;display:block;}"
			 +".__reflex_full_width{width:100%;}"
			 +".__reflex_half_width{width:50%;}"
			 //add the carrot to the top
			 +".__reflex_panel_title{color:#fff;font-size:1.1em;font-weight:bold;padding:4px 16px 4px 15px;position:relative;text-align:center;text-transform:capitalize}"
			 +".__reflex_panel_title:before,.__reflex_panel_title:after{border-style:solid;content:'.';display:block;height:0;position:absolute;text-indent:-30000px;width:0}"
			 +".__reflex_panel_title:before{border-color:black transparent;border-width:0 7px 7px 7px;left:7px;top:-8px}"
			 +".__reflex_panel_title:after{border-color:#666 transparent;border-width:0 6px 7px 6px;left:8px;top:-6px}"
			 +".__reflex_close_button{font-size:18px;color:white;bottom:0;cursor:pointer;display:inline-block;line-height:22px;margin:0;height:22px;padding:3px;position:absolute;right:-25px;top:0;vertical-align:middle}";
			css.STYLE = $("<style>" + cssContent + "</style>").appendTo("head");
		},
        restore: function () {
            //Remove stylesheet
            $(css.STYLE).remove();
        },
		getClassName: function (name) {
            // Generate class name with prefix
            name = (typeof name === 'string') ? [name] : name;
			if (name[0] == "fa") { // don't add the reflex prefix to the font awesome classes
				return name.join(" ");
			}
            return css.STYLE_PRE + name.join(" " + css.STYLE_PRE);
        }
    };

    Tip = function () {
        this.el = $.createElem('div', 'tip', '');
        this.$el = $(this.el);
        this.init();
    };
    Tip.prototype = {
        init: function () {
            var that = this;
            this.$el.appendTo('body');
            
			$('body :visible').on('mousemove.r', function (e) {
                that.update($(this), e);
                that.show();
                e.stopPropagation();
            });
            
			$('body').on('mouseout.r', function (e) {
                that.hide();
            });
        },
        hide: function () {
			this.$el.hide();
        },
        show: function () {
            this.$el.show();
        },
        update: function (newElement, event) {
            var cacheId = newElement.data('reflexCacheId');
			
			this.updatePosition(event.pageY, event.pageX);
            
			if (this.element === newElement) {
                return;
            }
			
			if (!cacheId) {
				cacheId = elementInfoCache.length;
				elementInfoCache.push(undefined);
			}
            
			this.element = newElement;
			this.element.data('reflexCacheId', cacheId);
			
			elementInfoCache[cacheId] = this.elementInfo = elementInfoCache[cacheId] || new ElementInfo(newElement)
            this.updateText(this.elementInfo.type.toLowerCase());
        },
        updatePosition: function (top, left) {
            this.$el.css({
                top: top + 12,
                left: left + 12
            });
        },
        updateText: function (text) {
            this.$el.text(text).css('display', 'inline-block');
        },
        remove: function () {
            this.$el.remove();
            $('body :visible').off('mousemove.r');
            $('body').off('mouseout.r');
        }
    };
    /* Panel */
    panel = {
        PANELS: [],
        init_tmpl: function () {
            panel.tmpl = (function () {
                var tmpl = $('<div class="panel">' +
								'<div class="panel_title">' +
									'<a class="close_button" title="Close">' +
										'<span class="fa fa-times"></span></a></div>' +
								'<div class="panel_content">' +
									'<div class="tree">' +
										'<span class="dom_tree"></span><br>' +
									'</div>' +
									'<div class="label">Element Type' +
										'<br><span class="value">' +
											'<select id="select_type" class="input half_width"></select>'+
										'</span>' +
									'</div>' +
									'<div class="label">ID' +
										'<br><span class="value">' +
											'<input class="id input" type="text" id="elmId" readonly>' +
										'</span>' +
									'</div>' +
									'<div class="label">X Path' +
										'<br><span class="value">' +
											'<input class="x_path input" type="text" id="elmXPath" readonly>' +
										'</span>' +
									'</div>' +
									'<div class="button_div" id="addDiv">' +
										'<br><button id="btnAddElement" class="button">Add Element</button>' +
									'</div>' +
									'<div class="save_pane" id="savePane">' +
										'<div class="save_pane_div">Project' +
											'<br><span class="save_pane_value">' +
												'<select id="select_project" class="input full_width"></select>'+
											'</span>' +
										'</div>'+
										'<div class="save_pane_div">Page' +
											'<br><span class="save_pane_value">' +
												'<select id="select_page" class="input full_width">'+
													'<option value="-1">Please select a Project</option>'+
												'</select>'+
											'</span>' +
										'</div>'+
										'<div class="save_pane_div">DOM Element Name'+
											'<br><span class="save_pane_value">' +
												'<input type="text" id="dom_element_name" class="input full_width">'+
											'</span>' +
										'</div>' +
										'<div class="button_div">' +
											'<br><button id="btnSaveElement" class="button">Save Element</button>' +
										'</div>' +
									'</div>'+
								'</div>' +
							'</div>');
				return (function () {
                    return tmpl.clone();
                });
            }());
        },
        init: function () {
            $("body :visible").click(panel.pin);
			panel.init_tmpl();
        },
        restore: function () {
            $("body :visible").unbind("click", panel.pin);
            $.each(panel.PANELS, function (i, p) {
                $(p).remove();
            });
        },
		convertClassName: function(newPanel) {
			newPanel.find('*').add(newPanel).each(function(i, elem) {
				var className = $(elem).attr('class');

				if (className) {
					className = className.split(' ');
					$(elem).attr('class', css.getClassName(className));
				}
			});

			return newPanel;
		},
		clear: function () {
			$.each(panel.PANELS, function (i, p) {
                $(p).remove();
            });
		},
		//TODO: add ability to scroll back and forth and click on the domTree
        panelDomTree: function (elementInfo, newPanel) {
            $(newPanel).find(".dom_tree").html(elementInfo.domTree);
            return newPanel;
        },
		panelId: function (elementInfo, newPanel) {
			$(newPanel).find("#elmId").val(elementInfo.id);
            return newPanel;
        },
		panelXPath: function (elementInfo, newPanel) {
			$(newPanel).find("#elmXPath").val(elementInfo.xPath);
			return newPanel;
        },
        panelContent: function (elementInfo, newPanel) {
            $(['panelDomTree','panelId','panelXPath']).each(function (i, prop) {
                panel[prop](elementInfo, newPanel);
            });
        },
		bindEvents: function (newPanel) {
			$(newPanel).find(".close_button").click(function(e) {
				$(newPanel).remove();
				e.stopPropagation();
				return false;
			});
			
			$(newPanel).find('#btnAddElement').click(function () {
				$('#addDiv').hide();
				$('#savePane').show();
			});
			
			// update the Page dropdown when a new project is selected
			$(newPanel).find("#select_project").change(function() {
				var project = $('#select_project option:selected').text();
				console.log("calling getPageList with project=" + project);
				$.ajax({
				  url: 'http://dev.reflex.systems/page?id=' + project,
				  dataType:'JSON',
				  success:function(json){
					//clear the current content of the select
					$(newPanel).find('#select_page').html('');
					//iterate over the data and append a select option
					$.each(json, function(i, val){
					  $(newPanel).find('#select_page').append('<option value="' + val.id + '">' + val.name + '</option>');
					})
				  },
				  error:function(){
					//if there is an error append a 'none available' option
					$(newPanel).find('#select_page').html('<option value="-1">none available</option>');
				  }
				});	
			});
			
			$(newPanel).find('#btnSaveElement').click(function () {
				var data = {
					"name" : $('#dom_element_name').val(),
					"domTypeId" : $('select[id=select_type]').val(),		
					"idSelector" : $('#elmId').val(),		
					"pageId" : $('select[id=select_page]').val(),
					"createTimestamp" : new Date().toISOString().replace("T"," ").substr(0,19) // "2016-05-02 20:20:11" YYYY-MM-DD HH:MM:SS
				}
				console.log(data);
				
				$.ajax({
				  type: 'POST',
				  url: 'http://dev.reflex.systems/domElement',
				  dataType: 'JSON',
				  data: data,
				  success: function(){
					alert("SUCCESS");
				  }
				});			
			});
		
			return newPanel;
		},
		getElementTypeList: function (newPanel) {
			$.ajax({
			  url: 'http://dev.reflex.systems/lkDomType',
			  dataType:'JSON',
			  success:function(json){
				//clear the current content of the select
				$(newPanel).find('#select_type').html('');
				//iterate over the data and append a select option
				$.each(json, function(i, val){
				  $(newPanel).find('#select_type').append('<option value="' + val.id + '">' + val.name + '</option>');
				})
			  },
			  error:function(){
				//if there is an error append a 'none available' option
				$(newPanel).find('#select_type').html('<option value="-1">none available</option>');
			  }
			});
		
            return newPanel;
        },
		getProjectList: function (newPanel) {
			$.ajax({
			  url: 'http://dev.reflex.systems/project',
			  dataType:'JSON',
			  success:function(json){
				//clear the current content of the select
				$(newPanel).find('#select_project').html('');
				//iterate over the data and append a select option
				$.each(json, function(i, val){
				  $(newPanel).find('#select_project').append('<option value="' + val.id + '">' + val.name + '</option>');
				  })
			  },
			  error:function(){
				//if there is an error append a 'none available' option
				$(newPanel).find('#select_project').html('<option value="-1">none available</option>');
			  }
			});
		
            return newPanel;
		},
        get: function (elem) {
            // Create panel
            var p = panel.tmpl(), elementInfo = new ElementInfo(elem);
				
			elementInfo.domTree = elementInfo.getDomTree(elem);
			elementInfo.xPath = elementInfo.getXPath(elem);
            
			panel.panelContent(elementInfo, p);
			panel.getElementTypeList(p);
			panel.getProjectList(p);
			//panel.getPageList(default, p) // initialize the Page based upon first Project?
			panel.bindEvents(p);
            panel.convertClassName(p);
			
			$(p).click(function (e) {
                //$(this).find('*').css('-webkit-animation', 'none');// i don't know what this does..
                $(this).detach();
                $(this).appendTo('body');
            });
            
			return p;
        },
        pin: function (e) {
            // Add a panel according to event e
			var p;
			tip.hide();
			panel.clear(); // clear previous panel
			p = panel.get(this);
			
			$(p).css({
				'top': e.pageY + 12,
				'left': e.pageX - 13
			}).appendTo("body");
			
			panel.PANELS.push(p);
			e.stopPropagation();
			e.preventDefault();
        }
    };
    /* Controller */
    ctrl = {
        shortcut: function (e) {
            var key = e.keyCode || e.which;
            if (key === 27) { //escape
                ctrl.restore();
                e.stopPropagation();
            }
        },
        restore: function (e) { 
			// shut it all down
			$("body :visible").unbind('mousemove', ctrl.updateTip);
            $("body :visible").unbind('click', ctrl.pinPanel);
            
			tip.remove();
            panel.restore();
            css.restore();
            
			$("body").unbind("keydown", ctrl.shortcut);
            
			window._REFLEX = false;
			chrome.storage.local.remove('toolSelected');
        },
        init: function () {
			var loaded;
            
			if (!$ && jQuery) {
                $ = jQuery;
            }
            
			loaded = (typeof window._REFLEX !== 'undefined') && window._REFLEX;
            
			if (loaded || !$) {
                return false;
            }
            
			window._REFLEX = true;
            
			$.createElem = function (tag, className, content, attr) {
                // Shortcut for generating DOM element
                var e = $("<" + tag + ">");
                className = className || [];
                content = content || '';
                className = (typeof className === 'string') ? [className] : className;
                className.push('basic');
                e.addClass(css.getClassName(className));
                if (typeof content === 'string') {
                    e.html(content);
                } else if (content.constructor === Array) {
                    $.map(content, function (n, i) {
                        return e.append(n);
                    });
                } else {
                    e.append(content);
                }
                if (typeof attr !== 'undefined') {
                    e.attr(attr);
                }
                return e[0];
            };
			
            css.init();
            tip = new Tip();
            panel.init();
			
            $("body").keydown(ctrl.shortcut);
        }
    };
    
	_r = {
		setJQuery: function(jQ) {
			$ = jQ;
		},
		setCSSURL: function(url) {
			css.CSS_URL = url;
		},
		init: function() {
			ctrl.init();
		},
		restore: function() {
			ctrl.restore();
		}
	};

	return _r;
}

(function () {
	function start() {
		if (typeof _REFLEX !=="undefined" && _REFLEX) {
			console.log("closing reflex");
			return r.restore(), false;
		}
		
		console.log("loading reflex");
		r.init();
		return true;
	}
	
	var r = r || _reflex();
	
	chrome.extension.onMessage.addListener(
		function(request,sender,callback){
			console.log(request.action);
			request.action === "initOrRestore" && callback(start())
		}
	);
})()