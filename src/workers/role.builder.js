var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

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