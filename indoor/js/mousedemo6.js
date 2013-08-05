/**
 * 辅助加多选择移动及旋转的整合
 */

if (typeof LOAD == "undefined") {
    var LOAD = {};
}
var SIGNALS = signals;
/*首先创建各种事件，然后绑定处理函数*/
var signals = {
    sceneCreated:new SIGNALS.Signal(),
    sceneChanged:new SIGNALS.Signal(),
    objectAdded:new SIGNALS.Signal(),
    objectSelected:new SIGNALS.Signal(),
    objectChanged:new SIGNALS.Signal(),
    materialChanged:new SIGNALS.Signal(),
    windowResize:new SIGNALS.Signal(),
    cameraMove:new SIGNALS.Signal(),
    triggerLayer:new SIGNALS.Signal()
};


/**
 * objectsLen指objects数组的长度，
 * objectsIndex对应markObjects数组的下标
 * 所有的模型都会放在readyObjects中
 */
var editorFlag, indoor = false, sky = null, moveGroup, speed = 50, loadNum = 0;
var objects = [], markObjects = [], readyObjects = [], mouseMark, cloneMark, cloneObjects = [];
var camera, cameraCube, scene, sceneCube, projector, group, oldCameraPosition, oldCameraRotation, indoorCRY;
var loader, mesh, mark, selectionBox , objectsIndex = 0, objectsLen = 0;
var SELECTED = null, markIndex, stillHere, ismousedown, mouseMoveDistance = 0, mousedownEx = 0, mousedownEy = 0;
var clickA, clickS, clickW, clickD, alt, shift, ctrl, clickC, clickDelete;
var outdoorCameraX = 36, outdoorCameraY = 1544, outdoorCameraZ = 3000, outdoorCameraRX = -0.6;
LOAD.GeoItem = function (geoItemDiv, url) {

    loader = new THREE.JSONLoader();
    jQuery.ajax({

        type:"get",
        url:url,
        async:true,
        success:function (data) {
            sendMsg(eval("(" + data + ")"));
        }
    });

    var rotationLeft, rotationRight;
    projector = new THREE.Projector();
    group = new THREE.Object3D();
    var mouse = new THREE.Vector2();
    var container = document.getElementById(geoItemDiv);
    var speedDom = document.getElementById("speed");
    var speedBg = document.getElementById("speedBg");
    scene = new THREE.Scene();
    sceneCube = new THREE.Scene();
    var sceneHelpers = new THREE.Scene();
    oldCameraPosition = new THREE.Vector3();
    oldCameraPosition.set(678, 120, 170);//初始值
    oldCameraRotation = new THREE.Vector3();
    oldCameraRotation.set(0, 1.62, 0);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    // camera.position.set(678, 120, 153);
    cameraCube = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    //先是在室外,设置indoor
    outdoorScene();
    var controls = new THREE.OrbitControls(camera);

    controls.addEventListener('change', render);
    //camera.lookAt(scene.position);
    var loadTime = 0, loadPercent = 0;
    //重写后添加一个参数m,代表model
    THREE.JSONLoader.prototype.load = function (a, b, c, m) {
        c = c && "string" === typeof c ? c : this.extractUrlBase(a);
        this.onLoadStart();
        //对应位置传递m值
        this.loadAjaxJSON(this, a, b, c, "", m);
    };
    THREE.JSONLoader.prototype.loadAjaxJSON = function (a, b, c, d, e, m) {
        var f = new XMLHttpRequest, g = 0;
        f.withCredentials = this.withCredentials;
        f.onreadystatechange = function () {
            if (f.readyState === f.DONE)if (200 === f.status || 0 === f.status) {
                if (f.responseText) {
                    var h = JSON.parse(f.responseText);
                    a.createModel(h, c, d);
                    //加载完成加1
                    loadNum++;
                } else console.warn("THREE.JSONLoader: [" + b + "] seems to be unreachable or file there is empty");
                a.onLoadComplete();
            } else {
//加载失败的处理
                loader.load(b, function (geometry, materials) {
                    creatModel(m, geometry, materials);
                });
            }
            else
                f.readyState === f.LOADING ? e && (0 === g && (g = f.getResponseHeader("Content-Length")), e({total:g, loaded:f.responseText.length})) : f.readyState === f.HEADERS_RECEIVED && (g = f.getResponseHeader("Content-Length"))
        };
        f.open("GET", b, !0);
        f.send(null);
    };
    function creatModel(model, geometry, materials) {
        if (model.id == "mark") {
            mouseMark = new THREE.Mesh(
                geometry,
                materials[0]
            );
            mouseMark.castShadow = true;
            mouseMark.scale.x = mouseMark.scale.y = mouseMark.scale.z = 0.2;

            cloneObjects.push(mouseMark);
            scene.add(mouseMark);
           // console.log("markid:" + model.id);
        } else if (model.edit && !model.transparent) {
            //可编辑的不的透明对象
            mark = new THREE.Mesh(
                geometry,
                materials[0]
            );
            mark.receiveShadow = true;
            mark.scale.x = mark.scale.y = mark.scale.z = 100;
            mark.position.x = model.X * 100;
            mark.position.z = -model.Y * 100;

            if (model.id == "guizi") {

                for (var i = 0; i < 3; i++) {
                    mark.index = objectsIndex;
                    var mark1 = mark.clone();
                    mark1.position.z = mark.position.z - 90 * i;
                    mark1.index = objectsIndex;
                    markObjects.push(mark1);
                    readyObjects.push(mark1);
                    scene.add(mark1);
                    objectsIndex++;
                }
                mark.rotation.y = Math.PI / 2;
                mark.position.z = 640;
                mark.position.x = -60;
                scene.add(mark);
                for (var i = 0; i < 7; i++) {
                    mark.index = objectsIndex;
                    var mark1 = mark.clone();
                    mark1.position.x = mark.position.x + 90 * i;
                    mark1.index = objectsIndex;
                    markObjects.push(mark1);
                    readyObjects.push(mark1);
                    scene.add(mark1);
                    objectsIndex++;
                }
            }

            scene.add(mark);
            mark.index = objectsIndex;//必须
            markObjects.push(mark);//必须
            readyObjects.push(mark);//必须
            objectsIndex++;
            //console.log("可编辑的不的透明对象id:" + model.id);
        } else if (model.edit && model.transparent) {
            //可编辑的的透明对象
            mark = new THREE.Mesh(
                geometry,
                materials[0]
            );
            mark.material.transparent = true;
            mark.receiveShadow = true;
            mark.scale.x = mark.scale.y = mark.scale.z = 100;

            mesh.material.opacity = model.opacity;
            scene.add(mark);
            mark.index = objectsIndex;
            markObjects.push(mark);
            readyObjects.push(mark);
            objectsIndex++;
            //console.log("可编辑的透明对象id:" + model.id);
        } else if (!model.edit && model.transparent) {
            //不可移动的透明对象
            mesh = new THREE.Mesh(
                geometry,
                materials[0]
            );

            mesh.material.ambient = new THREE.Color(0x5ebed3);
            console.log(mesh);
            mesh.receiveShadow = true;
            mesh.scale.x = mesh.scale.y = mesh.scale.z = 100;
            mesh.material.transparent = true;
            mesh.material.opacity = model.opacity;
            scene.add(mesh);
            objects.push(mesh);
            readyObjects.push(mesh);
            objectsLen++;
           // console.log("不可移动的透明对象id:" + model.id);
        } else if (!model.edit && !model.transparent) {
            //不可移动的不透明对象
            mesh = new THREE.Mesh(
                geometry,
                materials[0]
            );
            mesh.position.x = model.X * 100;
            mesh.position.z = -model.Y * 100;
            mesh.receiveShadow = true;
            mesh.scale.x = mesh.scale.y = mesh.scale.z = 100;

            scene.add(mesh);
            objects.push(mesh);//必须
            readyObjects.push(mesh);//必须
            objectsLen++;//必须
           // console.log("不可移动的不透明对象id:" + model.id);
            if (model.id == "bangongyongpin" || model.id == "bangongzhuo") {
                var bangongGroup = new THREE.Object3D();
                for (var i = 0; i < 4; i++) {
                    var mark1 = mesh.clone();
                    if (i % 2 == 0) {
                        mark1.rotation.y = Math.PI * Math.floor(i / 2);
                        bangongGroup.add(mark1);
                    } else {
                        var m = Math.floor(i / 2);
                        console.log("m=="+m);
                        mark1.rotation.y = Math.PI * Math.floor(i / 2);
                        mark1.position.x = mesh.position.x - Math.pow(-1, m) * 285;
                        bangongGroup.add(mark1);
                    }
                    objects.push(mark1);//必须
                    readyObjects.push(mark1);//必须
                    objectsLen++;//必须
                }
                scene.add(bangongGroup);
//得到最左边的4个办公桌
                var mark1 = bangongGroup.clone();
                mark1.position.z += 350;
                mark1.position.x += 1000;
                scene.add(mark1);
                objects.push(mark1);//必须
                readyObjects.push(mark1);//必须
                objectsLen++;//必须
                for (var i = 0; i < 2; i++) {
                    var mark1 = mark1.clone();
                    mark1.position.z -= 360;
                    scene.add(mark1);
                    objects.push(mark1);//必须
                    readyObjects.push(mark1);//必须
                    objectsLen++;//必须
                }
            }

        }
    }

    function sendMsg(modelInfo) {
        //模型数量
        var modelLength = modelInfo.geoItems.length;
        for (var i = 0; i < modelLength; i++) {
            var model = modelInfo.geoItems[i];
            loader.load(modelInfo.geoItems[i].path, (function (model) {
                return  function (geometry, materials) {
                    var oTime = setInterval(function () {
                        loadTime++;
                        loadPercent = Math.floor(100 / (modelLength + 2) * loadNum);
                        document.getElementById('overLoad').style.width = 200 / (modelLength + 2) * loadNum + "px";
                        document.getElementById('showTime').innerHTML = "已加载" + loadPercent + "%";
                        //后面的+2为light和skybox
                        if (loadNum == modelLength + 2) {
                            document.getElementById('overLoad').style.width = "200px";
                            console.log("loadNum:" + loadNum);
                            console.log("加载时间:" + loadTime + "毫秒！");
                            window.clearInterval(oTime);
                            if (loadPercent == 100) {
                                $("#loadMask").fadeOut("slow");
                            }
                        }
                    }, 1);
                    creatModel(model, geometry, materials);
                    console.log("id:" + model.id);
                }
            })(model), "", model);
        }
    }

//测试代码
    mark = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshBasicMaterial({color:0x000000}));
    mark.index = objectsIndex;
    markObjects.push(mark);
    readyObjects.push(mark);
    scene.add(mark);
    objectsIndex++;

    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    window.addEventListener('resize', onWindowResize, false);
    function onDocumentKeyDown(event) {
        switch (event.keyCode) {
            case 16://Shift
                shift = true;
                break;
            case 17://Ctrl
                ctrl = true;
                break;
            case 18://alt
                alt = true;
                break;
            case 37://left
                rotationLeft = true;
                break;
            case 38://up
                clickW = true;
                break;
            case 39://right
                rotationRight = true;
                break;
            case 40://down
                clickS = true;
                break;
            case 46:
                clickDelete = true;
                signals.objectSelected.dispatch(null);//删除时去掉选择框
                mark.visible = false;//设visible为false
                scene.remove(mark);//从场景中移除物体
                readyObjects.splice(mark.index, 1);
                break;
            case 65://A
                clickA = true;
                break;
            case 67://C
                clickC = true;
                break;
            case 68://D
                clickD = true;
                break;
            case 83://S
                clickS = true;
                break;
            case 87://W
                clickW = true;
                break;
        }
    }

    function onDocumentKeyUp(event) {
        switch (event.keyCode) {
            case 16://Shift
                shift = false;
                break;
            case 17://Ctrl
                ctrl = false;
                break;
            case 18://alt
                alt = false;
                break;
            case 37://left
                rotationLeft = false;
                break;
            case 38://up
                clickW = false;
                break;
            case 39://right
                rotationRight = false;
                break;
            case 40://down
                clickS = false;
                break;
            case 46:
                clickDelete = false;
                break;
            case 65://A
                clickA = false;
                break;
            case 67://C
                clickC = false;
                break;
            case 68://D
                clickD = false;
                break;
            case 83://S
                clickS = false;
                break;
            case 87://W
                clickW = false;
                break;
            case 107:
            case 187://+
                if (speed < 100) {
                    speed += 10;
                }
                speedDomDispare(2000);
                break;
            case 109:
            case 189://-
                if (speed > 10) {
                    speed -= 10;
                }
                speedDomDispare(2000);
                break;
        }
    }

    var detectionCameraFlag = true;
    var currentCameraXZ;
    //div隐藏时机
    function speedDomDispare(time) {
        speedDom.innerHTML = "速度:" + speed;
        speedDom.style.display = "block";
        speedBg.style.display = "block";
        currentCameraXZ = camera.position.x * camera.position.z;

        if (detectionCameraFlag) {
            setInterval(function () {
                var nowCameraXZ = camera.position.x * camera.position.z;
                if (currentCameraXZ != nowCameraXZ) {
                    speedDom.style.display = "none";
                    speedBg.style.display = "none";
                }
                console.log(currentCameraXZ + "==" + nowCameraXZ);
            }, time);
            detectionCameraFlag = false;
        }

    }

    var normalX, normalY, normalZ;

    function mouseMove2Dto3D(objects, mark) {
        var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
        projector.unprojectVector(vector, camera);

        var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
        var intersects = ray.intersectObjects(objects, true);

        var particle = new THREE.Particle(null);
        if (intersects.length > 0) {
            particle.position = intersects[0].point;

            //把objects里的当前对象当作坐标系
            mark.position = particle.position;
            //console.log(intersects[0].face.normal.x + "  " + intersects[0].face.normal.y + "  " + intersects[0].face.normal.z);
            //得到法线
            normalX = intersects[0].face.normal.x;
            normalY = intersects[0].face.normal.y;
            normalZ = intersects[0].face.normal.z;
            mark.rotation.set(0, 0, 0);//重置再旋转
            if (normalX == 1) {
                //右面
                mark.rotation.z = -Math.PI / 2;
            } else if (normalX == -1) {
                //左面
                mark.rotation.z = Math.PI / 2;
            }
            if (normalY == 1) {
                //水平面朝上
                mark.rotation.set(0, 0, 0);
            } else if (normalY == -1) {
                //水平面朝下
                mark.rotation.x = Math.PI;
            }
            if (normalZ == 1) {
                //后面
                mark.rotation.x = Math.PI / 2;
            } else if (normalZ == -1) {
                //前面
                mark.rotation.x = -Math.PI / 2;
            }
        }
    }

    function onDocumentMouseMove(event) {
        event.preventDefault();

        if (editorFlag && indoor) {
            //移动
            if (alt) {
                if (SELECTED) {
                    //旋转
                    if (event.button == 2) {
                        mark.rotation.y += 0.1;
                    } else {
                        mark.rotation.y -= 0.1;
                    }
//移动group
                }
            } else {
                if (SELECTED) {
                    mouseMove2Dto3D(objects, mark);
                }
            }


            // container.style.cursor = 'pointer';
        } else {
            mouseMove2Dto3D(readyObjects, mouseMark);
        }
    }

    function onDocumentMouseUp(event) {
        SELECTED = null;
        //markObjects添加选择的对像，还原数组
        markObjects[markIndex] = stillHere;
        //将objects数组添加的markObjects对像换掉
        for (var i = 0; i < markObjects.length; i++) {
            if (i != markIndex) {
                objects[objectsLen + i] = stillHere;
            } else {
                objects[objectsLen + i] = mesh;
            }
        }


        var ex = event.clientX;
        var ey = event.clientY;
        mouseMoveDistance = Math.abs((ex - mousedownEx)) * Math.abs((ey - mousedownEy));

        if (event.button == 2 || mouseMoveDistance > 10 || (event.target == $(".full")[0])) {
            freeObjects();
            ismousedown = false;
            return;
        } else {
            mouseDown2Dto3D(cloneObjects);
            if (downIntersects.length > 0) {
                if (!editorFlag) {
                    var RY;
                    //在Indoor之前执行，之后不再执行 camera.lookAt(camera.position);
                    if (indoor) {
                        //camera自动旋转跟踪点击方向
                        //得到屏幕1/2宽，得到屏幕高
                        var harfWindowWidth = window.innerWidth / 2;
                        var windowHeight = window.innerHeight;
                        //得到鼠标点击的x轴位置
                        var mouseX = event.clientX;
                        //得到斜边长
                        var bevel = Math.sqrt(Math.pow(Math.abs(harfWindowWidth - mouseX), 2) + Math.pow(windowHeight, 2));
                        //camera旋转角度
                        var radian = Math.acos(windowHeight / bevel);
                        console.log("windowHeight:" + windowHeight + "bevel:" + bevel + "radian:" + radian);
                        var runMoveTime = moveTime * radian;
                        if (mouseX < harfWindowWidth) {
                            //camera左转
                            RY = camera.rotation.y + radian;
                            new TWEEN.Tween({y:camera.rotation.y}).to({y:RY}, runMoveTime).onUpdate(function () {
                                camera.rotation.y = this.y;
                            }).start();

                        } else {
                            //camaera右转
                            RY = camera.rotation.y - radian;
                            new TWEEN.Tween({y:camera.rotation.y}).to({y:RY}, runMoveTime).onUpdate(function () {
                                camera.rotation.y = this.y;
                            }).start();

                        }
                        setTimeout(function () {
                            new TWEEN.Tween({x:camera.position.x, y:camera.position.y, z:camera.position.z}).to({x:downIntersects[ 0 ].object.position.x, y:120, z:downIntersects[ 0 ].object.position.z}, moveTime).onUpdate(function () {
                                camera.position.x = this.x;
                                camera.position.y = this.y;
                                camera.position.z = this.z;
                            }).start();
                        }, runMoveTime);
                    } else {
                        new TWEEN.Tween({x:camera.position.x, y:camera.position.y, z:camera.position.z}).to({x:downIntersects[ 0 ].object.position.x, y:120, z:downIntersects[ 0 ].object.position.z}, moveTime).onUpdate(function () {
                            camera.position.x = this.x;
                            camera.position.y = this.y;
                            camera.position.z = this.z;
                        }).start();
                        setTimeout(function () {
                            camera.lookAt(camera.position);
                            new TWEEN.Tween({y:camera.rotation.y}).to({y:indoorCRY}, 0).onUpdate(function () {
                                camera.rotation.y = this.y;
                            }).start();
                        }, moveTime);
                    }
                }

                indoor = true;
                setTimeout(function () {
                    changeSkybox("skybox", true);
                }, moveTime);

            }

            setTimeout(function () {
                //不删除mark,仅删除cloneMark
                for (var i = 1; i < cloneObjects.length; i++) {
                    scene.remove(cloneObjects[i]);
                }

            }, moveTime);
        }

        //  container.style.cursor = 'default';
    }

    function onWindowResize() {

        camera.left = window.innerWidth / -2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = window.innerHeight / -2;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

    }

