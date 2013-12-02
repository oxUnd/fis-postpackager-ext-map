/**
 * fis.baidu.com
 */

'use strict'

var allRet;

//project root
var root;
var ns;

var _ = fis.util;


// create <ns>.data.php
function genData(opt) {
    var ids = allRet.ids;
    var data = {};
    _.map(ids, function(id, file) {
        //只对JS起效
        if (file.rExt == '.js') {
            data[id] = {
                'uri': file.getUrl(opt.hash, opt.domain),
                'content': file.getContent()
            };
        }
    });
    var dataFile = fis.file(root, '/webapp/' + (ns ? ns + '-' : '') + 'data.json');
    dataFile.useHash = false;
    dataFile.setContent(JSON.stringify(data), null, opt.optimize ? null : 4);
    allRet.pkg[dataFile.subpath] = dataFile;
}

module.exports = function(ret, conf, settings, opt) {

    root = fis.project.getProjectPath();
    ns = fis.config.get('namespace');

    _.map(ret.map.res, function(id, info) {
        //提供给@wangcheng的统计用
        info['hash'] = fis.util.md5(id, 7);
    });

    //create map.json
    var map = fis.file(root, (ns ? ns + '-' : '') + 'map.json');
    map.useHash = false;
    map.setContent(JSON.stringify(ret.map), null, opt.optimize ? null : 4);
    ret.pkg[map.subpath] = map;

    allRet = ret;
    genData(opt);
};
