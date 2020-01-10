var roleDefender = {
    run: function(creep) {
        const targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if (targets.length > 0) {
            creep.attack(targets[0]);
        }
        else {
            // standby
        }
    }
};

module.exports = roleDefender;