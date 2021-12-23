module.exports = function(RED) {
    function OpenMeterNode(config) {
        const axios = require("axios");
        RED.nodes.createNode(this,config);
        const node = this;
        const storage = node.context();
        node.on('input', async function(msg) {
            // check source of meterId
            let meterId = null;
            if ((typeof msg.payload === 'string' || msg.payload instanceof String)&&(msg.payload.length > 30)) {
              meterId = msg.payload;
            } else
            if (typeof msg.payload.meterId !== 'undefined') {
              meterId = msg.payload.meterId;
            } else
            if((typeof config.meterId !== 'undefined') && (config.meterId !== null) && (config.meterId.length > 30)) {
              meterId = config.meterId;
            } else {
              meterId = await storage.get("meterId");
            }
            if((typeof meterId == 'undefined') || (meterId == null)  || (meterId.length < 10)) {
              const availMetersResponds = await axios.get("https://openmeter.discovergy.com/public/v1/meters");
              const availMeters = availMetersResponds.data;
              meterId = availMeters[Math.floor(availMeters.length * Math.random())].meterId;
            }
            await storage.set("meterId",meterId);
            let lastReading = await axios.get("https://openmeter.discovergy.com/public/v1/last_reading?meterId="+meterId);
            node.send({payload:lastReading.data}  );
        });
    }
    RED.nodes.registerType("OpenMeter",OpenMeterNode);
}
