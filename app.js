const path = require('path');
const express = require('express');
const app = express();
const User = require('./models/user')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf');
const {flash} = require('express-flash-message')
const multer = require('multer');

app.set('view engine', 'ejs');
app.set('views', 'views');
const MONGODB_URI = 'mongodb+srv://Jonathan:zftubW2CTITX9ga5@cluster0.a2aqy.mongodb.net/shop'
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'

})

const csrfProtection = csrf()
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const adminRoute = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoute = require('./routes/auth');
const errorRoute = require('./controllers/error')

app.use(express.urlencoded({extended: false}));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}));
app.use(csrfProtection)
app.use(flash({sessionKeyName:'flashMessage'}))
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    // throw new Error('Sync Dummy');
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});

app.use('/admin', adminRoute);
app.use(shopRoutes);
app.use(authRoute);

app.get('/500', errorRoute.get500);

app.use(errorRoute.get404);

app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});
mongoose.connect(MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true })
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


