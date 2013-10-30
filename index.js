/**
 * fis.baidu.com
 */

var extMap = module.exports = function(ret, conf, settings, opt) {
    var hashMap = []
    fis.util.map(ret.map.res, function(id, info) {
        var content = ret.ids[id].getContent();
        info['hash'] = fis.util.md5(id, 7);
        hashMap[info['hash']] = id;
    });

    //project root
    var root = fis.project.getProjectPath();
    var ns = fis.config.get('namespace');

    //create map.json
    var map = fis.file(root, (ns ? ns + '-' : '') + 'map.json');
    map.useHash = false;
    map.setContent(JSON.stringify(ret.map), null, opt.optimize ? null : 4);
    ret.pkg[map.subpath] = map;

    var hashFile = fis.file(root, (ns ? ns + '-': '') + 'hash.json');
    hashFile.useHash = false;
    hashFile.setContent(JSON.stringify(hashMap), null, opt.optimize ? null : 4)
};
