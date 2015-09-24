# wallcology-selector

An element providing a starting point for your own reusable Polymer elements.

![][image-1]
## Dependencies

Element dependencies are managed via [Bower][1]. You can
install that via:

	npm install -g bower

Then, go ahead and download the element's dependencies:

	bower install


## Playing With Your Element

If you wish to work on your element in isolation, we recommend that you use
[Polyserve][2] to keep your element's
bower dependencies in line. You can install it via:

	npm install -g polyserve

And you can run it via:

	polyserve

Once running, you can preview your element at
`http://localhost:8080/components/wallcology-selector/index.html`, 

## To install in your app

 `bower install https://github.com/ltg-uic/wallcology-selector.git --save`

## Using it in code

        selectedBugs is an array property, see test-app.html

	    <wallcology-selector max-selections="2" selected-bugs="{{selectedBugs}}"></wallcology-selector>
	
	
	    selected bugs:
	    <template is="dom-repeat" items="{{selectedBugs}}">
	        <span>{{item}}</span>
	    </template>




## Testing Your Element

Simply navigate to the `/demo` directory of your element to run its tests. If
you are using Polyserve: `http://localhost:8080/components/wallcology-selector/index.html`

[1]:	http://bower.io/
[2]:	https://github.com/PolymerLabs/polyserve

[image-1]:	cap.png