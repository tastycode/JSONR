
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
	var _value_wrapper=function(context,obj,view,type) {
		var edit=function() {
			//this is a change operation, so we create a function that changes the 
			//root to modify this node
			var newval=prompt("Enter new val","");
			//node will be the leaf, obj will be the whole tree
			var dfunc=function(obj,path,node) {
				if (type=="string")
					newval='"'+newval+'"';
				var exec="obj"+path+"="+newval;
				eval(exec);
				return obj;
			}
			context("",dfunc);
		};
		var del=function() {
			//this should delete this node from the root
			var dfunc=function(obj,path,node) {
				var exec="delete obj"+path;
				eval(exec);
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
			editor.append($("<span>",{text:"Delete"}).click(del));
			view.append(editor);
		});
		$(view).bind('rightclick',function() {
			alert("You double clicked me!");
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
						var add_link=$('<span>',{text:'Add'}).click(function() {
							var dfunc=function(obj,path,node) {
								alert(path);
								if (child_type=='hash') {
									var name=prompt("Please enter a name","");
									var exec="obj"+path+"['"+name+"']=null;";
								} else {
									var exec="obj"+path+".push(null);";
								}
								alert(exec);
								eval(exec);
								return obj;
							};
							tunnel("",dfunc);
						});
						
						node_menu.append(add_link);
						
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
				var label=$("<span/>",{text:"-",title:i});
				tunnel=function(str,dfunc) {
					context("["+i+"]"+str.toString(),dfunc);
				}
				var value_el=_display(tunnel,val,child_type);
				var list_el=$("<li>",{'data-type':child_type});
				if (is_parent) {
					label.click(function() {
						value_el.toggle();
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
