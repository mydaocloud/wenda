<?php
class IndexAction extends BaseAction{
	//404
    public function index() {
        $this->_empty();
    }
    //搜索
    public function search() {
        $k = isset($_GET['key']) ? $_GET['key'] : '';
        if($k) {
            $user_joke_mod = D('user_joke');
            $where = '(title like "%'.$k.'%" or (content like "%'.$k.'%" and type='.C('JOKE_TYPE_TEXT').')) and status = '.C('JOKE_STATUS_AUDIT');

            $count = $user_joke_mod->where($where)->count();
            import("ORG.Util.Page");
            $page = new Page($count,10);
            $user_joke = $user_joke_mod->where($where)->limit($page->firstRow.','.$page->listRows)->order('id desc')->select();
            foreach ($user_joke as $key => $value) {
                $record = $this->get_record($value['id']);
                $user_joke[$key]['record'] = $record;
                $user = D('user')->find($value['user_id']);
                $user_joke[$key]['user_info'] = $user;
            }
            $this->assign('user_joke',$user_joke);
            $page_str = str_replace('/Joke/Index/search/key/'.urlencode($k).'/p/', '', $page->show());
            $page_str = str_replace('.html', '', $page_str);
            $page_str = str_replace("href='", "href='/joke/search?key=".urlencode($k).'&p=', $page_str);
            $this->assign('page',$page_str);

            $this->assign('count',$count);
            $this->assign('key',$k);

            $this->assign('title','笑话搜索');
            $this->display();
        }else {
            $this->msg('错误提示','非法访问！');
        }
    }

    //投稿
    public function publish() {
        //坚持是否登录
        $this->check_login();

        $user_joke_mod = D('user_joke');
        $time = strtotime(date('Y-m-d',time()));
        $count = $user_joke_mod->where('user_id='.$this->user['id'].' and created_time>='.$time)->count();
        //判断当前可投稿数
        $level = $this->get_curr_level();

    	if($this->isAjax()) {
    		/*if($count >= $level['send_num']) {
                $this->ajaxReturn(array('err' => 0,'msg' => '您的今天投稿次数已用完，请明天再投！'));
            }*/
            $user_joke = $user_joke_mod->create();

            if(trim($_POST['title']) == '') {
                $this->ajaxReturn(array('err' => 0,'msg' => '标题不能为空!'));
            }

            if(isset($_POST['is_video']) && $_POST['is_video'] == 1) {
                if(trim($_POST['url']) == '') {
                    $this->ajaxReturn(array('err' => 0,'msg' => '视频URL地址不能为空!'));
                }
                $user_joke['type'] = C('JOKE_TYPE_VEDIO');
                $user_joke['content'] = $_POST['url'];    
                $user_joke['status'] = C('JOKE_STATUS_UNAUDIT');  
                $user_joke['audit_time'] = time();  
            }else {
                $user_joke['status'] = C('JOKE_STATUS_UNAUDIT');
            }

            if($this->check_word($user_joke['title']) || $this->check_word($user_joke['content'])) {
                $this->ajaxReturn(array('err' => 0,'msg' => '不能有非法字符!'));
            }

    		if(trim($user_joke['title']) != '' || trim($user_joke['content']) != '') {
                if($user_joke['is_package'] == 0) {
                    $user_joke['package_fee'] = 0;
                }
    			$user_joke['user_id'] = $this->user['id'];
    			$user_joke['created_time'] = time();
    			
    			if($user_joke_mod->add($user_joke)) {
    				//更新用户发稿数
    				D('user')->where('id='.$this->user['id'])->setField(array('send_num' => array('exp', "(send_num + 1)")));
                    $this->ajaxReturn(array('err' => 1,'msg' => '发布成功，请等待审核！'));
    			}
    		}
    	}

        /*if($count >= $level['send_num']) {
            $this->assign('allow',0);
        }else {
            $this->assign('allow',1);
        }*/
        $this->assign('allow',1);
    	$this->assign('title','发布笑话');
    	$this->display();
    }
    //审稿
    public function audit() {
        //检测是否登录
        $this->check_login();

    	//查找自己审核的ID
    	$user_audit_mod = D('user_audit');
    	$user_joke_mod = D('user_joke');
    	$user_audit = $user_audit_mod->where('user_id='.$this->user['id'])->select();
    	$count = count($user_audit);
    	$joke_ids = array();
    	$week_count = 0;
    	$week = strtotime('-7 day');
    	foreach ($user_audit as $key => $value) {
    		if($value['created_time'] >= $week) {
    			$week_count++;
    		}
			array_push($joke_ids, $value['joke_id']);
    	}

    	if($this->isAjax()) { 
    		$joke_id = (int)$_POST['joke_id'];
    		$type = (int)$_POST['type'];
    		if(in_array($joke_id, $joke_ids)) {
    			$this->ajaxReturn(array('err' => 0,'msg' => '该笑话已您审稿!'));
    		}
    		//保存审稿记录数据
    		$data = $user_audit_mod->create();
    		$data['joke_id'] = $joke_id;
    		$data['user_id'] = $this->user['id'];
    		$data['created_time'] = time();
    		$data['type'] = $type;
    		$user_audit_mod->add($data);
            
            if($type < 4) {
        		//更新笑话审稿数
        		$user_joke_mod->where('id='.$joke_id)->setField(array('audit_num' => array('exp', "(audit_num + 1)")));
        		//更新用户审稿数
        		D('user')->where('id='.$this->user['id'])->setField(array('audit_num' => array('exp', "(audit_num + 1)")));
            }

    		$this->ajaxReturn(array('err' => 1,'msg' => '审稿成功!'));
    	}
        if(count($joke_ids) > 0) {
            $joke_ids = implode(',', $joke_ids);    
        }else {
            $joke_ids = 0;
        }
    	
    	$joke = $user_joke_mod->where('id not in('.$joke_ids.') and status = 1')->order('id desc')->find();

    	$this->assign('count',$count);
    	$this->assign('week_count',$week_count);
    	$this->assign('joke',$joke);
    	$this->assign('title','审稿');
    	$this->display();
    }

