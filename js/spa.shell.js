/**
 * spa.shell.js
 * Shell module for SPA
 */

/*jslint
	browser: true,
	continue: true,
	devel: true,
	indent: 2,
	maxerr: 50,
	newcap: true,
	nomen: true,
	plusplus: true,
	regexp: true,
	sloppy: true,
	vars: true,
	white: true
*/

spa.shell = (function() {
  var
    configMap = {
      main_html: String() + 
        `
        <div class="spa-shell-head">
          <div class="spa-shell-head-logo"></div>
          <div class="spa-shell-head-acct"></div>
          <div class="spa-shell-head-search"></div>
        </div>
        <div class="spa-shell-main">
          <div class="spa-shell-main-nav"></div>
          <div class="spa-shell-main-content"></div>
        </div>
        <div class="spa-shell-foot"></div>
        <div class="spa-shell-chat"></div>
        <div class="spa-shell-modal"></div>
        `
    },
    stateMap = { $container: null }, //存储整个模块共享的动态信息
    jqueryMap = {}, // 存储jQuery集合缓存
    setJqueryMap, // 声明所有模块的作用域内变量。
    initModule;

  /**
   * 使用setJqueryMap来缓存jQuery集合。
   * 几乎所编写的每个shell和功能模块都应该有这个函数。
   * jqueryMap缓存的用途是可以大大减少jQuery对文档的遍历次数，提高性能。
   */
  setJqueryMap = function() {
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container
    };
  };

  /**
   * 为jQuery事件处理函数保留的Event handlers区块
   */

  /**
   * 创建initModule公开方法，用于初始化模块。
   */
  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();
  };

  return {
    initModule: initModule
  };
}());