var roleEnergyCourier = {

    /** @param {Creep} creep **/
    run: function(creep) {

        const courier_parking = [
            [17,37],
            [17,38],
            [17,39]
        ]

        var current_pos = [creep.pos.x, creep.pos.y];

        if (creep.memory.refueling && creep.store.getFreeCapacity() == 0) {
            creep.memory.refueling = false;
            creep.say("delivering");
        }
        if (!creep.memory.refueling && creep.store.getUsedCapacity() == 0) {
            creep.memory.refueling = true;
            creep.say("refueling");
        }

	    if (creep.memory.refueling) { // RETRIEVE ENERGY FROM CONTAINERS OR DROPPED ENERGY
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) != 0;
                }
            });
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES);

            if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE && dropped[0].amount > 300) {
                creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else { // DELIVER ENERGY TO SPAWN OR EXTENSIONS
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });    

            if (targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                // park in designated area
                // console.log(harvester_parking.includes(current_pos));
                if (!(courier_parking.includes(current_pos))) {
                    for (let i = 0; i < courier_parking.length; i++) {
                        const parking_space = creep.room.lookForAt(LOOK_CREEPS, courier_parking[i][0], courier_parking[i][1]);
                        if (parking_space.length == 0) {
                            creep.moveTo(courier_parking[i][0], courier_parking[i][1], {visualizePathStyle: {stroke: '#ffffff'}})
                            break;
                        }
                    }    
                }
            }
        }
	}
};

module.exports = roleEnergyCourier;