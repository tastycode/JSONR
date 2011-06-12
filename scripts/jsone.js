
var JSONEditor = function() {
	var _object={};
	var _state={};
	var _type=function( obj) {
		if (_.isArray(obj)) return "array";
		if (_.isBoolean(obj)) return "bool";
		if (_.isNull(obj)) return "null";
		if (_.isNumber(obj)) return "number";
		if (_.isDate(obj)) return "date";
		if (_.isString(obj)) return "string";
		if (Object.prototype.toString.call(obj)=="[object Object]") return "hash";
		return "unknown";
	}
	var _render_editor=function(target,val,type,on_submit){
		target.empty();
		var label=$("<label>",{text:"Raw Value"});
		var text_editor=$("<input>",{val: val,id:"value-target"});	
		target.append(label);
		target.append(text_editor);
		switch (type) {
			case 'hash':
				on_submit("{}");
				$('#leaf-editor').remove();
			break;
			case 'array':
				on_submit("[]");
				$('#leaf-editor').remove();
			break;
			case 'number':
				if (_.isNaN(val)) val =0;

				var slider=$("<div>",{id:"slider"});
				slider.slider({
					value:val,
					change:function(e,ui) {
						$('#value-target').val(ui.value);		
					}
				});

				target.append(slider);
			break;
			case 'bool':
				var radios=$("<div>",{id:"radios"});
				var on_opt=$("<input>",{
					type:"radio",
					id:"radio-on",
					name:"bool-val",
					value:"true"});
				var on_label=$("<label>",{for:"radio-on",text:"On"});
				on_label.click(function() {
					$('#value-target').val("true");
				});
				var off_opt=$("<input>",{
					type:"radio",
					id:"radio-off",
					name:"bool-val",
					value:"false"});
				var off_label=$("<label>",{for:"radio-off",text:"Off"});
				off_label.click(function() {
					$('#value-target').val("false");
				});
				if (val)	
					on_opt.attr('checked',true) 
				else
					off_opt.attr('checked',true);
				radios.append(on_opt);
				radios.append(on_label);
				radios.append(off_opt);
				radios.append(off_label);
				target.append(radios);
				radios.buttonset();
			break;
			case 'date':
				text_editor.datepicker();		
			break;
		}




	}
	var _create_editor=function(val,type,on_submit) {
		$('#leaf-editor').remove();
		var editor=$("<div/>",{id:"leaf-editor"})
		var form=$("<form/>");
		var fieldset=$("<fieldset/>");
		form.append(fieldset);
		editor.append(form);
		var container=fieldset;
		container.append($("<label>",{text:"Data Type"}));
		var select_menu=$("<select>");
		options={
			'string':"Text",
			'number':"Number",
			'null':"Nothing",
			'date':"Date",
			'bool':"True/False",
			'array':"New List",
			'hash':"New Object"
		}
		_.each(options,function(val,key) {
			var option=$("<option>",{value:key,text:val,selected: key==type});
			select_menu.append(option);
		});
		var edit_area=$("<div>",{id:'leaf-editor-value'});
	
		select_menu.bind('change',function() {
			_render_editor(edit_area, val, $(this).val(),on_submit);
		});
		container.append(select_menu);
		container.append(edit_area);
		editor.dialog({
			title:"Edit Value",
			height: 300,
			width: 300,
			modal: true,
			buttons: {
				"OK":function() {
					try {
						on_submit($("#value-target",this).val());
					} catch (e) {

						on_submit('"'+$("#value-target",this).val()+'"');
					}
					$(this).dialog('close');
				},
				"Cancel":function() {
					$(this).dialog('close');
				}
			}
				
		});
		editor.dialog('open');
		select_menu.trigger('change');
	}
	var _parent_hover=function(label,child_type,tunnel) {
			return function() {
						var node_menu=$("<span>",{class:'ui-widget-header ui-corner-all node-menu'});
						var add_button=$("<button>",{title:"Add Node"}).button({
							text: false,
							icons:{primary: "ui-icon-seek-start"}
						}).click(_add_node(child_type,tunnel));
						var del_button=$("<button>",{title:"Delete Node"}).button({
							text:false,
							icons:{primary: "ui-icon-stop"}
						}).click(_del_node(tunnel));
						node_menu.append(add_button);
						node_menu.append(del_button);

						label.append(node_menu);
					}
	};
	var _del_node=function(context) {
		return function() {
			var dfunc=function(obj,path,node) {
				var exec="delete obj"+path;
				eval(exec);
				return obj;	
			}
			context("",dfunc);	
		}

	};
	var _add_node=function(type,context) {
		console.log("Creating function for "+type);
		return function() {
			var dfunc=function(obj,path,node) {
				if (type=='hash') {
					var name=prompt("Please enter a name","");
					var exec="obj"+path+"['"+name+"']=null;";
				} else {
					var exec="obj"+path+".push(null);";
				}
				eval(exec);
				return obj;
			};
			context("",dfunc);
		}
	};
	var _value_wrapper=function(context,obj,view,type) {
		var env=this;
		var edit=function() {
			//this is a change operation, so we create a function that changes the 
			//root to modify this node
			var on_submit=function(newval) {
				var dfunc=function(obj,path,node) {
					var exec="obj"+path+"="+newval;
					eval(exec);
					return obj;
				}
				context("",dfunc);
			}	
			_create_editor(obj,type,on_submit);
			//node will be the leaf, obj will be the whole tree
		};
		//show editing menu 
		$(view).hover(function() {
			//create editor interface 
			//kill other editors
			var leaf_menu=$("<span/>",{class:'ui-widget-header ui-corner-all leaf-menu'});
			var edit_button=$("<button>",{title:"Edit"}).button({
				text:"Edit",
				icons: {
					primary:"ui-icon-seek-next"
				}
			}).click(edit);
			var del_button=$("<button>",{title:"Remove"}).button({
				text:"Remove",
				icons: {
					primary: "ui-icon-seek-prev"
				}
			}).click(_del_node(context));
			leaf_menu.append(edit_button);
			leaf_menu.append(del_button);
			view.append(leaf_menu);
		},function() {
			$('.leaf-menu').remove();
		});
		return view;	
	}

	var _display=function(context,obj,type) {
		var el;
		var tunnel=function(str,dfunc) {
			context(str,dfunc);
		};
		if (type=='hash') {	
			el=$("<dl/>");
			_.each(obj,function(val,key,o) {
				var child_type=_type(val);
				var label=$("<dt>",{text:key});
				var is_parent=child_type=='hash' || child_type=='array';
				var tunnel=function(str,dfunc) {
					context("['"+key+"']"+str.toString(),dfunc);
				}
				var value_el=$("<dd>",{'data-type': child_type}).append(_display(tunnel,val,child_type));
				if (is_parent) {
					label.click(function() {
						value_el.toggle();
					});
					label.hover(_parent_hover(label,child_type,tunnel),function() {
						$('.node-menu').remove();
					});
				}
				el.append(label);
				el.append(value_el);
				
			});
			el.addClass('node-parent');
		} else if (type=='array') {
			el=$("<ul/>");
			_.each(obj,function(val,i,o) {
				var child_type=_type(val);
				var is_parent=child_type=='hash' || child_type=='array';
				var label=$("<div/>",{text:"-",title:i});
				tunnel=function(str,dfunc) {
					context("["+i+"]"+str.toString(),dfunc);
				}
				var value_el=_display(tunnel,val,child_type);
				var list_el=$("<li>",{'data-type':child_type});
				if (is_parent) {
					label.click(function() {
						value_el.toggle();
					});
					label.hover(_parent_hover(label,child_type,tunnel),function() {
						$('.node-menu').remove();
					});
					list_el.append(label);
				}
				list_el.append(value_el);
				el.append(list_el);
			});
			el.addClass('node-parent');
		} else if (type=='bool') {
			el= _value_wrapper(tunnel,obj,$("<div>",{class: obj?'type-bool,type-bool-true':'type-bool,type-bool-false',text: obj?"TRUE":"FALSE"}),type);

		} else if (type=='null') {
			el=_value_wrapper(tunnel,obj,$("<div>",{class: 'type-null',text:"N/A"}),type);
		} else if (type=='unknown') {
			el=$("<div>",{class: 'type-unknown',text:"?"});
		} else {
			el=_value_wrapper(tunnel,obj,$("<div>",{class: 'type-'+type,text: obj}),type);
		}
		return el;

	}
	return {
		load: function(obj) {
			_object={"/":obj};
		},
		value: function() {
			return _object["/"];
	       },
		render: function(target) {
			var instance=this;
			target.empty().append(_display(function(str,dfunc) {

					var node=eval("_object"+str);
					dfunc(_object,str,node);
					instance.render(target);

			},_object,_type(_object)));
		}

	}
}
