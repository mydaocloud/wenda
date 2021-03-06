define(function(require, exports, module) {
	var App = require('app');
	var touch = require('touch');
	var share = require('share');
	var uploadfile = require('uploadfile');
	var XJ = window.XJ || {};
	

	/*
	 *页面信息提示框
	 */
	XJ.tips = function(a){
		a = a||{};
		var opts = {
			id : a.id || 'xjTips',		//提示框ID
			text : a.text || '',		//提示内容
			time : a.time || 3000,		//提示框展示时间
			y : a.y || ($(window).height()-80)/2,			 	//提示框坐标Y
			//x : a.x || ($(window).width()-270)/2,			 	//提示框坐标X
			color : a.color || '#ff7e69',				//字体颜色;#333
			bgcolor : a.bgcolor || '#303237'			//背景色;#fcf9a1
		};
		var objId='#'+opts.id;
		if(opts.text!=''){
			if($(objId).length<=0){$('body').append('<div id="'+opts.id+'"></div>')}
			//$(objId).html('<p>'+opts.text+'</p>').css('background',opts.bgcolor).css('color',opts.color).css('top',opts.y+'px').css('left',opts.x+'rem');
			$(objId).html('<p>'+opts.text+'</p>').css('background',opts.bgcolor).css('color',opts.color).css('top',opts.y+'px').css('left','50%');
			$(objId).animate({
				'opacity':1,
				'["-moz-opacity"]':1,
				'["filter"]':'alpha(opacity=100)'
			},300)
			setTimeout(function(){
				$(objId).animate({
					'opacity':0,
					'["-moz-opacity"]':0,
					'["filter"]':'alpha(opacity=0)'
				},300)
				$(objId).remove();
			},opts.time);
		}
		
	}

	/*
 	*滑出弹框
 	*/
	XJ.slideDialog = function(tthis,dtype){
	  var type = dtype || 1;
	  
	  if(type == 1){
	    if($('#dialogBg').length<=0){$('body').append('<div id="dialogBg" class="dialogBg"></div>');}
	    $('#dialogBg').css('display','block').css('z-index','998').css('opacity',0).css('-moz-opacity',0).css('filter','alpha(opacity=0)');
	    $('#dialogBg').animate({
	      'opacity':0.5,
	      '["-moz-opacity"]':0.5,
	      '["filter"]':'alpha(opacity=50)'
	    },300);
	    tthis.animate({
	      bottom:'0'
	    },300);
	    $('#dialogBg').on('tap',function(){
	      XJ.closeDialog(tthis);
	    });
	  }else if(type == 2){
	    var winHeight = $(window).height();
	    var tthisHeightt = tthis.height();
	    var bottom = (winHeight - tthisHeightt)/2;
	    tthis.css('bottom',bottom).css('border-radius','4px').css('width','96%').css('left','2%').css('opacity',0).css('-moz-opacity',0).css('filter','alpha(opacity=0)');
	    
	    if($('#dialogBg').length<=0){$('body').append('<div id="dialogBg" class="dialogBg"></div>');}
	    $('#dialogBg').css('display','block').css('z-index','998').css('opacity',0).css('-moz-opacity',0).css('filter','alpha(opacity=0)');
	    $('#dialogBg').animate({
	      'opacity':0.5,
	      '["-moz-opacity"]':0.5,
	      '["filter"]':'alpha(opacity=50)'
	    },300);
	    tthis.animate({
	      'opacity':1,
	      '["-moz-opacity"]':1,
	      '["filter"]':'alpha(opacity=100)'
	    },300);
	    $('#dialogBg').on('tap',function(){
	      XJ.closeDialog(tthis , type);
	    });
	  
	  }
	}

	/**
	 * 关闭滑出弹框
	 */
	XJ.closeDialog = function(tthis, dtype){
	  var type = dtype || 1;
	  
	  if(type == 1){
	    tthis.animate({
	      bottom:'-280px'
	    },300)
	  }else if(type == 2){
	    tthis.animate({
	      'opacity':0,
	      '["-moz-opacity"]':0,
	      '["filter"]':'alpha(opacity=0)'
	    },300)
	  }
	  $('#dialogBg').animate({
	    opacity:'0'
	  },300)
	  
	  setTimeout(function(){
	    tthis.css('display','none');
	    $('#dialogBg').css('display','none');
	  },350);
	};
	/*
	 *顶踩的动画效果
	 */
	XJ.votingNum = function(content,tthis) {
	  var top=tthis.offset().top;
	  var left=tthis.offset().left;
	  if($('#votingNum').length<=0){
	    $('body').append('<div id="votingNum"></div>');
	  }
	  $('#votingNum').html(content).css('display','block').css('top',top).css('left',left).css('opacity',0).css('-moz-opacity',0).css('filter','alpha(opacity=0)');
	  $('#votingNum').animate({
	    'z-index':90,
	    'margin':0,
	    'top':top-25,
	    'opacity':1,
	    '["-moz-opacity"]':1,
	    '["filter"]':'alpha(opacity=100)'
	  },300)
	  setTimeout(function(){
	    $('#votingNum').html('').css('display','none');
	  },310)
	};

	//判断获取图片大小是否超过上限
	XJ.handleFiles = function(obj) {
		window.URL = window.URL || window.webkitURL;
		var fileElem = document.getElementById("fileElem");
		var imgSize;
		var files = obj.files,
			img = new Image();
		if(window.URL){
			//File API
			imgSize = files[0].size;
		}else if(window.FileReader){
			//opera不支持createObjectURL/revokeObjectURL方法。我们用FileReader对象来处理
			var reader = new FileReader();
			reader.readAsDataURL(files[0]);
			reader.onload = function(e){
				imgSize = e.total;
			}
		}else{
			//ie
			obj.select();
			obj.blur();
			var nfile = document.selection.createRange().text;
			document.selection.empty();
			img.onload=function(){
				imgSize = img.fileSize;
			}
		}
		if(imgSize>5*1024*1024){
			XJ.tips({text:'文件不能超过5M'});
		}else{
			$('#textfield').val($('#fileElem').val());
		}
	};

	//分享
	$('.j-share').on('tap',function(){
		var htm,title,pic,url;
		title = $(this).attr('data-title');
		pic = $(this).attr('data-pic');
		url = $(this).attr('data-url');
		console.log(title);
		htm = '<dt>分享到</dt>';
		htm += '<dd class="share-channel">';
		htm += '<a href="javascript:void(0)" class="s-tsina share-tsina"><span><i></i></span><p>新浪微博</p></a>';
		htm += '<a href="javascript:void(0)" class="s-tqq share-tqq"><span><i></i></span><p>腾讯微博</p></a>';
		htm += '<a href="javascript:void(0)" class="s-qzone share-qzone"><span><i></i></span><p>QQ空间</p></a>';
		htm += '<a href="javascript:void(0)" class="share-sqq"><span><i></i></span><p>QQ好友</p></a>';
		htm += '</dd>';
		htm += '<dd class="share-close"><a href="javascript:void(0)">取消</a></dd>';
		if($('#xiajiongShare').length<=0){$('body').append('<dl class="xj-share" id="xjShare"></dl>')};
		$('#xjShare').html(htm);
		$('#xjShare').css('display','block').css('position','fixed').css('bottom','-7rem').css('z-index','999');
		XJ.slideDialog($('#xjShare') , 2);

		$('.share-qzone').on('tap',function() {
			share.shareToQzone(title,url,pic);
			XJ.closeDialog($('#xjShare'),2);
		});
		$('.share-tqq').on('tap',function() {
			share.shareToTencent(title,url,pic);
			XJ.closeDialog($('#xjShare'),2);
		});
		$('.share-tsina').on('tap',function() {
			share.shareToSina(title,url,pic);
			XJ.closeDialog($('#xjShare'),2);
		});
		$('.share-sqq').on('tap',function() {
			share.shareToFriend(title,url,pic);
			XJ.closeDialog($('#xjShare'),2);
		});

		$('.share-close').on('tap',function(){
			XJ.closeDialog($('#xjShare'),2);
		});
	})

	//返回顶部
	if($('#goTop').length>0){
		$(window).scroll(function(){
			var top=$(window).scrollTop()/40;
			if (top>(50/40)){
				$('#goTop').css('display','block');
			}else{
				$('#goTop').css('display','none');
			}
		});
		$('#goTop').click(function(){
			$('body,html').animate({scrollTop:0},1000);
		})
	}

	//判断IOS访问终端
	if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
    	$('html').addClass('ios');
  	}


	/*
	*笑话顶踩提交
	*/
	XJ.jokeVote = function(tthis, type){
		var Jid = tthis.parent().parent('li').attr('data-j-id');
		var jokeType = tthis.parent().parent('li').attr('joke-type');
		tthis.find('i').text(Number(tthis.find('i').text())+1);
		tthis.parent().find('.j-bad').attr('class','j-baded').unbind('click');
		tthis.parent().find('.j-good').attr('class','j-gooded').unbind('click');
	  	
		App.request({
			url:'/xiaohua/record',
			data:{id:Jid,type:type},
			loading : false,
			success : function(ret){}
		})
	}

	//顶 、 踩
	
	var j_good = $('.j-good');
	touch.on(j_good,'tap',function(){
		var self = null;
		if(this.nodeName == 'I'){
			self = this.parentNode;
		}else{
			self = this;
		};
		XJ.votingNum('<b style="color:#ff7e69;">+1</b>',$(self));
		XJ.jokeVote($(self) , 'good');
	})


	var j_bad = $('.j-bad');
	touch.on(j_bad,'tap',function(){
		var self = null;
		if(this.nodeName == 'I'){
			self = this.parentNode;
		}else{
			self = this;
		};
		XJ.votingNum('<b style="color:#88cbea;">-1</b>',$(self));
		XJ.jokeVote($(self) , 'bad');
	})

	//打赏
	var j_maryane = $('.j-maryane');
	touch.on(j_maryane,'tap',function(){
		var htm , jId , tthis , tScore , uScore;
		tthis = $(this);
		jId = $(this).parent().parent().attr('data-j-id');
		tScore = parseInt($(this).attr('total-score'));
		uScore = parseInt($(this).attr('user-score'));
		htm = '<form id="form_maryane"><dl>';
		htm += '<dt><i></i><span>大爷们赏了<em class="s-color-red">'+tScore+'</em>囧币</span></dt>';
		htm += '<dd>';
		if(uScore > 0){
			htm += '<p>你给TA打赏了<em class="s-color-red">'+uScore+'</em>囧币</p>';
			htm += '<p>只能打赏一次哦 ^_^</p>';
		}else{
			htm += '<a href="javascript:void(0);" data-id="1"><span>5囧币</span></a>';
			htm += '<a href="javascript:void(0);" data-id="2" class="hover"><span>10囧币</span></a>';
			htm += '<a href="javascript:void(0);" data-id="3"><span>20囧币</span></a>';
			htm += '<a href="javascript:void(0);" data-id="4"><span>30囧币</span></a>';
			htm += '<a href="javascript:void(0);" data-id="5"><span>40囧币</span></a>';
			htm += '<a href="javascript:void(0);" data-id="6"><span>50囧币</span></a>';
			htm += '<input name="id" type="hidden" id="id" value="'+jId+'">'
			htm += '<input name="fee" type="hidden" id="fee" value="2">'
		}

		htm += '</dd>';
		htm += '<dd class="j-m-message"></dd>';

		if(uScore > 0){
			htm += '<dd class="j-m-btn"><button type="button" class="maryane-close">关闭</button></dd>';
		}else{
			htm += '<dd class="j-m-btn"><button type="button" class="maryane-submit">打赏</button><button type="button" class="maryane-close">不理他</button></dd>';
		}
		htm += '</dl></form>';

		if($('#jMaryane').length<=0){$('body').append('<div class="j-maryane-box" id="jMaryane"></div>')};
		$('#jMaryane').html(htm);
		$('#jMaryane').css('display','block').css('position','fixed').css('bottom','-280px').css('z-index','999');
		XJ.slideDialog($('#jMaryane') , 2);

		var mc = $('.maryane-close');
		touch.on(mc,'tap',function(){
			XJ.closeDialog($('#jMaryane') , 2);
		});


		var jMaryane = $('#jMaryane a');
		touch.on(jMaryane,'tap',function(){
			var self = null;
			if(this.nodeName == 'SPAN'){
				self = this.parentNode;
			}else{
				self = this;
			};
			$(self).addClass('hover').siblings().removeClass('hover');
			$('#maryane_level').val($(self).attr('data-id'));
		});

		var ms = $('.maryane-submit');
		touch.on(ms,'tap',function(){
			$('.maryane-submit').attr("disabled",true).val('打赏中..').css('background','#bcbcbd');
			App.request({
				url : '/ajax/award',
				data : $('#form_maryane').serialize(),
				loading : false,
				success: function(ret){
					if(ret.err > 0) {
						XJ.tips({text:'打赏成功！',color:'#fff'});
						XJ.closeDialog($('#jMaryane') , 2);
						tthis.removeClass('j-maryane').addClass('rewarded').html('已打赏');
					} else {
						XJ.closeDialog($('#jMaryane') , 2);
						XJ.tips({text:ret.msg,color:'#fff'});
						$('.j-m-message').html(ret.msg);
						$('.maryane-submit').attr("disabled",false).val('打赏').css('background','#ff845b');
					}
				}
			});
		})
	})

	//包养
	var j_kept = $('.j-kept');
	touch.on(j_kept,'tap',function(){
		var htm , jId , score , tthis;
		tthis = $(this);
		score = $(this).data('fee');
		jId = $(this).data('id');
		htm = '<form id="form_kept">';
		htm += '<div class="j-kept_1"><i></i></div>';
		htm += '<div class="j-k-content">';
		htm += '<p>包养我吧！只需<span class="s-color-red">'+score+'</span>囧币哦！</p>';
		htm += '<p class="j-k-message"></p>';
		htm += '</div>';
		htm += '<div class="j-k-btn"><button type="submit" class="kept-submit">包养</button><button type="reset" class="kept-close">走开</button></div>';
		htm += '<input type="hidden" name="joke_id" value="'+jId+'"/>';
		htm += '</form>';

		if($('#jKept').length<=0){$('body').append('<div class="j-kept-box" id="jKept"></div>')};
		$('#jKept').html(htm);
		$('#jKept').css('display','block').css('position','fixed').css('bottom','-280px').css('z-index','999');
		XJ.slideDialog($('#jKept') , 2);

		var kc = $('.kept-close');
		touch.on(kc,'tap',function(){
			XJ.closeDialog($('#jKept') , 2);
		});
		var ks = $('.kept-submit');
		touch.on(ks,'tap',function(){
			$('.kept-submit').attr("disabled",true).val('包养中..').css('background','#bcbcbd');
			App.request({
				url : '/ajax/package',
				data : {id:jId},
				loading : false,
				success : function(ret){
					if(ret.err > 0) {
						$('.j-kept_1').attr('class','j-kept_2');
						$('.j-k-content').html('<p class="j-k-red">这条投稿被你承包了 ! </p><p class="j-k-red j-k-big">以后赚钱都归你 !!!</p>');
						$('.j-k-btn').html('<input type="reset" class="kept-close" value="走开"/>');
						setTimeout(function(){
							XJ.closeDialog($('#jKept') , 2);
						},2000);
						tthis.after('<div class="kepted"><a href="/user/'+ret.msg.id+'">'+ret.msg.username+'</a><span>包养了Ta</span></div>')
						//tthis.after(ret.msg.html);
						tthis.remove();
					} else {
						$('.j-k-message').html(ret.mg);
						$('.kept-submit').attr("disabled",false).val('包养').css('background','#ff845b');
					}
				}
			});
		})
	})


	//头部 主菜单滚动定位
	function init(){
		var sy = $('#hidScrollY');
		var toppos = (89/40); 
		var scrollTop;
		$(document).scroll(function(){
			scrollTop = ($(document).scrollTop()/40);
			console.log(scrollTop);
			sy.val($(document).scrollTop());
			if(scrollTop > toppos){
				$('#header').removeClass('slideInDown').addClass('slideOutUp');
				$('footer').css('bottom','0');
			}else{
				$('#header').addClass('slideInDown').removeClass('slideOutUp');
				$('footer').css('bottom','-1.6rem');
			}
				
			if(scrollTop > (89/40)){
				toppos = scrollTop;
			}
		})
	}
	var index = {
		list : function(){
			init();
		},
		/*
		登录
		*/
		login : function(){
			//window.addEventListener("load",loaded,false);
			var ls = $('.l-submit');
			touch.on(ls,'tap',function(){
				var username = $('#username').val();
				var password = $('#password').val();
				var backurl = $('#backurl').val();
				if(username == ''){
					XJ.tips({text:'邮箱/手机号/用户名不能为空',color:'#fff'});
					return false;
				}

				if(password == ''){
					XJ.tips({text:'密码不能为空',color:'#fff'});
					return false;
				}
				App.request({
					url:'/account/login',
					data:$('#login_form').serializeObject(),
					success : function(ret){
						if(ret.err){
							location.href = '/user/';
						}else{
							XJ.tips({text:ret.msg,color:'#fff'});
						}
					}
				})
			})
		},
		/*
		注册
		*/
		register : function(){
			var ls = $('.l-submit');
			touch.on(ls,'tap',function(){
				var username 	= $('#username').val(),
				 	password 	= $('#password').val(),
				 	password1 	= $('#confirm_password').val(),
				 	email 		= $('#email').val(),
				 	is_email 	= /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
				 	is_pass		= /^[\w]{2,16}$/;

				//邮箱验证
				if(!is_email.test(email) || email == ''){
					XJ.tips({text:'邮箱不能为空或格式不正确！',color:'#fff'});
					return false;
				}else{
					App.request({
						url : '/account/checkemail',
						data : {email : email},
						loading : false,
						success: function(result){
							var re = result;
							if(re.err){
								is_email = true;
							}else{
								XJ.tips({text:re.msg,color:'#fff'});
								is_email = false;
								return false;
							};
						}
					});
				};

				if(username == '' || username.length < 2 || username.length > 20 ){
					XJ.tips({text:'用户名不能为空或长度不正确，长度2~16个字符！',color:'#fff'});
					return false;
				}else{
					App.request({
						url : '/account/checkusername',
						data : {username : username},
						loading : false,
						success: function(result){
							var re = result;
							if(re.err){
								is_email = true;
							}else{
								XJ.tips({text:re.msg,color:'#fff'});
								
								is_email = false;
								return false;
							};
						}
					});
				};

				if(password == ''){
					XJ.tips({text:'密码不能为空',color:'#fff'});
					return false;
				}

				if(!is_pass.test($.trim(password)) || !is_pass.test($.trim(password1))){
					XJ.tips({text:'密码错误，长度2~16个字符！',color:'#fff'});
					return false;
				}

				if(password != password1){
					XJ.tips({text:'两次密码不一样',color:'#fff'});
					return false;
				}

				App.request({
					url : '/account/register',
					data : $('#register_form').serializeObject(),
					success: function(ret){
						if(ret.err){
							location.href = '/user';
						}else{
							XJ.tips({text:ret.msg,color:'#fff'});
						};
					}
				})
			})
		},
		/*
		投稿
		*/
		publish : function(){
			//上传图片
			//引入Plupload 、qiniu.js后
			/*var uploader = Qiniu.uploader({
				runtimes: 'html5,flash,html4',    //上传模式,依次退化
				browse_button: 'fileuploader',    //上传选择的点选按钮，**必需**
				uptoken_url: '/public/token',     //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
				//uptoken : '9GcsZeCchX2kRs8dmce1I6nA4FNSXvPV0gmTnmXH:k8aFF1mmBCK7wzvYm2t46CQ0y5A=:eyJzY29wZSI6InhpYWppb25nIiwiZGVhZGxpbmUiOjE0NDM0MzEwMjR9', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
				unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
				save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
				domain: 'http://qiniu-plupload.qiniudn.com/',   //bucket 域名，下载资源时用到，**必需**
				get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
				container: 'container',           //上传区域DOM ID，默认是browser_button的父元素，
				max_file_size: '100mb',           //最大文件体积限制
				flash_swf_url: '/Assets/js/plupload/Moxie.swf',  //引入flash,相对路径
				max_retries: 3,                   //上传失败最大重试次数
				dragdrop: true,                   //开启可拖曳上传
				drop_element: 'container',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
				chunk_size: '4mb',                //分块上传时，每片的体积
				auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
				init: {
					'BeforeUpload': function(up, files) {
						if($('#content').find('img').length > 1 || $('#fileuploader').html() == '上传中...'){
							$('#fileuploader').html('只能上传一张图片');
							return false;
						}else{
							$('#fileuploader').html('<img src="/Assets/wap/images/loading.gif"> 上传中...请稍候！');
						}
					},
					'FileUploaded': function(up, file, info) {
						var data  = eval("("+info+")");
						var image = 'http://img.xiajiong.com/'+data.key+'/w4';
						if(file.type == 'image/gif'){
							image = 'http://img.xiajiong.com/'+data.key;
						}
						$('#image').val(image);
						var imgHtml = '<img src="'+image+'" alt="" val="'+image+'"  />';
						$("#content").css("backgroundImage","url(/Assets/wap/images/loading1.gif)"); 
						$('#content').html(imgHtml);//插入图片
						$('#fileuploader').html('上传完成，正在下载数据，请稍候！');


					},
					'Error': function(up, err, errTip) {
						$('#fileuploader').html(errTip);
					}
				}
			});*/

		//上传图片
		$("#fileuploader").uploadFile({
			url:'/public/uploadfile/',
			fileName: "Filedata",
			dragDrop : false,
			doneStr : '使用',
			uploadStr:'插入图片',
			returnType : 'json',
			showStatusAfterSuccess : false,
			allowedTypes : 'jpg,jpeg,gif,png,bmp',
			acceptFiles : "image/",
			multiple : false,
			showDone : false,
			showError : false,
			onSubmit:function(files) {
				if($('#content').find('img').length > 1 || $('#fileuploader').html() == '上传中...'){
					$('#fileuploader').html('只能上传一张图片');
					return false;
				}else{
					$('#fileuploader').html('<img src="/Assets/wap/images/loading.gif"> 上传中...请稍候！');
				}
			},
			onSuccess:function(files,data,xhr,pd){
				var image = data.url.substr(1,data.url.length);
				var m_image = data.m_url.substr(1,data.m_url.length);
				$('#image').val(m_image);
				var imgHtml = '<img src="'+image+'" alt="" val="'+image+'"  />';
				$("#content").css("backgroundImage","url(/Assets/wap/images/loading1.gif)"); 
				$('#content').html(imgHtml);//插入图片
				$('#fileuploader').html('上传完成，正在下载数据，请稍候！');
			}
		});



			//是否允许被包养
			var pd = $('.p-j-kept dt');
			touch.on(pd,'tap',function(){
				var htm , tthis , keptScore;
				tthis = $(this);
				if($('.p-j-kept dd').css('display') == 'none'){
					$('.p-j-kept').addClass('p-j-kept-hover');
					$('.p-j-kept dd').css('display','block');
					$('.p-j-kept dd').find('a').eq(0).addClass('hover');
					$('#kept_level').val($('.p-j-kept dd').find('a').eq(0).attr('data-id'));
					$('.p-j-kept dd').find('a').on('touchend',function(){
						$('.p-j-kept dd').find('a').removeClass('hover');
						$(this).addClass('hover');
						$('#kept_level').val($(this).attr('data-id'));
					});
				}else{
					$('.p-j-kept').removeClass('p-j-kept-hover');
					$('.p-j-kept dd').css('display','none');
					$('.p-j-kept dd').find('a').removeClass('hover');
					$('#kept_level').val(0);
				}
			})

			var cp = $('.checkPublish');
			touch.on(cp,'tap',function(){
				var form = $('#publish_form'),
					cTitle 	= $('.p-j-title').find('input').val(),
					cText 	= $('#content').html(),
					kept_level = $('#kept_level').val(),
					image =	$('#image').val(),
					is_package = 0;

				if(cTitle.length < 1){
					XJ.tips({text:'标题不能为空',y:($(window).height()-180)/2});
					return false;
				}

				if(image == '' && cText.length == 0){
					XJ.tips({text:'投稿内容不能为空'});
					return false;
				}

				
				if(kept_level > 0 && kept_level != ''){
					is_package = 1;
				}

				var data = {
					title:cTitle,
					content:cText,
					is_package:is_package,
					package_fee:kept_level,
					image:image
				}
				App.request({
					url : '/joke/publish',
					data : data,
					success: function(result){
						var re = result;
						if(re.err){
							XJ.tips({text:'投稿成功'});
							setTimeout(function(){
								location.href = '';
							},1000);
						};
					}
				});
			})
		},
		/*
		审稿
		*/
		audit :function(){
			var abtn = $('.a-btn');
			touch.on(abtn,'tap',function(){
				var joke_id = $(this).attr('data-id');
				var type = $(this).attr('data-type');
				if(joke_id == '' || typeof(joke_id) == 'undefined'){
					joke_id = $(this).parent().data('id');
					type = $(this).parent().data('type');
				}
				if(joke_id != '' || typeof(joke_id) == 'undefined') {
					App.request({
						url:'/joke/audit',
						data:{joke_id:joke_id,type:type},
						success:function(ret){
							console.log(ret);
							if(ret.err == 1) {
								location.reload();
							}
						}
					})
				}
			})
		},
		/*
		评论
		*/
		comment : function(){
			init();
			//发表评论
			var js = $('.joke-c-submit');
			touch.on(js,'tap',function(){
				var id = $('#Jid').val(),
					content = $('#content').val(),
					btn = $('.joke-c-submit');
				if(!content){
					XJ.tips({text:'评论内容不能为空！'});
					return false;
				};

				if(content.length < 6){
					XJ.tips({text:'最小长度6个字符！'});
					return false;
				};

				if(content.length > 150){
					XJ.tips({text:'最大长度150个字符！'});
					return false;
				};

				App.request({
					url : '/ajax/review',
					data : {id:id,content:content},
					success : function(ret){
						if(ret.err){
							$('#content').val('');
							btn.html('完成').css({'box-shadow':'rgb(174, 174, 175) 0px 3px 0px 0px','background':'rgb(188, 188, 189)'});
							XJ.tips({text:'评论成功，请耐心等待审核！'});
						}else{
							XJ.tips({text:ret.msg});
						}
					}
				})
			})

			//评论点赞
			var cg = $('.c-good');
			touch.on(cg,'tap',function(){
				var self = $(this);
				var id = $(this).data('id');
				App.request({
					url : '/xiaohua/reviewrecord',
					loading : false,
					data : {id : id},
					success : function(ret){
						if(ret.err){
							var v = self.text();
							self.text(parseInt(v)+1);
						}else{
						};
					}
				});
			})
			
		},
		/*
		兑换礼品 下单
		*/
		exchange : function(){
			//window.addEventListener("load",loaded,false);
			if(document.getElementById('g_province')){
				_init_area();
			}
			var es = $('.e-g-n-subtract');
			touch.on(es,'tap',function(){
				if(!isNaN($('#num').val()) && $('#num').val()>1){
					$('#num').val(Number($('#num').val())-1);
				}else{
					$('#num').val(1);
				}
			})

			var ea = $('.e-g-n-add');
			touch.on(ea,'tap',function(){
				var gift_score=$(this).parent().attr('data-gift-score');
				var user_score=$(this).parent().attr('data-user-score');
				if(!isNaN($('#num').val()) && user_score>(Number($('#num').val())+1)*gift_score){
					$('#num').val(Number($('#num').val())+1);
				}else{
					XJ.tips({text:'你拥有的囧币最多可兑换'+$('#num').val()+'件'});
				}
			})
			$('#num').blur(function(){
				var gift_score=$(this).parent().attr('data-gift-score');
				var user_score=$(this).parent().attr('data-user-score');
				if(!isNaN($(this).val())){
					var num=parseInt($(this).val());
					if(num>0){
						if(user_score<num*gift_score){
							XJ.tips({text:'你拥有的囧币最多可兑换'+parseInt(user_score/gift_score)+'件'});
							$(this).val(parseInt(user_score/gift_score));
						}else{
							$(this).val(num);
						}
					}else{
						$(this).val(1);
					}
				}else{
					XJ.tips({text:'请输入有效数字'});
					$(this).val(1);
				}
			})

			var gs = $('.g_submit');
			touch.on(gs,'tap',function(){
				var province 	= $('#g_province').val(),
					city 		= $('#g_city').val(),
					area 		= $('#g_area').val(),
					address		= $('.g_address').val(),
					name 		= $('.g_name').val(),
					phone_number= $('.g_phone_number').val()
					isMobile	=/^(?:13\d|15\d|18\d)\d{5}(\d{3}|\*{3})$/;

				if(province == '' || city == '' || area == ''){
					XJ.tips({text:'所在地区不能为空'});
					return false;
				}

				if(address == ''){
					XJ.tips({text:'街道地址不能为空'});
					return false;
				}

				if(name == ''){
					XJ.tips({text:'收货人姓名不能为空'});
					return false;
				}

				if(phone_number == ''){
					XJ.tips({text:'收货人姓名不能为空'});
					return false;
				}

				if(!isMobile.test(phone_number)){
					XJ.tips({text:'请输入正确的手机号'});
					return false;
				}
				$('#form_gift').find(".g_submit").attr("disabled", true).val('提交中...').css('background','#bcbcbd');

				App.request({
					url : '/shop/order/',
					data : $('#form_gift').serialize(),
					success : function(ret){
						if(ret.err == 1) {
							$('#form_gift').find(".g_submit").val('提交成功');
							XJ.tips({text:'兑换信息提交成功！'});
							setTimeout(function(){
								window.location.href="/shop/"; 
							},2000);
						} else {
							XJ.tips({text:ret.msg});
							$('#form_gift').find(".g_submit").attr("disabled", false).val('兑换').css('background','#ff7e69');
						}
					}
				})
			})

			$('.g_input_text').each(function(index, element) {
				if($(this).val()!=''){
					$(this).parent().find('.g_value').hide();
				}
			});
			input_value_gift($('.form_gift'));
			function input_value_gift(t){
				t.find('input').focus(function(){
					if($(this).val() == $(this).attr('title') || $(this).val() == ''){
						$(this).parent().find('.g_value').hide();
					}
				});
				t.find('input').blur(function(){
					if($(this).val() == $(this).attr('title') || $(this).val() == ''){
						$(this).val('');
						$(this).parent().find('.g_value').show();
					}
				})
			}
		},
		/*
		意见反馈
		*/
		feedback : function(){
			var ls = $('.l-submit');
			touch.on(ls,'tap',function(){
				var contact = $('.text-input').val(),
					content = $('.fankui').val();
				if(contact == ''){
					XJ.tips({text:'请留下您的联系方式，我们期待与您取得联系'});
					return false;
				}
				if(content == ''){
					return false;
				}
				if(content.length < 6){
					XJ.tips({text:'内容最小长度6个字符！'});
					return false;
				};

				if(content.length > 140){
					XJ.tips({text:'内容最大长度140个字符！'});
					return false;
				};
				App.request({
					url : '/about/feedback',
					data : $('#feedback_form').serializeObject(),
					success : function(ret){
						if(ret.err){
							XJ.tips({text:ret.msg});
							setTimeout(function(){
								window.location.href=""; 
							},2000);
						}else{
							XJ.tips({text:ret.msg});
						}
					}
				})
			})
		}
	};
	return index;
});