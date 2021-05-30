/*1)summon express/ /invocamos express*/
const express=require('express');
const app= express();

/*2) we set urlencoded to capture the dat from form 
seteamos unlencoded para capturar los datos del formulario*/
app.use(express.urlencoded({extended:false}));
app.use(express.json());

/*3) summon dotenv
    invocamos dotenv */
const dotenv= require('dotenv');
dotenv.config({path:'./env/.env'});

/*4) public directory 
directorio publico */
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname +'/public'));

/*5) we set up the ejs template engine
    Establecemos el motor de plantillas ejs*/
app.set('view engine','ejs');

/*6) summon bcryptjs
invocamos bcryptjs */
const bcryptjs= require('bcryptjs');

/*7) variable of session
variable de session*/
const session= require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));

/*8)Summon de connection module to DB
    Invocamos modulo de conexion a la base de datos*/
const connection = require('./database/db');

/*9) making the routes 
haciendo las rutas*/
app.get('/login',(req,res)=>{
    res.render('login')
})
app.get('/register',(req,res)=>{
    res.render('register')
})

/*10) Registration
Registracion */
app.post('/register', async (req,res)=>{
    const user= req.body.user;
    const name=req.body.name;
    const rol=req.body.rol;
    const pass=req.body.pass;
    let passwordHash = await bcryptjs.hash(pass,8);
    connection.query('INSERT INTO users SET ?', {user:user,name:name,rol:rol,pass:passwordHash},
    async (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{
            alert:true,
            alertTitle: "Registration",
            alertMessage: "Successfull Registration",
            alertIcon: 'success',
            showConfirmButton:false,
            timer:15000,
            ruta:''
            })
        }

    })
})

/*11) autentication 
autenticacion de cuenta*/
app.post('/auth', async (req,res)=>{
    const user= req.body.user;
    const pass= req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error,results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                alert:true,
                alertTitle: "Error",
                alertMessage: "User or Password are incorrect ",
                alertIcon: "error",
                showConfirmButton: true,
                timer:false,
                ruta:'login'
                });
            }else{
                req.session.loggedin=true;
                req.session.name = results[0].name
                res.render('login',{
                    alert:true,
                    alertTitle: "Success",
                    alertMessage: "Login success",
                    alertIcon: "success",
                    showConfirmButton:false,
                    timer:false,
                    ruta:''
                });
            }

        })
    }else{
        res.render('login',{
            alert:true,
            alertTitle: "Warning",
            alertMessage: "Please insert an user or password",
            alertIcon: "warning",
            showConfirmButton:true,
            timer:false,
            ruta:'login'
        });
    }



})

/*12) Auth pages*/ 
app.get('/',(req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            name: req.session.name
        });
    }else{
        res.render('index',{
            login:false,
            name:'You have to log in'
        })
    };
})

/*13) logout*/
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000,(req,res)=>{
    console.log('Server Running in http://localhost:3000')
})