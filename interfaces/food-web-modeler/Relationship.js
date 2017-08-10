function Relationship(){
	//green, lime, yellow, orange, pink
	this.arrows = [
		{name:"green-lime", type:"eatenby"},
		{name:"green-yellow", type:"eatenby"},
		{name:"green-orange", type:"eatenby"},
		{name:"green-pink",type:"eatenby"},
		{name:"lime-yellow", type:"eatenby"},
		{name:"lime-orange", type:"eatenby"},
		{name:"lime-pink", type:"eatenby"},
		{name:"yellow-orange", type:"eatenby"},
		{name:"yellow-pink", type:"eatenby"},
		{name:"orange-pink", type:"eatenby"}
		];
	
	this.graphs = [
		{name:"lion", increase:[{name:"zebra", result: "laggeddecrease", connections:["zebra-lion"]}, 
				  				{name:"grass", result: "laggedincrease", connections:["zebra-lion","grass-zebra"]},
							  	{name:"tree", result: "laggeddecrease", connections:["zebra-lion","grass-zebra","grass-tree"]},
							  	{name:"leopard", result: "laggeddecrease", connections:["zebra-lion","zebra-leopard"]}], 
					  decrease:[{name:"zebra", result: "laggedincrease", connections:["zebra-lion"]}, 
								{name:"grass", result: "laggeddecrease", connections:["zebra-lion","grass-zebra"]},
								{name:"tree", result: "laggedincrease", connections:["zebra-lion","grass-zebra","grass-tree"]},
								{name:"leopard", result: "laggedincrease", connections:["zebra-lion","zebra-leopard"]}]},
	  	{name:"zebra", increase:[{name:"lion", result: "laggedincrease", connections:["zebra-lion"]}, 
	  						  	{name:"grass", result: "laggeddecrease", connections:["grass-zebra"]},
	  						  	{name:"tree", result: "laggedincrease", connections:["grass-zebra","grass-tree"]},
	  						  	{name:"leopard", result: "laggedincrease", connections:["zebra-leopard"]}], 
	  			  	  decrease:[{name:"lion", result: "laggeddecrease", connections:["zebra-lion"]}, 
	  						  	{name:"grass", result: "laggedincrease", connections:["grass-zebra"]},
	  						  	{name:"tree", result: "laggeddecrease", connections:["grass-zebra","grass-tree"]},
	  						  	{name:"leopard", result: "laggeddecrease", connections:["zebra-lion","zebra-leopard"]}]},
	  	{name:"grass", increase:[{name:"lion", result: "laggedincrease", connections:["zebra-lion","grass-zebra"]}, 
	  						  	{name:"zebra", result: "laggedincrease", connections:["grass-zebra"]},
	  						  	{name:"tree", result: "laggeddecrease", connections:["grass-tree"]},
	  						  	{name:"leopard", result: "laggedincrease", connections:["grass-zebra","zebra-leopard"]}], 
	  			  	  decrease:[{name:"lion", result: "laggeddecrease", connections:["zebra-lion","grass-zebra"]}, 
	  						  	{name:"zebra", result: "laggeddecrease", connections:["grass-zebra"]},
	  						  	{name:"tree", result: "laggedincrease", connections:["grass-tree"]},
	  						  	{name:"leopard", result: "laggeddecrease", connections:["grass-zebra","zebra-leopard"]}]},
	  	{name:"tree", increase:[{name:"lion", result: "laggeddecrease", connections:["zebra-lion","grass-zebra","grass-tree"]}, 
	  						  	{name:"zebra", result: "laggeddecrease", connections:["grass-zebra","grass-tree"]},
	  						  	{name:"grass", result: "laggeddecrease", connections:["grass-tree"]},
	  						  	{name:"leopard", result: "laggeddecrease", connections:["grass-zebra","grass-tree","zebra-leopard"]}], 
	  			  	  decrease:[{name:"lion", result: "laggedincrease", connections:["zebra-lion","grass-zebra","grass-tree"]}, 
	  			  	  			{name:"zebra", result: "laggedincrease", connections:["grass-zebra","grass-tree"]},
	  						  	{name:"grass", result: "laggedincrease", connections:["grass-tree"]},
	  						  	{name:"leopard", result: "laggedincrease", connections:["grass-zebra","grass-tree","zebra-leopard"]}]},
	  	{name:"leopard", increase:[{name:"lion", result: "laggeddecrease", connections:["zebra-lion","zebra-leopard"]}, 
	  							{name:"zebra", result: "laggeddecrease", connections:["zebra-leopard"]},
	  						  	{name:"grass", result: "laggedincrease", connections:["zebra-leopard","grass-zebra"]},
	  						  	{name:"tree", result: "laggeddecrease", connections:["zebra-leopard","grass-zebra","grass-tree"]}], 
	  			  	  decrease:[{name:"lion", result: "laggedincrease", connections:["zebra-lion","zebra-leopard"]},
	  			  	  			{name:"zebra", result: "laggedincrease", connections:["zebra-leopard"]},
	  						  	{name:"grass", result: "laggeddecrease", connections:["zebra-leopard","grass-zebra"]},
	  						  	{name:"tree", result: "laggedincrease", connections:["zebra-leopard","grass-zebra","grass-tree"]}]}
		];
	/*							
	//if the population of lions increase/decrease, the population of the other species also increase (true/false)
	this.lion = 
		{ increase: 
			{ zebra: false, grass: true, tree: false, leopard: false },
		  decrease:
			{ zebra: true, grass: false, tree: true, leopard: true }, 
		  //zebra: "eats",
		  //grass: "indirect",
		  //tree: "indirect",
		  //leopard: "indirect"
		};
		/*
	this.zebra = 
		{ increase: 
			{ lion: true, grass: false, tree: true, leopard: true },
		  decrease:
			{ lion: false, grass: true, tree: false, leopard: false },
			  lion: "eatenby",
			  grass: "eats",
			  tree: "indirect",
			  leopard: "eatenby"};
	this.grass = 
		{ increase: 
			{ lion: true, zebra: true, tree: false, leopard: true },
		  decrease:
			{ lion: false, zebra: false, tree: true, leopard: false }
			  lion: "indirect",
			  zebra: "eatenby",
			  tree: "competition",
			  leopard: "indirect"};
	this.tree = 
		{ increase: 
			{ lion: false, zebra: false, grass: false, leopard: false },
		  decrease:
			{ lion: true, zebra: true, grass: true, leopard: true }
			  lion: "indirect",
			  zebra: "indirect",
			  grass: "competition",
			  leopard: "indirect"};
	this.leopard = 
		{ increase: 
			{ lion: false, zebra: false, grass: true, tree: false },
		  decrease:
			{ lion: true, zebra: true, grass: false, tree: true }
	  		  lion: "indirect",
	  		  zebra: "eats",
			  grass: "indirect",
			  tree: "indirect",
			  leopard: "indirect"};
			 */ 
}