//light氛围灯光加载

    var light = new THREE.DirectionalLight(0xffffff, 0.2);
    light.position.set(1, 1, 0).normalize();

    var light1 = new THREE.DirectionalLight(0xffffff, 0.2);
    light1.position.set(-1, -1, 0).normalize();

    var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
    light2.position.set(1, 0, 1).normalize();
    var light3 = new THREE.DirectionalLight(0xffffff, 0.2);
    light3.position.set(-1, 0, -1).normalize();

    var ambientLight1 = new THREE.AmbientLight(0xeeeeee);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.color.setHSV(1, 0.2, 0.25);
    light.castShadow = true;
    light1.castShadow = true;
    light2.castShadow = true;
    light3.castShadow = true;
    ambientLight1.castShadow = true;
    ambientLight.castShadow = true;
    scene.add(light);
    scene.add(light1);
    scene.add(light2);
    scene.add(light3);
    scene.add(ambientLight1);
    scene.add(ambientLight);
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    hemiLight.intensity = 0.2;
    hemiLight.position.set(0, 300, 0);
    hemiLight.castShadow = true;
    scene.add(hemiLight);
    loadNum++;

    var renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.autoClear = false;
    renderer.autoUpdateScene = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    animate();

    function animate() {
        TWEEN.update();
        requestAnimationFrame(animate);
        // console.log("indoor:" + indoor);
        if (!indoor) {
            controls.update();
        }

        render();

    }


    function render() {
        if (clickW) {
            camera.translateZ(-speed / 10);
        }
        if (clickA) {
            camera.translateX(-speed / 10);
        }
        if (clickS) {
            camera.translateZ(speed / 10);
        }
        if (clickD) {
            camera.translateX(speed / 10);
        }
        if (rotationLeft) {
            camera.rotation.y += 0.02;
        }
        if (rotationRight) {
            camera.rotation.y -= 0.02;
        }
        //室内camera的rotationY
        indoorCRY = camera.rotation.z;
        // console.log("indoorCRY:" + indoorCRY + "camera.rotation.y:" + camera.rotation.y + "camera.rotation.z:" + camera.rotation.z);
        if (indoor) {
            oldCameraRotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);
            oldCameraPosition.set(camera.position.x, camera.position.y, camera.position.z);
        } else {
            changeSkybox("skybox", false);
        }

        cameraCube.rotation.copy(camera.rotation);
        scene.updateMatrixWorld();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(sceneCube, cameraCube);
        renderer.render(scene, camera);

        renderer.render(sceneHelpers, camera);
        /*  console.log("cameraX:" + camera.position.x + " " + "cameraY:" + camera.position.y + " " + "cameraZ:" + camera.position.z + " " +
         "" + "cameraRX:" + camera.rotation.x, +"" + "cameraRY:" + camera.rotation.y + " " + "cameraRZ:" + camera.rotation.z);*/
    }

    // 创建选择模型时的方框
    selectionBox = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color:0xffff00, wireframe:true }));
    selectionBox.geometry.dynamic = true;
    selectionBox.matrixAutoUpdate = false;
    selectionBox.visible = false;
    sceneHelpers.add(selectionBox);

    // 模型添加的事件绑定
    signals.objectAdded.add(function (object) {

        /*        THREE.SceneUtils.traverseHierarchy(object, function (child) {

         objects.push(child);

         });*/
        objects.push(object);

        scene.add(object);
        render();

        signals.sceneChanged.dispatch(scene);

    });

    // 模型属性改变的事件绑定
    signals.objectChanged.add(function (object) {

        render();

    });

    signals.objectSelected.add(function (object) {

        selectionBox.visible = false;

        if (object !== null && object.geometry) {

            var geometry = object.geometry;

            if (geometry.boundingBox === null) {

                geometry.computeBoundingBox();

            }

            selectionBox.geometry.vertices[ 0 ].x = geometry.boundingBox.max.x;
            selectionBox.geometry.vertices[ 0 ].y = geometry.boundingBox.max.y;
            selectionBox.geometry.vertices[ 0 ].z = geometry.boundingBox.max.z;

            selectionBox.geometry.vertices[ 1 ].x = geometry.boundingBox.max.x;
            selectionBox.geometry.vertices[ 1 ].y = geometry.boundingBox.max.y;
            selectionBox.geometry.vertices[ 1 ].z = geometry.boundingBox.min.z;

            selectionBox.geometry.vertices[ 2 ].x = geometry.boundingBox.max.x;
            selectionBox.geometry.vertices[ 2 ].y = geometry.boundingBox.min.y;
            selectionBox.geometry.vertices[ 2 ].z = geometry.boundingBox.max.z;

            selectionBox.geometry.vertices[ 3 ].x = geometry.boundingBox.max.x;
            selectionBox.geometry.vertices[ 3 ].y = geometry.boundingBox.min.y;
            selectionBox.geometry.vertices[ 3 ].z = geometry.boundingBox.min.z;

            selectionBox.geometry.vertices[ 4 ].x = geometry.boundingBox.min.x;
            selectionBox.geometry.vertices[ 4 ].y = geometry.boundingBox.max.y;
            selectionBox.geometry.vertices[ 4 ].z = geometry.boundingBox.min.z;

            selectionBox.geometry.vertices[ 5 ].x = geometry.boundingBox.min.x;
            selectionBox.geometry.vertices[ 5 ].y = geometry.boundingBox.max.y;
            selectionBox.geometry.vertices[ 5 ].z = geometry.boundingBox.max.z;

            selectionBox.geometry.vertices[ 6 ].x = geometry.boundingBox.min.x;
            selectionBox.geometry.vertices[ 6 ].y = geometry.boundingBox.min.y;
            selectionBox.geometry.vertices[ 6 ].z = geometry.boundingBox.min.z;

            selectionBox.geometry.vertices[ 7 ].x = geometry.boundingBox.min.x;
            selectionBox.geometry.vertices[ 7 ].y = geometry.boundingBox.min.y;
            selectionBox.geometry.vertices[ 7 ].z = geometry.boundingBox.max.z;

            selectionBox.geometry.computeBoundingSphere();

            selectionBox.geometry.verticesNeedUpdate = true;

            selectionBox.matrixWorld = object.matrixWorld;

            selectionBox.visible = true;

        }
        render();

    });

    signals.materialChanged.add(function (material) {

        render();

    });

    signals.windowResize.add(function () {
        //        controls.handleResize();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth - 380, window.innerHeight - 175);
        render();
    });
};

