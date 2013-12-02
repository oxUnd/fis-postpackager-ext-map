/**
 * file: mod-store.js
 * ver: 1.0.0
 * auth: zhangjiachen@baidu.com
 * modify: fansekey@gmail.com
 * update: 2013-11-13
 */
var require, define;

(function(self) {
    var head = document.getElementsByTagName('head')[0],
        loadingMap = {},
        factoryMap = {},
        modulesMap = {},
        scriptsMap = {},
        resMap = {},
        pkgMap = {};

    function checkLocalStorage() {
        try {
            //测试local
            localStorage.setItem('fis_test', 'good');
            localStorage.removeItem('fis_test');
            return true;
        } catch (e) {
            return false;
        }
    }
    function loadByXHR(id, url, callback) {
        var store = localStorage
            , content
            , has
            , diff = []
            , script = ''
            //保存包内组件内容
            , scripts = [];

        var res = resMap[id] || {};
        var pkg = res.pkg;
        var url = '/webapp.php';

        if (pkg) {
            if ((has = store.getItem(pkg))) {
                has = has.split('|');
                for (var i = 0, len = has.length; i < len; i++) {
                    var oldUrl = store.getItem(has[i]);
                    if (oldUrl) {
                        //组件内容修改了
                        if (oldUrl != resMap[has[i]]['url']) {
                            diff[i] = has[i];
                            store.removeItem(oldUrl);
                        } else {
                            scripts[i] = store.getItem(oldUrl);
                        }
                    } else {
                        diff[i] = has[i];
                    }
                }
            } else {
                has = pkgMap[pkg]['has'];
                diff = has;
            }
            store.setItem(pkg, pkgMap[pkg]['has'].join('|'));
        } else {
            if ((script = store.getItem(res.url))) {
                scripts.push(script);
            } else {
                diff.push(id);
            }
        }

        url = url + '?diff=' + diff.join('|');

        function _load(url, scripts, diff, cb) {
            var xhr = new window.XMLHttpRequest;
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 ) {
                    if (xhr.status == 200) {
                        var obj = eval('(' + xhr.responseText + ')');
                        if (!obj) {
                            return;
                        }
                        var data = obj['data'];
                        for (var resId in data) {
                            if (data.hasOwnProperty(resId)) {
                                store.setItem(data[resId]['uri'], data[resId]['content']);
                                store.setItem(resId, data[resId]['uri']);
                                scripts.push(data[resId]['content']);
                            }
                        }
                        cb(scripts.join(''));
                    } else {
                        throw new Error('A unkown error occurred.');
                    }
                }
            };
            xhr.open('get', url);
            xhr.send(null);
        }

        if (diff.length == 0) {
            callback(scripts.join(''));
        } else {
            _load(url, scripts, diff, callback);
        }
    }



    function createScript(url, onerror) {
        if (url in scriptsMap) return;
        scriptsMap[url] = true;

        var script = document.createElement('script');
        if (onerror) {
            var tid = setTimeout(onerror, require.timeout);

            script.onerror = function() {
                clearTimeout(tid);
                onerror();
            };

            script.onreadystatechange = function() {
                if (this.readyState == 'complete') {
                    clearTimeout(tid);
                }
            }
        }
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);
        return script;
    }


    function loadScript(id, callback, onerror) {
        var queue = loadingMap[id] || (loadingMap[id] = []);
        queue.push(callback);

        //
        // resource map query
        //
        var res = resMap[id] || {};
        var pkg = res.pkg;
        var url;

        if (pkg) {
            url = pkgMap[pkg].url;
        } else {
            url = res.url || id;
        }

        if (!window.XMLHttpRequest || !checkLocalStorage()) {
        	createScript(url, onerror && function() {
        		onerror(id);
        	});
        } else {
            if (! (url in scriptsMap))  {
                scriptsMap[url] = true;
                loadByXHR(id, url, function(content) {
                    script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.innerHTML = content;
                    head.appendChild(script);
                });
            }
        }
    }

    define = function(id, factory) {
        factoryMap[id] = factory;

        var queue = loadingMap[id];
        if (queue) {
            for(var i = queue.length - 1; i >= 0; --i) {
                queue[i]();
            }
            delete loadingMap[id];
        }
    };

    require = function(id) {
        id = require.alias(id);

        var mod = modulesMap[id];
        if (mod) {
            return mod.exports;
        }

        //
        // init module
        //
        var factory = factoryMap[id];
        if (!factory) {
            throw Error('Cannot find module `' + id + '`');
        }

        mod = modulesMap[id] = {
            exports: {}
        };

        //
        // factory: function OR value
        //
        var ret = (typeof factory == 'function')
                ? factory.apply(mod, [require, mod.exports, mod])
                : factory;

        if (ret) {
            mod.exports = ret;
        }
        return mod.exports;
    };

    require.async = function(names, onload, onerror) {
        if (typeof names == 'string') {
            names = [names];
        }

        for(var i = names.length - 1; i >= 0; --i) {
            names[i] = require.alias(names[i]);
        }

        var needMap = {};
        var needNum = 0;

        function findNeed(depArr) {
            for(var i = depArr.length - 1; i >= 0; --i) {
                //
                // skip loading or loaded
                //
                var dep = depArr[i];
                if (dep in factoryMap || dep in needMap) {
                    continue;
                }

                needMap[dep] = true;
                needNum++;
                loadScript(dep, updateNeed, onerror);

                var child = resMap[dep];
                if (child && 'deps' in child) {
                    findNeed(child.deps);
                }
            }
        }

        function updateNeed() {
            if (0 == needNum--) {
                var i, n, args = [];
                for(i = 0, n = names.length; i < n; ++i) {
                    args[i] = require(names[i]);
                }
                onload && onload.apply(self, args);
            }
        }

        findNeed(names);
        updateNeed();
    };

    require.resourceMap = function(obj) {
        var k, col;

        // merge `res` & `pkg` fields
        col = obj.res;
        for(k in col) {
            if (col.hasOwnProperty(k)) {
                resMap[k] = col[k];
            }
        }

        col = obj.pkg;
        for(k in col) {
            if (col.hasOwnProperty(k)) {
                pkgMap[k] = col[k];
            }
        }
    };

    require.loadJs = function(url) {
        createScript(url);
    };

    require.loadCss = function(cfg) {
        if (cfg.content) {
            var sty = document.createElement('style');
            sty.type = 'text/css';

            if (sty.styleSheet) {       // IE
                sty.styleSheet.cssText = cfg.content;
            } else {
                sty.innerHTML = cfg.content;
            }
            head.appendChild(sty);
        }
        else if (cfg.url) {
            var link = document.createElement('link');
            link.href = cfg.url;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        }
    };


    require.alias = function(id) {return id};

    require.timeout = 5000;

    define.amd = {
        'jQuery': true,
        'version': '1.0.0'
    };

})(this);
