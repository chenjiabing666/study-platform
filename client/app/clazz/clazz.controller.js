(function(){
    // 'clazz strick'

    angular.module('app.clazz')
           .controller('ClazzCtrl', ['$scope','$http','$mdDialog','$location','$timeout',ClazzCtrl])
           .controller('AddClazzCtrl', ['$scope','$http','$location','$mdDialog','$timeout',AddClazzCtrl])
           .controller('ChangeClazzCtrl', ['$scope', '$http','$location','$mdDialog','$timeout',ChangeClazzCtrl])
           .filter('textLengthSet', function() {
                return function(value, wordwise, max, tail) {
                    if (!value) return '';

                    max = parseInt(max, 10);

                    if (!max) return value;

                    if (value.length <= max) return value;

                    value = value.substr(0, max);

                    if (wordwise) {
                        var lastspace = value.lastIndexOf('');

                        if (lastspace != -1) {
                            value = value.substr(0, lastspace);
                        }
                    }

                    return value + (tail || '...');//‘...‘可以换成其它文字
                }
            })


  function ClazzCtrl($scope,$http,$mdDialog,$location,$timeout){
    $scope.login = function(){
        if(sessionStorage.adminId == undefined){
            $location.path('/page/signin')
        }
    }
    $timeout($scope.login(),10)


    var init;

    $scope.stores = [];
    $scope.searchKeywords = '';
    $scope.filteredStores = [];
    $scope.row = '';
    $scope.select = select;
    $scope.onFilterChange = onFilterChange;
    $scope.onNumPerPageChange = onNumPerPageChange;
    $scope.search = search;
    $scope.numPerPageOpt = [3, 5, 10, 20];
    $scope.numPerPage = $scope.numPerPageOpt[2];
    $scope.currentPage = 1;
    $scope.currentPage = [];
    $scope.clazzList = [];
    $scope.allClazzList = [];

    $scope.isShow = 0;
    var authoritySet = sessionStorage.authoritySet.split(',');
    for (var i = 0; i < authoritySet.length; i++) {
        if (authoritySet[i] == "10") {
            $scope.isShow = 1;
        }
    }

    $scope.teacherId = $location.search().id;
    if($scope.teacherId !=undefined){
        $scope.pageType = 1;
        console.log($scope.pageType)
    }
    $scope.backClick = function(){
        $location.path("teacher/teacher-list");
    }
    console.log($scope.teacherId);
    function getClazzList(pageNum, pageSize){
         $http.post('http://localhost:8080/aiyixue-server/' + 'clazz/getClazzList.do',{},{params:{
            teacherId:$scope.teacherId,
            clazzName:$scope.kwClazzName,
            pageNum:pageNum,
            pageSize:pageSize
        }}).success(function (data) {
         if (data.errorCode == 0) {
           $scope.clazzList=data.result;
           $scope.stores=data.result;
           $scope.currentPageStores = data.result;
           $scope.filteredStores = data.result;

           // $scope.currentPageStores.$apply;
           $scope.total = data.total;
           console.log($scope.stores);
           };
        });
    }


    function select(page) {
        var end, start;
        start = (page - 1) * $scope.numPerPage;
        end = start + $scope.numPerPage;

        console.log('$scope.numPerPage=='+$scope.numPerPage);

        if($scope.isSearch){
            $scope.searchClazz(page,$scope.numPerPage);
        } else {
            getClazzList(page, $scope.numPerPage);
        }

    };
    function onFilterChange() {
        $scope.select(1);
        $scope.currentPage = 1;
        return $scope.row = '';
    };

    function onNumPerPageChange() {
        $scope.select(1);
        return $scope.currentPage = 1;
    };

    function search() {
        $scope.filteredStores = $scope.stores;

        console.log($scope.stores);
        return $scope.onFilterChange();
    };




    init = function() {
        console.log($scope.numPerPage);

        $http.post('http://localhost:8080/aiyixue-server/' + 'clazz/getClazzList.do',{},{params:{
            novelId:$scope.novelId,
            clazzName:$scope.kwClazzName,
            pageNum:1,
            pageSize:$scope.numPerPage
        }}).success(function (data) {
         if (data.errorCode == 0) {
           $scope.stores=data.result;
           $scope.total = data.total;
           console.log($scope.stores);

           $scope.search();

           $scope.currentPageStores = $scope.stores;
           console.log($scope.currentPageStores)

           }
        });

    };




        //批量删除
        $scope.deleteList = function(){


                      // 确定
            var confirm = $mdDialog.confirm()
                        .title('是否确定批量删除')
                        // .ariaLabel('Lucky day')
                        // .targetEvent(ev)
                        .ok('确定删除')
                        .cancel('取消删除');

            $mdDialog.show(confirm).then(function() {
                // console.log('确定')


            var modifyTopicUrl ="http://localhost:8080/aiyixue-server/"+"batch/deleteClazzBatch.do";// 接收上传文件的后台地址
                console.log($scope.selected);
                var temp = "";

                var form = new FormData();

                for(var i in $scope.selected){//用javascript的for/in循环遍历对象的属性
                    temp = i;
                    console.log(temp);
                    form.append("id", temp);
                    form.getTaskDetail
                }

                var xhr = new XMLHttpRequest();
                var response;
                xhr.open("post", modifyTopicUrl, true);
                xhr.send(form);
                xhr.onreadystatechange = doResult;
                function doResult() {
                    if(xhr.readyState == 4  && xhr.status == 200){
                        $scope.showAlert("删除成功");
                         for(var i in $scope.selected){
                            temp = i;
                            $(".delete-"+temp).css("display","none");
                                 $scope.total--;
                         }

                    } else if(xhr.readyState == 4 && xhr.status != 200){
                     // $scope.showAlert(xhr.errorMessage);
                     $scope.showAlert("删除失败");
                }


                }
                // init();
                $scope.showAlert = function(txt) {

                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(false)
                        .title(txt)
                        .ok('确定')
                    )

                }

        })

    }
        $scope.selected = {};//所有选中的元素
        $scope.isSelectedAll = false;//是否全被选中
        //获取标签选中状态
        $scope.isSelected = function (id) {

            if($scope.selected[id] === true){
                return true;
            }else{
                return false;

            }
                        
          };

            //返回 是否全选
            var judgeSelectedAll = function () {
            var isSelectedAll = true;
              for (var i = 0; i < $scope.currentPageStores.length; i++) {
                              var admin = $scope.currentPageStores[i];
                isSelectedAll = $scope.selected[admin.adminId];
              }

                return isSelectedAll;
           };

            //反转标签选中状态
          var updateSelected = function (id) {
            // if ($scope.isSelected(id)){
            //     $scope.selected[id] = false;
            // }else{
            //     $scope.selected[id] = true;
            // }
            // $scope.isSelectedAll = judgeSelectedAll();     
            };


            //赋值
            var updateSelectedByStatus = function (id, status) {
                $scope.selected[id] = status;       
            };

            $scope.selectAll = function () {


                //点击全选按钮反转元素状态
                if($scope.isSelectedAll){

                    $scope.isSelectedAll = false;

                }else{

                    $scope.isSelectedAll = true;

                }
                //将
                for (var i = 0; i < $scope.currentPageStores.length; i++) {
                    var admin = $scope.currentPageStores[i];
                    updateSelectedByStatus(admin.adminId, $scope.isSelectedAll);
                }

             };


            $scope.selectItem = function (id) {
                // updateSelected(id);
                if ($scope.isSelected(id)){
                    $scope.selected[id] = false;
                }else{
                    $scope.selected[id] = true;
                }
                //全选判断
                $scope.isSelectedAll = judgeSelectedAll(); 
            };

            var truth ;//是否有元素选中
            



        // 搜索章节
        $scope.searchClazz = function(num,size){
            $scope.clazzName = $("#clazzName").val();
            $scope.nickName = $("#nickName").val();
            $scope.realName = $("#realName").val();
            console.log($scope.clazzName)
            console.log($scope.nickName)
            console.log($scope.realName)
            $scope.isSearch = true;

            $http.post('http://localhost:8080/aiyixue-server/' + 'clazz/getClazzList.do',{},{params:{
                clazzName:$scope.clazzName,
                nickName:$scope.nickName,
                realName:$scope.realName,
                pageNum:num,
                pageSize:size
            }}).success(function (data){
                if(data.errorCode == 0){
                    $scope.stores=data.result;
                    $scope.total = data.total;
                    $scope.currentPageStores = $scope.stores;
                    $scope.total.$apply;
                    $scope.currentPageStores.$apply;
                    console.log("total:" + data.total);
                } else {
                    $scope.showAlert(data.errorMessage);
                }
            })
            // console.log($scope.productType);
            console.log($scope.numPerPage);
        }

        // 删除章节
        $scope.deleteClazz = function(id){
            $scope.showConfirm = function() {
                // 确定
                var confirm = $mdDialog.confirm()
                .title('是否确定删除该条章节信息')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定')
                            .cancel('取消');
                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')
                    $http.post("http://localhost:8080/aiyixue-server/"+"clazz/deleteClazz.do?",{},{params:{
                        clazzId:id
                    }}).success(function (data){
                        if(data.errorCode == 0){
                            $scope.showAlert("删除章节成功");
                            $(".delete-"+id).css("display","none");
                            $scope.total--;
                        } else {
                            $scope.showAlert(data.errorMessage);
                        }

                    })
                }, function() {

                    $scope.showAlert("取消删除");
                });
                        };
                        $scope.showAlert = function(txt) {

                            $mdDialog.show(
                                $mdDialog.alert()
                                .clickOutsideToClose(false)
                                .title(txt)
                                .ok('确定')
                                )

                        }
                        $scope.showConfirm();
                    }


                    $scope.showAlert = function(txt) {
             // dialog
             $mdDialog.show(
                $mdDialog.alert()
                    // .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(false)
                    .title(txt)
                    // .content('You can specify some description text in here.')
                    // .ariaLabel('Alert Dialog Demo')
                    .ok('确定')
                    // .targetEvent()
                    )
         }

         init();
     }




