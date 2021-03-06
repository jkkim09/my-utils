/** 
 * ES5 JAVASCRIPT
 * 2019.11.28
 * target 의 position을 mouse, touch 이벤트에 따라 변경하는 util
 * communication: jakyoung.kim@catenoid.net
 */

(function (func) {
    /**
     *  window 의  mouseScrollJs 값으로 util 생성
     * 
     *  @return { Object }      init:  options set, 이벤트 등록
     *                          reSet: target position 초기화
    */
    window.mouseScrollJs = func;
})(function () {
    /**
     * 시스템 초기값 (config)
     * 
     * event_check :  이벤트를 중속 생성 및 first click(mousedown) 확인
     * first_moce :   first moce 이벤트시 초기값 확인 변수  
     * 
     * 이벤트 초기값 (options)
     * target_id : position 이벤트가 걸릴 target
     * 
     * target Element (target_element) : target html element
     */
    var config = {
        event_check: false,
        first_moce: false,
        mobile_check: false,
        class_css: '.mouse-scroll-target-css { transform: translateX(0px) translateY(0px) !important;}',
        regularX: /(translateX\()(-|)[\d]{1,9}px\)/g,
        regularY: /(translateY\()(-|)[\d]{1,9}px\)/g
    };
    var options = {};
    var target_element;

    /**
     * config getter
     * 
     * @param { String } key    config {object} 의 key 값
     * @returns {*}             config key 값이 의 value or config 
     */
    function getConfig (key) {
        var return_value;
        if (key) {
            return_value = config[key];
        } else {
            return_value = config;
        }
        return return_value;
    }

    /**
     * config setter
     * 
     * @param {*} value     config {object} 의 value 값
     * @param {*} key       config {object} 의 key 값
     */
    function setConfig(value, key) {
        if (key) {
            config[key] = value;
        } else {
            config = value;
        }
    } 


    /**
     * options getter
     * 
     * @param {*} key       options {object} 의 key 값
     * @returns {*}         options key 값이 의 value or options
     */
    function getOption (key) {
        var return_value;
        if (key) {
            return_value = options[key];
        } else {
            return_value = options;
        }
        return return_value;
    }

    /**
     * options setter
     * 
     * @param {*} value     options {object} 의 value 값
     * @param {*} key       options {object} 의 key 값
     */    
    function setOption(value, key) {
        if (key) {
            options[key] = value;
        } else {
            options = value;
        }
    } 
    
    /**
     * target_element getter
     * 
     * @returns {Element}   target Element
     */
    function getElement () {
        return target_element;
    }
    
    /**
     * target_element setter
     * 
     * @param {Element}     target 의 element 
     */
    function sertElement (value) {
        target_element = value;
    } 

    /**
     * options set, 이벤트 등록
     * 
     * @param {*} options       초기화 options 
     */
    function initFunction (options) {
        setOption(options);
        var targetEl = returnElementFunction(options.target_id);
        if (!targetEl) {
            console.error('scroll event target undefined element!');
            return;
        }
        // 중복 초기화(init) validation
        if (targetEl.getAttribute("data-scrollEventCheck")) {
            targetResit(targetEl);
            return;
        }
        sertElement(targetEl);
        setConfig(checkTouchDevice(), 'mobile_check');

        // data-x, data-y 초기화
        targetEl.setAttribute("data-x", 0);
        targetEl.setAttribute("data-y", 0);
        // 중복 초기화(init) validation 초기화
        targetEl.setAttribute("data-scrollEventCheck", true);
        // class or attibute 따라 position 변경 선택 초기화
        if (options.class_add) {
            classAddEvent(targetEl);
        }
        // attribute 초기화
        targetSetAttribute(targetEl, 0, 0);
        // mouse event 초기화
        mouseEventListener();
        //init success callback
        if (options.init_callback) {
            initCallback(options.init_callback);
        }

        if (options.watch) {
            watchEvent(options.watch);
        }
        
    }

    /**
     * 이벤트가 초기화 되었들때 callback
     * 
     * @param {Function} callback      event 초기화 후 callback
     */
    function initCallback (callback) {
        callback.call(this, {
            target: getElement(),
            options: getOption()
        });
    }

    /**
     * mouse 의 event 등록
     * 
     * onMouseDown          mouse 가 down 이벤트가 발생했을때 mouseup, mousemove 이벤트를 추가 등록
     * touchstart           mobile touch 이벤트가 발생했을때 touchmove, touchend 이벤트를 추가 등록
     * windowResize         window 가 size 변경 시 position 초기화 이벤트 등록
     */
    function mouseEventListener () {
        var target_el = getElement();
  
        if (!getConfig('mobile_check')) {
            // touch event 가 없는 device (window)
            target_el.addEventListener("mousedown", onMouseDown);
        } else {
            // touch event 가 있는 device (mobile)
            target_el.addEventListener("touchstart", onMouseDown);
        }
        window.addEventListener('resize', windowResize);
    }

    /**
     * indow 가 size 변경 시 position 초기화 이벤트 등록
     */
    function windowResize() {
        var target_el = getElement();
        targetSetAttribute(target_el, 0, 0);
    }

    /**
     * 마우스 down 이벤트 후 추가 이벤트 등록
     */
    function onMouseDown() {
        // 중복 이벤트 등록 check
        if (getConfig('event_check')) {return;}

        var target_el = getElement();
        
        // click 시 window size 확인
        windowVideoSizeSet(target_el);

        if(!getConfig('mobile_check')) {
            // mousemove, mouseup 이벤트 등록
            target_el.addEventListener("mousemove", onMouseMove);
            target_el.addEventListener("mouseup", onMouseUp);
        } else {
            // touchmove, touchend 이벤트 등록
            target_el.addEventListener("touchmove", onMouseMove);
            target_el.addEventListener("touchend", onMouseUp);
        }
    }

    /**
     * mouse up event 
     * 
     * 마우스 클릭이 끝난 후 이벤트
     * 
     * 등록 되어있는 이벤트를 remove 한다.
     */
    function onMouseUp () {
        var target_el = getElement();
        if(!getConfig('mobile_check')) {
            target_el.removeEventListener("mousemove", onMouseMove);
            target_el.removeEventListener("mouseup", onMouseUp);
        } else {
            target_el.removeEventListener("touchmove", onMouseMove);
            target_el.removeEventListener("touchend", onMouseUp);
        }
        // cheoch 옵션들 초기화
        setConfig(false, 'event_check');
        setConfig(false, 'first_moce');
    }

    /**
     * mouse move 발생하는 이벤트
     * 
     * @param {object} e       mouse, touch 이벤트 값 
     */
    function onMouseMove (e) {
        var screenX_value = !getConfig('mobile_check') ? e.screenX : e.touches[0].screenX;
        var screenY_value = !getConfig('mobile_check') ? e.screenY : e.touches[0].screenY;
        // first move 확인
        if (!getConfig('event_check')) {
            setConfig(true, 'event_check');
            setConfig({ x: screenX_value, y: screenY_value }, 'mouse_position');
        } else {
            var target_el = getElement();
            var move_position = {};
            var after_position = getConfig('mouse_position');
            // 처음 마우스클릭 position 과 이동한 position 의 차 : 이동 길이
            move_position.x = screenX_value - after_position.x;
            move_position.y = screenY_value - after_position.y;
            // 이동한 길이 만큰 setting
            moveEventFunction(target_el, move_position.x, move_position.y);
        }
    }

    /**
     * mouse 이벤트 발생시 position 값 변경 여부 확인
     * 
     * @param {Element} target        position 을 이동할 target Element
     * @param {Number} x              이동할 x position 값  
     * @param {Number} y              이동할 y position 값
     */
    function moveEventFunction (target, x, y) {
        // window, video 의 width, height
        var window_value = getConfig('window_value');
        var video_value = getConfig('video_value');

        
        // 클릭 후 처음 이동시 target 의 position 확인
        if (!getConfig('first_moce')) {
            setConfig(true, 'first_moce');
            var befor_position = {
                x: getPositionAttributeValue(target, 'data-x'),
                y: getPositionAttributeValue(target, 'data-y')
            };
            setConfig(befor_position, 'befor_position');
        }

        // target 의 전채 position 이동 좌표
        var get_befor_position = getConfig('befor_position');
        var move_vale_x = x + get_befor_position.x;
        var move_vale_y = y + get_befor_position.y;
        var position_end = window_value.width - video_value.width;
        var position_height_end = window_value.height - video_value.height;
        // move_vale_x 값 보정 (좌우 끝 position 확인)
        // target width < parent width
        if (move_vale_x > 0 || video_value.width < window_value.width) {
            // left end point
            move_vale_x = 0;
        } else if (move_vale_x < position_end) {
            // right end point
            move_vale_x = position_end;
        }
        // move_vale_y 값 보정 (상하 끝 position 확인)
        // target height < parent height
        if (move_vale_y > 0 || video_value.height < window_value.height) {
            // left end point
            move_vale_y = 0;
        } else if (move_vale_y < position_height_end) {
            // right end point
            move_vale_y = position_height_end;
        }
        
        targetSetAttribute(target, move_vale_x, move_vale_y);
    }

    /**
     * target 의 attribute 값 을 가져온다.
     * 
     * @param  {Element} target        target element
     * @param  {String} key            target 에서 가져올 attributr key 값
     * @return {Number}                key값의 Number 값
     */
    function getPositionAttributeValue (target, key) {
        var position_string = target.getAttribute(key);
        return parseInt(position_string, 10);
    } 

    /**
     * target 의 element return
     * @param {*} id        target ids
     */
    function returnElementFunction (id) {
        var id_type = typeof id;
        var return_element;
        switch (id_type.toLowerCase()) {
            case 'string' : 
                return_element = document.getElementById(id);
            break;
            case 'object' :
                for (var index in id) {
                    var el = document.getElementById(id[index]);
                    if (el) {
                        return_element = el;
                    }
                }
            break;
        }
        return return_element;
    }
    
    /**
     * Device 의 touch event 있는지 확인한다.
     * false : window, true : mobile
     */
    function checkTouchDevice () {
        return 'ontouchstart' in document.documentElement;
    }

    /**
     * 실제 화면 이동 함수 css transform 값을 변경하여
     * 
     * @param {Element} target        position 을 이동할 target Element
     * @param {Number} x              이동할 x position 값  
     * @param {Number} y              이동할 y position 값
     */
    function targetSetAttribute(target, x, y) {
        var add_css = getOption('add_css') ? getOption('add_css') : '';
        // class_add : true => style 을만들어서 적용
        // class_add : false => target attribute (style)  수정하여 변경
        if (getConfig('class_add')) {
            var regularX = getConfig('regularX');
            var regularY = getConfig('regularY');
            var class_css = getConfig('class_css').replace('}', add_css + '}');
            var style_el = getConfig('class_add_el');
            style_el.innerHTML = class_css.replace(regularX, 'translateX('+  x +'px)').replace(regularY, 'translateY('+  y +'px)');
        } else {
            target.setAttribute('style', 'transform: translateX('+ x +'px) translateX(' + y + 'px) !important;' + add_css);
        }
        target.setAttribute('data-x', x || 0);
        target.setAttribute('data-y', y || 0);
    }

    /**
     * window, target 의 width, height 값읋 config set 한다.
     * 
     * @param {Element} target        position 을 이동할 target Element
     */
    function windowVideoSizeSet (target) {
        var parent_width = 0;
        var parent_height = 0;

        /**
         * target 이 있을경우 부모 element 의 width, height 를 구하고 
         * target 이 없을경우 window 의 width, height 를 구하고 
         */
        if (target) {
            var parent_el = target.parentElement;
            parent_width = parent_el.innerWidth || parent_el.clientWidth || document.body.clientWidth;
            parent_height = parent_el.innerHeight || parent_el.clientHeight || document.body.clientHeight;
        } else {
            parent_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            parent_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        }

        setConfig({
            width: parent_width,
            height: parent_height
        }, 'window_value');

        setConfig({
            width: getElement().clientWidth,
            height: getElement().clientHeight
        }, 'video_value');
    }

    /**
     * target Element 의 css 값과 data-x, data-y attribute 값이 다를경우
     * data 값으로 보정한다.
     * 
     * @param {*} options   watch 옵션 
     */
    function watchEvent (options) {
        setInterval(function () {
            var regularX = getConfig('regularX');
            var target = getElement();
            var x_position = parseInt(target.getAttribute('data-x'));
            var y_position = parseInt(target.getAttribute('data-y'));
            var target_style = target.getAttribute('style');
            var regularX_value = regularX.exec(target_style);
            var style_value = 0;
            if (!regularX_value || regularX_value === null) {
                targetSetAttribute(target, x_position, y_position);
            } else {
                style_value = parseInt(regularX_value[0].replace('px', ''));
                if (style_value !== x_position) {
                    targetSetAttribute(target, x_position, y_position);
                }
            }
        }, options.time);
    }

    /**
     * class 추가하여 화면 position 변화
     * 
     * @param {Element} target        position을 변경할 target element
     */
    function classAddEvent (target) {
        var style_el = document.getElementById('mouse-scroll-target-css');

        // target 에 mouse-scroll-target-css class 가 없을때 추가
        if (target.getAttribute('class').indexOf('mouse-scroll-target-css') === -1) {
            target.setAttribute('class', target.getAttribute('class') + ' mouse-scroll-target-css');
        }
        // style 없을 때 추가
        if (!style_el) {
            // IE<9
            var head_el = document.getElementsByTagName('head')[0];
            // style tag head 추가
            style_el = document.createElement('style');
            style_el.setAttribute('id', 'mouse-scroll-target-css');
            style_el.innerHTML = getConfig('class_css');
            head_el.appendChild(style_el);
        }
        // config setting
        setConfig(true, 'class_add');
        setConfig(style_el, 'class_add_el');
    }

    /**
     * 
     * @param {*} targetEl      target element 
     * @param {*} targetId      target id
     */
    function targetResit (targetEl, targetId) {
        var target_id = targetId;
        var target_el = targetEl;
        if (!targetEl && target_id) {
            target_el = document.getElementById(target_id);
        }
        if (target_el.getAttribute('class').indexOf('mouse-scroll-target-css') === -1) {
            target_el.setAttribute('class', (target_el.getAttribute('class') + ' mouse-scroll-target-css').replace(/ {2,5}/g, ' '));
        }
    }
    
    return {
        init: initFunction,
        reSet: windowResize,
        targetResit: targetResit
    };
});