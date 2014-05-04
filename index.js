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

    //处理自动打包插件传递的多维的打包数据(如国际化多国家map配置),生成md5及多维的map.json
    var retList = opt['retlist']; 
    if(retList){
        //给多维度的资源添加md5
        _.map(retList,function(dimen,_ret){
            if(dimen!="default"){ //默认维度不处理
                _.map(_ret.res, function(id, info) {
                    info['hash'] = fis.util.md5(id, 7);
                });  
                //生成多个维度的map.json
                var map = fis.file(root, (ns ? ns + '-' : '') + 'map-' + dimen +'.json');
                //修正map文件放置目录，config下
                map.release = "/config" + map.subpath;
                map.setContent(JSON.stringify(_ret, null, opt.optimize ? null : 4));      
                ret.pkg[map.subpath] = map;  
            }            
        });
    }
    
    
    
    //create map.json
    var map = fis.file(root, (ns ? ns + '-' : '') + 'map.json');
    map.useHash = false;
    map.setContent(JSON.stringify(ret.map), null, opt.optimize ? null : 4);
    ret.pkg[map.subpath] = map;
    //create data.json
    if (settings['create'] && settings['create'].indexOf('data.json') != -1) {
        allRet = ret;
        genData(opt);
    }
};
