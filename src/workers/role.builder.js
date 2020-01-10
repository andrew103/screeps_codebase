var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

		// parking area for builders
        const builder_parking = [
            [11, 28], [12, 28],
            [11, 29], [12, 29],
            [11, 30], [12, 30],
            [11, 31], [12, 31]
        ]
		var current_pos = [creep.pos.x, creep.pos.y]; // current position of this builder in the room
		
		// BUILDING/REPAIRING PRIORITIES =================================

		// build energy infrastructure components
		var priority1 = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
			filter: (site) => {
				return (
					site.structureType == STRUCTURE_SPAWN ||
					site.structureType == STRUCTURE_CONTAINER ||
					site.structureType == STRUCTURE_EXTENSION ||
					site.structureType == STRUCTURE_STORAGE ||
					site.structureType == STRUCTURE_LINK
				);
			}
		});

		// repair energy infrastructure components
		var priority2 = creep.room.find(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				return (
					structure.structureType == STRUCTURE_SPAWN ||
					structure.structureType == STRUCTURE_CONTAINER ||
					structure.structureType == STRUCTURE_EXTENSION ||
					structure.structureType == STRUCTURE_STORAGE ||
					structure.structureType == STRUCTURE_LINK
				);
			}
		});
		priority2.sort((a, b) => a.hits - b.hits);

		// build roads/ramparts/towers
		var priority3 = creep.room.find(FIND_CONSTRUCTION_SITES, {
			filter: (site) => {
				return (
					site.structureType == STRUCTURE_ROAD ||
					site.structureType == STRUCTURE_RAMPART ||
					site.structureType == STRUCTURE_TOWER
				)
			}
		});

		// repair roads/ramparts/towers
		var priority4 = creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (
					structure.structureType == STRUCTURE_ROAD ||
					structure.structureType == STRUCTURE_RAMPART ||
					structure.structureType == STRUCTURE_TOWER
				)
			}
		});
		priority4.sort((a, b) => a.hits - b.hits);

		// ===============================================================

		// switch between building/repairing and getting energy
	    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 refuel');
	    }
	    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
		}
		
	    if (creep.memory.building) { // BUILD OR REPAIR STRUCTURES
			var build_targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			var repair_targets = creep.room.find(FIND_STRUCTURES, {
				filter: object => object.hits < object.hitsMax
			});
			repair_targets.sort((a,b) => a.hits - b.hits);

			// switch between building and repairing based on if a structure's durability is below a certain threshold
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

			if(build_targets.length && !creep.memory.repairing) { // build new structures
                if(creep.build(build_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(build_targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
			}
			else if (repair_targets.length) { // repair structures
				if(creep.repair(Game.getObjectById(creep.memory.repair_structID)) == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.repair_structID), {visualizePathStyle: {stroke: '#ffffff'}});
				}	
			}
            else { // park in designated area
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
	    else { // REFUEL ON ENERGY
	        var sources = creep.room.find(FIND_SOURCES); // find available natural energy sources
            var containers = creep.room.find(FIND_STRUCTURES, { // find containers with energy
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) != 0;
                }
            });
			if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // get energy from containers
				creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
			else if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) { // get energy from natural sources
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;