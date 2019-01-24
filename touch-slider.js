(function($) {
  var TouchSlide = function(iTarget, setting) {
    var _this_ = this;

    //定义默认配置参数
    this.setting = {
      width: 296,
      height: 149,
      isShowBtns: 'yes', //是否显示控制按钮
      autoPlay: true, //是否自动播放
      speed: 500,
      autoTime: 5000 //自动播放的时间
    };
    //如果人为配置参数就继承
    $.extend(this.setting, setting);

    //保存需要操作的对象
    this.slideWrap = iTarget;
    this.slideContent = iTarget.find('.slide-content');
    this.slideItem = iTarget.find('.slide-item');
    this.slideSize = this.slideItem.size();

    //设置幻灯片的尺寸
    this.slideWrap.css({
      width: this.setting.width,
      height: this.setting.height
    });
    this.slideItem.css({
      width: this.setting.width,
      height: this.setting.height
    });
    this.slideContent.css({
      width: this.setting.width,
      height: this.setting.height
    });
    this.slideItem
      .find('a')
      .css({ width: this.setting.width, height: this.setting.height });

    if (this.slideSize > 1) {
      //记录鼠标点击的位置
      var startLayerX = 0,
        stopLayerX = 0,
        //startLayerY = 0,
        //stopLayerY  = 0,
        startTime = 0,
        stopTime = 0,
        doc = $(document);
      this.loop = 0;
      this.flag = true;
      //绑定事件处理
      this.slideWrap
        .bind('touchstart', function(e) {
          //e.preventDefault();
          if (_this_.flag) {
            _this_.flag = false;
            startLayerX = _this_._getLayerOffset(e).layerX;
            //startLayerY = _this_._getLayerOffset(e).layerY;
            startTime = +new Date();
            //给document绑定事件
            doc.bind('touchmove', touchMove);
            doc.bind('touchend', touchEnd);
            //当触摸的时候清楚自动播放
            if (_this_.setting.autoPlay) {
              window.clearInterval(_this_.timer);
            }
          }
        })
        .bind('webkitTransitionEnd', function() {
          _this_._transitionEnd();
          _this_.flag = true;
        });
      var touchMove = function(e) {
        var left = _this_._getLayerOffset(e).layerX - startLayerX;
        e.preventDefault();
        _this_._slideMove(left);
      };
      //定义方向
      this.dir = null;
      var touchEnd = function(e) {
        stopLayerX = _this_._getLayerOffset(e).layerX;
        stopTime = +new Date();
        _this_._slideEnd({
          startT: startTime,
          startX: startLayerX,
          stopT: stopTime,
          stopX: stopLayerX
        });
        //解除绑定
        doc.unbind('touchmove', touchMove);
        doc.unbind('touchend', touchEnd);
        if (_this_.setting.autoPlay) {
          _this_._autoPlay();
        }
        _this_.flag = true;
      };
      //创建按钮
      if (this.setting.isShowBtns != 'no') {
        this._createBtn();
      }

      //是否自动播放
      if (this.setting.autoPlay) {
        this._autoPlay();
      }
    }
  };
  TouchSlide.prototype = {
    _autoPlay: function() {
      var self = this;
      this.timer = window.setInterval(function() {
        if (self.loop == self.slideSize - 1) {
          self.slideItem.eq(0).css('left', self.setting.width);
        } else {
          self.slideItem.eq(self.loop + 1).css('left', self.setting.width);
        }
        self.slideItem.eq(self.loop + 1).css('left', self.setting.width);
        self._slideEnd({ startT: 0, startX: 1000, stopT: 300, stopX: 100 });
      }, this.setting.autoTime);
    },
    _slideEnd: function(args) {
      var startX = args.startX,
        stopX = args.stopX,
        startT = args.startT,
        stopT = args.stopT;
      if (startX == stopX) {
        return false;
      }
      //当左右滑动距离超过1/6的时候表示切换
      if (Math.abs(stopX - startX) > this.setting.width / 6) {
        if (stopX - startX < 0) {
          this.loop++;
          if (this.loop > this.slideSize - 1) {
            this.loop = 0;
          }

          this._setSlideTranslate('left');
        } else {
          this.loop--;
          if (this.loop < 0) {
            this.loop = this.slideSize - 1;
          }
          this._setSlideTranslate('right');
        }
      } else {
        this._setSlideTranslate('normal');
      }
    },
    _setSlideTranslate: function(dir) {
      var left =
        dir === 'left'
          ? -this.setting.width
          : dir === 'right'
          ? this.setting.width
          : 0;
      this.slideContent
        .css('-webkit-transition', 'all ' + this.setting.speed + 'ms ease')
        .css('-webkit-transform', 'translate(' + left + 'px,0)');
    },
    _slideMove: function(left) {
      var offsetSlide = null;
      //根据滑动的方向标记当前帧的前后显示元素
      if (left < 0) {
        if (this.loop == this.slideSize - 1) {
          offsetSlide = this.slideItem.first();
        } else {
          offsetSlide = this.slideItem.eq(this.loop + 1);
        }
        offsetSlide.css('left', this.setting.width);
      } else {
        if (this.loop == 0) {
          offsetSlide = this.slideItem.last();
        } else {
          offsetSlide = this.slideItem.eq(this.loop - 1);
        }
        offsetSlide.css('left', -this.setting.width);
      }

      this.slideContent.css('-webkit-transform', 'translate(' + left + 'px,0)');
    },
    //webkitTransitionEnd
    _transitionEnd: function() {
      this.slideContent
        .css('-webkit-transition', 'none')
        .css('-webkit-transform', 'translate(0,0)');
      this.slideItem
        .eq(this.loop)
        .css('left', 0)
        .addClass('current')
        .siblings()
        .removeClass('current');
      //设置标记
      //加载图片
      var currentImg = this.slideItem.eq(this.loop).find('img');
      if (currentImg.attr('data-loading') != 'true') {
        this._loadedImg(currentImg.attr('data-src'), function() {
          currentImg.attr('data-loading', 'true');
          currentImg.attr('src', currentImg.attr('data-src'));
        });
      }
      if (this.setting.isShowBtns != 'no') {
        this.controlDiv
          .find('span')
          .eq(this.loop)
          .addClass('selected')
          .siblings()
          .removeClass('selected');
      }
    },
    //获取鼠标相对于触发对象的偏移
    _getLayerOffset: function(e) {
      var e = e.changedTouches[0];
      return {
        layerX: e.pageX - this.slideWrap.offset().left,
        layerY: e.pageY - this.slideWrap.offset().top
      };
    },
    //图片加载完成
    _loadedImg: function(src, callback) {
      var img = new Image();
      img.onload = function() {
        callback();
      };
      img.src = src;
    },
    //创建索引按钮
    _createBtn: function() {
      var self = this;
      this.controlDiv = $("<div class='slide-control'>");

      this.slideItem.each(function(i, o) {
        if (i === 0) {
          self.controlDiv.append("<span class='selected'>");
        } else {
          self.controlDiv.append('<span>');
        }
      });
      self.controlDiv.css('margin-left', -(12 * this.slideSize) / 2);
      this.slideWrap.append(self.controlDiv);
    }
  };

  window.TouchSlide = TouchSlide;
})(Zepto);
