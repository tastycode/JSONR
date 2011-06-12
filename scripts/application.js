var Application={};
$(function() {
	Application.jse=new JSONEditor();
	var obj={people: [
		{name: 'john',age: 21},
		{name: 'ashley',age: 25},
		{name: 'chris',age:30}
	],
	closed:false,
	hobbys: ['fishing','boating']};
	Application.jse.load(obj);
	Application.jse.render($("#target"));
});
