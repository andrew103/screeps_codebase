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
    
    else if(upgraders.length < 2) {
        var newName = 'Upgrader' + Game.time;
        // console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: 'upgrader'}});
    }

    else if(builders.length < 5) {
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

    // var tower = Game.getObjectById('aff867c73aff671b221747c4');
    // if(tower) {
    //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    //         filter: (structure) => structure.hits < structure.hitsMax
    //     });
    //     if(closestDamagedStructure) {
    //         tower.repair(closestDamagedStructure);
    //     }

    //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if(closestHostile) {
    //         tower.attack(closestHostile);
    //     }
    // }

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