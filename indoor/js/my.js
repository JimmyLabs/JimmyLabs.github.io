/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-26
 * Time: 上午11:00
 * To change this template use File | Settings | File Templates.
 */
$(function () {
    if(!Detector.webgl)Detector.addGetWebGLMessage();

 console.constructor.prototype.log=function(message){};
    window.addEventListener('resize', WindowResize, false);
    function loadOSFun() {
        var osLeft = (window.innerWidth - 200) / 2;
        var osTop = (window.innerHeight - 20) / 2;
        var loadOS = $("#background,#overLoad,#showTime");
        loadOS.css("left", osLeft);
        loadOS.css("top", osTop);
    }

    loadOSFun();
    function WindowResize() {
        loadOSFun();
    }

    $("#editor").toggle(
        function () {
            mouseMark.visible = false;
            editorFlag = true;
        },
        function () {
            mouseMark.visible = true;
            editorFlag = false;
        }
    );
    $("#outdoor").click(
        function () {
            outdoorScene();
            indoor = false;
        }
    );
    $("#indoor").click(
        function () {
            indoorScene();
            indoor = true;
        }
    );

    $("#no3Devent").mousemove(function () {
        scene.remove(mouseMark);
        document.removeEventListener('mousedown', onDocumentMouseDown, false);
    });
    $("#no3Devent").mouseleave(function () {
        if (!editorFlag) {
            scene.add(mouseMark);
        }
        document.addEventListener('mousedown', onDocumentMouseDown, false);
    });

    $("#colorpanel").mousemove(function () {
        if (!editorFlag) {
            document.removeEventListener('mousedown', onDocumentMouseDown, false);
        }

    });
    $("#colorpanel").mouseleave(function () {
        if (!editorFlag) {
            document.addEventListener('mousedown', onDocumentMouseDown, false);
        }

    });

    document.addEventListener('mousedown', onMouseDown, false);
    var eleFull = document.querySelector(".full");
    var body = document.querySelector("body");

    function onMouseDown(event) {
        var operate = document.getElementById("operate");
        if (event.button == 2) {
            if (!alt && !ctrl && !selectionBox.visible) {
                operate.style.display = "block";
                var x = event.clientX - 35;
                var y = event.clientY - 15;
                operate.style.top = '' + y + 'px';
                operate.style.left = '' + x + 'px';
            }

        } else if (event.button == 0) {
            if (event.target == $(".full")[0]) {
                //全屏开始
                (function () {
                    var runPrefixMethod = function (element, method) {
                        var usablePrefixMethod;
                        ["webkit", "moz", "ms", "o", ""].forEach(function (prefix) {
                            if (usablePrefixMethod) return;
                            if (prefix == "") {
                                // 无前缀，方法首字母小写
                                method = method.slice(0, 1).toLowerCase() + method.slice(1);

                            }

                            var typePrefixMethod = typeof element[prefix + method];
                            if (typePrefixMethod + "" !== "undefined") {
                                if (typePrefixMethod === "function") {
                                    usablePrefixMethod = element[prefix + method]();
                                } else {
                                    usablePrefixMethod = element[prefix + method];
                                }
                            }
                        });

                        return usablePrefixMethod;
                    };

                    if (typeof window.screenX == "number") {
                        eleFull.addEventListener("click", function () {

                            runPrefixMethod(body, "RequestFullScreen");
                            operate.style.display = "none";

                        });
                    } else {
                        alert("浏览器不支持html5");
                    }
                })();
                //全屏结束
            } else {
                operate.style.display = "none";
            }

        }
    }

    //换颜色开始
    $("#color").toggle(function () {
            $("#colorpanel").css('display', 'block')
        },
        function () {
            $("#colorpanel").css('display', 'none')
        });
    var colorparogramers = {color:0X555555};
    var colorcontrol = new dat.GUI({autoPlace:false});
    var colorpaneldiv = document.getElementById("colorpanel");
    colorpaneldiv.appendChild(colorcontrol.domElement);
    changeMaterialcolor = function (v) {
        if (mark && selectionBox.visible) {
            mark.material.color = new THREE.Color(colorparogramers.color);

        }
        //mesh.material.color=new THREE.Color(colorparogramers.color)
    };
    colorcontrol.addColor(colorparogramers, "color").onChange(changeMaterialcolor);
//换颜色结束
    //加载显示样式
    document.getElementById('overLoad').style.width = 0 + "px";
    document.getElementById('showTime').innerHTML = "已加载0%";
});