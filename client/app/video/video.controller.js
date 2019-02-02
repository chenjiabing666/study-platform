(function(){
	// 'video strick'
    VideoListCtrl
	angular.module('app.video',[])
  .controller('VideoListCtrl', ['$scope','$http','$mdDialog','$location','$timeout',VideoListCtrl])
  .controller('VideoAddCtrl', ['$scope', '$http','$location','$mdDialog','$timeout',VideoAddCtrl])
  .controller('VideoDetailCtrl', ['$scope', '$http','$location','$mdDialog','$timeout','$sce',VideoDetailCtrl])
  .controller('VideochangeCtrl', ['$scope', '$http','$location','$mdDialog','$timeout',VideochangeCtrl])
  // .controller('VideoCtrl', ['$scope', '$http','$location','$mdDialog','$timeout',VideoCtrl])
  .filter('parseGender',function() {
    return function(input){
        if(input == 1){
            return '男';
        }else if(input == 2){
            return '女';
        }else{
            return '';
        }
    }

})
  .filter('parseVideoStatus',function(){
    return function(input){
        if(input == 1){
            return '正常';
        }
        if(input == 2){
            return '封号';
        }
        if(input == 3){
            return '暂停';
        }
    }
})
  .filter('parseVideoActivated',function(){
    return function(input){
        if(input == 0){
            return '待审核';
        }
        if(input == 1){
            return '已通过';
        }
        if(input == 2){
            return '未通过';
        }
    }
})




  //图片列表
  function VideoListCtrl($scope,$http,$mdDialog,$location,$timeout){
    // $scope.level=''
    
    $scope.login = function(){
        if(sessionStorage.adminId == undefined){
            $location.path('/page/signin')
        }
    }

    $timeout($scope.login(),10)


    var init;

    $scope.stores = []; 
    // $scope.kwNickName;     //用户昵称
    // $scope.kwVideoId;     //用户id
    $scope.mobile;     //手机号码
    $scope.startDate;    //开始时间
    $scope.endDate;    //结束时间
    $scope.activated;

    // $scope.kwSex = '';      
    // $scope.KwLevel = '';    
    // $scope.KwStartTime = '';
    // $scope.KwEndTime = '';    
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
    $scope.videoLists = [];

    $scope.isListVideo = 0;
    $scope.isEditVideo = 0;
    $scope.isDeleteVideo = 0;
    $scope.isAddVideo = 0;
    $scope.adminInfo;

    $scope.isShow = 0;
    var authoritySet = sessionStorage.authoritySet.split(',');
    for (var i = 0; i < authoritySet.length; i++) {
        if (authoritySet[i] == "43") {
            $scope.isShow = 1;
        }
    }


    $scope.showAlert = function(txt) {

                            $mdDialog.show(
                                $mdDialog.alert()
                                .clickOutsideToClose(false)
                                .title(txt)
                                .ok('确定')
                                )

                        }


    //根据adminId获取管理员信息
    $scope.getAdminInfo=function(){
        $http.post('http://localhost:8080/applicationMarket-server/' + 'admin/getAdminById.do',{},{params:{
            adminId:sessionStorage.adminId
        }}).success(function (data) {
         if (data.successCode == 100200) {
                $scope.adminInfo=data.result;
             }else {
                // showAlert(data.errorMessage);

            }
        })
    }

    // 审核图片
    // 审核驳回需要提示确定
    $scope.reviewVideo=function(videoId,activated){
        console.log(videoId+"---"+activated+"---");
        $http.post('http://localhost:8080/applicationMarket-server/' + 'video/modifyVideo.do',{},{params:{
            videoId:videoId,
            activated:activated,
            adminId:sessionStorage.adminId
        }}).success(function (data) {
         if (data.successCode == 100200) {
                //改变图片的状态
                for (var i = 0; i < $scope.stores.length; i++) {
                    if($scope.stores[i].videoId==videoId){
                        $scope.stores[i].activated=activated;  //设置状态

                        $scope.stores[i].adminName=$scope.adminInfo.adminName;
                    }
                }
             }else {
                // showAlert(data.errorMessage);

            }
        })
    };




        


        $scope.review = function(videoId,activated){
            //审核通过
            if (activated==2) {
                $scope.reviewVideo(videoId,activated);
            }else{
                $scope.showConfirm = function() {
                // 确定
                var confirm = $mdDialog.confirm()
                .title('是否确定审核驳回')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定')
                            .cancel('取消');
                            $mdDialog.show(confirm).then(function() {

                             $scope.reviewVideo(videoId,activated);
                }, function() {
                    $scope.showAlert("取消驳回");
                });
                    };
                        $scope.showConfirm();
                    }
            }

            


    //获取用户列表
    function getVideoList(pageNum, pageSize){
        
        if($scope.mobile==""){
            $scope.mobile=undefined;
        }

        if($scope.startDate==""){
            $scope.startDate=undefined;
        }

        if($scope.endDate==""){
            $scope.endDate=undefined;
        }

        if($scope.activated==""){
            $scope.activated=undefined;
        }

        $http.post('http://localhost:8080/applicationMarket-server/' + 'video/getVideoList.do',{},{params:{
            mobile:$scope.mobile,
            endDate:$scope.endDate,
            startDate:$scope.startDate,
            activated:$scope.activated,
            pageNum:pageNum,
            pageSize:pageSize
        }}).success(function (data) {
         if (data.successCode == 100200) {
           $scope.videoLists=data.result;
           $scope.stores=data.result;
           $scope.video=data.result;
           $scope.currentPageStores = data.result;
           $scope.filteredStores = data.result;
                 // $scope.currentPageStores.$apply;
                 $scope.total = data.total;
                 // $scope.searchVideo(pageNum, $scope.numPerPage);
             }else {
                /*$scope.showAlert(data.errorMessage);*/
                if (data.errorCode==100225) {
                    $scope.showAlert(data.errorMessage);
                }
                $scope.currentPageStores = null;

            }
        });
    }




    //导出excel
    $scope.export = function(){
        var obj = {title:"", titleForKey:"", data:""};
        obj.title = ["用户ID","用户手机","昵称","用户姓名","注册日期","用户类型"];
        obj.titleForKey = ["videoId","mobile","nickName","videoName","createdDate","vipType"];
        obj.data = $scope.stores;
        exportCsv(obj);
    }

    function exportCsv(obj){
                        //title ["","",""]
                        var title = obj.title;
                        //titleForKey ["","",""]
                        var titleForKey = obj.titleForKey;
                        var data = obj.data;
                        var str = [];
                        str.push(obj.title.join(",")+"\n");
                        for(var i=0;i<data.length;i++){
                            var temp = [];
                            for(var j=0;j<titleForKey.length;j++){
                                temp.push(data[i][titleForKey[j]]);
                            }
                            str.push(temp.join(",")+"\n");
                        }
                        var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(str.join(""));
                        var downloadLink = document.createElement("a");
                        downloadLink.href = uri;
                        downloadLink.download = "用户列表.csv";
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                    }


                    function select(page) {
                       getVideoList(page, $scope.numPerPage);


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
                    $scope.startDate=$("#startDate").val();
                    $scope.endDate=$("#endDate").val();
                    getVideoList(1, $scope.numPerPage);
                };

                $scope.emptyCondition = function(){
                    $scope.kwNickName = '';
                    $scope.kwVideoId = '';
                    $scope.kwMobile = '';
                    $scope.kwSex = '';
                    $scope.KwLevel = '';
                    $scope.KwStartTime = '';
                    $scope.KwEndTime = '';
                    $scope.search();
                };


                //页面加载完毕立即调用的方法
                init = function() {
                    console.log($scope.numPerPage);
                    console.log("adminId:"+sessionStorage.adminId);

                    $scope.getAdminInfo();  //获取管理员信息
                    
                    // console.log($scope.adminInfo);
                    // console.log("adminId:"+sessionStorage.admin.adminName);
                    $http.post('http://localhost:8080/applicationMarket-server/' + 'video/getVideoList.do',{},{params:{
                        mobile:$scope.mobile,
                        endDate:$scope.endDate,
                        startDate:$scope.startDate,
                        activated:$scope.activated,
                        pageNum:1,
                        pageSize:$scope.numPerPage
                    }}).success(function (data) {
                     if (data.successCode == 100200) {
                       $scope.stores=data.result;
                       $scope.total = data.total;
                       console.log($scope.stores);

                       // $scope.search();
                     // $scope.searchVideo(1,$scope.numPerPage);
                     $scope.currentPageStores = $scope.stores;
                     // $scope.searchVideo(page,$scope.numPerPage);
                 }
             });

                };

    //查找待审核的图片
    $scope.getWait=function(){
        $scope.activated=1;  
        // $scope.getVideoList(1,10);
        init();
    }

    //查找已通过的图片
    $scope.getPass=function(){
        $scope.activated=2;  
        // $scope.getVideoList(1,10);
        init();
    }


    //查找已拒绝的图片
    $scope.getRefuse=function(){
        $scope.activated=3;  
        // $scope.getVideoList(1,10);
        init();
    }

    //查找已拒绝的图片
    $scope.getRefuse=function(){
        $scope.activated=3;  
        // $scope.getVideoList(1,10);
        init();
    }


    //查找全部的图片
    $scope.getAll=function(){
        $scope.activated=4;  
        // $scope.getVideoList(1,10);
        init();
    }








//          $scope.selected = {};

//           $scope.isSelected = function (id) {
//             console.log("isSelected");

//             if($scope.selected[id] == true){
//                 return true;



//             }else{
//                 return false;

//             }
//             
//           };
//           $scope.isSelectedAll = function () {
//     console.log("isSelectedAll");
//             return $scope.selected.length === $scope.currentPageStores.length;
//           };

//           var updateSelected = function (action, id) {

//     console.log($scope.isSelected(id));

//             if ($scope.isSelected(id)){


//             $scope.selected[id] = false;


//             }else{

//                 $scope.selected[id] = true;

//             }
//            
//           };
          //更新某一列数据的选择
//           $scope.updateSelection = function (id) {

//             updateSelected(id);
//           };
          //全选操作

$scope.selected = {};
$scope.videoIdsExcel=[];

$scope.isSelectedAll = false;

  $scope.isSelected = function (id) {
    console.log("isSelected==" + $scope.selected[id]);

    if($scope.selected[id] == true){
        return true;



    }else{
        return false;

    }
                
          };


          var judgeSelectedAll = function () {

    var isSelectedAll = true;


      for (var i = 0; i < $scope.currentPageStores.length; i++) {


                      var video = $scope.currentPageStores[i];

        isSelectedAll &= $scope.selected[video.videoId];

                }

    return isSelectedAll;
          };

          var updateSelected = function (id) {

    console.log($scope.isSelected(id));

                if ($scope.isSelected(id)){


        $scope.selected[id] = false;


    }else{

        $scope.selected[id] = true;

    }

    $scope.isSelectedAll = judgeSelectedAll();



               
          };



      var updateSelectedByStatus = function (id, status) {

    console.log($scope.isSelected(id));


    $scope.selected[id] = status;
               
          };
         $scope.selectAll = function () {


    console.log("isSelectedAll1"  + $scope.isSelectedAll);


    if($scope.isSelectedAll){

        $scope.isSelectedAll = false;

    }else{

        $scope.isSelectedAll = true;


    }

            
                for (var i = 0; i < $scope.currentPageStores.length; i++) {


                      var video = $scope.currentPageStores[i];



        updateSelectedByStatus(video.videoId, $scope.isSelectedAll);

                }

            


          };


          $scope.selectItem = function (id) {
        console.log("selectItem"  + id);


    updateSelected(id);

          };




//导出到excel
$scope.exportExcel = function(){


                          // 确定
                          var confirm = $mdDialog.confirm()
                          .title('是否导出选择的会员信息')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定导出')
                            .cancel('取消导出');

                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')

                var url="http://localhost:8080/applicationMarket-server/"+"video/exportExcel.do?";

                // var modifyTopicUrl ="http://localhost:8080/applicationMarket-server/"+"video/exportExcel.do";// 接收上传文件的后台地址
                // console.log($scope.selected);
                // var temp = "";

                // var form = new FormData();

                     for(var i in $scope.selected){//用javascript的for/in循环遍历对象的属性
                        url=url+"videoIds="+i+"&";
                        // temp = i;
                        // console.log(temp);
                        // form.append("videoIds", temp);
                        // form.getTaskDetail
                    }
                    // console.log("form"+form);
                    window.location.href=url;

                //     var xhr = new XMLHttpRequest();
                //     var response;
                //     xhr.open("post", modifyTopicUrl, true);
                //     xhr.send(form);
                //     xhr.onreadystatechange = doResult;
                //     function doResult() {
                //         if(xhr.readyState == 4  && xhr.status == 200){
                //             $scope.showAlert("导出成功");
                //             // for(var i in $scope.selected){
                //             //     temp = i;
                //             //     $(".delete-"+temp).css("display","none");
                //             //     $scope.total--;
                //             // }

                //         } else if(xhr.readyState == 4 && xhr.status != 200){
                //          // $scope.showAlert(xhr.errorMessage);
                //          $scope.showAlert("导出失败");
                //      }


                //  }
                //     // init();
                //     $scope.showAlert = function(txt) {

                //         $mdDialog.show(
                //             $mdDialog.alert()
                //             .clickOutsideToClose(false)
                //             .title(txt)
                //             .ok('确定')
                //             )

                //     }

                 })

                        }



$scope.deleteList = function(){


                          // 确定
                          var confirm = $mdDialog.confirm()
                          .title('是否确定删除用户')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定删除')
                            .cancel('取消删除');

                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')


                var modifyTopicUrl ="http://localhost:8080/applicationMarket-server/"+"video/deleteVideoBatch.do";// 接收上传文件的后台地址
                console.log($scope.selected);
                var temp = "";

                var form = new FormData();

                     for(var i in $scope.selected){//用javascript的for/in循环遍历对象的属性
                        temp = i;
                        console.log(temp);
                        form.append("videoIds", temp);
                        form.getTaskDetail
                    }

                    var xhr = new XMLHttpRequest();
                    var response;
                    xhr.open("post", modifyTopicUrl, true);
                    xhr.send(form);
                    xhr.onreadystatechange = doResult;
                    function doResult() {
                        if(xhr.readyState == 4  && xhr.status == 200){
                            $scope.showAlert("批量删除成功");
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




       // 搜索

       $scope.searchVideo = function(pageNum,pageSize){
           $scope.isSearch = true;

           $scope.videoId = $("#videoId").val();
           $scope.nickName = $("#nickName").val();
           /*$scope.csName = $("#csName").val();*/
           console.log($scope.nickName)


           /* $scope.name = $("#name").val();*/
           $scope.mobile = $("#mobile").val();



           $http.post('http://localhost:8080/aiyixue-server/' + 'video/getVideoList.do',{},{params:{
            videoId:$scope.kwVideoId,
            nickName:$scope.kwNickName,
                    /*csName:$scope.csName,
                    level:$scope.level,
                    name:$scope.name,*/
                    mobile:$scope.mobile,
                    pageNum:pageNum,
                    pageSize:pageSize
                }}).success(function (data){
                    if(data.errorCode == 0){
                        $scope.stores=data.result;
                        $scope.total = data.total;
                        $scope.currentPageStores = $scope.stores;
                        $scope.total.$apply;
                        $scope.currentPageStores.$apply;
                        console.log("total:" + data.total);
                    }
                })
                $scope.showAlert = function(txt) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .clickOutsideToClose(false)
                        .title(txt)
                        .ok('确定')
                        )

                }
            // console.log($scope.productType);
            console.log($scope.numPerPage);

        }



        // 删除用户
        $scope.deleteVideo = function(id){
            $scope.showConfirm = function() {
                // 确定
                var confirm = $mdDialog.confirm()
                .title('是否确定删除该条用户员信息')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定')
                            .cancel('取消');
                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')
                    $http.post("http://localhost:8080/applicationMarket-server/"+"video/deleteVideo.do?",{},{params:{
                        videoId:id
                    }}).success(function (data){
                        if(data.successCode == 100200){
                            $scope.showAlert("删除用户成功");
                            $(".delete-"+id).css("display","none");
                            $scope.total--;
                        } else {
                            $scope.showAlert(data.errorMessage);
                        }if($scope.total<$scope.numPerPage){
                            $scope.filteredStores.length=$scope.total;
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


        //设为精英
        $scope.setElite = function(id){
            $scope.showConfirm = function(){
                var confirm = $mdDialog.confirm()
                .title('是否确定设置该用户为精英')
                .ok('确定')
                .cancel('取消');
                $mdDialog.show(confirm).then(function(){
                    $http.post("http://localhost:8080/aiyixue-server/"+"elite/addElite.do?",{},{params:{
                        videoId:id,
                    }}).success(function(data){
                        if(data.errorCode == 0){
                            $scope.showAlert("设置成功");
                            $(".set-"+id).css("display","none");
                            $scope.total--;
                        }else{
                            $scope.showAlert(data.errorMessage);
                        }if($scope.total<$scope.numPerPage){
                            $scope.filteredStores.length=$scope.total;
                        }
                    })
                },function(){
                    $scope.showAlert("取消");
                });
            };
            $scope.showAlert = function(txt){
                $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(false)
                    .title(txt)
                    .ok('确定')
                    )
            }
            $scope.showConfirm();
            init();
        }


        // $scope.showAlert = function(txt) {
        //      // dialog
        //     $mdDialog.show(
        //         $mdDialog.alert()
        //             // .parent(angular.element(document.querySelector('#popupContainer')))
        //             .clickOutsideToClose(false)
        //             .title(txt)
        //             // .content('You can specify some description text in here.')
        //             // .ariaLabel('Alert Dialog Demo')
        //             .ok('确定')
        //             // .targetEvent()
        //     )
        // }
        init();







    }



    // 查看详情
    function VideoDetailCtrl($scope,$http,$location,$mdDialog,$timeout,$sce){

        $timeout($scope.login(),10)


        $scope.isShow = 0;
        var authoritySet = sessionStorage.authoritySet.split(',');
        //控制权限，如果没有这个权限，不显示
        for (var i = 0; i < authoritySet.length; i++) {
            if (authoritySet[i] == "49") {
                $scope.isShow = 1;
            }
        }

        //重置密码的权限
        $scope.isRestShow = 0;
        var authoritySet = sessionStorage.authoritySet.split(',');
        //控制权限，如果没有这个权限，不显示
        for (var i = 0; i < authoritySet.length; i++) {
            if (authoritySet[i] == "50") {
                $scope.isRestShow = 1;
            }
        }


        //绑定逝者
        $scope.bindingVideo = function(){
            $location.path('/video/video-bindVideo');
        }

        $scope.backClick = function(){
            $location.path('/video/video-list');
        }
/*        $scope.cancelClick = function(){
            $(".cancelClick").css("display","none");
            $("#myDeal").attr("disabled",true);
            $("#myManager").attr("disabled",true);
            $(".changeConfirm").css("display","none");
            $("#myManager").css("display","block");
            $(".video-manager").css("display",'none');

        }*/

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


        $scope.videoId = $location.search().id;   //获取用户id
        console.log("id="+$scope.videoId);
        //根据用户id获取用户详细信息
        $http.post('http://localhost:8080/applicationMarket-server/' + 'video/getVideoById.do',{},{params:{
            videoId:$scope.videoId   //用户id
        }}).success( function (data){   
            if(data.successCode == 100200){
                $scope.video = data.result;
                console.log($scope.video.videoIcon);
                if($scope.video.sex=='1'){
                    $scope.video.sex='男'
                }else if($scope.video.sex=='2'){
                    $scope.video.sex='女'
                }
                else if($scope.video.sex=='3'){
                    $scope.video.sex='保密'
                }

                if ($scope.video.vipType=="1") {
                    $scope.video.vipType="普通会员";
                }else{
                    $scope.video.vipType="藏晶苑会员";
                }
                
            } else {
                $scope.showAlert(data.errorMessage);
            }
        });


        //根据用户id获取其绑定的逝者信息
        $http.post('http://localhost:8080/applicationMarket-server/' + 'video/getDetailedInformation.do',{},{params:{
            videoId:$scope.videoId   //用户id
        }}).success( function (data){   
            if(data.successCode == 100200){
                $scope.videos = data.result;
                console.log($scope.videos);
                for (var i = 0; i < $scope.videos.length; i++) {
                    if($scope.videos[i].videoGender=="1"){
                        $scope.videos[i].videoGender="男";
                    }else if($scope.videos[i].videoGender=="3"){
                        $scope.videos[i].videoGender=="保密";
                    }
                    else{
                        $scope.videos[i].videoGender="女";
                    }
                }
            } else {
                // $scope.showAlert(data.errorMessage);
            }
        });


        //解除绑定的函数
        $scope.unbindingVideo=function(videoId){
                     // 确定
                    var confirm = $mdDialog.confirm()
                    .title('是否确定解除绑定信息')
                                // .ariaLabel('Lucky day')
                                // .targetEvent(ev)
                                .ok('确定')
                                .cancel('取消');
                                $mdDialog.show(confirm).then(function() {
            $http.post('http://localhost:8080/applicationMarket-server/' + 'video/unbindingVideo.do',{},{params:{
            videoId:$scope.videoId,  //用户id
            videoId:videoId
        }}).success( function (data){   
            if(data.successCode == 100200){  //解除成功
                $scope.showAlert(data.successMessage);
                $("#delete-"+videoId).remove();
            } else {
                $scope.showAlert(data.errorMessage);
            }
        });
    }, function() {

                        $scope.showAlert("取消绑定");
                    });
        }


        //重置密码
        $scope.resetPassword=function(videoId){
                     // 确定
                    var confirm = $mdDialog.confirm()
                    .title('是否确定重置密码')
                                // .ariaLabel('Lucky day')
                                // .targetEvent(ev)
                                .ok('确定')
                                .cancel('取消');
                                $mdDialog.show(confirm).then(function() {
            $http.post('http://localhost:8080/applicationMarket-server/' + 'video/restPassword.do',{},{params:{
            videoId:$scope.videoId  //用户id
        }}).success( function (data){   
            if(data.successCode == 100200){  //解除成功
                $scope.showAlert(data.successMessage);
            } else {
                $scope.showAlert(data.errorMessage);
            }
        });
            }, function() {

                        $scope.showAlert("取消重置密码");
                    });
        }


        /** 
        * 视频路径处理 
        */  
        $scope.videoUrl = function(url){  
         return $sce.trustAsResourceUrl(url);  
     }  

     $scope.videoBig = false;
     $scope.videoImg = true;
     $scope.videoClick = function(){
        $scope.videoBig = true;
        $scope.videoImg = false;
    }

    $scope.closeVideo = function(){
        $scope.videoBig = false;
        $scope.videoImg = true;
    }   

}


    
            // 绑定逝者信息
        function VideoCtrl($scope,$http,$location,$mdDialog,$timeout){
            $timeout($scope.login(),10)
            $scope.videoId = $location.search().videoId;
            console.log($scope.videoId);

            $scope.backClick = function(){
                $location.path("/video/video-list");
            }

            $http.post('http://localhost:8080/aiyixue-server/' + 'video/getVideoByVideoId.do',{},{params:{
                videoId:$scope.videoId
            }}).success( function (data){
                if(data.errorCode == 0){
                    $scope.video = data.result;
                    $scope.video.deleted = $scope.video.deleted+'';


                } else {
                    $scope.showAlert(data.errorMessage);
                    console.log($scope.video)
            }/*if($scope.video.gender=='1'){
                $scope.video.gender='男'
            }else if ($scope.video.gender=='0') {
                $scope.video.gender='女'
            }*/

        });


            $scope.doUploadPhoto=function(element){
                $scope.fileObj = element.files[0];
            }

            $scope.changevideo = function(){
                $scope.showConfirm = function() {
                            // 确定
                            var confirm = $mdDialog.confirm()
                            .title('是否确定修改用户信息')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定修改')
                            .cancel('取消修改');
                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')
                    var changeGiftUrl ="http://localhost:8080/aiyixue-server/" + "video/modifyVideo.do?";  
                    // FormData 对象
                    var form = new FormData();
                    form.append("videoId",$scope.videoId);
                    form.append("nickName",$scope.video.nickName);
                    form.append("password",$scope.video.password);
                    form.append("realName",$scope.video.realName);
                    form.append("sex",$scope.video.sex);
                    form.append("age",$scope.video.age);
                    form.append("deleted",$scope.video.deleted);
                    form.append("file", $scope.fileObj);

                    var xhr = new XMLHttpRequest();
                    var response;
                    xhr.open("post", changeGiftUrl, true);

                    xhr.send(form);

                    xhr.onreadystatechange = doResult;

                    function doResult() {

                        if (xhr.readyState == 4) {//4代表执行完成


                            if (xhr.status == 200) {//200代表执行成功
                           //将xmlHttpReg.responseText的值赋给ID为resText的元素
                           $scope.showAlert("修改用户信息成功");                      

                       }
                   }

               }

           }, function() {
                    // //console.log('取消')
                    $scope.showAlert("取消修改");
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
                     $location.path('/video/video-list');
                 }) 
                }    
                $scope.showConfirm();
            }


        }



        // 修改
        function VideochangeCtrl($scope,$http,$location,$mdDialog,$timeout){
            $timeout($scope.login(),10)
            $scope.videoId = $location.search().id;

            $scope.backClick = function(){
                $location.path("/video/video-list");
            }

            $http.post('http://localhost:8080/aiyixue-server/' + 'video/getVideoByVideoId.do',{},{params:{
                videoId:$scope.videoId
            }}).success( function (data){
                if(data.errorCode == 0){
                    $scope.video = data.result;
                    $scope.video.deleted = $scope.video.deleted+'';


                } else {
                    $scope.showAlert(data.errorMessage);
                    console.log($scope.video)
            }/*if($scope.video.gender=='1'){
                $scope.video.gender='男'
            }else if ($scope.video.gender=='0') {
                $scope.video.gender='女'
            }*/

        });


            $scope.doUploadPhoto=function(element){
                $scope.fileObj = element.files[0];
            }

            $scope.changevideo = function(){
                $scope.showConfirm = function() {
                            // 确定
                            var confirm = $mdDialog.confirm()
                            .title('是否确定修改用户信息')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定修改')
                            .cancel('取消修改');
                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')
                    var changeGiftUrl ="http://localhost:8080/aiyixue-server/" + "video/modifyVideo.do?";  
                    // FormData 对象
                    var form = new FormData();
                    form.append("videoId",$scope.videoId);
                    form.append("nickName",$scope.video.nickName);
                    form.append("password",$scope.video.password);
                    form.append("realName",$scope.video.realName);
                    form.append("sex",$scope.video.sex);
                    form.append("age",$scope.video.age);
                    form.append("deleted",$scope.video.deleted);
                    form.append("file", $scope.fileObj);

                    var xhr = new XMLHttpRequest();
                    var response;
                    xhr.open("post", changeGiftUrl, true);

                    xhr.send(form);

                    xhr.onreadystatechange = doResult;

                    function doResult() {

                        if (xhr.readyState == 4) {//4代表执行完成


                            if (xhr.status == 200) {//200代表执行成功
                           //将xmlHttpReg.responseText的值赋给ID为resText的元素
                           $scope.showAlert("修改用户信息成功");                      

                       }
                   }

               }

           }, function() {
                    // //console.log('取消')
                    $scope.showAlert("取消修改");
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
                     $location.path('/video/video-list');
                 }) 
                }    
                $scope.showConfirm();
            }


        }






       // 增加


       function VideoAddCtrl($scope,$http,$location,$mdDialog,$timeout){


           $scope.login = function(){
            if(sessionStorage.adminId == undefined){
               $location.path('/page/signin')
            }
        }
        //$timeout($scope.login(),10)

        

        $scope.isShow = 0;
        var authoritySet = sessionStorage.authoritySet.split(',');
        //控制权限，如果没有这个权限，不显示
        for (var i = 0; i < authoritySet.length; i++) {
            if (authoritySet[i] == "36") {
                $scope.isShow = 1;
            }
        }


        $scope.video = {videoName:'', mobile:'', code:'',vipType:'',sex:''};

        $scope.showAlert1 = function(txt) {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                    .clickOutsideToClose(false)
                                    .title(txt)
                                    .ok('确定')
                                    )

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

        $scope.backClick = function(){
            $location.path("/video/video-list");
        }

        $scope.sendCode=function(mobile){
            console.log(mobile);
            $http.post("http://localhost:8080/applicationMarket-server/"+"video/genAuthCode.do?",{},{params:{
                        mobile:mobile
                    }}).success(function (data){
                        if(data.successCode == 112000){
                            $scope.showAlert("验证码发送成功");
                            // alert("验证码发送成功");
                        } else {
                            $scope.showAlert1(data.errorMessage)
                        }

                    });
        }
       


        //添加用户
        $scope.addvideo = function(){

            $scope.showConfirm = function() {
                            // 确定
                            var confirm = $mdDialog.confirm()
                            .title('是否确定添加用户')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定添加')
                            .cancel('取消添加');
                            $mdDialog.show(confirm).then(function() {
                    // console.log('确定')




                    $http.post("http://localhost:8080/applicationMarket-server/"+"video/addVideo.do?",{},{params:{

                        mobile:$scope.video.mobile,
                        videoName:$scope.video.videoName,
                        code:$scope.video.code,
                        vipType:$scope.video.vipType,
                        sex:$scope.video.sex

                    }}).success(function (data){
                        if(data.successCode == 100200){
                            $scope.showAlert("添加用户成功");
                        } else {
                            $scope.showAlert1(data.errorMessage)
                        }

                    })
                }, function() {
                    // console.log('取消')
                    $scope.showAlert("取消添加");
                });
                        };
                        $scope.showAlert = function(txt) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .clickOutsideToClose(false)
                                .title(txt)
                                .ok('确定')
                                ).then(function(){
                                    $location.path('/video/video-list');
                                })

                            }

                            
                            $scope.showConfirm();
                        }



