"use strict";

axy.define.addPlugin("core.domain", function (context) {

    var domain = {
        create: function () {
            return {
                run: function (f) {
                    f();
                },
                on: function () {
                }
            };
        }
    };

    context.coreInstance.addModule("domain", domain);
});

axy.define.addPlugin("core.fs.mkdir", function (context) {
    var fs = context.coreInstance.require("fs"),
        data = context.fsData,
        process = context.sandboxInstance.global.process;
    fs.mkdirSync = function (name) {
        data.dirs[name] = true;
    };    
    fs.writeFile = function (filename, content, options, callback) {
        if ((!callback) && (typeof options === "function")) {
            callback = options;
        }
        fs.writeFileSync(filename, content);
        process.nextTick(callback);
    };
});

function setStdOut(sandbox, node) {
    var log = document.getElementById(node);
    sandbox.global.process.stdout.write = function (message) {
        var d = document.createElement("div");
        d.appendChild(document.createTextNode(message));
        log.appendChild(d);
    }
};

