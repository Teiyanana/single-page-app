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
        `,
      // 配置滑块运动的速度和高度，在模块配置映射中保存收起和展开的时间和高度
      chat_extend_time: 250,
      chat_retract_time: 300,
      chat_extent_height: 450,
      chat_retract_height: 15,
      chat_extended_title: '点击收起',
      chat_retracted_title: '点击展开'
    },
    stateMap = { //存储整个模块共享的动态信息
      $container: null,
      is_chat_retracted: true // true: 聊天滑块收缩状态，fals: 展开状态
    },
    jqueryMap = {}, // 存储jQuery集合缓存
    setJqueryMap, // 声明所有模块的作用域内变量。
    toggleChat, // 切换聊天模块变量
    onClickChat, // 点击聊天模块事件处理程序
    initModule;

  /**
   * DOM 方法
   */
  toggleChat = function (do_extend, callback) {
    var
      px_chat_ht = jqueryMap.$chat.height(),
      is_open = px_chat_ht === configMap.chat_extent_height,
      is_closed = px_chat_ht === configMap.chat_retract_height,
      is_Sliding = !is_open && !is_closed;
    // 消除冲突
    if (is_Sliding) {
      return false;
    }
    // 开始展开聊天滑动
    if (do_extend) {
      jqueryMap.$chat.animate({
        height: configMap.chat_extent_height
      },
        configMap.chat_extend_time,
        function () {
          jqueryMap.$chat.attr('title', configMap.chat_extended_title);
          stateMap.is_chat_retracted = false;
          if (callback) {
            callback(jqueryMap.$chat);
          }
        });
      return true;
    }

    // 开始收起聊天滑块
    jqueryMap.$chat.animate({
      height: configMap.chat_retract_height
    },
      configMap.chat_retract_time,
      function () {
        jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
        stateMap.is_chat_retracted = true;
        if (callback) {
          callback(jqueryMap.$chat);
        }
      });
    return true;
  }

  /**
   * 使用setJqueryMap来缓存jQuery集合。
   * 几乎所编写的每个shell和功能模块都应该有这个函数。
   * jqueryMap缓存的用途是可以大大减少jQuery对文档的遍历次数，提高性能。
   */
  setJqueryMap = function() {
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container,
      $chat: $container.find('.spa-shell-chat')
    };
  };

  

  /**
   * 为jQuery事件处理函数保留的Event handlers区块
   */
  onClickChat = function(event) {
    toggleChat(stateMap.is_chat_retracted);
    return false;
  }

  /**
   * 创建initModule公开方法，用于初始化模块。
   */
  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    // 默认聊天滑块收起，并注册聊天滑块的点击事件
    stateMap.is_chat_retracted = true;
    jqueryMap.$chat
      .attr('title', configMap.chat_retracted_title)
      .click(onClickChat);
  };

  return {
    initModule: initModule
  };
}());