function changeSkybox(skyUrl, flag) {

    if (sky != null) {
        if (flag) {
            sky.visible = true;

        } else {
            sky.visible = false;
        }
        return false;
    }

    var r = skyUrl + "/";
    var urls = [ r + "px.jpg", r + "nx.jpg",
        r + "py.jpg", r + "ny.jpg",
        r + "pz.jpg", r + "nz.jpg" ];

    var textureCube = THREE.ImageUtils.loadTextureCube(urls);
    textureCube.format = THREE.RGBFormat;

    var shader = THREE.ShaderUtils.lib[ "cube" ];
    shader.uniforms[ "tCube" ].value = textureCube;

    var material = new THREE.ShaderMaterial({

        fragmentShader:shader.fragmentShader,
        vertexShader:shader.vertexShader,
        uniforms:shader.uniforms,
        depthWrite:false,
        side:THREE.BackSide

    });
    sky = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), material);
    sceneCube.add(sky);
    loadNum++;
}

function freeObjects() {
    if (ctrl) {
        //当前点击的对象
        mark.material.wireframe = false;
        //先将mark还原到scene,再从group中删除mark
        scene.add(mark);
        group.remove(mark);

        console.log("group length:" + group.children.length);
    }
    //去掉选择框
    signals.objectSelected.dispatch(null);
}

