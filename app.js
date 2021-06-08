const path = require('path');
const express = require('express');
const app = express();
const User = require('./models/user')
const mongoose = require('mongoose');
app.set('view engine', 'ejs');
app.set('views', 'views');
const adminRoute = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoute = require('./controllers/error')

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    User.findById("60bf7d29a9244835a0a8eff1")
        .then(user => {
            req.user = user
            next();
        }).catch(err => {
        console.log(err);
    });
})
app.use('/admin', adminRoute);
app.use(shopRoutes);

app.use(errorRoute.showErrors);
mongoose.connect('mongodb+srv://Jonathan:zftubW2CTITX9ga5@cluster0.a2aqy.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Boi',
                    email: 'Boi@gmail.com',
                    cart: {
                        items: []
                    }
                })
                user.save();
            }
        })
        app.listen(3000)
    }).catch(err => {
    console.log(err)
})


