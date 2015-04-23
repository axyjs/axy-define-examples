/**
 * The implementation of CommonJS for browsers
 *
 * @author Oleg Grigoriev <go.vasac@gmail.com>
 * @license MIT
 * @link https://github.com/axyjs/axy-define
 */
"use strict";

var axy = axy || {};

axy.define = (function (globalObject, undefined) {
    function createSandbox() {
        /**
         * Internal context of the library
         */
        var context;
        (function (context) {
            "use strict";
            /**
             * The instance of `axy.define` or another sandbox
             */
            context.sandboxInstance;
            /**
             * The instance of `axy.define.core`
             */
            context.coreInstance;
            /**
             * The instance of the signals emitter
             */
            context.signalInstance;
            /**
             * The instance of the plugin system
             */
            context.pluginsInstance;
            /**
             * Structure of the virtual FS
             */
            context.fsData;
            /**
             * The current directory
             */
            context.directory = "/";
            /**
             * Destructors of subsystems
             * Added to it by a subsystem itself
             *
             * @type {function[]}
             */
            context.destructors = [];
            /**
             * Destroys the context
             */
            function destroy() {
                context.destructors.forEach(function (destructor) {
                    destructor();
                });
                helpers.destroyContainer(context.coreInstance);
                helpers.destroyContainer(context);
            }
            context.destroy = destroy;
        })(context || (context = {}));
        /**
         * Asynchronous I/O
         */
        /// <reference path="context.ts" />
        var async;
        (function (async) {
            "use strict";
            /**
             * Sets the asynchronous storage (NULL - reset)
             *
             * @param {object} storage
             */
            function set(storage) {
                context.fsData.async = storage;
            }
            async.set = set;
            /**
             * Returns the asynchronous storage
             *
             * @return {object}
             *         the storage object or NULL if it is not defined
             */
            function get() {
                return context.fsData.async;
            }
            async.get = get;
        })(async || (async = {}));
        /**
         * Some helpers
         */
        var helpers;
        (function (helpers) {
            "use strict";
            /**
             * Custom implementation of `Object.keys()`
             *
             * @param {*} object
             * @return {string[]}
             */
            function customKeys(object) {
                var keys = [], k;
                for (k in object) {
                    if (object.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
                return keys;
            }
            helpers.customKeys = customKeys;
            /**
             * Returns a keys list of an object
             *
             * @param {*} object
             * @return {string[]}
             */
            helpers.keys = Object.keys;
            if (typeof helpers.keys !== "function") {
                helpers.keys = customKeys;
            }
            /**
             * Destroys a container and disconnects the children
             *
             * @param container
             */
            function destroyContainer(container) {
                var k;
                for (k in container) {
                    if (container.hasOwnProperty(k)) {
                        container[k] = void 0;
                    }
                }
            }
            helpers.destroyContainer = destroyContainer;
        })(helpers || (helpers = {}));
        /**
         * Handling and transforming file paths (analogue of Node.js core module `path`)
         *
         * Path type of this file system is POSIX.
         *
         * The interface of this module is similar to interface of the node.js module "path",
         * but contains only some of the functions.
         *
         * Access to the module: `require("path")`.
         */
        var core;
        (function (core) {
            var path;
            (function (_path) {
                "use strict";
                /**
                 * Normalizes a path
                 *
                 * @param {string} path
                 * @returns {string}
                 */
                function normalize(path) {
                    var isAbs = isAbsolute(path), result = [];
                    path = path.replace(/^\/+/, "").replace(/^\/+/, "");
                    path.split("/").forEach(function (item) {
                        switch (item) {
                            case "..":
                                result.pop();
                                break;
                            case ".":
                            case "":
                                break;
                            default:
                                result.push(item);
                        }
                    });
                    return (isAbs ? "/" : "") + result.join("/");
                }
                _path.normalize = normalize;
                /**
                 * Resolves a relative path
                 *
                 * @param {...} paths
                 * @return {string}
                 */
                function resolve() {
                    var paths = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        paths[_i - 0] = arguments[_i];
                    }
                    var components = [];
                    paths.forEach(function (item) {
                        if (isAbsolute(item)) {
                            components = [];
                        }
                        components.push(item);
                    });
                    return normalize(components.join("/"));
                }
                _path.resolve = resolve;
                /**
                 * Checks if a path is absolute
                 *
                 * @param {string} path
                 * @returns {boolean}
                 */
                function isAbsolute(path) {
                    return (path.charAt(0) === "/");
                }
                _path.isAbsolute = isAbsolute;
                /**
                 * Returns the directory name of a path
                 *
                 * @param {string} path
                 * @returns {boolean}
                 */
                function dirname(path) {
                    return path.replace(/\/[^/]+\/*$/, "");
                }
                _path.dirname = dirname;
                /**
                 * Returns the base name of a path
                 *
                 * @param {string} path
                 * @returns {boolean}
                 */
                function basename(path) {
                    return path.match(/([^/]+)\/*$/)[1];
                }
                _path.basename = basename;
                /**
                 * Returns the extension name of a path
                 *
                 * @param {string} path
                 * @returns {boolean}
                 */
                function extname(path) {
                    var matches = path.match(/(\.[^/.]*)\/*$/);
                    return matches ? matches[1] : "";
                }
                _path.extname = extname;
                /**
                 * The file path separator
                 */
                _path.sep = "/";
            })(path = core.path || (core.path = {}));
        })(core || (core = {}));
        /**
         * Simple streams for `process.stdout` and `process.stderr`
         */
        var core;
        (function (core) {
            var streams;
            (function (streams) {
                "use strict";
                /**
                 * The stream class
                 */
                var Stream = (function () {
                    /**
                     * The constructor
                     *
                     * @param {string} cMethod
                     *        a `console` method name
                     */
                    function Stream(cMethod) {
                        if (typeof console !== "undefiend") {
                            this.log = console[cMethod];
                        }
                    }
                    /**
                     * {@inheritDoc}
                     */
                    Stream.prototype.write = function (chunk, encoding, callback) {
                        if (encoding === void 0) { encoding = null; }
                        if (callback === void 0) { callback = null; }
                        if (this.log) {
                            chunk = chunk.replace(/\n$/, "");
                            this.log.call(null, chunk);
                        }
                        if (callback) {
                            core.process.nextTick(callback);
                        }
                        return true;
                    };
                    return Stream;
                })();
                streams.Stream = Stream;
            })(streams = core.streams || (core.streams = {}));
        })(core || (core = {}));
        var __extends = (this && this.__extends) || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() { this.constructor = d; }
            __.prototype = b.prototype;
            d.prototype = new __();
        };
        /**
         * Timers (analogue of Node.js core module `path`)
         */
        var core;
        (function (core) {
            var timers;
            (function (timers) {
                "use strict";
                var nativeSetTimeout = globalObject.setTimeout;
                var nativeClearTimeout = globalObject.clearTimeout;
                var nativeSetInterval = globalObject.setInterval;
                var nativeClearInterval = globalObject.clearInterval;
                var nativeSetImmediate = globalObject.setImmediate;
                var nativeClearImmediate = globalObject.clearImmediate;
                if (!nativeSetImmediate) {
                    nativeSetImmediate = function setImmediate(callback) {
                        return nativeSetTimeout(callback, 0);
                    };
                }
                if (!nativeClearImmediate) {
                    nativeClearImmediate = function clearImmediate(immediate) {
                        nativeClearTimeout(immediate);
                    };
                }
                /**
                 * Instances of this class returned from setTimeout and setInterval
                 * @abstract
                 */
                var Timeout = (function () {
                    /**
                     * The constructor
                     *
                     * @param {function} callback
                     * @param {number} delay
                     * @param {Array} args
                     */
                    function Timeout(callback, delay, args) {
                        var onTimeout;
                        this._idleTimeout = delay;
                        if (args.length > 0) {
                            onTimeout = function () {
                                callback.apply(null, args);
                            };
                        }
                        else {
                            onTimeout = callback;
                        }
                        this._onTimeout = onTimeout;
                    }
                    /**
                     * Stub function
                     */
                    Timeout.prototype.unref = function () {
                    };
                    /**
                     * Stub function
                     */
                    Timeout.prototype.ref = function () {
                    };
                    /**
                     * Runs the timer
                     */
                    Timeout.prototype.start = function () {
                        if (!this.handle) {
                            this.handle = this.set();
                        }
                    };
                    /**
                     * Stops the timer
                     */
                    Timeout.prototype.stop = function () {
                        if (this.handle) {
                            this.clear();
                            this.handle = null;
                        }
                    };
                    Timeout.prototype.set = function () {
                        return null;
                    };
                    Timeout.prototype.clear = function () {
                    };
                    return Timeout;
                })();
                timers.Timeout = Timeout;
                var TimeoutOnce = (function (_super) {
                    __extends(TimeoutOnce, _super);
                    function TimeoutOnce() {
                        _super.apply(this, arguments);
                    }
                    TimeoutOnce.prototype.set = function () {
                        return nativeSetTimeout(this._onTimeout, this._idleTimeout);
                    };
                    TimeoutOnce.prototype.clear = function () {
                        nativeClearTimeout(this.handle);
                    };
                    return TimeoutOnce;
                })(Timeout);
                timers.TimeoutOnce = TimeoutOnce;
                var TimeoutInterval = (function (_super) {
                    __extends(TimeoutInterval, _super);
                    function TimeoutInterval() {
                        _super.apply(this, arguments);
                    }
                    TimeoutInterval.prototype.set = function () {
                        return nativeSetInterval(this._onTimeout, this._idleTimeout);
                    };
                    TimeoutInterval.prototype.clear = function () {
                        nativeClearInterval(this.handle);
                    };
                    return TimeoutInterval;
                })(Timeout);
                timers.TimeoutInterval = TimeoutInterval;
                var Immediate = (function () {
                    function Immediate(callback, args) {
                        var onTimeout;
                        if (args.length > 0) {
                            onTimeout = function () {
                                callback.apply(null, args);
                            };
                        }
                        else {
                            onTimeout = callback;
                        }
                        this._onTimeout = onTimeout;
                        this.handle = nativeSetImmediate(onTimeout);
                    }
                    return Immediate;
                })();
                timers.Immediate = Immediate;
                function setTimeout(callback, delay) {
                    var args = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        args[_i - 2] = arguments[_i];
                    }
                    var timeout = new TimeoutOnce(callback, delay, args);
                    timeout.start();
                    return timeout;
                }
                timers.setTimeout = setTimeout;
                function clearTimeout(timeout) {
                    if (timeout instanceof Timeout) {
                        timeout.stop();
                    }
                    else {
                        nativeClearTimeout(timeout);
                    }
                }
                timers.clearTimeout = clearTimeout;
                function setInterval(callback, delay) {
                    var args = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        args[_i - 2] = arguments[_i];
                    }
                    var timeout = new TimeoutInterval(callback, delay, args);
                    timeout.start();
                    return timeout;
                }
                timers.setInterval = setInterval;
                function clearInterval(timeout) {
                    if (timeout instanceof Timeout) {
                        timeout.stop();
                    }
                    else {
                        nativeClearInterval(timeout);
                    }
                }
                timers.clearInterval = clearInterval;
                function setImmediate(callback) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return new Immediate(callback, args);
                }
                timers.setImmediate = setImmediate;
                function clearImmediate(immediate) {
                    if (immediate instanceof Immediate) {
                        immediate = immediate.handle;
                    }
                    nativeClearImmediate(immediate);
                }
                timers.clearImmediate = clearImmediate;
            })(timers = core.timers || (core.timers = {}));
        })(core || (core = {}));
        /**
         * The analogue of node-variable `process`
         *
         * Inside the module is available as `process`.
         * Outside as `axy.define.global.process`.
         */
        /// <reference path="../engine.ts" />
        /// <reference path="../context.ts" />
        /// <reference path="path.ts" />
        /// <reference path="streams.ts" />
        /// <reference path="timers.ts" />
        var core;
        (function (core) {
            var process;
            (function (process) {
                "use strict";
                /**
                 * The command line arguments
                 * The second is the main module name.
                 */
                process.argv = ["axy"];
                /**
                 * Environment variables
                 */
                process.env = {};
                /**
                 * The main module of this process
                 */
                process.mainModule = null;
                /**
                 * The global paths
                 */
                process.paths = [];
                var setImmediate = globalObject.setImmediate;
                /**
                 * Runs callback after the current event loop
                 *
                 * @param {function} callback
                 */
                function nextTick(callback) {
                    if (setImmediate) {
                        setImmediate(callback);
                    }
                    else {
                        setTimeout(callback, 0);
                    }
                }
                process.nextTick = nextTick;
                /**
                 * Returns the current working directory
                 *
                 * @return {string}
                 */
                function cwd() {
                    return context.directory;
                }
                process.cwd = cwd;
                /**
                 * Changes the current working directory
                 *
                 * @param {string} directory
                 */
                function chdir(directory) {
                    context.directory = core.path.resolve(context.directory, directory);
                }
                process.chdir = chdir;
                var startTime = (new Date()).getTime();
                /**
                 * Number of seconds Axy has been running
                 *
                 * @return {number}
                 */
                function uptime() {
                    return ((new Date()).getTime() - startTime) / 1000;
                }
                process.uptime = uptime;
                /**
                 * Returns "the current high-resolution real time" in a `[seconds, nanoseconds]`
                 *
                 * @param {number[]} prev
                 *        the previous result for diff
                 * @return {number[]}
                 */
                function hrtime(prev) {
                    if (prev === void 0) { prev = null; }
                    var result, t = (new Date()).getTime() - startTime, s = Math.round(t / 1000), m = (t % 1000) * 1000000;
                    if (prev) {
                        s -= prev[0];
                        m -= prev[1];
                        if (m < 0) {
                            s -= 1;
                            m += 1000000000;
                        }
                    }
                    result = [s, m];
                    return result;
                }
                process.hrtime = hrtime;
                /**
                 * Sets an event listener
                 *
                 * @param {string} event
                 * @param {function} listener
                 * @return {object}
                 */
                function on(event, listener) {
                    context.signalInstance.on(event, listener);
                    return core.process;
                }
                process.on = on;
                /**
                 * Aborts the process
                 *
                 * @param {number} code [optional]
                 */
                function exit(code) {
                    if (code === void 0) { code = 0; }
                    context.sandboxInstance.signal("exit", code);
                }
                process.exit = exit;
                /**
                 * Stdout (used `console.log`)
                 */
                process.stdout = new core.streams.Stream("log");
                /**
                 * Stderr (used `console.err`)
                 */
                process.stderr = new core.streams.Stream("error");
                /**
                 * The process title
                 */
                process.title = "axy";
                /**
                 * The platform
                 */
                process.platform = "axy";
                context.destructors.push(function processDestroy() {
                    helpers.destroyContainer(core.process);
                });
            })(process = core.process || (core.process = {}));
        })(core || (core = {}));
        /**
         * Work with the virtual file system (analogue of Node.js core module `fs`)
         *
         * A virtual file may contains any value (see `IFileContent`).
         * For JS-files it is the wrapper-function, for JSON it is a JSON-object itself.
         *
         * Path type of this file system is POSIX.
         *
         * The interface of this module is similar to interface of the node.js module "fs",
         * but contains only some of the functions.
         *
         * Access to the module: `require("fs")`.
         */
        /// <reference path="../types.ts" />
        /// <reference path="../async.ts" />
        /// <reference path="../context.ts" />
        /// <reference path="../helpers.ts" />
        /// <reference path="process.ts" />
        var core;
        (function (core) {
            var fs;
            (function (fs) {
                "use strict";
                var process = core.process;
                /**
                 * The files list
                 */
                var files = {};
                /**
                 * The directories list
                 */
                var dirs = {
                    "/": true
                };
                var data = {
                    files: files,
                    dirs: dirs
                };
                context.fsData = data;
                /**
                 * @class Stat object: stripped-down version of native fs.Stat
                 */
                var Stat = (function () {
                    /**
                     * The constructor
                     *
                     * @param {boolean} itIsFile - it is regular file (not directory)
                     */
                    function Stat(itIsFile) {
                        this.itIsFile = itIsFile;
                    }
                    /**
                     * Checks if this is regular file
                     *
                     * @returns {boolean}
                     */
                    Stat.prototype.isFile = function () {
                        return this.itIsFile;
                    };
                    /**
                     * Checks if this is directory
                     *
                     * @returns {boolean}
                     */
                    Stat.prototype.isDirectory = function () {
                        return !this.itIsFile;
                    };
                    return Stat;
                })();
                fs.Stat = Stat;
                /**
                 * Writes a content to the file
                 *
                 * @param {string} filename
                 * @param {*} data
                 * @param {*} options [optional] ignored
                 */
                function writeFileSync(filename, data, options) {
                    if (options === void 0) { options = null; }
                    var dir = "";
                    filename = relativeFile(filename);
                    if (dirs[filename]) {
                        throw errorDir();
                    }
                    files[filename] = data;
                    filename.split("/").slice(1, -1).forEach(function (item) {
                        dir += "/" + item;
                        dirs[dir] = true;                       
                    });
                }
                fs.writeFileSync = writeFileSync;
                /**
                 * Returns a content of the file
                 *
                 * @param {string} filename
                 * @param {*} options [optional] ignored
                 * @returns {*}
                 * @throws {Error} the file not found
                 */
                function readFileSync(filename, options) {
                    if (options === void 0) { options = null; }
                    filename = relativeFile(filename);
                    if (!files.hasOwnProperty(filename)) {
                        if (dirs[filename]) {
                            throw errorDir();
                        }
                        throw errorFile(filename);
                    }
                    return files[filename];
                }
                fs.readFileSync = readFileSync;
                /**
                 * Returns a Stat-object of the file
                 *
                 * @param {string} path
                 * @returns {fs.Stat}
                 * @throws {Error} the file not found
                 */
                function statSync(path) {
                    path = relativeFile(path);
                    if (files[path] !== void 0) {
                        return new Stat(true);
                    }
                    else if (dirs[path]) {
                        return new Stat(false);
                    }
                    throw errorFile(path);
                }
                fs.statSync = statSync;
                /**
                 * Checks if the file is exists
                 *
                 * @param {string} path
                 * @returns {boolean}
                 */
                function existsSync(path) {
                    path = relativeFile(path);
                    return !!((files[path] !== void 0) || dirs[path]);
                }
                fs.existsSync = existsSync;
                /**
                 * Returns the realpath of a file
                 *
                 * @param {string} path
                 * @param {object} cache [optional]
                 *        a cache dictionary (path => result)
                 * @throws {Error} the file not found
                 */
                function realpathSync(path, cache) {
                    if (cache === void 0) { cache = null; }
                    path = relativeFile(path);
                    if (cache && cache[path]) {
                        return cache[path];
                    }
                    if (!existsSync(path)) {
                        throw errorFile(path);
                    }
                    if (cache) {
                        cache[path] = path;
                    }
                    return path;
                }
                fs.realpathSync = realpathSync;
                /**
                 * Returns the list of a directory files (excluding `.` and `..`)
                 *
                 * @param {string} path
                 * @return {string[]}
                 */
                function readdirSync(path) {
                    var result = {}, len;
                    path = relativeFile(path);
                    if (path !== "/") {
                        path += "/";
                    }
                    len = path.length;
                    helpers.keys(files).forEach(function (filename) {
                        if (filename.indexOf(path) === 0) {
                            result[filename.slice(len).split("/")[0]] = true;
                        }
                    });
                    return helpers.keys(result);
                }
                fs.readdirSync = readdirSync;
                /**
                 * Checks if a file is exists (asynchronous)
                 *
                 * @param {string} path
                 * @param {function} callback
                 */
                function exists(path, callback) {
                    var info;
                    path = relativeFile(path);
                    if ((files[path] !== void 0) || dirs[path]) {
                        return tick(callback, [true]);
                    }
                    if (!data.async) {
                        return tick(callback, [false]);
                    }
                    info = data.async.stat(path, function (info) {
                        cacheAsync(info);
                        callback(!!info.realpath);
                    });
                    if (info) {
                        cacheAsync(info);
                        return tick(callback, [!!info.realpath]);
                    }
                }
                fs.exists = exists;
                /**
                 * Asynchronous stat
                 *
                 * @param {string} path
                 * @param {function} callback
                 */
                function stat(path, callback) {
                    var info;
                    path = relativeFile(path);
                    if (files[path] !== void 0) {
                        return tick(callback, [null, new Stat(true)]);
                    }
                    if (dirs[path]) {
                        return tick(callback, [null, new Stat(false)]);
                    }
                    if (!data.async) {
                        return tick(callback, [errorFile(path), null]);
                    }
                    info = data.async.stat(path, function (info) {
                        cacheAsync(info);
                        if (info.realpath) {
                            callback(null, new Stat(info.isFile));
                        }
                        else {
                            callback(errorFile(path), null);
                        }
                    });
                    if (info) {
                        cacheAsync(info);
                        if (info.realpath) {
                            tick(callback, [null, new Stat(info.isFile)]);
                        }
                        else {
                            tick(callback, [errorFile(path), null]);
                        }
                    }
                }
                fs.stat = stat;
                /**
                 * Asynchronous read file
                 *
                 * @param {string} path
                 * @param {function|*} options
                 * @param {function} callback [optional]
                 */
                function readFile(path, options, callback) {
                    if (callback === void 0) { callback = null; }
                    var info;
                    if (!callback) {
                        callback = options;
                    }
                    path = relativeFile(path);
                    if (files[path] !== void 0) {
                        return tick(callback, [null, files[path]]);
                    }
                    if (dirs[path]) {
                        return tick(callback, [errorDir(), null]);
                    }
                    if (!data.async) {
                        return tick(callback, [errorFile(path), null]);
                    }
                    info = data.async.read(path, function (info) {
                        cacheAsync(info);
                        if (info.realpath) {
                            if (info.isFile) {
                                callback(null, info.content);
                            }
                            else {
                                callback(errorDir(), null);
                            }
                        }
                        else {
                            callback(errorFile(path), null);
                        }
                    });
                    if (info) {
                        cacheAsync(info);
                        if (info.realpath) {
                            if (info.isFile) {
                                tick(callback, [null, info.content]);
                            }
                            else {
                                tick(callback, [errorDir(), null]);
                            }
                        }
                        else {
                            tick(callback, [errorFile(path), null]);
                        }
                    }
                }
                fs.readFile = readFile;
                /**
                 * Asynchronous readdir
                 *
                 * @param {string} path
                 * @return {string[]}
                 */
                function readdir(path, callback) {
                    tick(callback, [null, readdirSync(path)]);
                }
                fs.readdir = readdir;
                context.destructors.push(function destroyFS() {
                    files = null;
                    dirs = null;
                    if (data.async) {
                        if (data.async.destroy) {
                            data.async.destroy();
                        }
                        data.async = null;
                    }
                    data = null;
                });
                /**
                 * Returns a file relative to the current directory
                 *
                 * @param {string} file
                 */
                function relativeFile(file) {
                    if (file.charAt(0) === "/") {
                        return file;
                    }
                    return core.path.resolve(context.directory, file);
                }
                /**
                 * Creates an error of directory operation
                 *
                 * @return {Error}
                 */
                function errorDir() {
                    return new Error("EISDIR, illegal operation on a directory");
                }
                /**
                 * Creates an error of file operation
                 *
                 * @param {string} filename
                 * @return {Error}
                 */
                function errorFile(filename) {
                    return Error("no such file or directory '" + filename + "'");
                }
                /**
                 * Runs a callback in the next tick
                 *
                 * @param {function} callback
                 * @param {Array} args
                 */
                function tick(callback, args) {
                    if (args === void 0) { args = []; }
                    process.nextTick(function () {
                        callback.apply(null, args);
                    });
                }
                /**
                 * @param {object} info
                 */
                function cacheAsync(info) {
                    if (info.realpath && info.cacheable) {
                        if (info.isFile) {
                            if (info.content !== void 0) {
                                writeFileSync(info.realpath, info.content);
                            }
                        }
                        else {
                            dirs[info.realpath] = true;
                        }
                    }
                }
            })(fs = core.fs || (core.fs = {}));
        })(core || (core = {}));
        /**
         * Some helpers
         */
        /// <reference path="engine.ts" />
        /// <reference path="core/fs.ts" />
        /// <reference path="core/path.ts" />
        /// <reference path="extensions.ts" />
        var util;
        (function (util) {
            "use strict";
            var fs = core.fs;
            var path = core.path;
            /**
             * @param {string} basePath
             * @return {string}
             */
            function tryFile(basePath) {
                if (!fs.existsSync(basePath)) {
                    return null;
                }
                if (!fs.statSync(basePath).isFile()) {
                    return null;
                }
                return fs.realpathSync(basePath, engine.Module._realpathCache);
            }
            util.tryFile = tryFile;
            /**
             * @param {string} p
             * @param {string[]} exts
             * @return {string}
             */
            function tryExtensions(p, exts) {
                var len = exts.length, i, filename;
                for (i = 0; i < len; i += 1) {
                    filename = tryFile(p + exts[i]);
                    if (filename) {
                        return filename;
                    }
                }
                return null;
            }
            util.tryExtensions = tryExtensions;
            /**
             * @param {string} basePath
             * @param {string[]} exts
             * @return {string}
             */
            function tryExtensionsDirMain(basePath, exts) {
                var list = settings.instance.dirMain, len = list.length, i, filename;
                for (i = 0; i < len; i += 1) {
                    filename = tryExtensions(basePath + "/" + list[i], exts);
                    if (filename) {
                        return filename;
                    }
                }
                return null;
            }
            util.tryExtensionsDirMain = tryExtensionsDirMain;
            /**
             * @param {string} requestPath
             * @param {string[]} exts
             * @return {string}
             */
            function tryPackage(requestPath, exts) {
                var pkg = readPackage(requestPath), filename;
                if (!pkg) {
                    return null;
                }
                filename = path.resolve(requestPath, pkg);
                return tryFile(filename) || tryExtensions(filename, exts) || tryExtensionsDirMain(filename, exts);
            }
            util.tryPackage = tryPackage;
            var packageMainCache = {};
            /**
             * @param {string} requestPath
             * @returns {string}
             */
            function readPackage(requestPath) {
                var filename, data, main;
                if (packageMainCache.hasOwnProperty(requestPath)) {
                    return packageMainCache[requestPath];
                }
                filename = requestPath + "/package.json";
                if (!fs.existsSync(filename)) {
                    return null;
                }
                data = extensions.parseJSONFile(filename);
                main = loadPackageMain(data);
                packageMainCache[requestPath] = main;
                return main;
            }
            util.readPackage = readPackage;
            /**
             * @param {object} data
             * @return string
             */
            function loadPackageMain(data) {
                var packageMain = settings.instance.packageMain, len = packageMain.length, i, main;
                for (i = 0; i < len; i += 1) {
                    main = data[packageMain[i]];
                    if (main) {
                        return main;
                    }
                }
                return null;
            }
        })(util || (util = {}));
        /**
         * Module loaders (for different file extensions)
         */
        /// <reference path="types.ts" />
        /// <reference path="util.ts" />
        /// <reference path="core/fs.ts" />
        /// <reference path="core/path.ts" />
        var extensions;
        (function (extensions) {
            "use strict";
            var fs = core.fs;
            /**
             * The loader of JavaScript "files"
             * The "content" of these files is a wrapper-function
             *
             * {@inheritDoc}
             */
            function loadJS(module, filename) {
                var content = fs.readFileSync(filename, "utf-8");
                module._compile(content, filename);
            }
            extensions.loadJS = loadJS;
            /**
             * The loader of JSON "files"
             * The "content" of these files is the value itself
             *
             * {@inheritDoc}
             */
            function loadJSON(module, filename) {
                module.exports = parseJSONFile(filename);
            }
            extensions.loadJSON = loadJSON;
            /**
             * The loader of binary files
             * Not supported in this environment
             *
             * {@inheritDoc}
             */
            function loadNode(module, filename) {
                throw new Error("Loading binary modules is not implemented in this environment");
            }
            extensions.loadNode = loadNode;
            /**
             * Parses content of a JSON "file"
             *
             * @param {string} filename
             * @returns {*}
             */
            function parseJSONFile(filename) {
                var json = fs.readFileSync(filename, "utf-8");
                if (typeof json === "string") {
                    try {
                        json = JSON.parse(json);
                    }
                    catch (e) {
                        e.path = filename;
                        e.message = "Error parsing " + filename + ": " + e.message;
                        throw e;
                    }
                }
                else if (typeof json === "function") {
                    json = json();
                }
                return json;
            }
            extensions.parseJSONFile = parseJSONFile;
            /**
             * The default list of supported extensions
             *
             * @returns {object}
             */
            function createExtensions() {
                return {
                    ".js": loadJS,
                    ".json": loadJSON,
                    ".node": loadNode
                };
            }
            extensions.createExtensions = createExtensions;
        })(extensions || (extensions = {}));
        /**
         * Loading "core" modules.
         *
         * The `axy.define.core` is an instance of the class `core.Core`.
         * That instance contains modules `fs`, `paths` and `module`.
         */
        /// <reference path="types.ts" />
        /// <reference path="context.ts" />
        var coreModules;
        (function (coreModules) {
            "use strict";
            /**
             * @class The storage of core modules
             */
            var Core = (function () {
                function Core() {
                    this.modules = {};
                    this.builders = {};
                }
                /**
                 * Returns a native module value
                 *
                 * @param {string} id
                 * @returns {*}
                 * @throws {Error} cannot find module
                 */
                Core.prototype.require = function (id) {
                    var mo, builder;
                    mo = this.modules[id];
                    if (mo !== void 0) {
                        return mo;
                    }
                    builder = this.builders[id];
                    this.builders[id] = null;
                    if (typeof builder !== "function") {
                        throw new Error("Cannot find module '" + id + "'");
                    }
                    mo = builder(id);
                    this.modules[id] = mo;
                    return mo;
                };
                /**
                 * Checks if a native module is exists
                 *
                 * @param {string} id
                 * @returns {boolean}
                 */
                Core.prototype.exists = function (id) {
                    if (this.modules[id] !== void 0) {
                        return true;
                    }
                    if (this.builders[id]) {
                        return true;
                    }
                    return false;
                };
                /**
                 * Adds a native module
                 *
                 * @param {string} id
                 * @param {*} value
                 */
                Core.prototype.addModule = function (id, value) {
                    this.modules[id] = value;
                };
                /**
                 * Adds a module builder
                 *
                 * @param {string} id
                 * @param {function} builder
                 */
                Core.prototype.addModuleBuilder = function (id, builder) {
                    if (this.modules[id] !== void 0) {
                        this.modules[id] = void 0;
                    }
                    this.builders[id] = builder;
                };
                /**
                 * Removes a module (does not affect loaders)
                 *
                 * @param {string} id
                 * @returns {boolean}
                 *          the module existed and has been deleted
                 */
                Core.prototype.removeModule = function (id) {
                    var result = false;
                    if (this.builders[id]) {
                        this.builders[id] = null;
                        result = true;
                    }
                    if (this.modules[id] !== void 0) {
                        this.modules[id] = void 0;
                        result = true;
                    }
                    return result;
                };
                return Core;
            })();
            coreModules.Core = Core;
        })(coreModules || (coreModules = {}));
        /**
         * The analogue of the global object
         *
         * Inside the module is available as `global`.
         * Outside as `axy.define.global`.
         */
        /// <reference path="process.ts" />
        var core;
        (function (core) {
            var global;
            (function (_global) {
                /**
                 * Circular reference to itself
                 */
                _global.global = core.global;
                /**
                 * Global variable `process`
                 */
                _global.process = core.process;
                /**
                 * Real global object
                 */
                _global.window = globalObject;
                /**
                 * Data from the server
                 */
                _global.external = {};
                var timers = core.timers;
                _global.console = _global.window.console;
                _global.setTimeout = timers.setTimeout;
                _global.clearTimeout = timers.clearTimeout;
                _global.setInterval = timers.setInterval;
                _global.clearInterval = timers.clearInterval;
                _global.setImmediate = timers.setImmediate;
                _global.clearImmediate = timers.clearImmediate;
            })(global = core.global || (core.global = {}));
        })(core || (core = {}));
        /**
         * The function `require()`
         */
        /// <reference path="types.ts" />
        /// <reference path="engine.ts" />
        /// <reference path="core/process.ts" />
        /// <reference path="async.ts" />
        /// <reference path="core/fs.ts" />
        /// <reference path="core/path.ts" />
        var req;
        (function (_req) {
            "use strict";
            var fs = core.fs;
            var path = core.path;
            var asyncMo = async;
            /**
             * Creates a require instance for a module constructor
             *
             * @param {*} mo
             * @return {IRequireModule}
             */
            function createForModule(mo) {
                var Module = engine.Module, req;
                req = function require(path) {
                    return mo.require(path);
                };
                req.resolve = function (request) {
                    return Module._resolveFilename(request, mo);
                };
                req.main = core.process.mainModule;
                req.extensions = Module._extensions;
                req.cache = Module._cache;
                req.async = function (id, callback) {
                    var filename, exports, async, err, info;
                    function call(err, exports) {
                        core.process.nextTick(function () {
                            callback(err, exports);
                        });
                    }
                    try {
                        filename = Module._resolveFilename(id, mo);
                        try {
                            exports = mo.require(filename);
                            return call(null, exports);
                        }
                        catch (err) {
                            return call(err, null);
                        }
                    }
                    catch (err) {
                    }
                    async = asyncMo.get();
                    if (!async) {
                        return call(err, null);
                    }
                    if (typeof async.moduleResolve !== "function") {
                        id = path.resolve(path.dirname(mo.filename), id);
                        fs.readFile(id, function () {
                            try {
                                call(null, mo.require(id));
                            }
                            catch (err) {
                                call(err, null);
                            }
                        });
                        return;
                    }
                    function check(info, call) {
                        if (call === void 0) { call = null; }
                        if (!call) {
                            call = callback;
                        }
                        if ((!info.realpath) || (!info.isFile)) {
                            return call(engine.errorModuleNotFound(id), null);
                        }
                        if (!info.cacheable) {
                            throw new Error("Async module '" + id + "' is not cacheable");
                        }
                        if (info.content !== void 0) {
                            fs.writeFileSync(info.realpath, info.content, "utf-8");
                            return call(null, mo.require(info.realpath));
                        }
                        fs.readFile(id, function () {
                            try {
                                call(null, mo.require(id));
                            }
                            catch (err) {
                                call(err, null);
                            }
                        });
                    }
                    info = async.moduleResolve(id, mo, check);
                    if (info) {
                        check(info, call);
                    }
                };
                return req;
            }
            _req.createForModule = createForModule;
        })(req || (req = {}));
        /**
         * Common functionality of modular system
         */
        /// <reference path="types.ts" />
        /// <reference path="extensions.ts" />
        /// <reference path="coreModules.ts" />
        /// <reference path="core/process.ts" />
        /// <reference path="core/global.ts" />
        /// <reference path="core/fs.ts" />
        /// <reference path="core/path.ts" />
        /// <reference path="util.ts" />
        /// <reference path="helpers.ts" />
        /// <reference path="req.ts" />
        /// <reference path="context.ts" />
        var engine;
        (function (engine) {
            "use strict";
            var path = core.path;
            /**
             * The private variable contained a global paths list
             */
            var modulePaths = [];
            /**
             * @class Module object
             * Module objects are accessible inside module constructors as the variable `module`.
             */
            var Module = (function () {
                /**
                 * The constructor
                 *
                 * @param {string} id
                 * @param {object} parent
                 */
                function Module(id, parent) {
                    /**
                     * The value of the module
                     * This value is returned by the function `require()`
                     */
                    this.exports = {};
                    /**
                     * The full normalized path to the module
                     */
                    this.filename = null;
                    /**
                     * Is the module loaded?
                     */
                    this.loaded = false;
                    /**
                     * The list of modules that have been created due to the current
                     */
                    this.children = [];
                    this.id = id;
                    this.parent = parent;
                    if (parent && parent.children) {
                        parent.children.push(this);
                    }
                }
                /**
                 * Runs the main module.
                 * In node.js it is taken of the command line arguments.
                 * In axy-define it called from `axy.define.require()`.
                 */
                Module.runMain = function () {
                    Module._load(core.process.argv[1], null, true);
                };
                /**
                 * Wraps a file text content in the module wrapper
                 *
                 * @param {string} content
                 * @return {string}
                 */
                Module.wrap = function (content) {
                    var w = Module.wrapper;
                    return [w[0], content, w[1]].join("");
                };
                /**
                 * Loads a module
                 *
                 * @param {string} request
                 * @param {*} parent
                 * @param {boolean} isMain
                 * @return {*}
                 */
                Module._load = function (request, parent, isMain) {
                    if (isMain === void 0) { isMain = false; }
                    var filename, module;
                    filename = Module._resolveFilename(request, parent);
                    if (Module._cache[filename]) {
                        return Module._cache[filename].exports;
                    }
                    if (context.coreInstance.exists(filename)) {
                        return context.coreInstance.require(filename);
                    }
                    module = new Module(filename, parent);
                    if (isMain) {
                        core.process.mainModule = module;
                        module.id = ".";
                    }
                    Module._cache[filename] = module;
                    try {
                        module.load(filename);
                    }
                    catch (e) {
                        delete Module._cache[filename];
                        throw e;
                    }
                    return module.exports;
                };
                /**
                 * Resolves the real filename of a requested module
                 *
                 * @param {string} request
                 * @param {*} parent
                 * @return {string}
                 * @throws {Error} - module not found
                 */
                Module._resolveFilename = function (request, parent) {
                    var paths, filename;
                    if (context.coreInstance.exists(request)) {
                        return request;
                    }
                    paths = Module._resolveLookupPaths(request, parent)[1];
                    filename = Module._findPath(request, paths);
                    if (!filename) {
                        throw errorModuleNotFound(request);
                    }
                    return filename;
                };
                /**
                 * Finds the path to a requested module in a paths list
                 *
                 * @param {string} request
                 * @param {string[]} paths
                 * @return {object}
                 */
                Module._findPath = function (request, paths) {
                    var exts = helpers.keys(Module._extensions), trailingSlash = (request.slice(-1) === "/"), cacheKey = JSON.stringify({ request: request, paths: paths }), len, i, basePath, filename;
                    if (request.charAt(0) === "/") {
                        paths = [""];
                    }
                    if (Module._pathCache[cacheKey]) {
                        return Module._pathCache[cacheKey];
                    }
                    for (i = 0, len = paths.length; i < len; i += 1) {
                        basePath = path.resolve(paths[i], request);
                        if (!trailingSlash) {
                            filename = util.tryFile(basePath) || util.tryExtensions(basePath, exts);
                        }
                        if (!filename) {
                            filename = util.tryPackage(basePath, exts) || util.tryExtensionsDirMain(basePath, exts);
                        }
                        if (filename) {
                            Module._pathCache[cacheKey] = filename;
                            return filename;
                        }
                    }
                    return null;
                };
                /**
                 * Returns the info about a request (a module id and a list of paths)
                 *
                 * @param {string} request
                 * @param {*} parent
                 * @return {Array}
                 */
                Module._resolveLookupPaths = function (request, parent) {
                    var start, paths, isIndex, parentIdPath, id;
                    if (context.coreInstance.exists(request)) {
                        return [request, []];
                    }
                    start = request.substring(0, 2);
                    if ((start !== "./") && (start !== "..")) {
                        paths = modulePaths;
                        if (parent) {
                            if (!parent.paths) {
                                parent.paths = [];
                            }
                            paths = parent.paths.concat(paths);
                        }
                        return [request, paths];
                    }
                    isIndex = /^index\.\w+?$/.test(path.basename(parent.filename));
                    parentIdPath = isIndex ? parent.id : path.dirname(parent.id);
                    id = path.resolve(parentIdPath, request);
                    if ((parentIdPath === ".") && (id.indexOf("/") === -1)) {
                        id = "./" + id;
                    }
                    return [id, [path.dirname(parent.filename)]];
                };
                /**
                 * Returns a list of directories for search relative a module directory
                 *
                 * @param {string} from
                 *        the module directory
                 * @return {string[]}
                 */
                Module._nodeModulePaths = function (from) {
                    var result = ["/node_modules"], dir = "";
                    from.split("/").slice(1).forEach(function (item) {
                        dir += "/" + item;
                        if (item !== "node_modules") {
                            result.push(dir + "/node_modules");
                        }
                    });
                    return result.reverse();
                };
                /**
                 * The dummy for compatibility
                 */
                Module._debug = function () {
                    return;
                };
                /**
                 * For compatibility
                 */
                Module.requireRepl = function () {
                    throw new Error("Module 'repl' is not defined in this environment");
                };
                /**
                 * Initializes the global paths list
                 */
                Module._initPaths = function () {
                    modulePaths = core.process.paths;
                };
                /**
                 * Loads the module value by a file name
                 *
                 * @param {string} filename
                 */
                Module.prototype.load = function (filename) {
                    var extension;
                    if (this.loaded) {
                        throw new Error("Already loaded");
                    }
                    this.filename = filename;
                    this.paths = Module._nodeModulePaths(path.dirname(filename));
                    extension = path.extname(filename) || ".js";
                    if (!Module._extensions[extension]) {
                        extension = ".js";
                    }
                    Module._extensions[extension](this, filename);
                    this.loaded = true;
                };
                /**
                 * Require relative this module
                 *
                 * @param {string} path
                 * @return {*}
                 */
                Module.prototype.require = function (path) {
                    return Module._load(path, this);
                };
                /**
                 * "Compiles" the module content
                 *
                 * @param {string|function} content
                 * @param {string} filename
                 */
                Module.prototype._compile = function (content, filename) {
                    var wrapper, wrapped, args;
                    if (typeof content === "function") {
                        wrapper = content;
                    }
                    else {
                        wrapped = Module.wrap(content);
                        wrapper = eval(wrapped);
                        if (!wrapper) {
                            wrapper = eval("var w=" + wrapped + ";w");
                        }
                    }
                    args = [
                        this.exports,
                        req.createForModule(this),
                        this,
                        filename,
                        path.dirname(filename)
                    ];
                    args = args.concat(settings.instance.wrapperArgs);
                    wrapper.apply(this.exports, args);
                };
                /**
                 * Circular link on itself (as it is written in the node.js "backwards compatibility")
                 */
                Module.Module = Module;
                /**
                 * The list of the file loaders by extensions (@see `extensions.ts`)
                 */
                Module._extensions = extensions.createExtensions();
                /**
                 * The cache of the loaded modules
                 */
                Module._cache = {};
                /**
                 * In node.js this variable depends on one of the environment variables.
                 * Affects the context load modules.
                 * Here is always FALSE.
                 */
                Module._contextLoad = false;
                /**
                 * In node.js it is copy of the list of global paths.
                 * Modification of it does not affect.
                 * Here is always empty.
                 */
                Module.globalPaths = [];
                /**
                 * The cache of `_findPath()`
                 */
                Module._pathCache = {};
                /**
                 * The cache of `realpath()`
                 */
                Module._realpathCache = {};
                /**
                 * The module wrapper
                 * Here it affects only the file whose contents is a string
                 */
                Module.wrapper = [
                    "(function (exports, require, module, __filename, __dirname, global, process) { " + "(function (exports, require, module, __filename, __dirname) { ",
                    "\n})(exports, require, module, __filename, __dirname);});"
                ];
                return Module;
            })();
            engine.Module = Module;
            function destroy() {
                Module._cache = null;
                Module._extensions = null;
            }
            engine.destroy = destroy;
            function errorModuleNotFound(id, raise) {
                if (id === void 0) { id = null; }
                if (raise === void 0) { raise = false; }
                var err = new Error("Cannot find module '" + id + "'");
                err.code = "MODULE_NOT_FOUND";
                if (raise) {
                    throw err;
                }
                return err;
            }
            engine.errorModuleNotFound = errorModuleNotFound;
        })(engine || (engine = {}));
        /**
         * Some global types
         *
         * These types are moved from the specific modules to the global scope because some IDE do not supported export types.
         */
        var signals;
        (function (signals) {
            "use strict";
            /**
             * Events emitter
             */
            var Emitter = (function () {
                function Emitter() {
                    this.listeners = {};
                }
                /**
                 * Sets an event listener
                 *
                 * @param {string} event
                 * @param {function} listener
                 */
                Emitter.prototype.on = function (event, listener) {
                    if (!this.listeners[event]) {
                        this.listeners[event] = [];
                    }
                    this.listeners[event].push(listener);
                };
                /**
                 * Fires event
                 *
                 * @param {string} event
                 * @param {any[]} args
                 */
                Emitter.prototype.fire = function (event, args) {
                    if (args === void 0) { args = []; }
                    var list = this.listeners[event], listener, len, i;
                    if (list) {
                        for (i = 0, len = list.length; i < len; i += 1) {
                            listener = list[i];
                            if (typeof listener === "function") {
                                listener.apply(null, args);
                            }
                        }
                    }
                };
                /**
                 * Destroys the emitter
                 */
                Emitter.prototype.destroy = function () {
                    this.listeners = null;
                };
                return Emitter;
            })();
            signals.Emitter = Emitter;
        })(signals || (signals = {}));
        /**
         * Settings of the system
         */
        var settings;
        (function (settings) {
            "use strict";
            settings.instance = {
                dirMain: ["index"],
                packageMain: ["main"],
                wrapperArgs: [core.global, core.process]
            };
        })(settings || (settings = {}));
        /**
         * Creating structure of `define` function
         *
         * All compiled code including in the `createSandbox()` function (see file `assembly/axy-define.js.tpl`).
         * `createSandbox()` allows you to create a full copy of the system.
         */
        /// <reference path="types.ts" />
        /// <reference path="engine.ts" />
        /// <reference path="helpers.ts" />
        /// <reference path="coreModules.ts" />
        /// <reference path="core/fs.ts" />
        /// <reference path="core/path.ts" />
        /// <reference path="core/timers.ts" />
        /// <reference path="core/process.ts" />
        /// <reference path="core/global.ts" />
        /// <reference path="settings.ts" />
        /// <reference path="context.ts" />
        /// <reference path="plugins.ts" />
        var sandbox;
        (function (_sandbox) {
            "use strict";
            var fs = core.fs;
            var path = core.path;
            var timers = core.timers;
            var globalMo = core.global;
            var settingsMo = settings;
            var asyncMo = async;
            /**
             * Creates a system
             *
             * @param {function} cs - `createSandbox()` wrapper
             * @return {function}
             */
            function create(cs) {
                var sandbox, gRequire, Module = engine.Module, getModule; // typeof IRequireGlobal.getModule;
                sandbox = function define(id, content) {
                    init();
                    fs.writeFileSync(id, content, "utf-8");
                };
                context.sandboxInstance = sandbox;
                context.coreInstance = new coreModules.Core();
                context.pluginsInstance = new plugins.Plugins(context);
                context.signalInstance = new signals.Emitter();
                getModule = function (id, context) {
                    if (context === void 0) { context = {}; }
                    var cache = Module._cache;
                    init();
                    if (context.reload) {
                        delete cache[id];
                    }
                    if (!cache.hasOwnProperty(id)) {
                        core.process.argv = ["axy", id].concat(context.argv || []);
                        if (typeof context.dir === "string") {
                            core.process.chdir(context.dir);
                        }
                        else if (context.dir !== false) {
                            core.process.chdir(path.dirname(id));
                        }
                        Module.runMain();
                    }
                    return cache[id];
                };
                gRequire = function require(id, context) {
                    var module = getModule(id, context);
                    return module && module.exports;
                };
                gRequire.getModule = getModule;
                sandbox.require = gRequire;
                sandbox.core = context.coreInstance;
                sandbox.core.addModule("fs", fs);
                sandbox.core.addModule("path", path);
                sandbox.core.addModule("timers", timers);
                sandbox.core.addModuleBuilder("module", function () {
                    init();
                    return engine.Module;
                });
                sandbox.core.addModule("__axy", { util: util, helpers: helpers });
                sandbox.global = globalMo;
                sandbox.async = asyncMo;
                sandbox.createSandbox = function () {
                    var sandbox = cs();
                    context.pluginsInstance.applyToSandbox(sandbox);
                    return sandbox;
                };
                sandbox.settings = settingsMo.instance;
                function destroy() {
                    context.destroy();
                    engine.destroy();
                    helpers.destroyContainer(core.global);
                    helpers.destroyContainer(sandbox);
                }
                sandbox.signal = function (event) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    context.signalInstance.fire(event, args);
                    if (event === "exit") {
                        destroy();
                    }
                };
                sandbox.addPlugin = function addPlugin(name, builder) {
                    return context.pluginsInstance.append(name, builder);
                };
                return sandbox;
            }
            _sandbox.create = create;
            var initialized = false;
            function init() {
                if (!initialized) {
                    engine.Module._initPaths();
                    initialized = true;
                }
            }
        })(sandbox || (sandbox = {}));
        /**
         * The plugin system
         */
        /// <reference path="context.ts" />
        /// <reference path="helpers.ts" />
        /// <reference path="sandbox.ts" />
        var plugins;
        (function (plugins) {
            "use strict";
            /**
             * The plugins container
             */
            var Plugins = (function () {
                /**
                 * The constructor
                 *
                 * @param {object} context
                 *        the system context
                 */
                function Plugins(context) {
                    this.context = context;
                    this.plugins = [];
                }
                /**
                 * Appends a plugin to the system
                 *
                 * @param {string} name
                 * @param {function} builder
                 * @return {*}
                 *         returns the builder return
                 */
                Plugins.prototype.append = function (name, builder) {
                    this.plugins.push({
                        name: name,
                        builder: builder
                    });
                    builder(this.context);
                };
                /**
                 * Applies the plugins list to a child sandbox
                 *
                 * @param {object} sandbox
                 */
                Plugins.prototype.applyToSandbox = function (sandbox) {
                    this.plugins.forEach(function (item) {
                        sandbox.addPlugin(item.name, item.builder);
                    });
                };
                /**
                 * Destroys the plugin container
                 */
                Plugins.prototype.destroy = function () {
                    helpers.destroyContainer(this);
                };
                return Plugins;
            })();
            plugins.Plugins = Plugins;
        })(plugins || (plugins = {}));
        
        return sandbox.create(createSandbox);
    }
    return createSandbox();
})(window);
