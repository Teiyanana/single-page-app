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
      anchor_schema_map: { // 定义urlAnchor使用的映射，用于验证
        chat: {
          open: true,
          closed: true
        }
      },
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
      anchor_map: {}, // 保存当前锚值
      is_chat_retracted: true // true: 聊天滑块收缩状态，fals: 展开状态
    },
    copyAnchorMap,
    jqueryMap = {}, // 存储jQuery集合缓存
    setJqueryMap, // 声明所有模块的作用域内变量。
    toggleChat, // 切换聊天模块变量
    changeAnchorPart,
    onHashchange,
    onClickChat, // 点击聊天模块事件处理程序
    initModule;

  /**
   * 使用setJqueryMap来缓存jQuery对象集合。
   * 几乎所编写的每个shell和功能模块都应该有这个函数。
   * jqueryMap缓存的用途是可以大大减少jQuery对文档的遍历次数，提高性能。
   */
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container,
      $chat: $container.find('.spa-shell-chat')
    };
  };

  /**
   * utility 方法
   */
  // 返回锚值映射，
  copyAnchorMap = function() {
    return $.extend(true, {}, stateMap.anchor_map);
  };

  /**
   * DOM 方法集合
   */
  /**
   * 聊天滑块收起|展开管理
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
   * 为jQuery事件处理函数保留的Event handlers区块
   */
  /**
   * 目的：改变URI 锚组件部分
   * 参数：
   *  arg_map: 描述我们想要改编的锚组件
   * 返回：
   *  true: 锚更新了
   *  false: 锚不能更新
   * 操作：
   *  
   *      
   */
  changeAnchorPart = function(arg_map) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name,
      key_name_dep;
    // 开始吧变化的anchor合并到anchor map中
    KEYVAL:
    for (key_name in arg_map) {
      if (arg_map.hasOwnProperty(key_name)) {
        if (key_name.indexOf('_') === 0) {
          continue KEYVAL;
        }
        // 更新独立的key value
        anchor_map_revise[key_name] = arg_map[key_name];
        // 更新正在匹配的独立key
        key_name_dep = '_' + key_name;
        if (arg_map[key_name_dep]) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revice['_s' + key_name_dep];
        }
      }
    }
    // 如果不能通过模式验证就不设置锚。当发生这样的情况时，把毛组件回滚到它之前的状态
    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }
    return bool_return;
  }

  onHashchange = function (event) {
    var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous,
      _s_chat_proposed,
      s_chat_proposed;
    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    // 如果锚变了，调整
    if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch (s_chat_proposed) {
        case 'open':
          toggleChat(true);
          break;
        case 'closed':
          toggleChat(false);
          break;
        default:
          toggleChat(false);
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }
    return false;
  }
  
  // 聊天滑块事件处理程序
  onClickChat = function(event) {
    if (toggleChat(stateMap.is_chat_retracted)) {
      // 记录状态
      $.uriAnchor.setAnchor({
        chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
      });
    }
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
    
    // 配置uri插件，用于检测模式
    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    $(window)
      .bind('hashchange', onHashchange)
      .trigger('hashchange');
  };

  return {
    initModule: initModule
  };
}());