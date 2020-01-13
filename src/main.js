var roleHarvester = require('workers_role.harvester');
var roleUpgrader = require('workers_role.upgrader');
var roleBuilder = require('workers_role.builder');
var roleDefender = require("defenders_role.defender");
var roleRangedDefender = require("defenders_role.ranged_defender");
var roleHealer = require("defenders_role.healer");
var roleEnergyCourier = require("couriers_role.energy_courier");

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var energy_couriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'energy_courier');
    // console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 3) {
        var newName = 'Harvester' + Game.time;
        // console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'harvester'}});
    }

    else if (energy_couriers.length < 3) {
        var newName = 'Energy_Courier' + Game.time;
        // console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'energy_courier'}});    
    }
    
    else if(upgraders.length < 4) {
        var newName = 'Upgrader' + Game.time;
        // console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'upgrader'}});
    }

    else if(builders.length < 6) {
        var newName = 'Builder' + Game.time;
        // console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'builder'}});
    }

    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    var tower = Game.getObjectById('5e18ffbd101cfe1899cf91ad');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax &&
                                    (structure.structureType == STRUCTURE_CONTAINER)
        });
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        // var containers = creep.room.find(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //         return structure.structureType == STRUCTURE_CONTAINER;
        //     }
        // });
        // var container_tot_energy = 0;
        // for (let i = 0; i < containers.length; i++) {
        //     container_tot_energy += containers[i].store.getUsedCapacity(RESOURCE_ENERGY);
        // }

        if(closestHostile) {
            tower.attack(closestHostile);
        }
        else if(closestDamagedStructure) { // && container_tot_energy > 2000
            tower.repair(closestDamagedStructure);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == "energy_courier") {
            roleEnergyCourier.run(creep);
        }
    }
}