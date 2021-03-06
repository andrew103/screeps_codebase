var roleBuilder = {

	/**
	 * @param {Structure} a
	 * @param {Structure} b
	 * 
	 * @return {int} result
	 */
	prioritize_decay_repair: function(a, b) {
		var result;
		var a_ticks_to_EOL;
		var b_ticks_to_EOL;

		if (a.structureType == STRUCTURE_CONTAINER) {
			a_ticks_to_EOL = (a.hits/CONTAINER_DECAY)*CONTAINER_DECAY_TIME_OWNED + a.ticksToDecay;
		}
		else if (a.structureType == STRUCTURE_RAMPART) {
			a_ticks_to_EOL = (a.hits/RAMPART_DECAY_AMOUNT)*RAMPART_DECAY_TIME + a.ticksToDecay;
		}
		else { // a.structureType == STRUCTURE_ROAD
			const terrain = a.room.getTerrain();
			switch (terrain.get(a.pos.x, a.pos.y)) {
				case TERRAIN_MASK_WALL:
					var decay_amount = ROAD_DECAY_AMOUNT*CONSTRUCTION_COST_ROAD_WALL_RATIO;
					var decay_time = ROAD_DECAY_TIME*CONSTRUCTION_COST_ROAD_WALL_RATIO;
					a_ticks_to_EOL = (a.hits/decay_amount)*decay_time + a.ticksToDecay;
					break;
				case TERRAIN_MASK_SWAMP:
					var decay_amount = ROAD_DECAY_AMOUNT*CONSTRUCTION_COST_ROAD_SWAMP_RATIO;
					var decay_time = ROAD_DECAY_TIME*CONSTRUCTION_COST_ROAD_SWAMP_RATIO;
					a_ticks_to_EOL = (a.hits/decay_amount)*decay_time + a.ticksToDecay;
					break;
				case 0:
					a_ticks_to_EOL = (a.hits/ROAD_DECAY_AMOUNT)*ROAD_DECAY_TIME + a.ticksToDecay;
					break;
				}
		}

		if (b.structureType == STRUCTURE_CONTAINER) {
			b_ticks_to_EOL = (b.hits/CONTAINER_DECAY)*CONTAINER_DECAY_TIME_OWNED + b.ticksToDecay;
		}
		else if (b.structureType == STRUCTURE_RAMPART) {
			b_ticks_to_EOL = (b.hits/RAMPART_DECAY_AMOUNT)*RAMPART_DECAY_TIME + b.ticksToDecay;
		}
		else { // b.structureType == STRUCTURE_ROAD
			const terrain = b.room.getTerrain();
			switch (terrain.get(b.pos.x, b.pos.y)) {
				case TERRAIN_MASK_WALL:
					var decay_amount = ROAD_DECAY_AMOUNT*CONSTRUCTION_COST_ROAD_WALL_RATIO;
					var decay_time = ROAD_DECAY_TIME*CONSTRUCTION_COST_ROAD_WALL_RATIO;
					b_ticks_to_EOL = (b.hits/decay_amount)*decay_time + b.ticksToDecay;
					break;
				case TERRAIN_MASK_SWAMP:
					var decay_amount = ROAD_DECAY_AMOUNT*CONSTRUCTION_COST_ROAD_SWAMP_RATIO;
					var decay_time = ROAD_DECAY_TIME*CONSTRUCTION_COST_ROAD_SWAMP_RATIO;
					b_ticks_to_EOL = (b.hits/decay_amount)*decay_time + b.ticksToDecay;
					break;
				case 0:
					b_ticks_to_EOL = (b.hits/ROAD_DECAY_AMOUNT)*ROAD_DECAY_TIME + b.ticksToDecay;
					break;
				}
		}

		var result = a_ticks_to_EOL - b_ticks_to_EOL;
		return result;
	},

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
			var decay_repair = creep.room.find(FIND_STRUCTURES, {
				filter: object => object.hits < object.hitsMax/10 && (
					object.structureType == STRUCTURE_CONTAINER ||
					object.structureType == STRUCTURE_ROAD ||
					object.structureType == STRUCTURE_RAMPART
				)
			});
			var normal_repair = creep.room.find(FIND_STRUCTURES, {
				filter: object => object.hits < object.hitsMax && object.structureType != STRUCTURE_WALL
			});

			decay_repair.sort((a,b) => this.prioritize_decay_repair(a, b));
			normal_repair.sort((a,b) => (a.hits/a.hitsMax) - (b.hits/b.hitsMax));

			if (creep.memory.repairing && creep.memory.repair_structID && build_targets.length) {
				if (Game.getObjectById(creep.memory.repair_structID).hits > Game.getObjectById(creep.memory.repair_structID).hitsMax/4) {
					creep.memory.repairing = false;
					creep.say('stop repairing');	
				}
			}
			if (!creep.memory.repairing && decay_repair.length) {
				if (decay_repair[0].hits < decay_repair[0].hitsMax/10) {
					creep.memory.repairing = true;
					creep.memory.repair_structID = decay_repair[0].id;
					creep.say('repairing decay');	
				}
			}
			else if ((!creep.memory.repairing && normal_repair.length) || !build_targets.length) {
				if (normal_repair[0].hits < normal_repair[0].hitsMax) {
					creep.memory.repairing = true;
					creep.memory.repair_structID = normal_repair[0].id;
					creep.say('repairing normal');	
				}
			}	

			if(build_targets.length && !creep.memory.repairing) {
                if(creep.build(build_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(build_targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
			}
			else if (decay_repair.length || normal_repair.length) {
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
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) != 0;
                }
			});
			var container_tot_energy = 0;
			var spawn_energy_space = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_SPAWN ||
							structure.structureType == STRUCTURE_EXTENSION ||
							structure.structureType == STRUCTURE_TOWER) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});
			for (let i = 0; i < containers.length; i++) {
				container_tot_energy += containers[i].store.getUsedCapacity(RESOURCE_ENERGY);
			}

			if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE && (container_tot_energy > 1000 || spawn_energy_space.length == 0)) {
				creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
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
	}
};

module.exports = roleBuilder;