
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
	var _value_wrapper=function(context,obj,view) {
		$(view).click(function() {
				var newval=prompt("Enter new val","");
				context("",newval);
		});		
		return view;	
	}
	var _display=function(context,obj,type) {
		var el;
		var tunnel=function(str,newval) {
			context(str,newval);
		};
		if (type=='hash') {	
			el=$("<dl/>");
			_.each(obj,function(val,key,o) {
				var child_type=_type(val);
				var label=$("<dt>",{text:key});
				var is_parent=child_type=='hash' || child_type=='array';
				tunnel=function(str,newval) {
					context("['"+key+"']"+str.toString(),newval);
				}
				var value_el=$("<dd>",{'data-type': child_type}).append(_display(tunnel,val,child_type));
				if (is_parent) {
					label.click(function() {
						value_el.toggle();
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
				tunnel=function(str,newval) {
					context("["+i+"]"+str.toString(),newval);
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
			el= _value_wrapper(tunnel,obj,$("<div>",{class: obj?'type-bool,type-bool-true':'type-bool,type-bool-false',text: obj?"TRUE":"FALSE"}));

		} else if (type=='null') {
			el=_value_wrapper(tunnel,obj,$("<div>",{class: 'type-null',text:"N/A"}));
		} else if (type=='unknown') {
			el=$("<div>",{class: 'type-unknown',text:"?"});
		} else {
			el=_value_wrapper(tunnel,obj,$("<div>",{class: 'type-'+type,text: obj}));
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
			target.empty().append(_display(function(str,val) {
					exec=("_object"+str+"='"+val+"';");
					eval(exec);
					instance.render(target);

			},_object,_type(_object)));
			$('.node-parent').click(function() {

			});
		}

	}
}
