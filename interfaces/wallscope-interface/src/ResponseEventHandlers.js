function handleStartEvent(m) {
    console.log("It Has Begun!!", m);

    hasStarted = true;

    configuration = m.configuration;
    currentWallscope = m.configuration[wallscopeId];


    var bugMaterials = {}
    var bugGeometry = new THREE.SphereGeometry(35, 15, 15)
    //
    //m.scopeConfiguration.forEach(function(config) {
    //    // console.log("\tconfig: ",config);
        currentWallscope.bugs.forEach(function(bug){
            // console.log("\tbug: ",bug.name);
            if (!CritterGroups.getObjectByName(bug.name)) {
                var critters = new THREE.Object3D();
                critters.name = bug.name
                CritterGroups.add(critters);
            }

            if (!bugMaterials.hasOwnProperty(bug.name)){
                // console.log("missing")
                bugMaterials[bug.name] = new THREE.MeshBasicMaterial({
                    color: bug.color
                });
            }

            for (var i = 0; i < bug.population; i++) {
                createCritter(bug, bugGeometry, bugMaterials[bug.name]);
            }
        })
    //})
}


function handleUpdateScopeEvent(m) {
    console.log("Updating message", m);
    var bugMaterials = {}
    var bugGeometry = new THREE.SphereGeometry(35, 15, 15)

    
    m.scopeConfiguration.bugs.forEach(function(bug) {
        if (!CritterGroups.getObjectByName(bug.name)) {
            var _c = new THREE.Object3D();
            _c.name = _c.name
            CritterGroups.add(_c);
        }

        if (!bugMaterials.hasOwnProperty(bug.name)){
            // console.log("missing")
            bugMaterials[bug.name] = new THREE.MeshBasicMaterial({
                color: bug.color
            });
        }

        var critters = CritterGroups.getObjectByName(bug.name)

        if (critters.children.length < bug.population) {
            console.log("Need more",bug.name)
            for (var i = 0; critters.children.length < bug.population; i++) {
                createCritter(bug, bugGeometry, bugMaterials[bug.name]);
            }

        } else {

            // critters.children.length > bug.population;
            while (critters.children.length > bug.population){
                console.log("\t", critters.children[0], length);
                var tribute = Math.floor(Math.random() * critters.children.length);
                var bugMesh = critters.children[tribute];
                critters.remove(bugMesh);
                if (critters.name === "Spikey Bug") {
                    bugMesh.children.forEach(function(mesh) {
                        bugMesh.remove(mesh)
                        mesh.geometry.dispose();
                        mesh.material.dispose();
                    })
                } else {
                    bugMesh.geometry.dispose();
                    bugMesh.material.dispose();
                }
            }

        };
    });
}


function handleStopEvent(m) {
    console.log("stop", m);
    hasStarted = false;
    CritterGroups.children.forEach(function(critters) {
        // console.log("\tcritters", critters.children.length, critters );
        while (critters.children.length > 0){
            // console.log("\t", critters.children[0], length);
            var bugMesh = critters.children[0];
            critters.remove(bugMesh);
            if (critters.name === "Spikey Bug") {
                bugMesh.children.forEach(function(mesh) {
                    bugMesh.remove(mesh)
                    mesh.geometry.dispose();
                    mesh.material.dispose();

                })
            } else {
                bugMesh.geometry.dispose();
                bugMesh.material.dispose();
            }
        }
    });
}
