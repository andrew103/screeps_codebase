var roleHarvester = {

    /** @param {Array} parking_spots
     *  @param {Array} current_pos
     */
    // isParked: function(parking_spots, current_pos) {
    //     for (let i = 0; i < parking_spots.length; i++) {

    //     }
    // },

    /** @param {Creep} creep **/
    run: function(creep) {

        const harvester_parking = [
            [12, 46],
            [12, 47],
            [13, 46],
            [13, 47],
        ]

        var current_pos = [creep.pos.x, creep.pos.y];

        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if (creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
            creep.say("delivering");
        }
        if (!creep.memory.harvesting && creep.store.getUsedCapacity() == 0) {
            creep.memory.harvesting = true;
            creep.say("harvesting");
        }        

	    if (creep.memory.harvesting) { // HARVEST ENERGY OR PICKUP DROPPED ENERGY
            var sources = creep.room.find(FIND_SOURCES);
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) != 0;
                }
            });
            // var dropped = creep.room.find(FIND_DROPPED_RESOURCES);

            // if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE && dropped[0].amount > 300) {
            //     creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            // }
            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            // else if (targets.length > 0 && containers.length > 0) {
            //     if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            //     }
            // }

        }
        else { // DELIVER ENERGY TO CONTAINERS
            var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });

            // if (targets.length > 0) {
            //     if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            //     }
            // }
            if (containers.length > 0) {
                if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
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
        }
	}
};

module.exports = roleHarvester;