//**********录入章节************************

function AddClazzCtrl($scope,$http,$location,$mdDialog,$timeout){
    $scope.backClick = function(){
        $location.path("/clazz/clazz-list");
    }

    $scope.login = function(){
        if(sessionStorage.adminId == undefined){
            $location.path('')
        }
    }

    $scope.clazz = {};
    $scope.doUploadPhoto=function(element){

        $scope.fileObj = element.files[0];
    }

    $scope.doUploadMultPhoto=function(element){

        $scope.carouselFileObj = element.files;
            //console.log("$scope.fileObj");
        }

        $scope.novelId = $location.search().id;
        $scope.addClazz = function(){

            $scope.showConfirm = function() {
                            // 确定
                            var confirm = $mdDialog.confirm()
                            .title('是否确定添加新的章节')
                            .ok('确定添加')
                            .cancel('取消添加');
                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')
                    var addClazzUrl ="http://localhost:8080/aiyixue-server/" + "clazz/addClazz.do?";
                    // FormData 对象
                    var form = new FormData();
                    form.append("clazzNumber", $scope.clazz.clazzNumber);
                    form.append("clazzName", $scope.clazz.clazzName);
                    form.append("publishId", $scope.clazz.publishId);
                    form.append("isFree", $scope.clazz.isFree);
                    form.append("content", $scope.clazz.content);
                    form.append("novelId", $scope.novelId);

                    var xhr = new XMLHttpRequest();
                    var response;
                    xhr.open("post", addClazzUrl, true);

                    xhr.send(form);

                    xhr.onreadystatechange = doResult;

                    function doResult() {

                        if (xhr.readyState == 4) {//4代表执行完成
                            if (xhr.status == 200) {//200代表执行成功
                           //将xmlHttpReg.responseText的值赋给ID为resText的元素
                           $scope.showAlert("录入章节成功");

                       }
                   }

               }

           }, function() {
                    // //console.log('取消')
                    $scope.showAlert("取消上传");
                });
                        };
                        $scope.showAlert = function(txt) {
                 // dialog
                 $mdDialog.show(
                    $mdDialog.alert()

                    .clickOutsideToClose(false)
                    .title(txt)
                    .ok('确定')
                    ).then(function() {
                       $location.path('/clazz/clazz-list');
                   })
                }
                $scope.showConfirm();
            }
            $scope.backClick = function() {
                $location.path("/clazz/clazz-list");
            }

        }