/*        $scope.cancelClick = function(){
            $(".cancelClick").css("display","none");
            $("#myDeal").attr("disabled",true);
            $("#myManager").attr("disabled",true);
            $(".changeConfirm").css("display","none");
            $("#myManager").css("display","block");
            $(".video-manager").css("display",'none');

        }*/






/*        $scope.changeClick = function(){
            console.log("1");
            $(".cancelClick").css("display","inline");
            $("#myDeal").attr("disabled",false);
            $("#myManager").attr("disabled",false);
            $(".changeConfirm").css("display","block");
            $("#myManager").css("display","none");
            $(".video-manager").css("display",'inline');
        }*/
/*        // 确认修改
        $scope.changeConfirm = function(){


            console.log("$scope.video.myDeal:"+$scope.video.myDeal);
            console.log("$scope.video.managerId:"+$scope.video.managerId);
            console.log("$scope.videoId:"+$scope.videoId);

            $scope.showConfirm = function() {
                // 确定

                var confirm = $mdDialog.confirm()
                            .title('是否确定修改用户信息')
                            // .ariaLabel('Lucky day')
                            // .targetEvent(ev)
                            .ok('确定')
                            .cancel('取消');
                $mdDialog.show(confirm).then(function() {
                    // console.log('确定')
                    $http.post("http://localhost:8080/fenxiao-server/"+"video/modifyVideoByvideoId.do",{},{params:{
                        videoId:$scope.videoId,
                        myDeal:$scope.video.myDeal,
                        managerId:$scope.video.managerId
                    }}).success(function (data){
                        if(data.errorCode == 0){
                            $scope.showAlert("修改用户信息成功");
                        } else {
                            $scope.showAlert1(data.errorMessage);
                        }
                    })
                }, function() {
                    // console.log('取消')
                    $scope.showAlert1("取消修改用户信息");
                });
            };

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

                ).then(function(){
                    $(".cancelClick").css("display","none");
                    $("#myDeal").attr("disabled",true);
                    $("#myManager").attr("disabled",true);
                    $(".changeConfirm").css("display","none");
                    $("#myManager").css("display","inline");
                    $(".video-manager").css("display",'none');
                    $scope.managerName = $(".video-manager").find("option:selected").text();
                })
            }
            $scope.showAlert1 = function(txt) {
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
            $scope.showConfirm();
        }*/

        
    }


})();
