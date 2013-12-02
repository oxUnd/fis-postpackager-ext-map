<?php
define("WP_DATA_PATH", dirname(__FILE__));
define("WP_GET_DATA", "data");
define("WP_ERROR_WRONG_PARAM", 1);

$g_get_type = $_GET['type'];//请求类型
$g_packageHashs = $_GET;//资源包与hash、sum关联数组
$g_res_obj = array(
    'data'=> array(),
    'time'=> 0,
    'error'=> ''
);//资源对象

$g_start = microtime(true);

//如果请求data
$diff = $_GET['diff'];

if (!$diff) {
    $g_res_obj = array(
        'data' => '{}',
    );
} else {
    $diffs = explode('|', $diff);
    $g_res_obj['data'] = Bd_Webapp_Reader::getData($diffs);
    Bd_Webapp_Reader::setHeader();
    $g_end = microtime(true);
    $g_res_obj['time'] = round(($g_end - $g_start)*1000);

    echo json_encode($g_res_obj);
}


class Bd_Webapp_Reader{
    public static $resMap = array();
    public static function setHeader(){
        //CORS header
        if(preg_match('/\([^)]*OS\s*[^)]*6/i',$_SERVER['HTTP_USER_AGENT'])){
            header('Cache-Control:no-cache,no-store,must-revalidate');
        }
        header("Content-type: text/javascript");
        //Gzip压缩 ,不能同时使用 ob_gzhandler() 和 zlib.output_compression。
        if (Extension_Loaded('zlib') && !ini_get('zlib.output_compression')){
            //解决PHP开启Gzip页面没有输出的故障
            if (strnatcasecmp(PHP_VERSION, '5.3') <= 0 && ini_get('output_buffering') == "4096"){
                ini_set('output_buffering', 0);
            }
            //如果zlib扩展已经加载到PHP中，用php的内置压缩函数
            ob_start('ob_gzhandler');
        }
    }
    /**
     * @static
     * @param $packageName
     * @return string
     */
    private static function getPath($packageName){
        $tokens = explode('_', $packageName, 2);
        $moduleName = $tokens[0];
        return WP_DATA_PATH . '/' . $moduleName . '/' . $packageName;
    }

    /*
    *获取资源数据
    */
    public static function getData($diff_list){
        $data = array();
        foreach ($diff_list as $id) {
            if ($pos = strpos($id, ':')) {
                $namespace = substr($id, 0, $pos);
                if (isset(self::$resMap[$namespace]) || self::register($namespace)) {
                    $resMap = self::$resMap[$namespace];
                    $data[$id] = $resMap[$id];
                } else {
                    //error
                }
            }
        }

        return $data;
    }

    public static function register($namespace) {
        $path = WP_DATA_PATH . '/' . $namespace . '-data.json';
        if (is_file($path)) {
            self::$resMap[$namespace] = json_decode(file_get_contents($path), true);
            return true;
        }
        return false;
    }
}