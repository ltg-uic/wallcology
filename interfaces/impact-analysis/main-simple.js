((nutella_lib) => {
    let query_parameters = nutella_lib.parseURLParameters();

    let nutella = nutella_lib.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());

    console.log("has nutella?", nutella_lib, query_parameters);
    const body = d3.select('body');
    // Parse the query parameters
    // if no INSTANCE, it's a login

    if (query_parameters.INSTANCE === undefined) {

        body.selectAll('div')
            .data(['Class', 'Role', 'Instance']).enter()
              .append('div')
                .text(d => d + ' ')
              .append('input')
                .attr('type', 'text')
                .attr('id', (d) => d.toLowerCase() )

        body
            .append('button')
                .text('Set')
                .on('click', () => {
                    alert(location.href + '&INSTANCE=' + d3.select('#instance').node().value)
                    location.href += '&INSTANCE=' + d3.select('#instance').node().value
                })

    } else {

        // otherwise, we're ready to go, given the instance
        const channel_lineup = [{
                id: 'abiotic_controls',
                name: 'Abiotic controls',
                URL: 'http://localhost:57880/wallcology/default/runs/abiotic-controls/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'
            }, {
                id: 'biotic_controls',
                name: 'Biotic controls',
                URL: 'http://localhost:57880/wallcology/default/runs/biotic-controls/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'
            }, {
                id: 'history',
                name: 'History',
                URL: 'http://localhost:57880/wallcology/default/runs/ecosystem-history/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'
            }, {
                id: 'enactment',
                name: 'Enactment',
                URL: 'http://localhost:57880/wallcology/default/runs/enactment-control/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'
            }, {
                id: 'model_editor',
                name: 'Model Editor',
                URL: 'http://localhost:57880/wallcology/default/runs/newModelEditor/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'
            }];

        // construct_user_interface(body, channel_lineup, query_parameters.INSTANCE);
        let instance = query_parameters.INSTANCE;

        body.append('ul')
            .attr('class', 'tab')
          .selectAll('li')
             .data(channel_lineup).enter()
          .append('li')
          .append('a')
            .attr('href', '#')
            .attr('class', 'tablinks')
            .text(d => d.name)
            .on('click', d  => {
                console.log("click", d3.select(this), d.name);
                d3.selectAll('.tabcontent')
                    .style('display', 'none');

                d3.selectAll('.tablinks')
                    .classed('active', false);

                d3.select(document.getElementById(d.name))
                    .style('display', 'inline')
                    .classed('active', true);
            })

        body.selectAll('div')
            .data(channel_lineup).enter()
                .append('div')
                    .attr('id', d => d.name )
                    .attr('class', 'tabcontent')
                    .style('display', 'none')
                .append('iframe')
                    .attr('src', d => d.URL + "&INSTANCE=" + instance)
                    .style('border', 'none')
                    .attr('width', '100%')
                    .attr('height', '100%')

    }

})(NUTELLA)
