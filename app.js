const path = require('path');
const express = require('express');
const app = express();
const User = require('./models/user')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf');
const {flash} = require('express-flash-message')

app.set('view engine', 'ejs');
app.set('views', 'views');
const MONGODB_URI = 'mongodb+srv://Jonathan:zftubW2CTITX9ga5@cluster0.a2aqy.mongodb.net/shop'
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'

})

const csrfProtection = csrf()

const adminRoute = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoute = require('./routes/auth');
const errorRoute = require('./controllers/error')

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}));
app.use(csrfProtection)
app.use(flash({sessionKeyName:'flashMessage'}))
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoute);
app.use(shopRoutes);
app.use(authRoute);

app.use(errorRoute.showErrors);
mongoose.connect(MONGODB_URI)
    .then(result => {
        // User.findOne().then(user => {
        //     if (!user) {
        //         const user = new User({
        //             name: 'Boi',
        //             email: 'Boi@gmail.com',
        //             cart: {
        //                 items: []
        //             }
        //         })
        //         user.save();
        //     }
        // })
        app.listen(3000)
    }).catch(err => {
    console.log(err)
})


