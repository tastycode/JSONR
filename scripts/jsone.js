
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
	var _create_editor=function() {};
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
			var newval=prompt("Enter new val","");
			//node will be the leaf, obj will be the whole tree
			var dfunc=function(obj,path,node) {
				try {
					var exec="obj"+path+"="+newval;
					eval(exec);
				} catch (e) {
					newval='"'+newval+'"';
					var exec="obj"+path+"="+newval;
					eval(exec);
				}
				return obj;
			}
			context("",dfunc);
		};
		//show editing menu 
		$(view).click(function() {
			//create editor interface 
			//kill other editors
			$('.editor').remove();
			var editor=$("<div>",{class:'editor'});
			editor.append($("<span>",{text:"Edit"}).click(edit));
			editor.append($("<span>",{text:"Delete"}).click(_del_node(context)));
			view.append(editor);
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
					label.hover(function() {
						var node_menu=$('<div>',{class:'node-menu'});
						var add_link=$('<span>',{text:'Add'}).click(_add_node(child_type,tunnel));
						var del_link=$('<span>',{text:'Delete'}).click(_del_node(tunnel));
						node_menu.append(add_link);
						node_menu.append(del_link);	
						label.append(node_menu);
					},function() {
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
					label.hover(function() {
						var node_menu=$('<div>',{class:'node-menu'});
						var add_link=$('<span>',{text:'Add'}).click(_add_node(child_type,tunnel));
						var del_link=$('<span>',{text:'Delete'}).click(_del_node(tunnel));
						node_menu.append(add_link);
						node_menu.append(del_link);	
						label.append(node_menu);
					},function() {
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
			$('.node-parent').click(function() {

			});
		}

	}
}
