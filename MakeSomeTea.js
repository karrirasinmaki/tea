var Tea = {};

//Canvas&Context
Tea.canvasId;
Tea.context;

//Dead spreads' context
Tea.deadContext;

//Basic vars
Tea._intervalId = 0;
Tea.colors = {mix: false, color: ["#D2551B","B22801"]};
Tea.mug;
Tea.wind = {x:0.2, y:0.2}; //x, y
Tea.power = {a0:0, a1:360, F:5}; //from deg, to deg, power
Tea.gravity = {x:0, y:0, F:9}; //gravity point x, gravity point y, power
Tea.maxSpeed = 12;
Tea.blur = 0.9;

Tea.explode = 0;

//Performance setups
Tea.fps = 60;
Tea.maxSpreads = 300;

Tea.borders = {
	top: false,
	right: false,
	bottom: false,
	left: false
};

//Spread container
Tea.Spreads = [];
Tea.Spread = function(x1, y1, fx, fy, img, size) {
	this.x1=x1;
	this.y1=y1;
	this.fx = fx;
	this.fy = fy;
	this.img = img;
	this.size = size;
	this.age = 0;
};
Tea.autoDie = 0;

Tea.Fluid = {};
/*
Tea.Spread = function(x1, y1, x2, y2, x3, y3, x4, y4, fx, fy, img) {
	this.x1=x1;
	this.y1=y1;
	this.x2=x2;
	this.y2=y2;
	this.x3=x3;
	this.y3=y3;
	this.x4=x4;
	this.y4=y4;
	this.fx = fx;
	this.fy = fy;
	this.img = img;
};
*/

Tea.inited = false;

Tea.init = function() {
	var T = Tea;

	T.context = document.getElementById(T.canvasId).getContext("2d");
	T.inited = true;

	canvas = document.createElement("canvas");
	T.deadContext = canvas.getContext("2d");
	canvas.width = T.context.canvas.width;
	canvas.height = T.context.canvas.height;
	T.deadContext.clearRect(0,0,canvas.width,canvas.height);
	
	//Power
	if(Tea.power.a0 == 360) Tea.power.a0 = 359.9;
	if(Tea.power.a0 == 0) Tea.power.a0 = 0.1;
	if(Tea.power.a1 == 360) Tea.power.a1 = 359.9;
	if(Tea.power.a1 == 0) Tea.power.a1 = 0.1;

};

Tea.makeSome = function(mugId) {
	var T = Tea;
	//Init
	if(!T.inited) {
		T.init();
	}

	if(mugId != null) {
		var mug = document.getElementById(mugId);
		Tea.mug = {
			x: mug.offsetLeft + mug.offsetWidth/2,
			y: mug.offsetTop + mug.offsetHeight/2
		};
	}
	else {
		Tea.mug = {
			x: "random",
			y: "random"
		};
	}

	T._intervalId = setInterval(teaBagger, 1000/T.fps);

	//The loop function
	function teaBagger() {
		//T.context.clearRect(0, 0, T.context.canvas.width, T.context.canvas.height);
		T.context.save();
		T.context.globalAlpha = 1-T.blur;
		T.context.fillStyle = "#000";
		T.context.fillRect(0,0,T.context.canvas.width,T.context.canvas.height);
		T.context.restore();
		T.context.drawImage(T.deadContext.canvas, 0, 0);

		if(Math.random() > 0.8 && T.Spreads.length < T.maxSpreads)
			T.spreadSomeMore(5);

		T.moveSpreads();
	}
};

Tea.rand = function(from, to) {
	to -= from;
	return from+Math.random()*to;
};


//Makes new spreads
Tea.spreadSomeMore = function(amount) {
	var x = Tea.mug.x;
	var y = Tea.mug.y;
	if(x == "random")
		x = Tea.rand(0, Tea.context.canvas.width);
	if(y == "random")
		y = Tea.rand(0, Tea.context.canvas.height);
	var size = 40-Tea.rand(0, 5);

	for(var i=0; i<amount; i++) {
		x2 = -10+Math.random()*20;
		y2 = -10+Math.random()*20;
		x3 = -10+Math.random()*20;
		y3 = -10+Math.random()*20;

		color = Tea.colors.color[ Math.round( Math.random()*(Tea.colors.color.length-1) ) ];

		//Prepare canvas
		ce = document.createElement("canvas"),
			c = ce.getContext("2d");
		ce.width = ce.height = size;
		c.clearRect(0, 0, c.canvas.width, c.canvas.height);

		//Draw spread
		if(Tea.colors.mix) {
			rad = c.createRadialGradient(20,20,0,20,20,40);
			var len = Tea.colors.color.length-1;
			for(var i=0; i<len; i++) {
				rad.addColorStop((len+1)/(i+1), Tea.colors.color[i]);
			}
			c.fillStyle = rad;
		}
		else
			c.fillStyle = color;


		c.strokeStyle = color;
		c.globalAlpha = 0.4+Math.random();

		c.beginPath();
		c.moveTo(20, 20);
		c.bezierCurveTo(10+x2,10+y2,30+x3,30+y3,20,20);
		//c.stroke();

		//c.shadowColor = color;
		//c.shadowBlur = 20;

		c.fill();

		powerX = 1/Math.sin( Tea.rand(Tea.power.a0,Tea.power.a1) );
		powerY = 1/Math.sin( 90-Tea.rand(Tea.power.a0,Tea.power.a1) );
		Tea.Spreads.push(
			/*
			new Tea.Spread(
				x-7+Math.random()*14, y-7+Math.random()*14,
				x-45+Math.random()*90, y-45+Math.random()*90,
				x-45+Math.random()*90, y-45+Math.random()*90,
				x-45+Math.random()*90, y-45+Math.random()*90,
				2-Math.random()*4, 2-Math.random()*4,
				Tea.colors[ Math.round( Math.random()*(Tea.colors.length-1) ) ]
			)
*/
			new Tea.Spread(
				x-7+Math.random()*14, y-7+Math.random()*14,
				powerX*Tea.power.F, powerY*Tea.power.F,
				c.canvas, size
			)
		);
	}
};