var downIntersects, moveTime = 2000;

function mouseDown2Dto3D(objects) {
    var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
    projector.unprojectVector(vector, camera);

    var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
    downIntersects = ray.intersectObjects(objects, true);
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    ismousedown = true;
    mousedownEx = event.clientX;
    mousedownEy = event.clientY;
    if (editorFlag) {
        mouseDown2Dto3D(markObjects);
        //代表选中该物体
        SELECTED = mark = stillHere = downIntersects[ 0 ].object;

//markObjects移除选择的对像
        console.log("mark.index:" + mark.index);
        markIndex = mark.index;
        delete markObjects[mark.index];
        console.log(stillHere);
        // console.log(objects);
        //objects添加除了当前选中外的所有markObjects里的对象
        console.log("objectsLen" + objectsLen);
        for (var i = 0; i < markObjects.length; i++) {
            if (i != markIndex) {
                objects[objectsLen + i] = markObjects[i];
            } else {
                objects[objectsLen + i] = mesh;

            }
        }
        if (downIntersects.length) {

            if (ctrl) {
                moveGroup = true;
                group.add(mark);
                //多选样式
                mark.material.wireframe = true;
                scene.add(group);//没有这行代码会将选中的隐藏，即添加到了group中

            } else {
                moveGroup = false;
                //单选样式
                if (mark.visible) {
                    signals.objectSelected.dispatch(downIntersects[ 0 ].object);
                }

            }

        } else {
            signals.objectSelected.dispatch(null);

        }
        //  container.style.cursor = 'pointer';
    } else {
        //先移出再克隆一个标志，保证只有一个标志
        scene.remove(cloneMark);
        cloneMark = mouseMark.clone();
        cloneMark.position.y = 0;
        cloneMark.rotation.set(0, 0, 0);
        cloneObjects.push(cloneMark);
        scene.add(cloneMark);


    }
}

var num = 0;

function outdoorScene() {
    changeSkybox("skybox", false);

    camera.position.set(outdoorCameraX, outdoorCameraY, outdoorCameraZ);
}

function indoorScene() {
    changeSkybox("skybox", true);
    camera.position.set(oldCameraPosition.x, oldCameraPosition.y, oldCameraPosition.z);
    camera.rotation.set(0, oldCameraRotation.y, oldCameraRotation.z);
}