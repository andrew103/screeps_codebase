var roleEnergyCourier = {

    /** @param {Creep} creep **/
    run: function(creep) {

        const harvester_parking = [
            [11, 28],
            [11, 29],
            [12, 28],
            [12, 29],
        ]

        var current_pos = [creep.pos.x, creep.pos.y];
        var refuel_flag;


	    if (creep.store.getFreeCapacity() > 0) {
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) != 0;
                }
            });
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES);

            if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE && dropped[0].amount > 300) {
                creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if (targets.length > 0) {
                if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }

            if (creep.store.getFreeCapacity() == 0) {
                refuel_flag = false;
            }
        }
        else {
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
                if (!(harvester_parking.includes(current_pos))) {
                    for (let i = 0; i < harvester_parking.length; i++) {
                        const parking_space = creep.room.lookForAt(LOOK_CREEPS, harvester_parking[i][0], harvester_parking[i][1]);
                        if (parking_space.length == 0) {
                            creep.moveTo(harvester_parking[i][0], harvester_parking[i][1], {visualizePathStyle: {stroke: '#ffffff'}})
                            break;
                        }
                    }    
                }
            }

            if (creep.store.getUsedCapacity() == 0) {
                refuel_flag = true;
            }
        }
	}
};

module.exports = roleEnergyCourier;