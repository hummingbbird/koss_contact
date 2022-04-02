//index.js
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //1:body-parser모듈을 변수에 담아서 호출
var methodOverride = require('method-override'); //1
var app = express();

//DB setting
//process.env 오브젝트는 환경변수를 가지고 있음. 내가 저장한 몽고db 환경변수를 연결한 것임
mongoose.connect(process.env.MONGO_DB); //환경변수 연결?
var db = mongoose.connection; //(db 객체를 가져와 변수에 넣는 것)(여기에는 이벤트 리스너 함수들이 있음)

//Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
//bodyparser 사용하기 위한 코드
app.use(bodyParser.json()); //json형식으로 받는다는 설정:route의 콜백함수의 req.body에서 입력받은 데이터 사용 가능!!
app.use(bodyParser.urlencoded({extended:true}));//3
app.use(methodOverride('_method'));//쿼리에 들어오는 값으로 http 메소드를 바꿔
//ex:http://어찌구저찌구/id?_method=create 받으면 create를 읽어 req의 method를 create로 바꿔

//DB schema //4
//함수로 사용할 스키마 설정
//DB에 저장할 정보의 형식 지정(required는 무조건 입력 받아야한다는 뜻, unique는 중복되면 안 된다는 뜻)
//타입은 모두 String
var contactSchema = mongoose.Schema({
    name:{type:String, required:true, unique:true},
    email:{type:String},
    phone:{type:String}
});
//contact schema의 모델 생성, 
var Contact = mongoose.model('contact', contactSchema);

//Routes
//Home //6:홈에 get요청이 오는 경우 /contacts로 방향 재설정
app.get('/', function(req, res){
    res.redirect('/contacts');
});

//Contacts - Index // 7 : contact에 get요청이 오면 겸색결과를 받아서 주어진 경로 렌더링
app.get('/contacts', function(req,res){
    //모델.find(검색조건, 콜백함수) 함수 : db에서 검색조건에 맞는 모델data를 찾고 콜백함수 호출
    //검색조건:객체형태로 전달, 지금은 조건이 없으므로 모든 데이터 리턴
    //콜백 함수:지금 경우는 에러가 있는 경우에만 내용 전달, contacts의 검색결과는 늘 array!
    Contact.find({}, function(err, contacts){
        if(err) return res.json(err);
        res.render('contacts/index', {contacts:contacts});
    });
});

//Contacts - New : get 요청이 오면 새 주소록을 만드는 폼이 있는 new.ejs로 렌더링 !
app.get('/contacts/new', function(req,res){
    res.render('contacts/new');
});

//Contacts - Create
app.post('/contacts', function(req, res){
    //모델.create:db에 data 생성하는 함수
    //첫param로 생성할 데이터의 객체를 받고 두번째param으로 콜백 함수 받음
    Contact.create(req.body, function(err, contact){
        //error가 없으면 contacts로 방향 재설정

        if(err) return res.json(err);
        res.redirect('/contacts');
    });
});

//Contacts - show
//'/contacts/:id'에 get요청이 오는 경우
//model.findOne함수: db에서 해당 모델의 docu를 하나 찾는 함수(검색조건은 1st param)
//
app.get('/contacts/:id', function(req, res){
    Contact.findOne({_id:req.params.id}, function(err, contact){
      if(err) return res.json(err);
      res.render('contacts/show', {contact:contact});
    });
  });

// Contacts - edit //위와 동일
app.get('/contacts/:id/edit', function(req, res){
Contact.findOne({_id:req.params.id}, function(err, contact){
    if(err) return res.json(err);
    res.render('contacts/edit', {contact:contact});
    });
  });

// Contacts - update
//모델.findOneAndUpdate: docu하나 찾아 수정하는 함수
//1st param: 조건, 2nd param: 업데이트할 정보 객체로 입력후 함수 호출
//데이터 수정 후 저시기로 redirect
app.put('/contacts/:id', function(req, res){
Contact.findOneAndUpdate({_id:req.params.id}, req.body, function(err, contact){
    if(err) return res.json(err);
    res.redirect('/contacts/'+req.params.id);
    });
  });


// Contacts - destroy
//모델.deleteOne: 찾아서 삭제하는 함수.. 개쩐다 함수쓰니까 미쳤네
//삭제 후 /contacts로 redirect!
app.delete('/contacts/:id', function(req, res){
Contact.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/contacts');
    });
  });

//3:잘 연결 되면 커넥트, 안 되면 에러 출력
//db연결은 앱이 실행되면 한 번만 일어나기 때문에 once함수로,
//error는 언제든 발생하기 때문에 on함수로 실행한 것임.
db.once('open', function(){
    console.log('DB connected');
});
db.on('error', function(err){
    console.log('DB ERROR : ', err);
});

//Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

//Port setting
var port = 3065;
app.listen(port, function(){
    console.log('Server on! http://localhost:' + port);
});
