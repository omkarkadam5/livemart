const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser')
const Nexmo = require('nexmo');
const { response } = require('express');
const nexmo = new Nexmo({ 
    apiKey: '41b342b1',
    apiSecret: 'HjbMKouBS8BhkwIu'
  })
var numbe=2;
function authController() {
    function _getRedirectUrl(req)  {
        var retrn;
        if( req.user.role==='admin')
        {
            retrn='/admin/orders';
        }
        if( req.user.role==='customer')
        {
            retrn='/customer/orders';
        }
        if( req.user.role==='wholesaler')
        {
            retrn='/wholesaler/orders';
        }
        return (
            {retrn}
        );
    }
    
    return {
        login(req, res,next) {
            console.log("pp")
            //console.log(req)
            const  number   = numbe
            console.log(number)
            // Validate request 
             if(!number ) {
                 req.flash('error', 'All fields are required')
                 console.log("1 number not found");
                 return res.render('auth/login')
             }
             console.log("11");
             console.log(req.body)
             passport.authenticate('local', (err, user, info) => {
                 if(err) {
                     req.flash('error', info.message )
                     console.log("2");
                     return next(err)
                 }
                 console.log(number)
                 if(!user) {
                     req.flash('error', info.message )
                     console.log("3");
                     return res.render('auth/login')
                 }
                 req.logIn(user, (err) => {
                     if(err) {
                        console.log("4");
                         req.flash('error', info.message ) 
                         return next(err)
                     }
                     var ok=_getRedirectUrl(req);
                     console.log("5");
                     console.log(ok.retrn);
                     return next();
                 })
             })(req, res, next)
             console.log("6");
        },
        // postLogin(req, res, next) {
          
        // },
       
        postVerify(req,res){
            //app.post('/verify', (req, res) => {
            nexmo.verify.request({
                number: req.body.number,
                brand: 'ACME Corp'
            }, (error, result) => {
                if(result.status != 0) {
                    console.log("if")
                    req.flash('error', 'Error Occurred')
                    console.log(result)
                    console.log(req)
                    
                  res.render('auth/login')
                } else {
                    console.log("hello")
                    console.log(req.body)
                    numbe=req.body.number;
                    console.log(numbe)
                  res.render('auth/verify', { requestId: result.request_id,number: req.body.number })
                }
              })
        
        },
        postCheck(req,res){
            // app.post('/check', (req, res) => {
              nexmo.verify.check({
            request_id: req.body.requestId,
            code: req.body.code
              }, (error, result) => {
                if(result.status != 0) {
                 console.log("check")
                //console.log(req.body.requestId)
                console.log(req.body.code)
              res.render('auth/login')
                } else {
                    console.log("success")
                
                    const number   = numbe
                   // Validate request 
                   console.log("fuck")
                   console.log(req.body);
                   
                   var ok=_getRedirectUrl(req);
                    console.log("5");
                    console.log(ok.retrn);      
          
                   return res.redirect(ok.retrn)
                    
                }
              })
            
        },
        register(req, res) {
            res.render('auth/register')
        },
        async postRegister(req, res) {
         const { name, email, password, role, number }   = req.body
         // Validate request 
         if(!name || !email || !password|| !role || !number ) {
             req.flash('error', 'All fields are required')
             req.flash('name', name)
             req.flash('email', email)
             req.flash('role', role)
             req.flash('number', number)
            return res.redirect('/register')
         }
         // Check if email exists 
         User.exists({ email: email }, (err, result) => {
             if(result) {
                req.flash('error', 'Email already taken')
                req.flash('name', name)
                req.flash('email', email) 
                req.flash('role', role)
                req.flash('number', number)
                return res.redirect('/register')
             }
         })
       // console.log(tel);
         // Hash password 
         const hashedPassword = await bcrypt.hash(password, 10)
         // Create a user 
         const user = new User({
             name,
             email,
             password: hashedPassword,
             role,
             number
         })

         user.save().then((user) => {

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'livemart.oop@gmail.com',
                  pass: 'sudarshan@1234'
                }
              });
              
              const mailOptions = {
                from: 'livemart.oop@gmail.com',
                to: user.email,
                subject: 'Registration Confirmed',
                text: `Welcome to LiveMart: the Online Grocery Store where we serve the best products at the best price`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
            // Login
            return res.redirect('/')
         }).catch(err => {
            req.flash('error', 'Something went wrong')
                return res.redirect('/register')
         })
        },
        logout(req, res) {
        delete req.session.cart
          req.logout()
          return res.redirect('/login')  
        }
    }
}

module.exports = authController




