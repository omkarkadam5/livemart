const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
function configurePassport(){
    return{
        init(passport) {
            passport.use(new LocalStrategy({ usernameField: 'number',passwordField: 'password' }, async (number,password,done) => {
                // Login
                // check if email exists
                const user = await User.findOne({ number: number })
                console.log(number)
                console.log("aaye")
                if(!user) {
                    console.log("buddy")
                    return done(null, false, { message: 'No user with this number' })
                }
                else
                {
                    console.log("papa")
                    return done(null, user, { message: 'Logged in succesfully' })
                }
               
            }))
        
            passport.serializeUser((user, done) => {
                done(null, user._id)
            })
        
            passport.deserializeUser((id, done) => {
                User.findById(id, (err, user) => {
                    done(err, user)
                })
            })
        
        },
        gsignin(passport){
            passport.serializeUser((user, done) => {
                done(null, user._id)
            })
        
            passport.deserializeUser((id, done) => {
                User.findById(id, (err, user) => {
                    done(err, user)
                })
            })

            passport.use(new GoogleStrategy({
                clientID: '1024217112089-8cp05ol1jiggeabqdagrm1d9fjqr598i.apps.googleusercontent.com',
                clientSecret: 'aUkUszqMKUTserK8_k3eQRlT',
                callbackURL: '/auth/google/callback'
              },
              function(accessToken, refreshToken, profile, done) {
                   console.log(profile)
                   User.findOne({email: 'default@gmail.com'}).then(currUser=>{
                       if(currUser){
                        console.log('User is'+currUser)
                        done(null,currUser)
                       }
                       else{
                        new User({
                            name: profile._json.name,
                            email: 'default@gmail.com',
                            password: 'abc@123'
                        }).save().then(newUser=>{
                            console.log('New User Created'+ newUser)
                            done(null,newUser)
                        })
                       }
                   })
                   
              }
            ))
        }
    }

}


module.exports = configurePassport