    //投稿
    public function publish2() {
        $user_joke_mod = D('user_joke');
      

        if($this->isAjax()) {
          
            $user_joke = $user_joke_mod->create();

            if(trim($_POST['title']) == '') {
                $this->ajaxReturn(array('err' => 0,'msg' => '标题不能为空!'));
            }

            if(isset($_POST['is_video']) && $_POST['is_video'] == 1) {
                if(trim($_POST['url']) == '') {
                    $this->ajaxReturn(array('err' => 0,'msg' => '视频URL地址不能为空!'));
                }
                $user_joke['type'] = C('JOKE_TYPE_VEDIO');
                $user_joke['content'] = $_POST['url'];    
               
            }else {
                if(count($user_joke['tags_id']) > 0) {
                    $user_joke['tags_id'] = '|'.implode('|', $user_joke['tags_id']).'|';
                }
            }
            $user_joke['status'] = C('JOKE_STATUS_UNAUDIT');  
            $user_joke['audit_time'] = time();  
            $user_joke['good_num'] = mt_rand(20,999);
            $user_joke['bad_num'] = mt_rand(1,10);
            if($this->check_word($user_joke['title']) || $this->check_word($user_joke['content'])) {
                $this->ajaxReturn(array('err' => 0,'msg' => '不能有非法字符!'));
            }

            if(trim($user_joke['title']) != '' || trim($user_joke['content']) != '') {
                if($user_joke['is_package'] == 0) {
                    $user_joke['package_fee'] = 0;
                }

                $user_ids = array(31,30,29,28,37,38,39,94,89,90,91,92,93,95,96,97,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141);
                $user_id = array_rand($user_ids,1);
                //$user_joke['user_id'] = $this->user['id'];
                $user_joke['user_id'] = $user_ids[$user_id];
                $user_joke['created_time'] = time();
                
                if($user_joke_mod->add($user_joke)) {
                    //更新用户发稿数
                    D('user')->where('id='.$this->user['id'])->setField(array('send_num' => array('exp', "(send_num + 1)")));
                    $this->ajaxReturn(array('err' => 1,'msg' => '发布成功，请等待审核！'));
                }
            }
        }

        /*if($count >= $level['send_num']) {
            $this->assign('allow',0);
        }else {
            $this->assign('allow',1);
        }*/
        $this->assign('allow',1);
        $this->assign('title','发布笑话');
        $this->display();
    }

    //投稿
    public function publish4() {

        $user_joke_mod = D('user_joke');
      
        $user_joke = $user_joke_mod->create();

        if(trim($_POST['title']) == '') {
            echo 0;
            exit;
        }
        if(isset($_POST['image'])) {
            if(trim($_POST['image']) == '') {
                echo 0;
                exit;
            }else {
                $user_joke['image'] = $_POST['image'];
            }
        }

        if(isset($_POST['is_vedio']) && $_POST['is_vedio'] == 1) {
            if(trim($_POST['url']) == '') {
               echo 0;
                exit;
            }
            $user_joke['type'] = C('JOKE_TYPE_VEDIO');
            $user_joke['content'] = $_POST['url'];    
           
        }else {
            if(count($user_joke['tags_id']) > 0) {
                $user_joke['tags_id'] = '|'.implode('|', $user_joke['tags_id']).'|';
            }
        }
        $user_joke['status'] = C('JOKE_STATUS_UNAUDIT');  
        //$user_joke['status'] = C('JOKE_STATUS_AUDIT');  
        $user_joke['audit_time'] = time();  
        $user_joke['good_num'] = mt_rand(20,999);
        $user_joke['bad_num'] = mt_rand(1,10);
        if($this->check_word($user_joke['title']) || $this->check_word($user_joke['content'])) {
            $this->ajaxReturn(array('err' => 0,'msg' => '不能有非法字符!'));
        }

        if(trim($user_joke['title']) != '' || trim($user_joke['content']) != '') {
            if($user_joke['is_package'] == 0) {
                $user_joke['package_fee'] = 0;
            }

            $user_ids = array(31,30,29,28,37,38,39,94,89,90,91,92,93,95,96,97,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141);
            $user_id = array_rand($user_ids,1);
            //$user_joke['user_id'] = $this->user['id'];
            $user_joke['user_id'] = $user_ids[$user_id];
            $user_joke['created_time'] = time();
            
            if($user_joke_mod->add($user_joke)) {
                //更新用户发稿数
                D('user')->where('id='.$this->user['id'])->setField(array('send_num' => array('exp', "(send_num + 1)")));
               echo 1;
                exit;
            }
        }

       
    }

    public function execute() {
        $user_joke_mod = D('user_joke');
        $user_joke = $user_joke_mod->where('status=1')->limit('0,1')->order('rand()')->select();
        foreach ($user_joke as $key => $value) {
            $user_joke_mod->where('id='.$value['id'])->save(array('status' => 2, 'audit_time' => time()));    
        }
    }
}