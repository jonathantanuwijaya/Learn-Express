const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user')
app.set('view engine', 'ejs');
app.set('views', 'views');
const adminRoute = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoute = require('./controllers/error')

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    User.findById("60b100599d6d258cbf2929d5")
        .then(user => {
            req.user = new User(user.name,user.email,user.cart,user._id);
            next();
        }).catch(err => {
        console.log(err);
    });
})
app.use('/admin', adminRoute);
app.use(shopRoutes);

app.use(errorRoute.showErrors);
mongoConnect(()=>{
    app.listen(3000);
})


