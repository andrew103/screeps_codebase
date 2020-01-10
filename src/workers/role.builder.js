var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        const builder_parking = [
            [11, 28], [12, 28],
            [11, 29], [12, 29],
            [11, 30], [12, 30],
            [11, 31], [12, 31]
        ]

        var current_pos = [creep.pos.x, creep.pos.y];

	    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
		}
		
	    if (creep.memory.building) {
			var build_targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			var repair_targets = creep.room.find(FIND_STRUCTURES, {
				filter: object => object.hits < object.hitsMax
			});
			repair_targets.sort((a,b) => a.hits - b.hits);

			if (creep.memory.repairing && creep.memory.repair_structID) {
				if (Game.getObjectById(creep.memory.repair_structID).hits > Game.getObjectById(creep.memory.repair_structID).hitsMax/4) {
					creep.memory.repairing = false;
					creep.say('stop repairing');	
				}
			}
			if (!creep.memory.repairing && repair_targets[0].hits < repair_targets[0].hitsMax/10) {
				creep.memory.repairing = true;
				creep.memory.repair_structID = repair_targets[0].id;
				creep.say('repairing 1');
			}

			if(build_targets.length && !creep.memory.repairing) {
                if(creep.build(build_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(build_targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
			}
			else if (repair_targets.length) {
				if(creep.repair(Game.getObjectById(creep.memory.repair_structID)) == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.repair_structID), {visualizePathStyle: {stroke: '#ffffff'}});
				}	
			}
            else {
                // park in designated area
                // console.log(harvester_parking.includes(current_pos));
                if (!(builder_parking.includes(current_pos))) {
                    for (let i = 0; i < builder_parking.length; i++) {
                        const parking_space = creep.room.lookForAt(LOOK_CREEPS, builder_parking[i][0], builder_parking[i][1]);
                        if (parking_space.length == 0) {
                            creep.moveTo(builder_parking[i][0], builder_parking[i][1], {visualizePathStyle: {stroke: '#ffffff'}})
                            break;
                        }
                    }    
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) != 0;
                }
            });
			if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
			else if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;