//**************************************************
//**********修改章节****************

function ChangeClazzCtrl($scope,$http,$location,$mdDialog,$timeout){
    $scope.login = function(){
        if(sessionStorage.adminId == undefined){
            $location.path('')
        }
    }

    $scope.clazzId = $location.search().id;
    $http.post("http://localhost:8080/aiyixue-server/"+"clazz/getClazzById.do?",{},{params:{
        clazzId:$scope.clazzId
    }}).success(function (data){
        if(data.errorCode == 0){
            $scope.clazz = data.result;
            console.log($scope.clazz);
            console.log("  " + $scope.clazz);
        } else {
            $scope.showAlert1(data.errorMessage)
        }
    })


    $scope.clazz = {};

    $scope.doUploadPhoto=function(element){

        $scope.fileObj = element.files[0];
    }

    $scope.modifyClazz = function(){
        $scope.showConfirm = function() {
                            // 确定
                            var confirm = $mdDialog.confirm()
                            .title('是否确定修改章节')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定修改')
                            .cancel('取消修改');
                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')
                    var changeClazzUrl ="http://localhost:8080/aiyixue-server/" + "clazz/modifyClazz.do?";
                    // FormData 对象
                    var form = new FormData();
                    form.append("clazzId",$scope.clazzId);
                    form.append("clazzName",$scope.clazz.clazzName);
                    form.append("clazzText", $scope.clazz.clazzText);

                    var xhr = new XMLHttpRequest();
                    var response;
                    xhr.open("post", changeClazzUrl, true);

                    xhr.send(form);

                    xhr.onreadystatechange = doResult;

                    function doResult() {

                        if (xhr.readyState == 4) {//4代表执行完成


                            if (xhr.status == 200) {//200代表执行成功
                           //将xmlHttpReg.responseText的值赋给ID为resText的元素
                           $scope.showAlert("修改章节成功");

                       }
                   }

               }

           }, function() {
                    // //console.log('取消')
                    $scope.showAlert("取消上传");
                });
                        };
                        $scope.showAlert = function(txt) {
                 // dialog
                 $mdDialog.show(
                    $mdDialog.alert()

                    .clickOutsideToClose(false)
                    .title(txt)
                    .ok('确定')
                    ).then(function() {
                       $location.path('/clazz/clazz-list');
                   })
                }
                $scope.showConfirm();
            }
            $scope.backClick = function(){
                $location.path("/clazz/clazz-list");
            }

        }

    })();
