# nutella-connector

An element providing a starting point for your own reusable Polymer elements.


## Dependencies

Element dependencies are managed via [Bower](http://bower.io/). You can
install that via:

    npm install -g bower

Then, go ahead and download the element's dependencies:

    bower install


## Playing With Your Element

If you wish to work on your element in isolation, we recommend that you use
[Polyserve](https://github.com/PolymerLabs/polyserve) to keep your element's
bower dependencies in line. You can install it via:

    npm install -g polyserve

And you can run it via:

    polyserve

Once running, you can preview your element at
`http://localhost:8080/components/nutella-connector/`

## To install in your app

 `bower install https://github.com/ltg-uic/nutella-connector.git --save`

## To install nutella lib

`https://github.com/nutella-framework/nutella_lib.js`

 `npm install nutella_lib`


 `<nutella-connector connected={{connected}} id="nutellaConn" host="127.0.0.1" appid="wallcology" runid="default"
                        componentid="wallcology_admin"></nutella-connector>`

## Testing Your Element

Simply navigate to the `/demo` directory of your element to run its tests. If
you are using Polyserve: `http://localhost:8080/components/nutella-connector/demo/`