/*
===== =====
||   ||   ||
||   ||   ||
*/
//Moves spreads around
Tea.moveSpreads = function() {
	var c = Tea.context;

	w = c.canvas.width;
	h = c.canvas.height;

	for(var i=0; i<Tea.Spreads.length; i++) {
		s = Tea.Spreads[i];

		if(!s.dead) {

			var gravity = Tea.gravity.F;
			if(Tea.explode > 0) {
				gravity = -gravity*Tea.explode
				Tea.explode -= 0.02;
			}

			//Gravity
			suhde = c.canvas.width/c.canvas.height;
			gravityX = gravity*( (Tea.gravity.x-s.x1)/c.canvas.width )*suhde;
			gravityY = gravity*( (Tea.gravity.y-s.y1)/c.canvas.height );

			s.fx += gravityX;
			s.fy += gravityY;

			s.x1 += s.fx += Tea.wind.x/10;
			s.y1 += s.fy += Tea.wind.y/10;

			

			//Limit speed
			oper = s.fx;
			if(Math.abs(s.fx) > Tea.maxSpeed*s.size/20){
				s.fx = Tea.maxSpeed;
				if(oper < 0)
					s.fx *= -1;
			}
			oper = s.fy;
			if(Math.abs(s.fy) > Tea.maxSpeed*s.size/20){
				s.fy = Tea.maxSpeed;
				if(oper < 0)
					s.fy *= -1;
			}
		}

		//Draw spread on big canvas
		c.drawImage(s.img, s.x1, s.y1);

		//Divide spread
		if(Math.random() > 1) {
			tmp = document.createElement("canvas").getContext("2d");
			tmp.scale(0.5, 0.5);
			tmp.drawImage(s.img, 0, 0);
			s.img = tmp.canvas;

			Tea.Spreads.push(
				new Tea.Spread(
					s.x1-20+Math.random()*40, s.y1-20+Math.random()*40,
					s.fx-1+Math.random()*2, s.fy-1+Math.random()*2,
					tmp.canvas
				)
			);
		}

		//Spread crossing right border
		if( s.x1 > w && s.fx >= 0 ) {
			if(Tea.borders.right) {
				s.x1 = w + Tea.rand(-s.size*0.4, -s.size*0.7);
				s.dead = true;
			} else
				s.x1 = -40;
		}

		//Spread crossing left border
		if( s.x1 < 0 && s.fx <= 0) {
			if(Tea.borders.left) {
				s.x1 = Tea.rand(-s.size*0.4, -s.size*0.7);
				s.dead = true;
			} else
				s.x1 = w +40;
		}

		//Spread crossing top border
		if( s.y1 < 0 && s.fy <= 0) {
			if(Tea.borders.top) {
				s.y1 = Tea.rand(-s.size*0.4, -s.size*0.7);
				s.dead = true;
			} else
				s.y1 = h +40;
		}

		//Spread crossing bottom border
		if( s.y1 > h && s.fy >= 0 ) {
			if(Tea.borders.bottom) {
				s.y1 = h + Tea.rand(-s.size*0.4, -s.size*0.7);
				s.dead = true;
			} else
				s.y1 = -40;
		}

		if(s.dead) {
			Tea.deadContext.drawImage(s.img, s.x1, s.y1);
			Tea.Spreads.splice(i, 1);
		}

		//Delete some dead spreads if amount over maximum
		if(Tea.Spreads.length > Tea.maxSpreads && s.dead
			|| s.age > Tea.autoDie) {
			Tea.Spreads.splice(i, 1);
		}

		if(Tea.autoDie > 0)
			s.age++;
	}

};