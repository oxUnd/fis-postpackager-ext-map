/**
 * fis.baidu.com
 */

var extMap = module.exports = function(ret, conf, settings, opt) {
    fis.util.map(ret.map.res, function(id, info) {
        var content = ret.ids[id].getContent();
        info['hash'] = ret.ids[id].getHash();
        info['content'] = content;
    });

    //project root
    var root = fis.project.getProjectPath();
    var ns = fis.config.get('namespace');

    //create map.json
    var map = fis.file(root, (ns ? ns + '-' : '') + 'map.json');
    map.useHash = false;
    map.setContent(JSON.stringify(ret.map, null, opt.optimize ? null : 4));
    ret.pkg[map.subpath] = map;
};
